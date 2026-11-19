import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
const CELLS = Array.from({ length: 20 }, (_, i) => i % 10);
const isDigit = (ch) => ch !== undefined && /^\d$/.test(ch);

// Slot-machine column: strip 0-9,0-9 scrolls from `from` to `digit` via Web Animations API.
// down=false: counts up (second cycle target). down=true: counts down (first cycle target).
function Strip({ from, digit, down, duration, onDone }) {
  const ref = useRef(null);
  const start = down ? 10 + from : from;
  const end = down ? digit : 10 + digit;
  useIsomorphicLayoutEffect(() => {
    const anim = ref.current.animate(
      [{ transform: `translateY(${-start}em)` }, { transform: `translateY(${-end}em)` }],
      { duration, easing: 'cubic-bezier(0.15, 0.85, 0.25, 1)' }
    );
    anim.onfinish = () => onDone?.();
    return () => anim.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span aria-hidden="true" className="inline-block h-[1em] overflow-hidden leading-none">
      <span ref={ref} className="flex flex-col" style={{ transform: `translateY(${-end}em)` }}>
        {CELLS.map((c, i) => (
          <span key={i} className="block h-[1em] leading-none">{c}</span>
        ))}
      </span>
    </span>
  );
}

/**
 * SlotNumber
 * Renders `value` as plain text. When `spinToken` changes, all digits spin into place
 * like a slot machine (left to right stagger) from their previous digits into their new digits.
 * Spins only on explicit token bump (reroll/reset), not every value change.
 */
export default function SlotNumber({ value, spinToken = 0, className = '' }) {
  const str = String(value ?? '');
  const prev = useRef({ str, token: spinToken });
  const [spin, setSpin] = useState(null);

  useIsomorphicLayoutEffect(() => {
    const p = prev.current;
    prev.current = { str, token: spinToken };
    if (p.token === spinToken) return;
    if (typeof Element === 'undefined' || !Element.prototype.animate) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const next = [...str].map((ch, i) => {
      if (!isDigit(ch)) return null;
      const old = p.str[p.str.length - str.length + i];
      return isDigit(old) ? Number(old) : 0;
    });
    setSpin(
      next.some((f) => f !== null)
        ? { froms: next, down: Number(str) < Number(p.str), token: spinToken }
        : null
    );
  }, [str, spinToken]);

  // Ignore stale spin state from a previous token (e.g. rapid second click)
  if (!spin || spin.token !== spinToken) {
    return (
      <span className={`inline-flex leading-none ${className}`}>
        <span className="inline-block h-[1em] overflow-hidden leading-none">
          <span className="block h-[1em] leading-none">{str}</span>
        </span>
      </span>
    );
  }
  const { froms, down } = spin;

  const lastSpun = froms.reduce((acc, f, i) => (f !== null ? i : acc), -1);
  return (
    <span data-testid="slot-spinning" className={`inline-flex leading-none ${className}`}>
      {[...str].map((ch, i) =>
        froms[i] !== null && isDigit(ch) ? (
          <Strip
            key={`${i}-${spinToken}`}
            from={froms[i]}
            digit={Number(ch)}
            down={down}
            duration={500 + i * 160}
            onDone={i === lastSpun ? () => setSpin(null) : undefined}
          />
        ) : (
          <span key={i} className="inline-block h-[1em] overflow-hidden leading-none">
            <span className="block h-[1em] leading-none">{ch}</span>
          </span>
        )
      )}
    </span>
  );
}
