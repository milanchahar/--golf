import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import AdminPrizePoolPanel from '@/components/AdminPrizePoolPanel';

export default async function AdminPrizePoolsPage() {
  const supabase = createClient();
  const { data: pools } = await supabase.from('prize_pools').select('*').order('created_at', { ascending: false });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <PageHeader title="Prize Pool Management" subtitle="System pool aggregations and historical logs" />

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden">
         <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-[#1E293B] border-b border-slate-800">
               <tr>
                 <th className="px-6 py-4 font-medium text-slate-300">Target Month</th>
                 <th className="px-6 py-4 font-medium text-slate-300">Net Pool</th>
                 <th className="px-6 py-4 font-medium text-emerald-400">5-Match Pool</th>
                 <th className="px-6 py-4 font-medium text-blue-400">4-Match Pool</th>
                 <th className="px-6 py-4 font-medium text-slate-300">3-Match Pool</th>
                 <th className="px-6 py-4 font-medium text-amber-500">Carry In</th>
                 <th className="px-6 py-4 font-medium text-amber-500 text-right">Run-off</th>
               </tr>
            </thead>
            <tbody>
               {pools?.map(pool => (
                 <tr key={pool.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white tracking-wide">{pool.draw_month}</td>
                    <td className="px-6 py-4 font-mono bg-slate-800/40 border-x border-slate-800">€{pool.prize_pool_total}</td>
                    <td className="px-6 py-4 font-mono text-emerald-300">€{pool.five_match_pool}</td>
                    <td className="px-6 py-4 font-mono text-blue-300">€{pool.four_match_pool}</td>
                    <td className="px-6 py-4 font-mono text-slate-300">€{pool.three_match_pool}</td>
                    <td className="px-6 py-4 font-mono text-amber-400 bg-amber-500/5 w-24">€{pool.jackpot_carry_in}</td>
                    <td className="px-6 py-4 font-mono text-amber-400 bg-amber-500/5 text-right w-24">€{pool.jackpot_carry_out}</td>
                 </tr>
               ))}
            </tbody>
         </table>
         {pools?.length === 0 && (
           <div className="p-12 text-center text-slate-500">No pools generated yet. Calculations run automatically via draw manager actions.</div>
         )}
      </div>

    </div>
  );
}
