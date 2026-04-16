'use client'

import { useEffect, useState } from 'react'
import DrawBalls from '@/components/DrawBalls'
import { Draw, DrawEntry } from '@/types'
import { cn } from '@/lib/utils'

// ─── Types local to this page ─────────────────────────────────────────────────

interface EnrichedDraw extends Draw {
  winner_counts: {
    five_match: number
    four_match: number
    three_match: number
    total_entries: number
  }
  my_entry: DrawEntry | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "2026-04" → "April 2026" */
function formatDrawMonth(drawMonth: string): string {
  const [year, month] = drawMonth.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, 1))
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

/** Next calendar month from today — "YYYY-MM" */
function nextDrawMonth(): string {
  const d = new Date()
  const next = new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 1))
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`
}

function matchLabel(matchCount: number): string {
  if (matchCount === 5) return 'You matched all 5 numbers! 🎉'
  if (matchCount === 4) return 'You matched 4 numbers!'
  if (matchCount === 3) return 'You matched 3 numbers!'
  return 'No match this month'
}

// ─── Prize badge ──────────────────────────────────────────────────────────────

function PrizeBadge({ entry }: { entry: DrawEntry }) {
  if (!entry.is_winner || entry.prize_amount === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-slate-800 text-slate-400 ring-1 ring-slate-700">
        ⭕ No Match
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-brand-blue/20 text-brand-blue ring-1 ring-brand-blue/40">
      🏆 Winner — €{entry.prize_amount.toFixed(2)}
    </span>
  )
}

// ─── Draw card ────────────────────────────────────────────────────────────────

function DrawCard({ draw, index }: { draw: EnrichedDraw; index: number }) {
  const myEntry = draw.my_entry
  const hasEntry = myEntry !== null
  const isWinner = myEntry?.is_winner ?? false

  return (
    <article
      className={cn(
        'rounded-2xl border bg-slate-900/70 backdrop-blur-sm p-6 shadow-xl transition-colors animate-fade-in',
        isWinner
          ? 'border-brand-blue/40 bg-brand-blue/5'
          : 'border-slate-800 hover:border-slate-700'
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-bold text-white">{formatDrawMonth(draw.draw_month)} Draw</h3>
          {draw.published_at && (
            <p className="text-xs text-slate-500 mt-0.5">
              Published {new Date(draw.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        {hasEntry && <PrizeBadge entry={myEntry!} />}
        {!hasEntry && (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-slate-800 text-slate-500 ring-1 ring-slate-700">
            Not entered
          </span>
        )}
      </div>

      {/* Drawn balls */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Drawn Numbers
        </p>
        <DrawBalls
          drawnNumbers={draw.drawn_numbers}
          userScores={myEntry?.user_scores ?? []}
        />
      </div>

      {/* User scores + match indicator */}
      {hasEntry && (
        <div className="mb-5 rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your Scores</p>
              <div className="flex gap-1.5">
                {myEntry!.user_scores.map((s, i) => (
                  <span
                    key={i}
                    className={cn(
                      'inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold tabular-nums',
                      draw.drawn_numbers.includes(s)
                        ? 'bg-brand-blue/30 text-brand-blue ring-1 ring-brand-blue/50'
                        : 'bg-slate-700 text-slate-300'
                    )}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-semibold',
                myEntry!.match_count >= 3 ? 'text-brand-blue' : 'text-slate-400'
              )}>
                {matchLabel(myEntry!.match_count)}
              </p>
              {myEntry!.prize_tier && (
                <p className="text-xs text-brand-green mt-0.5">
                  Tier: {myEntry!.prize_tier} — Prize: €{myEntry!.prize_amount?.toFixed(2) ?? '0.00'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Draw stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
        <div className="text-center">
          <p className="text-lg font-black text-brand-blue tabular-nums">
            {draw.winner_counts.five_match}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">5-match</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-200 tabular-nums">
            {draw.winner_counts.four_match}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">4-match</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-200 tabular-nums">
            {draw.winner_counts.three_match}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">3-match</p>
        </div>
      </div>

      {/* Jackpot rollover notice */}
      {draw.jackpot_carried_over && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 py-2.5">
          <span className="text-amber-400 text-sm">↗</span>
          <p className="text-xs text-amber-300">
            No 5-match winner this round — jackpot carried over to next month!
          </p>
        </div>
      )}
    </article>
  )
}

// ─── Upcoming draw teaser ─────────────────────────────────────────────────────

function UpcomingDrawTeaser() {
  const next = nextDrawMonth()
  const label = formatDrawMonth(next)

  return (
    <div className="rounded-2xl border border-dashed border-brand-blue/30 bg-brand-blue/5 p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-2xl flex-shrink-0">
        🎲
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-100">
          Next Draw: <span className="text-brand-blue">{label}</span>
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Make sure you have at least 3 scores entered and an active subscription to participate.
        </p>
      </div>
      <a
        href="/dashboard/scores"
        className="flex-shrink-0 text-xs font-semibold text-brand-blue hover:text-blue-400 transition-colors whitespace-nowrap"
      >
        Enter scores →
      </a>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DrawsPageClient() {
  const [draws, setDraws] = useState<EnrichedDraw[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/draws')
        if (!res.ok) throw new Error('Failed to load draws')
        const data = await res.json()
        setDraws(data.draws ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Monthly Draws
        </h2>
        <p className="mt-1 text-slate-400 text-sm">
          Your Stableford scores are entered into a monthly draw. Match 3, 4, or all 5 drawn numbers to win.
        </p>
      </div>

      {/* Upcoming draw teaser — always shown at the top */}
      <UpcomingDrawTeaser />

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 animate-pulse h-64"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && draws.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-20 px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mb-4">
            🎱
          </div>
          <p className="text-slate-300 font-semibold mb-1">No draws yet</p>
          <p className="text-slate-500 text-sm max-w-xs">
            No draws have been published yet. Enter your scores now to be ready for the first draw!
          </p>
        </div>
      )}

      {/* Draw cards */}
      {!loading && !error && draws.length > 0 && (
        <div className="space-y-5">
          {draws.map((draw, i) => (
            <DrawCard key={draw.id} draw={draw} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
