import { getCurrentUser } from "@/lib/supabase/getUser"
import { LogoutButton } from "@/components/auth/LogoutButton"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await getCurrentUser()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Admin Sidebar */}
      <aside className="w-64 flex flex-col border-r border-slate-800 bg-slate-900">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/admin" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="h-6 w-6 rounded bg-brand-green flex items-center justify-center text-xs text-white">GH</span>
            Admin
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link href="/admin" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-brand-green/10 text-brand-green transition-colors">
            System Overview
          </Link>
          <Link href="/admin/users" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            Manage Users
          </Link>
          <Link href="/admin/charities" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            Manage Charities
          </Link>
          <Link href="/dashboard" className="flex items-center mt-8 px-3 py-2 text-sm font-medium rounded-md border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            ← Back to App
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-md bg-brand-green/20 flex items-center justify-center text-sm font-bold text-brand-green border border-brand-green/30">
              Ad
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                 {user?.email}
              </p>
            </div>
          </div>
          <LogoutButton className="w-full justify-start text-sm" variant="outline" />
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-slate-100">Admin Control Panel</h1>
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500 ring-1 ring-inset ring-red-500/20">
            Elevated Access
          </span>
        </div>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
