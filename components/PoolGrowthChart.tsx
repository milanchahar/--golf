'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { PrizePool } from '@/types'

interface PoolGrowthChartProps {
  /** Array of prize pool records to chart — any order (sorted internally) */
  pools: PrizePool[]
}

/** "2026-04" → "Apr '26" */
function shortMonth(drawMonth: string): string {
  const [y, m] = drawMonth.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1, 1))
  const mo = d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })
  return `${mo} '${String(y).slice(2)}`
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Custom tooltip
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 shadow-xl p-3 text-sm">
      <p className="font-semibold text-slate-200 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold tabular-nums" style={{ color: p.color }}>
            {formatEur(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function PoolGrowthChart({ pools }: PoolGrowthChartProps) {
  if (!pools.length) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-slate-800 text-slate-500 text-sm">
        No pool data to display yet
      </div>
    )
  }

  // Sort ascending for time-series chart
  const sorted = [...pools].sort((a, b) => a.draw_month.localeCompare(b.draw_month))

  const chartData = sorted.map((p) => ({
    month: shortMonth(p.draw_month),
    'Total Pool': p.prize_pool_total,
    'Jackpot (5-match)': p.five_match_pool,
  }))

  return (
    <div className="w-full h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(100,116,139,0.15)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(100,116,139,0.3)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `€${v}`}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="Total Pool"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={{ fill: '#3B82F6', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="Jackpot (5-match)"
            stroke="#10B981"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
