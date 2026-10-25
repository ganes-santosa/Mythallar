import React, { useState } from 'react';
import {
  GripVertical,
  Clock,
  Compass,
  BookOpenCheck,
  ChevronDown,
  BookPlus,
  Check,
} from 'lucide-react';

const SCHOOL_COLORS = {
  Abjuration: 'text-blue-300 border-blue-400/30 bg-blue-500/10',
  Conjuration: 'text-amber-300 border-amber-400/30 bg-amber-500/10',
  Divination: 'text-purple-300 border-purple-400/30 bg-purple-500/10',
  Enchantment: 'text-pink-300 border-pink-400/30 bg-pink-500/10',
  Evocation: 'text-red-300 border-red-400/30 bg-red-500/10',
  Illusion: 'text-indigo-300 border-indigo-400/30 bg-indigo-500/10',
  Necromancy: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10',
  Transmutation: 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10',
};

export default function SpellCard({ spell, onSelect, onAddToSpellbook, isInSpellbook }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const schoolColor = SCHOOL_COLORS[spell.school] || 'text-slate-400 border-slate-500/30 bg-slate-500/10';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', spell.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
    onSelect?.(spell);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand();
    }
  };

  // Format components string
  const compList = [];
  if (spell.components?.v) compList.push('V');
  if (spell.components?.s) compList.push('S');
  if (spell.components?.m) {
    const mStr = typeof spell.components.m === 'string' ? `M (${spell.components.m})` : 'M';
    compList.push(mStr);
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`mb-1.5 rounded-lg bg-dnd-card border transition-all duration-200 select-none overflow-hidden ${
        isExpanded ? 'border-dnd-gold shadow-md shadow-black/50' : 'border-dnd-border hover:border-dnd-gold/60'
      }`}
    >
      {/* Header Row (Click to toggle accordion) */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={toggleExpand}
        className="group flex items-center justify-between p-2 sm:px-2.5 sm:py-2 hover:bg-dnd-hover focus:outline-none focus:ring-1 focus:ring-dnd-gold transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <span
            className="text-slate-500 group-hover:text-dnd-gold cursor-grab active:cursor-grabbing p-0.5"
            title="Drag to spellbook"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </span>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-sm text-slate-100 group-hover:text-dnd-gold-light transition-colors truncate">
                {spell.name}
              </span>

              {spell.isLegacy && (
                <span
                  className="text-[10px] font-medium tracking-wide px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300"
                  title="2014 Legacy PHB version"
                >
                  Legacy
                </span>
              )}

              {(spell.source === 'Homebrew' || spell.source === 'Custom') && (
                <span
                  className="text-[10px] font-medium tracking-wide px-1.5 py-0.2 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300"
                  title="Homebrew spell"
                >
                  Homebrew
                </span>
              )}

              {isInSpellbook && (
                <span className="flex items-center text-[11px] text-dnd-gold bg-dnd-gold/10 border border-dnd-gold/30 px-1.5 py-0.2 rounded">
                  <BookOpenCheck size={11} className="mr-1 inline" /> In Book
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2.5 text-[11px] text-slate-400 mt-0.5">
              <span className="flex items-center">
                <Clock size={11} className="mr-1" />
                {spell.time}
              </span>
              <span className="flex items-center">
                <Compass size={11} className="mr-1" />
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

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <span className={`text-[11px] px-1.5 py-0.2 rounded border font-medium ${schoolColor}`}>
            {spell.school}
          </span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300 font-medium">
            {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
          </span>
          <ChevronDown
            size={15}
            className={`text-slate-400 transition-transform duration-300 ease-out ${
              isExpanded ? 'rotate-180 text-dnd-gold-light' : ''
            }`}
          />
        </div>
      </div>

      {/* Accordion Detail Body */}
      {isExpanded && (
        <div className="overflow-hidden animate-in fade-in duration-200">
          <div className="p-3 bg-dnd-bg/80 border-t border-dnd-border/80 text-xs text-slate-300 space-y-2.5">
            {/* Quick stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded bg-dnd-panel/70 border border-dnd-border/50 text-[11px]">
              <div>
                <span className="text-slate-400 block font-medium">Casting Time</span>
                <span className="text-slate-200 font-semibold">{spell.time}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Range</span>
                <span className="text-slate-200 font-semibold">{spell.range}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Components</span>
                <span className="text-slate-200 font-semibold">{compList.join(', ') || 'None'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Duration</span>
                <span className="text-slate-200 font-semibold">
                  {spell.concentration ? `Conc, ${spell.duration}` : spell.duration}
                </span>
              </div>
            </div>

            {/* Classes */}
            {Array.isArray(spell.classes) && spell.classes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                <span className="text-slate-400 font-medium mr-1">Classes:</span>
                {spell.classes.map((cls) => (
                  <span
                    key={cls}
                    className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            )}

            {/* Description entries */}
            <div className="space-y-1.5 text-slate-300 leading-relaxed text-xs">
              {spell.entries?.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Higher levels */}
            {spell.higherLevels && (
              <div className="pt-2 border-t border-dnd-border/60">
                <span className="font-semibold text-dnd-gold-light block mb-0.5 text-[11px]">
                  At Higher Levels
                </span>
                <p className="text-slate-300">{spell.higherLevels}</p>
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="pt-1.5 flex items-center justify-end">
              {isInSpellbook ? (
                <span className="flex items-center text-xs text-dnd-gold bg-dnd-gold/10 border border-dnd-gold/30 px-2.5 py-1 rounded">
                  <Check size={14} className="mr-1" /> In Spellbook
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToSpellbook?.(spell.id);
                  }}
                  className="flex items-center px-3 py-1.5 rounded bg-dnd-gold hover:bg-dnd-gold-light text-slate-100 hover:text-slate-950 font-semibold transition-colors shadow"
                >
                  <BookPlus size={14} className="mr-1.5" />
                  Add to Spellbook
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
