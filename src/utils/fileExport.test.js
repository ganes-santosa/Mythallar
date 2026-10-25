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
});
