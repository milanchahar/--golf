'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface DrawBallsProps {
  /** The 5 drawn numbers to display */
  drawnNumbers: number[]
  /** User's own scores — these highlight when they intersect with drawn numbers */
  userScores?: number[]
  /** Override ball size in pixels (default: 52) */
  ballSize?: number
}

/**
 * Renders 5 lottery-style balls with staggered drop-in animations.
 * Balls matching the user's scores glow in the brand accent colour.
 */
export default function DrawBalls({ drawnNumbers, userScores = [], ballSize = 52 }: DrawBallsProps) {
  const [visible, setVisible] = useState<boolean[]>(drawnNumbers.map(() => false))

  const matchSet = new Set(userScores)

  useEffect(() => {
    // Staggered entrance — each ball becomes visible 120ms after the previous
    const timers: ReturnType<typeof setTimeout>[] = []
    drawnNumbers.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisible((prev) => {
            const next = [...prev]
            next[i] = true
            return next
          })
        }, i * 120)
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [drawnNumbers])

  return (
    <div className="flex items-center gap-2.5 flex-wrap" role="list" aria-label="Drawn lottery balls">
      {drawnNumbers.map((num, i) => {
        const isMatch = matchSet.has(num)
        return (
          <div
            key={`${num}-${i}`}
            role="listitem"
            aria-label={`Ball ${num}${isMatch ? ', matched' : ''}`}
            className={cn(
              'relative inline-flex items-center justify-center rounded-full font-black tabular-nums text-sm select-none transition-all',
              // Drop-in animation
              'transition-[opacity,transform] duration-500',
              visible[i]
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-4',
              // Matching vs non-matching ball styles
              isMatch
                ? [
                    'text-white',
                    'shadow-lg shadow-brand-blue/40',
                    'ring-2 ring-brand-blue/80',
                    'bg-gradient-to-br from-brand-blue to-blue-500',
                  ]
                : [
                    'text-slate-300',
                    'ring-1 ring-slate-700',
                    'bg-gradient-to-br from-slate-800 to-slate-700',
                  ]
            )}
            style={{ width: ballSize, height: ballSize, fontSize: ballSize * 0.32 }}
          >
            {num}
            {/* Match sparkle dot */}
            {isMatch && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-green ring-2 ring-slate-950 animate-pulse" />
            )}
          </div>
        )
      })}
    </div>
  )
}
