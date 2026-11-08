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
    expect(screen.getByRole('heading', { level: 2, name: 'Sahazad Nazir' })).toBeInTheDocument();
    expect(screen.getByText('Wizard')).toBeInTheDocument();
    expect(screen.getByText(/Lvl 19/i)).toBeInTheDocument();
    expect(screen.getByText(/Character Level/i)).toBeInTheDocument();
    expect(screen.getByText(/Proficiency/i)).toBeInTheDocument();
    expect(screen.getByText('+6')).toBeInTheDocument();

    // Identity metadata (rendered as static text when not editing)
    expect(screen.getByText('Half-Elf')).toBeInTheDocument();
    expect(screen.getByText('Chronurgy')).toBeInTheDocument();
    expect(screen.getByText('Sage')).toBeInTheDocument();

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

    // Notes Card (starts in Notes list view)
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByLabelText('Search notes')).toBeInTheDocument();
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

    // Features & Resources edit toggle
    const editResourcesBtn = screen.getByLabelText('Edit resources');
    expect(editResourcesBtn).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Resource/i })).toBeInTheDocument();
    fireEvent.click(editResourcesBtn);

    const doneResourcesBtn = screen.getByLabelText('Done editing resources');
    expect(doneResourcesBtn).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Resource/i })).toBeInTheDocument();
    fireEvent.click(doneResourcesBtn);
    expect(screen.getByLabelText('Edit resources')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Resource/i })).toBeInTheDocument();
  });

  it('renders fallback when no character is selected', () => {
    render(<CharacterSheetView character={null} onUpdateCharacter={() => {}} />);
    expect(screen.getByText(/No character selected/i)).toBeInTheDocument();
  });

  it('delegates hit die roll confirmation to onShowToast with healed HP message', () => {
    const handleShowToast = vi.fn();
    const damagedChar = {
      ...mockCharacter,
      sheet: {
        ...mockCharacter.sheet,
        vitals: {
          ...mockCharacter.sheet.vitals,
          hpCurrent: 10,
          hpMax: 20,
          hitDice: {
            current: 2,
            max: 2,
            die: 'd6',
            pools: {
              d6: { current: 2, max: 2, classNames: ['Wizard'] },
            },
          },
        },
      },
    };

    render(
      <CharacterSheetView
        character={damagedChar}
        onUpdateCharacter={() => {}}
        onShowToast={handleShowToast}
      />
    );

    const rollBtn = screen.getByRole('button', { name: /Roll d6/i });
    fireEvent.click(rollBtn);
    expect(handleShowToast).not.toHaveBeenCalled();

    const armedBtn = screen.getByRole('button', { name: /Click again to roll d6/i });
    fireEvent.click(armedBtn);

    expect(handleShowToast).toHaveBeenCalledWith(
      expect.stringMatching(/Restored d6 \(\d+\) HP/),
      'success'
    );
  });

  it('provides all CharacterHeader polished features in Section 1 Character accordion', () => {
    const handleUpdate = vi.fn();
    const handleExport = vi.fn();
    const profiles = [mockCharacter];

    render(
      <CharacterSheetView
        character={mockCharacter}
        profiles={profiles}
        onUpdateCharacter={handleUpdate}
        onExport={handleExport}
      />
    );

    // Edit profile button exists and allows editing character name and classes
    const editProfileBtn = screen.getByLabelText('Edit Profile');
    expect(editProfileBtn).toBeInTheDocument();
    fireEvent.click(editProfileBtn);

    const nameInput = screen.getByPlaceholderText('Character Name');
    expect(nameInput).toHaveValue('Sahazad Nazir');
    fireEvent.change(nameInput, { target: { value: 'Archmage Sahazad' } });

    fireEvent.click(screen.getByLabelText('Save Profile'));
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Archmage Sahazad' }));

    // Level up button is accessible
    expect(screen.getByRole('button', { name: /Level Up/i })).toBeInTheDocument();

    // Profiles manager button is accessible
    expect(screen.getByRole('button', { name: /Manage Characters/i })).toBeInTheDocument();

    // Sign in and Export/Import buttons are not rendered on the sheet view
    expect(screen.queryByRole('button', { name: /Export/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Import/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sign in/i })).not.toBeInTheDocument();
  });

  it('updates character notes on change', () => {
    const handleUpdate = vi.fn();
    render(<CharacterSheetView character={mockCharacter} onUpdateCharacter={handleUpdate} />);

    // Open note from initial list view
    fireEvent.click(screen.getByText('General'));

    const notesTextarea = screen.getByLabelText('Note Content');
    notesTextarea.innerHTML = 'Discovered hidden tomb in the ruins.';
    fireEvent.input(notesTextarea);

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        sheet: expect.objectContaining({
          notes: expect.arrayContaining([
            expect.objectContaining({
              content: 'Discovered hidden tomb in the ruins.',
            }),
          ]),
        }),
      })
    );
  });

  it('propagates ability score misc bonuses to dependent skills, passives, and spell stats', () => {
    const charWithBonus = {
      ...mockCharacter,
      level: 10,
      classes: [{ className: 'Wizard', level: 10 }],
      sheet: {
        ...mockCharacter.sheet,
        abilities: {
          str: 10,
          dex: 14,
          con: 12,
          int: 18,
          wis: 10,
          cha: 10,
          saveProficiencies: ['int'],
          scoreBonuses: {
            int: 2, // INT 18 + 2 = 20 (+5 mod)
            wis: 4, // WIS 10 + 4 = 14 (+2 mod)
          },
        },
        skills: {
          arcana: 'proficient', // INT +5, prof +4 (lvl 10) = +9
          perception: 'none', // WIS +2
        },
      },
    };

    render(
      <CharacterSheetView
        character={charWithBonus}
        onUpdateCharacter={() => {}}
      />
    );

    // Spell DC for level 10 Wizard with INT 20 is 8 + 4 (prof) + 5 (INT mod) = 17
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getByText('Spell DC')).toBeInTheDocument();
    // Spell Attack and Arcana are both +9 (+4 prof + 5 INT mod)
    const plusNines = screen.getAllByText('+9');
    expect(plusNines.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Spell Attack')).toBeInTheDocument();

    // Arcana skill bonus should be present
    expect(screen.getByText('Arcana')).toBeInTheDocument();
    expect(screen.getByText('Perception')).toBeInTheDocument();
    // Passive Perception: 10 + WIS mod (+2) = 12
    expect(screen.getByTestId('passive-perception-value').textContent).toBe('12');
  });
});
