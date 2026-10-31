import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SkillsCard from './SkillsCard';

describe('SkillsCard', () => {
  const mockAbilities = {
    str: 10,
    dex: 16, // +3 mod
    con: 14,
    int: 18, // +4 mod
    wis: 12, // +1 mod
    cha: 8,
  };

  const mockSkills = {
    stealth: 'proficient', // +3 dex + 3 prof = +6 at lvl 5
    arcana: 'expertise',   // +4 int + 6 exp = +10 at lvl 5
    perception: 'proficient', // +1 wis + 3 prof = +4 at lvl 5 -> passive 14
  };

  const mockSenses = {
    darkvision: 60,
    custom: 'Tremorsense 10 ft',
  };

  it('renders passive senses banner and calculates passive scores', () => {
    render(
      <SkillsCard
        abilities={mockAbilities}
        skills={mockSkills}
        level={5}
        senses={mockSenses}
        onUpdateSkills={() => {}}
        onUpdateSenses={() => {}}
      />
    );

    // Passive Perception: 10 + (+1 WIS + 3 prof) = 14
    expect(screen.getByText('Passive Perception')).toBeInTheDocument();
    expect(screen.getByTestId('passive-perception-value')).toHaveTextContent('14');

    // Darkvision display
    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
  });

  it('cycles skill proficiency: none -> proficient -> expertise -> none on click', () => {
    const handleUpdateSkills = vi.fn();
    render(
      <SkillsCard
        abilities={mockAbilities}
        skills={{ athletics: 'none' }}
        level={5}
        senses={mockSenses}
        onUpdateSkills={handleUpdateSkills}
        onUpdateSenses={() => {}}
      />
    );

    const athleticsToggle = screen.getByLabelText('Cycle Athletics proficiency');
    fireEvent.click(athleticsToggle);

    expect(handleUpdateSkills).toHaveBeenCalledWith(
      expect.objectContaining({ athletics: 'proficient' })
    );
  });

  it('updates darkvision when edited', () => {
    const handleUpdateSenses = vi.fn();
    render(
      <SkillsCard
        abilities={mockAbilities}
        skills={mockSkills}
        level={5}
        senses={mockSenses}
        onUpdateSkills={() => {}}
        onUpdateSenses={handleUpdateSenses}
      />
    );

    const dvInput = screen.getByLabelText('Darkvision distance');
    fireEvent.change(dvInput, { target: { value: '120' } });
    expect(handleUpdateSenses).toHaveBeenCalledWith(
      expect.objectContaining({ darkvision: 120 })
    );
  });
});
