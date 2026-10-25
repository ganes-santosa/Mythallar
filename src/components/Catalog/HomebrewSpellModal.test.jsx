import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import HomebrewSpellModal from './HomebrewSpellModal';

describe('HomebrewSpellModal', () => {
  it('renders modal form inputs', () => {
    render(<HomebrewSpellModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);

    expect(screen.getByText('Create Homebrew Spell')).toBeInTheDocument();
    expect(screen.getByLabelText(/Spell Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Spell Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/School/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('submits valid homebrew spell object', () => {
    const handleSave = vi.fn();
    render(<HomebrewSpellModal isOpen={true} onClose={vi.fn()} onSave={handleSave} />);

    fireEvent.change(screen.getByLabelText(/Spell Name/i), {
      target: { value: 'Blood Spear' },
    });
    fireEvent.change(screen.getByLabelText(/Spell Level/i), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText(/School/i), {
      target: { value: 'Necromancy' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'You manifest a spear of dark energy.' },
    });

    const submitBtn = screen.getByRole('button', { name: /Save Spell/i });
    fireEvent.click(submitBtn);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Blood Spear',
        source: 'Homebrew',
        level: 2,
        school: 'Necromancy',
        entries: ['You manifest a spear of dark energy.'],
      })
    );
  });

  it('calls onClose when Cancel or Close is clicked', () => {
    const handleClose = vi.fn();
    render(<HomebrewSpellModal isOpen={true} onClose={handleClose} onSave={vi.fn()} />);

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
