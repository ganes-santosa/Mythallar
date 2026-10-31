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
    expect(screen.getByText('+5 mod')).toBeInTheDocument();
    expect(screen.getByText('Save +9')).toBeInTheDocument();

    // CHA 8 has mod -1 and no prof -> Save -1
    expect(screen.getByText('CHA')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(screen.getByText('-1 mod')).toBeInTheDocument();
    expect(screen.getByText('Save -1')).toBeInTheDocument();
  });

  it('allows toggling save proficiency', () => {
    const handleUpdate = vi.fn();
    render(<AbilitiesCard abilities={mockAbilities} level={10} onUpdateAbilities={handleUpdate} />);
    const conToggle = screen.getByLabelText('Toggle CON save proficiency');
    fireEvent.click(conToggle);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      saveProficiencies: expect.arrayContaining(['int', 'wis', 'con'])
    }));
  });

  it('allows editing ability score directly', () => {
    const handleUpdate = vi.fn();
    render(<AbilitiesCard abilities={mockAbilities} level={10} onUpdateAbilities={handleUpdate} />);
    const strInput = screen.getByDisplayValue('10');
    fireEvent.change(strInput, { target: { value: '18' } });
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      str: 18,
    }));
  });
});
