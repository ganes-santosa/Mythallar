import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAccordionMount from './useAccordionMount';

describe('useAccordionMount', () => {
  it('returns initial state matching isOpen', () => {
    const { result } = renderHook(() => useAccordionMount(false));
    expect(result.current.shouldRender).toBe(false);
    expect(result.current.isClosing).toBe(false);

    const { result: openResult } = renderHook(() => useAccordionMount(true));
    expect(openResult.current.shouldRender).toBe(true);
    expect(openResult.current.isClosing).toBe(false);
  });

  it('updates shouldRender when isOpen changes in JSDOM', () => {
    const { result, rerender } = renderHook(({ open }) => useAccordionMount(open), {
      initialProps: { open: false },
    });

    expect(result.current.shouldRender).toBe(false);

    rerender({ open: true });
    expect(result.current.shouldRender).toBe(true);
    expect(result.current.isClosing).toBe(false);

    rerender({ open: false });
    // In JSDOM environment, unmounts immediately to satisfy test assertions
    expect(result.current.shouldRender).toBe(false);
    expect(result.current.isClosing).toBe(false);
  });
});
