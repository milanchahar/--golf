'use client'

import { useEffect, useRef, useState } from 'react'

interface JackpotCounterProps {
  /** Pre-fetched jackpot value in €. If null, fetches from /api/prize-pool/current */
  initialJackpot?: number | null
  /** Whether this jackpot is a rollover from a previous month */
  isRollover?: boolean
  /** Last draw month for context ("2026-03") */
  lastDrawMonth?: string | null
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

/** Formats a number as "€1,240.00" */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Formats "2026-03" → "March 2026" */
function formatMonth(m: string): string {
  const [y, mo] = m.split('-').map(Number)
  return new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

/** Eases a number from 0 → target over ~1.2 s with requestAnimationFrame */
function useCountUp(target: number, duration = 1200): number {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (target <= 0) { setDisplayed(0); return }
    const startValue = 0

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(startValue + (target - startValue) * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return displayed
}

export default function JackpotCounter({
  initialJackpot = null,
  isRollover: initialIsRollover = false,
  lastDrawMonth: initialLastDraw = null,
  size = 'lg',
}: JackpotCounterProps) {
  const [jackpot, setJackpot] = useState<number>(initialJackpot ?? 0)
  const [isRollover, setIsRollover] = useState(initialIsRollover)
  const [lastDraw, setLastDraw] = useState(initialLastDraw)
  const [loading, setLoading] = useState(initialJackpot === null)

  // Fetch from API if no initialJackpot provided
  useEffect(() => {
    if (initialJackpot !== null) return
    ;(async () => {
      try {
        const res = await fetch('/api/prize-pool/current')
        if (!res.ok) return
        const data = await res.json()
        setJackpot(data.jackpot ?? 0)
        setIsRollover(data.is_rollover ?? false)
        setLastDraw(data.last_draw_month ?? null)
      } finally {
        setLoading(false)
      }
    })()
  }, [initialJackpot])

  const animatedValue = useCountUp(jackpot)

  const sizeStyles = {
    sm: { value: 'text-3xl', label: 'text-xs', wrapper: 'p-4' },
    md: { value: 'text-5xl', label: 'text-sm', wrapper: 'p-5' },
    lg: { value: 'text-6xl sm:text-7xl', label: 'text-base', wrapper: 'p-6 sm:p-8' },
  }[size]

  if (loading) {
    return (
      <div className={`rounded-2xl border border-slate-800 bg-slate-900/60 ${sizeStyles.wrapper} animate-pulse`}>
        <div className="h-12 bg-slate-800 rounded-xl w-48 mx-auto" />
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-brand-blue/30 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 ${sizeStyles.wrapper} text-center shadow-2xl shadow-blue-500/10 relative overflow-hidden`}>
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-transparent pointer-events-none" />

      {/* Trophy icon */}
      <div className="flex justify-center mb-3">
        <span className={`${size === 'lg' ? 'text-5xl' : 'text-3xl'} drop-shadow-lg`}>🏆</span>
      </div>

      {/* Label */}
      <p className={`${sizeStyles.label} font-semibold uppercase tracking-widest text-slate-400 mb-2`}>
        Current Jackpot
      </p>

      {/* Animated value */}
      <p className={`${sizeStyles.value} font-black tabular-nums tracking-tight bg-gradient-to-br from-white via-blue-100 to-brand-blue bg-clip-text text-transparent leading-none mb-3`}>
        {formatCurrency(animatedValue)}
      </p>

      {/* Rollover notice */}
      {isRollover && lastDraw && (
        <div className="inline-flex items-center gap-2 mt-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <p className={`${sizeStyles.label} font-medium text-amber-300`}>
            No winner in {formatMonth(lastDraw)} — jackpot rolls over!
          </p>
        </div>
      )}

      {!isRollover && (
        <p className={`${sizeStyles.label} text-slate-500 mt-1`}>
          Match all 5 scores to win the jackpot
        </p>
      )}
    </div>
  )
}
