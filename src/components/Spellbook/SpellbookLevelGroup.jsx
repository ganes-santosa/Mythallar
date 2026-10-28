import React from 'react';
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
  isOpen,
  onToggle,
  preparedMap,
  copyingMap = {},
  notesMap = {},
  maxCantrips = null,
  onTogglePrepare,
  onFinishCopying,
  onCast,
  onRemove,
  onSelect,
  onUpdateNote,
  expandedSpellId,
  onToggleSpell,
}) {
  if (!spells || spells.length === 0) return null;

  const preparedCount = spells.filter((s) => preparedMap[s.id] && !copyingMap[s.id]).length;
  const isCantripOver = level === 0 && typeof maxCantrips === 'number' && spells.length > maxCantrips;
  const cantripText = typeof maxCantrips === 'number'
    ? `${spells.length} / ${maxCantrips} cantrips`
    : `${spells.length} cantrips`;

  return (
    <div className="mb-4">
      {/* Group Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full py-1 px-2 mb-1 text-xs font-semibold text-slate-300 hover:text-dnd-gold-light bg-dnd-panel/60 rounded transition-colors"
      >
        <div className="flex items-center space-x-1.5">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>{getLevelTitle(level)}</span>
        </div>

        <span className={`font-normal ${isCantripOver ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
          {level > 0 ? `${preparedCount} prepared` : cantripText}
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
              isCopying={Boolean(copyingMap[spell.id])}
              note={notesMap[spell.id] || ''}
              onTogglePrepare={onTogglePrepare}
              onFinishCopying={onFinishCopying}
              onCast={onCast}
              onRemove={onRemove}
              onSelect={onSelect}
              onUpdateNote={onUpdateNote}
              isExpanded={expandedSpellId === spell.id}
              onToggleExpand={onToggleSpell}
            />
          ))}
        </div>
      )}
    </div>
  );
}

