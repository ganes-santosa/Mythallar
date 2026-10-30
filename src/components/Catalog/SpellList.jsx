import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import SpellCard from './SpellCard';

function getLevelTitle(level) {
  if (level === 0) return 'Cantrips';
  const ordinals = ['th', 'st', 'nd', 'rd'];
  const v = level % 100;
  const ord = ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0];
  return `${level}${ord} Level Spells`;
}

const CatalogLevelGroup = React.memo(function CatalogLevelGroup({
  level,
  spells,
  isOpen,
  onToggle,
  spellbookSpellIds,
  notesMap = {},
  onSelectSpell,
  onAddToSpellbook,
  onDeleteHomebrew,
  onUpdateNote,
  expandedSpellId,
  onToggleSpell,
}) {
  if (!spells || spells.length === 0) return null;

  return (
    <div className="mb-2">
      {/* Level Divider / Accordion Trigger */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full py-1 px-2.5 mb-1.5 text-xs font-semibold text-slate-300 hover:text-dnd-gold-light bg-dnd-panel/60 rounded transition-colors"
      >
        <div className="flex items-center space-x-1.5">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>{getLevelTitle(level)}</span>
        </div>
        <span className="text-[11px] text-slate-400 font-normal">
          {spells.length} {spells.length === 1 ? 'spell' : 'spells'}
        </span>
      </button>

      {/* Spells in this level, sorted alphabetically */}
      {isOpen && (
        <div className="space-y-1">
          {spells.map((spell) => (
            <SpellCard
              key={spell.id}
              spell={spell}
              onSelect={onSelectSpell}
              onAddToSpellbook={onAddToSpellbook}
              onDeleteHomebrew={onDeleteHomebrew}
              onUpdateNote={onUpdateNote}
              note={notesMap[spell.id] || ''}
              isInSpellbook={spellbookSpellIds.has(spell.id)}
              isExpanded={expandedSpellId === spell.id}
              onToggleExpand={onToggleSpell}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default React.memo(function SpellList({
  spells,
  spellbookSpellIds = new Set(),
  notesMap = {},
  onSelectSpell,
  onAddToSpellbook,
  onDeleteHomebrew,
  onUpdateNote,
}) {
  // Group spells by level (0-9) and sort alphabetically within each level
  const groupedSpells = useMemo(() => {
    const groups = {};
    for (let i = 0; i <= 9; i++) {
      groups[i] = [];
    }

    for (const spell of spells) {
      const lvl = typeof spell.level === 'number' ? spell.level : 0;
      if (!groups[lvl]) groups[lvl] = [];
      groups[lvl].push(spell);
    }

    for (const lvl of Object.keys(groups)) {
      groups[lvl].sort((a, b) => a.name.localeCompare(b.name));
    }

    return groups;
  }, [spells]);

  const [openLevel, setOpenLevel] = useState(null);
  const [expandedSpellId, setExpandedSpellId] = useState(null);

  const handleToggleSpell = useCallback((id) => {
    setExpandedSpellId((current) => (current === id ? null : id));
  }, []);

  const handleToggleLevel = useCallback((lvl) => {
    setOpenLevel((prev) => (prev === lvl ? null : lvl));
  }, []);

  const activeLevels = useMemo(() => {
    return Object.keys(groupedSpells)
      .map(Number)
      .filter((lvl) => groupedSpells[lvl].length > 0)
      .sort((a, b) => a - b);
  }, [groupedSpells]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex justify-between items-center py-1 text-xs text-slate-400 font-medium">
        <span>Showing {spells.length} spells</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-1 pr-1.5 space-y-1">
        {spells.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
            <p className="text-sm">No spells match your search or filter.</p>
            <p className="text-xs text-slate-600 mt-1">Try resetting filters.</p>
          </div>
        ) : (
          activeLevels.map((lvl) => (
            <CatalogLevelGroup
              key={lvl}
              level={lvl}
              spells={groupedSpells[lvl]}
              isOpen={openLevel === null || openLevel === lvl}
              onToggle={() => handleToggleLevel(lvl)}
              spellbookSpellIds={spellbookSpellIds}
              notesMap={notesMap}
              onSelectSpell={onSelectSpell}
              onAddToSpellbook={onAddToSpellbook}
              onDeleteHomebrew={onDeleteHomebrew}
              onUpdateNote={onUpdateNote}
              expandedSpellId={expandedSpellId}
              onToggleSpell={handleToggleSpell}
            />
          ))
        )}
      </div>
    </div>
  );
});








