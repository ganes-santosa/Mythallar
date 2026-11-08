import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow = '';
const lockedPanes = new Map();

/**
 * Hook to lock background scrolling when a modal or drawer is active.
 * In addition to document.body, locks pane containers (.overflow-y-auto / .overflow-auto)
 * and attaches a capture wheel/touch listener to prevent background scroll chaining.
 *
 * @param {boolean} [active=true] Whether scroll locking is enabled.
 */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return;

    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Lock existing scrollers so their scrollbars freeze and background doesn't scroll
      const scrollers = document.querySelectorAll(
        '[data-testid="right-pane-scroll"], [data-testid="left-character-header-accordion"], .overflow-y-auto, .overflow-auto'
      );
      scrollers.forEach((el) => {
        // Do not lock scrollers inside dialogs or modals
        if (!el.closest('[role="dialog"], .fixed.inset-0')) {
          lockedPanes.set(el, el.style.overflowY);
          el.style.overflowY = 'hidden';
        }
      });
    }
    lockCount += 1;

    // Capture wheel / touchmove outside any dialog scroll container to prevent scroll leak
    const handleWheelCapture = (e) => {
      const target = e.target;
      // Allow scroll inside modal scrollable areas
      const scrollableInsideModal = target?.closest?.(
        '[role="dialog"] .overflow-y-auto, [role="dialog"] .overflow-auto, .fixed.inset-0 .overflow-y-auto, .fixed.inset-0 .overflow-auto'
      );
      if (!scrollableInsideModal) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheelCapture, { passive: false, capture: true });
    window.addEventListener('touchmove', handleWheelCapture, { passive: false, capture: true });

    return () => {
      window.removeEventListener('wheel', handleWheelCapture, { capture: true });
      window.removeEventListener('touchmove', handleWheelCapture, { capture: true });

      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow;
        lockedPanes.forEach((orig, el) => {
          if (el) el.style.overflowY = orig;
        });
        lockedPanes.clear();
      }
    };
  }, [active]);
}
