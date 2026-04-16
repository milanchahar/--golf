import { getCurrentUser } from "@/lib/supabase/getUser"
import { LogoutButton } from "@/components/auth/LogoutButton"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await getCurrentUser()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-slate-800 bg-slate-900/50">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
            Golf <span className="text-brand-blue">Heroes</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-brand-blue/10 text-brand-blue">
            Overview
          </Link>
          <Link href="/dashboard/scores" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            Scores
          </Link>
          <Link href="/dashboard/draws" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            Draws
          </Link>
          <Link href="/dashboard/charity" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            Charity
          </Link>
          <Link href="/dashboard/subscription" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            Subscription
          </Link>
          {profile?.role === 'admin' && (
             <Link href="/admin" className="flex items-center mt-4 px-3 py-2 text-sm font-medium rounded-md border border-brand-green/30 text-brand-green hover:bg-brand-green/10 transition-colors">
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-300">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <LogoutButton className="w-full justify-start text-sm" variant="outline" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-16 flex items-center px-8 border-b border-slate-800 bg-slate-900/20 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-slate-100">Dashboard</h1>
        </div>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
