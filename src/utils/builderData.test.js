import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadBuilderData,
  getCachedClasses,
  getCachedSpecies,
  getCachedBackgrounds,
  resetBuilderDataCache,
} from './builderData';

describe('builderData loader', () => {
  beforeEach(() => {
    resetBuilderDataCache();
    vi.restoreAllMocks();
  });

  it('fetches classes, species, and backgrounds on demand and caches results', async () => {
    const fakeClasses = [{ id: 'fighter-2024', name: 'Fighter', edition: '2024' }];
    const fakeSpecies = [{ id: 'human-2024', name: 'Human', edition: '2024' }];
    const fakeBg = [{ id: 'acolyte-2024', name: 'Acolyte', edition: '2024' }];

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('classes.json')) return Promise.resolve({ ok: true, json: async () => fakeClasses });
      if (url.includes('species.json')) return Promise.resolve({ ok: true, json: async () => fakeSpecies });
      if (url.includes('backgrounds.json')) return Promise.resolve({ ok: true, json: async () => fakeBg });
      return Promise.resolve({ ok: false });
    });

    const data = await loadBuilderData();
    expect(data.classes).toEqual(fakeClasses);
    expect(data.species).toEqual(fakeSpecies);
    expect(data.backgrounds).toEqual(fakeBg);

    // Caches correctly
    expect(getCachedClasses('2024')).toEqual(fakeClasses);
    expect(getCachedSpecies('2024')).toEqual(fakeSpecies);
    expect(getCachedBackgrounds('2024')).toEqual(fakeBg);

    // Second load does not re-fetch
    expect(global.fetch).toHaveBeenCalledTimes(3);
    await loadBuilderData();
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('returns empty arrays gracefully on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const data = await loadBuilderData();
    expect(data.classes).toEqual([]);
    expect(data.species).toEqual([]);
    expect(data.backgrounds).toEqual([]);
  });
});
