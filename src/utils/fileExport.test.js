import { describe, it, expect } from 'vitest';
import { validateAndImportCharacterJSON } from './fileExport';

describe('validateAndImportCharacterJSON', () => {
  it('successfully validates and normalizes a valid character JSON', () => {
    const validJson = JSON.stringify({
      name: 'Raistlin',
      className: 'Wizard',
      level: 7,
      spells: [{ id: 'fireball', prepared: true }],
      slotsUsed: { 1: 1 },
      customSlots: {},
    });

    const result = validateAndImportCharacterJSON(validJson);
    expect(result.error).toBeUndefined();
    expect(result.character.name).toBe('Raistlin');
    expect(result.character.className).toBe('Wizard');
    expect(result.character.level).toBe(7);
    expect(result.character.spells.length).toBe(1);
    expect(result.character.id).toBeDefined();
  });

  it('preserves copying state on imported spells', () => {
    const validJson = JSON.stringify({
      name: 'Raistlin',
      className: 'Wizard',
      level: 7,
      spells: [
        { id: 'fireball', prepared: false, copying: true },
        { id: 'shield', prepared: true },
      ],
    });

    const result = validateAndImportCharacterJSON(validJson);
    expect(result.error).toBeUndefined();
    expect(result.character.spells).toEqual([
      { id: 'fireball', prepared: false, copying: true },
      { id: 'shield', prepared: true, copying: false },
    ]);
  });

  it('rejects malformed JSON', () => {
    const badJson = '{ invalid json';
    const result = validateAndImportCharacterJSON(badJson);
    expect(result.error).toMatch(/Invalid JSON/i);
  });

  it('rejects JSON that lacks essential character fields', () => {
    const missingFields = JSON.stringify({ title: 'Not a character' });
    const result = validateAndImportCharacterJSON(missingFields);
    expect(result.error).toMatch(/Missing required character fields/i);
  });

  it('preserves full character sheet and multiclass classes on import', () => {
    const richJson = JSON.stringify({
      name: 'Arthur Blackburne',
      className: 'Wizard',
      level: 9,
      classes: [{ className: 'Wizard', level: 9 }],
      spells: [{ id: 'shield', prepared: true }],
      sheet: {
        identity: { subclass: 'School of Conjuration' },
        abilities: { str: 9, dex: 14, con: 15, int: 22, wis: 12, cha: 10 },
        vitals: { hpCurrent: 73, hpMax: 73, ac: 17 },
        items: [{ id: 'itm_1', name: 'Elven Chain Armor' }],
        trackedResources: [{ id: 'res_1', name: 'Lucky', current: 0, max: 3 }],
        feats: ['Alert', 'Lucky'],
      },
    });

    const result = validateAndImportCharacterJSON(richJson);
    expect(result.error).toBeUndefined();
    expect(result.character.classes).toEqual([{ className: 'Wizard', level: 9 }]);
    expect(result.character.sheet.identity.subclass).toBe('School of Conjuration');
    expect(result.character.sheet.abilities.int).toBe(22);
    expect(result.character.sheet.vitals.hpCurrent).toBe(73);
    expect(result.character.sheet.items[0].name).toBe('Elven Chain Armor');
    expect(result.character.sheet.trackedResources[0].name).toBe('Lucky');
    expect(result.character.sheet.feats).toEqual(['Alert', 'Lucky']);
  });
});
