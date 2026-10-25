import React, { useState, useEffect } from 'react';
import { Moon, Sun, Settings2, Sparkles, Check, X, BookOpen, Pencil, ChevronDown } from 'lucide-react';
import { getEffectiveMaxSlots, getEffectiveMaxPrepared } from '../../utils/spellSlots';
import SlotLevelRow from './SlotLevelRow';

export default function SpellSlotTracker({
  character,
  onUseSlot,
  onRestoreSlot,
  onSetSlotsUsed,
  onUpdateMaxSlot,
  onLongRest,
  onShortRest,
  onUpdateCharacter,
}) {
  const [isEditingMax, setIsEditingMax] = useState(false);
  const [showLongRestConfirm, setShowLongRestConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Prepared max editing
  const [isEditingPrepared, setIsEditingPrepared] = useState(false);
  const effectiveMaxPrepared = getEffectiveMaxPrepared(character);
  const [preparedDraft, setPreparedDraft] = useState(effectiveMaxPrepared ?? '');

  const preparedCount = (character?.spells || []).filter((s) => s.prepared).length;

  useEffect(() => {
    if (!isEditingPrepared && character) {
      setPreparedDraft(effectiveMaxPrepared ?? '');
    }
  }, [effectiveMaxPrepared, character?.id, isEditingPrepared]);

  const handleSaveMaxPrepared = () => {
    if (!character || !onUpdateCharacter) return;
    const num = Number(preparedDraft);
    if (!isNaN(num) && num >= 0) {
      onUpdateCharacter({ ...character, customMaxPrepared: num });
    }
    setIsEditingPrepared(false);
  };

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
    <div className="p-2.5 mb-2.5 rounded-lg bg-dnd-panel border border-dnd-border transition-all">
      {/* Tracker Bar Header / Accordion Trigger */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 ${
          isCollapsed ? '' : 'pb-1.5 mb-1.5 border-b border-dnd-border/60'
        }`}
      >
        <div className="flex items-center space-x-2">
          {/* Header click toggles accordion */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center space-x-1.5 text-left group focus:outline-none"
            aria-label={isCollapsed ? 'Expand Spell Slots' : 'Collapse Spell Slots'}
            title={isCollapsed ? 'Click to expand spell slots' : 'Click to collapse spell slots'}
          >
            <Sparkles size={14} className="text-dnd-gold group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-semibold text-slate-200 group-hover:text-dnd-gold-light transition-colors">
              Spell Slots
            </h3>
            <ChevronDown
              size={13}
              className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${
                isCollapsed ? '-rotate-90' : ''
              }`}
            />
          </button>

          {/* Prepared Spells Button & Segment next to Spell Slots title */}
          <div className="flex items-center space-x-1 bg-dnd-card border border-dnd-border rounded-lg px-2 py-0.5 text-xs">
            <BookOpen size={11} className="text-dnd-gold" />
            <span className="text-[11px] text-slate-400">Prepared:</span>
            {isEditingPrepared ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={preparedDraft}
                  onChange={(e) => setPreparedDraft(e.target.value)}
                  autoFocus
                  placeholder="Max"
                  className="w-10 bg-slate-900 border border-dnd-gold rounded px-1 text-[11px] text-slate-100 text-center focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Save Max Prepared"
                  onClick={handleSaveMaxPrepared}
                  className="p-0.5 text-emerald-400 hover:text-emerald-300"
                  title="Save Max Prepared"
                >
                  <Check size={11} />
                </button>
                <button
                  type="button"
                  aria-label="Cancel Edit Max Prepared"
                  onClick={() => setIsEditingPrepared(false)}
                  className="p-0.5 text-slate-400 hover:text-slate-200"
                  title="Cancel"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <span
                className={`font-semibold text-[11px] ${
                  effectiveMaxPrepared !== null && preparedCount > effectiveMaxPrepared
                    ? 'text-amber-400'
                    : 'text-slate-200'
                }`}
              >
                {preparedCount}
                {effectiveMaxPrepared !== null ? ` / ${effectiveMaxPrepared}` : ''}
              </span>
            )}

            {!isEditingPrepared && (
              <button
                type="button"
                aria-label="Edit Max Prepared"
                onClick={() => setIsEditingPrepared(true)}
                className="p-0.5 rounded text-slate-400 hover:text-dnd-gold transition-colors"
                title="Edit maximum prepared spells"
              >
                <Pencil size={10} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {/* Edit Max Slots Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) setIsCollapsed(false);
              setIsEditingMax(!isEditingMax);
            }}
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

          {/* Long Rest with Inverted Light Mode Confirmation Popup */}
          {showLongRestConfirm ? (
            <div className="flex items-center space-x-1.5 bg-[#EFE9E0] text-slate-900 px-2 py-0.5 rounded-lg border border-slate-300 shadow-md text-xs animate-in fade-in">
              <span className="text-[11px] font-semibold text-slate-900">Long Rest?</span>
              <button
                type="button"
                aria-label="Confirm Long Rest"
                onClick={handleConfirmLongRest}
                className="p-0.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/80 rounded transition-colors"
                title="Confirm long rest"
              >
                <Check size={13} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                aria-label="Cancel Long Rest"
                onClick={() => setShowLongRestConfirm(false)}
                className="p-0.5 text-red-700 hover:text-red-900 hover:bg-red-100/80 rounded transition-colors"
                title="Cancel"
              >
                <X size={13} strokeWidth={2.5} />
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

      {/* Rows Grid (Collapsible Accordion Body) */}
      {!isCollapsed && (
        <div className="animate-in fade-in duration-200">
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
                  onSetSlotsUsed={onSetSlotsUsed}
                  onUpdateMaxSlot={onUpdateMaxSlot}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
