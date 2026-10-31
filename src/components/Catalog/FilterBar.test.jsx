import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FilterBar from './FilterBar';

describe('FilterBar', () => {
  const defaultFilters = {
    search: '',
    level: 'all',
    className: 'all',
    school: 'all',
    legacyMode: 'all',
    source: 'all',
    isHomebrewOnly: false,
    concentration: false,
    ritual: false,
    compV: false,
    compS: false,
    compM: false,
  };

  it('renders collapsed by default when opened or loaded', () => {
    render(<FilterBar filters={defaultFilters} onChange={vi.fn()} />);
    const toggleButton = screen.getByRole('button', { name: /expand filters/i });
    expect(toggleButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /collapse filters/i })).not.toBeInTheDocument();
  });

  it('toggles filter visibility when clicking the filters accordion trigger', () => {
    render(<FilterBar filters={defaultFilters} onChange={vi.fn()} />);
    const toggleButton = screen.getByRole('button', { name: /expand filters/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole('button', { name: /collapse filters/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /collapse filters/i }));
    expect(screen.getByRole('button', { name: /expand filters/i })).toBeInTheDocument();
  });
});
