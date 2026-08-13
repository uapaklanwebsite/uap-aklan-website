import { supabase } from './supabase.js';

/**
 * Fetch all awards ordered by display_order
 */
export async function getAwards() {
  const { data, error } = await supabase
    .from('awards')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching awards:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch a single award by award_id
 */
export async function getAward(id) {
  const { data, error } = await supabase
    .from('awards')
    .select('*')
    .eq('award_id', id)
    .single();

  if (error) {
    console.error('Error fetching award:', error);
    throw error;
  }

  return data;
}

/**
 * Add a new award
 * @param {Object} data - { image_path, display_order }
 */
export async function addAward(data) {
  const { data: result, error } = await supabase
    .from('awards')
    .insert({
      image_path: data.image_path,
      display_order: data.display_order
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding award:', error);
    throw error;
  }

  return result;
}

/**
 * Update an existing award
 * @param {string} id - award_id UUID
 * @param {Object} data - { image_path, display_order }
 */
export async function updateAward(id, data) {
  const { data: result, error } = await supabase
    .from('awards')
    .update({
      image_path: data.image_path,
      display_order: data.display_order
    })
    .eq('award_id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating award:', error);
    throw error;
  }

  return result;
}

/**
 * Delete an award by award_id
 * @param {string} id - award_id UUID
 */
export async function deleteAward(id) {
  const { error } = await supabase
    .from('awards')
    .delete()
    .eq('award_id', id);

  if (error) {
    console.error('Error deleting award:', error);
    throw error;
  }

  return true;
}
