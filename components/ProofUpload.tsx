'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadProofImage } from '@/lib/storage';

interface ProofUploadProps {
  drawEntryId: string;
  userId: string;
  onSuccess: () => void;
}

export default function ProofUpload({ drawEntryId, userId, onSuccess }: ProofUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, WEBP).');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      
      setError(null);
      setFile(selectedFile);
      
      // Create local preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // 1. Upload to Supabase Storage
      const publicUrl = await uploadProofImage(userId, file);
      
      // 2. Submit Verification to API
      const response = await fetch('/api/winners/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draw_entry_id: drawEntryId,
          proof_image_url: publicUrl,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit verification');
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 mb-4">
      <h4 className="text-white font-medium mb-2">Upload Verification Proof</h4>
      <p className="text-xs text-slate-400 mb-4">
        Please upload a clear screenshot showing your scores matching the drawn results. Max size 5MB.
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-500">
           <AlertCircle className="w-4 h-4 mt-0.5" />
           <span className="text-sm">{error}</span>
        </div>
      )}
      
      {!previewUrl ? (
        <label className="border-2 border-dashed border-slate-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-colors group">
          <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-blue-500 mb-3" />
          <span className="text-sm text-slate-300 font-medium">Click to browse or drag and drop</span>
          <span className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP</span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black/50 aspect-video flex items-center justify-center">
            <img src={previewUrl} alt="Preview" className="object-contain max-h-48" />
          </div>
          
          <div className="flex gap-3">
             <button
               onClick={() => {
                 setFile(null);
                 setPreviewUrl(null);
               }}
               disabled={isUploading}
               className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
             >
               Change File
             </button>
             <button
               onClick={handleUpload}
               disabled={isUploading}
               className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {isUploading ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Uploading...
                 </>
               ) : (
                 <>
                   <CheckCircle2 className="w-4 h-4" />
                   Submit Verification
                 </>
               )}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
