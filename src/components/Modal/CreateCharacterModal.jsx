import React from 'react';
import { X, Wand2, Feather } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';

export default function CreateCharacterModal({ isOpen, onClose, onCreate, onStartBuilder }) {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const handleManualSetup = () => {
    onCreate?.({ name: 'New Adventurer', className: 'Wizard' });
    onClose?.();
  };

  const handleCharacterBuilder = () => {
    onClose?.();
    onStartBuilder?.();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in overscroll-contain">
      <div className="bg-dnd-card rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4">
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
            className="w-full text-left p-4 rounded-xl bg-dnd-panel/60 hover:bg-dnd-panel transition-all duration-150 group shadow-sm flex items-start space-x-3.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-dnd-gold/60"
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
            onClick={handleManualSetup}
            className="w-full text-left p-4 rounded-xl bg-dnd-panel/60 hover:bg-dnd-panel transition-all duration-150 group shadow-sm flex items-start space-x-3.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-dnd-gold/60"
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
      </div>
    </div>
  );
}
