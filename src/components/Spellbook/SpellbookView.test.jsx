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
});
