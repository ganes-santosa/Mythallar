import { useEffect, useRef } from 'react';

/**
 * Finds the nearest scrollable parent element.
 */
export function getScrollParent(node) {
  if (!node) return null;
  let parent = node.parentElement;
  while (parent && parent !== document.body) {
    if (typeof window !== 'undefined' && window.getComputedStyle) {
      const style = window.getComputedStyle(parent);
      const overflowY = style.overflowY || '';
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return parent;
      }
    }
    parent = parent.parentElement;
  }
  return null;
}

/**
 * Keeps an expanding element's bottom edge within its scroll parent's viewport
 * on each layout frame so accordions at the bottom of the screen open upwards.
 */
export function keepBottomInView(el, parent, { offset = 10, targetBottom = null } = {}) {
  if (!el || !parent) return;
  if (typeof el.getBoundingClientRect !== 'function' || typeof parent.getBoundingClientRect !== 'function') return;

  const parentRect = parent.getBoundingClientRect();
  const currentRect = el.getBoundingClientRect();

  let padBottom = 0;
  let padTop = 0;
  if (typeof window !== 'undefined' && window.getComputedStyle) {
    const style = window.getComputedStyle(parent);
    padBottom = parseFloat(style?.paddingBottom) || 0;
    padTop = parseFloat(style?.paddingTop) || 0;
  }

  const maxBottom = targetBottom !== null ? targetBottom : parentRect.bottom - Math.max(offset, padBottom);
  const minTop = parentRect.top + Math.max(offset, padTop);

  if (currentRect.bottom > maxBottom) {
    const overflow = currentRect.bottom - maxBottom;
    const maxScroll = Math.max(0, currentRect.top - minTop);
    const toScroll = Math.min(overflow, maxScroll);
    if (toScroll > 0.5) {
      parent.scrollTop += toScroll;
    }
  }
}

/**
 * Smoothly scrolls the scroll parent so that an expanding element
 * reveals its content upward into view if it would otherwise expand below the viewport.
 */
export function scrollIntoViewOnExpand(el, { offset = 10, behavior = 'smooth' } = {}) {
  if (!el || typeof el.getBoundingClientRect !== 'function') return;

  const parent = getScrollParent(el);
  if (!parent || typeof parent.getBoundingClientRect !== 'function') return;

  const parentRect = parent.getBoundingClientRect();
  const currentRect = el.getBoundingClientRect();

  // For accordion elements, el.children[1] is the animated body wrapper
  const bodyWrapper =
    (el.children && el.children[1]) ||
    el.querySelector('.animate-accordion-down') ||
    el;

  const inner =
    (bodyWrapper && typeof bodyWrapper.querySelector === 'function' &&
      bodyWrapper.querySelector('.overflow-hidden > div')) ||
    bodyWrapper;

  let futureBottom = currentRect.bottom;
  if (inner && inner.scrollHeight > 0) {
    const headerH = el.children && el.children[0] ? el.children[0].offsetHeight : 0;
    const computedBottom = currentRect.top + headerH + inner.scrollHeight;
    futureBottom = Math.max(currentRect.bottom, computedBottom);
  }

  if (futureBottom > parentRect.bottom) {
    const overflow = futureBottom - parentRect.bottom + offset;
    const maxScroll = Math.max(0, currentRect.top - parentRect.top);
    const toScroll = Math.min(overflow, maxScroll);
    if (toScroll > 0 && typeof parent.scrollBy === 'function') {
      parent.scrollBy({ top: toScroll, behavior });
    }
  }
}

/**
 * Hook to automatically scroll when an element expands.
 * Uses a synchronized requestAnimationFrame + ResizeObserver loop during the expansion
 * window so scrollTop tracks the element's real-time height frame-by-frame
 * along the exact CSS transition curve (making bottom accordions open smoothly upwards).
 */
export default function useAutoScrollOnExpand(isExpanded, { offset = 10, enabled = true, durationMs = 360 } = {}) {
  const elementRef = useRef(null);
  const wasExpandedRef = useRef(isExpanded);

  useEffect(() => {
    const wasExpanded = wasExpandedRef.current;
    wasExpandedRef.current = isExpanded;

    if (!enabled || !isExpanded || wasExpanded) return;
    if (typeof window === 'undefined') return;

    const el = elementRef.current;
    if (!el || typeof el.getBoundingClientRect !== 'function') return;

    const parent = getScrollParent(el);
    if (!parent || typeof parent.getBoundingClientRect !== 'function') return;

    const initialRect = el.getBoundingClientRect();
    const initialParentRect = parent.getBoundingClientRect();

    let padBottom = 0;
    if (window.getComputedStyle) {
      padBottom = parseFloat(window.getComputedStyle(parent)?.paddingBottom) || 0;
    }
    const initialMaxBottom = initialParentRect.bottom - Math.max(offset, padBottom);
    const initialBottom = Math.min(initialRect.bottom, initialMaxBottom);
    const initialHeight = initialRect.height;

    const bodyWrapper = (el.children && el.children[1]) || el;
    const overflowBox =
      (bodyWrapper.classList && bodyWrapper.classList.contains('overflow-hidden') && bodyWrapper) ||
      (typeof bodyWrapper.querySelector === 'function' && bodyWrapper.querySelector('.overflow-hidden')) ||
      (typeof el.querySelector === 'function' && el.querySelector('.overflow-hidden')) ||
      null;
    const inner = overflowBox && overflowBox.firstElementChild;
    const expectedGrowth = Math.max(
      overflowBox?.scrollHeight || 0,
      inner?.scrollHeight || 0,
      inner?.offsetHeight || 0
    );

    const syncFrame = () => {
      const currentRect = el.getBoundingClientRect();
      const currentParentRect = parent.getBoundingClientRect();
      const maxBottom = currentParentRect.bottom - Math.max(offset, padBottom);

      let targetBottom = maxBottom;
      if (
        expectedGrowth > 0 &&
        initialRect.bottom + expectedGrowth > maxBottom &&
        initialBottom < maxBottom
      ) {
        const grown = Math.max(0, currentRect.height - initialHeight);
        const progress = Math.min(1, grown / expectedGrowth);
        targetBottom = initialBottom + (maxBottom - initialBottom) * progress;
      }

      keepBottomInView(el, parent, { offset, targetBottom });
    };

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncFrame) : null;
    if (ro) {
      ro.observe(el);
    }

    syncFrame();

    let rafId = null;
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const tick = () => {
      syncFrame();
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - startTime < durationMs) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);

    const timer = setTimeout(() => {
      ro?.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    }, durationMs);

    return () => {
      clearTimeout(timer);
      ro?.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isExpanded, enabled, offset, durationMs]);

  return elementRef;
}
