import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import SpellCard from './SpellCard';

// ponytail: ~24 collapsed spell cards (54px each); tune if card height changes
const HIDE_AFTER_PX = 6 * 54;
const SHOW_AFTER_PX = 3 * 54;

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
    <div className={`transition-all duration-200 last:mb-0 ${isOpen ? 'mb-3' : 'mb-1'}`}>
      {/* Level Divider / Accordion Trigger */}
      <button
        type="button"
        onClick={() => onToggle(level)}
        aria-label={isOpen ? `Collapse ${getLevelTitle(level)}` : `Expand ${getLevelTitle(level)}`}
        aria-expanded={isOpen}
        title={isOpen ? `Click to collapse ${getLevelTitle(level).toLowerCase()}` : `Click to expand ${getLevelTitle(level).toLowerCase()}`}
        className="flex items-center justify-between w-full py-1 px-2.5 text-xs font-semibold text-slate-300 hover:text-dnd-gold-light bg-dnd-panel/60 rounded transition-colors group"
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
        <span className="text-[11px] text-slate-400 font-normal">
          {spells.length} {spells.length === 1 ? 'spell' : 'spells'}
        </span>
      </button>

      {/* Spells in this level, sorted alphabetically */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        data-testid={`level-content-${level}`}
      >
        <div className="overflow-hidden -mx-1 px-1 -mb-1 pb-1">
          <div className="space-y-1 pt-1.5">
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
        </div>
      </div>
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
  onScrollDirection,
}) {
  // ponytail: reports 'up'/'down' (or 'top') after a 8px threshold; no debounce, upgrade if scroll events get heavy
  const lastTopRef = React.useRef(0);
  const peakRef = React.useRef(0); // scrollTop of the last downward scroll; show threshold counts up from here
  const anchorRef = React.useRef(0); // scrollTop where the last upward scroll ended; hide threshold counts from here
  const handleScroll = useCallback((e) => {
    if (!onScrollDirection) return;
    const top = e.currentTarget.scrollTop;
    const delta = top - lastTopRef.current;
    if (top <= 4) { anchorRef.current = 0; onScrollDirection('top'); }
    else if (delta > 8) { peakRef.current = top; if (top - anchorRef.current > HIDE_AFTER_PX) onScrollDirection('down'); }
    else if (delta < -8) { if (peakRef.current - top > SHOW_AFTER_PX) { anchorRef.current = top; onScrollDirection('up'); } }
    else return;
    lastTopRef.current = top;
  }, [onScrollDirection]);

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

  const [collapsedLevels, setCollapsedLevels] = useState({});
  const [expandedSpellId, setExpandedSpellId] = useState(null);

  const handleToggleSpell = useCallback((id) => {
    setExpandedSpellId((current) => (current === id ? null : id));
  }, []);

  const handleToggleLevel = useCallback((lvl) => {
    setCollapsedLevels((prev) => ({ ...prev, [lvl]: !prev[lvl] }));
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

      <div onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto custom-scroll [scrollbar-gutter:stable] px-1 pr-1.5 space-y-1">
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
              isOpen={!collapsedLevels[lvl]}
              onToggle={handleToggleLevel}
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








