import React, { useEffect, useState } from 'react';
import { Wand2, Trash2, ChevronDown, BookCheck, X } from 'lucide-react';

export default function SpellbookCard({
  spell,
  isPrepared,
  onTogglePrepare,
  onCast,
  onRemove,
  onSelect,
  isExpanded: controlledExpanded,
  onToggleExpand,
}) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [removeArmed, setRemoveArmed] = useState(false);
  const isExpanded = controlledExpanded ?? localExpanded;

  useEffect(() => {
    if (!removeArmed) return undefined;
    const timeoutId = window.setTimeout(() => setRemoveArmed(false), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [removeArmed]);

  const toggleExpand = () => {
    if (onToggleExpand) onToggleExpand(spell.id);
    else setLocalExpanded((prev) => !prev);
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
      className={`relative rounded-lg bg-dnd-card text-slate-100 transition-all duration-200 select-none overflow-hidden ${
        isPrepared
          ? 'ring-1 ring-white/30 shadow-[0_0_14px_rgba(255,255,255,0.09)]'
          : 'hover:bg-dnd-hover/80'
      } ${isExpanded ? 'shadow-[0_0_18px_rgba(255,255,255,0.12)] ring-1 ring-white/30' : ''}`}
    >
      {/* Left Bookmark Subdivision Strip: turns light Ivory/White glow when prepared */}
      <div
        data-testid="prepared-bookmark-strip"
        aria-hidden="true"
        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 z-10 ${
          isPrepared
            ? 'bg-[#EFE9E0] shadow-[0_0_8px_rgba(239,233,224,0.65)]'
            : 'bg-white/10'
        }`}
      />
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
        className="flex items-center justify-between py-2 pr-2 sm:pr-2.5 pl-5 sm:pl-6 hover:bg-dnd-hover transition-colors cursor-pointer group"
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-sm text-slate-100 group-hover:text-white transition-colors truncate">
                {spell.name}
              </span>

              {spell.specializations?.map((specialization) => (
                    <span key={specialization} className="text-[10px] font-medium tracking-wide px-1.5 py-0.2 rounded bg-dnd-gold/15 text-dnd-gold">
                      {specialization}
                    </span>
                  ))}

                  {spell.isLegacy && (
                <span
                  className="text-[9px] font-medium tracking-wide px-1 py-0.2 rounded bg-amber-500/15 text-amber-300"
                  title="2014 Legacy PHB version"
                >
                  Legacy
                </span>
              )}

              {(spell.source === 'Homebrew' || spell.source === 'Custom') && (
                <span
                  className="text-[9px] font-medium tracking-wide px-1 py-0.2 rounded bg-purple-500/20 text-purple-300"
                  title="Homebrew spell"
                >
                  Homebrew
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
              <span>{spell.time}</span>
              <span>•</span>
              <span>{spell.range}</span>
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

        <div className="flex items-center space-x-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Prepare Button (Level 1+ spells) */}
          {spell.level > 0 && (
            <button
              type="button"
              aria-label={`Toggle Prepared for ${spell.name}`}
              onClick={() => onTogglePrepare(spell.id)}
              className={`flex items-center px-2 py-1 rounded text-xs font-semibold transition-colors ${
                isPrepared
                  ? 'bg-white/10 text-white shadow-[0_0_8px_rgba(255,255,255,0.12)] ring-1 ring-white/20'
                  : 'bg-dnd-panel/60 text-slate-400 hover:text-slate-100'
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
            className="flex items-center px-2 py-1 rounded text-xs font-semibold bg-dnd-panel hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title={`Cast ${spell.name}`}
          >
            <Wand2 size={12} className="mr-1" />
            Cast
          </button>

           {/* Remove Spell Button */}
           <button
             type="button"
             aria-label={removeArmed ? `Click again to remove ${spell.name}` : `Remove ${spell.name} from spellbook`}
             onClick={() => {
               if (removeArmed) {
                 onRemove(spell.id);
                 setRemoveArmed(false);
               } else setRemoveArmed(true);
             }}
             className={`p-1 rounded transition-colors ${removeArmed ? 'text-red-500 bg-red-950/70 ring-1 ring-red-500/60' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}
             title={removeArmed ? 'Click again to remove' : 'Remove from spellbook'}
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
              className={`transition-transform duration-300 ease-out ${
                isExpanded ? 'rotate-180 text-dnd-gold-light' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Accordion Detail Body */}
      {isExpanded && (
        <div className="overflow-hidden animate-in fade-in duration-200">
          <div className="py-3 pr-3 pl-5 sm:pl-6 bg-dnd-panel/40 text-xs text-slate-300 space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2 rounded text-[11px] bg-dnd-panel/60 text-slate-300">
              <div>
                <span className="block font-medium text-slate-400">Casting Time</span>
                <span className="font-semibold text-slate-200">{spell.time}</span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Range</span>
                <span className="font-semibold text-slate-200">{spell.range}</span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Components</span>
                <span className="font-semibold text-slate-200">{compList.join(', ') || 'None'}</span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Duration</span>
                <span className="font-semibold text-slate-200">
                  {spell.concentration ? `Conc, ${spell.duration}` : spell.duration}
                </span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Source</span>
                <span className="font-semibold text-dnd-gold">{spell.source || 'PHB'}</span>
              </div>
            </div>

            {Array.isArray(spell.entries) && spell.entries.length > 0 && (
              <div className="space-y-1.5 leading-relaxed text-xs text-slate-300">
                {spell.entries.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            )}

            {spell.higherLevels && (
              <div className="pt-2">
                <span className="block mb-0.5 text-[11px] font-semibold text-dnd-gold-light">
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



