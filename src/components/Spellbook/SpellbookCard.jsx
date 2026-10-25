import React, { useState } from 'react';
import { Star, Wand2, Trash2, ChevronDown } from 'lucide-react';

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
      className={`mb-1.5 rounded-lg bg-dnd-card border transition-all select-none overflow-hidden ${
        isExpanded ? 'border-dnd-gold shadow-md' : 'border-dnd-border hover:border-dnd-gold/60'
      }`}
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
        className="flex items-center justify-between p-2.5 hover:bg-dnd-hover transition-colors cursor-pointer group"
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

          <button
            type="button"
            onClick={toggleExpand}
            className="p-1 text-slate-400 hover:text-dnd-gold transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-dnd-gold' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Accordion Detail Body */}
      {isExpanded && (
        <div className="p-3 bg-dnd-bg/70 border-t border-dnd-border/80 text-xs text-slate-300 space-y-2.5 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded bg-dnd-panel/60 border border-dnd-border/50 text-[11px]">
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
              <span className="font-bold text-dnd-gold block mb-0.5 uppercase tracking-wide text-[10px]">
                At Higher Levels
              </span>
              <p className="text-slate-300">{spell.higherLevels}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
