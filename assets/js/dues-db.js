import { supabase } from './supabase.js';

/**
 * Fetch all dues sections (chapter, iapoa, generate_soa)
 */
export async function getDuesSections() {
  const { data, error } = await supabase
    .from('dues_sections')
    .select('*');

  if (error) {
    console.error('Error fetching dues sections:', error);
    throw error;
  }

  return data;
}

/**
 * Update a dues section by section_key
 */
export async function updateDuesSection(sectionKey, duesData) {
  const updatePayload = {
    content: duesData.content,
    link: duesData.link,
    updated_at: new Date().toISOString()
  };

  if (duesData.image_path !== undefined) {
    updatePayload.image_path = duesData.image_path;
  }

  const { data, error } = await supabase
    .from('dues_sections')
    .update(updatePayload)
    .eq('section_key', sectionKey)
    .select()
    .single();

  if (error) {
    console.error('Error updating dues section:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch all help links ordered by display_order
 */
export async function getHelpLinks() {
  const { data, error } = await supabase
    .from('help_links')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching help links:', error);
    throw error;
  }

  return data;
}

/**
 * Add a help link
 */
export async function addHelpLink(linkData) {
  const { data, error } = await supabase
    .from('help_links')
    .insert({
      title: linkData.title,
      link: linkData.link,
      display_order: linkData.display_order || 1
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding help link:', error);
    throw error;
  }

  return data;
}

/**
 * Update a help link
 */
export async function updateHelpLink(id, linkData) {
  const { data, error } = await supabase
    .from('help_links')
    .update({
      title: linkData.title,
      link: linkData.link,
      display_order: linkData.display_order,
      updated_at: new Date().toISOString()
    })
    .eq('help_id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating help link:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a help link
 */
export async function deleteHelpLink(id) {
  const { error } = await supabase
    .from('help_links')
    .delete()
    .eq('help_id', id);

  if (error) {
    console.error('Error deleting help link:', error);
    throw error;
  }

  return true;
}
