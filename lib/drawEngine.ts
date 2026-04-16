import { DrawResult } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────
export const DRAW_SIZE = 5           // Always 5 numbers per draw
export const DRAW_MIN = 1            // Minimum number value
export const DRAW_MAX = 45           // Maximum number value (matches Stableford cap)

// Prize pool split percentages
export const PRIZE_SPLIT = {
  FIVE_MATCH: 0.40,
  FOUR_MATCH: 0.35,
  THREE_MATCH: 0.25,
}

export const MIN_SCORES_TO_ENTER = 3   // Users need at least 3 scores to be eligible

// ─── generateRandomDraw ────────────────────────────────────────────────────────
/**
 * Generates 5 unique random numbers between 1–45 (inclusive).
 * Uses Fisher-Yates partial shuffle on the full range for unbiased selection.
 */
export function generateRandomDraw(): number[] {
  // Build the full pool [1..45] and do a partial Fisher-Yates shuffle
  const pool: number[] = Array.from({ length: DRAW_MAX }, (_, i) => i + 1)
  for (let i = 0; i < DRAW_SIZE; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, DRAW_SIZE).sort((a, b) => a - b)
}

// ─── generateAlgorithmicDraw ──────────────────────────────────────────────────
/**
 * Generates 5 numbers weighted by frequency across all active users' scores.
 * Numbers that appear more often in user scores are more likely to be drawn —
 * this creates a draw that is more likely to produce winners and increases
 * platform engagement.
 *
 * Algorithm:
 *  1. Build frequency map of all submitted scores (1–45).
 *  2. Assign weight = frequency + 1 (so even unseen numbers have a base chance).
 *  3. Weighted random selection without replacement.
 */
export function generateAlgorithmicDraw(allUserScores: number[][]): number[] {
  // Frequency map
  const freq: Record<number, number> = {}
  for (let n = DRAW_MIN; n <= DRAW_MAX; n++) freq[n] = 1  // base weight of 1

  for (const userScores of allUserScores) {
    for (const s of userScores) {
      if (s >= DRAW_MIN && s <= DRAW_MAX) freq[s]++
    }
  }

  // Weighted sampling without replacement
  const remaining = Array.from({ length: DRAW_MAX }, (_, i) => i + 1)
  const selected: number[] = []

  while (selected.length < DRAW_SIZE && remaining.length > 0) {
    const totalWeight = remaining.reduce((sum, n) => sum + freq[n], 0)
    let rand = Math.random() * totalWeight
    let chosenIdx = 0

    for (let i = 0; i < remaining.length; i++) {
      rand -= freq[remaining[i]]
      if (rand <= 0) {
        chosenIdx = i
        break
      }
    }

    selected.push(remaining[chosenIdx])
    remaining.splice(chosenIdx, 1)
  }

  return selected.sort((a, b) => a - b)
}

// ─── calculateMatchCount ──────────────────────────────────────────────────────
/**
 * Returns how many of the user's scores appear in the drawn numbers.
 * Uses Set intersection — order doesn't matter, each score counted once.
 */
export function calculateMatchCount(userScores: number[], drawnNumbers: number[]): number {
  const drawnSet = new Set(drawnNumbers)
  let count = 0
  for (const s of userScores) {
    if (drawnSet.has(s)) count++
  }
  return count
}

// ─── getPrizeTier ─────────────────────────────────────────────────────────────
/**
 * Maps a match count to a prize tier string, or null if no prize.
 * Qualifying tiers: 3, 4, or 5 matches.
 */
export function getPrizeTier(matchCount: number): '5-match' | '4-match' | '3-match' | null {
  if (matchCount === 5) return '5-match'
  if (matchCount === 4) return '4-match'
  if (matchCount === 3) return '3-match'
  return null
}

// ─── processDrawEntries ───────────────────────────────────────────────────────
/**
 * Processes all eligible user entries against the drawn numbers.
 * Returns a DrawResult per user with match count, prize tier, and prize amount
 * set to null (prize amounts are calculated separately after tallying winners).
 */
export function processDrawEntries(
  drawnNumbers: number[],
  entries: { user_id: string; scores: number[] }[]
): DrawResult[] {
  return entries.map(({ user_id, scores }) => {
    const match_count = calculateMatchCount(scores, drawnNumbers)
    const prize_tier = getPrizeTier(match_count)
    return {
      user_id,
      match_count,
      prize_tier,
      prize_amount: null,  // filled in after calculatePrizeAmounts
    }
  })
}

// ─── calculatePrizeAmounts ────────────────────────────────────────────────────
/**
 * Calculates the prize split per winner in each tier.
 *
 * Pool breakdown:
 *   - 40% of totalPool goes to 5-match winners (split equally among them)
 *   - 35% of totalPool goes to 4-match winners
 *   - 25% of totalPool goes to 3-match winners
 *
 * If fiveMatchCount === 0, the 5-match share is rolled into jackpotCarryOver
 * for the next month (not distributed here). Callers are responsible for
 * persisting the jackpot_carried_over flag on the draw record.
 *
 * jackpotCarryOver is the accumulated carry-over amount added on top of the
 * 5-match pool for this draw (from previous month's unclaimed jackpot).
 *
 * Returns per-winner amounts (€0 if no winners in that tier).
 */
export function calculatePrizeAmounts(
  totalPool: number,
  fiveMatchCount: number,
  fourMatchCount: number,
  threeMatchCount: number,
  jackpotCarryOver: number = 0
): { fiveMatch: number; fourMatch: number; threeMatch: number } {
  const fiveMatchPool = totalPool * PRIZE_SPLIT.FIVE_MATCH + jackpotCarryOver
  const fourMatchPool = totalPool * PRIZE_SPLIT.FOUR_MATCH
  const threeMatchPool = totalPool * PRIZE_SPLIT.THREE_MATCH

  return {
    fiveMatch: fiveMatchCount > 0 ? parseFloat((fiveMatchPool / fiveMatchCount).toFixed(2)) : 0,
    fourMatch: fourMatchCount > 0 ? parseFloat((fourMatchPool / fourMatchCount).toFixed(2)) : 0,
    threeMatch: threeMatchCount > 0 ? parseFloat((threeMatchPool / threeMatchCount).toFixed(2)) : 0,
  }
}

// ─── runFullDraw ──────────────────────────────────────────────────────────────
/**
 * Orchestrates a complete draw run:
 *  1. Generates drawn numbers (random or algorithmic)
 *  2. Processes all entries
 *  3. Calculates prize amounts
 *  4. Returns annotated DrawResult[] with prize amounts set
 *
 * Used by both simulate and publish routes so the logic is DRY.
 */
export function runFullDraw(
  drawType: 'random' | 'algorithmic',
  entries: { user_id: string; scores: number[] }[],
  totalPool: number,
  jackpotCarryOver: number = 0
): {
  drawnNumbers: number[]
  results: DrawResult[]
  jackpotRolledOver: boolean
} {
  // 1. Generate numbers
  const allScores = entries.map((e) => e.scores)
  const drawnNumbers =
    drawType === 'algorithmic'
      ? generateAlgorithmicDraw(allScores)
      : generateRandomDraw()

  // 2. Process entries
  const rawResults = processDrawEntries(drawnNumbers, entries)

  // 3. Tally winner counts per tier
  const fiveMatchWinners = rawResults.filter((r) => r.prize_tier === '5-match')
  const fourMatchWinners = rawResults.filter((r) => r.prize_tier === '4-match')
  const threeMatchWinners = rawResults.filter((r) => r.prize_tier === '3-match')

  // 4. Calculate prize amounts
  const prizes = calculatePrizeAmounts(
    totalPool,
    fiveMatchWinners.length,
    fourMatchWinners.length,
    threeMatchWinners.length,
    jackpotCarryOver
  )

  // 5. Annotate results with prize amounts
  const results: DrawResult[] = rawResults.map((r) => ({
    ...r,
    prize_amount:
      r.prize_tier === '5-match'
        ? prizes.fiveMatch
        : r.prize_tier === '4-match'
        ? prizes.fourMatch
        : r.prize_tier === '3-match'
        ? prizes.threeMatch
        : null,
  }))

  return {
    drawnNumbers,
    results,
    jackpotRolledOver: fiveMatchWinners.length === 0,
  }
}
