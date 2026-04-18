import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function AdminDrawControlPanelPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: draw } = await supabase.from('draws').select('*').eq('id', params.id).single();
  if (!draw) notFound();

  // Load prize pool mapping directly
  const { data: pool } = await supabase.from('prize_pools').select('*').eq('draw_id', draw.id).single();

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <Link href="/admin/draws" className="text-sm text-blue-400 hover:text-blue-300 inline-block mb-2">← Back to Draws</Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <PageHeader title={`Draw Control Panel`} subtitle={`Managing ${draw.draw_month} parameters`} />
        <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider border ${
           draw.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
           'bg-amber-500/10 text-amber-500 border-amber-500/20'
        }`}>
           STATUS: {draw.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section A - Configuration */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 space-y-6 flex flex-col justify-between">
           <div>
              <h3 className="text-white font-bold text-lg mb-2">A. Draw Configuration</h3>
              <p className="text-sm text-slate-400 mb-6">Setup mechanical settings before simulation.</p>

              <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg mb-4">
                 <span className="text-slate-300 font-medium text-sm">Draw Engine Strategy</span>
                 <div className="bg-slate-900 border border-slate-700 rounded-lg p-1 flex">
                    <button className={`px-4 py-1.5 rounded-md text-xs font-semibold ${draw.draw_type === 'random' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Random</button>
                    <button className={`px-4 py-1.5 rounded-md text-xs font-semibold ${draw.draw_type === 'algorithmic' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Algorithmic</button>
                 </div>
              </div>
              
              <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg">
                 <div>
                    <span className="text-slate-300 font-medium text-sm block">Prize Pool Builder</span>
                    <span className="text-xs text-slate-500">Recalculates based on current subs and carry-over.</span>
                 </div>
                 {pool ? (
                    <span className="text-emerald-400 text-sm font-bold">€{pool.prize_pool_total} Generated</span>
                 ) : (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap">
                       Calculate Pool
                    </button>
                 )}
              </div>
           </div>
        </div>

        {/* Section B - Simulation */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 relative overflow-hidden">
           <h3 className="text-white font-bold text-lg mb-2">B. Simulation Mode</h3>
           <p className="text-sm text-slate-400 mb-6">Test the draw distribution safely. No records will be finalized.</p>

           {draw.status !== 'published' ? (
              <div className="space-y-4">
                 <button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-sm">
                   Run Database Simulation
                 </button>
                 
                 {draw.status === 'simulated' && (
                   <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-4">
                      {/* Sim results mock view */}
                      <div className="flex justify-between items-center">
                         <span className="text-white font-medium text-sm">Simulated Numbers</span>
                         <div className="flex gap-1">
                            {draw.drawn_numbers?.map((n: number, i: number) => <span key={i} className="w-5 h-5 rounded-full bg-slate-300 text-slate-900 border border-slate-400 flex items-center justify-center font-bold text-xs">{n}</span>)}
                         </div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                        <span>5-Match Winners: Muted</span>
                        <span>Jackpot Status: Carry Out</span>
                      </div>
                      <button className="text-xs text-blue-400 underline mt-2 block mx-auto">Re-Run Simulation</button>
                   </div>
                 )}
              </div>
           ) : (
              <div className="text-center p-6 bg-slate-800/30 border border-slate-700 rounded-lg text-slate-500">
                 Simulation is disabled for published draws.
              </div>
           )}
        </div>

      </div>
      
      {/* Section C & D */}
      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-800 pb-6">
            <div>
               <h3 className="text-white font-bold text-lg mb-1">C. Publication & Distribution</h3>
               <p className="text-sm text-slate-400">Lock the draw, generate entry results, and dispatch official emails.</p>
            </div>
            {draw.status !== 'published' ? (
               <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20 whitespace-nowrap">
                 Publish Official Draw
               </button>
            ) : (
               <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20 whitespace-nowrap">
                 Send Winner Notifications
               </button>
            )}
         </div>

         <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-bold text-md mb-2">D. Final Results Ledger</h4>
              <button className="text-xs text-slate-400 border border-slate-600 px-3 py-1.5 rounded hover:text-white transition-colors">Export CSV</button>
            </div>
            {draw.status === 'published' ? (
               <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-500 text-sm">
                  Participant tables mapped here.
               </div>
            ) : (
               <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-lg p-8 text-center text-slate-500 text-sm">
                  Ledger generates upon final publication.
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
