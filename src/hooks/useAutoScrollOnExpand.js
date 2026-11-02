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
      if (
        (overflowY === 'auto' || overflowY === 'scroll') &&
        parent.scrollHeight > parent.clientHeight
      ) {
        return parent;
      }
    }
    parent = parent.parentElement;
  }
  return null;
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
 */
export default function useAutoScrollOnExpand(isExpanded, { offset = 10, enabled = true } = {}) {
  const elementRef = useRef(null);
  const wasExpandedRef = useRef(isExpanded);

  useEffect(() => {
    const wasExpanded = wasExpandedRef.current;
    wasExpandedRef.current = isExpanded;

    if (!enabled || !isExpanded || wasExpanded) return;
    if (typeof window === 'undefined') return;

    // Trigger right when child DOM mounts and starts transition
    const frame = requestAnimationFrame(() => {
      scrollIntoViewOnExpand(elementRef.current, { offset });
    });

    return () => cancelAnimationFrame(frame);
  }, [isExpanded, enabled, offset]);

  return elementRef;
}
