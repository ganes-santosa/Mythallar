import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LocalCharactersImportModal from './LocalCharactersImportModal';

const chars = [
  { id: 'a', name: 'Mordenkainen', className: 'Wizard', level: 9 },
  { id: 'b', name: 'Astarion', className: 'Rogue', level: 3 },
];

const homebrewSpells = [
  { id: 's1', name: 'Blood Spear', level: 2, school: 'Necromancy' },
  { id: 's2', name: 'Shadow Step', level: 1, school: 'Illusion' },
];

describe('LocalCharactersImportModal', () => {
  it('renders nothing when closed or empty', () => {
    const { container } = render(
      <LocalCharactersImportModal isOpen={false} characters={chars} onConfirm={vi.fn()} onKeepLocal={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('pre-checks every character and shows the count', () => {
    render(<LocalCharactersImportModal isOpen characters={chars} onConfirm={vi.fn()} onKeepLocal={vi.fn()} />);
    expect(screen.getByText('Add 2 Local Characters To Your Account?')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Mordenkainen/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Astarion/ })).toBeChecked();
  });

  it('confirms only checked characters on single click', () => {
    const onConfirm = vi.fn();
    render(<LocalCharactersImportModal isOpen characters={chars} onConfirm={onConfirm} onKeepLocal={vi.fn()} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Astarion/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Add Selected To Account' }));
    expect(onConfirm).toHaveBeenCalledWith(['a']);
  });

  it('disables adding when nothing is selected and keeps all local on request', () => {
    const onKeepLocal = vi.fn();
    render(<LocalCharactersImportModal isOpen characters={chars} onConfirm={vi.fn()} onKeepLocal={onKeepLocal} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Mordenkainen/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Astarion/ }));
    expect(screen.getByRole('button', { name: 'Add Selected To Account' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Keep All Local' }));
    expect(onKeepLocal).toHaveBeenCalled();
  });

  it('renders homebrew spells accordion and pre-checks spells', () => {
    render(<LocalCharactersImportModal isOpen spells={homebrewSpells} onConfirm={vi.fn()} onKeepLocal={vi.fn()} />);

    expect(screen.getByText('Add 2 Local Homebrew Spells To Your Account?')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Blood Spear/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Shadow Step/ })).toBeChecked();
  });

  it('handles Select All and Select None for independent categories', () => {
    render(
      <LocalCharactersImportModal
        isOpen
        characters={chars}
        spells={homebrewSpells}
        onConfirm={vi.fn()}
        onKeepLocal={vi.fn()}
      />
    );

    const selectNoneButtons = screen.getAllByRole('button', { name: 'Select None' });
    const selectAllButtons = screen.getAllByRole('button', { name: 'Select All' });

    // Deselect all characters (first Select None button)
    fireEvent.click(selectNoneButtons[0]);
    expect(screen.getByRole('checkbox', { name: /Mordenkainen/ })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Astarion/ })).not.toBeChecked();
    // Spells remain checked
    expect(screen.getByRole('checkbox', { name: /Blood Spear/ })).toBeChecked();

    // Re-select all characters
    fireEvent.click(selectAllButtons[0]);
    expect(screen.getByRole('checkbox', { name: /Mordenkainen/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Astarion/ })).toBeChecked();
  });

  it('submits selected characters and spells when both categories are present', () => {
    const onConfirm = vi.fn();
    render(
      <LocalCharactersImportModal
        isOpen
        characters={chars}
        spells={homebrewSpells}
        onConfirm={onConfirm}
        onKeepLocal={vi.fn()}
      />
    );

    // Uncheck Mordenkainen and Shadow Step
    fireEvent.click(screen.getByRole('checkbox', { name: /Mordenkainen/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Shadow Step/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Add Selected To Account' }));
    expect(onConfirm).toHaveBeenCalledWith(['b'], ['s1']);
  });
});
