import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { CreditCard, TrendingUp, UserMinus, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default async function AdminSubscriptionsPage() {
  const supabase = createClient();
  
  // Fetch active subscriptions and lapsed explicitly for tracking MRR safely
  const [{ data: activeData }, { data: lapsedData }, { data: recentSignups }] = await Promise.all([
    supabase.from('profiles').select('*').eq('subscription_status', 'active'),
    supabase.from('profiles').select('*').eq('subscription_status', 'lapsed'),
    // Fetch profiles created entirely this month
    supabase.from('profiles').select('*').gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  ]);

  const active = activeData || [];
  const lapsed = lapsedData || [];
  const newThisMonth = recentSignups || [];
  
  const mrr = active.reduce((sum, p) => {
    if (p.subscription_plan === 'monthly') return sum + 9.99;
    if (p.subscription_plan === 'yearly') return sum + (99.99 / 12);
    return sum;
  }, 0);

  // A basic combination list of all subscriptions for the table
  const allSubs = [...active, ...lapsed].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <PageHeader title="Subscription Management" subtitle="Track MRR, churn, and manage active billings" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Subscriptions" value={active.length} icon={<UserCheck size={20}/>} />
        <StatCard title="Total MRR" value={`€${mrr.toFixed(2)}`} icon={<TrendingUp size={20}/>} />
        <StatCard title="Churn (Lapsed)" value={lapsed.length} icon={<UserMinus size={20}/>} />
        <StatCard title="New This Month" value={newThisMonth.length} icon={<CreditCard size={20}/>} />
      </div>

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
          <h3 className="text-white font-medium">All Monitored Accounts</h3>
          {/* Real search handles natively via API; mapped here stylistically for visual spec */}
          <input type="text" placeholder="Search accounts..." className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 w-64"/>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-[#1E293B] border-b border-slate-800">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-300">Subscriber Name</th>
                <th className="px-6 py-3 font-medium text-slate-300">Plan</th>
                <th className="px-6 py-3 font-medium text-slate-300 text-center">Status</th>
                <th className="px-6 py-3 font-medium text-slate-300">Registration</th>
                <th className="px-6 py-3 font-medium text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allSubs.map(s => (
                <tr key={s.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="px-6 py-3">
                    <span className="text-white font-medium block">{s.full_name}</span>
                    <span className="text-xs">{s.email}</span>
                  </td>
                  <td className="px-6 py-3 capitalize">{s.subscription_plan}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                      {s.subscription_status}
                    </span>
                  </td>
                  <td className="px-6 py-3">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition-colors font-medium border border-slate-700">
                      View Profile
                    </button>
                    {/* Simulated view in stripe */}
                    <a href="#" className="ml-2 text-xs text-blue-400 hover:text-blue-300 inline-block align-middle">
                      Stripe ↗
                    </a>
                  </td>
                </tr>
              ))}
              {allSubs.length === 0 && (
                <tr className="border-b border-slate-800">
                  <td colSpan={5} className="py-12 text-center text-slate-500">No subscriptions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
