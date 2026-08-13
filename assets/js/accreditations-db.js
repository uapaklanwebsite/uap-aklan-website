import { supabase } from './supabase.js';

/**
 * Fetch all accreditations ordered by display_order
 */
export async function getAccreditations() {
  const { data, error } = await supabase
    .from('accreditations')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[Accreditations DB] Error fetching accreditations:', error);
    throw error;
  }

  return data;
}

/**
 * Add a new accreditation record
 */
export async function addAccreditation(accreditationData) {
  const { data, error } = await supabase
    .from('accreditations')
    .insert({
      image_path: accreditationData.image_path,
      display_order: accreditationData.display_order || 1
    })
    .select()
    .single();

  if (error) {
    console.error('[Accreditations DB] Error adding accreditation:', error);
    throw error;
  }

  return data;
}

/**
 * Delete an accreditation record by ID
 */
export async function deleteAccreditation(id) {
  const { error } = await supabase
    .from('accreditations')
    .delete()
    .eq('accreditation_id', id);

  if (error) {
    console.error('[Accreditations DB] Error deleting accreditation:', error);
    throw error;
  }

  return true;
}
