import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import EmptyCharacterState from './EmptyCharacterState';

describe('EmptyCharacterState', () => {
  it('renders the same copy and wires both actions', () => {
    const onCreate = vi.fn();
    const onImport = vi.fn();
    render(<EmptyCharacterState onCreate={onCreate} onImport={onImport} />);

    expect(screen.getByText('No Character Selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Create First Character/i }));
    fireEvent.click(screen.getByRole('button', { name: /Import Character/i }));
    expect(onCreate).toHaveBeenCalled();
    expect(onImport).toHaveBeenCalled();
  });

  it('adds only the caller className, never changes the base geometry', () => {
    const { container } = render(<EmptyCharacterState onCreate={vi.fn()} onImport={vi.fn()} className="pb-20" />);
    const root = container.firstChild;
    expect(root).toHaveClass('flex-1', 'justify-center', 'p-6', 'pb-20');
  });
});
