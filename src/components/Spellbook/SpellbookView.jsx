import React, { useState } from 'react';
import { BookMarked, Download } from 'lucide-react';
import SpellbookLevelGroup from './SpellbookLevelGroup';

export default function SpellbookView({
  character,
  catalog,
  onTogglePrepare,
  onCastSpell,
  onRemoveSpell,
  onAddSpell,
  onSelectSpell,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

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
      className={`relative flex-1 h-full overflow-y-auto p-4 rounded-xl border transition-all ${
        isDragOver
          ? 'border-dnd-gold bg-dnd-gold/5 ring-2 ring-dnd-gold/30'
          : 'border-dnd-border/60 bg-dnd-panel/60'
      }`}
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

      {!hasAnySpells ? (
        <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500 border border-dashed border-dnd-border rounded-xl p-8">
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
              preparedMap={preparedMap}
              onTogglePrepare={onTogglePrepare}
              onCast={onCastSpell}
              onRemove={onRemoveSpell}
              onSelect={onSelectSpell}
            />
          ))}
        </div>
      )}
    </div>
  );
}
