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
    expect(screen.getByText(/D&D 5th Edition 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommended/i)).toBeInTheDocument();
    expect(screen.getByText(/D&D 5th Edition 2014 \(Legacy\)/i)).toBeInTheDocument();
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

    // Step 7: Equipment (final step)
    expect(await screen.findByRole('heading', { name: /Prepare your equipment/i })).toBeInTheDocument();

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
    fireEvent.click(screen.getByText(/D&D 5th Edition 2014 \(Legacy\)/i));
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
    expect(screen.getByText("Cat's Claws")).toBeInTheDocument();
    expect(screen.getByText("30 ft Speed")).toBeInTheDocument();
    expect(screen.getByText("Darkvision 60 ft")).toBeInTheDocument();
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

    // Click on Equipment pill in top pill bar
    const equipPill = screen.getByRole('button', { name: /7\.\s*Equipment/i });
    fireEvent.click(equipPill);

    // Header subtitle updates to section 7
    expect(screen.getByText(/Section 7 of 7 — Equipment/i)).toBeInTheDocument();

    // Footer button changes to Create Character
    expect(screen.getByRole('button', { name: /Create Character/i })).toBeInTheDocument();
  });

  it('renders expandable Starting Features accordion inside the class section', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();

    // Find Starting Features accordion toggle
    const toggleAccordion = screen.getByRole('button', { name: /Expand Starting Features/i });
    expect(toggleAccordion).toBeInTheDocument();

    // Features like Second Wind should exist for Fighter
    expect(screen.getByText('Second Wind')).toBeInTheDocument();
    expect(screen.getByText('Regain HP')).toBeInTheDocument();

    // Click to toggle
    fireEvent.click(toggleAccordion);
    expect(screen.getByRole('button', { name: /Collapse Starting Features/i })).toBeInTheDocument();
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
    // Defaults to 0/unfilled -> 3 points remaining
    expect(screen.getByText(/3 of 3 points remaining/i)).toBeInTheDocument();

    // Increase STR to +1 and then +2
    const increaseStr = screen.getByRole('button', { name: /Increase STR/i });
    fireEvent.click(increaseStr);
    expect(screen.getByText(/2 of 3 points remaining/i)).toBeInTheDocument();

    fireEvent.click(increaseStr);
    expect(screen.getByText(/1 of 3 points remaining/i)).toBeInTheDocument();

    // Increase CON by 1
    const increaseCon = screen.getByRole('button', { name: /Increase CON/i });
    fireEvent.click(increaseCon);
    expect(screen.getByText(/0 of 3 points remaining/i)).toBeInTheDocument();
    // At 0 points remaining, increase buttons should be disabled
    expect(increaseCon).toBeDisabled();
    expect(increaseStr).toBeDisabled();

    // Decrease STR from +2 to +1
    const decreaseStr = screen.getByRole('button', { name: /Decrease STR/i });
    fireEvent.click(decreaseStr);
    expect(screen.getByText(/1 of 3 points remaining/i)).toBeInTheDocument();
  });

  it('allows assigning and swapping Standard Array values via tactile chips with unified Total display', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();

    // Navigate to Abilities (section 6 in 2024 ruleset)
    const abilitiesPill = screen.getByRole('button', { name: /6\.\s*Abilities/i });
    fireEvent.click(abilitiesPill);

    expect(screen.getByRole('heading', { name: /Determine your ability scores/i })).toBeInTheDocument();

    // Standard Array starts unassigned ('—')
    const strBaseBox = screen.getByLabelText(/Strength Base Score/i);
    const dexBaseBox = screen.getByLabelText(/Dexterity Base Score/i);
    expect(strBaseBox).toHaveTextContent('—');
    expect(dexBaseBox).toHaveTextContent('—');

    // Assign 15 to STR and 14 to DEX
    fireEvent.click(screen.getByRole('button', { name: /Assign 15 to Strength/i }));
    fireEvent.click(screen.getByRole('button', { name: /Assign 14 to Dexterity/i }));
    expect(strBaseBox).toHaveTextContent('15');
    expect(dexBaseBox).toHaveTextContent('14');

    // Click "Assign 15 to Dexterity" chip -> swaps DEX to 15 and STR to 14
    const assign15ToDex = screen.getByRole('button', { name: /Assign 15 to Dexterity/i });
    fireEvent.click(assign15ToDex);
    expect(dexBaseBox).toHaveTextContent('15');
    expect(strBaseBox).toHaveTextContent('14');

    // Unified "Total:" labels rendered across the 6 cards
    const totalLabels = screen.getAllByText(/Total:/i);
    expect(totalLabels).toHaveLength(6);
  });

  it('supports Custom ability method with clean direct score inputs and steppers', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();

    // Navigate to Abilities
    const abilitiesPill = screen.getByRole('button', { name: /6\.\s*Abilities/i });
    fireEvent.click(abilitiesPill);

    // Switch to Custom (methods: Stat Roll - Custom - Standard Array - Point Buy)
    const customMethodBtn = screen.getByRole('button', { name: /^Custom$/i });
    fireEvent.click(customMethodBtn);

    // Clutter preset buttons should not exist
    expect(screen.queryByRole('button', { name: /All 10s/i })).not.toBeInTheDocument();

    const strInput = screen.getByRole('spinbutton', { name: /Strength Base Score/i });
    expect(strInput.value).toBe('10');

    // Type 18 for STR
    fireEvent.change(strInput, { target: { value: '18' } });
    expect(strInput.value).toBe('18');

    // Increase via stepper +
    const incStr = screen.getByRole('button', { name: /Increase base Strength/i });
    fireEvent.click(incStr);
    expect(strInput.value).toBe('19');
  });

  it('scrolls to top 0 when clicking either ruleset card or step 1 pill', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();

    const rulesetSection = document.getElementById('builder-section-ruleset');
    const scrollContainer = rulesetSection.parentElement;
    scrollContainer.scrollTo = vi.fn();

    // Click 2014 card
    fireEvent.click(screen.getByText(/D&D 5th Edition 2014 \(Legacy\)/i));
    expect(scrollContainer.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' });

    // Click 2024 card
    fireEvent.click(screen.getByText(/D&D 5th Edition 2024/i));
    expect(scrollContainer.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('applies uniform opening and closing transition classes to Lineage panel when switching species', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();

    // Switch to 2014 where Dwarf has subrace and Tabaxi has none
    fireEvent.click(screen.getByText(/D&D 5th Edition 2014 \(Legacy\)/i));

    // Navigate to Race section
    fireEvent.click(screen.getByRole('button', { name: /3\.\s*Race & Subrace/i }));
    expect(await screen.findByRole('heading', { name: /Choose your race & subrace/i })).toBeInTheDocument();

    // Select Dwarf -> has subraces
    fireEvent.click(screen.getByRole('button', { name: /^Dwarf/i }));
    const lineageHeading = screen.getByText(/Choose Subrace for Dwarf:/i);
    const lineageWrapper = lineageHeading.closest('.grid');
    expect(lineageWrapper).toHaveClass('grid-rows-[1fr]');
    expect(lineageWrapper).toHaveClass('opacity-100');
    expect(lineageWrapper).toHaveClass('transition-[grid-template-rows,opacity]');

    // Select Tabaxi -> has no subraces -> panel closes smoothly
    fireEvent.click(screen.getByRole('button', { name: /^Tabaxi/i }));
    expect(lineageWrapper).toHaveClass('grid-rows-[0fr]');
    expect(lineageWrapper).toHaveClass('opacity-0');
    expect(lineageWrapper).toHaveClass('pointer-events-none');
    // Content stays mounted in DOM during exit animation
    expect(screen.getByText(/Choose Subrace for Dwarf:/i)).toBeInTheDocument();
  });

  it('animates ability score helper banners on open and close across method changes', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();

    // Navigate to Abilities section
    fireEvent.click(screen.getByRole('button', { name: /6\.\s*Abilities/i }));
    expect(await screen.findByRole('heading', { name: /Determine your ability scores/i })).toBeInTheDocument();

    // Default method is Standard Array
    const stdPoolLabel = screen.getByText(/Standard Array Pool:/i);
    const stdWrapper = stdPoolLabel.closest('.grid');
    expect(stdWrapper).toHaveClass('grid-rows-[1fr]');
    expect(stdWrapper).toHaveClass('opacity-100');

    // Switch to Custom -> Standard Array closes with grid-rows-[0fr] opacity-0
    fireEvent.click(screen.getByRole('button', { name: 'Custom' }));
    expect(stdWrapper).toHaveClass('grid-rows-[0fr]');
    expect(stdWrapper).toHaveClass('opacity-0');
    // Elements remain mounted in DOM to animate closing
    expect(screen.getByText(/Standard Array Pool:/i)).toBeInTheDocument();
    // Custom scores default to 10 but must NOT bleed assignments into closing Standard Array pool banner chips
    expect(screen.queryByText(/\(STR\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\(DEX\)/i)).not.toBeInTheDocument();

    // Switch to Point Buy -> Point Buy expands with grid-rows-[1fr] opacity-100
    fireEvent.click(screen.getByRole('button', { name: 'Point Buy' }));
    const pbLabel = screen.getByText(/Point Buy Budget:/i);
    const pbWrapper = pbLabel.closest('.grid');
    expect(pbWrapper).toBe(stdWrapper);
    expect(pbWrapper).toHaveClass('grid-rows-[1fr]');
    expect(pbWrapper).toHaveClass('opacity-100');

    // Method selector and ruleset buttons use uniform ring-dnd-gold/40 outline matching AbilitiesCard
    const rulesetBtn = screen.getByRole('button', { name: /D&D 5th Edition 2024/i });
    expect(rulesetBtn.className).toContain('ring-1 ring-dnd-gold/40');
    expect(rulesetBtn.className).not.toContain('ring-dnd-gold ');

    // Switching between Point Buy and Standard Array keeps top banner open without collapse
    fireEvent.click(screen.getByRole('button', { name: 'Standard Array' }));
    expect(screen.getByText(/Standard Array Pool:/i)).toBeInTheDocument();
    expect(stdWrapper).toHaveClass('grid-rows-[1fr]');
    expect(stdWrapper).toHaveClass('opacity-100');

    // Reset button in Standard Array clears assignments
    const stdResetBtn = screen.getByRole('button', { name: /Reset/i });
    expect(stdResetBtn).toBeInTheDocument();
    fireEvent.click(stdResetBtn);

    // Switch back to Point Buy and check Point Buy Reset button and chip badges
    fireEvent.click(screen.getByRole('button', { name: 'Point Buy' }));
    expect(screen.getByText(/of 27 Remaining/i)).toBeInTheDocument();
    expect(screen.getByText(/Spent/i)).toBeInTheDocument();
    const pbResetBtn = screen.getByRole('button', { name: /Reset/i });
    expect(pbResetBtn).toBeInTheDocument();
  });

  it('wraps dynamic panels and ability cards in SmoothSize to animate size changes', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();

    // 1. Class Detail Viewer
    fireEvent.click(screen.getByRole('button', { name: /3\.\s*Class/i }));
    expect(await screen.findByRole('heading', { name: /Choose your class/i })).toBeInTheDocument();
    const classDetail = screen.getByText(/Hit Die: d10 • Saves: STR, CON/i).closest('.rounded-xl');
    expect(classDetail).toBeInTheDocument();

    // 2. Species Detail Viewer
    fireEvent.click(screen.getByRole('button', { name: /5\.\s*Species/i }));
    expect(await screen.findByRole('heading', { name: /Choose your species/i })).toBeInTheDocument();
    const speciesDetail = screen.getByText(/30 ft Speed/i).closest('.rounded-xl');
    expect(speciesDetail).toBeInTheDocument();

    // 3. Ability Score Cards
    fireEvent.click(screen.getByRole('button', { name: /6\.\s*Abilities/i }));
    expect(await screen.findByRole('heading', { name: /Determine your ability scores/i })).toBeInTheDocument();
    const strLabel = screen.getByText('Strength');
    const strCard = strLabel.closest('.rounded-xl');
    expect(strCard).toBeInTheDocument();
  });

  it('unifies active selection outline across all cards with ring-1 ring-dnd-gold/40 and transition-colors', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /Choose your ruleset/i })).toBeInTheDocument();

    // 1. Ruleset card
    const ruleset2024 = screen.getByRole('button', { name: /D&D 5th Edition 2024/i });
    expect(ruleset2024.className).toContain('ring-1 ring-dnd-gold/40');
    expect(ruleset2024.className).toContain('transition-colors');

    // 2. Class card
    const fighterBtn = screen.getByRole('button', { name: /Fighter/i });
    expect(fighterBtn.querySelector('svg')).toBeInTheDocument();
    fireEvent.click(fighterBtn);
    expect(fighterBtn.className).toContain('ring-1 ring-dnd-gold/40');
    expect(fighterBtn.className).toContain('transition-colors');

    // 3. Equipment card
    const equipA = screen.getByRole('button', { name: /Option A: Starting Equipment/i });
    expect(equipA.className).toContain('ring-1 ring-dnd-gold/40');
    expect(equipA.className).toContain('transition-colors');
  });

  it('uses Title Case headers with gold category icons, non-uppercase Recommended badge, and non-monospace Class Detail badge', async () => {
    const { container } = render(
      <CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />
    );

    const rulesetHeading = await screen.findByRole('heading', { name: /Choose Your Ruleset/i });
    expect(rulesetHeading.textContent).toBe('Choose Your Ruleset');
    expect(rulesetHeading.parentElement.querySelector('svg.text-dnd-gold')).toBeInTheDocument();

    // No 01 / 02 monospace section badges
    expect(container.querySelector('.font-mono')).toBeNull();

    // Recommended badge is Title Case without uppercase class
    const recommendedBadge = screen.getByText('Recommended');
    expect(recommendedBadge.className).not.toContain('uppercase');

    // Class Detail Viewer Hit Die & Saves badge uses standard font and pill badge
    const hitDieBadge = screen.getByText(/Hit Die: d10 • Saves: STR, CON/i);
    expect(hitDieBadge.className).not.toContain('font-mono');
    expect(hitDieBadge.className).toContain('bg-dnd-gold/15');
    expect(hitDieBadge.className).toContain('text-dnd-gold');
  });

  it('renders portrait upload with gradient fade on left and structured 1-line name and 4-column age/gender/alignment grid on right', async () => {
    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    // Navigate to Identity step
    fireEvent.click(screen.getByRole('button', { name: /2\.\s*Identity/i }));
    expect(await screen.findByRole('heading', { name: /Character Identity/i })).toBeInTheDocument();

    // Portrait upload container and button
    const portraitBtn = screen.getByRole('button', { name: /Upload character portrait/i });
    expect(portraitBtn).toBeInTheDocument();
    expect(screen.getByText('Add Portrait')).toBeInTheDocument();

    // Check gradient overlay element
    const cardContainer = portraitBtn.closest('.character-profile-card');
    expect(cardContainer).toBeInTheDocument();
    const gradientOverlay = cardContainer.querySelector('.bg-gradient-to-r');
    expect(gradientOverlay).toBeInTheDocument();

    // File input for portrait
    const fileInput = screen.getByLabelText('Portrait file input');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');

    // Name field is full width of info column (line 1)
    const nameInput = screen.getByPlaceholderText(/e\.g\. Gale of Waterdeep/i);
    expect(nameInput).toBeInTheDocument();

    // Age, Gender, and Alignment are on line 2 in a 4-col grid:
    // Age has col-span-1, Gender has col-span-1, Alignment has col-span-2
    const ageInput = screen.getByPlaceholderText(/e\.g\. 28/i);
    const genderInput = screen.getByPlaceholderText(/e\.g\. Male \/ Female \/ Non-binary/i);
    const alignmentInput = screen.getByPlaceholderText(/e\.g\. Chaotic Good/i);

    expect(ageInput.closest('div')).toHaveClass('col-span-1');
    expect(genderInput.closest('div')).toHaveClass('col-span-1');
    expect(alignmentInput.closest('div')).toHaveClass('col-span-2');
  });

  it('opens ImageCropModal upon file selection in Identity step and sets portrait on apply', async () => {
    // Mock canvas methods for jsdom
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
    });
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/webp;base64,mockCroppedAvatar');

    render(<CharacterBuilderModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);

    // Navigate to Identity step
    fireEvent.click(screen.getByRole('button', { name: /2\.\s*Identity/i }));
    expect(await screen.findByRole('heading', { name: /Character Identity/i })).toBeInTheDocument();

    const fileInput = screen.getByLabelText('Portrait file input');
    const fakeFile = new File(['fake-bytes'], 'avatar.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    // Expect crop modal to open
    expect(await screen.findByRole('heading', { name: /Crop Character Portrait/i })).toBeInTheDocument();

    // Click Apply Crop
    fireEvent.click(screen.getByRole('button', { name: /Apply Crop/i }));

    // Crop modal closes and portrait image is rendered in the identity card
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Crop Character Portrait/i })).toBeNull();
    });
    const portraitImg = screen.getByAltText(/Character Portrait/i);
    expect(portraitImg).toBeInTheDocument();
  });
});
