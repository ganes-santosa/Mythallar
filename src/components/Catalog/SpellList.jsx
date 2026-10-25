import React from 'react';
import SpellCard from './SpellCard';

export default function SpellList({
  spells,
  spellbookSpellIds = new Set(),
  onSelectSpell,
  onAddToSpellbook,
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center py-1 text-xs text-slate-400 font-mono">
        <span>Showing {spells.length} spells</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-0.5 space-y-0.5">
        {spells.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
            <p className="text-sm">No spells match your search or filter.</p>
            <p className="text-xs text-slate-600 mt-1">Try resetting filters.</p>
          </div>
        ) : (
          spells.map((spell) => (
            <SpellCard
              key={spell.id}
              spell={spell}
              onSelect={onSelectSpell}
              onAddToSpellbook={onAddToSpellbook}
              isInSpellbook={spellbookSpellIds.has(spell.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
