import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SpellbookCompactCard from './SpellbookCompactCard';

const spell = { id: 'fireball', name: 'Fireball', level: 3 };
const base = { spell, isPrepared: false, onTogglePrepare: vi.fn() };

describe('SpellbookCompactCard', () => {
  it('shows only the title and toggles prepared on click', () => {
    const onTogglePrepare = vi.fn();
    render(<SpellbookCompactCard {...base} onTogglePrepare={onTogglePrepare} />);
    const card = screen.getByTestId('spellbook-compact-card-fireball');
    expect(card).toHaveTextContent('Fireball');
    expect(card).not.toHaveTextContent('1 action');
    expect(card).toHaveClass('min-w-0');
    expect(card.querySelector('span')).toHaveClass('truncate');
    fireEvent.click(card);
    expect(onTogglePrepare).toHaveBeenCalledWith('fireball');
  });

  it('shows the prepared strip and ring when prepared', () => {
    render(<SpellbookCompactCard {...base} isPrepared />);
    expect(screen.getByTestId('prepared-bookmark-strip')).toHaveClass('bg-[#EFE9E0]');
    expect(screen.getByTestId('spellbook-compact-card-fireball')).toHaveClass('ring-1', 'ring-white/30');
  });

  it('greys out and ignores a copying spell', () => {
    const onTogglePrepare = vi.fn();
    render(<SpellbookCompactCard {...base} isCopying onTogglePrepare={onTogglePrepare} />);
    const card = screen.getByTestId('spellbook-compact-card-fireball');
    expect(card).toHaveTextContent('Fireball');
    expect(card.querySelector('span')).toHaveClass('text-slate-500');
    fireEvent.click(card);
    expect(onTogglePrepare).not.toHaveBeenCalled();
  });

  it('ignores cantrips', () => {
    const onTogglePrepare = vi.fn();
    render(<SpellbookCompactCard spell={{ id: 'acid-splash', name: 'Acid Splash', level: 0 }} isPrepared={false} onTogglePrepare={onTogglePrepare} />);
    fireEvent.click(screen.getByTestId('spellbook-compact-card-acid-splash'));
    expect(onTogglePrepare).not.toHaveBeenCalled();
  });
});
