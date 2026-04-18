'use client'

import { useCallback, useEffect, useState } from 'react'
import { Draw, PrizePool } from '@/types'
import PrizeBreakdownTable from '@/components/PrizeBreakdownTable'
import PoolGrowthChart from '@/components/PoolGrowthChart'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatEur(value: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value)
}

function formatMonth(m: string): string {
  const [y, mo] = m.split('-').map(Number)
  return new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className={cn('text-2xl font-black tabular-nums', accent ?? 'text-white')}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Draw selector ─────────────────────────────────────────────────────────────

interface DrawOption {
  id: string
  draw_month: string
  status: string
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function AdminPrizePoolPanel() {
  const [draws, setDraws] = useState<DrawOption[]>([])
  const [selectedDrawId, setSelectedDrawId] = useState<string>('')
  const [pool, setPool] = useState<PrizePool | null>(null)
  const [allPools, setAllPools] = useState<PrizePool[]>([])
  const [loadingDraws, setLoadingDraws] = useState(true)
  const [loadingPool, setLoadingPool] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [poolError, setPoolError] = useState('')
  const [calcError, setCalcError] = useState('')
  const [calcSuccess, setCalcSuccess] = useState(false)

  // Fetch all draws for the selector
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/admin/draws')
        if (!res.ok) throw new Error()
        const data = await res.json()
        const d: DrawOption[] = (data.draws ?? []).map((draw: Draw & { winner_counts: unknown }) => ({
          id: draw.id,
          draw_month: draw.draw_month,
          status: draw.status,
        }))
        setDraws(d)
        if (d.length > 0) setSelectedDrawId(d[0].id)
      } finally {
        setLoadingDraws(false)
      }
    })()
  }, [])

  // Fetch all prize pools for the growth chart
  useEffect(() => {
    ;(async () => {
      try {
        // We'll fetch each pool individually via the list of published draw IDs
        // For the growth chart we only need published draws with pools
        const res = await fetch('/api/admin/draws')
        if (!res.ok) return
        const data = await res.json()
        const publishedIds: string[] = (data.draws ?? [])
          .filter((d: DrawOption) => d.status === 'published')
          .map((d: DrawOption) => d.id)

        const poolPromises = publishedIds.map((id) =>
          fetch(`/api/admin/prize-pool/${id}`)
            .then(r => r.ok ? r.json() : null)
            .then(j => j?.prize_pool ?? null)
        )
        const results = (await Promise.all(poolPromises)).filter(Boolean) as PrizePool[]
        setAllPools(results)
      } catch { /* silent */ }
    })()
  }, [])

  // Fetch prize pool for selected draw
  const fetchPool = useCallback(async (drawId: string) => {
    if (!drawId) return
    setLoadingPool(true)
    setPoolError('')
    setPool(null)
    try {
      const res = await fetch(`/api/admin/prize-pool/${drawId}`)
      if (res.status === 404) { setPool(null); return }
      if (!res.ok) throw new Error('Failed to load pool')
      const data = await res.json()
      setPool(data.prize_pool)
    } catch (e) {
      setPoolError(e instanceof Error ? e.message : 'Error loading pool')
    } finally {
      setLoadingPool(false)
    }
  }, [])

  useEffect(() => {
    if (selectedDrawId) fetchPool(selectedDrawId)
  }, [selectedDrawId, fetchPool])

  // Recalculate pool
  async function handleRecalculate() {
    const selectedDraw = draws.find(d => d.id === selectedDrawId)
    if (!selectedDraw) return
    setCalculating(true)
    setCalcError('')
    setCalcSuccess(false)
    try {
      const res = await fetch('/api/admin/prize-pool/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draw_id: selectedDrawId, draw_month: selectedDraw.draw_month }),
      })
      const data = await res.json()
      if (!res.ok) { setCalcError(data.error || 'Calculation failed'); return }
      setPool(data.prize_pool)
      setCalcSuccess(true)
    } catch (e) {
      setCalcError(e instanceof Error ? e.message : 'Error')
    } finally {
      setCalculating(false)
    }
  }

  const selectedDraw = draws.find(d => d.id === selectedDrawId)

  return (
    <div className="space-y-6">
      {/* Header + draw selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Prize Pool Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">Per-draw prize pool breakdown and jackpot tracking</p>
        </div>

        {loadingDraws ? (
          <div className="h-10 w-48 rounded-lg bg-slate-800 animate-pulse" />
        ) : (
          <select
            id="draw-selector"
            value={selectedDrawId}
            onChange={e => setSelectedDrawId(e.target.value)}
            className="h-10 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            {draws.map(d => (
              <option key={d.id} value={d.id}>
                {formatMonth(d.draw_month)} ({d.status})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Pool stats */}
      {loadingPool && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-800" />
          ))}
        </div>
      )}

      {!loadingPool && poolError && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">{poolError}</div>
      )}

      {!loadingPool && !pool && !poolError && (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
          <p className="text-slate-500 text-sm">No prize pool calculated for this draw yet.</p>
          <p className="text-slate-600 text-xs mt-1">Click &ldquo;Recalculate Pool&rdquo; to generate it.</p>
        </div>
      )}

      {!loadingPool && pool && (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Active Subscribers" value={pool.total_active_subscribers.toLocaleString()} />
            <StatCard label="Subscription Revenue" value={formatEur(pool.subscription_revenue)} sub="this month" />
            <StatCard label="Total Prize Pool" value={formatEur(pool.prize_pool_total)} accent="text-brand-blue" />
            <StatCard
              label="Jackpot Carry-in"
              value={formatEur(pool.jackpot_carry_in)}
              sub={pool.jackpot_carry_in > 0 ? 'from prior month' : 'no carry-in'}
              accent={pool.jackpot_carry_in > 0 ? 'text-amber-400' : 'text-slate-500'}
            />
          </div>

          {/* Jackpot status */}
          {pool.jackpot_carry_out > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3">
              <span className="text-amber-400 text-lg mt-0.5">↗</span>
              <div>
                <p className="text-sm font-semibold text-amber-300">Jackpot Rolling Over</p>
                <p className="text-xs text-amber-400/70 mt-0.5">
                  {formatEur(pool.jackpot_carry_out)} carries forward to the next draw&apos;s 5-match pool.
                </p>
              </div>
            </div>
          )}

          {/* Tier breakdown table */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Tier Breakdown</h3>
            <PrizeBreakdownTable pool={pool} />
          </div>
        </>
      )}

      {/* Recalculate button */}
      <div className="flex items-center gap-3">
        <button
          id="recalculate-pool-btn"
          onClick={handleRecalculate}
          disabled={calculating || !selectedDraw}
          className={cn(
            'inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-all',
            'bg-brand-blue hover:bg-blue-500 text-white shadow-md shadow-blue-500/20',
            'focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-slate-900',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {calculating ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Calculating…
            </>
          ) : '⟳ Recalculate Pool'}
        </button>

        {calcSuccess && (
          <span className="text-sm text-brand-green font-medium">✓ Pool updated successfully</span>
        )}
        {calcError && (
          <span className="text-sm text-red-400">{calcError}</span>
        )}
      </div>

      {/* Growth chart — only shown when there are multiple pools */}
      {allPools.length > 1 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Prize Pool Growth</h3>
          <PoolGrowthChart pools={allPools} />
        </div>
      )}
    </div>
  )
}
