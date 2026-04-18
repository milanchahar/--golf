import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';
import StatCard from '@/components/StatCard';
import CharityWidget from '@/components/CharityWidget';
import JackpotCounter from '@/components/JackpotCounter';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { CreditCard, Activity, Target, Trophy, Info } from 'lucide-react';

export default async function DashboardOverview() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, charities(*)')
    .eq('id', user.id)
    .single();

  const { count: scoreCount, data: scores } = await supabase
    .from('golf_scores')
    .select('score', { count: 'exact' })
    .eq('user_id', user.id)
    .order('score_date', { ascending: false })
    .limit(5);

  const { data: verifications } = await supabase
    .from('winner_verifications')
    .select('*, draws(draw_month, draws(*, draw_entries(*)))')
    .eq('user_id', user.id);

  // Derive latest draw info roughly
  const { data: latestDraw } = await supabase
    .from('draw_entries')
    .select('is_winner, prize_tier, prize_amount, draws(draw_month)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const totalWon = verifications?.reduce((sum, v) => sum + (v.draws?.draw_entries?.[0]?.prize_amount || 0), 0) || 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <PageHeader title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Golfer'}`} subtitle="Here's what's happening with your account today" />
      
      {profile?.subscription_status !== 'active' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8 flex items-start gap-4">
           <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
           <div>
             <h4 className="text-blue-400 font-semibold mb-1">Your subscription is inactive</h4>
             <p className="text-blue-200/70 text-sm mb-3">To be eligible for draws and maintain your charity contributions, please activate your plan.</p>
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
               Activate Subscription
             </button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Subscription Card */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-between">
           <div>
             <div className="flex items-center gap-2 mb-4">
               <CreditCard className="text-slate-400 w-5 h-5" />
               <h3 className="text-white font-medium">Subscription</h3>
             </div>
             <p className="text-2xl font-bold text-white mb-1 capitalize">
               {profile?.subscription_plan || 'No Plan'}
             </p>
             <span className={`text-xs px-2 py-0.5 rounded-full inline-block font-medium ${profile?.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {profile?.subscription_status}
             </span>
           </div>
           {profile?.subscription_renewal_date && profile.subscription_status === 'active' && (
             <div className="mt-6 pt-4 border-t border-slate-700/50">
               <p className="text-xs text-slate-400">Renews on {new Date(profile.subscription_renewal_date).toLocaleDateString()}</p>
             </div>
           )}
        </div>

        {/* Score Summary */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-between">
           <div>
             <div className="flex items-center gap-2 mb-4">
               <Activity className="text-blue-400 w-5 h-5" />
               <h3 className="text-white font-medium">Score Profile</h3>
             </div>
             <div className="flex items-end gap-2 mb-1">
               <p className="text-3xl font-bold text-white">{scoreCount || 0}</p>
               <span className="text-slate-400 text-sm mb-1 pb-0.5">/ 5 logged</span>
             </div>
             
             {scores && scores.length > 0 ? (
               <div className="flex gap-1 mt-3">
                 {/* Dummy representation of scores sparkline/badges */}
                 {scores.slice(0,5).map((s, i) => (
                    <div key={i} className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-300 font-mono">
                      {s.score}
                    </div>
                 ))}
               </div>
             ) : (
                <p className="text-sm text-slate-500 mt-2">Log scores to become eligible</p>
             )}
           </div>
           <Link href="/dashboard/scores" className="mt-6 text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
             Manage Scores <span className="text-lg leading-none">→</span>
           </Link>
        </div>

        {/* Charity Widget */}
        <CharityWidget 
           charityId={profile?.selected_charity_id}
           charityName={profile?.charities?.name || ''}
           charityLogo={profile?.charities?.logo_url || ''}
           contributionPercent={profile?.charity_contribution_percent || 10}
           monthlyEstimate={profile?.subscription_plan === 'yearly' ? (99.99/12) * ((profile?.charity_contribution_percent||10)/100) : 9.99 * ((profile?.charity_contribution_percent||10)/100)}
        />
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Live Jackpot Card - Can reuse full JackpotCounter if available, or just a metric card */}
         <div className="bg-gradient-to-br from-emerald-900/40 to-[#1E293B] border border-emerald-500/20 rounded-xl p-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="bg-[#1E293B]/80 backdrop-blur block p-6 rounded-lg h-full relative z-10 flex flex-col justify-center items-center text-center">
                <Target className="w-8 h-8 text-emerald-400 mb-3" />
                <h3 className="text-emerald-400 font-medium mb-1 tracking-wide uppercase text-sm">Next Draw Jackpot</h3>
                {/* Normally we'd fetch actual jackpot value from API, mocked here for layout consistency */}
                <span className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-sm">
                  €500.00
                </span>
                <Link href="/dashboard/draws" className="mt-6 px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium transition-colors">
                   View Draw Details
                </Link>
            </div>
         </div>

         {/* Winnings Overview block */}
         <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="text-amber-400 w-5 h-5" />
                <h3 className="text-white font-medium">My Winnings</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <span className="text-xs text-slate-400 block mb-1">Total Won</span>
                    <span className="text-2xl font-bold text-white">€{totalWon.toFixed(2)}</span>
                 </div>
                 <div>
                    <span className="text-xs text-slate-400 block mb-1">Latest Draw</span>
                    {latestDraw ? (
                      <span className={`text-sm font-medium ${latestDraw.is_winner ? 'text-amber-400' : 'text-slate-400'}`}>
                        {latestDraw.is_winner ? `Won €${latestDraw.prize_amount}` : 'No matches'}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">No draws yet</span>
                    )}
                 </div>
              </div>
            </div>
            
            <Link href="/dashboard/winnings" className="mt-8 text-sm text-amber-400 hover:text-amber-300 transition-colors inline-block w-fit relative z-10">
               Claim or view verifications →
            </Link>
         </div>
      </div>
    </div>
  );
}
