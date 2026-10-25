import React, { useEffect } from 'react';
import { X, Clock, Compass, Hourglass, Shield, BookPlus, Check } from 'lucide-react';

function formatSpellLevelSchool(level, school) {
  const levelText = level === 0 ? 'Cantrip' : `${level}${getOrdinal(level)} Level`;
  return `${levelText} ${school}`;
}

function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default function SpellDetailDrawer({ spell, isInSpellbook, onAddToSpellbook, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!spell) return null;

  const compList = [];
  if (spell.components?.v) compList.push('V');
  if (spell.components?.s) compList.push('S');
  if (spell.components?.m) {
    const mStr = typeof spell.components.m === 'string' ? `M (${spell.components.m})` : 'M';
    compList.push(mStr);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-dnd-panel border-l border-dnd-border h-full shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-dnd-border flex items-start justify-between bg-dnd-card/60">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{spell.name}</h2>
            <p className="text-sm text-dnd-gold font-medium mt-0.5">
              {formatSpellLevelSchool(spell.level, spell.school)}
              {spell.ritual && ' (Ritual)'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-dnd-bg/40 border-b border-dnd-border text-xs">
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
              {spell.concentration ? `Concentration, ${spell.duration}` : spell.duration}
            </span>
          </div>
        </div>

        {/* Classes Bar */}
        {Array.isArray(spell.classes) && spell.classes.length > 0 && (
          <div className="px-5 py-2.5 bg-slate-900/50 border-b border-dnd-border text-xs flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 mr-1 font-medium">Classes:</span>
            {spell.classes.map((cls) => (
              <span
                key={cls}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                {cls}
              </span>
            ))}
          </div>
        )}

        {/* Description Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-slate-300 leading-relaxed">
          {spell.entries?.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}

          {spell.higherLevels && (
            <div className="mt-4 pt-3 border-t border-dnd-border/60">
              <h4 className="text-xs font-semibold text-dnd-gold mb-1">
                At Higher Levels
              </h4>
              <p className="text-slate-300">{spell.higherLevels}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-dnd-border bg-dnd-card flex items-center justify-between">
          {isInSpellbook ? (
            <div className="flex items-center text-xs text-dnd-gold font-medium bg-dnd-gold/10 border border-dnd-gold/30 px-3 py-2 rounded-lg">
              <Check size={16} className="mr-1.5" />
              Already in Spellbook
            </div>
          ) : (
            <button
              onClick={() => onAddToSpellbook(spell.id)}
              className="flex items-center justify-center w-full bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-semibold px-4 py-2.5 rounded-lg transition-colors shadow"
            >
              <BookPlus size={16} className="mr-2" />
              Add to Spellbook
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
