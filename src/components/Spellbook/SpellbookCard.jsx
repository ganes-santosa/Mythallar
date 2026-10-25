import React from 'react';
import { Star, Wand2, Trash2, Clock, Compass } from 'lucide-react';

export default function SpellbookCard({
  spell,
  isPrepared,
  onTogglePrepare,
  onCast,
  onRemove,
  onSelect,
}) {
  return (
    <div
      onClick={() => onSelect && onSelect(spell)}
      className="flex items-center justify-between p-2.5 mb-1.5 rounded-lg bg-dnd-card border border-dnd-border hover:border-dnd-gold/60 transition-all cursor-pointer select-none group"
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        {/* Prepared Star Toggle (Only for level 1+ spells) */}
        {spell.level > 0 ? (
          <button
            type="button"
            aria-label={`Toggle Prepared for ${spell.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePrepare(spell.id);
            }}
            className={`p-1 rounded transition-colors ${
              isPrepared
                ? 'text-dnd-gold hover:text-dnd-gold-light'
                : 'text-slate-600 hover:text-slate-400'
            }`}
            title={isPrepared ? 'Prepared (click to unprepare)' : 'Not prepared (click to prepare)'}
          >
            <Star size={16} fill={isPrepared ? 'currentColor' : 'none'} />
          </button>
        ) : (
          <span className="p-1 text-slate-600" title="Cantrips are always prepared">
            <Star size={16} className="opacity-30" />
          </span>
        )}

        <div>
          <span className="font-semibold text-sm text-slate-100 group-hover:text-dnd-gold transition-colors truncate block">
            {spell.name}
          </span>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>{spell.time}</span>
            <span>•</span>
            <span>{spell.range}</span>
            {spell.concentration && <span className="text-amber-400">[C]</span>}
            {spell.ritual && <span className="text-blue-400">[R]</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
        {/* Quick Cast Button */}
        <button
          type="button"
          aria-label={`Quick-Cast ${spell.name}`}
          onClick={() => onCast(spell)}
          className="flex items-center px-2 py-1 rounded bg-slate-800 hover:bg-dnd-gold hover:text-slate-950 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
          title={`Cast ${spell.name}`}
        >
          <Wand2 size={13} className="mr-1" />
          Cast
        </button>

        {/* Remove Spell Button */}
        <button
          type="button"
          aria-label={`Remove ${spell.name} from spellbook`}
          onClick={() => onRemove(spell.id)}
          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Remove from spellbook"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
