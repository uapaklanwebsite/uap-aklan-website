/**
 * Supabase Storage Utility Module
 * Handles uploading compressed images, deleting images, and getting public URLs for files.
 */
import { supabase } from './supabase.js';
import { compressImage } from './image.js';

/**
 * Uploads an image file to a Supabase Storage bucket after compressing it to WebP format.
 * Generates a unique UUID filename (e.g., '{uuid}.webp').
 * @param {string} bucket - Target bucket name ('officers', 'gallery', 'activities', 'awards')
 * @param {File|Blob} file - The original image file selected by user
 * @returns {Promise<{ path: string, publicUrl: string }>} Object containing image_path to store in DB and the public URL
 */
export async function uploadImage(bucket, file) {
  if (!file) {
    throw new Error('No image file provided for upload.');
  }

  // 1. Compress image to WebP format in browser using HTML Canvas / createImageBitmap
  const compressedBlob = await compressImage(file);

  // 2. Generate unique filename using UUID
  const filename = `${crypto.randomUUID()}.webp`;

  // Convert Blob to File object for standard multipart upload compatibility
  const compressedFile = new File([compressedBlob], filename, { type: 'image/webp' });

  // 3. Upload compressed file to Supabase Storage bucket
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, compressedFile, {
      contentType: 'image/webp',
      upsert: false
    });

  if (error) {
    console.error(`[Storage] Upload error in bucket '${bucket}':`, error);
    throw error;
  }

  if (!data?.path) {
    throw new Error('Supabase upload succeeded but no storage path was returned.');
  }

  const path = data.path;
  const publicUrl = getPublicUrl(bucket, path);

  console.log('[Storage] Upload successful:', data);
  console.log('[Storage] Storage path:', path);
  console.log('[Storage] Public URL:', publicUrl);

  return { path, publicUrl };
}

/**
 * Deletes an image file from a Supabase Storage bucket.
 * Returns the Supabase Storage response data.
 * @param {string} bucket - Target bucket name ('officers', 'gallery', 'activities', 'awards')
 * @param {string} path - Relative image path stored in database
 * @returns {Promise<Array>} Returned removal data array from Supabase Storage
 */
export async function deleteImage(bucket, path) {
  if (!path) return null;

  // Extract relative filename if full path or URL was passed
  let cleanPath = path;
  if (cleanPath.includes('/')) {
    cleanPath = cleanPath.split('/').pop();
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([cleanPath]);

  if (error) {
    console.error(`[Storage] Delete error in bucket '${bucket}':`, error);
    throw error;
  }

  console.log(`[Storage] Deleted image from '${bucket}':`, cleanPath, data);
  return data;
}

/**
 * Returns the public URL for an image stored in Supabase Storage.
 * @param {string} bucket - Target bucket name ('officers', 'gallery', 'activities', 'awards')
 * @param {string} path - Relative image path stored in database (e.g. '2.png' or 'abc123.webp')
 * @returns {string} Public URL of the image
 */
export function getPublicUrl(bucket, path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // Strip bucket name prefix if included in path
  let cleanPath = path;
  if (cleanPath.startsWith(`${bucket}/`)) {
    cleanPath = cleanPath.replace(`${bucket}/`, '');
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(cleanPath);

  return data.publicUrl;
}
