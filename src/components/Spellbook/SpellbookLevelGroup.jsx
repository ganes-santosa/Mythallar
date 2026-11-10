import React from 'react';
import { ChevronDown } from 'lucide-react';
import SpellbookCard from './SpellbookCard';

function getLevelTitle(level) {
  if (level === 0) return 'Cantrips';
  const ordinals = ['th', 'st', 'nd', 'rd'];
  const v = level % 100;
  const ord = ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0];
  return `${level}${ord} Level Spells`;
}

function SpellbookLevelGroup({
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
    <div className={`transition-all duration-200 last:mb-0 ${isOpen ? 'mb-4' : 'mb-1.5'}`}>
      {/* Group Header */}
      <button
        type="button"
        onClick={() => onToggle(level)}
        aria-label={isOpen ? `Collapse ${getLevelTitle(level)}` : `Expand ${getLevelTitle(level)}`}
        aria-expanded={isOpen}
        title={isOpen ? `Click to collapse ${getLevelTitle(level).toLowerCase()}` : `Click to expand ${getLevelTitle(level).toLowerCase()}`}
        className="flex items-center justify-between w-full py-1 px-2 text-xs font-semibold text-slate-300 hover:text-dnd-gold-light bg-dnd-panel/60 rounded transition-colors group"
      >
        <div className="flex items-center space-x-1.5">
          <ChevronDown
            size={13}
            className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${
              isOpen ? '' : '-rotate-90'
            }`}
          />
          <span>{getLevelTitle(level)}</span>
        </div>

        <span className={`font-normal ${isCantripOver ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
          {level > 0 ? `${preparedCount} prepared` : cantripText}
        </span>
      </button>

      {/* Cards List */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        data-testid={`spellbook-level-content-${level}`}
      >
        <div className="overflow-hidden -mx-1 px-1 -mb-1 pb-1">
          <div className="space-y-1 pt-1.5">
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
        </div>
      </div>
    </div>
  );
}

export default React.memo(SpellbookLevelGroup);

