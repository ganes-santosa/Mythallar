import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useAutoScrollOnExpand, { getScrollParent, scrollIntoViewOnExpand } from './useAutoScrollOnExpand';

describe('useAutoScrollOnExpand', () => {
  let parentEl;
  let childEl;

  beforeEach(() => {
    parentEl = document.createElement('div');
    parentEl.style.overflowY = 'auto';
    Object.defineProperty(parentEl, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(parentEl, 'clientHeight', { value: 500, configurable: true });
    parentEl.scrollBy = vi.fn();
    parentEl.getBoundingClientRect = () => ({
      top: 100,
      bottom: 600,
      left: 0,
      right: 400,
      width: 400,
      height: 500,
    });

    childEl = document.createElement('div');
    childEl.getBoundingClientRect = () => ({
      top: 550,
      bottom: 590,
      left: 0,
      right: 400,
      width: 400,
      height: 40,
    });

    // Mock header and inner grid
    const header = document.createElement('div');
    Object.defineProperty(header, 'offsetHeight', { value: 40, configurable: true });

    const grid = document.createElement('div');
    grid.className = 'grid';
    const inner = document.createElement('div');
    inner.className = 'overflow-hidden';
    const content = document.createElement('div');
    Object.defineProperty(content, 'scrollHeight', { value: 200, configurable: true });
    inner.appendChild(content);
    grid.appendChild(inner);

    childEl.appendChild(header);
    childEl.appendChild(grid);

    parentEl.appendChild(childEl);
    document.body.appendChild(parentEl);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('finds the nearest scrollable parent', () => {
    expect(getScrollParent(childEl)).toBe(parentEl);
  });

  it('scrolls parent smoothly when expanded content would exceed parent bottom', () => {
    scrollIntoViewOnExpand(childEl, { offset: 10 });

    // child top is 550, header is 40, content is 200 => futureBottom is 790
    // parent bottom is 600 => overflow is 790 - 600 + 10 = 200
    // maxScroll is 550 - 100 = 450
    // toScroll is min(200, 450) = 200
    expect(parentEl.scrollBy).toHaveBeenCalledWith({
      top: 200,
      behavior: 'smooth',
    });
  });

  it('does not scroll if element is already within bounds', () => {
    // Child top is 150, futureBottom is 150 + 40 + 200 = 390 <= parent bottom 600
    childEl.getBoundingClientRect = () => ({
      top: 150,
      bottom: 190,
      left: 0,
      right: 400,
      width: 400,
      height: 40,
    });

    scrollIntoViewOnExpand(childEl, { offset: 10 });
    expect(parentEl.scrollBy).not.toHaveBeenCalled();
  });

  it('clamps scroll amount so element top does not scroll past parent top', () => {
    // Child top is 120 (only 20px below parent top 100), futureBottom is 120 + 40 + 600 = 760
    // overflow is 760 - 600 + 10 = 170
    // maxScroll is 120 - 100 = 20
    childEl.getBoundingClientRect = () => ({
      top: 120,
      bottom: 160,
      left: 0,
      right: 400,
      width: 400,
      height: 40,
    });

    const content = childEl.querySelector('.overflow-hidden > div');
    Object.defineProperty(content, 'scrollHeight', { value: 600, configurable: true });

    scrollIntoViewOnExpand(childEl, { offset: 10 });
    expect(parentEl.scrollBy).toHaveBeenCalledWith({
      top: 20,
      behavior: 'smooth',
    });
  });

  it('runs on expand via hook without scrolling when initially mounted as true', () => {
    const { result, rerender } = renderHook(
      ({ isExpanded }) => useAutoScrollOnExpand(isExpanded),
      { initialProps: { isExpanded: true } }
    );

    // Attach ref
    result.current.current = childEl;

    // Rerender as still true -> no scroll
    rerender({ isExpanded: true });
    expect(parentEl.scrollBy).not.toHaveBeenCalled();
  });
});
