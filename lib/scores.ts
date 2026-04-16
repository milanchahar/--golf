import { GolfScore } from '@/types'

export const SCORE_MIN = 1
export const SCORE_MAX = 45
export const MAX_SCORES = 5

/**
 * Validates that a score value is within the legal Stableford range (1–45).
 */
export function validateScore(score: number): boolean {
  return Number.isInteger(score) && score >= SCORE_MIN && score <= SCORE_MAX
}

/**
 * Returns true if the given ISO date string (YYYY-MM-DD) is strictly in the future.
 * "Today" is allowed; only future dates are rejected.
 */
export function isFutureDate(date: string): boolean {
  const today = new Date()
  // Build a date-only comparison using local calendar date
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
  return date > todayStr
}

/**
 * Returns the score with the oldest score_date from the array.
 * Assumes the array is non-empty.
 */
export function getOldestScore(scores: GolfScore[]): GolfScore {
  return scores.reduce((oldest, current) =>
    current.score_date < oldest.score_date ? current : oldest
  )
}

/**
 * Returns true when adding one more score would exceed the 5-score cap.
 */
export function willExceedLimit(currentCount: number): boolean {
  return currentCount >= MAX_SCORES
}

/**
 * Formats an ISO date string (YYYY-MM-DD) as "Mon, 14 Apr 2026".
 */
export function formatScoreDate(date: string): string {
  // Parse as UTC midnight to avoid timezone-shift issues
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
