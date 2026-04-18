import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { ShieldCheck, Search } from 'lucide-react';

export default async function AdminWinnersPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = createClient();
  const status = searchParams.status || '';

  let query = supabase.from('winner_verifications').select('*, profiles(full_name, email), draws(draw_month)').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);

  const { data: verifications } = await query;
  
  const tabs = [
    { label: 'All', value: '' },
    { label: 'Pending Review', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <PageHeader title="Winner Validation" subtitle="Ensure competitive integrity by analyzing structural evidence" />

      <div className="flex border-b border-slate-800 mb-6 overflow-x-auto hide-scrollbar">
         {tabs.map(tab => (
           <Link 
             key={tab.label} 
             href={tab.value ? `/admin/winners?status=${tab.value}` : '/admin/winners'}
             className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${status === tab.value ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
           >
             {tab.label}
           </Link>
         ))}
      </div>

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-x-auto">
         <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-[#1E293B] border-b border-slate-800">
               <tr>
                 <th className="px-6 py-4 font-medium text-slate-300">Player</th>
                 <th className="px-6 py-4 font-medium text-slate-300">Draw Association</th>
                 <th className="px-6 py-4 font-medium text-slate-300">Evidence</th>
                 <th className="px-6 py-4 font-medium text-slate-300 text-center">Status</th>
                 <th className="px-6 py-4 font-medium text-slate-300 text-center">Disbursement</th>
                 <th className="px-6 py-4 font-medium text-slate-300 text-right">Triage</th>
               </tr>
            </thead>
            <tbody>
               {verifications?.map(v => (
                 <tr key={v.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <span className="text-white font-medium block">{v.profiles?.full_name}</span>
                      <span className="text-xs">{v.profiles?.email}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300 uppercase">{v.draws?.draw_month}</td>
                    <td className="px-6 py-4">
                      <a href={v.proof_image_url} target="_blank" className="text-blue-400 text-xs hover:underline inline-flex items-center gap-1"><Search className="w-3 h-3"/> View Asset</a>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${v.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : v.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                         {v.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {v.status === 'approved' ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${v.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                            {v.payment_status}
                          </span>
                       ) : (
                          <span className="text-slate-600">-</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors text-xs font-medium border border-blue-500">
                          <ShieldCheck className="w-3.5 h-3.5"/> Evaluate
                       </button>
                    </td>
                 </tr>
               ))}
               {verifications?.length === 0 && (
                 <tr>
                   <td colSpan={6} className="py-12 text-center text-slate-500">No validations mapped in this scope.</td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
