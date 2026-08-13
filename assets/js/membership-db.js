import { supabase } from './supabase.js';

/**
 * Fetch all membership sections ordered by display_order
 */
export async function getMembershipSections() {
  const { data, error } = await supabase
    .from('membership_sections')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching membership sections:', error);
    throw error;
  }

  return data;
}

/**
 * Add a new membership section
 */
export async function addMembershipSection(sectionData) {
  const { data, error } = await supabase
    .from('membership_sections')
    .insert({
      section_name: sectionData.section_name,
      content: sectionData.content || '',
      link: sectionData.link || '',
      image_path: sectionData.image_path || '',
      display_order: sectionData.display_order || 1
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding membership section:', error);
    throw error;
  }

  return data;
}

/**
 * Update a membership section
 */
export async function updateMembershipSection(id, sectionData) {
  const updatePayload = {
    section_name: sectionData.section_name,
    content: sectionData.content,
    link: sectionData.link,
    display_order: sectionData.display_order,
    updated_at: new Date().toISOString()
  };

  if (sectionData.image_path !== undefined) {
    updatePayload.image_path = sectionData.image_path;
  }

  const { data, error } = await supabase
    .from('membership_sections')
    .update(updatePayload)
    .eq('section_id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating membership section:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a membership section
 */
export async function deleteMembershipSection(id) {
  const { error } = await supabase
    .from('membership_sections')
    .delete()
    .eq('section_id', id);

  if (error) {
    console.error('Error deleting membership section:', error);
    throw error;
  }

  return true;
}
