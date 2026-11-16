import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadFeatsCatalogue,
  getCachedFeatsCatalogue,
  resetFeatsCatalogueCache,
  matchFeatSuggestions,
} from './featsCatalogue';

describe('featsCatalogue', () => {
  beforeEach(() => {
    resetFeatsCatalogueCache();
    vi.restoreAllMocks();
  });

  it('matches suggestions prioritizing prefix matches', () => {
    const list = [
      { name: 'Spell Sniper', source: 'XPHB' },
      { name: 'War Caster', source: 'XPHB' },
      { name: 'War Leader', source: 'HB' },
      { name: 'Great Weapon Master', source: 'XPHB' },
    ];

    const results = matchFeatSuggestions('war', list);
    expect(results.map((r) => r.name)).toEqual(['War Caster', 'War Leader']);

    const weaponResults = matchFeatSuggestions('weapon', list);
    expect(weaponResults.map((r) => r.name)).toEqual(['Great Weapon Master']);
  });

  it('returns empty array if query has fewer than 2 characters', () => {
    const list = [{ name: 'War Caster' }];
    expect(matchFeatSuggestions('w', list)).toEqual([]);
    expect(matchFeatSuggestions('', list)).toEqual([]);
    expect(matchFeatSuggestions(null, list)).toEqual([]);
  });

  it('fetches /data/feats.json and caches the result', async () => {
    const fakeData = [{ name: 'Lucky', source: 'XPHB', trackedResource: { max: 3, resetOn: 'LR' } }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeData,
    });

    const first = await loadFeatsCatalogue();
    expect(first).toEqual(fakeData);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const second = await loadFeatsCatalogue();
    expect(second).toEqual(fakeData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(getCachedFeatsCatalogue()).toEqual(fakeData);
  });

  it('handles fetch errors gracefully without breaking', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const result = await loadFeatsCatalogue();
    expect(result).toEqual([]);
    expect(getCachedFeatsCatalogue()).toEqual([]);
  });
});
