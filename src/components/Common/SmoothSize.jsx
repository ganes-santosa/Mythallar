import React, { useRef, useLayoutEffect, useEffect } from 'react';

// Safe layout effect for SSR / tests
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * SmoothSize
 * Smoothly animates container height when content changes size (e.g. switching species,
 * classes, backgrounds, or ability score generation methods).
 * ponytail: transitions height on watchKey change or ResizeObserver; upgrade path: CSS interpolate-size when baseline.
 */
export default function SmoothSize({
  children,
  watchKey,
  className = '',
  duration = 300,
}) {
  const containerRef = useRef(null);
  const prevHeightRef = useRef(null);
  const prevKeyRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const serializedKey = Array.isArray(watchKey)
    ? watchKey.map((k) => String(k ?? '')).join(':')
    : watchKey !== undefined
    ? String(watchKey)
    : undefined;

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Temporarily clear inline height so we measure true natural target height
    const prevInlineHeight = container.style.height;
    container.style.height = '';
    const currentHeight = container.offsetHeight;
    container.style.height = prevInlineHeight;

    if (typeof currentHeight !== 'number' || currentHeight === 0) {
      if (serializedKey !== undefined) prevKeyRef.current = serializedKey;
      return;
    }

    if (prevKeyRef.current === null) {
      prevKeyRef.current = serializedKey;
      prevHeightRef.current = currentHeight;
      return;
    }

    // If key hasn't changed, do not interrupt ongoing animation
    if (serializedKey !== undefined && prevKeyRef.current === serializedKey) {
      if (!isAnimatingRef.current) {
        prevHeightRef.current = currentHeight;
      }
      return;
    }

    const prevHeight = isAnimatingRef.current
      ? container.getBoundingClientRect().height
      : prevHeightRef.current ?? currentHeight;

    isAnimatingRef.current = false;
    prevKeyRef.current = serializedKey;
    prevHeightRef.current = currentHeight;

    // If height difference is negligible, skip animation
    if (Math.abs(prevHeight - currentHeight) < 2) {
      container.style.height = '';
      container.style.overflow = '';
      container.style.transition = '';
      return;
    }

    isAnimatingRef.current = true;
    container.style.overflow = 'hidden';
    container.style.transition = 'none';
    container.style.height = `${prevHeight}px`;

    // Force reflow to commit start height
    void container.offsetHeight;

    container.style.transition = `height ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    container.style.height = `${currentHeight}px`;

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      if (container) {
        container.style.transition = '';
        container.style.height = '';
        container.style.overflow = '';
      }
      isAnimatingRef.current = false;
    };

    const handleTransitionEnd = (e) => {
      if (e.target !== container || e.propertyName !== 'height') return;
      cleanup();
      container.removeEventListener('transitionend', handleTransitionEnd);
    };

    container.addEventListener('transitionend', handleTransitionEnd);
    const timer = setTimeout(cleanup, duration + 60);

    return () => {
      container.removeEventListener('transitionend', handleTransitionEnd);
      clearTimeout(timer);
      // Only clean up inline styles if key changed to a different method
      cleanup();
    };
  }, [serializedKey, duration]);

  // Fallback ResizeObserver if no watchKey was provided
  useIsomorphicLayoutEffect(() => {
    if (serializedKey !== undefined) return;
    if (typeof ResizeObserver === 'undefined') return;

    const container = containerRef.current;
    if (!container) return;

    let isFirst = true;
    let prevH = 0;

    const ro = new ResizeObserver(([entry]) => {
      const h =
        entry?.borderBoxSize?.[0]?.blockSize ??
        entry?.contentRect?.height ??
        container.offsetHeight;
      if (typeof h !== 'number' || h <= 0) return;

      if (isFirst) {
        isFirst = false;
        prevH = h;
        return;
      }

      if (Math.abs(prevH - h) < 2) return;

      const startH = isAnimatingRef.current
        ? container.getBoundingClientRect().height
        : prevH;
      prevH = h;
      isAnimatingRef.current = true;

      container.style.overflow = 'hidden';
      container.style.transition = 'none';
      container.style.height = `${startH}px`;
      void container.offsetHeight;
      container.style.transition = `height ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      container.style.height = `${h}px`;

      const onEnd = (e) => {
        if (e.target !== container || e.propertyName !== 'height') return;
        container.style.transition = '';
        container.style.height = '';
        container.style.overflow = '';
        isAnimatingRef.current = false;
        container.removeEventListener('transitionend', onEnd);
      };
      container.addEventListener('transitionend', onEnd);
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [serializedKey, duration]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
