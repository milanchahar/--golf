import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentJackpot } from '@/lib/prizePool'
import { PrizePool } from '@/types'

// ─── GET /api/prize-pool/current ──────────────────────────────────────────────
// Public endpoint: returns the current live jackpot amount.
// The jackpot is the accumulated 5-match carry-out from the most recent
// prize pool where no 5-match winner was found.
//
// Used on the homepage and user dashboard to display the growing jackpot.
// No authentication required — this is intentionally public for marketing.
export async function GET() {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Fetch all published prize pools ordered newest first
  const { data: pools, error } = (await db
    .from('prize_pools')
    .select('jackpot_carry_out, jackpot_carry_in, five_match_winners, draw_month, prize_pool_total, five_match_pool')
    .order('draw_month', { ascending: false })) as {
    data: PrizePool[] | null
    error: { message: string } | null
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const allPools = pools ?? []
  const currentJackpot = getCurrentJackpot(allPools)

  // Also surface the most recent pool's 5-match pool value for context
  const latestPool = allPools[0] ?? null

  return NextResponse.json({
    jackpot: currentJackpot,
    base_five_match_pool: latestPool?.five_match_pool ?? 0,
    last_draw_month: latestPool?.draw_month ?? null,
    // For display: is the jackpot growing (i.e. has rolled over)?
    is_rollover: currentJackpot > 0,
  })
}
