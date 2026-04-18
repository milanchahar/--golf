import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { Plus, Edit3 } from 'lucide-react';

export default async function AdminCharitiesPage() {
  const supabase = createClient();
  const { data: charities } = await supabase.from('charities').select('*, charity_events(count)').order('created_at', { ascending: false });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Charity Roster" 
        subtitle="Manage supported organizational profiles" 
        action={
           <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
             <Plus className="w-4 h-4"/> Add New Charity
           </button>
        }
      />

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden">
         <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-[#1E293B] border-b border-slate-800">
               <tr>
                 <th className="px-6 py-4 font-medium text-slate-300 w-16">Icon</th>
                 <th className="px-6 py-4 font-medium text-slate-300">Charity Profile</th>
                 <th className="px-6 py-4 font-medium text-slate-300">Total Raised</th>
                 <th className="px-6 py-4 font-medium text-slate-300">Active Events</th>
                 <th className="px-6 py-4 font-medium text-slate-300">Visibility</th>
                 <th className="px-6 py-4 font-medium text-slate-300 text-right">Actions</th>
               </tr>
            </thead>
            <tbody>
               {charities?.map(c => (
                 <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      {c.logo_url ? <img src={c.logo_url} className="w-10 h-10 rounded-full object-cover bg-slate-800 border border-slate-700"/> : <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-dashed border-slate-700"/>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium block whitespace-nowrap">{c.name}</span>
                      <span className="text-xs">/{c.slug}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400 font-mono tracking-wide">€{c.total_raised}</td>
                    <td className="px-6 py-4 font-mono">{c.charity_events[0]?.count || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c.is_active ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>{c.is_active ? 'Active' : 'Disabled'}</span>
                        {c.is_featured && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500">Featured</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link href={`/admin/charities/${c.id}`} className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition-colors text-xs font-medium">
                          <Edit3 className="w-3.5 h-3.5"/> Edit
                       </Link>
                    </td>
                 </tr>
               ))}
               {charities?.length === 0 && (
                 <tr>
                   <td colSpan={6} className="py-12 text-center text-slate-500">No charities added to the system yet.</td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
