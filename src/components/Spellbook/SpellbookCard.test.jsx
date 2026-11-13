import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SpellbookCard, { PreparedBookmarkStrip } from './SpellbookCard';

const spell = { id: 'fireball', name: 'Fireball', level: 3, time: '1 action', range: '150 feet' };

describe('PreparedBookmarkStrip', () => {
  it('glows ivory when prepared', () => {
    render(<PreparedBookmarkStrip isPrepared />);
    expect(screen.getByTestId('prepared-bookmark-strip')).toHaveClass('bg-[#EFE9E0]');
  });

  it('stays faint when unprepared', () => {
    render(<PreparedBookmarkStrip isPrepared={false} />);
    expect(screen.getByTestId('prepared-bookmark-strip')).toHaveClass('bg-white/10');
  });

  it('is used by the full spell card', () => {
    render(<SpellbookCard spell={spell} isPrepared onTogglePrepare={vi.fn()} onCast={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByTestId('prepared-bookmark-strip')).toHaveClass('bg-[#EFE9E0]');
  });
});
