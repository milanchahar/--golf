import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Synchronizing...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4 text-slate-400">
       <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
       {text && <span className="text-sm font-medium tracking-wide animate-pulse">{text}</span>}
    </div>
  );
}
