import { supabase } from './supabase.js';

/**
 * Fetch all gallery items
 */
export async function getGallery() {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching gallery:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch a single gallery item by gallery_id
 */
export async function getGalleryItem(id) {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .eq('gallery_id', id)
    .single();

  if (error) {
    console.error('Error fetching gallery item:', error);
    throw error;
  }

  return data;
}

/**
 * Add a new gallery item
 * @param {Object} data - { image_path }
 */
export async function addGalleryItem(data) {
  const { data: result, error } = await supabase
    .from('gallery')
    .insert({
      image_path: data.image_path
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding gallery item:', error);
    throw error;
  }

  return result;
}

/**
 * Delete a gallery item by gallery_id
 * @param {string} id - gallery_id UUID
 */
export async function deleteGalleryItem(id) {
  const { error } = await supabase
    .from('gallery')
    .delete()
    .eq('gallery_id', id);

  if (error) {
    console.error('Error deleting gallery item:', error);
    throw error;
  }

  return true;
}
