import { describe, it, expect, vi } from 'vitest';
import {
  fingerprint,
  changedItems,
  buildSynced,
  isVisibleProfile,
  splitForPull,
  localConflictCopies,
  loadPromptedLocalIds,
  savePromptedLocalIds,
  loadPending,
  savePending,
  flushPendingDeletes,
  fetchCloudData,
  syncCharactersToCloud,
  syncHomebrewToCloud,
  deleteCloudHomebrew,
  reconcileCloudPull,
  subscribeToUserChanges,
} from './syncService';

describe('syncService', () => {
  describe('fetchCloudData', () => {
    it('returns empty lists if client is null or user is missing', async () => {
      const res = await fetchCloudData(null, null);
      expect(res.characters).toEqual([]);
      expect(res.homebrewSpells).toEqual([]);
    });

    it('queries characters and homebrew tables when client provided', async () => {
      const mockClient = {
        from: vi.fn((table) => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => {
              if (table === 'characters') {
                return Promise.resolve({
                  data: [{ id: 'c1', name: 'Elminster', data: { id: 'c1', name: 'Elminster' } }],
                  error: null,
                });
              }
              return Promise.resolve({
                data: [{ id: 'hb1', name: 'Solar Ray', data: { id: 'hb1', name: 'Solar Ray' } }],
                error: null,
              });
            }),
          })),
        })),
      };

      const res = await fetchCloudData(mockClient, 'user-123');
      expect(res.characters).toHaveLength(1);
      expect(res.characters[0].name).toBe('Elminster');
      expect(res.homebrewSpells).toHaveLength(1);
      expect(res.homebrewSpells[0].name).toBe('Solar Ray');
    });
  });

  describe('fetchCloudData errors', () => {
    it('throws when supabase returns an error so callers never treat failure as empty cloud', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: null, error: { message: 'network down' } })),
          })),
        })),
      };
      await expect(fetchCloudData(mockClient, 'user-123')).rejects.toBeTruthy();
    });
  });

  describe('fingerprint', () => {
    it('ignores updated_at so realtime echoes of our own push can be detected', () => {
      expect(fingerprint({ id: 'a', n: 1, updated_at: 1 })).toBe(fingerprint({ id: 'a', n: 1, updated_at: 2 }));
      expect(fingerprint({ id: 'a', n: 1 })).not.toBe(fingerprint({ id: 'a', n: 2 }));
    });
  });

  describe('syncCharactersToCloud', () => {
    it('upserts characters into characters table', async () => {
      const upsertMock = vi.fn(() => Promise.resolve({ error: null }));
      const mockClient = {
        from: vi.fn(() => ({
          upsert: upsertMock,
        })),
      };

      const chars = [{ id: 'c1', name: 'Galan', className: 'Wizard', level: 3 }];
      const res = await syncCharactersToCloud(mockClient, 'user-123', chars);

      expect(res.success).toBe(true);
      expect(mockClient.from).toHaveBeenCalledWith('characters');
      expect(upsertMock).toHaveBeenCalled();
    });
  });

  describe('syncHomebrewToCloud', () => {
    it('upserts homebrew spells into homebrew_spells table', async () => {
      const upsertMock = vi.fn(() => Promise.resolve({ error: null }));
      const mockClient = {
        from: vi.fn(() => ({
          upsert: upsertMock,
        })),
      };

      const spells = [{ id: 'hb-1', name: 'Force Blast', level: 1 }];
      const res = await syncHomebrewToCloud(mockClient, 'user-123', spells);

      expect(res.success).toBe(true);
      expect(mockClient.from).toHaveBeenCalledWith('homebrew_spells');
      expect(upsertMock).toHaveBeenCalled();
    });
  });

  describe('deleteCloudCharacter', () => {
    it('deletes character from characters table by id and user_id', async () => {
      const eqUserMock = vi.fn(() => Promise.resolve({ error: null }));
      const eqIdMock = vi.fn(() => ({ eq: eqUserMock }));
      const deleteMock = vi.fn(() => ({ eq: eqIdMock }));
      const mockClient = {
        from: vi.fn(() => ({
          delete: deleteMock,
        })),
      };

      const { deleteCloudCharacter } = await import('./syncService');
      const res = await deleteCloudCharacter(mockClient, 'user-123', 'char-1');

      expect(res.success).toBe(true);
      expect(mockClient.from).toHaveBeenCalledWith('characters');
      expect(deleteMock).toHaveBeenCalled();
      expect(eqIdMock).toHaveBeenCalledWith('id', 'char-1');
      expect(eqUserMock).toHaveBeenCalledWith('user_id', 'user-123');
    });
  });

  describe('deleteCloudHomebrew', () => {
    it('deletes homebrew spell from homebrew_spells table by id and user_id', async () => {
      const eqUserMock = vi.fn(() => Promise.resolve({ error: null }));
      const eqIdMock = vi.fn(() => ({ eq: eqUserMock }));
      const deleteMock = vi.fn(() => ({ eq: eqIdMock }));
      const mockClient = {
        from: vi.fn(() => ({
          delete: deleteMock,
        })),
      };

      const res = await deleteCloudHomebrew(mockClient, 'user-123', 'spell-1');
      expect(res.success).toBe(true);
      expect(mockClient.from).toHaveBeenCalledWith('homebrew_spells');
      expect(eqIdMock).toHaveBeenCalledWith('id', 'spell-1');
      expect(eqUserMock).toHaveBeenCalledWith('user_id', 'user-123');
    });
  });

  describe('reconcileCloudPull', () => {
    const a = { id: 'a', name: 'Arthur' };
    const m = { id: 'm', name: 'Mordenkainen' };

    it('drops local items that were synced before but are gone from cloud (remote delete)', () => {
      const synced = { a: fingerprint(a), m: fingerprint(m) };
      expect(reconcileCloudPull([a, m], [a], synced).map((p) => p.id)).toEqual(['a']);
    });

    it('keeps never-synced local items so guest characters upload', () => {
      const guest = { id: 'g', name: 'Guest' };
      const cloud = { id: 'c', name: 'Cloud' };
      const ids = reconcileCloudPull([guest], [cloud], {}).map((p) => p.id);
      expect(ids).toEqual(['c', 'g']);
    });

    it('restores cloud item that was deleted locally while signed out (cloud is truth)', () => {
      const synced = { a: fingerprint(a) };
      expect(reconcileCloudPull([], [a], synced)).toEqual([a]);
    });

    it('cloud wins over local copy when cloud changed', () => {
      const synced = { a: fingerprint(a) };
      const cloudNew = { id: 'a', name: 'Arthur II' };
      expect(reconcileCloudPull([a], [cloudNew], synced)).toEqual([cloudNew]);
    });

    it('keeps unpushed local edits when cloud is unchanged since last sync', () => {
      const synced = { a: fingerprint(a) };
      const edited = { id: 'a', name: 'Edited Offline' };
      expect(reconcileCloudPull([edited], [a], synced)).toEqual([edited]);
    });
  });

  describe('workspace visibility', () => {
    it('shows Local Only and own characters, hides other accounts', () => {
      expect(isVisibleProfile({ id: 'l' }, 'u1')).toBe(true);
      expect(isVisibleProfile({ id: 'a', syncOwner: 'u1' }, 'u1')).toBe(true);
      expect(isVisibleProfile({ id: 'b', syncOwner: 'u2' }, 'u1')).toBe(false);
      expect(isVisibleProfile({ id: 'l' }, null)).toBe(true);
      expect(isVisibleProfile({ id: 'a', syncOwner: 'u1' }, null)).toBe(false);
    });

    it('fingerprint ignores syncOwner', () => {
      expect(fingerprint({ id: 'a', syncOwner: 'u1' })).toBe(fingerprint({ id: 'a' }));
    });

    it('splitForPull adopts local-only characters already in cloud, leaves others alone', () => {
      const all = [
        { id: 'own', syncOwner: 'u1' },
        { id: 'inCloud' },
        { id: 'guest' },
        { id: 'other', syncOwner: 'u2' },
      ];
      const { mine, others } = splitForPull(all, new Set(['inCloud']), 'u1');
      expect(mine.map((p) => p.id)).toEqual(['own', 'inCloud']);
      expect(others.map((p) => p.id)).toEqual(['guest', 'other']);
    });
  });

  describe('localConflictCopies', () => {
    it('copies only Local Only characters that differ from their cloud twin', () => {
      const same = { id: 's', name: 'Same' };
      const diff = { id: 'd', name: 'Mine' };
      const owned = { id: 'o', name: 'Owned', syncOwner: 'u1' };
      const cloud = [
        { id: 's', name: 'Same', updated_at: 5, syncOwner: 'u1' },
        { id: 'd', name: 'Theirs', syncOwner: 'u1' },
        { id: 'o', name: 'Other', syncOwner: 'u1' },
      ];
      const copies = localConflictCopies([same, diff, owned], cloud, () => 'new1');
      expect(copies).toEqual([{ id: 'new1', name: 'Mine (Local Copy)' }]);
    });
  });

  describe('promptedLocalIds', () => {
    it('saves and loads prompted local IDs per user', () => {
      expect(loadPromptedLocalIds('u1')).toEqual(new Set());
      savePromptedLocalIds('u1', ['c1', 'c2']);
      expect(loadPromptedLocalIds('u1')).toEqual(new Set(['c1', 'c2']));

      savePromptedLocalIds('u1', ['c2', 'c3']);
      expect(loadPromptedLocalIds('u1')).toEqual(new Set(['c1', 'c2', 'c3']));

      // Isolated by user
      expect(loadPromptedLocalIds('u2')).toEqual(new Set());
    });
  });

  describe('changedItems', () => {
    it('returns only new or modified items', () => {
      const a = { id: 'a', name: 'A' };
      const b = { id: 'b', name: 'B' };
      const c = { id: 'c', name: 'C' };
      const synced = { a: fingerprint(a), b: fingerprint({ id: 'b', name: 'old' }) };
      expect(changedItems([a, b, c], synced).map((i) => i.id)).toEqual(['b', 'c']);
    });
  });

  describe('buildSynced', () => {
    it('records fingerprints of adopted cloud items and keeps old one when local edits won', () => {
      const a = { id: 'a', name: 'A' };
      const b = { id: 'b', name: 'B' };
      const localB = { id: 'b', name: 'B local' };
      const synced = { b: fingerprint(b), x: 'gone' };
      const result = [a, localB];
      expect(buildSynced(result, [a, b], synced)).toEqual({ a: fingerprint(a), b: fingerprint(b) });
    });
  });

  describe('subscribeToUserChanges', () => {
    it('subscribes to postgres_changes on user channel and returns unsubscribe handle', () => {
      const onMock = vi.fn().mockReturnThis();
      const subscribeMock = vi.fn().mockReturnThis();
      const removeChannelMock = vi.fn();
      const mockChannel = {
        on: onMock,
        subscribe: subscribeMock,
      };
      const mockClient = {
        channel: vi.fn(() => mockChannel),
        removeChannel: removeChannelMock,
      };

      const unsubscribe = subscribeToUserChanges(mockClient, 'user-123', {});
      expect(mockClient.channel).toHaveBeenCalledWith('user_sync:user-123');
      expect(onMock).toHaveBeenCalledTimes(2); // characters and homebrew_spells
      expect(subscribeMock).toHaveBeenCalled();

      unsubscribe();
      expect(removeChannelMock).toHaveBeenCalledWith(mockChannel);
    });
  });

  describe('flushPendingDeletes', () => {
    it('flushes confirmed deletes and preserves unconfirmed ones on failure', async () => {
      savePending('user-flush', 'characters', ['char-1', 'char-2']);
      const deleteFn = vi.fn(async (_client, _user, id) => {
        return id === 'char-1' ? { success: true } : { success: false, error: 'network error' };
      });

      const allDone = await flushPendingDeletes({}, 'user-flush', 'characters', deleteFn);
      expect(allDone).toBe(false);
      expect(loadPending('user-flush', 'characters')).toEqual(['char-2']);

      // Retry when network recovers
      deleteFn.mockImplementation(async () => ({ success: true }));
      const retryDone = await flushPendingDeletes({}, 'user-flush', 'characters', deleteFn);
      expect(retryDone).toBe(true);
      expect(loadPending('user-flush', 'characters')).toEqual([]);
    });
  });
});
