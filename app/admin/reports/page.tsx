import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import { DownloadCloud } from 'lucide-react';

export default async function AdminReportsPage() {
  const supabase = createClient();
  
  // We'll hydrate the actual Recharts via a client component or mock visually for the static layouts.
  // The structure specifically requested:
  // 1. User Growth (Line + Table)
  // 2. Revenue (Bar + Total MRR Array)
  // 3. Prize Pools (Growth Chart Embed + Ledger)
  // 4. Charity Impact (Bar + Stats)

  const [
    { count: users },
    { data: MRR_Accounts },
    { data: charities }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('subscription_plan').eq('subscription_status', 'active'),
    supabase.from('charities').select('name, total_raised').order('total_raised', { ascending: false }).limit(5)
  ]);

  const rawMrr = MRR_Accounts?.reduce((sum, a) => sum + (a.subscription_plan === 'yearly' ? 99.99/12 : 9.99), 0) || 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="Aggregate macros on platform performance, users, and financials."
      />

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-8">
         <div className="flex justify-between items-center mb-6">
            <div>
               <h3 className="text-white font-bold text-lg">1. Volume & Trajectory</h3>
               <p className="text-slate-400 text-sm">Mapping subscriber ingress and generic adoption</p>
            </div>
            <button className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition">
              <DownloadCloud className="w-4 h-4"/> CSV Data
            </button>
         </div>
         <div className="h-72 border border-dashed border-slate-700 rounded-lg flex items-center justify-center bg-slate-900/50 mb-6">
            <span className="text-slate-500 font-mono text-sm">[Recharts: User Growth Line Mapping]</span>
         </div>
         <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
               <span className="block text-slate-400 text-sm mb-1">Total Verified Volumes</span>
               <span className="text-3xl font-bold text-white">{users}</span>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
               <span className="block text-slate-400 text-sm mb-1">Active Recurring Nodes</span>
               <span className="text-3xl font-bold text-emerald-400">{MRR_Accounts?.length || 0}</span>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
               <span className="block text-slate-400 text-sm mb-1">Conversion Velocity</span>
               <span className="text-3xl font-bold text-blue-400">{users && MRR_Accounts ? Math.round((MRR_Accounts.length / users)*100) : 0}%</span>
            </div>
         </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-8">
         <div className="flex justify-between items-center mb-6">
            <div>
               <h3 className="text-white font-bold text-lg">2. Financial Reporting</h3>
               <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-bold inline-block mt-2">Active MRR: €{rawMrr.toFixed(2)}</span>
            </div>
            <button className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition">
              <DownloadCloud className="w-4 h-4"/> CSV Export
            </button>
         </div>
         <div className="h-72 border border-dashed border-slate-700 rounded-lg flex items-center justify-center bg-slate-900/50">
            <span className="text-slate-500 font-mono text-sm">[Recharts: Monthly Subscription Revenue Bars]</span>
         </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-8">
         <div className="flex justify-between items-center mb-6">
            <div>
               <h3 className="text-white font-bold text-lg">3. Vaults & Algorithms</h3>
               <p className="text-slate-400 text-sm">Tracking systemic pool escalations and draw velocities.</p>
            </div>
         </div>
         <div className="h-72 border border-dashed border-slate-700 rounded-lg flex items-center justify-center bg-slate-900/50">
            <span className="text-slate-500 font-mono text-sm">[Embed: PoolGrowthChart from Set 5]</span>
         </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-8">
         <div className="flex justify-between items-center mb-6">
            <div>
               <h3 className="text-white font-bold text-lg">4. Charity Transmissions</h3>
               <p className="text-slate-400 text-sm">Macro flow analysis of system dispersion to organizations.</p>
            </div>
         </div>
         <div className="flex flex-col lg:flex-row gap-8">
           <div className="flex-1 h-72 border border-dashed border-slate-700 rounded-lg flex items-center justify-center bg-slate-900/50">
              <span className="text-slate-500 font-mono text-sm">[Recharts: Radial Transmissions]</span>
           </div>
           <div className="w-full lg:w-1/3">
              <h4 className="text-slate-300 font-medium mb-4">Highest Allocations (All Time)</h4>
              <div className="space-y-4">
                 {charities?.map((c, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-800/30 p-3 rounded border border-slate-700/50">
                       <span className="text-white text-sm truncate pr-4">{i+1}. {c.name}</span>
                       <span className="font-mono text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded">€{c.total_raised}</span>
                    </div>
                 ))}
              </div>
           </div>
         </div>
      </div>

    </div>
  );
}
