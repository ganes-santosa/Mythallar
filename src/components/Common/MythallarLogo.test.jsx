import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import MythallarLogo from './MythallarLogo';

describe('MythallarLogo', () => {
  it('renders with accessibility alt label and image source', () => {
    render(<MythallarLogo className="w-8 h-8" alt="Mythallar Logo" />);
    const img = screen.getByAltText('Mythallar Logo');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('/mythallar_logo.png');
  });

  it('allows gold variant source', () => {
    render(<MythallarLogo variant="gold" alt="Golden Sigil" />);
    const img = screen.getByAltText('Golden Sigil');
    expect(img.getAttribute('src')).toBe('/mythallar_logo_gold.png');
  });
});
