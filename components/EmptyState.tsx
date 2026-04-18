import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  heading: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, heading, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-700/50 rounded-xl bg-[#1E293B]/50">
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{heading}</h3>
      <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
