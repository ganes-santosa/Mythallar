import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import SmoothSize from './SmoothSize';

describe('SmoothSize', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children with natural styles on initial mount without inline height override', () => {
    const { container } = render(
      <SmoothSize watchKey="step-1" className="test-card">
        <div>Initial Content</div>
      </SmoothSize>
    );

    const el = container.firstElementChild;
    expect(el).toHaveClass('test-card');
    expect(screen.getByText('Initial Content')).toBeInTheDocument();
    // Initially no fixed height style applied
    expect(el.style.height).toBe('');
  });

  it('animates height when watchKey changes and offsetHeight changes', () => {
    let mockHeight = 340;
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetHeight'
    );
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get: () => mockHeight,
    });

    try {
      const { container, rerender } = render(
        <SmoothSize watchKey="simic-hybrid" duration={300}>
          <div>Simic Hybrid Long Content</div>
        </SmoothSize>
      );

      const el = container.firstElementChild;

      // Re-render with new species and shorter height
      mockHeight = 180;
      rerender(
        <SmoothSize watchKey="siren" duration={300}>
          <div>Siren Short Content</div>
        </SmoothSize>
      );

      // Should have started transition to 180px
      expect(el.style.overflow).toBe('hidden');
      expect(el.style.height).toBe('180px');
      expect(el.style.transition).toContain('height 300ms');

      // After animation duration completes, inline styles reset to clean auto
      act(() => {
        vi.advanceTimersByTime(360);
      });

      expect(el.style.height).toBe('');
      expect(el.style.overflow).toBe('');
    } finally {
      if (originalOffsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
      } else {
        delete HTMLElement.prototype.offsetHeight;
      }
    }
  });

  it('handles array watchKey serialization cleanly', () => {
    let mockHeight = 200;
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetHeight'
    );
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get: () => mockHeight,
    });

    try {
      const { container, rerender } = render(
        <SmoothSize watchKey={['wizard', false, 2]} duration={250}>
          <div>Wizard Content</div>
        </SmoothSize>
      );

      const el = container.firstElementChild;

      // Toggle starting features: watchKey changes
      mockHeight = 350;
      rerender(
        <SmoothSize watchKey={['wizard', true, 2]} duration={250}>
          <div>Wizard Expanded Content</div>
        </SmoothSize>
      );

      expect(el.style.height).toBe('350px');
      expect(el.style.transition).toContain('height 250ms');
    } finally {
      if (originalOffsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
      } else {
        delete HTMLElement.prototype.offsetHeight;
      }
    }
  });
});
