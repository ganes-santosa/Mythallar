import { describe, it, expect } from 'vitest';
import { clean5eText } from './textCleaner';

describe('clean5eText', () => {
  it('cleans damage tags', () => {
    expect(clean5eText('deals {@damage 1d6} acid damage')).toBe('deals 1d6 acid damage');
  });

  it('cleans condition tags', () => {
    expect(clean5eText('target is {@condition charmed}')).toBe('target is charmed');
  });

  it('cleans spell tags with source', () => {
    expect(clean5eText('such as {@spell fireball|phb}')).toBe('such as fireball');
  });

  it('cleans dice tags with display override', () => {
    expect(clean5eText('roll {@dice 1d20+4|18}')).toBe('roll 18');
  });

  it('cleans filter tags with display override', () => {
    expect(clean5eText('transform into {@filter Large or smaller beast|bestiary|challenge rating=[&0;&4]}')).toBe('transform into Large or smaller beast');
  });

  it('handles strings without tags or falsy input', () => {
    expect(clean5eText('simple text')).toBe('simple text');
    expect(clean5eText('')).toBe('');
    expect(clean5eText(null)).toBe('');
  });
});
