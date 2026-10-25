import React from 'react';
import { GripVertical, Clock, Compass, Sparkles, BookOpenCheck } from 'lucide-react';

const SCHOOL_COLORS = {
  Abjuration: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  Conjuration: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  Divination: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  Enchantment: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
  Evocation: 'text-red-400 border-red-500/30 bg-red-500/10',
  Illusion: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
  Necromancy: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  Transmutation: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
};

export default function SpellCard({ spell, onSelect, isInSpellbook }) {
  const schoolColor = SCHOOL_COLORS[spell.school] || 'text-slate-400 border-slate-500/30 bg-slate-500/10';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', spell.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect && onSelect(spell)}
      className="group flex items-center justify-between p-3 mb-2 rounded-lg bg-dnd-card border border-dnd-border hover:border-dnd-gold/60 hover:bg-dnd-hover transition-all cursor-pointer select-none"
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        <span
          className="text-slate-500 group-hover:text-dnd-gold cursor-grab active:cursor-grabbing p-1"
          title="Drag to spellbook"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </span>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-100 group-hover:text-dnd-gold transition-colors truncate">
              {spell.name}
            </span>

            {isInSpellbook && (
              <span className="flex items-center text-xs text-dnd-gold bg-dnd-gold/10 border border-dnd-gold/30 px-1.5 py-0.5 rounded font-mono">
                <BookOpenCheck size={11} className="mr-1 inline" /> In Book
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center">
              <Clock size={12} className="mr-1" />
              {spell.time}
            </span>
            <span className="flex items-center">
              <Compass size={12} className="mr-1" />
              {spell.range}
            </span>
            {spell.concentration && (
              <span className="text-amber-400 font-medium" title="Concentration">
                [C]
              </span>
            )}
            {spell.ritual && (
              <span className="text-blue-400 font-medium" title="Ritual">
                [R]
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${schoolColor}`}>
          {spell.school}
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
          {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
        </span>
      </div>
    </div>
  );
}
