import { describe, it, expect, vi } from 'vitest';
import {
  mergeLocalAndCloud,
  fetchCloudData,
  syncCharactersToCloud,
  syncHomebrewToCloud,
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
});
