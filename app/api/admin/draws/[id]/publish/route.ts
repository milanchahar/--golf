import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runFullDraw, MIN_SCORES_TO_ENTER } from '@/lib/drawEngine'
import { buildPrizePoolRecord } from '@/lib/prizePool'
import { Draw, DrawEntry, PrizePool } from '@/types'

// ─── Helper: assert admin ──────────────────────────────────────────────────────
async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, error: 'Unauthorized' as const }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: profile } = (await db
    .from('profiles').select('role').eq('id', user.id).single()) as { data: { role: string } | null }
  if (!profile || profile.role !== 'admin') return { user: null, error: 'Forbidden' as const }
  return { user, error: null }
}

// ─── Helper: load eligible entries ────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadEligibleEntries(db: any): Promise<{ user_id: string; scores: number[] }[]> {
  const { data: activeUsers } = (await db
    .from('profiles')
    .select('id')
    .eq('subscription_status', 'active')) as { data: { id: string }[] | null }

  if (!activeUsers || activeUsers.length === 0) return []

  const activeUserIds = activeUsers.map((u: { id: string }) => u.id)

  const { data: allScores } = (await db
    .from('golf_scores')
    .select('user_id, score')
    .in('user_id', activeUserIds)) as { data: { user_id: string; score: number }[] | null }

  if (!allScores || allScores.length === 0) return []

  const scoresByUser: Record<string, number[]> = {}
  for (const row of allScores) {
    if (!scoresByUser[row.user_id]) scoresByUser[row.user_id] = []
    scoresByUser[row.user_id].push(row.score)
  }

  return Object.entries(scoresByUser)
    .filter(([, scores]) => scores.length >= MIN_SCORES_TO_ENTER)
    .map(([user_id, scores]) => ({ user_id, scores }))
}

// ─── POST /api/admin/draws/[id]/publish ──────────────────────────────────────
// 1. Runs a fresh draw (not reusing simulation)
// 2. Saves draw_entries for all eligible users
// 3. Calculates accurate prize pool (from real subscriber counts + jackpot carry-in)
// 4. Updates draw_entries.prize_amount with accurate per-winner payout
// 5. Saves the prize_pool record
// 6. Marks the draw as published
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { error: authErr } = await requireAdmin(supabase)
  if (authErr) {
    return NextResponse.json({ error: authErr }, { status: authErr === 'Unauthorized' ? 401 : 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // ── Load draw record ───────────────────────────────────────────────────────
  const { data: draw, error: drawError } = (await db
    .from('draws')
    .select('*')
    .eq('id', params.id)
    .single()) as { data: Draw | null; error: { message: string } | null }

  if (drawError || !draw) {
    return NextResponse.json({ error: 'Draw not found.' }, { status: 404 })
  }
  if (draw.status === 'published') {
    return NextResponse.json({ error: 'This draw is already published.' }, { status: 400 })
  }

  // ── Count active subscribers by plan (for prize pool calc) ────────────────
  const { count: monthlyCount } = await db
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active')
    .eq('subscription_plan', 'monthly')
  const { count: yearlyCount } = await db
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active')
    .eq('subscription_plan', 'yearly')

  const monthlySubscribers = (monthlyCount as number | null) ?? 0
  const yearlySubscribers = (yearlyCount as number | null) ?? 0

  // ── Fetch jackpot carry-in from most recent prior prize pool ──────────────
  const { data: priorPools } = (await db
    .from('prize_pools')
    .select('jackpot_carry_out, draw_month')
    .neq('draw_id', params.id)
    .order('draw_month', { ascending: false })
    .limit(1)) as { data: { jackpot_carry_out: number; draw_month: string }[] | null }

  const jackpotCarryIn = priorPools?.[0]?.jackpot_carry_out ?? 0

  // ── First pass: build pool with 0 winners to get the total pool amount ────
  // We need the total pool (from subscriber counts) to pass into runFullDraw,
  // which uses it to calculate prize amounts inside the draw engine.
  const firstPassPool = buildPrizePoolRecord({
    draw_id: params.id,
    draw_month: draw.draw_month,
    monthly_subscribers: monthlySubscribers,
    yearly_subscribers: yearlySubscribers,
    jackpot_carry_in: jackpotCarryIn,
    five_match_winners: 0,
    four_match_winners: 0,
    three_match_winners: 0,
  })
  const totalPool = firstPassPool.prize_pool_total

  // ── Load eligible users ────────────────────────────────────────────────────
  const entries = await loadEligibleEntries(db)

  // ── Run the draw (fresh, not reusing simulation) ────────────────────────────
  const { drawnNumbers, results, jackpotRolledOver } = runFullDraw(
    draw.draw_type,
    entries,
    totalPool,
    jackpotCarryIn
  )

  // ── Tally winner counts ────────────────────────────────────────────────────
  const fiveMatchWinners = results.filter(r => r.prize_tier === '5-match').length
  const fourMatchWinners = results.filter(r => r.prize_tier === '4-match').length
  const threeMatchWinners = results.filter(r => r.prize_tier === '3-match').length

  // ── Build the definitive prize pool record (with real winner counts) ───────
  const poolRecord = buildPrizePoolRecord({
    draw_id: params.id,
    draw_month: draw.draw_month,
    monthly_subscribers: monthlySubscribers,
    yearly_subscribers: yearlySubscribers,
    jackpot_carry_in: jackpotCarryIn,
    five_match_winners: fiveMatchWinners,
    four_match_winners: fourMatchWinners,
    three_match_winners: threeMatchWinners,
  })

  // ── Map prize_tier → per-winner payout ────────────────────────────────────
  const tierPayoutMap: Record<string, number> = {
    '5-match': poolRecord.five_match_payout,
    '4-match': poolRecord.four_match_payout,
    '3-match': poolRecord.three_match_payout,
  }

  // ── Build draw_entry rows with accurate prize_amounts ─────────────────────
  const scoreMap: Record<string, number[]> = {}
  for (const e of entries) scoreMap[e.user_id] = e.scores

  const entryRows: Omit<DrawEntry, 'id' | 'created_at'>[] = results.map(r => ({
    draw_id: draw.id,
    user_id: r.user_id,
    user_scores: scoreMap[r.user_id] ?? [],
    match_count: r.match_count,
    is_winner: r.prize_tier !== null,
    prize_tier: r.prize_tier,
    // Use poolRecord payouts (accurate) rather than drawEngine approximations
    prize_amount: r.prize_tier ? tierPayoutMap[r.prize_tier] ?? null : null,
  }))

  // ── Batch insert draw_entries ──────────────────────────────────────────────
  if (entryRows.length > 0) {
    const { error: entryInsertError } = (await db
      .from('draw_entries')
      .insert(entryRows)) as { error: { message: string } | null }

    if (entryInsertError) {
      return NextResponse.json(
        { error: `Failed to save draw entries: ${entryInsertError.message}` },
        { status: 500 }
      )
    }
  }

  // ── Save the prize pool record ─────────────────────────────────────────────
  const { data: savedPool, error: poolInsertError } = (await db
    .from('prize_pools')
    .upsert({ ...poolRecord }, { onConflict: 'draw_id' })
    .select()
    .single()) as { data: PrizePool | null; error: { message: string } | null }

  if (poolInsertError) {
    return NextResponse.json({ error: poolInsertError.message }, { status: 500 })
  }

  // ── Mark draw as published ─────────────────────────────────────────────────
  const { data: updatedDraw, error: updateError } = (await db
    .from('draws')
    .update({
      status: 'published',
      drawn_numbers: drawnNumbers,
      jackpot_carried_over: jackpotRolledOver,
      published_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single()) as { data: Draw | null; error: { message: string } | null }

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    summary: {
      draw: updatedDraw,
      drawn_numbers: drawnNumbers,
      total_entries: entryRows.length,
      winners: { five_match: fiveMatchWinners, four_match: fourMatchWinners, three_match: threeMatchWinners },
      jackpot_rolled_over: jackpotRolledOver,
      prize_pool: savedPool,
    },
  })
}
