import { supabase } from './supabase.js';

/**
 * Fetch all certifications ordered by display_order
 */
export async function getCertifications() {
  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[Certifications DB] Error fetching certifications:', error);
    throw error;
  }

  return data;
}

/**
 * Add a new certification record
 */
export async function addCertification(certificationData) {
  const { data, error } = await supabase
    .from('certifications')
    .insert({
      image_path: certificationData.image_path,
      display_order: certificationData.display_order || 1
    })
    .select()
    .single();

  if (error) {
    console.error('[Certifications DB] Error adding certification:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a certification record by ID
 */
export async function deleteCertification(id) {
  const { error } = await supabase
    .from('certifications')
    .delete()
    .eq('certification_id', id);

  if (error) {
    console.error('[Certifications DB] Error deleting certification:', error);
    throw error;
  }

  return true;
}
