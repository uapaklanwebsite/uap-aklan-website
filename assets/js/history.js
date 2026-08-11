import { supabase } from './supabase.js';

/**
 * Fetch all chapter history entries
 */
export async function getHistory() {
  const { data, error } = await supabase
    .from('chapter_history')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching chapter history:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch a single chapter history entry by history_id
 */
export async function getHistoryItem(id) {
  const { data, error } = await supabase
    .from('chapter_history')
    .select('*')
    .eq('history_id', id)
    .single();

  if (error) {
    console.error('Error fetching chapter history item:', error);
    throw error;
  }

  return data;
}

/**
 * Add a new chapter history entry
 * @param {Object} data - { title, content }
 */
export async function addHistory(data) {
  const { data: result, error } = await supabase
    .from('chapter_history')
    .insert({
      title: data.title,
      content: data.content
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding chapter history:', error);
    throw error;
  }

  return result;
}

/**
 * Update an existing chapter history entry
 * @param {string} id - history_id UUID
 * @param {Object} data - Updated fields { title, content }
 */
export async function updateHistory(id, data) {
  const { data: result, error } = await supabase
    .from('chapter_history')
    .update({
      title: data.title,
      content: data.content
    })
    .eq('history_id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating chapter history:', error);
    throw error;
  }

  return result;
}

/**
 * Delete a chapter history entry by history_id
 * @param {string} id - history_id UUID
 */
export async function deleteHistory(id) {
  const { error } = await supabase
    .from('chapter_history')
    .delete()
    .eq('history_id', id);

  if (error) {
    console.error('Error deleting chapter history:', error);
    throw error;
  }

  return true;
}
