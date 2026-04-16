export default async function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          System Overview
        </h2>
        <p className="mt-2 text-slate-400">
          Monitor platform wide metrics and manage system parameters.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center shadow-sm">
        <h3 className="text-xl font-medium text-slate-300">Admin Dashboard Configuration</h3>
        <p className="mt-2 text-slate-500">More complex system metrics and tooling will be built here in subsequent modules.</p>
      </div>
    </div>
  )
}
