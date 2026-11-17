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

  it('calls onCreate with Level 1 character and closes modal when Manual Setup is clicked', () => {
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
    expect(handleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Adventurer',
        className: 'Wizard',
      })
    );
    expect(handleClose).toHaveBeenCalled();
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
