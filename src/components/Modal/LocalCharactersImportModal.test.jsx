import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LocalCharactersImportModal from './LocalCharactersImportModal';

const chars = [
  { id: 'a', name: 'Mordenkainen', className: 'Wizard', level: 9 },
  { id: 'b', name: 'Astarion', className: 'Rogue', level: 3 },
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
});
