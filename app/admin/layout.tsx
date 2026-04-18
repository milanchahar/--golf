import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Target, 
  Trophy, 
  Heart, 
  Award,
  BarChart4,
  Settings,
  ArrowLeft
} from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', userData.user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Scores', href: '/admin/scores', icon: Target },
    { name: 'Draw Management', href: '/admin/draws', icon: Trophy },
    { name: 'Prize Pools', href: '/admin/prize-pools', icon: Award },
    { name: 'Charities', href: '/admin/charities', icon: Heart },
    { name: 'Winners', href: '/admin/winners', icon: Trophy },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart4 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] border-r border-slate-800 bg-[#0F172A] sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
           <div>
              <h2 className="font-bold text-white tracking-wide">Golf Heroes</h2>
              <span className="text-xs text-blue-500 font-bold tracking-widest uppercase mt-1 block">Admin Control</span>
           </div>
        </div>
        
        <div className="p-6 pb-2 border-b border-slate-800">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {profile?.full_name?.charAt(0) || 'A'}
             </div>
             <div>
               <p className="text-sm font-semibold text-white truncate max-w-[120px]">{profile?.full_name || 'Admin'}</p>
               <span className="text-xs px-2 py-0.5 rounded-full inline-block mt-1 font-medium bg-blue-500/20 text-blue-400 border border-blue-500/20">
                  Administrator
               </span>
             </div>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group">
              <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
           <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
             <ArrowLeft className="w-4 h-4" /> Back to Site
           </Link>
           <LogoutButton className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border-none bg-transparent" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-900 relative min-h-screen overflow-y-auto">
         {/* Mobile Header */}
         <div className="md:hidden bg-[#0F172A] border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
           <h2 className="font-bold text-white tracking-wide">Admin Control</h2>
           <Link href="/dashboard" className="text-xs text-blue-400">Exit</Link>
         </div>
         {children}
      </main>
    </div>
  );
}
