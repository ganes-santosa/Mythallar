import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Settings2,
  Sparkles,
  Check,
  X,
  BookOpen,
  Pencil,
  ChevronDown,
  HelpCircle,
  Flame,
  RotateCcw,
} from 'lucide-react';
import {
  getEffectiveMaxSlots,
  getEffectiveMaxPreparedInfo,
  calculateMulticlassSpellSlots,
} from '../../utils/spellSlots';
import SlotLevelRow from './SlotLevelRow';

export default function SpellSlotTracker({
  character,
  onUseSlot,
  onRestoreSlot,
  onSetSlotsUsed,
  onUsePactSlot,
  onRestorePactSlot,
  onSetPactSlotsUsed,
  onUpdateMaxSlot,
  onResetMaxSlot,
  onLongRest,
  onShortRest,
  onUpdateCharacter,
}) {
  const [isEditingMax, setIsEditingMax] = useState(false);
  const [showLongRestConfirm, setShowLongRestConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPactCollapsed, setIsPactCollapsed] = useState(false);

  // Hints popovers
  const [showSlotsHint, setShowSlotsHint] = useState(false);
  const [showPreparedHint, setShowPreparedHint] = useState(false);
  const [showPactHint, setShowPactHint] = useState(false);

  // Prepared max editing
  const [isEditingPrepared, setIsEditingPrepared] = useState(false);
  const preparedInfo = getEffectiveMaxPreparedInfo(character);
  const effectiveMaxPrepared = Number.isFinite(preparedInfo.total)
    ? preparedInfo.total
    : preparedInfo.total === null
    ? null
    : 0;
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

  const handleResetMaxPrepared = () => {
    if (!character || !onUpdateCharacter) return;
    const nextChar = { ...character };
    delete nextChar.customMaxPrepared;
    onUpdateCharacter(nextChar);
    setIsEditingPrepared(false);
  };

  const multiclassInfo = calculateMulticlassSpellSlots(character);
  const effectiveSlots = getEffectiveMaxSlots(
    character?.className,
    character?.level,
    character?.customSlots,
    character
  );

  // Shared spell slot levels
  const activeLevels = isEditingMax
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
    : Object.keys(effectiveSlots)
        .map(Number)
        .filter((lvl) => effectiveSlots[lvl] > 0)
        .sort((a, b) => a - b);

  // Pact Magic slots (from Warlock levels)
  const hasPactMagic =
    multiclassInfo.pactSource !== null &&
    Object.keys(multiclassInfo.pactSlots).length > 0;
  const pactSlotLevel = hasPactMagic
    ? Number(Object.keys(multiclassInfo.pactSlots)[0])
    : 1;
  const maxPactSlots = hasPactMagic
    ? Number(multiclassInfo.pactSlots[pactSlotLevel]) || 0
    : 0;
  const usedPactSlots = Number(character?.pactSlotsUsed) || 0;

  const handleConfirmLongRest = () => {
    onLongRest();
    setShowLongRestConfirm(false);
  };

  return (
    <div className="p-2.5 mb-2.5 rounded-lg bg-dnd-panel border border-dnd-border transition-all space-y-2">
      {/* ================= SHARED SPELL SLOTS SECTION ================= */}
      <div>
        {/* Header / Accordion Trigger */}
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

            {/* Hint Button for Spell Slots */}
            <div className="relative">
              <button
                type="button"
                aria-label="Spell slots source breakdown"
                onClick={() => setShowSlotsHint((prev) => !prev)}
                className="p-0.5 text-slate-400 hover:text-dnd-gold transition-colors"
                title="View spell slot source breakdown"
              >
                <HelpCircle size={12} />
              </button>

              {showSlotsHint && (
                <div className="absolute left-0 top-6 z-30 w-64 p-2.5 rounded-lg bg-slate-900 border border-dnd-gold/60 shadow-xl text-xs text-slate-200 animate-in fade-in">
                  <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-800">
                    <span className="font-semibold text-dnd-gold text-[11px]">
                      Caster Level Breakdown
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSlotsHint(false)}
                      className="text-slate-400 hover:text-slate-200 p-0.5"
                    >
                      <X size={11} />
                    </button>
                  </div>

                  {multiclassInfo.sources.length === 0 ? (
                    <p className="text-[11px] text-slate-400">No spellcasting classes.</p>
                  ) : (
                    <div className="space-y-1 text-[11px]">
                      {multiclassInfo.sources.map((s, i) => (
                        <div key={i} className="flex justify-between items-center text-slate-300">
                          <span>
                            {s.className} (Level {s.level})
                          </span>
                          <span className="font-semibold text-dnd-ivory">
                            +{s.contribution} {s.contribution === 1 ? 'level' : 'levels'}
                          </span>
                        </div>
                      ))}
                      <div className="pt-1 mt-1 border-t border-slate-800 flex justify-between font-semibold text-dnd-gold">
                        <span>Total Caster Level:</span>
                        <span>{multiclassInfo.casterLevel}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Prepared Spells Button & Segment */}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveMaxPrepared();
                      if (e.key === 'Escape') setIsEditingPrepared(false);
                    }}
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
                    aria-label="Reset Max Prepared"
                    onClick={handleResetMaxPrepared}
                    className="p-0.5 text-slate-400 hover:text-dnd-gold"
                    title="Reset to 5e rules"
                  >
                    <RotateCcw size={11} />
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

              {/* Tiny Hint for Prepared Spells Amount */}
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  aria-label="Prepared spells limit breakdown"
                  onClick={() => setShowPreparedHint((prev) => !prev)}
                  className="p-0.5 text-slate-400 hover:text-dnd-gold transition-colors"
                  title="View prepared spells source breakdown"
                >
                  <HelpCircle size={10} />
                </button>

                {showPreparedHint && (
                  <div className="absolute left-0 top-5 z-30 w-56 p-2 rounded-lg bg-slate-900 border border-dnd-gold/60 shadow-xl text-xs text-slate-200 animate-in fade-in">
                    <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
                      <span className="font-semibold text-dnd-gold text-[11px]">
                        Prepared Limit per Class
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPreparedHint(false)}
                        className="text-slate-400 hover:text-slate-200 p-0.5"
                      >
                        <X size={10} />
                      </button>
                    </div>

                    {preparedInfo.isCustom ? (
                      <p className="text-[11px] text-amber-300">
                        Manually set to {preparedInfo.total} spells.
                      </p>
                    ) : preparedInfo.breakdown.length === 0 ? (
                      <p className="text-[11px] text-slate-400">
                        No prepared caster classes (casts known spells).
                      </p>
                    ) : (
                      <div className="space-y-1 text-[11px]">
                        {preparedInfo.breakdown.map((b, i) => (
                          <div key={i} className="flex justify-between items-center text-slate-300">
                            <span>{b.formula}</span>
                            <span className="font-semibold text-dnd-ivory">
                              {b.amount} spells
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

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
            {/* Edit Max Slots Toggle / Done */}
            {isEditingMax ? (
              <button
                type="button"
                onClick={() => setIsEditingMax(false)}
                className="flex items-center px-2 py-0.5 rounded-md bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light text-xs font-medium transition-colors shadow-sm"
                title="Done editing max slots"
              >
                <Check size={12} className="mr-1" />
                Done
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false);
                  setIsEditingMax(true);
                }}
                className="flex items-center px-2 py-0.5 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-dnd-gold border border-dnd-border hover:border-dnd-gold text-xs font-normal transition-colors"
                title="Edit maximum spell slots"
              >
                <Settings2 size={12} className="mr-1 text-slate-400" />
                Edit
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
              <div className="text-center py-2 text-xs text-slate-500">
                <p>No shared spell slots.</p>
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
              <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2">
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
                    onResetMaxSlot={onResetMaxSlot}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= PACT MAGIC ACCORDION (WARLOCK) ================= */}
      {hasPactMagic && (
        <div className="pt-2 border-t border-dnd-border/60">
          <div
            className={`flex flex-wrap items-center justify-between gap-2 ${
              isPactCollapsed ? '' : 'pb-1.5 mb-1.5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsPactCollapsed(!isPactCollapsed)}
                className="flex items-center space-x-1.5 text-left group focus:outline-none"
                aria-label={isPactCollapsed ? 'Expand Pact Magic Slots' : 'Collapse Pact Magic Slots'}
                title={isPactCollapsed ? 'Click to expand pact magic slots' : 'Click to collapse pact magic slots'}
              >
                <Flame size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                  Pact Magic (Short Rest)
                </h4>
                <ChevronDown
                  size={13}
                  className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${
                    isPactCollapsed ? '-rotate-90' : ''
                  }`}
                />
              </button>

              {/* Pact Magic Hint */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="Pact magic source breakdown"
                  onClick={() => setShowPactHint((prev) => !prev)}
                  className="p-0.5 text-slate-400 hover:text-purple-400 transition-colors"
                  title="View pact magic slot breakdown"
                >
                  <HelpCircle size={12} />
                </button>

                {showPactHint && (
                  <div className="absolute left-0 top-6 z-30 w-56 p-2.5 rounded-lg bg-slate-900 border border-purple-500/60 shadow-xl text-xs text-slate-200 animate-in fade-in">
                    <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-800">
                      <span className="font-semibold text-purple-300 text-[11px]">
                        Pact Magic Slots
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPactHint(false)}
                        className="text-slate-400 hover:text-slate-200 p-0.5"
                      >
                        <X size={11} />
                      </button>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="text-slate-300">
                        • Warlock (Level {multiclassInfo.pactSource?.level}):{' '}
                        <span className="font-semibold text-purple-200">
                          {maxPactSlots} {maxPactSlots === 1 ? 'slot' : 'slots'} ({pactSlotLevel}
                          {pactSlotLevel === 1
                            ? 'st'
                            : pactSlotLevel === 2
                            ? 'nd'
                            : pactSlotLevel === 3
                            ? 'rd'
                            : 'th'}{' '}
                          Level)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1">
                        Recharges fully on Short Rest.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Short Rest Action Button directly on Pact Magic */}
            <button
              type="button"
              onClick={onShortRest}
              className="flex items-center px-2 py-0.5 rounded bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 border border-purple-800/60 transition-colors text-xs font-medium"
              title="Reset Pact Magic slots on Short Rest"
            >
              <Sun size={12} className="mr-1 text-amber-400" />
              Short Rest
            </button>
          </div>

          {!isPactCollapsed && (
            <div className="max-w-xs">
              <SlotLevelRow
                level={pactSlotLevel}
                maxSlots={maxPactSlots}
                usedSlots={usedPactSlots}
                isEditingMax={false}
                onUseSlot={() => onUsePactSlot?.()}
                onRestoreSlot={() => onRestorePactSlot?.()}
                onSetSlotsUsed={(_, used) => onSetPactSlotsUsed?.(used)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
