import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useScrollLock } from './useScrollLock';

describe('useScrollLock', () => {
  let originalOverflow;

  beforeEach(() => {
    originalOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  it('locks body scroll when active is true', () => {
    const { rerender } = renderHook(({ active }) => useScrollLock(active), {
      initialProps: { active: true },
    });

    expect(document.body.style.overflow).toBe('hidden');

    rerender({ active: false });
    expect(document.body.style.overflow).toBe('');
  });

  it('restores previous overflow on unmount', () => {
    document.body.style.overflow = 'auto';
    const { unmount } = renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('locks background scroll containers outside modal and restores on unmount', () => {
    const bgContainer = document.createElement('div');
    bgContainer.className = 'overflow-y-auto';
    bgContainer.style.overflowY = 'auto';
    document.body.appendChild(bgContainer);

    const { unmount } = renderHook(() => useScrollLock(true));
    expect(bgContainer.style.overflowY).toBe('hidden');

    unmount();
    expect(bgContainer.style.overflowY).toBe('auto');
    document.body.removeChild(bgContainer);
  });

  it('prevents wheel event outside modal scrollable container', () => {
    const { unmount } = renderHook(() => useScrollLock(true));

    const outsideEl = document.createElement('div');
    document.body.appendChild(outsideEl);

    const event = new WheelEvent('wheel', { bubbles: true, cancelable: true });
    outsideEl.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);

    unmount();
    document.body.removeChild(outsideEl);
  });

  it('allows wheel event inside modal scrollable container', () => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0';
    const modalScroller = document.createElement('div');
    modalScroller.className = 'overflow-y-auto';
    modal.appendChild(modalScroller);
    document.body.appendChild(modal);

    const { unmount } = renderHook(() => useScrollLock(true));

    const event = new WheelEvent('wheel', { bubbles: true, cancelable: true });
    modalScroller.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);

    unmount();
    document.body.removeChild(modal);
  });

  it('supports nested locks correctly using lock counter', () => {
    const hook1 = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');

    const hook2 = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');

    hook2.unmount();
    // Still locked because hook1 is active
    expect(document.body.style.overflow).toBe('hidden');

    hook1.unmount();
    // Now unlocked
    expect(document.body.style.overflow).toBe('');
  });
});
