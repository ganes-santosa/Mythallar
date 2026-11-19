import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SlotNumber from './SlotNumber';

describe('SlotNumber', () => {
  afterEach(() => {
    delete Element.prototype.animate;
  });

  it('renders plain text and does not spin when only value changes', () => {
    Element.prototype.animate = vi.fn(() => ({ cancel() {} }));
    const { rerender } = render(<SlotNumber value={12} spinToken={0} />);
    rerender(<SlotNumber value={15} spinToken={0} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(Element.prototype.animate).not.toHaveBeenCalled();
  });

  it('spins all digits when spinToken bumps, even digits that stay the same (e.g. 10 -> 18)', () => {
    Element.prototype.animate = vi.fn(() => ({ cancel() {} }));
    const { rerender } = render(<SlotNumber value={10} spinToken={0} />);
    rerender(<SlotNumber value={18} spinToken={1} />);
    expect(screen.getByTestId('slot-spinning')).toBeInTheDocument();
    expect(Element.prototype.animate).toHaveBeenCalledTimes(2);
  });

  it('spins all digits for a full cycle even when the rolled number lands on the same value (e.g. 14 -> 14)', () => {
    Element.prototype.animate = vi.fn(() => ({ cancel() {} }));
    const { rerender } = render(<SlotNumber value={14} spinToken={0} />);
    rerender(<SlotNumber value={14} spinToken={1} />);
    expect(screen.getByTestId('slot-spinning')).toBeInTheDocument();
    expect(Element.prototype.animate).toHaveBeenCalledTimes(2);
  });

  it('scrolls downward when value decreases and upward when it increases', () => {
    const animate = vi.fn(() => ({ cancel() {} }));
    Element.prototype.animate = animate;
    const { rerender } = render(<SlotNumber value={12} spinToken={0} />);
    rerender(<SlotNumber value={8} spinToken={1} />);
    const dec = animate.mock.calls.map((c) => c[0]);
    // decreasing: start offset (10+from) is larger than end offset (digit)
    expect(dec.every(([a, b]) => parseFloat(a.transform.slice(11)) < parseFloat(b.transform.slice(11)))).toBe(true);
    animate.mockClear();
    rerender(<SlotNumber value={12} spinToken={2} />);
    const inc = animate.mock.calls.map((c) => c[0]);
    expect(inc.every(([a, b]) => parseFloat(a.transform.slice(11)) > parseFloat(b.transform.slice(11)))).toBe(true);
  });

  it('skips spin when animate API is missing', () => {
    const { rerender } = render(<SlotNumber value={12} spinToken={0} />);
    rerender(<SlotNumber value={15} spinToken={1} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('maintains consistent wrapper classes and height between idle and spinning states to prevent vertical jumping', () => {
    Element.prototype.animate = vi.fn(() => ({ cancel() {} }));
    const { container, rerender } = render(<SlotNumber value={100} spinToken={0} className="custom-class" />);
    const idleWrapper = container.firstElementChild;
    expect(idleWrapper).toHaveClass('inline-flex', 'leading-none', 'custom-class');
    expect(idleWrapper).not.toHaveClass('align-[-0.2em]');

    rerender(<SlotNumber value={180} spinToken={1} className="custom-class" />);
    const spinWrapper = screen.getByTestId('slot-spinning');
    expect(spinWrapper).toHaveClass('inline-flex', 'leading-none', 'custom-class');
    expect(spinWrapper).not.toHaveClass('align-[-0.2em]');
  });
});
