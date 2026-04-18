import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';
import PageHeader from '@/components/PageHeader';
import WinnerStatusCard from '@/components/WinnerStatusCard';
import EmptyState from '@/components/EmptyState';
import { Trophy, Clock, CheckCircle } from 'lucide-react';

export default async function DashboardWinningsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return null;

  // 1. Fetch user's winning draw entries
  const { data: winningEntries } = await supabase
    .from('draw_entries')
    .select('id, prize_tier, prize_amount, is_winner, draws(id, draw_month)')
    .eq('user_id', user.id)
    .eq('is_winner', true)
    .order('created_at', { ascending: false });

  // 2. Fetch verifications mapped to draw entries
  const { data: verifications } = await supabase
    .from('winner_verifications')
    .select('*')
    .eq('user_id', user.id);

  const totalWon = winningEntries?.reduce((sum, e) => sum + (e.prize_amount || 0), 0) || 0;
  
  const pendingAmount = verifications?.filter(v => v.payment_status === 'pending')
    .reduce((sum, v) => sum + (winningEntries?.find(e => e.id === v.draw_entry_id)?.prize_amount || 0), 0) || 0;

  const paidAmount = verifications?.filter(v => v.payment_status === 'paid')
    .reduce((sum, v) => sum + (winningEntries?.find(e => e.id === v.draw_entry_id)?.prize_amount || 0), 0) || 0;

  const needsVerificationCount = winningEntries?.filter(e => !verifications?.some(v => v.draw_entry_id === e.id)).length || 0;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <PageHeader title="My Winnings" subtitle="View and claim your jackpot prizes from monthly draws" />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-5">
           <span className="text-slate-400 text-xs block mb-1">Total Won (All Time)</span>
           <span className="text-white text-2xl font-bold font-mono">€{totalWon.toFixed(2)}</span>
        </div>
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-5">
           <span className="text-slate-400 text-xs block mb-1">Draws Won</span>
           <span className="text-white text-2xl font-bold font-mono">{winningEntries?.length || 0}</span>
        </div>
        <div className="bg-[#1E293B] border border-amber-500/30 rounded-xl p-5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10"><Clock className="w-10 h-10 text-amber-500" /></div>
           <span className="text-amber-400 text-xs block mb-1 relative z-10">Pending Payment</span>
           <span className="text-amber-400 text-2xl font-bold font-mono relative z-10">€{pendingAmount.toFixed(2)}</span>
        </div>
        <div className="bg-[#1E293B] border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10"><CheckCircle className="w-10 h-10 text-emerald-500" /></div>
           <span className="text-emerald-400 text-xs block mb-1 relative z-10">Total Paid Out</span>
           <span className="text-emerald-400 text-2xl font-bold font-mono relative z-10">€{paidAmount.toFixed(2)}</span>
        </div>
      </div>

      {needsVerificationCount > 0 && (
        <div className="bg-blue-600 border border-blue-500 rounded-xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-500/20">
           <div>
              <h3 className="font-bold text-lg">You have {needsVerificationCount} unverified win{needsVerificationCount > 1 ? 's' : ''}!</h3>
              <p className="text-blue-200 text-sm">Please upload your proof below to claim your prize.</p>
           </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Winning History</h3>
        
        {winningEntries && winningEntries.length > 0 ? (
          <div className="space-y-4">
            {winningEntries.map(entry => {
               const v = verifications?.find(v => v.draw_entry_id === entry.id);
               return (
                 <WinnerStatusCard 
                   key={entry.id}
                   userId={user.id}
                   prediction={{
                     id: entry.id,
                     draw_month: entry.draws?.draw_month || 'Unknown',
                     prize_tier: entry.prize_tier as any,
                     prize_amount: entry.prize_amount || 0,
                     is_winner: entry.is_winner
                   }}
                   verification={v}
                 />
               );
            })}
          </div>
        ) : (
          <EmptyState 
            icon={<Trophy className="w-8 h-8" />}
            heading="You haven't won yet"
            description="Keep logging your golf scores each month to be eligible for the jackpot!"
          />
        )}
      </div>

    </div>
  );
}
