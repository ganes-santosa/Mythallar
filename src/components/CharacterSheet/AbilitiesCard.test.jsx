import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import AbilitiesCard from './AbilitiesCard';

describe('AbilitiesCard', () => {
  const mockAbilities = {
    str: 10,
    dex: 14,
    con: 16,
    int: 20,
    wis: 12,
    cha: 8,
    saveProficiencies: ['int', 'wis'],
    overrides: {},
  };

  it('renders all 6 ability scores with calculated modifiers and saves at level 10', () => {
    render(<AbilitiesCard abilities={mockAbilities} level={10} onUpdateAbilities={() => {}} />);
    // INT 20 at lvl 10 has mod +5 and prof +4 -> Save +9
    expect(screen.getByText('INT')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    expect(screen.getByText('+5')).toBeInTheDocument();
    expect(screen.getByText('Save +9')).toBeInTheDocument();

    // CHA 8 has mod -1 and no prof -> Save -1
    expect(screen.getByText('CHA')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument();
    expect(screen.getByText('Save -1')).toBeInTheDocument();
  });

  it('allows toggling save proficiency only when isEditing is true', () => {
    const handleUpdate = vi.fn();
    const { rerender } = render(
      <AbilitiesCard
        abilities={mockAbilities}
        level={10}
        isEditing={false}
        onUpdateAbilities={handleUpdate}
      />
    );

    // In view mode (isEditing=false), toggle button is disabled
    const conToggle = screen.getByLabelText('CON save proficiency: not proficient');
    expect(conToggle).toBeDisabled();
    fireEvent.click(conToggle);
    expect(handleUpdate).not.toHaveBeenCalled();

    // In edit mode (isEditing=true), toggle button is enabled and triggers callback
    rerender(
      <AbilitiesCard
        abilities={mockAbilities}
        level={10}
        isEditing={true}
        onUpdateAbilities={handleUpdate}
      />
    );
    const conToggleEdit = screen.getByLabelText('Toggle CON save proficiency');
    expect(conToggleEdit).not.toBeDisabled();
    fireEvent.click(conToggleEdit);
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        saveProficiencies: expect.arrayContaining(['int', 'wis', 'con']),
      })
    );
  });

  it('allows editing ability score directly only when isEditing is true', () => {
    const handleUpdate = vi.fn();
    const { rerender } = render(
      <AbilitiesCard
        abilities={mockAbilities}
        level={10}
        isEditing={false}
        onUpdateAbilities={handleUpdate}
      />
    );

    const strInput = screen.getByDisplayValue('10');
    expect(strInput).toHaveAttribute('readonly');

    rerender(
      <AbilitiesCard
        abilities={mockAbilities}
        level={10}
        isEditing={true}
        onUpdateAbilities={handleUpdate}
      />
    );
    expect(strInput).not.toHaveAttribute('readonly');
    fireEvent.change(strInput, { target: { value: '18' } });
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        str: 18,
      })
    );
  });
});
