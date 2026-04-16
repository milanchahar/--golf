import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runFullDraw, MIN_SCORES_TO_ENTER } from '@/lib/drawEngine'
import { Draw, DrawEntry } from '@/types'

// ─── Helper: assert admin ──────────────────────────────────────────────────────
async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return { user: null, error: 'Unauthorized' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: profile } = (await db
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()) as { data: { role: string } | null }

  if (!profile || profile.role !== 'admin') return { user: null, error: 'Forbidden' }
  return { user, error: null }
}

// ─── Helper: load eligible entries (same as simulate route) ───────────────────
async function loadEligibleEntries(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any
): Promise<{ user_id: string; scores: number[] }[]> {
  const { data: activeUsers } = (await db
    .from('profiles')
    .select('id')
    .eq('subscription_status', 'active')) as { data: { id: string }[] | null }

  if (!activeUsers || activeUsers.length === 0) return []

  const activeUserIds = activeUsers.map((u: { id: string }) => u.id)

  const { data: allScores } = (await db
    .from('golf_scores')
    .select('user_id, score')
    .in('user_id', activeUserIds)) as {
    data: { user_id: string; score: number }[] | null
  }

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
// Runs a fresh draw (not reusing simulation), saves all draw_entries,
// marks the draw as published, handles jackpot rollover.
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

  // Load the draw record
  const { data: draw, error: drawError } = (await db
    .from('draws')
    .select('*')
    .eq('id', params.id)
    .single()) as { data: Draw | null; error: { message: string } | null }

  if (drawError || !draw) {
    return NextResponse.json({ error: 'Draw not found.' }, { status: 404 })
  }

  if (draw.status === 'published') {
    return NextResponse.json(
      { error: 'This draw is already published.' },
      { status: 400 }
    )
  }

  // ── Resolve jackpot carry-over amount ──────────────────────────────────────
  // If this draw references a prior draw's jackpot, we treat carry-over as
  // adding its 5-match share back into the pool. In a full implementation,
  // jackpotCarryOver would come from a real pool tracking system.
  // Here we use €400 (40% of €1000 base pool) as the carry-over placeholder.
  const TOTAL_POOL = 1000
  const CARRY_OVER_AMOUNT = draw.jackpot_carry_from_draw_id ? TOTAL_POOL * 0.4 : 0

  // ── Load eligible users ────────────────────────────────────────────────────
  const entries = await loadEligibleEntries(db)

  // ── Run the draw (fresh run, not reusing simulation) ───────────────────────
  const { drawnNumbers, results, jackpotRolledOver } = runFullDraw(
    draw.draw_type,
    entries,
    TOTAL_POOL,
    CARRY_OVER_AMOUNT
  )

  // ── Build the score snapshot map for quick lookup ─────────────────────────
  const scoreMap: Record<string, number[]> = {}
  for (const e of entries) scoreMap[e.user_id] = e.scores

  // ── Build draw_entries rows ────────────────────────────────────────────────
  const entryRows: Omit<DrawEntry, 'id' | 'created_at'>[] = results.map((r) => ({
    draw_id: draw.id,
    user_id: r.user_id,
    user_scores: scoreMap[r.user_id] ?? [],
    match_count: r.match_count,
    is_winner: r.prize_tier !== null,
    prize_tier: r.prize_tier,
    prize_amount: r.prize_amount,
  }))

  // ── Insert all entries in one batch ────────────────────────────────────────
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

  // ── Update the draw record ─────────────────────────────────────────────────
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

  // ── Build summary response ─────────────────────────────────────────────────
  const summary = {
    draw: updatedDraw,
    drawn_numbers: drawnNumbers,
    total_entries: entryRows.length,
    winners: {
      five_match: results.filter((r) => r.prize_tier === '5-match').length,
      four_match: results.filter((r) => r.prize_tier === '4-match').length,
      three_match: results.filter((r) => r.prize_tier === '3-match').length,
    },
    jackpot_rolled_over: jackpotRolledOver,
  }

  return NextResponse.json({ summary })
}
