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
    conditions: {
      exhaustion: 1,
      inspiration: true,
      heroicInspiration: false,
    },
  };

  it('renders HP, AC, and condition values', () => {
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={() => {}} />);
    expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    expect(screen.getByText('/ 50')).toBeInTheDocument();
    expect(screen.getByDisplayValue('16')).toBeInTheDocument();
    expect(screen.getByDisplayValue('14 + 2 DEX')).toBeInTheDocument();
    expect(screen.getByText('Exh: 1')).toBeInTheDocument();
  });

  it('triggers update callback when HP changes', () => {
    const handleUpdate = vi.fn();
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={handleUpdate} />);
    const hpInput = screen.getByDisplayValue('45');
    fireEvent.change(hpInput, { target: { value: '40' } });
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ hpCurrent: 40 }));
  });

  it('allows stepping exhaustion and toggling inspiration', () => {
    const handleUpdate = vi.fn();
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={handleUpdate} />);
    const incExh = screen.getByLabelText('Increment exhaustion');
    fireEvent.click(incExh);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      conditions: expect.objectContaining({ exhaustion: 2 })
    }));

    const inspoToggle = screen.getByLabelText('Toggle inspiration');
    fireEvent.click(inspoToggle);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      conditions: expect.objectContaining({ inspiration: false })
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
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
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
});
