import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { Users, CreditCard, Award, Heart, ClipboardCheck, Timer } from 'lucide-react';
import Link from 'next/link';
import { getCurrentJackpot } from '@/lib/prizePool';

export default async function AdminOverviewPage() {
  const supabaseAdmin = createClient();

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: prizePools },
    { data: charitySumTotal },
    { data: recentSignups },
    { count: pendingVerifications },
    { data: currentDraw }
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabaseAdmin.from('prize_pools').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('charities').select('total_raised'), // Simple sum proxy
    supabaseAdmin.from('profiles').select('id, full_name, email, subscription_plan, created_at').order('created_at', { ascending: false }).limit(10),
    supabaseAdmin.from('winner_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('draws').select('id, draw_month, status, draw_type').eq('status', 'pending').order('created_at', { ascending: false }).limit(1).single()
  ]);

  const currentPoolTotal = prizePools?.[0]?.prize_pool_total || 0;
  const totalCharityRaised = charitySumTotal?.reduce((sum, c) => sum + (c.total_raised || 0), 0) || 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <PageHeader title="Admin Overview" subtitle="System-wide metrics and pending actions" />

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={totalUsers || 0} icon={<Users size={20}/>} />
        <StatCard title="Active Subscribers" value={activeSubscribers || 0} icon={<CreditCard size={20}/>} />
        <StatCard title="Current Prize Pool" value={`€${currentPoolTotal.toFixed(2)}`} icon={<Award size={20}/>} />
        <StatCard title="Total Charity Flow" value={`€${totalCharityRaised.toFixed(2)}`} icon={<Heart size={20}/>} />
      </div>

      {/* Second Row: Fake robust charts via layout containers (Recharts actual built out in reports page securely) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
           <h3 className="text-white font-semibold mb-4">Subscriber Growth (Last 12 Months)</h3>
           <div className="h-64 border border-dashed border-slate-700 rounded flex items-center justify-center text-slate-500">
             [Line Chart Data Component mapped in reports]
           </div>
        </div>
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
           <h3 className="text-white font-semibold mb-4">Plan Distribution</h3>
           <div className="h-64 border border-dashed border-slate-700 rounded flex items-center justify-center text-slate-500">
             [Doughnut Chart]
           </div>
        </div>
      </div>

      {/* Third Row: Actionables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 overflow-hidden">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-white font-semibold">Recent Signups</h3>
             <Link href="/admin/users" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-slate-400">
                <thead className="text-xs text-slate-300 uppercase bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSignups?.map(u => (
                    <tr key={u.id} className="border-b border-slate-800">
                      <td className="px-4 py-3">
                        <span className="text-white font-medium block">{u.full_name}</span>
                        <span className="text-xs">{u.email}</span>
                      </td>
                      <td className="px-4 py-3 capitalize">{u.subscription_plan || 'None'}</td>
                      <td className="px-4 py-3 text-right">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900/40 to-[#1E293B] border border-blue-500/20 rounded-xl p-6 relative overflow-hidden">
             <div className="absolute -right-4 -top-4 opacity-5"><ClipboardCheck className="w-32 h-32 text-blue-500"/></div>
             <h3 className="text-white font-semibold mb-1 relative z-10">Pending Verifications</h3>
             <p className="text-3xl font-bold text-white mb-4 relative z-10">{pendingVerifications || 0}</p>
             <Link href="/admin/winners?status=pending" className="inline-block relative z-10 text-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-4 py-2 rounded-lg font-medium transition-colors">
               Review Now →
             </Link>
          </div>

          <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6">
             <h3 className="text-white font-semibold mb-3">Next Draw Details</h3>
             {currentDraw ? (
                <div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-slate-400 text-sm">Target Month</span>
                     <span className="text-white font-mono">{currentDraw.draw_month}</span>
                   </div>
                   <div className="flex justify-between items-center mb-4">
                     <span className="text-slate-400 text-sm">Status</span>
                     <span className="text-xs font-semibold px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 capitalize">{currentDraw.status}</span>
                   </div>
                   <Link href={`/admin/draws/${currentDraw.id}`} className="block text-center w-full text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-colors">
                     Manage Draw
                   </Link>
                </div>
             ) : (
                <div className="text-center py-4">
                  <Timer className="w-8 h-8 text-slate-600 mx-auto mb-2"/>
                  <span className="text-slate-400 text-sm">No pending draw created</span>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
