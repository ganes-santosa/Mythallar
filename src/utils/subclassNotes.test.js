import { describe, it, expect } from 'vitest';
import {
  formatSubclassNoteTitle,
  buildSubclassNoteContent,
  createSubclassNote,
  autoAddSubclassNote,
} from './subclassNotes';

describe('subclassNotes', () => {
  describe('formatSubclassNoteTitle', () => {
    it('returns the subclass name as the note title', () => {
      expect(formatSubclassNoteTitle('School of Evocation', 'Wizard', 'Evocation')).toBe('School of Evocation');
      expect(formatSubclassNoteTitle('School of Enchantment', 'Wizard', 'Enchantment')).toBe('School of Enchantment');
      expect(formatSubclassNoteTitle('Battle Master', 'Fighter', 'Battle Master')).toBe('Battle Master');
      expect(formatSubclassNoteTitle('Life Domain', 'Cleric', 'Life')).toBe('Life Domain');
      expect(formatSubclassNoteTitle('Arcane Trickster', 'Rogue')).toBe('Arcane Trickster');
    });

    it('handles fallbacks when values are missing', () => {
      expect(formatSubclassNoteTitle('', 'Wizard', 'Evocation')).toBe('Evocation');
      expect(formatSubclassNoteTitle('', 'Wizard')).toBe('Wizard Subclass');
      expect(formatSubclassNoteTitle('', '')).toBe('Subclass Features');
      expect(formatSubclassNoteTitle('Champion', '')).toBe('Champion');
    });
  });

  describe('buildSubclassNoteContent', () => {
    const mockEvocationSubclass = {
      name: 'School of Evocation',
      shortName: 'Evocation',
      source: 'PHB',
      features: [
        {
          name: 'School of Evocation',
          level: 2,
          description: 'You focus your study on magic that creates powerful elemental effects.',
        },
        {
          name: 'Evocation Savant',
          level: 2,
          description: 'Beginning when you select this school at 2nd level, copy cost is halved.',
        },
        {
          name: 'Sculpt Spells',
          level: 2,
          description: 'You can create pockets of relative safety.\n\nCreatures take no damage.',
        },
        {
          name: 'Potent Cantrip',
          level: 6,
          description: 'Your damaging cantrips affect even creatures that avoid the brunt.',
        },
      ],
    };

    it('formats official subclass source, intro, and features with subheading tags, levels, and clean paragraph breaks without redundant subclass name heading', () => {
      const content = buildSubclassNoteContent('Wizard', 'School of Evocation', mockEvocationSubclass);

      expect(content).toContain("Source: Player's Handbook (2014)");
      expect(content).not.toContain('<span data-size="heading"><b>School of Evocation</b></span>');
      expect(content).toContain('You focus your study on magic that creates powerful elemental effects.');
      expect(content).toContain('<span data-size="subheading"><b>Evocation Savant</b></span> <i>(Level 2)</i>');
      expect(content).toContain('<span data-size="subheading"><b>Sculpt Spells</b></span> <i>(Level 2)</i>');
      expect(content).toContain('<span data-size="subheading"><b>Potent Cantrip</b></span> <i>(Level 6)</i>');
    });

    it('formats bullet lists with single line breaks while keeping paragraphs separated by double breaks', () => {
      const mockBladesongSubclass = {
        name: 'Bladesinging',
        shortName: 'Bladesinging',
        source: 'TCE',
        features: [
          {
            name: 'Bladesong',
            level: 2,
            description: 'Starting at 2nd level, invoke Bladesong.\n\nYou can use a bonus action.\n\nWhile active:\n\n• AC bonus\n\n• Speed bonus\n\nYou can use this feature.',
          },
        ],
      };

      const content = buildSubclassNoteContent('Wizard', 'Bladesinging', mockBladesongSubclass);

      expect(content).toContain('invoke Bladesong.<br><br>You can use a bonus action.');
      expect(content).toContain('While active:<br>• AC bonus<br>• Speed bonus<br><br>You can use this feature.');
    });

    it('provides clean fallback content for custom subclasses without features', () => {
      const content = buildSubclassNoteContent('Sorcerer', 'Pyromancer', null);
      expect(content).toContain('Custom Pyromancer (Sorcerer)');
      expect(content).toContain('Record your subclass features and notes here.');
    });
  });

  describe('createSubclassNote', () => {
    it('creates a note object matching the notes schema', () => {
      const note = createSubclassNote('Wizard', 'School of Evocation', {
        name: 'School of Evocation',
        shortName: 'Evocation',
        source: 'PHB',
        features: [{ name: 'Sculpt Spells', level: 2, description: 'Safety pockets' }],
      });

      expect(note.id).toMatch(/^note_subclass_/);
      expect(note.title).toBe('School of Evocation');
      expect(note.content).toContain('Sculpt Spells');
      expect(note.pinned).toBe(false);
      expect(note.createdAt).toBeDefined();
      expect(note.updatedAt).toBeDefined();
    });
  });

  describe('autoAddSubclassNote', () => {
    it('prepends new subclass note to character sheet notes', () => {
      const character = {
        id: 'c1',
        sheet: {
          notes: [{ id: 'n1', title: 'Quests', content: 'Find orb' }],
        },
      };

      const result = autoAddSubclassNote({
        character,
        className: 'Wizard',
        subclassName: 'School of Evocation',
        subclassObj: {
          name: 'School of Evocation',
          shortName: 'Evocation',
          source: 'PHB',
          features: [{ name: 'Sculpt Spells', level: 2, description: 'Safety' }],
        },
      });

      expect(result.sheet.notes).toHaveLength(2);
      expect(result.sheet.notes[0].title).toBe('School of Evocation');
      expect(result.sheet.notes[1].title).toBe('Quests');
    });

    it('does not duplicate note if note with same title already exists', () => {
      const character = {
        id: 'c1',
        sheet: {
          notes: [{ id: 'n1', title: 'School of Evocation', content: 'Existing note' }],
        },
      };

      const result = autoAddSubclassNote({
        character,
        className: 'Wizard',
        subclassName: 'School of Evocation',
        subclassObj: {
          name: 'School of Evocation',
          shortName: 'Evocation',
          source: 'PHB',
          features: [],
        },
      });

      expect(result.sheet.notes).toHaveLength(1);
      expect(result.sheet.notes[0].content).toBe('Existing note');
    });

    it('initializes sheet notes if character had no sheet', () => {
      const character = { id: 'c2' };
      const result = autoAddSubclassNote({
        character,
        className: 'Fighter',
        subclassName: 'Battle Master',
        subclassObj: {
          name: 'Battle Master',
          source: 'PHB',
          features: [{ name: 'Combat Superiority', level: 3, description: 'Dice' }],
        },
      });

      expect(result.sheet.notes).toHaveLength(1);
      expect(result.sheet.notes[0].title).toBe('Battle Master');
    });
  });
});
