import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ClassIcon, { CLASS_NAMES } from './ClassIcon';

describe('ClassIcon', () => {
  it('renders SVG for all 13 standard 5e classes', () => {
    for (const className of CLASS_NAMES) {
      const { unmount } = render(<ClassIcon name={className} data-testid={`icon-${className}`} />);
      const icon = screen.getByTestId(`icon-${className}`);
      expect(icon).toBeInTheDocument();
      expect(icon.tagName.toLowerCase()).toBe('svg');
      expect(icon).toHaveAttribute('viewBox');
      unmount();
    }
  });

  it('handles case-insensitive and trimmed class names', () => {
    render(<ClassIcon name="  wIzArD  " data-testid="wizard-icon" />);
    const icon = screen.getByTestId('wizard-icon');
    expect(icon).toBeInTheDocument();
  });

  it('applies custom size, className, and path fill="currentColor"', () => {
    const { container } = render(
      <ClassIcon name="Fighter" size={28} className="text-dnd-gold custom-icon" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '28');
    expect(svg).toHaveAttribute('height', '28');
    expect(svg).toHaveClass('text-dnd-gold', 'custom-icon');

    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(path).toHaveAttribute('fill', 'currentColor');
    }
  });

  it('returns null or graceful fallback when class name is unrecognized', () => {
    const { container } = render(<ClassIcon name="UnknownClass" />);
    expect(container.firstChild).toBeNull();
  });
});
