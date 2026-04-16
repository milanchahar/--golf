import { getCurrentUser } from "@/lib/supabase/getUser"
import ScoreSummaryWidget from "@/components/ScoreSummaryWidget"

export default async function DashboardPage() {
  const { profile, user } = await getCurrentUser()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Welcome, {profile?.full_name || user?.email?.split('@')[0]}
        </h2>
        <p className="mt-2 text-slate-400">
          Here&apos;s an overview of your Golf Heroes account.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder cards */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <span className="text-xl">🏆</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Recent Stableford</p>
              <p className="text-2xl font-semibold text-slate-100">--</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <span className="text-xl">💚</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Charity Contribution</p>
              <p className="text-2xl font-semibold text-slate-100">{profile?.charity_contribution_percent || 10}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <span className="text-xl">⭐</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Subscription Status</p>
              <p className="text-2xl font-semibold capitalize text-slate-100">{profile?.subscription_status || 'Inactive'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score summary widget */}
      <ScoreSummaryWidget />
    </div>
  )
}
