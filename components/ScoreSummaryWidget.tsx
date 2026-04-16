'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { GolfScore } from '@/types'
import { formatScoreDate, MAX_SCORES } from '@/lib/scores'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function average(scores: GolfScore[]): number {
  if (!scores.length) return 0
  return Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
}

// ─── Mini CSS bar chart ────────────────────────────────────────────────────────

function MiniBarChart({ scores }: { scores: GolfScore[] }) {
  if (!scores.length) return null

  // Show at most 5 bars, newest last so the chart reads left-to-right chronologically
  const ordered = [...scores].reverse() // scores arrive newest-first from API

  const maxScore = Math.max(...ordered.map((s) => s.score))

  return (
    <div className="flex items-end gap-1 h-12" aria-label="Score history bar chart">
      {ordered.map((s) => {
        const heightPct = Math.round((s.score / maxScore) * 100)
        return (
          <div key={s.id} className="flex-1 flex flex-col items-center gap-0.5 group">
            {/* Tooltip on hover */}
            <div className="relative">
              <div
                className="w-full bg-brand-blue rounded-t-sm transition-all duration-500 group-hover:bg-blue-400"
                style={{ height: `${(heightPct / 100) * 40}px`, minHeight: '4px' }}
                role="img"
                aria-label={`${s.score} pts on ${s.score_date}`}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 whitespace-nowrap rounded-md bg-slate-700 border border-slate-600 px-2 py-1 text-xs text-slate-100 shadow-lg pointer-events-none">
                {s.score} pts
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatItem({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-widest text-slate-500">{label}</span>
      <span className={`text-2xl font-black tabular-nums leading-none ${accent ?? 'text-white'}`}>
        {value}
      </span>
    </div>
  )
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export default function ScoreSummaryWidget() {
  const [scores, setScores] = useState<GolfScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/scores')
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setScores(data.scores ?? [])
      } catch {
        setError('Could not load scores')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const monthKey = currentMonthKey()
  const scoresThisMonth = scores.filter((s) => s.score_date.startsWith(monthKey))
  const highest = scores.length ? Math.max(...scores.map((s) => s.score)) : null
  const lowest = scores.length ? Math.min(...scores.map((s) => s.score)) : null
  const avg = scores.length ? average(scores) : null
  const latest = scores.length ? scores[0] : null // newest first

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⛳</span>
          <h3 className="text-sm font-semibold text-slate-100">Score Summary</h3>
        </div>
        <Link
          href="/dashboard/scores"
          className="text-xs font-medium text-brand-blue hover:text-blue-400 transition-colors flex items-center gap-0.5"
        >
          View All →
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-800" />
            ))}
          </div>
          <div className="h-12 rounded-lg bg-slate-800" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Empty state */}
      {!loading && !error && !scores.length && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-500">No scores yet.</p>
          <Link
            href="/dashboard/scores"
            className="inline-block mt-2 text-sm font-medium text-brand-blue hover:underline"
          >
            Add your first score →
          </Link>
        </div>
      )}

      {/* Stats */}
      {!loading && !error && scores.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatItem label="Average" value={avg ?? '–'} accent="text-brand-blue" />
            <StatItem label="Best" value={highest ?? '–'} accent="text-brand-green" />
            <StatItem label="Lowest" value={lowest ?? '–'} accent="text-slate-300" />
            <StatItem label="This Month" value={scoresThisMonth.length} />
          </div>

          {/* Latest score call-out */}
          {latest && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-3">
              <div className="text-2xl font-black tabular-nums text-brand-blue leading-none">
                {latest.score}
                <span className="text-xs text-slate-500 ml-1 font-medium">pts</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Latest Round</span>
                <span className="text-xs text-slate-300">{formatScoreDate(latest.score_date)}</span>
              </div>
            </div>
          )}

          {/* Bar chart */}
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-2">History</p>
            <MiniBarChart scores={scores} />
          </div>

          {/* Capacity indicator */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-blue transition-all duration-500"
                style={{ width: `${(scores.length / MAX_SCORES) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 tabular-nums">{scores.length}/{MAX_SCORES}</span>
          </div>
        </>
      )}
    </div>
  )
}
