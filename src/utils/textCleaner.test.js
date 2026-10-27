import { describe, it, expect } from 'vitest';
import { clean5eText, parseEntries } from './textCleaner';

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

describe('parseEntries', () => {
  it('renders named list items with entries arrays (e.g. Command, Create or Destroy Water)', () => {
    const raw = [
      'You do one of the following:',
      {
        type: 'list',
        style: 'list-hang-notitle',
        items: [
          {
            type: 'item',
            name: 'Create Water',
            entries: ['You create up to 10 gallons of clean water.'],
          },
          {
            type: 'item',
            name: 'Destroy Water',
            entries: ['You destroy up to 10 gallons of water in a {@variantrule Cube [Area of Effect]|XPHB|Cube}.'],
          },
        ],
      },
    ];

    expect(parseEntries(raw)).toEqual([
      'You do one of the following:',
      '• Create Water: You create up to 10 gallons of clean water.',
      '• Destroy Water: You destroy up to 10 gallons of water in a Cube [Area of Effect].',
    ]);
  });

  it('preserves nested lists inside named entries blocks (e.g. Hallow, Guards and Wards)', () => {
    const raw = [
      {
        type: 'entries',
        name: 'Extra Effect',
        entries: [
          'You bind an extra effect to the area from the list below:',
          {
            type: 'list',
            items: [
              { type: 'item', name: 'Courage', entries: ['Frightened immune.'] },
              'Simple string item.',
            ],
          },
        ],
      },
    ];

    expect(parseEntries(raw)).toEqual([
      'Extra Effect: You bind an extra effect to the area from the list below:',
      '• Courage: Frightened immune.',
      '• Simple string item.',
    ]);
  });
});

