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

  it('spins only changed digits when spinToken bumps', () => {
    Element.prototype.animate = vi.fn(() => ({ cancel() {} }));
    const { rerender } = render(<SlotNumber value={12} spinToken={0} />);
    rerender(<SlotNumber value={15} spinToken={1} />);
    expect(screen.getByTestId('slot-spinning')).toBeInTheDocument();
    expect(Element.prototype.animate).toHaveBeenCalledTimes(1);
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
});
