import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg text-blue-500">
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend.value}
          </span>
          <span className="ml-2 text-slate-400 text-xs">vs last month</span>
        </div>
      )}
    </div>
  );
}
