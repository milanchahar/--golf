import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildPrizePoolRecord } from '@/lib/prizePool'
import { PrizePool, DrawEntry } from '@/types'

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

// ─── POST /api/admin/prize-pool/calculate ─────────────────────────────────────
// Calculates and saves (or upserts) the prize pool record for a given draw.
// Also updates draw_entries prize_amount fields with accurate per-winner payouts.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { error: authErr } = await requireAdmin(supabase)
  if (authErr) {
    return NextResponse.json({ error: authErr }, { status: authErr === 'Unauthorized' ? 401 : 403 })
  }

  let body: { draw_month: unknown; draw_id: unknown }
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const { draw_month, draw_id } = body
  if (typeof draw_month !== 'string' || !/^\d{4}-\d{2}$/.test(draw_month)) {
    return NextResponse.json({ error: 'draw_month must be "YYYY-MM".' }, { status: 400 })
  }
  if (typeof draw_id !== 'string' || !draw_id) {
    return NextResponse.json({ error: 'draw_id is required.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // ── 1. Count active subscribers by plan ────────────────────────────────────
  // Supabase returns count in the response when head:true is used
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

  // ── 2. Fetch jackpot carry-in from the most recent prior prize pool ─────────
  const { data: priorPools } = (await db
    .from('prize_pools')
    .select('jackpot_carry_out, draw_month')
    .neq('draw_id', draw_id)
    .order('draw_month', { ascending: false })
    .limit(1)) as { data: { jackpot_carry_out: number; draw_month: string }[] | null }

  const jackpotCarryIn = priorPools?.[0]?.jackpot_carry_out ?? 0

  // ── 3. Fetch winner counts from draw_entries ────────────────────────────────
  const { data: entries } = (await db
    .from('draw_entries')
    .select('prize_tier, user_id')
    .eq('draw_id', draw_id)) as { data: DrawEntry[] | null }

  const entryList = entries ?? []
  const five_match_winners = entryList.filter(e => e.prize_tier === '5-match').length
  const four_match_winners = entryList.filter(e => e.prize_tier === '4-match').length
  const three_match_winners = entryList.filter(e => e.prize_tier === '3-match').length

  // ── 4. Build the prize pool record ─────────────────────────────────────────
  const poolRecord = buildPrizePoolRecord({
    draw_id: draw_id as string,
    draw_month: draw_month as string,
    monthly_subscribers: monthlySubscribers,
    yearly_subscribers: yearlySubscribers,
    jackpot_carry_in: jackpotCarryIn,
    five_match_winners,
    four_match_winners,
    three_match_winners,
  })

  // ── 5. Upsert prize pool (idempotent — safe to recalculate) ────────────────
  const { data: savedPool, error: upsertError } = (await db
    .from('prize_pools')
    .upsert({ ...poolRecord }, { onConflict: 'draw_id' })
    .select()
    .single()) as { data: PrizePool | null; error: { message: string } | null }

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  // ── 6. Back-fill prize_amount on draw_entries with accurate per-winner payout
  const tierPayoutMap: Record<string, number> = {
    '5-match': poolRecord.five_match_payout,
    '4-match': poolRecord.four_match_payout,
    '3-match': poolRecord.three_match_payout,
  }

  // Update each winning entry individually (small N — typically <20 entries)
  const winningEntries = entryList.filter(e => e.prize_tier !== null)
  for (const entry of winningEntries) {
    if (entry.prize_tier && tierPayoutMap[entry.prize_tier] !== undefined) {
      await db
        .from('draw_entries')
        .update({ prize_amount: tierPayoutMap[entry.prize_tier] })
        .eq('draw_id', draw_id)
        .eq('user_id', entry.user_id)
    }
  }

  return NextResponse.json({ prize_pool: savedPool })
}
