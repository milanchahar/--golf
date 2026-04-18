'use client';
import { useState } from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, AlertCircle, FileImage } from 'lucide-react';
import ProofUpload from './ProofUpload';

interface WinnerStatusCardProps {
  userId: string;
  prediction: {
    id: string;
    draw_month: string;
    prize_tier: '5-match' | '4-match' | '3-match';
    prize_amount: number;
    is_winner: boolean;
  };
  verification?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    proof_image_url: string;
    admin_notes: string | null;
    payment_status: 'unpaid' | 'pending' | 'paid';
  };
  onVerificationSubmitted?: () => void;
}

export default function WinnerStatusCard({ userId, prediction, verification, onVerificationSubmitted }: WinnerStatusCardProps) {
  const [showUpload, setShowUpload] = useState(false);

  // Status badges
  const getVerificationBadge = () => {
    if (!verification) return null;
    switch(verification.status) {
      case 'pending':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"><Clock className="w-3 h-3"/> Pending Review</span>;
      case 'approved':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3"/> Approved</span>;
      case 'rejected':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20"><XCircle className="w-3 h-3"/> Rejected</span>;
    }
  };

  const getPaymentBadge = () => {
    if (!verification) return null;
    switch(verification.payment_status) {
      case 'unpaid':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">Unpaid</span>;
      case 'pending':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"><Clock className="w-3 h-3"/> Processing Payment</span>;
      case 'paid':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3"/> Paid</span>;
    }
  };

  return (
    <div className={`bg-[#1E293B] border ${!verification ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative overflow-hidden' : 'border-slate-700/50'} rounded-xl shadow-sm mb-4`}>
      
      {!verification && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      )}

      <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <span className="text-slate-400 font-mono text-sm">{prediction.draw_month}</span>
             <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300">
               {prediction.prize_tier.replace('-match', ' Matches')}
             </span>
          </div>
          <h3 className="text-2xl font-bold text-white">€{prediction.prize_amount.toFixed(2)}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
            {verification ? (
              <>
                {getVerificationBadge()}
                {verification.status === 'approved' && getPaymentBadge()}
              </>
            ) : (
              <button 
                onClick={() => setShowUpload(!showUpload)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
              >
                Claim Winnings
              </button>
            )}
        </div>
      </div>

      {verification && verification.status === 'rejected' && (
        <div className="px-5 pb-5 pt-2">
           <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-200">
             <div className="flex items-start gap-2">
               <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
               <div>
                  <span className="font-semibold text-red-400 block mb-1">Verification Rejected</span>
                  {verification.admin_notes || "Your proof of score was rejected. Please contact support."}
               </div>
             </div>
           </div>
        </div>
      )}

      {showUpload && !verification && (
        <div className="px-5 pb-5">
           <div className="my-2 border-t border-slate-700/50" />
           <div className="mt-4">
             <ProofUpload 
               drawEntryId={prediction.id} 
               userId={userId}
               onSuccess={() => {
                 setShowUpload(false);
                 if (onVerificationSubmitted) onVerificationSubmitted();
               }} 
             />
           </div>
        </div>
      )}
      
      {verification && verification.proof_image_url && (
        <div className="px-5 pb-4">
          <a href={verification.proof_image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
            <FileImage className="w-3.5 h-3.5" />
            View Submitted Proof
          </a>
        </div>
      )}
    </div>
  );
}
