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
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={handleUpdate} />);
    
    // Add condition
    const addBtn = screen.getByRole('button', { name: /\+ Add Condition/i });
    fireEvent.click(addBtn);

    const input = screen.getByPlaceholderText(/e\.g\. Paralyzed, Blinded/i);
    fireEvent.change(input, { target: { value: 'Paralyzed' } });

    const submitBtn = screen.getByRole('button', { name: /^Add$/i });
    fireEvent.click(submitBtn);

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      conditions: expect.arrayContaining(['Poisoned', 'Exhausted 1', 'Paralyzed'])
    }));

    // Remove condition
    const removePoisonedBtn = screen.getByLabelText('Remove condition Poisoned');
    fireEvent.click(removePoisonedBtn);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      conditions: ['Exhausted 1']
    }));
  });

  it('renders initiative, speed, hit dice, and death saves', () => {
    const fullVitals = {
      ...mockVitals,
      speed: 30,
      initiativeOverride: null,
      hitDice: { current: 5, max: 8, die: 'd6' },
      deathSaves: { successes: 2, failures: 1 },
      defenses: ['Fire (Resistance)', 'Poison (Immune)'],
    };
    const handleUpdate = vi.fn();
    render(<VitalsCard vitals={fullVitals} dexScore={14} onUpdateVitals={handleUpdate} />);

    // Initiative with DEX 14 (+2 mod)
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByText(/30\s*ft/i)).toBeInTheDocument();
    expect(screen.getByText('5 / 8 d6')).toBeInTheDocument();

    // Death saves toggle
    const successBtn = screen.getByLabelText('Death Save Success 3');
    fireEvent.click(successBtn);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      deathSaves: expect.objectContaining({ successes: 3 })
    }));

    // Defenses display
    expect(screen.getByText('Fire (Resistance)')).toBeInTheDocument();
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

    // Renders effective max (25) and buff indicator (+5 Buff)
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('+5 Buff')).toBeInTheDocument();

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
    const initMobile = screen.getByText('Init');
    expect(initMobile).toBeInTheDocument();
    expect(initMobile).toHaveAttribute('aria-label', 'Initiative');
    expect(screen.getAllByText('Speed')[0]).toBeInTheDocument();
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
    const initElement = screen.getByText('+2');
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

  it('renders combined AC and Initiative in the same card container', () => {
    render(<VitalsCard vitals={{ ac: 15, acFormula: '10 + 2 DEX + 3 Armor', initiativeOverride: null }} dexScore={14} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('10 + 2 DEX + 3 Armor')).toBeInTheDocument();
    expect(screen.getByText('Initiative')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
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

  it('renders walking speed and allows adding and removing optional secondary movement modes', () => {
    const onUpdateVitals = vi.fn();
    render(
      <VitalsCard
        vitals={{ ...mockVitals, speeds: { walk: 30, fly: 60 } }}
        onUpdateVitals={onUpdateVitals}
        isEditing={false}
      />
    );

    expect(screen.getByText('30 ft')).toBeInTheDocument();
    expect(screen.getByText('Walking')).toBeInTheDocument();
    expect(screen.getByText('Flying:')).toBeInTheDocument();
    expect(screen.getByText('60 ft')).toBeInTheDocument();

    // Remove flying speed
    const removeFlyBtn = screen.getByLabelText('Remove Flying speed');
    fireEvent.click(removeFlyBtn);
    expect(onUpdateVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        speeds: { walk: 30 },
      })
    );
  });

  it('allows adding a new optional speed via + Speed button', () => {
    const onUpdateVitals = vi.fn();
    render(
      <VitalsCard
        vitals={{ ...mockVitals, speeds: { walk: 30 } }}
        onUpdateVitals={onUpdateVitals}
        isEditing={false}
      />
    );

    // Click + Speed
    const addSpeedBtn = screen.getByRole('button', { name: '+ Speed' });
    fireEvent.click(addSpeedBtn);

    // Select Swimming and set 40 ft
    const select = screen.getByLabelText('Movement Type');
    fireEvent.change(select, { target: { value: 'swim' } });

    const distInput = screen.getByLabelText('Speed Distance');
    fireEvent.change(distInput, { target: { value: '40' } });

    const submitBtn = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(submitBtn);

    expect(onUpdateVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        speeds: { walk: 30, swim: 40 },
      })
    );
  });
});
