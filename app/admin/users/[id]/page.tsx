import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: user } = await supabase.from('profiles').select('*, charities(name)').eq('id', params.id).single();
  const { data: scores } = await supabase.from('golf_scores').select('*').eq('user_id', params.id).order('score_date', { ascending: false });

  if (!user) notFound();

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <Link href="/admin/users" className="text-sm text-blue-400 hover:underline mb-4 inline-block">← Back to Users</Link>
      <PageHeader title={user.full_name || 'Unknown User'} subtitle={user.email} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Profile Card */}
         <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 border-b border-slate-800 pb-2">Profile Integrity</h3>
            <div className="space-y-3 text-sm">
               <div className="flex justify-between">
                 <span className="text-slate-400">Role</span>
                 <span className="text-white capitalize">{user.role}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400">Joined</span>
                 <span className="text-white">{new Date(user.created_at).toLocaleString()}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400">Charity Selection</span>
                 <span className="text-white">{user.charities?.name || 'None'} ({user.charity_contribution_percent}%)</span>
               </div>
               <div className="pt-4 mt-2 border-t border-slate-800">
                 <button className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-2 font-medium transition-colors mb-2">
                   Edit Profile
                 </button>
                 <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg py-2 font-medium transition-colors">
                   Delete Account
                 </button>
               </div>
            </div>
         </div>

         {/* Subscription Card */}
         <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 border-b border-slate-800 pb-2">Subscription Details</h3>
            <div className="space-y-3 text-sm">
               <div className="flex justify-between items-center">
                 <span className="text-slate-400">Status</span>
                 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                    {user.subscription_status}
                 </span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400">Plan</span>
                 <span className="text-white capitalize">{user.subscription_plan || 'None'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400">Renewal Date</span>
                 <span className="text-white">{user.subscription_renewal_date ? new Date(user.subscription_renewal_date).toLocaleDateString() : 'N/A'}</span>
               </div>
               <div className="pt-4 mt-2 border-t border-slate-800">
                 <button className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg py-2 font-medium transition-colors">
                   Suspend Account
                 </button>
               </div>
            </div>
         </div>
      </div>

      {/* Score Editing */}
      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden p-6">
         <div className="flex justify-between items-center mb-4">
           <h3 className="text-white font-semibold">Logged Scores ({scores?.length || 0}/5)</h3>
           <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Admin override enabled</span>
         </div>
         {scores && scores.length > 0 ? (
           <table className="w-full text-left text-sm text-slate-400">
             <thead className="border-b border-slate-800">
               <tr>
                 <th className="py-2">Score</th>
                 <th className="py-2">Date Played</th>
                 <th className="py-2 text-right">Actions</th>
               </tr>
             </thead>
             <tbody>
               {scores.map(s => (
                 <tr key={s.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                   <td className="py-3 text-white font-mono font-bold">{s.score}</td>
                   <td className="py-3">{s.score_date}</td>
                   <td className="py-3 text-right">
                     <button className="text-blue-400 hover:text-blue-300 mr-3">Edit</button>
                     <button className="text-red-400 hover:text-red-300">Remove</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         ) : (
           <div className="text-center py-6 text-slate-500 border border-dashed border-slate-700 rounded-lg">No scores logged yet.</div>
         )}
      </div>

    </div>
  );
}
