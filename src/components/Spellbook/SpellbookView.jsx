import React, { useState } from 'react';
import { BookMarked, Download, ChevronDown } from 'lucide-react';
import SpellbookLevelGroup from './SpellbookLevelGroup';
import PreparedSpellSummary from './PreparedSpellSummary';
import { getSpellcastingHints } from './spellcastingHints';
import { HelpCircle, X } from 'lucide-react';

export default function SpellbookView({
  character,
  catalog,
  onTogglePrepare,
  onCastSpell,
  onRemoveSpell,
  onAddSpell,
  onSelectSpell,
  onUpdateCharacter,
}) {
  const [showSpellHint, setShowSpellHint] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openLevel, setOpenLevel] = useState(null);
  const [expandedSpellId, setExpandedSpellId] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only turn off if leaving the dropzone boundary
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const spellId = e.dataTransfer.getData('text/plain');
    if (spellId && onAddSpell) {
      onAddSpell(spellId);
    }
  };

  // Group spells by level
  const preparedMap = {};
  const spellsByLevel = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
  };

  if (character && Array.isArray(character.spells)) {
    for (const item of character.spells) {
      preparedMap[item.id] = item.prepared;
      const spell = catalog[item.id];
      if (spell) {
        const lvl = typeof spell.level === 'number' ? spell.level : 0;
        if (!spellsByLevel[lvl]) spellsByLevel[lvl] = [];
        spellsByLevel[lvl].push(spell);
      }
    }
  }

  // Sort within each level alphabetically
  for (const lvl of Object.keys(spellsByLevel)) {
    spellsByLevel[lvl].sort((a, b) => a.name.localeCompare(b.name));
  }

  const hasAnySpells = character && character.spells && character.spells.length > 0;

  return (
    <div
      role="region"
      aria-label="Character Spellbook Drop Zone"
      data-testid="spellbook-dropzone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative p-2.5 rounded-lg bg-dnd-panel transition-all flex flex-col min-h-0 ${
        isCollapsed ? '' : 'flex-1 h-full'
      } ${isDragOver ? 'ring-1 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.08)]' : ''}`}
    >
      {/* Drop overlay badge when dragging */}
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-dnd-panel/80 z-20 pointer-events-none">
          <div className="flex items-center space-x-2 text-dnd-gold font-semibold text-lg animate-pulse">
            <Download size={24} />
            <span>Drop to add spell to spellbook</span>
          </div>
        </div>
      )}

      {/* Accordion header matching Spell Slots */}
      <div className={`relative z-20 flex-shrink-0 flex flex-wrap items-center justify-between gap-2 bg-dnd-panel ${isCollapsed ? '' : 'pb-1.5 mb-1.5'}`}>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-1.5 text-left group focus:outline-none"
          aria-label={isCollapsed ? 'Expand Spellbook' : 'Collapse Spellbook'}
          title={isCollapsed ? 'Click to expand spellbook' : 'Click to collapse spellbook'}
        >
          <BookMarked size={14} className="text-dnd-gold group-hover:scale-110 transition-transform" />
          <h3 className="text-xs font-semibold text-slate-200 group-hover:text-dnd-gold-light transition-colors">Spellbook</h3>
          <ChevronDown size={13} className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
        </button>
        <div className="flex items-center gap-2">
          <PreparedSpellSummary character={character} onUpdateCharacter={onUpdateCharacter} />
          <span className="text-[11px] text-slate-400">{(character?.spells || []).length} spells</span>
          <div className="relative">
            <button type="button" aria-label="Spell learning hint" onClick={() => setShowSpellHint(!showSpellHint)} className="p-1 text-slate-400 hover:text-dnd-gold" title="How this class gains spells">
              <HelpCircle size={13} />
            </button>
            {showSpellHint && <div className="absolute right-0 top-7 z-30 w-80 max-w-[calc(100vw-2rem)] p-2.5 rounded-lg bg-dnd-card shadow-xl text-[11px] text-slate-200 ring-1 ring-white/10">
              <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-white/5"><span className="font-semibold text-dnd-gold">How to gain spells</span><button type="button" aria-label="Close spell learning hint" onClick={() => setShowSpellHint(false)}><X size={11} /></button></div>
              <div className="space-y-2">{getSpellcastingHints(character).map((item) => <div key={item.className}><div className="font-semibold text-slate-200">{item.className}</div><p className="text-slate-400">{item.hint}</p></div>)}</div>
            </div>}
          </div>
        </div>
      </div>

      {!isCollapsed && <div className="flex-1 min-h-0 overflow-y-auto px-1 pr-3">
      {!hasAnySpells ? (
        <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500 rounded-xl p-8 bg-dnd-card/40">
          <BookMarked size={40} className="mb-3 text-slate-600" />
          <h3 className="font-semibold text-slate-300 text-base">Your Spellbook is Empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Drag and drop spells from the catalog on the left, or click "Add to Spellbook" in the spell detail drawer.
          </p>
        </div>
      ) : (
        <div>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
            <SpellbookLevelGroup
              key={lvl}
              level={lvl}
              spells={spellsByLevel[lvl]}
               isOpen={openLevel === null || openLevel === lvl}
               onToggle={() => setOpenLevel(openLevel === lvl ? null : lvl)}
              preparedMap={preparedMap}
              onTogglePrepare={onTogglePrepare}
              onCast={onCastSpell}
              onRemove={onRemoveSpell}
              onSelect={onSelectSpell}
               expandedSpellId={expandedSpellId}
               onToggleSpell={(id) => setExpandedSpellId((current) => current === id ? null : id)}
             />
          ))}
        </div>
      )}
      </div>}
    </div>
  );
}







