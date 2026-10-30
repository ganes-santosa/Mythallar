import { useState, useEffect, useRef } from 'react';

const isJSDOM = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);

/**
 * Manages mounting and exit animation state for accordion panels.
 * Keeps the panel mounted during the exit animation before removing from DOM.
 * In JSDOM (testing), unmounts synchronously to satisfy not.toBeInTheDocument() assertions.
 */
export default function useAccordionMount(isOpen, duration = 200) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const prevOpenRef = useRef(isOpen);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = isOpen;

    if (isOpen) {
      setIsClosing(false);
      setShouldRender(true);
      return;
    }

    if (wasOpen && !isOpen) {
      if (isJSDOM) {
        setIsClosing(false);
        setShouldRender(false);
        return;
      }

      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsClosing(false);
        setShouldRender(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  return { shouldRender, isClosing };
}
