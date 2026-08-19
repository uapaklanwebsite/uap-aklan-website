import { supabase } from './supabase.js';

/**
 * Fetch all membership help links ordered by display_order
 */
export async function getMembershipHelpLinks() {
  const { data, error } = await supabase
    .from('membership_need_help')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[Membership Help DB] Error fetching help links:', error);
    throw error;
  }

  return data;
}

/**
 * Add a membership help link
 */
export async function addMembershipHelpLink(linkData) {
  const { data, error } = await supabase
    .from('membership_need_help')
    .insert({
      title: linkData.title,
      link: linkData.link,
      display_order: linkData.display_order || 1
    })
    .select()
    .single();

  if (error) {
    console.error('[Membership Help DB] Error adding help link:', error);
    throw error;
  }

  return data;
}

/**
 * Update a membership help link
 */
export async function updateMembershipHelpLink(id, linkData) {
  const { data, error } = await supabase
    .from('membership_need_help')
    .update({
      title: linkData.title,
      link: linkData.link,
      display_order: linkData.display_order,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Membership Help DB] Error updating help link:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a membership help link
 */
export async function deleteMembershipHelpLink(id) {
  const { error } = await supabase
    .from('membership_need_help')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Membership Help DB] Error deleting help link:', error);
    throw error;
  }

  return true;
}
