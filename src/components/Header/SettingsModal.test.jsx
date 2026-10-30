import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SettingsModal from './SettingsModal';
import pkg from '../../../package.json';

describe('SettingsModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the updated palette choices in order with Custom at the bottom and app version', () => {
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
    expect(screen.getByText('The Weave')).toBeInTheDocument();
    expect(screen.getByText('Space Cadet')).toBeInTheDocument();
    expect(screen.getByText('Underdark')).toBeInTheDocument();
    expect(screen.getByText('Desert Dunes')).toBeInTheDocument();
    expect(screen.getByText('Woodland Olive')).toBeInTheDocument();
    expect(screen.getByText('Gunmetal')).toBeInTheDocument();
    expect(screen.getByText('Blood God')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();

    // Deleted themes are absent
    expect(screen.queryByText('Honeydew & Fern')).not.toBeInTheDocument();
    expect(screen.queryByText('Floral Juniper')).not.toBeInTheDocument();
    expect(screen.queryByText('Chinese Black')).not.toBeInTheDocument();
    expect(screen.queryByText('Eerie Sparkle')).not.toBeInTheDocument();
    expect(screen.queryByText('Burnt Sienna')).not.toBeInTheDocument();

    expect(screen.getByText(`v${pkg.version}`)).toBeInTheDocument();
  });

  it('pads the palette grid container on all sides so active ring and glow are not clipped', () => {
    const { container } = render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        activeThemeId="earthy-olive"
        onSelectTheme={vi.fn()}
      />
    );

    const grid = container.querySelector('[data-testid="theme-palette-grid"]');
    expect(grid).toBeInTheDocument();
    expect(grid.className).toMatch(/\bp-1\b|\bp-2\b/);
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

  it('allows editing custom theme colors and texture when Custom is active', () => {
    const handleSelect = vi.fn();
    const handleCustomChange = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        activeThemeId="custom"
        onSelectTheme={handleSelect}
        onUpdateCustomTheme={handleCustomChange}
      />
    );

    const accentInput = screen.getByLabelText(/Custom Accent color/i);
    fireEvent.change(accentInput, { target: { value: '#ff5500' } });
    expect(handleCustomChange).toHaveBeenCalled();

    const textureSelect = screen.getByLabelText(/Custom Background Texture/i);
    fireEvent.change(textureSelect, { target: { value: 'celestial' } });
    expect(handleCustomChange).toHaveBeenCalled();
  });

  it('renders and toggles the Skip Copying State switch', () => {
    const handleToggle = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        activeThemeId="mythallar-classic"
        onSelectTheme={vi.fn()}
        skipCopying={false}
        onToggleSkipCopying={handleToggle}
      />
    );

    expect(screen.getByText('Skip Copying State')).toBeInTheDocument();
    const switchBtn = screen.getByRole('switch', { name: /Skip Copying State/i });
    expect(switchBtn).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(switchBtn);
    expect(handleToggle).toHaveBeenCalledWith(true);
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
