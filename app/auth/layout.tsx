export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Golf <span className="text-brand-blue">Heroes</span>
          </h1>
          <p className="mt-4 text-center text-sm text-slate-400">
            Join the community. Compete. Give back.
          </p>
        </div>
        
        <div className="bg-slate-900 shadow-xl shadow-black/50 border border-slate-800 rounded-xl overflow-hidden p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
