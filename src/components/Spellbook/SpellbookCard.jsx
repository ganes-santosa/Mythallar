import React, { useEffect, useRef, useState } from 'react';
import { Wand2, Trash2, ChevronDown, BookCheck, Feather, HelpCircle, X } from 'lucide-react';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';

// Runic, alchemical/planetary, and occult BMP glyphs verified to render in the app font stack
export const MAGICAL_GLYPHS = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ',
  'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ', 'ᚪ', 'ᚫ', 'ᚣ', 'ᛠ',
  '☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇', '∆', '∇', '◊', '◈',
  '❖', '✧', '✦', '✶', '✷', '✹', '❂', '⌘', '⚹', '⟁', '⟐', '⟡', '⧖', '⧗',
];

export function obfuscateMagicalText(text, seed = 0) {
  if (!text) return '';
  const str = String(text);
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (/[A-Za-z0-9]/.test(ch)) {
      const idx = (ch.charCodeAt(0) * 17 + i * 31 + seed * 13) % MAGICAL_GLYPHS.length;
      out += MAGICAL_GLYPHS[idx];
    } else {
      out += ch;
    }
  }
  return out;
}

export default function SpellbookCard({
  spell,
  isPrepared,
  isCopying = false,
  onTogglePrepare,
  onFinishCopying,
  onCast,
  onRemove,
  onSelect,
  isExpanded: controlledExpanded,
  onToggleExpand,
}) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [showCopyHint, setShowCopyHint] = useState(false);
  const copyHintRef = useRef(null);
  const isExpanded = controlledExpanded ?? localExpanded;
  const effectivePrepared = isPrepared && !isCopying;
  const { armed: removeArmed, handleClick: handleRemoveClick } = useTwoClickConfirm(() => onRemove?.(spell.id));
  const { armed: finishArmed, handleClick: handleFinishClick } = useTwoClickConfirm(() => onFinishCopying?.(spell.id));

  useEffect(() => {
    if (!showCopyHint) return undefined;
    const handleOutside = (e) => {
      if (copyHintRef.current && !copyHintRef.current.contains(e.target)) {
        setShowCopyHint(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showCopyHint]);

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
  const formatText = (val, seed = 0) => (isCopying ? obfuscateMagicalText(val, seed) : val);

  return (
    <div
      className={`relative rounded-lg bg-dnd-card text-slate-100 transition-all duration-200 select-none ${
        showCopyHint ? 'overflow-visible z-30' : 'overflow-hidden'
      } ${
        effectivePrepared
          ? 'ring-1 ring-white/30 shadow-[0_0_14px_rgba(255,255,255,0.09)]'
          : 'hover:bg-dnd-hover/80'
      } ${isExpanded ? 'shadow-[0_0_18px_rgba(255,255,255,0.12)] ring-1 ring-white/30' : ''}`}
    >
      {/* Left Bookmark Subdivision Strip: turns light Ivory/White glow when prepared */}
      <div
        data-testid="prepared-bookmark-strip"
        aria-hidden="true"
        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg transition-all duration-300 z-10 ${
          effectivePrepared
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
        <div className="flex items-center space-x-2">
          <div>
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span
                className={`font-semibold text-sm transition-colors truncate ${
                  isCopying
                    ? 'text-slate-500 group-hover:text-slate-400'
                    : 'text-slate-100 group-hover:text-white'
                }`}
              >
                {spell.name}
              </span>

              {isCopying && spell.level > 0 && (
                <div
                  ref={copyHintRef}
                  className="relative inline-flex items-center space-x-0.5"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <span
                    className="text-[10px] font-medium tracking-wide px-1.5 py-0.2 rounded bg-dnd-panel text-slate-300"
                    title="Spell is currently being copied into your spellbook"
                  >
                    Copying
                  </span>
                  <button
                    type="button"
                    aria-label={`Copying requirements for ${spell.name}`}
                    onClick={() => setShowCopyHint((prev) => !prev)}
                    className="p-0.5 text-slate-400 hover:text-dnd-gold transition-colors"
                    title="View copying time and cost"
                  >
                    <HelpCircle size={11} />
                  </button>
                  {showCopyHint && (
                    <div className="absolute left-0 top-6 z-40 w-48 max-w-[calc(100vw-2rem)] p-2 rounded-lg bg-dnd-card shadow-xl text-[11px] text-slate-200 ring-1 ring-white/10">
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/5">
                        <span className="font-semibold text-dnd-gold">Copying Requirements</span>
                        <button
                          type="button"
                          aria-label={`Close copying requirements for ${spell.name}`}
                          onClick={() => setShowCopyHint(false)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <X size={11} />
                        </button>
                      </div>
                      <div className="space-y-0.5 text-slate-300">
                        <div>Time: <span className="font-semibold text-slate-100">{spell.level * 2} hours</span></div>
                        <div>Cost: <span className="font-semibold text-slate-100">{spell.level * 50} gp</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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

            <div className={`flex items-center space-x-2 text-[11px] mt-0.5 ${isCopying ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>{isCopying ? '???' : spell.time}</span>
              <span>•</span>
              <span>{isCopying ? '???' : spell.range}</span>
              {!isCopying && spell.concentration && (
                <span className="text-amber-400 font-medium" title="Concentration">
                  [C]
                </span>
              )}
              {!isCopying && spell.ritual && (
                <span className="text-blue-400 font-medium" title="Ritual">
                  [R]
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Prepare or Finish Copying Button (Level 1+ spells) */}
          {spell.level > 0 && (
            isCopying ? (
              <button
                type="button"
                aria-label={finishArmed ? `Click again to finish copying ${spell.name}` : `Finish copying ${spell.name}`}
                onClick={handleFinishClick}
                className={`flex items-center px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  finishArmed
                    ? 'text-green-400 bg-green-950/70 ring-1 ring-green-400/70'
                    : 'bg-dnd-panel hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
                title={finishArmed ? `Click again to confirm ${spell.name} is copied` : 'Finish copying spell into spellbook'}
              >
                <Feather size={12} className="mr-1" />
                Finish Copying
              </button>
            ) : (
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
            )
          )}

          {/* Quick Cast Button */}
          {!isCopying && (
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
          )}

           {/* Remove Spell Button */}
           <button
             type="button"
             aria-label={removeArmed ? `Click again to remove ${spell.name}` : `Remove ${spell.name} from spellbook`}
             onClick={handleRemoveClick}
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
          <div className={`py-3 pr-3 pl-5 sm:pl-6 bg-dnd-panel/40 text-xs space-y-2.5 ${isCopying ? 'text-slate-500' : 'text-slate-300'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2 rounded text-[11px] bg-dnd-panel/60 text-slate-300">
              <div>
                <span className="block font-medium text-slate-400">Casting Time</span>
                <span className={`font-semibold ${isCopying ? 'text-slate-400' : 'text-slate-200'}`}>{isCopying ? '???' : spell.time}</span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Range</span>
                <span className={`font-semibold ${isCopying ? 'text-slate-400' : 'text-slate-200'}`}>{isCopying ? '???' : spell.range}</span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Components</span>
                <span className={`font-semibold ${isCopying ? 'text-slate-400' : 'text-slate-200'}`}>{isCopying ? '???' : (compList.join(', ') || 'None')}</span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Duration</span>
                <span className={`font-semibold ${isCopying ? 'text-slate-400' : 'text-slate-200'}`}>
                  {isCopying ? '???' : (spell.concentration ? `Conc, ${spell.duration}` : spell.duration)}
                </span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Source</span>
                <span className="font-semibold text-dnd-gold">{spell.source || 'PHB'}</span>
              </div>
            </div>

            {Array.isArray(spell.classes) && spell.classes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                <span className="text-slate-400 font-medium mr-1">Classes:</span>
                {spell.classes.map((cls) => (
                  <span
                    key={cls}
                    className="px-1.5 py-0.2 rounded bg-dnd-panel/80 text-slate-300"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            )}

            {Array.isArray(spell.entries) && spell.entries.length > 0 && (
              <div
                data-testid={`spellbook-entries-${spell.id}`}
                className={`space-y-1.5 leading-relaxed text-xs ${isCopying ? 'text-slate-500' : 'text-slate-300'}`}
              >
                {spell.entries.map((p, idx) => (
                  <p key={idx}>{formatText(p, 20 + idx)}</p>
                ))}
              </div>
            )}

            {spell.higherLevels && (
              <div className="pt-2">
                <span className="block mb-0.5 text-[11px] font-semibold text-dnd-gold-light">
                  {formatText('At Higher Levels', 50)}
                </span>
                <p className={isCopying ? 'text-slate-500' : 'text-slate-300'}>{formatText(spell.higherLevels, 51)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

