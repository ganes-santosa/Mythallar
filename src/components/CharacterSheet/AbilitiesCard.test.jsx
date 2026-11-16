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
    fireEvent.blur(strInput);
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        str: 18,
      })
    );
  });

  it('calculates save with misc bonus and allows editing save bonus in edit mode', () => {
    const handleUpdate = vi.fn();
    const { rerender } = render(
      <AbilitiesCard
        abilities={{
          ...mockAbilities,
          saveBonuses: { int: 1 },
        }}
        level={10}
        isEditing={false}
      />
    );

    // INT 20 (+5 mod) at lvl 10 (+4 prof) + 1 misc save bonus = Save +10
    expect(screen.queryByLabelText('INT save bonus')).toBeNull();
    expect(screen.getByText('Save +10')).toBeInTheDocument();

    // In edit mode: save bonus input rendered
    rerender(
      <AbilitiesCard
        abilities={{
          ...mockAbilities,
          saveBonuses: { int: 1 },
        }}
        level={10}
        isEditing={true}
        onUpdateAbilities={handleUpdate}
      />
    );

    const intSaveBonusInput = screen.getByLabelText('INT save bonus');
    expect(intSaveBonusInput).toBeInTheDocument();
    expect(intSaveBonusInput.value).toBe('1');

    fireEvent.change(intSaveBonusInput, { target: { value: '2' } });
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        saveBonuses: expect.objectContaining({ int: 2 }),
      })
    );
  });

  it('calculates ability score and derived modifier with score bonus and allows editing score bonus in edit mode', () => {
    const handleUpdate = vi.fn();
    const { rerender } = render(
      <AbilitiesCard
        abilities={{
          ...mockAbilities,
          str: 10,
          scoreBonuses: { str: 4 }, // 10 + 4 = 14 (+2 mod)
        }}
        level={10}
        isEditing={false}
      />
    );

    // Score displays effective 14 outside edit mode, modifier is +2
    expect(screen.queryByLabelText('STR score bonus')).toBeNull();
    const strInput = screen.getByLabelText('STR Score');
    expect(strInput.value).toBe('14');

    // In edit mode: raw score and score bonus input rendered
    rerender(
      <AbilitiesCard
        abilities={{
          ...mockAbilities,
          str: 10,
          scoreBonuses: { str: 4 },
        }}
        level={10}
        isEditing={true}
        onUpdateAbilities={handleUpdate}
      />
    );

    expect(screen.getByLabelText('STR Score').value).toBe('10');
    const strScoreBonusInput = screen.getByLabelText('STR score bonus');
    expect(strScoreBonusInput).toBeInTheDocument();
    expect(strScoreBonusInput.value).toBe('4');

    fireEvent.change(strScoreBonusInput, { target: { value: '2' } });
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        scoreBonuses: expect.objectContaining({ str: 2 }),
      })
    );
  });

  it('allows clearing an ability score before typing a replacement', () => {
    const handleUpdate = vi.fn();
    render(
      <AbilitiesCard
        abilities={mockAbilities}
        level={10}
        isEditing={true}
        onUpdateAbilities={handleUpdate}
      />
    );

    const input = screen.getByLabelText('STR Score');
    fireEvent.change(input, { target: { value: '' } });
    expect(input.value).toBe('');
    fireEvent.change(input, { target: { value: '14' } });
    expect(input.value).toBe('14');
    fireEvent.blur(input);
    expect(handleUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ str: 14 }));
  });

  it('commits zero when an empty ability score loses focus', () => {
    const handleUpdate = vi.fn();
    render(
      <AbilitiesCard
        abilities={mockAbilities}
        level={10}
        isEditing={true}
        onUpdateAbilities={handleUpdate}
      />
    );

    const input = screen.getByLabelText('STR Score');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ str: 0 }));
  });

  it('includes featBonuses in effective score, hides feat badge in normal state, and shows it in editing state', () => {
    const { rerender } = render(
      <AbilitiesCard
        abilities={{
          ...mockAbilities,
          int: 17,
        }}
        featBonuses={{ int: 1 }}
        level={10}
        isEditing={false}
        onUpdateAbilities={() => {}}
      />
    );

    // 17 base + 1 feat = 18 effective (+4 mod), badge hidden in normal state
    const intInput = screen.getByLabelText('INT Score');
    expect(intInput.value).toBe('18');
    expect(screen.queryByTestId('ability-feat-badge-int')).toBeNull();

    // Shown in editing state alongside base score 17
    rerender(
      <AbilitiesCard
        abilities={{
          ...mockAbilities,
          int: 17,
        }}
        featBonuses={{ int: 1 }}
        level={10}
        isEditing={true}
        onUpdateAbilities={() => {}}
      />
    );
    expect(screen.getByLabelText('INT Score').value).toBe('17');
    expect(screen.getByTestId('ability-feat-badge-int')).toHaveTextContent('+1 Feat');
  });
});
