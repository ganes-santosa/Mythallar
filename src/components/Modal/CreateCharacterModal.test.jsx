import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CreateCharacterModal from './CreateCharacterModal';

describe('CreateCharacterModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CreateCharacterModal isOpen={false} onClose={vi.fn()} onCreate={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders entry screen with Character Builder and Manual Setup choices when open', () => {
    render(
      <CreateCharacterModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />
    );
    expect(screen.getByRole('heading', { name: /Create your character/i })).toBeInTheDocument();
    expect(screen.getByText(/Choose how you'd like to get started/i)).toBeInTheDocument();

    // Option 1: Character Builder (Recommended)
    expect(screen.getByRole('button', { name: /Character Builder/i })).toBeInTheDocument();
    expect(screen.getByText(/Recommended/i)).toBeInTheDocument();
    expect(screen.getByText(/Follow a step-by-step process to build your character/i)).toBeInTheDocument();

    // Option 2: Manual Setup
    expect(screen.getByRole('button', { name: /Manual Setup/i })).toBeInTheDocument();
    expect(screen.getByText(/Skip the guided process and fill in your character sheet yourself/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Close modal/i })).toBeInTheDocument();
  });

  it('calls onStartBuilder and closes modal when Character Builder is clicked', () => {
    const handleStartBuilder = vi.fn();
    const handleClose = vi.fn();
    render(
      <CreateCharacterModal
        isOpen={true}
        onClose={handleClose}
        onCreate={vi.fn()}
        onStartBuilder={handleStartBuilder}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Character Builder/i }));
    expect(handleClose).toHaveBeenCalled();
    expect(handleStartBuilder).toHaveBeenCalled();
  });

  it('opens manual creation form when Manual Setup is clicked and creates character on submit', () => {
    const handleCreate = vi.fn();
    const handleClose = vi.fn();
    render(
      <CreateCharacterModal
        isOpen={true}
        onClose={handleClose}
        onCreate={handleCreate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Manual Setup/i }));

    // Now in manual setup form
    expect(screen.getByRole('heading', { name: /Create Character/i })).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Character Name/i);
    const classSelect = screen.getByLabelText(/Starting Class/i);
    const submitBtn = screen.getByRole('button', { name: /Create Character/i });

    expect(submitBtn).toBeDisabled();

    // Type character name and change class
    fireEvent.change(nameInput, { target: { value: 'Elminster' } });
    fireEvent.change(classSelect, { target: { value: 'Cleric' } });

    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    expect(handleCreate).toHaveBeenCalledWith({
      name: 'Elminster',
      className: 'Cleric',
    });
    expect(handleClose).toHaveBeenCalled();
  });

  it('navigates back to choose screen when Back button is clicked in manual form', () => {
    render(
      <CreateCharacterModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: /Manual Setup/i }));
    expect(screen.getByRole('heading', { name: /Create Character/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Back to options/i }));
    expect(screen.getByRole('heading', { name: /Create your character/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Character Builder/i })).toBeInTheDocument();
  });

  it('calls onClose when close icon button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <CreateCharacterModal isOpen={true} onClose={handleClose} onCreate={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Close modal/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('uses ring-dnd-gold/40 focus outline on selection cards matching AbilitiesCard save proficiency styling', () => {
    render(
      <CreateCharacterModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />
    );
    const builderBtn = screen.getByRole('button', { name: /Character Builder/i });
    const manualBtn = screen.getByRole('button', { name: /Manual Setup/i });

    expect(builderBtn.className).toContain('focus:ring-dnd-gold/40');
    expect(builderBtn.className).not.toContain('focus:ring-dnd-gold/60');
    expect(manualBtn.className).toContain('focus:ring-dnd-gold/40');
    expect(manualBtn.className).not.toContain('focus:ring-dnd-gold/60');
  });
});
