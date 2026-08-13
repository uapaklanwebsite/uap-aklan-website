import { supabase } from './supabase.js';

/**
 * Fetch all site content sections
 */
export async function getSiteContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .order('section_key', { ascending: true });

  if (error) {
    console.error('Error fetching site content:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch a single site content section by section_key
 */
export async function getSiteContentByKey(sectionKey) {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('section_key', sectionKey)
    .single();

  if (error) {
    console.error(`Error fetching site content (${sectionKey}):`, error);
    throw error;
  }

  return data;
}

/**
 * Update a site content section by section_key
 * @param {string} sectionKey - welcome | mission | vision
 * @param {Object} data - { title, content }
 */
export async function updateSiteContent(sectionKey, data) {
  const { data: result, error } = await supabase
    .from('site_content')
    .update({
      title: data.title,
      content: data.content,
      updated_at: new Date().toISOString()
    })
    .eq('section_key', sectionKey)
    .select()
    .single();

  if (error) {
    console.error(`Error updating site content (${sectionKey}):`, error);
    throw error;
  }

  return result;
}
