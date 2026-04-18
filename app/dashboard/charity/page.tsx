import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';
import PageHeader from '@/components/PageHeader';
import CharityWidget from '@/components/CharityWidget';
import Link from 'next/link';

export default async function DashboardCharityPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, charities(*)')
    .eq('id', user.id)
    .single();

  const { data: contributions } = await supabase
    .from('charity_contributions')
    .select('*, charities(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: allCharities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      <PageHeader title="Charity Center" subtitle="Manage your monthly contributions and independent donations" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <CharityWidget 
           charityId={profile?.selected_charity_id}
           charityName={profile?.charities?.name || ''}
           charityLogo={profile?.charities?.logo_url || ''}
           contributionPercent={profile?.charity_contribution_percent || 10}
           monthlyEstimate={profile?.subscription_plan === 'yearly' ? (99.99/12) * ((profile?.charity_contribution_percent||10)/100) : 9.99 * ((profile?.charity_contribution_percent||10)/100)}
         />
         
         <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-center text-center items-center">
            <h3 className="text-white font-medium mb-2">Want to give more?</h3>
            <p className="text-sm text-slate-400 mb-6">Make a direct, one-time donation to any of our listed charities independent of your subscription.</p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Make One-Time Donation
            </button>
         </div>
      </div>

      <div className="space-y-4">
         <h3 className="text-lg font-semibold text-white">Your Contribution History</h3>
         {contributions && contributions.length > 0 ? (
           <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-400">
                  <thead className="text-xs text-slate-300 uppercase bg-slate-800/50 border-b border-slate-700/50">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Charity</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map((c) => (
                      <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-white font-medium">{c.charities?.name}</td>
                        <td className="px-6 py-4 capitalize">{c.contribution_type}</td>
                        <td className="px-6 py-4 text-right text-emerald-400 font-medium">€{c.amount}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           </div>
         ) : (
           <div className="bg-[#1E293B] border border-dashed border-slate-700 p-8 rounded-xl text-center">
              <p className="text-slate-400 text-sm">No contributions found yet. Your first contribution will be recorded when your subscription renews.</p>
           </div>
         )}
      </div>

      <div className="space-y-4 pt-4">
         <h3 className="text-lg font-semibold text-white">Choose a Different Charity</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {allCharities?.filter(c => c.id !== profile?.selected_charity_id).map(charity => (
              <div key={charity.id} className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-4 flex flex-col items-center text-center">
                 {charity.logo_url ? (
                   <img src={charity.logo_url} className="w-12 h-12 rounded-full mb-3 object-cover"/>
                 ) : (
                   <div className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-800 mb-3"/>
                 )}
                 <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1">{charity.name}</h4>
                 <Link href={`/charities/${charity.slug}`} className="text-xs text-blue-400 hover:text-blue-300">
                    View profile
                 </Link>
                 <button className="mt-4 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded w-full transition-colors">
                    Select
                 </button>
              </div>
           ))}
         </div>
      </div>
    </div>
  );
}
