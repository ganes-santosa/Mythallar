import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SpellbookView from './SpellbookView';

const mockCatalog = {
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    time: '1 action',
    range: '150 feet',
    entries: ['A bright streak flashes.'],
  },
  'acid-splash': {
    id: 'acid-splash',
    name: 'Acid Splash',
    level: 0,
    school: 'Conjuration',
    time: '1 action',
    range: '60 feet',
  },
};

const mockCharacter = {
  id: 'char_1',
  name: 'Mordenkainen',
  className: 'Wizard',
  level: 5,
  spells: [
    { id: 'fireball', prepared: true },
    { id: 'acid-splash', prepared: false },
  ],
};

describe('SpellbookView', () => {
  it('renders spells grouped into level sections', () => {
    render(
      <SpellbookView
        character={mockCharacter}
        catalog={mockCatalog}
        onTogglePrepare={vi.fn()}
        onCastSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
        onAddSpell={vi.fn()}
        onSelectSpell={vi.fn()}
      />
    );

    expect(screen.getAllByText(/Cantrips/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3rd Level/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Fireball')).toBeInTheDocument();
    expect(screen.getByText('Acid Splash')).toBeInTheDocument();

    // Toggling one level group only collapses that level, keeping other levels open
    fireEvent.click(screen.getByRole('button', { name: /3rd Level Spells/i }));
    expect(screen.queryByText('Fireball')).not.toBeInTheDocument();
    expect(screen.getByText('Acid Splash')).toBeInTheDocument();

    // Toggling it again re-opens it while Cantrips stays open
    fireEvent.click(screen.getByRole('button', { name: /3rd Level Spells/i }));
    expect(screen.getByText('Fireball')).toBeInTheDocument();
    expect(screen.getByText('Acid Splash')).toBeInTheDocument();
  });

  it('triggers onTogglePrepare when star/prepare button is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <SpellbookView
        character={mockCharacter}
        catalog={mockCatalog}
        onTogglePrepare={handleToggle}
        onCastSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
        onAddSpell={vi.fn()}
        onSelectSpell={vi.fn()}
      />
    );

    const prepBtn = screen.getByLabelText(/Toggle Prepared for Fireball/i);
    fireEvent.click(prepBtn);
    expect(handleToggle).toHaveBeenCalledWith('fireball');
  });

  it('triggers onCastSpell when quick-cast button clicked', () => {
    const handleCast = vi.fn();
    render(
      <SpellbookView
        character={mockCharacter}
        catalog={mockCatalog}
        onTogglePrepare={vi.fn()}
        onCastSpell={handleCast}
        onRemoveSpell={vi.fn()}
        onAddSpell={vi.fn()}
        onSelectSpell={vi.fn()}
      />
    );

    const castBtn = screen.getByLabelText(/Quick-Cast Fireball/i);
    fireEvent.click(castBtn);
    expect(handleCast).toHaveBeenCalledWith(mockCatalog.fireball);
  });

  it('triggers onRemoveSpell when remove button clicked', () => {
    const handleRemove = vi.fn();
    render(
      <SpellbookView
        character={mockCharacter}
        catalog={mockCatalog}
        onTogglePrepare={vi.fn()}
        onCastSpell={vi.fn()}
        onRemoveSpell={handleRemove}
        onAddSpell={vi.fn()}
        onSelectSpell={vi.fn()}
      />
    );

    const removeBtn = screen.getByLabelText(/Remove Fireball from spellbook/i);
    fireEvent.click(removeBtn);
    expect(handleRemove).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Click again to remove Fireball/i)).toHaveClass('text-red-500', 'bg-red-950/70');
    fireEvent.click(screen.getByLabelText(/Click again to remove Fireball/i));
    expect(handleRemove).toHaveBeenCalledWith('fireball');
  });

  it('handles drag drop of a new spell into dropzone', () => {
    const handleAdd = vi.fn();
    const { container } = render(
      <SpellbookView
        character={mockCharacter}
        catalog={mockCatalog}
        onTogglePrepare={vi.fn()}
        onCastSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
        onAddSpell={handleAdd}
        onSelectSpell={vi.fn()}
      />
    );

    const dropZone = container.querySelector('[data-testid="spellbook-dropzone"]');
    fireEvent.dragOver(dropZone, { dataTransfer: {} });
    fireEvent.drop(dropZone, {
      dataTransfer: { getData: () => 'shield' },
    });

    expect(handleAdd).toHaveBeenCalledWith('shield');
  });
  it('allows editing and resetting max prepared spells in Spellbook', () => {
    const handleUpdate = vi.fn();
    render(<SpellbookView character={{ ...mockCharacter, customMaxPrepared: 15 }} catalog={mockCatalog} onUpdateCharacter={handleUpdate} />);
    fireEvent.click(screen.getByLabelText(/Edit Max Prepared/i));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.click(screen.getByLabelText(/Save Max Prepared/i));
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ customMaxPrepared: 12 }));
  });

  it('does not count cantrips or copying spells toward the prepared spell limit', () => {
    const charWithPreparedCantripAndCopying = {
      ...mockCharacter,
      customMaxPrepared: 8,
      spells: [
        { id: 'acid-splash', prepared: true }, // cantrip (level 0): prepared, but excluded from limit
        { id: 'fireball', prepared: true, copying: true }, // copying: excluded from limit
      ],
    };

    render(
      <SpellbookView
        character={charWithPreparedCantripAndCopying}
        catalog={mockCatalog}
      />
    );

    expect(screen.getByText('0 / 8')).toBeInTheDocument();
  });

  it('displays Copying badge, copying requirements hint popover, and Finish Copying two-click confirm for Wizard copying spells', () => {
    const handleFinishCopying = vi.fn();
    const wizardCopyingChar = {
      ...mockCharacter,
      className: 'Wizard',
      spells: [{ id: 'fireball', prepared: false, copying: true }],
    };

    render(
      <SpellbookView
        character={wizardCopyingChar}
        catalog={mockCatalog}
        onFinishCopying={handleFinishCopying}
      />
    );

    // Spell name is greyed out while copying
    const spellNameEl = screen.getByText('Fireball');
    expect(spellNameEl).toHaveClass('text-slate-500');

    // Closed summary text ('150 feet') is obfuscated into magical glyphs while preserving structure
    expect(screen.queryByText('150 feet')).not.toBeInTheDocument();

    // Copying tag shown with Cast-button style, Prepare and Cast buttons hidden
    const copyingTag = screen.getByText('Copying');
    expect(copyingTag).toHaveClass('bg-dnd-panel', 'text-slate-300');
    expect(screen.queryByLabelText(/Toggle Prepared for Fireball/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Quick-Cast Fireball/i)).not.toBeInTheDocument();

    // Hint hidden until clicked
    expect(screen.queryByText(/Copying Requirements/i)).not.toBeInTheDocument();
    const hintBtn = screen.getByLabelText(/Copying requirements for Fireball/i);
    fireEvent.click(hintBtn);

    // 3rd-level spell: 6 hours, 150 gp; clicking hint does not expand accordion
    expect(screen.getByText(/Copying Requirements/i)).toBeInTheDocument();
    expect(screen.getByText(/6 hours/i)).toBeInTheDocument();
    expect(screen.getByText(/150 gp/i)).toBeInTheDocument();
    expect(screen.queryByText('Casting Time')).not.toBeInTheDocument();

    // Dismiss on outside click
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText(/Copying Requirements/i)).not.toBeInTheDocument();

    // Expanding the card shows ??? for Casting Time, Range, Components, Duration, keeps subheaders & Source legible, and obfuscates description
    fireEvent.click(spellNameEl);
    expect(screen.getByText('Casting Time')).toBeInTheDocument();
    expect(screen.getByText('Range')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('PHB')).toBeInTheDocument();
    expect(screen.getAllByText('???').length).toBeGreaterThanOrEqual(4);
    expect(screen.queryByText('A bright streak flashes.')).not.toBeInTheDocument();
    const obfuscatedParagraph = screen.getByTestId('spellbook-entries-fireball');
    expect(obfuscatedParagraph.textContent).toHaveLength('A bright streak flashes.'.length);
    expect(obfuscatedParagraph.textContent.endsWith('.')).toBe(true);
    expect(obfuscatedParagraph.textContent.split(' ')).toHaveLength(4);

    // Finish Copying uses Cast-button style when unarmed, two-click confirm when clicked (keeps same visible text)
    const finishBtn = screen.getByLabelText(/Finish copying Fireball/i);
    expect(finishBtn).toHaveClass('bg-dnd-panel', 'text-slate-300');
    expect(finishBtn).toHaveTextContent('Finish Copying');
    fireEvent.click(finishBtn);
    expect(handleFinishCopying).not.toHaveBeenCalled();
    const armedBtn = screen.getByLabelText(/Click again to finish copying Fireball/i);
    expect(armedBtn).toHaveClass('ring-green-400/70');
    expect(armedBtn).toHaveTextContent('Finish Copying');
    fireEvent.click(armedBtn);
    expect(handleFinishCopying).toHaveBeenCalledWith('fireball');
  });

  it('bypasses copying state when skipCopying is true', () => {
    const wizardCopyingChar = {
      ...mockCharacter,
      className: 'Wizard',
      spells: [{ id: 'fireball', prepared: false, copying: true }],
    };

    render(
      <SpellbookView
        character={wizardCopyingChar}
        catalog={mockCatalog}
        skipCopying={true}
      />
    );

    // No Copying badge, Prepare button is available
    expect(screen.queryByText('Copying')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Toggle Prepared for Fireball/i)).toBeInTheDocument();
    expect(screen.getByText('150 feet')).toBeInTheDocument();
  });

  it('shows Finish Copying All only for Wizards with copying spells and confirms in two clicks', () => {
    const handleFinishAll = vi.fn();
    const wizardCopyingChar = {
      ...mockCharacter,
      className: 'Wizard',
      spells: [{ id: 'fireball', prepared: false, copying: true }],
    };

    const { rerender } = render(
      <SpellbookView
        character={wizardCopyingChar}
        catalog={mockCatalog}
        onFinishCopyingAll={handleFinishAll}
      />
    );

    const finishAllBtn = screen.getByLabelText(/Finish copying all spells/i);
    expect(finishAllBtn).toBeInTheDocument();
    expect(finishAllBtn).toHaveClass('text-slate-300');
    expect(finishAllBtn).not.toHaveClass('text-amber-300');
    expect(finishAllBtn).toHaveTextContent('Finish Copying All');

    // First click arms (keeps same visible text), second click confirms
    fireEvent.click(finishAllBtn);
    expect(handleFinishAll).not.toHaveBeenCalled();
    const armedAllBtn = screen.getByLabelText(/Click again to finish copying all spells/i);
    expect(armedAllBtn).toHaveClass('ring-green-400/70');
    expect(armedAllBtn).toHaveTextContent('Finish Copying All');
    fireEvent.click(armedAllBtn);
    expect(handleFinishAll).toHaveBeenCalledTimes(1);

    // Hidden when no spells are copying
    rerender(
      <SpellbookView
        character={{ ...wizardCopyingChar, spells: [{ id: 'fireball', prepared: false, copying: false }] }}
        catalog={mockCatalog}
        onFinishCopyingAll={handleFinishAll}
      />
    );
    expect(screen.queryByLabelText(/Finish copying all spells/i)).not.toBeInTheDocument();

    // Hidden for non-Wizard characters even if a spell has copying: true
    rerender(
      <SpellbookView
        character={{ ...wizardCopyingChar, className: 'Cleric' }}
        catalog={mockCatalog}
        onFinishCopyingAll={handleFinishAll}
      />
    );
    expect(screen.queryByLabelText(/Finish copying all spells/i)).not.toBeInTheDocument();
  });

  it('shows only Prepared card for pure prepared casters, only Known card for pure known casters (Bard), and both for multiclass', () => {
    const handleUpdate = vi.fn();

    // Pure Wizard: shows Prepared, hides Known
    const { rerender } = render(
      <SpellbookView
        character={mockCharacter}
        catalog={mockCatalog}
        onUpdateCharacter={handleUpdate}
      />
    );
    expect(screen.getByText('Prepared:')).toBeInTheDocument();
    expect(screen.queryByText('Known:')).not.toBeInTheDocument();

    // Pure Bard Lvl 5 (8 max known) with 1 leveled spell + 1 cantrip: shows Known (1 / 8), hides Prepared
    const bardChar = {
      id: 'char_bard',
      name: 'Scanlan',
      className: 'Bard',
      level: 5,
      spells: [
        { id: 'fireball', prepared: false },
        { id: 'acid-splash', prepared: true },
      ],
    };
    rerender(
      <SpellbookView
        character={bardChar}
        catalog={mockCatalog}
        onUpdateCharacter={handleUpdate}
      />
    );
    expect(screen.queryByText('Prepared:')).not.toBeInTheDocument();
    expect(screen.getByText('Known:')).toBeInTheDocument();
    expect(screen.getByText('1 / 8')).toBeInTheDocument();

    // Allows editing Max Known
    fireEvent.click(screen.getByLabelText(/Edit Max Known/i));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.click(screen.getByLabelText(/Save Max Known/i));
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ customMaxKnown: 10 }));

    // Multiclass Wizard 4 + Bard 2: shows both Prepared and Known
    rerender(
      <SpellbookView
        character={{
          ...bardChar,
          classes: [
            { className: 'Wizard', level: 4 },
            { className: 'Bard', level: 2 },
          ],
        }}
        catalog={mockCatalog}
        onUpdateCharacter={handleUpdate}
      />
    );
    expect(screen.getByText('Prepared:')).toBeInTheDocument();
    expect(screen.getByText('Known:')).toBeInTheDocument();

    // Turns red (text-red-500) when Prepared or Known count exceeds max limit
    rerender(
      <SpellbookView
        character={{
          ...mockCharacter,
          customMaxPrepared: 0,
        }}
        catalog={mockCatalog}
        onUpdateCharacter={handleUpdate}
      />
    );
    expect(screen.getByText('1 / 0')).toHaveClass('text-red-500');
  });

  it('displays cantrips count as x / max cantrips and turns red when exceeding limit', () => {
    // mockCharacter is Wizard level 5 -> max 4 cantrips (from CANTRIPS_KNOWN_TABLE)
    // mockCharacter currently has 1 cantrip (acid-splash)
    render(
      <SpellbookView
        character={mockCharacter}
        catalog={mockCatalog}
      />
    );

    const cantripHeaderCount = screen.getByText('1 / 4 cantrips');
    expect(cantripHeaderCount).toBeInTheDocument();
    expect(cantripHeaderCount).not.toHaveClass('text-red-500');

    // Over the limit: customMaxCantrips set to 0 or 2 cantrips when max is 1
    const overLimitChar = {
      ...mockCharacter,
      customMaxCantrips: 0,
    };
    render(
      <SpellbookView
        character={overLimitChar}
        catalog={mockCatalog}
      />
    );
    const overCount = screen.getByText('1 / 0 cantrips');
    expect(overCount).toBeInTheDocument();
    expect(overCount).toHaveClass('text-red-500');
  });

  it('shows spell classes in expanded spellbook card detail view', () => {
    const catalogWithClasses = {
      ...mockCatalog,
      fireball: {
        ...mockCatalog.fireball,
        classes: ['Sorcerer', 'Wizard'],
      },
    };
    render(<SpellbookView character={mockCharacter} catalog={catalogWithClasses} />);
    fireEvent.click(screen.getByText('Fireball'));
    expect(screen.getByText('Classes:')).toBeInTheDocument();
    expect(screen.getByText('Sorcerer')).toBeInTheDocument();
    expect(screen.getByText('Wizard')).toBeInTheDocument();
  });

  it('filters spellbook spells via the expandable filter accordion', () => {
    const richCatalog = {
      fireball: {
        id: 'fireball',
        name: 'Fireball',
        level: 3,
        school: 'Evocation',
        classes: ['Sorcerer', 'Wizard'],
        concentration: false,
        ritual: false,
        components: { v: true, s: true, m: 'bat guano' },
      },
      detectMagic: {
        id: 'detectMagic',
        name: 'Detect Magic',
        level: 1,
        school: 'Divination',
        classes: ['Bard', 'Cleric', 'Wizard'],
        concentration: true,
        ritual: true,
        components: { v: true, s: true },
      },
      mistyStep: {
        id: 'mistyStep',
        name: 'Misty Step',
        level: 2,
        school: 'Conjuration',
        classes: ['Sorcerer', 'Warlock', 'Wizard'],
        concentration: false,
        ritual: false,
        components: { v: true },
      },
    };

    const charWithSpells = {
      id: 'char_filter',
      name: 'Mordenkainen',
      className: 'Wizard',
      level: 5,
      spells: [
        { id: 'fireball', prepared: true, copying: false },
        { id: 'detectMagic', prepared: false, copying: false },
        { id: 'mistyStep', prepared: false, copying: true },
      ],
    };

    render(<SpellbookView character={charWithSpells} catalog={richCatalog} />);

    // Filter button is collapsed initially
    const filterToggle = screen.getByRole('button', { name: /Toggle Spellbook Filters/i });
    expect(screen.queryByLabelText('Filter Spellbook by Level')).not.toBeInTheDocument();

    // Open filter accordion
    fireEvent.click(filterToggle);
    const levelSelect = screen.getByLabelText('Filter Spellbook by Level');
    const classSelect = screen.getByLabelText('Filter Spellbook by Class');
    const schoolSelect = screen.getByLabelText('Filter Spellbook by School');

    // Filter by Level 1
    fireEvent.change(levelSelect, { target: { value: '1' } });
    expect(screen.getByText('Detect Magic')).toBeInTheDocument();
    expect(screen.queryByText('Fireball')).not.toBeInTheDocument();
    fireEvent.change(levelSelect, { target: { value: 'all' } });

    // Filter by Prepared
    fireEvent.click(screen.getByRole('button', { name: 'Prepared' }));
    expect(screen.getByText('Fireball')).toBeInTheDocument();
    expect(screen.queryByText('Detect Magic')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Prepared' }));

    // Filter by Copying
    fireEvent.click(screen.getByRole('button', { name: 'Copying' }));
    expect(screen.getByText('Misty Step')).toBeInTheDocument();
    expect(screen.queryByText('Fireball')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Copying' }));

    // Filter by Class (Cleric -> only Detect Magic)
    fireEvent.change(classSelect, { target: { value: 'Cleric' } });
    expect(screen.getByText('Detect Magic')).toBeInTheDocument();
    expect(screen.queryByText('Fireball')).not.toBeInTheDocument();
    fireEvent.change(classSelect, { target: { value: 'all' } });

    // Filter by School (Evocation -> only Fireball)
    fireEvent.change(schoolSelect, { target: { value: 'Evocation' } });
    expect(screen.getByText('Fireball')).toBeInTheDocument();
    expect(screen.queryByText('Detect Magic')).not.toBeInTheDocument();
    fireEvent.change(schoolSelect, { target: { value: 'all' } });

    // Filter by Concentration & Ritual
    fireEvent.click(screen.getByRole('button', { name: 'Concentration' }));
    expect(screen.getByText('Detect Magic')).toBeInTheDocument();
    expect(screen.queryByText('Fireball')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ritual' }));
    expect(screen.getByText('Detect Magic')).toBeInTheDocument();

    // Reset clears all filters
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByText('Fireball')).toBeInTheDocument();
    expect(screen.getByText('Detect Magic')).toBeInTheDocument();

    // Filter by M component -> only Fireball
    fireEvent.click(screen.getByRole('button', { name: 'M' }));
    expect(screen.getByText('Fireball')).toBeInTheDocument();
    expect(screen.queryByText('Detect Magic')).not.toBeInTheDocument();
  });

  it('renders spell note and allows adding/editing note for spell', () => {
    const handleUpdateNote = vi.fn();
    const charWithNote = {
      id: 'char_note',
      name: 'Mordenkainen',
      className: 'Wizard',
      level: 5,
      spells: [
        { id: 'fireball', prepared: true, note: 'Save for boss room' },
        { id: 'acid-splash', prepared: false },
      ],
    };

    render(
      <SpellbookView
        character={charWithNote}
        catalog={mockCatalog}
        onUpdateNote={handleUpdateNote}
      />
    );

    // Expand Fireball accordion
    fireEvent.click(screen.getByText('Fireball'));

    // Note should be visible
    expect(screen.getByText('Note:')).toBeInTheDocument();
    expect(screen.getByText('Save for boss room')).toBeInTheDocument();

    // Edit note
    fireEvent.click(screen.getByRole('button', { name: /Edit note for Fireball/i }));
    const textarea = screen.getByPlaceholderText(/Add a note for this spell/i);
    expect(textarea.value).toBe('Save for boss room');
    fireEvent.change(textarea, { target: { value: 'Save for undead boss' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Note/i }));

    expect(handleUpdateNote).toHaveBeenCalledWith('fireball', 'Save for undead boss');
  });

  it('renders MythallarLogo in the empty spellbook state', () => {
    render(
      <SpellbookView
        character={{ ...mockCharacter, spells: [] }}
        catalog={mockCatalog}
      />
    );
    expect(screen.getByText('Your Spellbook is Empty')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Mythallar Logo' })).toHaveClass('bg-slate-300');
  });
});
