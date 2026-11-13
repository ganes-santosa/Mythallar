import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import VitalsCard from './VitalsCard';

describe('VitalsCard', () => {
  const mockVitals = {
    hpCurrent: 45,
    hpMax: 50,
    hpTemp: 10,
    ac: 16,
    acFormula: '14 + 2 DEX',
    inspiration: 2,
    conditions: ['Poisoned', 'Exhausted 1'],
  };

  it('renders HP, AC, inspiration counter, and active conditions', () => {
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={() => {}} />);
    expect(screen.getByLabelText('Current HP')).toHaveValue(45);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('14 + 2 DEX')).toBeInTheDocument();
    expect(screen.getByText('Inspiration')).toBeInTheDocument();
    expect(screen.getByTestId('inspiration-value')).toHaveTextContent('2');
    expect(screen.getByText('Poisoned')).toBeInTheDocument();
    expect(screen.getByText('Exhausted 1')).toBeInTheDocument();
  });

  it('triggers update callback when HP changes', () => {
    const handleUpdate = vi.fn();
    render(<VitalsCard vitals={mockVitals} isEditing={true} onUpdateVitals={handleUpdate} />);
    const hpInput = screen.getByLabelText('Current HP');
    fireEvent.change(hpInput, { target: { value: '40' } });
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ hpCurrent: 40 }));
  });

  it('allows incrementing and decrementing inspiration counter', () => {
    const handleUpdate = vi.fn();
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={handleUpdate} />);
    const incInspo = screen.getByLabelText('Increment inspiration');
    fireEvent.click(incInspo);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      inspiration: 3
    }));

    const decInspo = screen.getByLabelText('Decrement inspiration');
    fireEvent.click(decInspo);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      inspiration: 1
    }));
  });

  it('allows adding and removing conditions dynamically', () => {
    const handleUpdate = vi.fn();
    const { rerender } = render(<VitalsCard vitals={mockVitals} onUpdateVitals={handleUpdate} />);
    
    // Add condition ("+ Add" button under Conditions)
    const addBtn = screen.getByLabelText('+ Add Condition');
    fireEvent.click(addBtn);

    const input = screen.getByPlaceholderText(/e\.g\. Paralyzed, Blinded/i);
    fireEvent.change(input, { target: { value: 'Paralyzed' } });

    const submitBtn = screen.getByRole('button', { name: /^Add$/i });
    fireEvent.click(submitBtn);

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      conditions: expect.arrayContaining(['Poisoned', 'Exhausted 1', 'Paralyzed'])
    }));

    // In view mode, remove button is hidden
    expect(screen.queryByLabelText('Remove condition Poisoned')).not.toBeInTheDocument();

    // In edit mode, remove button is visible and allows removing
    rerender(<VitalsCard vitals={mockVitals} isEditing={true} onUpdateVitals={handleUpdate} />);
    const removePoisonedBtn = screen.getByLabelText('Remove condition Poisoned');
    fireEvent.click(removePoisonedBtn);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      conditions: ['Exhausted 1']
    }));
  });

  it('renders initiative, spell attack, spell dc, hit dice, and death saves', () => {
    const fullVitals = {
      ...mockVitals,
      initiativeOverride: null,
      hitDice: { current: 5, max: 8, die: 'd6' },
      deathSaves: { successes: 2, failures: 1 },
      defenses: ['Fire (Resistance)', 'Poison (Immune)'],
    };
    const handleUpdate = vi.fn();
    render(
      <VitalsCard
        vitals={fullVitals}
        dexScore={14}
        abilities={{ int: 16 }}
        classes={[{ className: 'Wizard', level: 8 }]}
        onUpdateVitals={handleUpdate}
      />
    );

    // Initiative with DEX 14 (+2 mod)
    expect(screen.getByText('+2')).toBeInTheDocument();
    // Spell attack (+3 prof + 3 mod = +6) and DC (8 + 3 prof + 3 mod = 14)
    expect(screen.getByText('+6')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Spell Attack')).toBeInTheDocument();
    expect(screen.getByText('Spell DC')).toBeInTheDocument();
    expect(screen.getByText('INT')).toBeInTheDocument();

    expect(screen.getByText(/5\/8 d6/)).toBeInTheDocument();

    // Death saves toggle
    const successBtn = screen.getByLabelText('Death Save Success 3');
    fireEvent.click(successBtn);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      deathSaves: expect.objectContaining({ successes: 3 })
    }));

    // Defenses display
    expect(screen.getByText('Fire (Resistance)')).toBeInTheDocument();
  });

  it('allows adding resistance and immunity with type toggle', () => {
    const handleUpdate = vi.fn();
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={handleUpdate} />);

    // Open add defense form ("+ Add" button under Defenses)
    const addBtn = screen.getByLabelText('+ Add Defense');
    fireEvent.click(addBtn);

    // Toggle defaults to Resistance
    const input = screen.getByPlaceholderText(/e\.g\. Fire, Cold/i);
    fireEvent.change(input, { target: { value: 'Cold' } });
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      defenses: ['Cold (Resistance)'],
    }));

    // Toggle to Immunity
    fireEvent.click(addBtn);
    const immunityBtn = screen.getByRole('button', { name: /^Immunity$/i });
    fireEvent.click(immunityBtn);

    const immuneInput = screen.getByPlaceholderText(/e\.g\. Poison, Charmed/i);
    fireEvent.change(immuneInput, { target: { value: 'Poison' } });
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      defenses: ['Poison (Immune)'],
    }));

    // In view mode, remove button is hidden
    expect(screen.queryByLabelText(/Remove defense/i)).not.toBeInTheDocument();

    // In edit mode, remove button is visible and allows removing
    const vitalsWithDefense = { ...mockVitals, defenses: ['Cold (Resistance)'] };
    const { rerender: rerenderEdit } = render(
      <VitalsCard vitals={vitalsWithDefense} isEditing={true} onUpdateVitals={handleUpdate} />
    );
    const removeColdBtn = screen.getByLabelText('Remove defense Cold (Resistance)');
    fireEvent.click(removeColdBtn);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      defenses: [],
    }));
  });

  it('allows opening and saving AC note via inline note action', () => {
    const handleUpdate = vi.fn();
    const vitalsWithoutNote = {
      ...mockVitals,
      ac: 15,
      acFormula: '',
    };
    render(<VitalsCard vitals={vitalsWithoutNote} onUpdateVitals={handleUpdate} />);

    // Click "+ Note"
    const addNoteBtn = screen.getByRole('button', { name: /\+ Note/i });
    fireEvent.click(addNoteBtn);

    const textarea = screen.getByPlaceholderText(/e\.g\. 14 \+ 2 DEX, Shield/i);
    fireEvent.change(textarea, { target: { value: 'Mage Armor + DEX' } });

    const saveBtn = screen.getByRole('button', { name: /^save$/i });
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      acFormula: 'Mage Armor + DEX',
    }));
  });

  it('renders a permanent unremovable Exhaustion entry with a 0-6 stepper', () => {
    const handleUpdate = vi.fn();
    const vitalsWithZeroExhaustion = {
      ...mockVitals,
      conditions: [],
      exhaustion: 0,
    };

    const { rerender } = render(
      <VitalsCard vitals={vitalsWithZeroExhaustion} onUpdateVitals={handleUpdate} />
    );

    // Always present and unremovable
    expect(screen.getByText('Exhaustion')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Remove condition Exhaustion/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('exhaustion-level')).toHaveTextContent('0');

    // Decrement disabled at 0
    const decBtn = screen.getByLabelText('Decrease exhaustion');
    expect(decBtn).toBeDisabled();

    // Increment increases to 1
    const incBtn = screen.getByLabelText('Increase exhaustion');
    expect(incBtn).not.toBeDisabled();
    fireEvent.click(incBtn);
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ exhaustion: 1 })
    );

    // When at 6, increment is disabled and styling stays clean bg-dnd-card (no amber highlight)
    rerender(
      <VitalsCard
        vitals={{ ...vitalsWithZeroExhaustion, exhaustion: 6 }}
        onUpdateVitals={handleUpdate}
      />
    );
    expect(screen.getByTestId('exhaustion-level')).toHaveTextContent('6');
    expect(screen.getByLabelText('Increase exhaustion')).toBeDisabled();
    expect(screen.getByLabelText('Decrease exhaustion')).not.toBeDisabled();
    const exhaustionChip = screen.getByTestId('exhaustion-chip');
    expect(exhaustionChip.className).not.toContain('amber');
    expect(exhaustionChip.className).toContain('bg-dnd-card');
  });

  it('implements 5e quick damage and healing with temp HP absorption and effective max clamping', () => {
    const handleUpdate = vi.fn();
    const vitals = {
      ...mockVitals,
      hpCurrent: 10,
      hpMax: 20,
      hpMaxBuff: 5, // effectiveMax = 25
      hpTemp: 8,
    };

    const { rerender } = render(<VitalsCard vitals={vitals} onUpdateVitals={handleUpdate} />);

    // Renders effective max (25) colored with text-amber-400 when buffed, no buff chip
    const maxHpEl = screen.getByText('25');
    expect(maxHpEl).toBeInTheDocument();
    expect(maxHpEl).toHaveClass('text-amber-400');
    expect(screen.queryByText('+5 Buff')).not.toBeInTheDocument();

    const amtInput = screen.getByPlaceholderText('0');
    const dmgBtn = screen.getByRole('button', { name: /damage/i });
    const healBtn = screen.getByRole('button', { name: /heal/i });

    // 1. Partial damage absorbed by Temp HP: damage 5 (<= 8 temp)
    fireEvent.change(amtInput, { target: { value: '5' } });
    fireEvent.click(dmgBtn);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      hpCurrent: 10,
      hpTemp: 3,
    }));
    // Input resets to empty
    expect(amtInput.value).toBe('');

    // 2. Damage exceeding Temp HP: damage 12 (8 temp + 4 from current)
    fireEvent.change(amtInput, { target: { value: '12' } });
    fireEvent.click(dmgBtn);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      hpCurrent: 6,
      hpTemp: 0,
    }));

    // 3. Massive damage exceeding total HP: damage 50 -> clamps at 0 current HP
    fireEvent.change(amtInput, { target: { value: '50' } });
    fireEvent.click(dmgBtn);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      hpCurrent: 0,
      hpTemp: 0,
    }));

    // 4. Quick Heal: heals up to effective max (25) without touching temp HP
    fireEvent.change(amtInput, { target: { value: '10' } });
    fireEvent.click(healBtn);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      hpCurrent: 20, // 10 + 10 <= 25
      hpTemp: 8,
    }));

    // 5. Overflow heal: heals 20 when current is 10 and max is 25 -> clamps at 25
    fireEvent.change(amtInput, { target: { value: '20' } });
    fireEvent.click(healBtn);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      hpCurrent: 25,
      hpTemp: 8,
    }));
  });

  it('handles invalid, zero, or negative quick HP amounts and prevents over-max heal reduction', () => {
    const handleUpdate = vi.fn();
    const vitalsOverMax = {
      hpCurrent: 30,
      hpMax: 20,
      hpMaxBuff: 0,
      hpTemp: 5,
    };

    const { rerender } = render(<VitalsCard vitals={vitalsOverMax} onUpdateVitals={handleUpdate} />);
    const amtInput = screen.getByPlaceholderText('0');
    const dmgBtn = screen.getByRole('button', { name: 'Apply Damage' });
    const healBtn = screen.getByRole('button', { name: 'Apply Heal' });

    // Invalid / zero / negative damage should be ignored
    fireEvent.change(amtInput, { target: { value: '0' } });
    fireEvent.click(dmgBtn);
    fireEvent.change(amtInput, { target: { value: '-5' } });
    fireEvent.click(dmgBtn);
    fireEvent.change(amtInput, { target: { value: 'abc' } });
    fireEvent.click(dmgBtn);
    expect(handleUpdate).not.toHaveBeenCalled();

    // Invalid / zero / negative heal should be ignored
    fireEvent.change(amtInput, { target: { value: '0' } });
    fireEvent.click(healBtn);
    fireEvent.change(amtInput, { target: { value: '-5' } });
    fireEvent.click(healBtn);
    expect(handleUpdate).not.toHaveBeenCalled();

    // Quick heal when hpCurrent >= effectiveMax should not reduce current HP
    fireEvent.change(amtInput, { target: { value: '10' } });
    fireEvent.click(healBtn);
    expect(handleUpdate).not.toHaveBeenCalled();
    expect(amtInput.value).toBe('');
  });

  it('renders labels and trackers in uniform Title Case with responsive Initiative', () => {
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={() => {}} />);
    expect(screen.getByText('Hit Points')).toBeInTheDocument();
    expect(screen.getByText('Initiative')).toBeInTheDocument();
    expect(screen.getByText('Spell Attack')).toBeInTheDocument();
    expect(screen.getByText('Spell DC')).toBeInTheDocument();
    expect(screen.getByText('Hit Dice')).toBeInTheDocument();
    expect(screen.getByText('Death Saves')).toBeInTheDocument();
    expect(screen.getByText('Inspiration')).toBeInTheDocument();
    expect(screen.getByText('Succ')).toBeInTheDocument();
    expect(screen.getByText('Fail')).toBeInTheDocument();

    const amtInput = screen.getByLabelText('Amount');
    expect(amtInput).toBeInTheDocument();

    const dmgBtn = screen.getByRole('button', { name: 'Apply Damage' });
    const healBtn = screen.getByRole('button', { name: 'Apply Heal' });
    expect(dmgBtn.className).not.toContain('uppercase');
    expect(healBtn.className).not.toContain('uppercase');
  });

  it('renders AC and Initiative in white text and provides a persistent AC note edit button', () => {
    const handleUpdate = vi.fn();
    render(<VitalsCard vitals={mockVitals} dexScore={14} onUpdateVitals={handleUpdate} isEditing={false} />);

    // AC number should be white (text-slate-100)
    const acElement = screen.getByText('16');
    expect(acElement.className).toContain('text-slate-100');
    expect(acElement.className).not.toContain('text-dnd-gold');

    // Initiative number should be white (text-slate-100)
    const initElement = screen.getAllByText('+2')[0];
    expect(initElement.className).toContain('text-slate-100');
    expect(initElement.className).not.toContain('text-dnd-gold');

    // Persistent AC note edit button without opacity-0
    const editAcNoteBtn = screen.getByRole('button', { name: /Edit AC Note/i });
    expect(editAcNoteBtn).toBeInTheDocument();
    expect(editAcNoteBtn.className).not.toContain('opacity-0');

    // Clicking edit button opens textarea
    fireEvent.click(editAcNoteBtn);
    const textarea = screen.getByPlaceholderText(/e\.g\. 14 \+ 2 DEX, Shield/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('14 + 2 DEX');

    // Quick damage/heal group has text-[10px]
    const dmgBtn = screen.getByRole('button', { name: 'Apply Damage' });
    const healBtn = screen.getByRole('button', { name: 'Apply Heal' });
    const amtInput = screen.getByLabelText('Amount');
    expect(dmgBtn.className).toContain('text-[10px]');
    expect(healBtn.className).toContain('text-[10px]');
    expect(amtInput.className).toContain('text-[10px]');
    expect(amtInput).toHaveAttribute('placeholder', '0');
  });

  it('renders AC and Initiative as distinct stacked cards', () => {
    render(<VitalsCard vitals={{ ac: 15, acFormula: '10 + 2 DEX + 3 Armor', initiativeOverride: null }} dexScore={14} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('10 + 2 DEX + 3 Armor')).toBeInTheDocument();
    expect(screen.getByText('Initiative')).toBeInTheDocument();
    expect(screen.getAllByText('+2')[0]).toBeInTheDocument();
  });

  it('renders always-interactive inputs for Current HP and Temp HP with slash between Current and Max, while keeping Max HP static', () => {
    const handleUpdate = vi.fn();
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={handleUpdate} isEditing={false} />);

    // Always-interactive Current HP input
    const currentHpInput = screen.getByLabelText('Current HP');
    expect(currentHpInput).toBeInTheDocument();
    expect(currentHpInput.value).toBe('45');

    // Slash and static Max HP
    expect(screen.getByText('/')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    // Always-interactive Temp HP input
    const tempHpInput = screen.getByLabelText('Temp HP');
    expect(tempHpInput).toBeInTheDocument();
    expect(tempHpInput.value).toBe('10');

    // Edit Current HP via blur or Enter
    fireEvent.change(currentHpInput, { target: { value: '38' } });
    fireEvent.keyDown(currentHpInput, { key: 'Enter', code: 'Enter' });
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      hpCurrent: 38,
    }));

    // Edit Temp HP via blur
    fireEvent.change(tempHpInput, { target: { value: '15' } });
    fireEvent.blur(tempHpInput);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      hpTemp: 15,
    }));
  });

  it('resets always-interactive inputs on Escape without committing changes', () => {
    const handleUpdate = vi.fn();
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={handleUpdate} isEditing={false} />);

    // Current HP reset on Escape
    const hpInput = screen.getByLabelText('Current HP');
    fireEvent.focus(hpInput);
    fireEvent.change(hpInput, { target: { value: '20' } });
    fireEvent.keyDown(hpInput, { key: 'Escape', code: 'Escape' });
    fireEvent.blur(hpInput);
    expect(handleUpdate).not.toHaveBeenCalled();
    expect(hpInput.value).toBe('45');

    // Temp HP reset on Escape
    const tempInput = screen.getByLabelText('Temp HP');
    fireEvent.focus(tempInput);
    fireEvent.change(tempInput, { target: { value: '99' } });
    fireEvent.keyDown(tempInput, { key: 'Escape', code: 'Escape' });
    fireEvent.blur(tempInput);
    expect(handleUpdate).not.toHaveBeenCalled();
    expect(tempInput.value).toBe('10');
  });

  it('colors Max HP value with text-amber-400 when buffed without a separate header chip', () => {
    const buffedVitals = {
      ...mockVitals,
      hpCurrent: 73,
      hpMax: 73,
      hpMaxBuff: 12, // effectiveMax = 85
    };
    const { rerender } = render(<VitalsCard vitals={buffedVitals} />);

    // Separate header chip should NOT exist
    expect(screen.queryByText('+12 Buff')).not.toBeInTheDocument();

    // Effective max (85) is colored with text-amber-400 and has tooltip
    const effectiveMaxEl = screen.getByText('85');
    expect(effectiveMaxEl).toHaveClass('text-amber-400');
    expect(effectiveMaxEl).toHaveAttribute('title', 'Base Max: 73 (+12 Buff)');

    // Negative buff (Max HP drain)
    const drainedVitals = {
      ...mockVitals,
      hpCurrent: 40,
      hpMax: 50,
      hpMaxBuff: -10, // effectiveMax = 40
    };
    rerender(<VitalsCard vitals={drainedVitals} />);

    const drainedMaxEl = screen.getByText('40');
    expect(drainedMaxEl).toHaveClass('text-rose-400');
    expect(drainedMaxEl).toHaveAttribute('title', 'Base Max: 50 (-10 Drain)');

    // Unbuffed
    const unbuffedVitals = {
      ...mockVitals,
      hpCurrent: 40,
      hpMax: 50,
      hpMaxBuff: 0,
    };
    rerender(<VitalsCard vitals={unbuffedVitals} />);
    const unbuffedMaxEl = screen.getByText('50');
    expect(unbuffedMaxEl).toHaveClass('text-slate-400');
    expect(unbuffedMaxEl).not.toHaveClass('text-amber-400');
  });

  it('clamps negative values to 0 when committing always-interactive Current HP and Temp HP', () => {
    const handleUpdate = vi.fn();
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={handleUpdate} isEditing={false} />);

    // Negative Current HP clamped to 0
    const hpInput = screen.getByLabelText('Current HP');
    fireEvent.change(hpInput, { target: { value: '-12' } });
    fireEvent.keyDown(hpInput, { key: 'Enter', code: 'Enter' });
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      hpCurrent: 0,
    }));

    // Negative Temp HP clamped to 0
    const tempInput = screen.getByLabelText('Temp HP');
    fireEvent.change(tempInput, { target: { value: '-5' } });
    fireEvent.blur(tempInput);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      hpTemp: 0,
    }));
  });

  it('displays 0 in Temp HP input when temp HP is 0', () => {
    const zeroTempVitals = { ...mockVitals, hpTemp: 0 };
    render(<VitalsCard vitals={zeroTempVitals} onUpdateVitals={() => {}} isEditing={false} />);
    const tempInput = screen.getByLabelText('Temp HP');
    expect(tempInput.value).toBe('0');
  });

  it('renders spell attack and spell dc accurately and supports manual overrides', () => {
    const onUpdateVitals = vi.fn();
    const { rerender } = render(
      <VitalsCard
        vitals={mockVitals}
        abilities={{ int: 18 }}
        classes={[{ className: 'Wizard', level: 5 }]}
        onUpdateVitals={onUpdateVitals}
        isEditing={false}
      />
    );

    // INT 18 (+4), Level 5 (+3 prof) -> Attack +7, DC 15
    expect(screen.getByText('+7')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Spell Attack')).toBeInTheDocument();
    expect(screen.getByText('Spell DC')).toBeInTheDocument();

    // Rerender in edit mode
    rerender(
      <VitalsCard
        vitals={mockVitals}
        abilities={{ int: 18 }}
        classes={[{ className: 'Wizard', level: 5 }]}
        onUpdateVitals={onUpdateVitals}
        isEditing={true}
      />
    );

    // Override inputs
    const attackInput = screen.getByLabelText('Spell Attack Override');
    fireEvent.change(attackInput, { target: { value: '9' } });
    expect(onUpdateVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        spellAttackOverride: 9,
      })
    );

    const dcInput = screen.getByLabelText('Spell DC Override');
    fireEvent.change(dcInput, { target: { value: '17' } });
    expect(onUpdateVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        spellDcOverride: 17,
      })
    );
  });

  it('applies acBonus to calculate effective AC and allows editing AC misc bonus', () => {
    const onUpdateVitals = vi.fn();
    const { rerender } = render(
      <VitalsCard
        vitals={{ ...mockVitals, ac: 15, acBonus: 2 }}
        onUpdateVitals={onUpdateVitals}
        isEditing={false}
      />
    );

    // 15 base + 2 bonus = 17 effective AC
    expect(screen.getByText('17')).toBeInTheDocument();

    rerender(
      <VitalsCard
        vitals={{ ...mockVitals, ac: 15, acBonus: 2 }}
        onUpdateVitals={onUpdateVitals}
        isEditing={true}
      />
    );

    const bonusInput = screen.getByLabelText('AC Misc Bonus');
    expect(bonusInput).toHaveValue(2);
    fireEvent.change(bonusInput, { target: { value: '3' } });
    expect(onUpdateVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        acBonus: 3,
      })
    );
  });

  it('applies spellAttackBonus and spellDcBonus and allows editing misc bonuses in edit mode', () => {
    const onUpdateVitals = vi.fn();
    const { rerender } = render(
      <VitalsCard
        vitals={{ ...mockVitals, spellAttackBonus: 1, spellDcBonus: 2 }}
        abilities={{ int: 18 }}
        classes={[{ className: 'Wizard', level: 5 }]}
        onUpdateVitals={onUpdateVitals}
        isEditing={false}
      />
    );

    // INT 18 (+4), Level 5 (+3 prof) + bonus
    // Attack: 4 + 3 + 1 = +8
    // DC: 8 + 3 + 4 + 2 = 17
    expect(screen.getByText('+8')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();

    rerender(
      <VitalsCard
        vitals={{ ...mockVitals, spellAttackBonus: 1, spellDcBonus: 2 }}
        abilities={{ int: 18 }}
        classes={[{ className: 'Wizard', level: 5 }]}
        onUpdateVitals={onUpdateVitals}
        isEditing={true}
      />
    );

    const attackBonusInput = screen.getByLabelText('Spell Attack Misc Bonus');
    expect(attackBonusInput).toHaveValue(1);
    fireEvent.change(attackBonusInput, { target: { value: '2' } });
    expect(onUpdateVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        spellAttackBonus: 2,
      })
    );

    const dcBonusInput = screen.getByLabelText('Spell DC Misc Bonus');
    expect(dcBonusInput).toHaveValue(2);
    fireEvent.change(dcBonusInput, { target: { value: '3' } });
    expect(onUpdateVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        spellDcBonus: 3,
      })
    );
  });

  it('allows changing spellcasting ability in edit mode', () => {
    const onUpdateVitals = vi.fn();
    render(
      <VitalsCard
        vitals={mockVitals}
        abilities={{ int: 14, cha: 18 }}
        classes={[{ className: 'Sorcerer', level: 5 }]}
        onUpdateVitals={onUpdateVitals}
        isEditing={true}
      />
    );

    // Sorcerer defaults to CHA
    const select = screen.getByLabelText('Spellcasting Ability');
    expect(select.value).toBe('cha');

    // Change to WIS
    fireEvent.change(select, { target: { value: 'wis' } });
    expect(onUpdateVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        spellcastingAbility: 'wis',
      })
    );
  });

  describe('Hit Dice Rolling & Management', () => {
    it('renders multiclass hit dice pools and allows rolling a hit die to heal HP live', () => {
      const handleUpdate = vi.fn();
      const multiclassVitals = {
        ...mockVitals,
        hpCurrent: 30,
        hpMax: 50,
        hpMaxBuff: 0,
        hitDice: {
          current: 5,
          max: 5,
          die: 'd8',
          pools: {
            d8: { current: 3, max: 3, classNames: ['Rogue'] },
            d10: { current: 2, max: 2, classNames: ['Fighter'] },
          },
        },
      };

      render(
        <VitalsCard
          vitals={multiclassVitals}
          conScore={14} // CON 14 (+2 mod)
          classes={[
            { className: 'Rogue', level: 3 },
            { className: 'Fighter', level: 2 },
          ]}
          onUpdateVitals={handleUpdate}
        />
      );

      // Both pools rendered
      expect(screen.getByRole('button', { name: /Roll d8/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Roll d10/i })).toBeInTheDocument();

      // Click roll d8: first click arms confirmation hook
      const rollD8Btn = screen.getByRole('button', { name: /Roll d8/i });
      fireEvent.click(rollD8Btn);

      expect(handleUpdate).not.toHaveBeenCalled();
      const armedBtn = screen.getByRole('button', { name: /Click again to roll d8/i });
      expect(armedBtn).toBeInTheDocument();

      // Second click executes roll, restores HP, and shows toast
      fireEvent.click(armedBtn);

      expect(handleUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          // hpCurrent should be healed (30 + at least 1)
          hpCurrent: expect.any(Number),
          hitDice: expect.objectContaining({
            pools: expect.objectContaining({
              d8: expect.objectContaining({ current: 2, max: 3 }),
            }),
          }),
        })
      );
      const updatedHp = handleUpdate.mock.calls[0][0].hpCurrent;
      expect(updatedHp).toBeGreaterThan(30);
      expect(updatedHp).toBeLessThanOrEqual(50);
      expect(screen.getByText(/Restored d8 \(\d+\) HP/i)).toBeInTheDocument();
    });

    it('allows manual increment and decrement of hit dice without altering HP', () => {
      const handleUpdate = vi.fn();
      const singleClassVitals = {
        ...mockVitals,
        hpCurrent: 30,
        hpMax: 50,
        hitDice: {
          current: 3,
          max: 5,
          die: 'd8',
          pools: {
            d8: { current: 3, max: 5, classNames: ['Rogue'] },
          },
        },
      };

      render(
        <VitalsCard
          vitals={singleClassVitals}
          conScore={10}
          classes={[{ className: 'Rogue', level: 5 }]}
          onUpdateVitals={handleUpdate}
        />
      );

      // Manual spend
      const spendBtn = screen.getByLabelText('Spend d8 Hit Die');
      fireEvent.click(spendBtn);
      expect(handleUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          hpCurrent: 30, // Unchanged
          hitDice: expect.objectContaining({
            current: 2,
            pools: expect.objectContaining({
              d8: expect.objectContaining({ current: 2, max: 5 }),
            }),
          }),
        })
      );

      // Manual recover
      const recoverBtn = screen.getByLabelText('Recover d8 Hit Die');
      fireEvent.click(recoverBtn);
      expect(handleUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          hpCurrent: 30, // Unchanged
          hitDice: expect.objectContaining({
            current: 4,
            pools: expect.objectContaining({
              d8: expect.objectContaining({ current: 4, max: 5 }),
            }),
          }),
        })
      );
    });

    it('disables roll button when HP is at effective max or pool is empty', () => {
      const handleUpdate = vi.fn();
      const fullHpVitals = {
        ...mockVitals,
        hpCurrent: 50,
        hpMax: 50,
        hpMaxBuff: 0,
        hitDice: {
          current: 5,
          max: 5,
          die: 'd8',
          pools: {
            d8: { current: 5, max: 5, classNames: ['Rogue'] },
          },
        },
      };

      const { rerender } = render(
        <VitalsCard
          vitals={fullHpVitals}
          conScore={10}
          classes={[{ className: 'Rogue', level: 5 }]}
          onUpdateVitals={handleUpdate}
        />
      );

      // Disabled because HP is full
      const rollBtn = screen.getByRole('button', { name: /Roll d8/i });
      expect(rollBtn).toBeDisabled();

      // Rerender with empty pool and damaged HP
      rerender(
        <VitalsCard
          vitals={{
            ...fullHpVitals,
            hpCurrent: 20,
            hitDice: {
              current: 0,
              max: 5,
              die: 'd8',
              pools: {
                d8: { current: 0, max: 5, classNames: ['Rogue'] },
              },
            },
          }}
          conScore={10}
          classes={[{ className: 'Rogue', level: 5 }]}
          onUpdateVitals={handleUpdate}
        />
      );

      // Disabled because pool is 0
      expect(screen.getByRole('button', { name: /Roll d8/i })).toBeDisabled();
    });
  });

  it('renders Level 3 nested subcontainers with bg-dnd-panel/70', () => {
    render(
      <VitalsCard
        vitals={mockVitals}
        abilities={{ int: 18 }}
        classes={[{ className: 'Wizard', level: 5 }]}
        onUpdateVitals={() => {}}
      />
    );

    // HP capsule
    const hpInput = screen.getByLabelText('Current HP');
    const hpCapsule = hpInput.closest('.rounded-md');
    expect(hpCapsule.className).toContain('bg-dnd-panel/70');

    // Quick treatment capsule
    const amtInput = screen.getByLabelText('Amount');
    const treatmentCapsule = amtInput.closest('.rounded-md');
    expect(treatmentCapsule.className).toContain('bg-dnd-panel/70');

    // Spellcasting ability badge
    const spellAbilityBadge = screen.getByText('INT');
    expect(spellAbilityBadge.className).toContain('bg-dnd-panel/70');
  });

  describe('Mini Health Bar Buffed State Visualization', () => {
    it('renders notch and buff zone when hpMaxBuff > 0, splitting base and buffed segments', () => {
      // Base Max 73, Buff 12 -> Effective Max 85. Current 73, Temp 14.
      const buffedVitals = {
        ...mockVitals,
        hpCurrent: 73,
        hpMax: 73,
        hpMaxBuff: 12,
        hpTemp: 14,
      };
      const { rerender } = render(<VitalsCard vitals={buffedVitals} />);

      const notch = screen.getByTestId('hp-base-max-notch');
      expect(notch).toBeInTheDocument();
      // basePercent = (73 / 85) * 100 =~ 85.8824%
      expect(notch.style.left).toContain('85.88');

      const buffZone = screen.getByTestId('hp-buff-track');
      expect(buffZone).toBeInTheDocument();
      expect(buffZone.style.left).toContain('85.88');

      const baseCurrentBar = screen.getByTestId('hp-bar-base-current');
      expect(baseCurrentBar.style.width).toContain('85.88');

      const buffedCurrentBar = screen.getByTestId('hp-bar-buffed-current');
      expect(buffedCurrentBar.style.width).toBe('0%');

      const tempBar = screen.getByTestId('hp-bar-temp');
      // 100 - 85.8824 =~ 14.1176%
      expect(tempBar.style.width).toContain('14.11');

      // Now Current HP expands into buffed capacity: Current 80 (73 base + 7 buffed)
      rerender(<VitalsCard vitals={{ ...buffedVitals, hpCurrent: 80, hpTemp: 0 }} />);
      expect(screen.getByTestId('hp-bar-base-current').style.width).toContain('85.88');
      // (7 / 85) * 100 =~ 8.235%
      expect(screen.getByTestId('hp-bar-buffed-current').style.width).toContain('8.23');
    });

    it('does not render notch or buff zone when hpMaxBuff <= 0', () => {
      const normalVitals = {
        ...mockVitals,
        hpCurrent: 20,
        hpMax: 20,
        hpMaxBuff: 0,
        hpTemp: 5,
      };
      render(<VitalsCard vitals={normalVitals} />);

      expect(screen.queryByTestId('hp-base-max-notch')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hp-buff-track')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hp-bar-buffed-current')).not.toBeInTheDocument();
      expect(screen.getByTestId('hp-bar-base-current')).toBeInTheDocument();
      expect(screen.getByTestId('hp-bar-temp')).toBeInTheDocument();
    });
  });

  describe('Undo & Redo HP', () => {
    function InteractiveVitalsHarness({ initialVitals, characterId }) {
      const [vitals, setVitals] = React.useState(initialVitals);
      return (
        <VitalsCard
          characterId={characterId}
          vitals={vitals}
          onUpdateVitals={setVitals}
        />
      );
    }

    it('renders undo and redo buttons in disabled state initially', () => {
      render(<VitalsCard vitals={mockVitals} />);
      const undoBtn = screen.getByRole('button', { name: 'Undo HP' });
      const redoBtn = screen.getByRole('button', { name: 'Redo HP' });
      expect(undoBtn).toBeInTheDocument();
      expect(redoBtn).toBeInTheDocument();
      expect(undoBtn).toBeDisabled();
      expect(redoBtn).toBeDisabled();
      expect(undoBtn).toHaveAttribute('title', 'Nothing to undo');
      expect(redoBtn).toHaveAttribute('title', 'Nothing to redo');
      expect(undoBtn.className).toContain('disabled:cursor-default');
      expect(redoBtn.className).toContain('disabled:cursor-default');
      expect(undoBtn.className).not.toContain('disabled:cursor-not-allowed');
      expect(redoBtn.className).not.toContain('disabled:cursor-not-allowed');
    });

    it('enables undo after damage and restores previous HP on undo click', () => {
      render(<InteractiveVitalsHarness initialVitals={{ ...mockVitals, hpCurrent: 45, hpTemp: 10 }} />);

      const amtInput = screen.getByPlaceholderText('0');
      const dmgBtn = screen.getByRole('button', { name: 'Apply Damage' });
      const undoBtn = screen.getByRole('button', { name: 'Undo HP' });
      const redoBtn = screen.getByRole('button', { name: 'Redo HP' });

      // Apply 12 damage: 10 temp absorbed, 2 from current -> hpCurrent 43, hpTemp 0
      fireEvent.change(amtInput, { target: { value: '12' } });
      fireEvent.click(dmgBtn);

      expect(screen.getByLabelText('Current HP')).toHaveValue(43);
      expect(screen.getByLabelText('Temp HP')).toHaveValue(0);
      expect(undoBtn).not.toBeDisabled();
      expect(redoBtn).toBeDisabled();
      expect(undoBtn).toHaveAttribute('title', 'Undo HP to 45 (+10 Temp)');

      // Click Undo -> restores 45 HP and 10 Temp
      fireEvent.click(undoBtn);

      expect(screen.getByLabelText('Current HP')).toHaveValue(45);
      expect(screen.getByLabelText('Temp HP')).toHaveValue(10);
      expect(undoBtn).toBeDisabled();
      expect(redoBtn).not.toBeDisabled();
      expect(redoBtn).toHaveAttribute('title', 'Redo HP to 43');

      // Click Redo -> reapplies 43 HP and 0 Temp
      fireEvent.click(redoBtn);

      expect(screen.getByLabelText('Current HP')).toHaveValue(43);
      expect(screen.getByLabelText('Temp HP')).toHaveValue(0);
      expect(undoBtn).not.toBeDisabled();
      expect(redoBtn).toBeDisabled();
    });

    it('clears redo history when a new HP change is applied after undo', () => {
      render(<InteractiveVitalsHarness initialVitals={{ ...mockVitals, hpCurrent: 40, hpTemp: 0 }} />);

      const amtInput = screen.getByPlaceholderText('0');
      const dmgBtn = screen.getByRole('button', { name: 'Apply Damage' });
      const healBtn = screen.getByRole('button', { name: 'Apply Heal' });
      const undoBtn = screen.getByRole('button', { name: 'Undo HP' });
      const redoBtn = screen.getByRole('button', { name: 'Redo HP' });

      // Damage 5 -> HP 35
      fireEvent.change(amtInput, { target: { value: '5' } });
      fireEvent.click(dmgBtn);
      expect(screen.getByLabelText('Current HP')).toHaveValue(35);

      // Undo -> HP 40
      fireEvent.click(undoBtn);
      expect(screen.getByLabelText('Current HP')).toHaveValue(40);
      expect(redoBtn).not.toBeDisabled();

      // Heal 2 -> HP 42 (new branch)
      fireEvent.change(amtInput, { target: { value: '2' } });
      fireEvent.click(healBtn);
      expect(screen.getByLabelText('Current HP')).toHaveValue(42);

      // Redo must now be disabled because history branched
      expect(redoBtn).toBeDisabled();
      expect(undoBtn).not.toBeDisabled();
    });

    it('resets undo and redo history when characterId changes', () => {
      const { rerender } = render(
        <InteractiveVitalsHarness characterId="char-1" initialVitals={{ ...mockVitals, hpCurrent: 50 }} />
      );

      const amtInput = screen.getByPlaceholderText('0');
      const dmgBtn = screen.getByRole('button', { name: 'Apply Damage' });
      const undoBtn = screen.getByRole('button', { name: 'Undo HP' });

      fireEvent.change(amtInput, { target: { value: '10' } });
      fireEvent.click(dmgBtn);
      expect(undoBtn).not.toBeDisabled();

      // Switch character
      rerender(<InteractiveVitalsHarness characterId="char-2" initialVitals={{ ...mockVitals, hpCurrent: 30 }} />);
      expect(screen.getByRole('button', { name: 'Undo HP' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Redo HP' })).toBeDisabled();
    });
  });

  describe('Simulacrum Mode (isSimulacrum)', () => {
    it('renders Row 1 (HP, AC, Spellcasting, Initiative) while suppressing Row 2 and Row 3', () => {
      render(
        <VitalsCard
          isSimulacrum={true}
          vitals={{
            hpCurrent: 25,
            hpMax: 25,
            hpTemp: 0,
            ac: 15,
            acFormula: '10 + 2 DEX + 3 Mage Armor',
            inspiration: 1,
            conditions: ['Poisoned'],
            defenses: ['Fire Resistance'],
          }}
          abilities={{ int: 16 }}
          classes={[{ className: 'Wizard', level: 5 }]}
          onUpdateVitals={() => {}}
        />
      );

      // Row 1 elements must be present
      expect(screen.getByLabelText('Current HP')).toHaveValue(25);
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('10 + 2 DEX + 3 Mage Armor')).toBeInTheDocument();
      expect(screen.getByText('Spellcasting')).toBeInTheDocument();
      expect(screen.getByText('Initiative')).toBeInTheDocument();

      // Row 2 and Row 3 trackers must be suppressed
      expect(screen.queryByText('Hit Dice')).not.toBeInTheDocument();
      expect(screen.queryByText('Inspiration')).not.toBeInTheDocument();
      expect(screen.queryByText('Death Saves')).not.toBeInTheDocument();
      expect(screen.queryByText('Conditions:')).not.toBeInTheDocument();
      expect(screen.queryByText('Poisoned')).not.toBeInTheDocument();
      expect(screen.queryByText('Resistance & Immunities:')).not.toBeInTheDocument();
      expect(screen.queryByText('Fire Resistance')).not.toBeInTheDocument();
    });
  });
});
