import { describe, it, expect, vi } from 'vitest';
import {
  mergeLocalAndCloud,
  fetchCloudData,
  syncCharactersToCloud,
  syncHomebrewToCloud,
  deleteCloudHomebrew,
  reconcileCloudPull,
  subscribeToUserChanges,
} from './syncService';

describe('syncService', () => {
  describe('mergeLocalAndCloud', () => {
    it('merges items by id preserving local changes if more recent or present', () => {
      const local = [
        { id: 'char1', name: 'Wizard Local', updated_at: 200 },
        { id: 'char2', name: 'Rogue Local', updated_at: 100 },
      ];
      const cloud = [
        { id: 'char1', name: 'Wizard Cloud', updated_at: 150 },
        { id: 'char3', name: 'Cleric Cloud', updated_at: 300 },
      ];

      const merged = mergeLocalAndCloud(local, cloud);

      expect(merged).toHaveLength(3);
      const c1 = merged.find((c) => c.id === 'char1');
      const c2 = merged.find((c) => c.id === 'char2');
      const c3 = merged.find((c) => c.id === 'char3');

      expect(c1.name).toBe('Wizard Local'); // higher timestamp wins
      expect(c2.name).toBe('Rogue Local');
      expect(c3.name).toBe('Cleric Cloud');
    });

    it('prefers cloud when cloud has newer updated_at timestamp', () => {
      const local = [{ id: 'char1', name: 'Wizard Local', updated_at: 100 }];
      const cloud = [{ id: 'char1', name: 'Wizard Cloud', updated_at: 200 }];
      const merged = mergeLocalAndCloud(local, cloud);
      expect(merged[0].name).toBe('Wizard Cloud');
    });

    it('filters out items present in deletedIds whose updated_at is older than or equal to deletion', () => {
      const local = [
        { id: 'c1', name: 'Keep', updated_at: 500 },
        { id: 'c2', name: 'Delete Local', updated_at: 300 },
      ];
      const cloud = [
        { id: 'c2', name: 'Delete Cloud', updated_at: 400 },
        { id: 'c3', name: 'Resurrect Cloud', updated_at: 200 },
      ];
      const deletedIds = {
        c2: 400, // exact or newer than c2's updated_at
        c3: 500, // deleted after c3 was created
      };

      const merged = mergeLocalAndCloud(local, cloud, deletedIds);
      expect(merged).toHaveLength(1);
      expect(merged[0].id).toBe('c1');
    });
  });

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
    it('authoritatively prunes local profiles that were deleted in cloud if already synced before', () => {
      // Local has Arthur and Mordenkainen
      const local = [
        { id: 'arthur', name: 'Arthur', updated_at: 100 },
        { id: 'mordenkainen', name: 'Mordenkainen', updated_at: 100 },
      ];
      // Cloud only has Arthur (Mordenkainen was deleted on another device)
      const cloud = [
        { id: 'arthur', name: 'Arthur', updated_at: 100 },
      ];

      const reconciled = reconcileCloudPull(local, cloud, {}, true);
      expect(reconciled.map((p) => p.id)).toEqual(['arthur']);
    });

    it('merges new local items if first-time sync', () => {
      const local = [
        { id: 'local-1', name: 'Guest Character', updated_at: 100 },
      ];
      const cloud = [
        { id: 'cloud-1', name: 'Existing Cloud Character', updated_at: 100 },
      ];

      // hasSyncedBefore = false
      const reconciled = reconcileCloudPull(local, cloud, {}, false);
      expect(reconciled).toHaveLength(2);
      expect(reconciled.map((p) => p.id)).toContain('local-1');
      expect(reconciled.map((p) => p.id)).toContain('cloud-1');
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
});
