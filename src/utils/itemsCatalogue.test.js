import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadItemsCatalogue,
  getCachedItemsCatalogue,
  resetItemsCatalogueCache,
  matchItemSuggestions,
} from './itemsCatalogue';

describe('itemsCatalogue', () => {
  beforeEach(() => {
    resetItemsCatalogueCache();
    vi.restoreAllMocks();
  });

  it('matches suggestions prioritizing prefix matches', () => {
    const list = [
      { name: 'Spell Scroll', source: 'DMG' },
      { name: 'Enduring Spellbook', source: 'XDMG' },
      { name: 'Enduring Amulet', source: 'DMG' },
      { name: 'Bag of Holding', source: 'DMG' },
    ];

    const results = matchItemSuggestions('enduring', list);
    expect(results.map((r) => r.name)).toEqual(['Enduring Spellbook', 'Enduring Amulet']);

    const scrollResults = matchItemSuggestions('spell', list);
    expect(scrollResults.map((r) => r.name)).toEqual(['Spell Scroll', 'Enduring Spellbook']);
  });

  it('returns empty array if query has fewer than 2 characters', () => {
    const list = [{ name: 'Bag of Holding' }];
    expect(matchItemSuggestions('b', list)).toEqual([]);
    expect(matchItemSuggestions('', list)).toEqual([]);
    expect(matchItemSuggestions(null, list)).toEqual([]);
  });

  it('fetches /data/items.json and caches the result', async () => {
    const fakeData = [{ name: 'Ring of Protection', category: 'magic' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeData,
    });

    const first = await loadItemsCatalogue();
    expect(first).toEqual(fakeData);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const second = await loadItemsCatalogue();
    expect(second).toEqual(fakeData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(getCachedItemsCatalogue()).toEqual(fakeData);
  });

  it('handles fetch errors gracefully without breaking', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const result = await loadItemsCatalogue();
    expect(result).toEqual([]);
    expect(getCachedItemsCatalogue()).toEqual([]);
  });
});
