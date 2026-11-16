import React, { useState, useEffect, useRef } from 'react';
import useClickOutside from '../../hooks/useClickOutside';

/**
 * Typeahead suggestions dropdown for text input.
 * Keeps standard input UX intact: user can type anything freely.
 * Dropdown shows match hints; clicking one (or pressing Down/Enter) calls onSelectSuggestion.
 */
export default function SuggestionInput({
  id,
  'aria-label': ariaLabel,
  value,
  onChange,
  onSelectSuggestion,
  suggestions = [],
  placeholder = '',
  className = '',
  nameError = false,
  autoComplete = 'off',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);

  const containerRef = useClickOutside(isOpen, () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  });

  const hasSuggestions = isOpen && suggestions && suggestions.length > 0;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
      e.currentTarget.blur();
      return;
    }

    if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
      return;
    }

    if (!hasSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        id={id}
        aria-label={ariaLabel}
        type="text"
        autoComplete={autoComplete}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget)) {
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
        }}
        onKeyDown={handleKeyDown}
        className={className}
      />

      {hasSuggestions && (
        <ul
          role="listbox"
          aria-label="Item suggestions"
          className="absolute left-0 right-0 top-full mt-1 z-30 max-h-56 overflow-y-auto rounded-lg bg-dnd-card shadow-xl ring-1 ring-white/10 divide-y divide-white/5 py-1 text-xs custom-scroll"
        >
          {suggestions.map((item, idx) => {
            const isHighlighted = idx === highlightedIndex;
            const subtitle = item.typeLine
              ? [item.typeLine, item.source].filter(Boolean).join(' · ')
              : [item.category, item.rarity, item.source].filter(Boolean).join(' · ');

            return (
              <li
                key={`${item.name}-${item.source || idx}`}
                role="option"
                aria-selected={isHighlighted}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onMouseDown={(e) => {
                  // Prevent input blur before click handler runs
                  e.preventDefault();
                  onSelectSuggestion?.(item);
                  setIsOpen(false);
                  setHighlightedIndex(-1);
                }}
                className={`px-2.5 py-1.5 cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                  isHighlighted ? 'bg-dnd-hover text-dnd-gold' : 'text-slate-200 hover:bg-dnd-hover'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-100 truncate">{item.name}</div>
                  {subtitle && (
                    <div className="text-[10px] text-slate-400 capitalize truncate">{subtitle}</div>
                  )}
                </div>
                {item.requiresAttunement && (
                  <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                    Attune
                  </span>
                )}
                {item.trackedResource && (
                  <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-dnd-gold/15 text-dnd-gold">
                    {item.trackedResource.max} / {item.trackedResource.resetOn}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
