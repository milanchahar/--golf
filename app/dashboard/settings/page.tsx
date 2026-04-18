import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';
import PageHeader from '@/components/PageHeader';
import { User, Lock, Bell, CreditCard, Trash2 } from 'lucide-react';

export default async function DashboardSettingsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10">
      <PageHeader title="Account Settings" subtitle="Manage your profile, subscription, and preferences" />

      <div className="space-y-6">
        
        {/* Profile Section */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden flex flex-col md:flex-row">
           <div className="bg-slate-800/30 w-full md:w-1/3 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-700/50">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 mb-3">
                 <User className="w-8 h-8" />
              </div>
              <h3 className="text-white font-medium">Profile</h3>
              <p className="text-xs text-slate-400 mt-1">Your basic account information.</p>
           </div>
           <div className="flex-1 p-6 space-y-4">
              <div>
                 <label className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-1 block">Full Name</label>
                 <input type="text" defaultValue={profile?.full_name || ''} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                 <label className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-1 block">Email Address (Read Only)</label>
                 <input type="text" readOnly defaultValue={profile?.email || ''} className="w-full bg-slate-800/50 cursor-not-allowed border border-slate-700 rounded-lg px-4 py-2 text-slate-500" />
              </div>
              <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Save Profile
              </button>
           </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm">
           <div className="bg-slate-800/30 w-full md:w-1/3 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-700/50">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
                 <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-white font-medium">Subscription</h3>
              <p className="text-xs text-slate-400 mt-1">Manage your billing and plan.</p>
           </div>
           <div className="flex-1 p-6 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                 <div>
                    <span className="text-sm font-bold text-white capitalize block">{profile?.subscription_status === 'active' ? `${profile?.subscription_plan} Plan` : 'No Active Plan'}</span>
                    <span className="text-sm text-slate-400">{profile?.subscription_renewal_date ? `Renews on ${new Date(profile.subscription_renewal_date).toLocaleDateString()}` : 'Please choose a plan to participate in draws'}</span>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-xs font-medium ${profile?.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {profile?.subscription_status === 'active' ? 'Active' : 'Inactive'}
                 </span>
              </div>
              
              <div className="flex gap-3">
                 <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                   {profile?.subscription_status === 'active' ? 'Manage Billing' : 'Upgrade Now'}
                 </button>
                 {profile?.subscription_status === 'active' && (
                   <button className="text-slate-400 hover:text-red-400 text-sm font-medium px-2 transition-colors">
                     Cancel Plan
                   </button>
                 )}
              </div>
           </div>
        </div>

        {/* Security / Password */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm">
           <div className="bg-slate-800/30 w-full md:w-1/3 p-6 flex flex-col items-center flex-start text-center border-b md:border-b-0 md:border-r border-slate-700/50">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 mb-3">
                 <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-white font-medium">Security</h3>
              <p className="text-xs text-slate-400 mt-1">Update your password.</p>
           </div>
           <div className="flex-1 p-6 space-y-4">
              <div>
                 <label className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-1 block">New Password</label>
                 <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                 <label className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-1 block">Confirm New Password</label>
                 <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Update Password
              </button>
           </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#1E293B] border border-red-900/50 rounded-xl overflow-hidden shadow-sm">
           <div className="p-6">
              <h3 className="text-white font-medium text-red-500 mb-2 flex items-center gap-2"><Trash2 className="w-5 h-5"/> Danger Zone</h3>
              <p className="text-sm text-slate-400 mb-4">Deleting your account will permanently remove all your scores, verifications, and subscription data. This action is irreversible.</p>
              <button className="bg-red-500/10 border border-red-500 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Delete Account
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
