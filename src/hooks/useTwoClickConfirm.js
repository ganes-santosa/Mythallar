import { useCallback, useEffect, useState } from 'react';

export default function useTwoClickConfirm(action, timeoutMs = 3000) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return undefined;
    const timeoutId = window.setTimeout(() => setArmed(false), timeoutMs);
    return () => window.clearTimeout(timeoutId);
  }, [armed, timeoutMs]);

  const reset = useCallback(() => setArmed(false), []);
  const handleClick = useCallback(() => {
    if (armed) {
      action();
      setArmed(false);
    } else {
      setArmed(true);
    }
  }, [action, armed]);

  return { armed, handleClick, reset };
}
