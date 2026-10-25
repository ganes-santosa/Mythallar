import React, { useState } from 'react';
import { Star, Wand2, Trash2, ChevronDown, BookCheck } from 'lucide-react';

export default function SpellbookCard({
  spell,
  isPrepared,
  onTogglePrepare,
  onCast,
  onRemove,
  onSelect,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
    onSelect?.(spell);
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
      className={`mb-1.5 rounded-lg border transition-all duration-200 select-none overflow-hidden ${
        isPrepared
          ? 'bg-[#37444F] border-[#617B8F] shadow-sm'
          : 'bg-dnd-card border-dnd-border hover:border-dnd-gold/60'
      } ${isExpanded ? 'ring-1 ring-dnd-pewter shadow-md shadow-black/40' : ''}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={toggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpand();
          }
        }}
        className={`flex items-center justify-between p-2 sm:px-2.5 sm:py-2 transition-colors cursor-pointer group ${
          isPrepared ? 'hover:bg-[#3E4C58]' : 'hover:bg-dnd-hover'
        }`}
      >
        <div className="flex items-center space-x-2.5 overflow-hidden">
          {/* Star indicator */}
          {spell.level > 0 ? (
            <button
              type="button"
              aria-label={`Star ${spell.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePrepare(spell.id);
              }}
              className={`p-1 rounded transition-colors ${
                isPrepared
                  ? 'text-dnd-gold-light hover:text-amber-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={isPrepared ? 'Prepared (click to unprepare)' : 'Not prepared (click to prepare)'}
            >
              <Star size={15} fill={isPrepared ? 'currentColor' : 'none'} />
            </button>
          ) : (
            <span className="p-1 text-slate-500" title="Cantrips are always prepared">
              <Star size={15} className="opacity-30" />
            </span>
          )}

          <div>
            <div className="flex items-center space-x-1.5">
              <span className={`font-semibold text-sm transition-colors truncate ${
                isPrepared ? 'text-white' : 'text-slate-100 group-hover:text-dnd-gold-light'
              }`}>
                {spell.name}
              </span>
              {spell.isLegacy && (
                <span
                  className="text-[9px] font-medium tracking-wide px-1 py-0.2 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300"
                  title="2014 Legacy PHB version"
                >
                  Legacy
                </span>
              )}
              {(spell.source === 'Homebrew' || spell.source === 'Custom') && (
                <span
                  className="text-[9px] font-medium tracking-wide px-1 py-0.2 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300"
                  title="Homebrew spell"
                >
                  Homebrew
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-300/80 mt-0.5">
              <span>{spell.time}</span>
              <span>•</span>
              <span>{spell.range}</span>
              {spell.concentration && <span className="text-amber-400 font-medium">[C]</span>}
              {spell.ritual && <span className="text-blue-400 font-medium">[R]</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Prepare Button (Level 1+ spells) next to Cast */}
          {spell.level > 0 && (
            <button
              type="button"
              aria-label={`Toggle Prepared for ${spell.name}`}
              onClick={() => onTogglePrepare(spell.id)}
              className={`flex items-center px-2 py-1 rounded text-xs font-semibold border transition-colors ${
                isPrepared
                  ? 'bg-dnd-gold text-slate-100 border-dnd-gold-light hover:bg-[#5a7384]'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-dnd-pewter hover:text-slate-100'
              }`}
              title={isPrepared ? 'Click to unprepare spell' : 'Click to prepare spell'}
            >
              <BookCheck size={12} className="mr-1" />
              {isPrepared ? 'Prepared' : 'Prepare'}
            </button>
          )}

          {/* Quick Cast Button */}
          <button
            type="button"
            aria-label={`Quick-Cast ${spell.name}`}
            onClick={() => onCast(spell)}
            className="flex items-center px-2 py-1 rounded bg-slate-900 hover:bg-dnd-gold hover:text-slate-100 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
            title={`Cast ${spell.name}`}
          >
            <Wand2 size={12} className="mr-1" />
            Cast
          </button>

          {/* Remove Spell Button */}
          <button
            type="button"
            aria-label={`Remove ${spell.name} from spellbook`}
            onClick={() => onRemove(spell.id)}
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Remove from spellbook"
          >
            <Trash2 size={14} />
          </button>

          <button
            type="button"
            onClick={toggleExpand}
            className="p-1 text-slate-400 hover:text-dnd-gold-light transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown
              size={15}
              className={`transition-transform duration-300 ease-out ${isExpanded ? 'rotate-180 text-dnd-gold-light' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Accordion Detail Body */}
      {isExpanded && (
        <div className="overflow-hidden animate-in fade-in duration-200">
          <div className="p-3 bg-dnd-bg/80 border-t border-dnd-border/80 text-xs text-slate-300 space-y-2.5">
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

            {Array.isArray(spell.entries) && spell.entries.length > 0 && (
              <div className="space-y-1.5 text-slate-300 leading-relaxed text-xs">
                {spell.entries.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            )}

            {spell.higherLevels && (
              <div className="pt-2 border-t border-dnd-border/60">
                <span className="font-semibold text-dnd-gold-light block mb-0.5 text-[11px]">
                  At Higher Levels
                </span>
                <p className="text-slate-300">{spell.higherLevels}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}