import { supabase } from './supabase.js';

/**
 * Fetch all activities
 */
export async function getActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch a single activity by activity_id
 */
export async function getActivity(id) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('activity_id', id)
    .single();

  if (error) {
    console.error('Error fetching activity:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch activity for a specific year and month
 */
export async function getActivityByYearMonth(year, month) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('year', year)
    .eq('month', month)
    .maybeSingle();

  if (error) {
    console.error('Error fetching activity by year/month:', error);
    throw error;
  }

  return data;
}

/**
 * Add a new activity
 * @param {Object} data - { month, year, image_path }
 */
export async function addActivity(data) {
  const { data: result, error } = await supabase
    .from('activities')
    .insert({
      month: data.month,
      year: data.year,
      image_path: data.image_path
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding activity:', error);
    throw error;
  }

  return result;
}

/**
 * Update an existing activity
 * @param {string} id - activity_id UUID
 * @param {Object} data - Updated fields { month, year, image_path }
 */
export async function updateActivity(id, data) {
  const { data: result, error } = await supabase
    .from('activities')
    .update({
      month: data.month,
      year: data.year,
      image_path: data.image_path
    })
    .eq('activity_id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating activity:', error);
    throw error;
  }

  return result;
}

/**
 * Delete an activity by activity_id
 * @param {string} id - activity_id UUID
 */
export async function deleteActivity(id) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('activity_id', id);

  if (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }

  return true;
}
