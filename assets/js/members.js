import { supabase } from './supabase.js';

/**
 * Fetch all members
 */
export async function getMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch a limited preview of members for the homepage
 */
export async function getMembersPreview(limit = 6) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching members preview:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch a single member by member_id
 */
export async function getMember(id) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('member_id', id)
    .single();

  if (error) {
    console.error('Error fetching member:', error);
    throw error;
  }

  return data;
}

/**
 * Add a new member
 * @param {Object} member - { full_name, address, email }
 */
export async function addMember(member) {
  const { data, error } = await supabase
    .from('members')
    .insert({
      full_name: member.full_name,
      address: member.address,
      email: member.email
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding member:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing member
 * @param {string} id - member_id UUID
 * @param {Object} member - Updated fields { full_name, address, email }
 */
export async function updateMember(id, member) {
  const { data, error } = await supabase
    .from('members')
    .update({
      full_name: member.full_name,
      address: member.address,
      email: member.email
    })
    .eq('member_id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating member:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a member by member_id
 * @param {string} id - member_id UUID
 */
export async function deleteMember(id) {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('member_id', id);

  if (error) {
    console.error('Error deleting member:', error);
    throw error;
  }

  return true;
}
