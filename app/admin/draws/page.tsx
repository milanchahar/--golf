import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { Plus, Settings2 } from 'lucide-react';

export default async function AdminDrawsPage() {
  const supabase = createClient();
  const { data: draws } = await supabase.from('draws').select('*').order('created_at', { ascending: false });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Draw Management" 
        subtitle="Create, simulate, and publish monthly results" 
        action={
           <Link href="/admin/draws/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
             <Plus className="w-4 h-4"/> Create New Draw
           </Link>
        }
      />

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden">
         <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-[#1E293B] border-b border-slate-800">
               <tr>
                 <th className="px-6 py-4 font-medium text-slate-300">Target Month</th>
                 <th className="px-6 py-4 font-medium text-slate-300">Status</th>
                 <th className="px-6 py-4 font-medium text-slate-300">Draw Type</th>
                 <th className="px-6 py-4 font-medium text-slate-300">Numbers</th>
                 <th className="px-6 py-4 font-medium text-slate-300">Created / Published</th>
                 <th className="px-6 py-4 font-medium text-slate-300 text-right">Actions</th>
               </tr>
            </thead>
            <tbody>
               {draws?.map(draw => (
                 <tr key={draw.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white text-base tracking-wide flex items-center gap-2">
                       {draw.draw_month}
                       {draw.jackpot_carried_over && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-sans uppercase">Rollover+</span>}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize border ${
                         draw.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                         draw.status === 'simulated' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                         'bg-slate-800 text-slate-400 border-slate-700'
                       }`}>
                         {draw.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 capitalize">{draw.draw_type}</td>
                    <td className="px-6 py-4">
                       {draw.drawn_numbers && draw.drawn_numbers.length === 5 ? (
                          <div className="flex gap-1">
                             {draw.drawn_numbers.map((n: number, i: number) => (
                               <span key={i} className={`w-6 h-6 rounded-full flex flex-col items-center justify-center text-xs font-bold font-mono shadow-inner ${n > 0 ? 'bg-gradient-to-br from-white to-slate-300 text-slate-900 border border-slate-400' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                 {n}
                               </span>
                             ))}
                          </div>
                       ) : (
                          <span className="text-slate-500 italic">Not drawn</span>
                       )}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                       <div className="text-xs">C: {new Date(draw.created_at).toLocaleDateString()}</div>
                       <div className="text-xs">P: {draw.published_at ? new Date(draw.published_at).toLocaleDateString() : '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link href={`/admin/draws/${draw.id}`} className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition-colors text-xs font-medium">
                          <Settings2 className="w-3.5 h-3.5"/> Control Panel
                       </Link>
                    </td>
                 </tr>
               ))}
               {draws?.length === 0 && (
                 <tr>
                   <td colSpan={6} className="py-12 text-center text-slate-500">No draws exist in the system yet.</td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
