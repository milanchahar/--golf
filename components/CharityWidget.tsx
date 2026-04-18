'use client';
import { useState } from 'react';
import { Heart, Edit2 } from 'lucide-react';
import Link from 'next/link';

interface CharityWidgetProps {
  charityId: string | null;
  charityName: string;
  charityLogo: string;
  contributionPercent: number;
  monthlyEstimate: number; // calculated roughly or pulled dynamically
}

export default function CharityWidget({ charityId, charityName, charityLogo, contributionPercent, monthlyEstimate }: CharityWidgetProps) {
  if (!charityId) {
    return (
      <div className="bg-[#1E293B] border border-emerald-500/30 rounded-xl p-6 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Heart size={80} className="text-emerald-500" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-emerald-500" />
            <h3 className="text-white font-semibold">Your Charity</h3>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            You haven't selected a charity yet. Setup your contribution settings.
          </p>
        </div>
        <Link href="/dashboard/charity">
          <button className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg transition-colors">
            Choose Charity
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#1E293B] border border-slate-700/50 hover:border-emerald-500/50 transition-colors duration-300 rounded-xl p-6 shadow-sm flex flex-col justify-between h-full relative">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-500 max-w-full" />
            <span className="text-sm font-medium text-slate-400">Supporting</span>
          </div>
          <Link href="/dashboard/charity">
            <button className="text-slate-400 hover:text-white transition">
               <Edit2 className="w-4 h-4" />
            </button>
          </Link>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          {charityLogo ? (
            <img src={charityLogo} alt="Charity Logo" className="w-12 h-12 rounded-full object-cover bg-slate-800" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500">
               <Heart className="w-6 h-6" />
            </div>
          )}
          <div>
            <h4 className="text-white font-semibold line-clamp-1">{charityName}</h4>
            <p className="text-xs text-emerald-400">{contributionPercent}% of your fee</p>
          </div>
        </div>
        
      </div>

      <div className="pt-4 border-t border-slate-700/50 flex justify-between items-end mt-4">
        <div>
           <span className="text-xs text-slate-400 block mb-1">Monthly Approx</span>
           <span className="text-lg font-bold text-white">€{monthlyEstimate.toFixed(2)}</span>
        </div>
        <Link href="/dashboard/charity" className="text-xs text-blue-400 hover:text-blue-300 hover:underline">
          Adjust %
        </Link>
      </div>
    </div>
  );
}
