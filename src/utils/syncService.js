/**
 * Merges local and cloud collections by ID.
 * Last-Write-Wins based on `updated_at` (number or ISO string), default to local if equal or absent.
 */
export function mergeLocalAndCloud(localList = [], cloudList = []) {
  const map = new Map();

  const getTimestamp = (item) => {
    if (!item?.updated_at) return 0;
    const ts = new Date(item.updated_at).getTime();
    return isNaN(ts) ? Number(item.updated_at) || 0 : ts;
  };

  // Seed with cloud
  for (const item of cloudList) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }

  // Overlay with local
  for (const item of localList) {
    if (!item || !item.id) continue;
    if (!map.has(item.id)) {
      map.set(item.id, item);
    } else {
      const existing = map.get(item.id);
      if (getTimestamp(item) >= getTimestamp(existing)) {
        map.set(item.id, item);
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Fetches character and homebrew records for a given user from Supabase.
 */
export async function fetchCloudData(client, userId) {
  if (!client || !userId) {
    return { characters: [], homebrewSpells: [] };
  }

  try {
    const [charRes, hbRes] = await Promise.all([
      client.from('characters').select('*').eq('user_id', userId),
      client.from('homebrew_spells').select('*').eq('user_id', userId),
    ]);

    const characters = (charRes.data || []).map((row) => ({
      ...(row.data || {}),
      id: row.id,
      name: row.name || row.data?.name,
      className: row.class_name || row.data?.className,
      level: row.level || row.data?.level,
      updated_at: row.updated_at,
    }));

    const homebrewSpells = (hbRes.data || []).map((row) => ({
      ...(row.data || {}),
      id: row.id,
      name: row.name || row.data?.name,
      updated_at: row.updated_at,
    }));

    return { characters, homebrewSpells };
  } catch (error) {
    console.error('fetchCloudData error:', error);
    return { characters: [], homebrewSpells: [] };
  }
}

/**
 * Upserts full character objects to Supabase.
 */
export async function syncCharactersToCloud(client, userId, characters = []) {
  if (!client || !userId || characters.length === 0) {
    return { success: true };
  }

  const rows = characters.map((c) => ({
    id: c.id,
    user_id: userId,
    name: c.name || 'Unnamed',
    class_name: c.className || 'Wizard',
    level: c.level || 1,
    data: c,
    updated_at: new Date().toISOString(),
  }));

  try {
    const { error } = await client.from('characters').upsert(rows, { onConflict: 'id,user_id' });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('syncCharactersToCloud error:', error);
    return { success: false, error };
  }
}

/**
 * Upserts homebrew spell objects to Supabase.
 */
export async function syncHomebrewToCloud(client, userId, spells = []) {
  if (!client || !userId || spells.length === 0) {
    return { success: true };
  }

  const rows = spells.map((s) => ({
    id: s.id,
    user_id: userId,
    name: s.name || 'Unnamed Spell',
    data: s,
    updated_at: new Date().toISOString(),
  }));

  try {
    const { error } = await client.from('homebrew_spells').upsert(rows, { onConflict: 'id,user_id' });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('syncHomebrewToCloud error:', error);
    return { success: false, error };
  }
}
