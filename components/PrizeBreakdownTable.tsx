import { PrizePool } from '@/types'
import { cn } from '@/lib/utils'

interface PrizeBreakdownTableProps {
  pool: PrizePool
  /** If true, render in a compact variant (used inside draw cards) */
  compact?: boolean
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value)
}

export default function PrizeBreakdownTable({ pool, compact = false }: PrizeBreakdownTableProps) {
  const tiers = [
    {
      key: '5-match',
      label: '5-Number Match',
      emoji: '🏆',
      pool: pool.five_match_pool,
      winners: pool.five_match_winners,
      payout: pool.five_match_payout,
      isJackpot: true,
      rolledOver: pool.five_match_winners === 0,
    },
    {
      key: '4-match',
      label: '4-Number Match',
      emoji: '🥈',
      pool: pool.four_match_pool,
      winners: pool.four_match_winners,
      payout: pool.four_match_payout,
      isJackpot: false,
      rolledOver: false,
    },
    {
      key: '3-match',
      label: '3-Number Match',
      emoji: '🥉',
      pool: pool.three_match_pool,
      winners: pool.three_match_winners,
      payout: pool.three_match_payout,
      isJackpot: false,
      rolledOver: false,
    },
  ]

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80">
            <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-widest">Tier</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-widest">Pool</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-widest">Winners</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-widest">Per Winner</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {tiers.map((tier) => (
            <tr
              key={tier.key}
              className={cn(
                'transition-colors',
                tier.isJackpot
                  ? 'bg-brand-blue/5 hover:bg-brand-blue/10'
                  : 'bg-slate-900/40 hover:bg-slate-800/40'
              )}
            >
              {/* Tier label */}
              <td className={cn('px-4 font-semibold', compact ? 'py-2.5' : 'py-3.5')}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{tier.emoji}</span>
                  <span className={tier.isJackpot ? 'text-brand-blue' : 'text-slate-200'}>
                    {tier.label}
                  </span>
                  {tier.isJackpot && pool.jackpot_carry_in > 0 && (
                    <span className="text-xs font-normal text-brand-blue/70 ml-1">
                      +{formatEur(pool.jackpot_carry_in)} carry-in
                    </span>
                  )}
                </div>
              </td>

              {/* Pool amount */}
              <td className={cn('px-4 text-right tabular-nums', compact ? 'py-2.5' : 'py-3.5',
                tier.isJackpot ? 'text-brand-blue font-bold' : 'text-slate-300')}>
                {formatEur(tier.pool)}
              </td>

              {/* Winners count */}
              <td className={cn('px-4 text-right tabular-nums', compact ? 'py-2.5' : 'py-3.5')}>
                <span className={cn(
                  'inline-flex items-center justify-center min-w-[2rem] rounded-full px-2 py-0.5 text-xs font-semibold',
                  tier.winners > 0
                    ? 'bg-brand-green/20 text-brand-green ring-1 ring-brand-green/30'
                    : 'bg-slate-800 text-slate-500'
                )}>
                  {tier.winners}
                </span>
              </td>

              {/* Per-winner payout */}
              <td className={cn('px-4 text-right tabular-nums font-semibold', compact ? 'py-2.5' : 'py-3.5')}>
                {tier.rolledOver ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Rolled over
                  </span>
                ) : tier.winners === 0 ? (
                  <span className="text-slate-600 text-xs">—</span>
                ) : (
                  <span className="text-brand-green">
                    {formatEur(tier.payout)}
                    {tier.winners > 1 && (
                      <span className="text-slate-500 font-normal ml-1 text-xs">each</span>
                    )}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>

        {/* Footer: total pool summary */}
        {!compact && (
          <tfoot>
            <tr className="border-t border-slate-700 bg-slate-900/80">
              <td colSpan={2} className="px-4 py-3 text-xs text-slate-500">
                Total pool:{' '}
                <span className="text-slate-300 font-semibold">
                  {formatEur(pool.prize_pool_total)}
                </span>
                {pool.jackpot_carry_in > 0 && (
                  <span className="ml-2 text-brand-blue/70">
                    (incl. {formatEur(pool.jackpot_carry_in)} jackpot carry-in)
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-xs text-slate-500">
                {pool.five_match_winners + pool.four_match_winners + pool.three_match_winners} total winners
              </td>
              <td className="px-4 py-3 text-right text-xs">
                {pool.jackpot_carry_out > 0 && (
                  <span className="text-amber-400 font-medium text-xs">
                    {formatEur(pool.jackpot_carry_out)} →
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
