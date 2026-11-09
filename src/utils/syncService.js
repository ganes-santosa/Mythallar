function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/**
 * Content fingerprint independent of key order (Postgres jsonb reorders keys) and of
 * `updated_at`, so we can tell real edits from echoes of our own pushes.
 */
export function fingerprint(item) {
  if (!item) return '';
  const { updated_at: _u, syncOwner: _s, ...rest } = item;
  return stableStringify(rest);
}

/**
 * A character is Local Only when it has no `syncOwner`; otherwise it belongs to that
 * account's cloud. Visible = Local Only plus the signed-in account's characters.
 */
export function isVisibleProfile(profile, userId) {
  return !!profile && (!profile.syncOwner || profile.syncOwner === userId);
}

/**
 * Splits all stored characters for a pull. `mine` = already owned by this account, plus
 * Local Only characters whose id already exists in the cloud (same character synced by an
 * older version or another device: adopt, cloud copy wins). `others` stay untouched.
 */
export function splitForPull(all = [], cloudIds = new Set(), userId) {
  const mine = [];
  const others = [];
  for (const p of all) {
    if (p && (p.syncOwner === userId || (!p.syncOwner && cloudIds.has(p.id)))) mine.push(p);
    else others.push(p);
  }
  return { mine, others };
}

/**
 * Local Only characters whose id exists in the cloud with different content would be
 * overwritten by the cloud copy. Returns Local Only copies (new ids) so no edits are lost.
 */
export function localConflictCopies(mine = [], cloudList = [], makeId) {
  const byId = new Map(cloudList.map((c) => [c.id, c]));
  return mine
    .filter((l) => !l.syncOwner && byId.has(l.id) && fingerprint(byId.get(l.id)) !== fingerprint(l))
    .map((l) => ({ ...l, id: makeId(), name: `${l.name} (Local Copy)` }));
}

/**
 * Cloud is the source of truth.
 * `synced` maps id -> fingerprint of the last state known to match the cloud on this device.
 * - Cloud item wins, except when local has unpushed edits (fingerprint differs from synced)
 *   and cloud is unchanged since (fingerprint equals synced): keep local, it will push.
 * - Local item absent from cloud: kept only if never synced (guest/offline creation to upload).
 *   If it was synced before, it was deleted remotely: dropped.
 * - Local deletions made while signed out never reach the cloud; cloud item returns.
 */
export function reconcileCloudPull(localList = [], cloudList = [], synced = {}) {
  const localById = new Map(localList.filter((i) => i && i.id).map((i) => [i.id, i]));
  const cloudIds = new Set();
  const result = [];

  for (const c of cloudList) {
    if (!c || !c.id) continue;
    cloudIds.add(c.id);
    const l = localById.get(c.id);
    const known = synced[c.id];
    const localDirty = l && known !== undefined && fingerprint(l) !== known;
    result.push(localDirty && fingerprint(c) === known ? l : c);
  }

  for (const l of localById.values()) {
    if (!cloudIds.has(l.id) && synced[l.id] === undefined) result.push(l);
  }
  return result;
}

/**
 * New synced map after a pull: cloud items we adopted record the cloud fingerprint;
 * cloud items where local unpushed edits won keep the old fingerprint (stays dirty);
 * everything else (remotely deleted, guest-only) is absent.
 */
export function buildSynced(result = [], cloudList = [], synced = {}) {
  const chosen = new Set(result);
  const next = {};
  for (const c of cloudList) {
    if (!c || !c.id) continue;
    next[c.id] = chosen.has(c) ? fingerprint(c) : synced[c.id];
  }
  return next;
}

const SYNC_STATE_PREFIX = 'mythallar_sync_v2';

function readState(userId, kind, part) {
  try {
    const parsed = JSON.parse(localStorage.getItem(`${SYNC_STATE_PREFIX}:${part}:${kind}:${userId}`) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writeState(userId, kind, part, value) {
  try {
    localStorage.setItem(`${SYNC_STATE_PREFIX}:${part}:${kind}:${userId}`, JSON.stringify(value));
  } catch (err) {
    console.error('Error saving sync state', err);
  }
}

const PROMPTED_IDS_KEY = 'mythallar_prompted_local_ids_v1';

export function loadPromptedLocalIds(userId) {
  if (!userId) return new Set();
  try {
    const all = JSON.parse(localStorage.getItem(PROMPTED_IDS_KEY) || '{}');
    return new Set(Array.isArray(all?.[userId]) ? all[userId] : []);
  } catch {
    return new Set();
  }
}

export function savePromptedLocalIds(userId, ids = []) {
  if (!userId || !ids.length) return;
  try {
    const all = JSON.parse(localStorage.getItem(PROMPTED_IDS_KEY) || '{}') || {};
    const existing = Array.isArray(all[userId]) ? all[userId] : [];
    all[userId] = Array.from(new Set([...existing, ...ids]));
    localStorage.setItem(PROMPTED_IDS_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Error saving prompted local IDs', err);
  }
}

/** kind: 'characters' | 'homebrew'. Map id -> fingerprint last known equal to cloud. */
export const loadSynced = (userId, kind) => readState(userId, kind, 'synced') || {};
export const saveSynced = (userId, kind, map) => writeState(userId, kind, 'synced', map);

/** Retries cloud deletes recorded while signed in. Returns true when none remain. */
export async function flushPendingDeletes(client, userId, kind, deleteFn) {
  const ids = loadPending(userId, kind);
  const done = new Set();
  for (const id of ids) {
    if ((await deleteFn(client, userId, id)).success) done.add(id);
  }
  if (done.size) {
    savePending(userId, kind, loadPending(userId, kind).filter((id) => !done.has(id)));
  }
  return done.size === ids.length;
}

/** Items whose content differs from the last state known to match the cloud. */
export function changedItems(list = [], synced = {}) {
  return list.filter((i) => i && i.id && synced[i.id] !== fingerprint(i));
}

/** IDs deleted while signed in whose cloud delete has not been confirmed yet. */
export const loadPending = (userId, kind) => {
  const v = readState(userId, kind, 'pending');
  return Array.isArray(v) ? v : [];
};
export const savePending = (userId, kind, ids) => writeState(userId, kind, 'pending', ids);

/**
 * Fetches character and homebrew records for a given user from Supabase.
 */
export async function fetchCloudData(client, userId) {
  if (!client || !userId) {
    return { characters: [], homebrewSpells: [] };
  }

  // Throws on failure: an error must never look like an empty cloud.
  const [charRes, hbRes] = await Promise.all([
    client.from('characters').select('*').eq('user_id', userId),
    client.from('homebrew_spells').select('*').eq('user_id', userId),
  ]);
  if (charRes.error) throw charRes.error;
  if (hbRes.error) throw hbRes.error;

  const characters = (charRes.data || []).map((row) => ({
    ...(row.data || {}),
    id: row.id,
    name: row.name || row.data?.name,
    className: row.class_name || row.data?.className,
    level: row.level || row.data?.level,
    updated_at: row.updated_at,
    syncOwner: userId,
  }));

  const homebrewSpells = (hbRes.data || []).map((row) => ({
    ...(row.data || {}),
    id: row.id,
    name: row.name || row.data?.name,
    updated_at: row.updated_at,
    syncOwner: userId,
  }));

  return { characters, homebrewSpells };
}



/**
 * Upserts full character objects to Supabase.
 */
export async function syncCharactersToCloud(client, userId, characters = []) {
  if (!client || !userId || characters.length === 0) {
    return { success: true };
  }

  const rows = characters.map(({ syncOwner: _s, ...c }) => ({
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

  const rows = spells.map(({ syncOwner: _s, ...s }) => ({
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
              syncOwner: userId,
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
              syncOwner: userId,
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
