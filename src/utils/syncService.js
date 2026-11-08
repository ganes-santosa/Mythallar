/**
 * Merges local and cloud collections by ID.
 * Last-Write-Wins based on `updated_at` (number or ISO string), default to local if equal or absent.
 * Ignores any item whose ID is in `deletedIds` unless item updated_at is newer than deletion timestamp.
 */
export function mergeLocalAndCloud(localList = [], cloudList = [], deletedIds = {}) {
  const map = new Map();

  const getTimestamp = (item) => {
    if (!item?.updated_at) return 0;
    const ts = new Date(item.updated_at).getTime();
    return isNaN(ts) ? Number(item.updated_at) || 0 : ts;
  };

  const isTombstoned = (item) => {
    if (!item || !item.id) return true;
    const delTs = deletedIds[item.id];
    if (delTs === undefined || delTs === null) return false;
    return getTimestamp(item) <= delTs;
  };

  // Seed with cloud
  for (const item of cloudList) {
    if (item && item.id && !isTombstoned(item)) {
      map.set(item.id, item);
    }
  }

  // Overlay with local
  for (const item of localList) {
    if (!item || !item.id || isTombstoned(item)) continue;
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
 * Reconciles local and cloud data upon an authenticated pull.
 * If user has previously synced with cloud (hasSyncedBefore = true), the cloud set
 * is authoritative for deletions: any local item missing from cloud is removed
 * (unless created locally after the cloud fetch or marked active).
 * If first-time sync (hasSyncedBefore = false), it performs a union merge so guest characters upload.
 */
export function reconcileCloudPull(localList = [], cloudList = [], deletedIds = {}, hasSyncedBefore = false) {
  if (!hasSyncedBefore) {
    return mergeLocalAndCloud(localList, cloudList, deletedIds);
  }

  // Authoritative cloud reconciliation:
  // Cloud items filtered by tombstones
  const cloudMap = new Map();
  for (const item of cloudList) {
    if (item && item.id) {
      cloudMap.set(item.id, item);
    }
  }

  // Keep local items only if they exist in cloud (with LWW), or if newly created locally
  return mergeLocalAndCloud(
    localList.filter((localItem) => cloudMap.has(localItem.id)),
    cloudList,
    deletedIds
  );
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

/**
 * Deletes a character record from Supabase.
 */
/**
 * Deletes a character record from Supabase.
 */
export async function deleteCloudCharacter(client, userId, characterId) {
  if (!client || !userId || !characterId) {
    return { success: true };
  }

  try {
    const { error } = await client
      .from('characters')
      .delete()
      .eq('id', characterId)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('deleteCloudCharacter error:', error);
    return { success: false, error };
  }
}

/**
 * Deletes a homebrew spell record from Supabase.
 */
export async function deleteCloudHomebrew(client, userId, spellId) {
  if (!client || !userId || !spellId) {
    return { success: true };
  }

  try {
    const { error } = await client
      .from('homebrew_spells')
      .delete()
      .eq('id', spellId)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('deleteCloudHomebrew error:', error);
    return { success: false, error };
  }
}

/**
 * Subscribes to real-time changes on characters and homebrew_spells for this user.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToUserChanges(client, userId, {
  onCharacterChange,
  onCharacterDelete,
  onHomebrewChange,
  onHomebrewDelete,
} = {}) {
  if (!client || !userId) {
    return () => {};
  }

  const channel = client
    .channel(`user_sync:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'characters',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onCharacterDelete?.(payload.old?.id);
        } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const row = payload.new;
          if (row) {
            onCharacterChange?.({
              ...(row.data || {}),
              id: row.id,
              name: row.name || row.data?.name,
              className: row.class_name || row.data?.className,
              level: row.level || row.data?.level,
              updated_at: row.updated_at,
            });
          }
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'homebrew_spells',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onHomebrewDelete?.(payload.old?.id);
        } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const row = payload.new;
          if (row) {
            onHomebrewChange?.({
              ...(row.data || {}),
              id: row.id,
              name: row.name || row.data?.name,
              updated_at: row.updated_at,
            });
          }
        }
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
