import { createClient } from './supabase/client';

/**
 * Uploads a proof image for winner verification to Supabase Storage.
 * Saves to the private bucket 'winner-proofs', under the user's folder.
 * 
 * @param userId - the authenticated user's ID
 * @param file - the File object from an input
 * @returns the public URL of the uploaded file
 */
export async function uploadProofImage(userId: string, file: File): Promise<string> {
  const supabase = createClient();
  
  // Create a unique filename to prevent overwriting
  const fileExtension = file.name.split('.').pop() || 'png';
  const timestamp = Date.now();
  const filePath = `${userId}/${timestamp}-proof.${fileExtension}`;

  const { error } = await supabase.storage
    .from('winner-proofs')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload proof image: ${error.message}`);
  }

  // Once uploaded, retrieve the public URL
  const { data: publicUrlData } = supabase.storage
    .from('winner-proofs')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Deletes a previously uploaded proof image from the bucket.
 * Intended to be used to clean up if a submission fails immediately after upload.
 * 
 * @param url - the public URL returned by uploadProofImage
 */
export async function deleteProofImage(url: string): Promise<void> {
  const supabase = createClient();
  
  // Extract file path from URL
  const pathParts = url.split('/winner-proofs/');
  if (pathParts.length !== 2) return; // not a valid recognizable URL

  const filePath = pathParts[1];

  const { error } = await supabase.storage
    .from('winner-proofs')
    .remove([filePath]);

  if (error) {
    console.error('Failed to delete proof image:', error.message);
  }
}
