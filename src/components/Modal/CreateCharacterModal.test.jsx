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

  it('renders modal with name input and class select when open', () => {
    render(
      <CreateCharacterModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />
    );
    expect(screen.getByRole('heading', { name: 'Create Character' })).toBeInTheDocument();
    expect(screen.getByText('Adventure awaits')).toBeInTheDocument();
    expect(screen.getByLabelText(/Character Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Starting Class/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Character/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Close modal/i })).toBeInTheDocument();
  });

  it('calls onClose when close icon button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <CreateCharacterModal isOpen={true} onClose={handleClose} onCreate={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Close modal/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onCreate with trimmed name and selected class', () => {
    const handleCreate = vi.fn();
    const handleClose = vi.fn();
    render(
      <CreateCharacterModal isOpen={true} onClose={handleClose} onCreate={handleCreate} />
    );

    fireEvent.change(screen.getByLabelText(/Character Name/i), {
      target: { value: '   Astarion   ' },
    });
    fireEvent.change(screen.getByLabelText(/Starting Class/i), {
      target: { value: 'Rogue' },
    });

    const submitBtn = screen.getByRole('button', { name: /Create Character/i });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    expect(handleCreate).toHaveBeenCalledWith({
      name: 'Astarion',
      className: 'Rogue',
    });
  });

  it('closes when Cancel is clicked', () => {
    const handleClose = vi.fn();
    render(
      <CreateCharacterModal isOpen={true} onClose={handleClose} onCreate={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(handleClose).toHaveBeenCalled();
  });
});
