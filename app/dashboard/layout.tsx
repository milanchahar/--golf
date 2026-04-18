import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, ClipboardList, Target, Heart, Trophy, Settings, LogOut, ChevronRight } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, subscription_status')
    .eq('id', userData.user.id)
    .single();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'My Scores', href: '/dashboard/scores', icon: ClipboardList },
    { name: 'Draws', href: '/dashboard/draws', icon: Target },
    { name: 'Charity', href: '/dashboard/charity', icon: Heart },
    { name: 'My Winnings', href: '/dashboard/winnings', icon: Trophy },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-[#0F172A] sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
           <div>
              <h2 className="font-bold text-white tracking-wide">Golf Heroes</h2>
              <span className="text-xs text-slate-500 font-medium tracking-widest uppercase mt-1 block">Dashboard</span>
           </div>
        </div>
        
        <div className="p-6 pb-2 border-b border-slate-800">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {profile?.full_name?.charAt(0) || 'U'}
             </div>
             <div>
               <p className="text-sm font-semibold text-white truncate max-w-[120px]">{profile?.full_name || 'User'}</p>
               <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 font-medium ${profile?.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                  {profile?.subscription_status === 'active' ? 'Subscriber' : 'Inactive'}
               </span>
             </div>
           </div>
           
           {profile?.subscription_status !== 'active' && (
             <button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors duration-200">
               Upgrade Plan
             </button>
           )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group">
              <item.icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <LogoutButton className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border-none bg-transparent" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#1E293B] relative min-h-screen pb-20 md:pb-0 overflow-y-auto">
         {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-slate-800 z-50 px-2 py-2 flex justify-around items-center safe-area-pb">
        {[navigation[0], navigation[1], navigation[2], navigation[3], navigation[4]].map((item) => (
          <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-16 h-12 text-slate-400 hover:text-emerald-400">
             <item.icon className="w-5 h-5 mb-1" />
             <span className="text-[10px] font-medium tracking-tight truncate w-full text-center">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
