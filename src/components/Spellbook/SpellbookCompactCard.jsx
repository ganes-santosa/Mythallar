import React from 'react';
import { PreparedBookmarkStrip } from './SpellbookCard';

function SpellbookCompactCard({ spell, isPrepared, isCopying = false, onTogglePrepare }) {
  const interactive = spell.level > 0 && !isCopying;
  const effectivePrepared = isPrepared && !isCopying;

  return (
    <button
      type="button"
      data-testid={`spellbook-compact-card-${spell.id}`}
      aria-label={`Toggle Prepared for ${spell.name}`}
      onClick={() => interactive && onTogglePrepare?.(spell.id)}
      disabled={!interactive}
      title={
        isCopying
          ? `${spell.name} is being copied`
          : spell.level === 0
          ? `${spell.name} is always available`
          : effectivePrepared
          ? 'Click to unprepare spell'
          : 'Click to prepare spell'
      }
      className={`relative flex w-full min-w-0 items-center rounded-lg bg-dnd-card py-1.5 pl-3.5 pr-2 text-left transition-[box-shadow,background-color] duration-150 select-none overflow-hidden ${
        effectivePrepared
          ? 'ring-1 ring-white/30 shadow-[0_0_14px_rgba(255,255,255,0.09)]'
          : interactive
          ? 'hover:bg-dnd-hover/80 cursor-pointer'
          : 'cursor-default'
      }`}
    >
      <PreparedBookmarkStrip isPrepared={effectivePrepared} />
      <span
        className={`min-w-0 truncate text-xs font-semibold ${
          isCopying ? 'text-slate-500' : 'text-slate-100'
        }`}
      >
        {spell.name}
      </span>
    </button>
  );
}

export default React.memo(SpellbookCompactCard);
