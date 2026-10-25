import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import SpellbookCard from './SpellbookCard';

function getLevelTitle(level) {
  if (level === 0) return 'Cantrips';
  const ordinals = ['th', 'st', 'nd', 'rd'];
  const v = level % 100;
  const ord = ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0];
  return `${level}${ord} Level Spells`;
}

export default function SpellbookLevelGroup({
  level,
  spells,
  preparedMap,
  onTogglePrepare,
  onCast,
  onRemove,
  onSelect,
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!spells || spells.length === 0) return null;

  const preparedCount = spells.filter((s) => preparedMap[s.id]).length;

  return (
    <div className="mb-4">
      {/* Group Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-1.5 px-2 mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-dnd-gold bg-slate-900/40 rounded border border-dnd-border/60 transition-colors"
      >
        <div className="flex items-center space-x-1.5">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>{getLevelTitle(level)}</span>
        </div>

        <span className="text-slate-400 font-mono font-normal">
          {level > 0 ? `${preparedCount} / ${spells.length} prepared` : `${spells.length} cantrips`}
        </span>
      </button>

      {/* Cards List */}
      {isOpen && (
        <div className="space-y-1">
          {spells.map((spell) => (
            <SpellbookCard
              key={spell.id}
              spell={spell}
              isPrepared={Boolean(preparedMap[spell.id])}
              onTogglePrepare={onTogglePrepare}
              onCast={onCast}
              onRemove={onRemove}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
