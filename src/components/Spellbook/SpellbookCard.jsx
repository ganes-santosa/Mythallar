import React, { useState } from 'react';
import { Wand2, Trash2, ChevronDown, BookCheck } from 'lucide-react';

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
      className={`relative mb-1.5 rounded-lg bg-dnd-card text-slate-100 border transition-all duration-200 select-none overflow-hidden pl-3 sm:pl-3.5 ${
        isPrepared
          ? 'border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.08)]'
          : 'border-dnd-border hover:border-dnd-gold/60'
      } ${isExpanded ? (isPrepared ? 'border-white/45 shadow-[0_0_16px_rgba(255,255,255,0.12)]' : 'border-dnd-gold shadow-md shadow-black/40') : ''}`}
    >
      {/* Left Bookmark Subdivision Strip: turns light Ivory/White glow when prepared */}
      <div
        data-testid="prepared-bookmark-strip"
        aria-hidden="true"
        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${
          isPrepared
            ? 'bg-[#EFE9E0] shadow-[0_0_8px_rgba(239,233,224,0.65)]'
            : 'bg-slate-700/60 border-r border-slate-600/40'
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
        className="flex items-center justify-between p-2 sm:px-2.5 sm:py-2 hover:bg-dnd-hover transition-colors cursor-pointer group"
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-sm text-slate-100 group-hover:text-dnd-gold-light transition-colors truncate">
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
          {/* Prepare Button (Level 1+ spells) with Subtle White Glow when Prepared */}
          {spell.level > 0 && (
            <button
              type="button"
              aria-label={`Toggle Prepared for ${spell.name}`}
              onClick={() => onTogglePrepare(spell.id)}
              className={`flex items-center px-2 py-1 rounded text-xs font-semibold border transition-colors ${
                isPrepared
                  ? 'bg-slate-900 text-slate-100 border-white/40 shadow-[0_0_8px_rgba(255,255,255,0.10)] hover:bg-slate-800'
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
            className="flex items-center px-2 py-1 rounded text-xs font-semibold bg-slate-900 hover:bg-dnd-gold hover:text-slate-100 text-slate-300 border border-slate-700 transition-colors"
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
          <div className="p-3 bg-dnd-bg/80 border-t border-dnd-border/80 text-xs text-slate-300 space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded text-[11px] bg-dnd-panel/70 border border-dnd-border/50 text-slate-300">
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
            </div>

            {Array.isArray(spell.entries) && spell.entries.length > 0 && (
              <div className="space-y-1.5 leading-relaxed text-xs text-slate-300">
                {spell.entries.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            )}

            {spell.higherLevels && (
              <div className="pt-2 border-t border-dnd-border/60">
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
