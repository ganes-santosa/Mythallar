import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CharacterBuilderModal from './CharacterBuilderModal';

describe('CharacterBuilderModal', () => {
  const mockClasses = [
    {
      id: 'fighter-2024',
      name: 'Fighter',
      edition: '2024',
      hitDie: 10,
      hitDieString: 'd10',
      savingThrows: ['str', 'con'],
      description: 'Martial warrior',
      level1Features: [{ name: 'Second Wind', description: 'Regain HP' }],
      skillChoices: { count: 2, from: ['athletics', 'perception'] },
    },
    {
      id: 'wizard-2024',
      name: 'Wizard',
      edition: '2024',
      hitDie: 6,
      hitDieString: 'd6',
      savingThrows: ['int', 'wis'],
      hasSpellcasting: true,
      description: 'Arcane caster',
      level1Features: [{ name: 'Spellcasting', description: 'Cast spells' }],
      skillChoices: { count: 2, from: ['arcana', 'history'] },
    },
    {
      id: 'fighter-2014',
      name: 'Fighter',
      edition: '2014',
      hitDie: 10,
      hitDieString: 'd10',
      savingThrows: ['str', 'con'],
      description: 'Classic Fighter',
      level1Features: [{ name: 'Second Wind', description: 'Regain HP' }],
      skillChoices: { count: 2, from: ['athletics', 'perception'] },
    },
  ];

  const mockSpecies = [
    {
      id: 'human-2024',
      name: 'Human',
      edition: '2024',
      speed: 30,
      size: 'Medium',
      darkvision: 0,
      traits: [{ name: 'Resourceful', description: 'Heroic Inspiration on rest' }],
    },
    {
      id: 'tabaxi-2024',
      name: 'Tabaxi',
      edition: '2024',
      speed: 30,
      size: 'Medium',
      darkvision: 60,
      traits: [{ name: "Cat's Claws", description: 'Climb speed and unarmed claw strikes' }],
      subraces: [],
    },
    {
      id: 'tabaxi-2014',
      name: 'Tabaxi',
      edition: '2014',
      speed: 30,
      size: 'Medium',
      darkvision: 60,
      abilityBonuses: { dex: 2, cha: 1 },
      traits: [{ name: "Cat's Claws", description: 'Climb speed and unarmed claw strikes' }],
      subraces: [],
    },
    {
      id: 'dwarf-2014',
      name: 'Dwarf',
      edition: '2014',
      speed: 25,
      size: 'Medium',
      darkvision: 60,
      abilityBonuses: { con: 2 },
      traits: [{ name: 'Dwarven Resilience', description: 'Poison resistance' }],
      subraces: [
        {
          id: 'hill-dwarf-2014',
          name: 'Hill Dwarf',
          subraceName: 'Hill Dwarf',
          abilityBonuses: { wis: 1 },
          traits: [{ name: 'Dwarven Toughness', description: '+1 HP/level' }],
        },
      ],
    },
  ];

  const mockBackgrounds = [
    {
      id: 'soldier-2024',
      name: 'Soldier',
      edition: '2024',
      eligibleAbilities: ['str', 'dex', 'con'],
      originFeat: 'Savage Attacker',
      skillProficiencies: ['athletics', 'intimidation'],
    },
    {
      id: 'soldier-2014',
      name: 'Soldier',
      edition: '2014',
      eligibleAbilities: [],
      originFeat: null,
      skillProficiencies: ['athletics', 'intimidation'],
      feature: { name: 'Military Rank', description: 'Soldiers recognize authority' },
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('classes.json')) return Promise.resolve({ ok: true, json: async () => mockClasses });
      if (url.includes('species.json')) return Promise.resolve({ ok: true, json: async () => mockSpecies });
      if (url.includes('backgrounds.json')) return Promise.resolve({ ok: true, json: async () => mockBackgrounds });
      if (url.includes('spells.json')) return Promise.resolve({ ok: true, json: async () => [] });
      return Promise.resolve({ ok: false });
    });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CharacterBuilderModal isOpen={false} onClose={vi.fn()} onCreate={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders step 1 with 2024 (recommended) ruleset choice', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();
    expect(screen.getByText(/D&D 5th Edition \(2024\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommended/i)).toBeInTheDocument();
    expect(screen.getByText(/D&D 5th Edition \(2014\)/i)).toBeInTheDocument();
  });

  it('navigates through steps and creates a Level 1 character on completion', async () => {
    const handleCreate = vi.fn();
    const handleClose = vi.fn();

    render(
      <CharacterBuilderModal isOpen={true} onClose={handleClose} onCreate={handleCreate} />
    );

    // Step 1: Ruleset (default 2024)
    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 2: Identity (enter name)
    expect(await screen.findByRole('heading', { name: /Character Identity/i })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Gale of Waterdeep/i), {
      target: { value: 'Minsc and Boo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 3: Class
    expect(await screen.findByRole('heading', { name: /Choose your class/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 4: Background
    expect(await screen.findByRole('heading', { name: /Choose your background/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 5: Species
    expect(await screen.findByRole('heading', { name: /Choose your species/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 6: Ability Scores
    expect(await screen.findByRole('heading', { name: /Determine your ability scores/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 7: Equipment
    expect(await screen.findByRole('heading', { name: /Prepare your equipment/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 8: Spells & Features
    expect(await screen.findByRole('heading', { name: /Configure your abilities/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 9: Review
    expect(await screen.findByRole('heading', { name: /Review your character/i })).toBeInTheDocument();
    expect(screen.getByText('Minsc and Boo')).toBeInTheDocument();

    // Final Create
    fireEvent.click(screen.getByRole('button', { name: /Create Character/i }));

    expect(handleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Minsc and Boo',
        level: 1, // STRICTLY LEVEL 1
        ruleset: '2024',
      })
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('supports 2014 ruleset navigation sequence and subrace selection', async () => {
    const handleCreate = vi.fn();
    render(
      <CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={handleCreate} />
    );

    // Select 2014 ruleset
    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();
    fireEvent.click(screen.getByText(/D&D 5th Edition \(2014\)/i));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 2 in 2014 is Identity
    expect(await screen.findByRole('heading', { name: /Character Identity/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 3 in 2014 is Race & Subrace
    expect(await screen.findByRole('heading', { name: /Choose your race & subrace/i })).toBeInTheDocument();
  });

  it('allows going back to previous steps without losing entered data', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Now on Identity step
    expect(await screen.findByRole('heading', { name: /Character Identity/i })).toBeInTheDocument();

    // Click Back
    fireEvent.click(screen.getByRole('button', { name: /Previous step/i }));
    expect(screen.getByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();
  });

  it('allows searching and selecting expanded races like Tabaxi with their traits', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    // Step 1: Ruleset
    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    // Step 2: Identity
    expect(await screen.findByRole('heading', { name: /Character Identity/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    // Step 3: Class
    expect(await screen.findByRole('heading', { name: /Choose your class/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    // Step 4: Background
    expect(await screen.findByRole('heading', { name: /Choose your background/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 5: Species
    expect(await screen.findByRole('heading', { name: /Choose your species/i })).toBeInTheDocument();

    // Search for "tabaxi"
    const searchInput = screen.getByPlaceholderText(/Search species/i);
    fireEvent.change(searchInput, { target: { value: 'tabaxi' } });

    // Click Tabaxi card
    fireEvent.click(screen.getByRole('button', { name: /Tabaxi/i }));
    expect(screen.getByText("Cat's Claws:")).toBeInTheDocument();
  });

  it('renders a long-form layout with stable modal height and interactive section pill bar', async () => {
    const { container } = render(
      <CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />
    );

    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();

    // Verify modal has consistent, fixed height classes
    const modalPanel = container.querySelector('.max-w-3xl');
    expect(modalPanel).toHaveClass('h-[88vh]', 'sm:h-[90vh]', 'max-h-[860px]');

    // Verify all long-form sections are mounted in DOM
    expect(container.querySelector('#builder-section-ruleset')).toBeInTheDocument();
    expect(container.querySelector('#builder-section-identity')).toBeInTheDocument();
    expect(container.querySelector('#builder-section-class')).toBeInTheDocument();
    expect(container.querySelector('#builder-section-background')).toBeInTheDocument();
    expect(container.querySelector('#builder-section-species')).toBeInTheDocument();
    expect(container.querySelector('#builder-section-abilities')).toBeInTheDocument();
    expect(container.querySelector('#builder-section-equipment')).toBeInTheDocument();
    expect(container.querySelector('#builder-section-spells')).toBeInTheDocument();
    expect(container.querySelector('#builder-section-review')).toBeInTheDocument();

    // Click on Review pill in top pill bar
    const reviewPill = screen.getByRole('button', { name: /9\.\s*Review/i });
    fireEvent.click(reviewPill);

    // Header subtitle updates to section 9
    expect(screen.getByText(/Section 9 of 9 — Review/i)).toBeInTheDocument();

    // Footer button changes to Create Character
    expect(screen.getByRole('button', { name: /Create Character/i })).toBeInTheDocument();
  });

  it('displays skill proficiencies in Title Case with visual checkboxes', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    // Wait for class section to be rendered
    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();

    // In Fighter mock, skill choices from: ['athletics', 'perception']
    const athleticsChip = screen.getByRole('button', { name: /Athletics/i });
    const perceptionChip = screen.getByRole('button', { name: /Perception/i });
    expect(athleticsChip).toBeInTheDocument();
    expect(perceptionChip).toBeInTheDocument();

    // Select Athletics
    fireEvent.click(athleticsChip);
    expect(screen.getByText(/1\/2/)).toBeInTheDocument();

    // Select Perception
    fireEvent.click(perceptionChip);
    expect(screen.getByText(/2\/2/)).toBeInTheDocument();
  });

  it('allocates 2024 background ASI using point-buy steppers with a 3-point budget', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();

    // Soldier background has eligible abilities: ['str', 'dex', 'con']
    // Defaults to +2 to STR, +1 to DEX -> 0 points remaining
    expect(screen.getByText(/0 of 3 points remaining/i)).toBeInTheDocument();

    // Decrease STR from +2 to +1
    const decreaseStr = screen.getByRole('button', { name: /Decrease STR/i });
    fireEvent.click(decreaseStr);
    expect(screen.getByText(/1 of 3 points remaining/i)).toBeInTheDocument();

    // Increase CON by 1
    const increaseCon = screen.getByRole('button', { name: /Increase CON/i });
    fireEvent.click(increaseCon);
    expect(screen.getByText(/0 of 3 points remaining/i)).toBeInTheDocument();
    // At 0 points remaining, increase buttons should be disabled
    expect(increaseCon).toBeDisabled();
  });
});
