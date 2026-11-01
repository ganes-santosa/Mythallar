import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CharacterSheetView from './CharacterSheetView';

describe('CharacterSheetView', () => {
  const mockCharacter = {
    id: 'char_1',
    name: 'Sahazad Nazir',
    className: 'Wizard',
    level: 19,
    sheet: {
      vitals: {
        hpCurrent: 184,
        hpMax: 184,
        hpTemp: 69,
        ac: 20,
        acFormula: '17 + 2 + 1',
        inspiration: 1,
        conditions: [],
      },
      abilities: {
        str: 19,
        dex: 18,
        con: 16,
        int: 20,
        wis: 14,
        cha: 14,
        saveProficiencies: ['int', 'wis'],
        overrides: {},
      },
      trackedResources: [
        { id: 'res_1', name: 'The Timekeeper', current: 5, max: 16, resetOn: 'LR' },
      ],
      featuresNotes: 'Death Ward: ON',
      items: [
        {
          id: 'itm_1',
          name: 'The Tuvala Sundial',
          requiresAttunement: true,
          attuned: true,
          category: 'magic',
          quantity: 1,
        },
      ],
      maxAttunement: 3,
    },
  };

  it('renders all modular cards and character summary banner with identity fields', () => {
    const fullChar = {
      ...mockCharacter,
      sheet: {
        ...mockCharacter.sheet,
        identity: {
          race: 'Half-Elf',
          subclass: 'Chronurgy',
          background: 'Sage',
          portrait: '',
        },
        skills: { stealth: 'proficient' },
        senses: { darkvision: 60 },
        proficiencies: {
          armor: ['Light Armor'],
          weapons: [],
          tools: [],
          languages: ['Common', 'Elvish'],
        },
      },
    };

    render(<CharacterSheetView character={fullChar} onUpdateCharacter={() => {}} />);

    // Header info
    expect(screen.getByText('Sahazad Nazir')).toBeInTheDocument();
    expect(screen.getByText(/Wizard \(Level 19\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Proficiency/i)).toBeInTheDocument();
    expect(screen.getByText('+6')).toBeInTheDocument();

    // Identity metadata
    expect(screen.getByDisplayValue('Half-Elf')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Chronurgy')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sage')).toBeInTheDocument();

    // Skills Card & Senses
    expect(screen.getByText('Skills & Senses')).toBeInTheDocument();
    expect(screen.getByText('Passive Perception')).toBeInTheDocument();

    // Proficiencies Card
    expect(screen.getByText('Proficiencies & Training')).toBeInTheDocument();
    expect(screen.getByText('Light Armor')).toBeInTheDocument();

    // Vitals Card
    expect(screen.getAllByText('184').length).toBeGreaterThanOrEqual(1);

    // Abilities Card
    expect(screen.getByText('Save +11')).toBeInTheDocument();

    // Resources Card
    expect(screen.getByText('The Timekeeper')).toBeInTheDocument();

    // Items Card
    expect(screen.getByText('The Tuvala Sundial')).toBeInTheDocument();
  });

  it('allows collapsing and expanding accordion sections', () => {
    render(<CharacterSheetView character={mockCharacter} onUpdateCharacter={() => {}} />);

    const vitalsToggle = screen.getByLabelText('Collapse Combat Stats');
    expect(vitalsToggle).toBeInTheDocument();

    fireEvent.click(vitalsToggle);
    expect(screen.getByLabelText('Expand Combat Stats')).toBeInTheDocument();
  });

  it('toggles editing mode for abilities and skills via header buttons', () => {
    render(<CharacterSheetView character={mockCharacter} onUpdateCharacter={() => {}} />);

    // Ability scores edit toggle
    const editAbilitiesBtn = screen.getByLabelText('Edit abilities');
    expect(editAbilitiesBtn).toBeInTheDocument();
    fireEvent.click(editAbilitiesBtn);

    const doneAbilitiesBtn = screen.getByLabelText('Done editing abilities');
    expect(doneAbilitiesBtn).toBeInTheDocument();
    fireEvent.click(doneAbilitiesBtn);
    expect(screen.getByLabelText('Edit abilities')).toBeInTheDocument();

    // Skills edit toggle
    const editSkillsBtn = screen.getByLabelText('Edit skills');
    expect(editSkillsBtn).toBeInTheDocument();
    fireEvent.click(editSkillsBtn);

    const doneSkillsBtn = screen.getByLabelText('Done editing skills');
    expect(doneSkillsBtn).toBeInTheDocument();
    fireEvent.click(doneSkillsBtn);
    expect(screen.getByLabelText('Edit skills')).toBeInTheDocument();

    // Proficiencies edit toggle
    const editProficienciesBtn = screen.getByLabelText('Edit proficiencies');
    expect(editProficienciesBtn).toBeInTheDocument();
    fireEvent.click(editProficienciesBtn);

    const doneProficienciesBtn = screen.getByLabelText('Done editing proficiencies');
    expect(doneProficienciesBtn).toBeInTheDocument();
    fireEvent.click(doneProficienciesBtn);
    expect(screen.getByLabelText('Edit proficiencies')).toBeInTheDocument();

    // Combat Vitals edit toggle
    const editVitalsBtn = screen.getByLabelText('Edit vitals');
    expect(editVitalsBtn).toBeInTheDocument();
    fireEvent.click(editVitalsBtn);

    const doneVitalsBtn = screen.getByLabelText('Done editing vitals');
    expect(doneVitalsBtn).toBeInTheDocument();
    expect(screen.getByLabelText('Current HP')).toHaveValue(184);
    expect(screen.getByLabelText('Max HP Buff')).toBeInTheDocument();
    fireEvent.click(doneVitalsBtn);
    expect(screen.getByLabelText('Edit vitals')).toBeInTheDocument();
  });

  it('renders fallback when no character is selected', () => {
    render(<CharacterSheetView character={null} onUpdateCharacter={() => {}} />);
    expect(screen.getByText(/No character selected/i)).toBeInTheDocument();
  });
});
