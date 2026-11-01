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

  it('disables skill proficiency cycling and senses editing when isEditing is false', () => {
    const handleUpdateSkills = vi.fn();
    const handleUpdateSenses = vi.fn();
    render(
      <SkillsCard
        abilities={mockAbilities}
        skills={{ athletics: 'none' }}
        level={5}
        senses={mockSenses}
        isEditing={false}
        onUpdateSkills={handleUpdateSkills}
        onUpdateSenses={handleUpdateSenses}
      />
    );

    const athleticsToggle = screen.getByLabelText('Athletics: none');
    expect(athleticsToggle).toBeDisabled();
    fireEvent.click(athleticsToggle);
    expect(handleUpdateSkills).not.toHaveBeenCalled();

    const dvInput = screen.getByLabelText('Darkvision distance');
    expect(dvInput).toHaveAttribute('readonly');

    expect(screen.queryByLabelText('Passive Perception score')).not.toBeInTheDocument();
  });

  it('cycles skill proficiency and edits darkvision when isEditing is true', () => {
    const handleUpdateSkills = vi.fn();
    const handleUpdateSenses = vi.fn();
    render(
      <SkillsCard
        abilities={mockAbilities}
        skills={{ athletics: 'none' }}
        level={5}
        senses={mockSenses}
        isEditing={true}
        onUpdateSkills={handleUpdateSkills}
        onUpdateSenses={handleUpdateSenses}
      />
    );

    const athleticsToggle = screen.getByLabelText('Cycle Athletics proficiency');
    expect(athleticsToggle).not.toBeDisabled();
    fireEvent.click(athleticsToggle);
    expect(handleUpdateSkills).toHaveBeenCalledWith(
      expect.objectContaining({ athletics: 'proficient' })
    );

    const dvInput = screen.getByLabelText('Darkvision distance');
    expect(dvInput).not.toHaveAttribute('readonly');
    fireEvent.change(dvInput, { target: { value: '120' } });
    expect(handleUpdateSenses).toHaveBeenCalledWith(
      expect.objectContaining({ darkvision: 120 })
    );
  });

  it('allows overriding passive scores in edit mode and resetting to calculated values', () => {
    const handleUpdateSenses = vi.fn();
    const { rerender } = render(
      <SkillsCard
        abilities={mockAbilities}
        skills={mockSkills}
        level={5}
        senses={mockSenses}
        isEditing={true}
        onUpdateSkills={() => {}}
        onUpdateSenses={handleUpdateSenses}
      />
    );

    // Edit passive perception
    const perceptionInput = screen.getByLabelText('Passive Perception score');
    fireEvent.change(perceptionInput, { target: { value: '18' } });
    expect(handleUpdateSenses).toHaveBeenCalledWith(
      expect.objectContaining({
        overrides: expect.objectContaining({ perception: 18 }),
      })
    );

    // Rerender with overridden passive perception
    rerender(
      <SkillsCard
        abilities={mockAbilities}
        skills={mockSkills}
        level={5}
        senses={{
          ...mockSenses,
          overrides: { perception: 18 },
        }}
        isEditing={true}
        onUpdateSkills={() => {}}
        onUpdateSenses={handleUpdateSenses}
      />
    );

    // Reset button should now be visible
    const resetPerception = screen.getByLabelText('Reset Passive Perception');
    expect(resetPerception).toBeInTheDocument();
    fireEvent.click(resetPerception);
    expect(handleUpdateSenses).toHaveBeenCalledWith(
      expect.objectContaining({
        overrides: {},
      })
    );
  });

  it('groups skills by ability into two columns (STR/DEX/INT in col 1, WIS/CHA in col 2) with reduced bullet point size and no subheaders', () => {
    const { container } = render(
      <SkillsCard
        abilities={mockAbilities}
        skills={mockSkills}
        level={5}
        senses={mockSenses}
      />
    );

    // Bullet points should be reduced (w-2 h-2) and not the old w-3.5
    const bulletButtons = container.querySelectorAll('button[aria-label*="Athletics"]');
    expect(bulletButtons.length).toBeGreaterThan(0);
    expect(bulletButtons[0].className).toContain('w-2 h-2');
    expect(bulletButtons[0].className).not.toContain('w-3.5');

    // Columns should separate STR/DEX/INT and WIS/CHA
    const col0 = screen.getByTestId('skills-column-0');
    const col1 = screen.getByTestId('skills-column-1');
    expect(col0).toBeInTheDocument();
    expect(col1).toBeInTheDocument();

    // Col 0 contains Athletics (STR), Acrobatics (DEX), Arcana (INT)
    expect(col0).toHaveTextContent('Athletics');
    expect(col0).toHaveTextContent('Acrobatics');
    expect(col0).toHaveTextContent('Arcana');
    expect(col0).not.toHaveTextContent('Perception');

    // Col 1 contains Perception (WIS), Deception (CHA)
    expect(col1).toHaveTextContent('Perception');
    expect(col1).toHaveTextContent('Deception');
    expect(col1).not.toHaveTextContent('Athletics');

    // No subheaders for abilities
    expect(screen.queryByRole('heading', { name: /strength/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /wisdom/i })).not.toBeInTheDocument();

    // Subtle line divider between ability groups, without outer outline containers
    expect(container.querySelector('.bg-dnd-card\\/30')).toBeNull();
    const dividers = container.querySelectorAll('.border-t.border-white\\/5');
    expect(dividers.length).toBeGreaterThanOrEqual(2);
    // Divider should have symmetrical margin (my-2.5) for equal spacing above and below
    expect(dividers[0].className).toContain('my-2.5');
  });
});
