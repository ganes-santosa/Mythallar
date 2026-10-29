import { useEffect, useRef } from 'react';

/**
 * ponytail: simple click-outside hook for hint popovers.
 * Invokes onOutside when a mousedown occurs outside ref.
 */
export default function useClickOutside(isOpen, onOutside) {
  const ref = useRef(null);
  const onOutsideRef = useRef(onOutside);
  onOutsideRef.current = onOutside;

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onOutsideRef.current?.(e);
      }
    };
    document.addEventListener('pointerdown', handleDown, true);
    document.addEventListener('mousedown', handleDown, true);
    return () => {
      document.removeEventListener('pointerdown', handleDown, true);
      document.removeEventListener('mousedown', handleDown, true);
    };
  }, [isOpen]);

  return ref;
}
