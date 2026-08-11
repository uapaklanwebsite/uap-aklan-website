import { supabase } from './supabase.js';

/**
 * Fetch all officers ordered by display_order
 */
export async function getOfficers() {
  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching officers:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch a limited preview of officers for the homepage
 */
export async function getOfficersPreview(limit = 6) {
  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching officers preview:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch a single officer by officer_id
 */
export async function getOfficer(id) {
  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .eq('officer_id', id)
    .single();

  if (error) {
    console.error('Error fetching officer:', error);
    throw error;
  }

  return data;
}

/**
 * Add a new officer
 * @param {Object} data - { image_path, display_order }
 */
export async function addOfficer(data) {
  const { data: result, error } = await supabase
    .from('officers')
    .insert({
      image_path: data.image_path,
      display_order: data.display_order
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding officer:', error);
    throw error;
  }

  return result;
}

/**
 * Update an existing officer
 * @param {string} id - officer_id UUID
 * @param {Object} data - Updated fields { image_path, display_order }
 */
export async function updateOfficer(id, data) {
  const { data: result, error } = await supabase
    .from('officers')
    .update({
      image_path: data.image_path,
      display_order: data.display_order
    })
    .eq('officer_id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating officer:', error);
    throw error;
  }

  return result;
}

/**
 * Delete an officer by officer_id
 * @param {string} id - officer_id UUID
 */
export async function deleteOfficer(id) {
  const { error } = await supabase
    .from('officers')
    .delete()
    .eq('officer_id', id);

  if (error) {
    console.error('Error deleting officer:', error);
    throw error;
  }

  return true;
}
