import React, { useState, useEffect } from 'react';
import { X, Wand2, Feather, User, ChevronLeft } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';

export const DND_CLASSES = [
  'Artificer',
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
];

export default function CreateCharacterModal({ isOpen, onClose, onCreate, onStartBuilder }) {
  const [mode, setMode] = useState('choose'); // 'choose' | 'manual'
  const [name, setName] = useState('');
  const [className, setClassName] = useState('Wizard');

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMode('choose');
      setName('');
      setClassName('Wizard');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCharacterBuilder = () => {
    onClose?.();
    onStartBuilder?.();
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate?.({ name: trimmed, className });
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in overscroll-contain">
      <div className="bg-dnd-card rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
        {mode === 'choose' ? (
          <>
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-dnd-ivory tracking-tight font-display">
                  Create your character
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose how you&apos;d like to get started.
                </p>
              </div>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3 pt-1">
              {/* Option 1: Character Builder (Recommended) */}
              <button
                type="button"
                onClick={handleCharacterBuilder}
                className="w-full text-left p-4 rounded-xl bg-dnd-panel/60 hover:bg-dnd-panel transition-colors duration-150 group shadow-sm flex items-start space-x-3.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-dnd-gold/40"
                aria-label="Character Builder"
              >
                <div className="p-2.5 rounded-lg bg-dnd-gold/10 text-dnd-gold group-hover:bg-dnd-gold/20 transition-colors shrink-0">
                  <Wand2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-slate-100 group-hover:text-dnd-gold transition-colors">
                      Character Builder
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-dnd-gold/15 text-dnd-gold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Follow a step-by-step process to build your character.
                  </p>
                </div>
              </button>

              {/* Option 2: Manual Setup */}
              <button
                type="button"
                onClick={() => setMode('manual')}
                className="w-full text-left p-4 rounded-xl bg-dnd-panel/60 hover:bg-dnd-panel transition-colors duration-150 group shadow-sm flex items-start space-x-3.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-dnd-gold/40"
                aria-label="Manual Setup"
              >
                <div className="p-2.5 rounded-lg bg-white/5 text-slate-300 group-hover:text-slate-100 group-hover:bg-white/10 transition-colors shrink-0">
                  <Feather size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
                    Manual Setup
                  </span>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Skip the guided process and fill in your character sheet yourself.
                  </p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center space-x-2.5">
                <span className="p-1.5 rounded-lg bg-dnd-panel text-dnd-gold">
                  <User size={18} />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight font-display">
                    Create Character
                  </h3>
                  <p className="text-xs text-slate-400">
                    Adventure awaits
                  </p>
                </div>
              </div>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Form */}
            <form noValidate onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="character-name-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Character Name
                </label>
                <input
                  id="character-name-input"
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gale of Waterdeep"
                  className="w-full bg-dnd-panel rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold transition-colors"
                />
              </div>

              <div>
                <label htmlFor="character-class-select" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Starting Class (Level 1)
                </label>
                <select
                  id="character-class-select"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-dnd-panel rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-dnd-gold transition-colors cursor-pointer"
                >
                  {DND_CLASSES.map((cls) => (
                    <option key={cls} value={cls} className="bg-dnd-panel">
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setMode('choose')}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Back to options"
                >
                  <ChevronLeft size={14} />
                  <span>Back</span>
                </button>

                <div className="flex items-center space-x-2">
                  {onClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-dnd-gold hover:bg-dnd-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Feather size={13} />
                    <span>Create Character</span>
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
