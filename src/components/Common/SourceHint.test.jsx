import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SourceHint, { SOURCE_NAMES } from './SourceHint';

describe('SourceHint', () => {
  it('shows the code and reveals the full name on click', () => {
    render(<SourceHint source="AU" />);
    expect(screen.getByText('AU')).toBeInTheDocument();
    expect(screen.queryByText(/Unearthed Arcana/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Full name of source AU'));
    expect(screen.getByText(/Unearthed Arcana/)).toBeInTheDocument();
  });

  it('closes when clicking outside but not when clicking inside', () => {
    render(<SourceHint source="AU" />);
    fireEvent.click(screen.getByLabelText('Full name of source AU'));
    fireEvent.mouseDown(screen.getByText(/Unearthed Arcana/));
    expect(screen.getByText(/Unearthed Arcana/)).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText(/Unearthed Arcana/)).not.toBeInTheDocument();
  });

  it('falls back to the code for unknown sources and PHB when missing', () => {
    render(<SourceHint source="ZZZ" />);
    fireEvent.click(screen.getByLabelText('Full name of source ZZZ'));
    expect(screen.getAllByText('ZZZ').length).toBe(3); // inline code + popup code + popup fallback name
  });

  it('covers every source currently in spells.json', async () => {
    const fs = await import('node:fs');
    const spells = JSON.parse(fs.readFileSync('public/data/spells.json', 'utf-8'));
    const missing = [...new Set(spells.map((s) => s.source))].filter((c) => !SOURCE_NAMES[c]);
    expect(missing).toEqual([]);
  });
});
