import { PrizePool, BuildPrizePoolParams } from '@/types'

// ─── Subscription pricing constants ──────────────────────────────────────────
/** Monthly subscription fee in € */
export const MONTHLY_PLAN_FEE = 9.99
/** Yearly subscription fee in € */
export const YEARLY_PLAN_FEE = 99.99
/** Fraction of each subscription fee allocated to the prize pool */
export const PRIZE_POOL_SHARE = 0.30

// ─── Pool split percentages (must sum to 1.0) ─────────────────────────────────
export const TIER_SPLIT = {
  FIVE_MATCH: 0.40,
  FOUR_MATCH: 0.35,
  THREE_MATCH: 0.25,
} as const

// ─── calculatePrizePool ───────────────────────────────────────────────────────
/**
 * Calculates the total prize pool contribution for one calendar month
 * from active subscriber counts.
 *
 * Monthly plan:  €9.99 × 30% = €2.997 per subscriber
 * Yearly plan:   €99.99 / 12 × 30% = €2.4998 per subscriber per month
 *
 * Returns the total prize pool in € (rounded to 2 dp).
 */
export function calculatePrizePool(
  monthlySubscribers: number,
  yearlySubscribers: number
): number {
  const monthlyContrib = monthlySubscribers * MONTHLY_PLAN_FEE * PRIZE_POOL_SHARE
  const yearlyContrib = yearlySubscribers * (YEARLY_PLAN_FEE / 12) * PRIZE_POOL_SHARE
  return parseFloat((monthlyContrib + yearlyContrib).toFixed(2))
}

// ─── splitPoolIntoTiers ────────────────────────────────────────────────────────
/**
 * Splits the total prize pool amount into three tier pools.
 * The 5-match pool is augmented by any jackpot carry-in from the previous month.
 *
 * @param totalPool       Net prize pool for this month (€)
 * @param jackpotCarryIn  Carry-over jackpot from the prior month's 5-match (€)
 * @returns Per-tier pool amounts in €
 */
export function splitPoolIntoTiers(
  totalPool: number,
  jackpotCarryIn: number = 0
): { fiveMatch: number; fourMatch: number; threeMatch: number } {
  const fiveMatchBase = parseFloat((totalPool * TIER_SPLIT.FIVE_MATCH).toFixed(2))
  const fourMatch = parseFloat((totalPool * TIER_SPLIT.FOUR_MATCH).toFixed(2))
  const threeMatch = parseFloat((totalPool * TIER_SPLIT.THREE_MATCH).toFixed(2))
  // Jackpot carry-in is added on top of the 5-match base, not the full pool
  const fiveMatch = parseFloat((fiveMatchBase + jackpotCarryIn).toFixed(2))
  return { fiveMatch, fourMatch, threeMatch }
}

// ─── calculatePayouts ─────────────────────────────────────────────────────────
/**
 * Calculates the per-winner payout for each prize tier.
 *
 * Rules:
 *  - If a tier has 0 winners, payout is €0 (pool stays with platform for 4/3-match;
 *    rolls over for 5-match — handled by calculateJackpotCarryOut).
 *  - Multiple winners split the tier pool equally.
 *
 * @param tierPools     Pool amounts per tier in €
 * @param winnerCounts  Number of winners per tier
 * @returns Per-winner payout per tier in €
 */
export function calculatePayouts(
  tierPools: { fiveMatch: number; fourMatch: number; threeMatch: number },
  winnerCounts: { fiveMatch: number; fourMatch: number; threeMatch: number }
): { fiveMatchPayout: number; fourMatchPayout: number; threeMatchPayout: number } {
  return {
    fiveMatchPayout:
      winnerCounts.fiveMatch > 0
        ? parseFloat((tierPools.fiveMatch / winnerCounts.fiveMatch).toFixed(2))
        : 0,
    fourMatchPayout:
      winnerCounts.fourMatch > 0
        ? parseFloat((tierPools.fourMatch / winnerCounts.fourMatch).toFixed(2))
        : 0,
    threeMatchPayout:
      winnerCounts.threeMatch > 0
        ? parseFloat((tierPools.threeMatch / winnerCounts.threeMatch).toFixed(2))
        : 0,
  }
}

// ─── calculateJackpotCarryOut ─────────────────────────────────────────────────
/**
 * Determines how much of the 5-match pool carries over to the next month.
 *
 * - If no 5-match winners → the entire fiveMatchPool rolls over.
 * - If there are winners  → all of fiveMatchPool was paid out; nothing carries over.
 *
 * The 4-match and 3-match pools NEVER roll over — they stay with the platform
 * if unclaimed.
 */
export function calculateJackpotCarryOut(
  fiveMatchPool: number,
  fiveMatchWinnerCount: number
): number {
  return fiveMatchWinnerCount === 0 ? fiveMatchPool : 0
}

// ─── getCurrentJackpot ────────────────────────────────────────────────────────
/**
 * Returns the current live jackpot value — the most recent
 * jackpot_carry_out from previous prize pools that has not yet been won.
 *
 * Works by reading previous pools in reverse chronological order and returning
 * the accumulated carry-out from the most recent pool where there was no
 * 5-match winner. If all previous draws had winners, returns 0.
 *
 * @param previousPools  Array of PrizePool records, any order (will sort internally)
 */
export function getCurrentJackpot(previousPools: PrizePool[]): number {
  if (!previousPools.length) return 0
  // Sort by draw_month descending (latest first)
  const sorted = [...previousPools].sort((a, b) =>
    b.draw_month.localeCompare(a.draw_month)
  )
  // The jackpot is the most recent carry-out (it already includes all
  // prior accumulated carry-outs because each month's pool adds to the previous)
  return sorted[0].jackpot_carry_out
}

// ─── buildPrizePoolRecord ─────────────────────────────────────────────────────
/**
 * Full end-to-end prize pool construction.
 * Given subscriber counts, carry-in, and winner counts for all three tiers,
 * returns a complete PrizePool record (without id/created_at/updated_at —
 * those are provided by the database on insert).
 */
export function buildPrizePoolRecord(
  params: BuildPrizePoolParams
): Omit<PrizePool, 'id' | 'created_at' | 'updated_at'> {
  const {
    draw_id,
    draw_month,
    monthly_subscribers,
    yearly_subscribers,
    jackpot_carry_in,
    five_match_winners,
    four_match_winners,
    three_match_winners,
  } = params

  // 1. Total pool this month
  const totalSubscribers = monthly_subscribers + yearly_subscribers
  const monthlyRevenue = monthly_subscribers * MONTHLY_PLAN_FEE
  const yearlyRevenue = yearly_subscribers * (YEARLY_PLAN_FEE / 12)
  const subscriptionRevenue = parseFloat((monthlyRevenue + yearlyRevenue).toFixed(2))
  const prizePoolTotal = calculatePrizePool(monthly_subscribers, yearly_subscribers)

  // 2. Split into tiers
  const tierPools = splitPoolIntoTiers(prizePoolTotal, jackpot_carry_in)

  // 3. Per-winner payouts
  const payouts = calculatePayouts(tierPools, {
    fiveMatch: five_match_winners,
    fourMatch: four_match_winners,
    threeMatch: three_match_winners,
  })

  // 4. Jackpot carry-out
  const jackpotCarryOut = calculateJackpotCarryOut(
    tierPools.fiveMatch,
    five_match_winners
  )

  return {
    draw_id,
    draw_month,
    total_active_subscribers: totalSubscribers,
    subscription_revenue: subscriptionRevenue,
    prize_pool_total: prizePoolTotal,
    five_match_pool: tierPools.fiveMatch,
    four_match_pool: tierPools.fourMatch,
    three_match_pool: tierPools.threeMatch,
    jackpot_carry_in: jackpot_carry_in,
    jackpot_carry_out: jackpotCarryOut,
    five_match_winners,
    four_match_winners,
    three_match_winners,
    five_match_payout: payouts.fiveMatchPayout,
    four_match_payout: payouts.fourMatchPayout,
    three_match_payout: payouts.threeMatchPayout,
  }
}
