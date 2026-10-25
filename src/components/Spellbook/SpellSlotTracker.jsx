import React, { useState } from 'react';
import { Moon, Sun, Settings2, Sparkles, Check, X } from 'lucide-react';
import { getEffectiveMaxSlots } from '../../utils/spellSlots';
import SlotLevelRow from './SlotLevelRow';

export default function SpellSlotTracker({
  character,
  onUseSlot,
  onRestoreSlot,
  onUpdateMaxSlot,
  onLongRest,
  onShortRest,
}) {
  const [isEditingMax, setIsEditingMax] = useState(false);
  const [showLongRestConfirm, setShowLongRestConfirm] = useState(false);

  const effectiveSlots = getEffectiveMaxSlots(
    character?.className,
    character?.level,
    character?.customSlots
  );

  // Active levels: in normal mode, only levels with slots (> 0); in edit mode, show levels 1-9 so user can customize
  const activeLevels = isEditingMax
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
    : Object.keys(effectiveSlots)
        .map(Number)
        .filter((lvl) => effectiveSlots[lvl] > 0)
        .sort((a, b) => a - b);

  const handleConfirmLongRest = () => {
    onLongRest();
    setShowLongRestConfirm(false);
  };

  return (
    <div className="p-2.5 mb-2.5 rounded-lg bg-dnd-panel border border-dnd-border">
      {/* Tracker Bar Header */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-dnd-border/60">
        <div className="flex items-center space-x-1.5">
          <Sparkles size={14} className="text-dnd-gold" />
          <h3 className="text-xs font-semibold text-slate-200">
            Spell Slots
          </h3>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {/* Edit Max Toggle */}
          <button
            type="button"
            onClick={() => setIsEditingMax(!isEditingMax)}
            className={`flex items-center px-2 py-0.5 rounded border transition-colors ${
              isEditingMax
                ? 'bg-dnd-gold/20 border-dnd-gold text-dnd-gold'
                : 'bg-dnd-card border-dnd-border text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 size={12} className="mr-1" />
            Edit
          </button>

          {/* Short Rest (Pact Magic / Warlock) */}
          {character?.className === 'Warlock' && (
            <button
              type="button"
              onClick={onShortRest}
              className="flex items-center px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Reset Pact Magic slots on Short Rest"
            >
              <Sun size={12} className="mr-1 text-amber-400" />
              Short Rest
            </button>
          )}

          {/* Long Rest with Confirmation Popup */}
          {showLongRestConfirm ? (
            <div className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-dnd-gold text-xs animate-in fade-in">
              <span className="text-[11px] text-slate-300">Long Rest?</span>
              <button
                type="button"
                aria-label="Confirm Long Rest"
                onClick={handleConfirmLongRest}
                className="p-0.5 text-emerald-400 hover:text-emerald-300"
                title="Confirm long rest"
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                aria-label="Cancel Long Rest"
                onClick={() => setShowLongRestConfirm(false)}
                className="p-0.5 text-red-400 hover:text-red-300"
                title="Cancel"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLongRestConfirm(true)}
              className="flex items-center px-2 py-0.5 rounded bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 transition-colors font-medium"
              title="Reset all spell slots on Long Rest"
            >
              <Moon size={12} className="mr-1 text-blue-400" />
              Long Rest
            </button>
          )}
        </div>
      </div>

      {/* Rows Grid */}
      {activeLevels.length === 0 ? (
        <div className="text-center py-3 text-xs text-slate-500">
          <p>No spell slots for {character?.className || 'this class'} at level {character?.level || 1}.</p>
          <button
            type="button"
            onClick={() => {
              setIsEditingMax(true);
              onUpdateMaxSlot(1, 2);
            }}
            className="mt-1 text-dnd-gold underline hover:text-dnd-gold-light"
          >
            Add custom 1st level slots
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {activeLevels.map((lvl) => (
            <SlotLevelRow
              key={lvl}
              level={lvl}
              maxSlots={effectiveSlots[lvl]}
              usedSlots={character?.slotsUsed?.[lvl] || 0}
              isEditingMax={isEditingMax}
              onUseSlot={onUseSlot}
              onRestoreSlot={onRestoreSlot}
              onUpdateMaxSlot={onUpdateMaxSlot}
            />
          ))}
        </div>
      )}
    </div>
  );
}
