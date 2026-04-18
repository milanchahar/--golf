'use client';
import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function WinnerReviewPanel({ userDetails, verification, drawDetails, onStatusUpdate }: any) {
  const [adminNotes, setAdminNotes] = useState('');
  const [refKey, setRefKey] = useState('');

  return (
    <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 overflow-hidden text-slate-300">
      <div className="flex flex-col lg:flex-row">
        {/* Left Col */}
        <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-700 p-6 space-y-6">
           <div>
             <h3 className="text-white font-bold mb-4">Validation Context</h3>
             <div className="bg-slate-800 p-4 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">User</span> <span className="text-white font-medium">{userDetails?.full_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Target Draw</span> <span className="text-white uppercase">{drawDetails?.draw_month}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Prize Tier</span> <span className="text-amber-400 font-bold">{drawDetails?.prize_tier}-Match</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Escrow Value</span> <span className="text-emerald-400 font-bold font-mono">€{drawDetails?.prize_amount}</span></div>
             </div>
           </div>

           {verification?.status === 'pending' && (
             <div className="space-y-4">
                <h4 className="text-white font-semibold">Triage Integrity</h4>
                <textarea 
                   placeholder="Administrative evaluation logging..."
                   className="w-full bg-slate-900 border border-slate-700 rounded p-3 h-24 text-sm focus:border-blue-500 focus:outline-none"
                   value={adminNotes}
                   onChange={e => setAdminNotes(e.target.value)}
                />
                <div className="flex gap-3">
                   <button 
                     onClick={() => onStatusUpdate('approved', adminNotes)}
                     className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                   >
                     <CheckCircle className="w-4 h-4"/> Clear
                   </button>
                   <button 
                     onClick={() => onStatusUpdate('rejected', adminNotes)}
                     className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                   >
                     <XCircle className="w-4 h-4"/> Reject
                   </button>
                </div>
             </div>
           )}

           {verification?.status === 'approved' && verification?.payment_status !== 'paid' && (
             <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded text-sm text-center font-bold">Passed Validation</h4>
                <div className="pt-2">
                   <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Disbursement Reference Key</label>
                   <input 
                      type="text" 
                      placeholder="e.g TXN-99421A" 
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 mb-3 text-sm focus:border-blue-500 outline-none"
                      value={refKey}
                      onChange={e => setRefKey(e.target.value)}
                   />
                   <button 
                     onClick={() => onStatusUpdate('paid', refKey, true)}
                     className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold transition shadow-lg shadow-blue-500/20"
                   >
                      Confirm Digital Disbursement
                   </button>
                </div>
             </div>
           )}

           {verification?.payment_status === 'paid' && (
             <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <span className="text-emerald-400 font-bold block mb-1">Disbursement Cleared</span>
                <span className="text-xs text-emerald-500/70 font-mono">Ledger Sealed</span>
             </div>
           )}
        </div>

        {/* Right Col */}
        <div className="w-full lg:w-2/3 bg-slate-900 flex items-center justify-center p-8 relative min-h-[400px]">
           {verification?.proof_image_url ? (
             /* eslint-disable-next-line @next/next/no-img-element */
             <img src={verification.proof_image_url} alt="Proof" className="max-w-full max-h-full object-contain rounded-lg border border-slate-700 shadow-2xl relative z-10" />
           ) : (
             <span className="text-slate-600 font-mono">EVIDENCE_ASSET_MISSING</span>
           )}
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-[0.03] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
