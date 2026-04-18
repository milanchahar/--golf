'use client';
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Captured System Exception:', error);
  }, [error]);

  return (
    <html>
      <body className="bg-[#0F172A] text-slate-300 min-h-screen flex items-center justify-center p-6">
        <div className="bg-[#1E293B] border border-red-500/20 max-w-md w-full rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
           <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
           
           <h2 className="text-white text-2xl font-bold mb-2">Something went wrong</h2>
           <p className="text-sm text-slate-400 mb-8 leading-relaxed">
             We encountered an unexpected systemic failure. This has been logged dynamically for immediate triage. Our support architecture is rectifying this.
           </p>

           <button
             onClick={() => reset()}
             className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors border border-slate-700 mb-3 block text-sm"
           >
             Attempt Hard Recovery
           </button>
           <a href="/" className="w-full inline-block bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-sm">
             Return to Headquarters
           </a>
        </div>
      </body>
    </html>
  );
}
