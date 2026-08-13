import { supabase } from './supabase.js';

/**
 * Fetch the single governance resolutions record
 */
export async function getGovernanceResolution() {
  const { data, error } = await supabase
    .from('governance_resolutions')
    .select('*')
    .limit(1);

  if (error) {
    console.error('[Governance DB] Error fetching resolution:', error);
    throw error;
  }

  return data && data.length > 0 ? data[0] : null;
}

/**
 * Save (insert or update) governance resolution
 */
export async function saveGovernanceResolution(payload) {
  const existing = await getGovernanceResolution();

  if (existing && existing.resolution_id) {
    const updateData = {
      content: payload.content,
      link: payload.link !== undefined ? payload.link : null,
      updated_at: new Date().toISOString()
    };
    if (payload.image_path !== undefined) {
      updateData.image_path = payload.image_path;
    }

    const { data, error } = await supabase
      .from('governance_resolutions')
      .update(updateData)
      .eq('resolution_id', existing.resolution_id)
      .select()
      .single();

    if (error) {
      console.error('[Governance DB] Error updating resolution:', error);
      throw error;
    }
    return data;
  } else {
    const { data, error } = await supabase
      .from('governance_resolutions')
      .insert({
        content: payload.content || '',
        link: payload.link || null,
        image_path: payload.image_path || ''
      })
      .select()
      .single();

    if (error) {
      console.error('[Governance DB] Error inserting resolution:', error);
      throw error;
    }
    return data;
  }
}
