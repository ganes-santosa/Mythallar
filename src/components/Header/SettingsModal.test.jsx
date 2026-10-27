import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SettingsModal from './SettingsModal';

describe('SettingsModal', () => {
  it('renders all palette choices and app version', () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        activeThemeId="mythallar-classic"
        onSelectTheme={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { level: 3, name: /Settings & Themes/i })).toBeInTheDocument();
    expect(screen.getByText('Mythallar Classic')).toBeInTheDocument();
    expect(screen.getByText('Honeydew & Fern')).toBeInTheDocument();
    expect(screen.getByText('Floral Juniper')).toBeInTheDocument();
    expect(screen.getByText('Chinese Black')).toBeInTheDocument();
    expect(screen.getByText('Blood God')).toBeInTheDocument();
    expect(screen.getByText('Bioluminescent')).toBeInTheDocument();
    expect(screen.getByText('The Weave')).toBeInTheDocument();
    expect(screen.getByText('Eerie Sparkle')).toBeInTheDocument();
    expect(screen.getByText('Burnt Sienna')).toBeInTheDocument();
    expect(screen.getByText('Space Cadet')).toBeInTheDocument();
    expect(screen.getByText(/v1.2.4/i)).toBeInTheDocument();
  });

  it('triggers onSelectTheme when a palette is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        activeThemeId="mythallar-classic"
        onSelectTheme={handleSelect}
      />
    );

    fireEvent.click(screen.getByText('Blood God'));
    expect(handleSelect).toHaveBeenCalledWith('blood-god');
  });

  it('closes when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        activeThemeId="mythallar-classic"
        onSelectTheme={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Close settings/i }));
    expect(handleClose).toHaveBeenCalled();
  });
});
