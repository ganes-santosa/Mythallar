import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Settings2,
  Sparkles,
  Check,
  X,
  ChevronDown,
  HelpCircle,
  Flame,
  RotateCcw,
} from 'lucide-react';
import {
  getEffectiveMaxSlots,
  calculateMulticlassSpellSlots,
  isWizardCharacter,
} from '../../utils/spellSlots';
import SlotLevelRow from './SlotLevelRow';
import useClickOutside from '../../hooks/useClickOutside';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';
import ArcaneRecoveryModal from '../Modal/ArcaneRecoveryModal';

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
  onArcaneRecovery,
  onResetArcaneRecoveryUsed,
  onUpdateCharacter,
}) {
  const [isEditingMax, setIsEditingMax] = useState(false);
  const [showArcaneModal, setShowArcaneModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPactCollapsed, setIsPactCollapsed] = useState(false);

  const { armed: longRestArmed, handleClick: handleLongRestClick } = useTwoClickConfirm(onLongRest);
  const { armed: pactRestArmed, handleClick: handlePactRestClick } = useTwoClickConfirm(onShortRest);
  const { armed: shortRestArmed, handleClick: handleShortRestClick } = useTwoClickConfirm(onShortRest);

  // Hints popovers
  const [showSlotsHint, setShowSlotsHint] = useState(false);
  const [showPactHint, setShowPactHint] = useState(false);
  const slotsHintRef = useClickOutside(showSlotsHint, () => setShowSlotsHint(false));
  const pactHintRef = useClickOutside(showPactHint, () => setShowPactHint(false));

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

  return (
    <div className="p-2.5 mb-2.5 rounded-lg bg-dnd-panel transition-all space-y-2">
      {/* ================= SHARED SPELL SLOTS SECTION ================= */}
      <div>
        {/* Header / Accordion Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-2">
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
            <div ref={slotsHintRef} className="relative">
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
                <div className="absolute left-0 top-6 z-30 w-64 p-2.5 rounded-lg bg-dnd-card shadow-xl text-xs text-slate-200 animate-in fade-in ring-1 ring-white/10">
                  <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-white/5">
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
                      <div className="pt-1 mt-1 border-t border-white/5 flex justify-between font-semibold text-dnd-gold">
                        <span>Total Caster Level:</span>
                        <span>{multiclassInfo.casterLevel}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            {/* Edit Max Slots Toggle / Done (Icon-only) */}
            {isEditingMax ? (
              <button
                type="button"
                aria-label="Done editing max slots"
                onClick={() => setIsEditingMax(false)}
                className="p-1 rounded-md bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light transition-colors shadow-sm"
                title="Done editing max slots"
              >
                <Check size={13} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Edit maximum spell slots"
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false);
                  setIsEditingMax(true);
                }}
                className="p-1 rounded-md bg-dnd-card hover:bg-dnd-hover text-slate-400 hover:text-dnd-gold transition-colors"
                title="Edit maximum spell slots"
              >
                <Settings2 size={13} />
              </button>
            )}

            {/* Short Rest / Arcane Recovery Button */}
            {isWizardCharacter(character) ? (
              <button
                type="button"
                aria-label="Short Rest Arcane Recovery"
                onClick={() => setShowArcaneModal(true)}
                className="flex items-center px-2 py-0.5 rounded bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 transition-colors font-medium text-xs"
                title="Short Rest (Arcane Recovery)"
              >
                <Sun size={12} className="mr-1 text-amber-400" />
                Short Rest
              </button>
            ) : (
              <button
                type="button"
                aria-label={shortRestArmed ? 'Click again to confirm Short Rest' : 'Short Rest'}
                onClick={handleShortRestClick}
                className={`flex items-center px-2 py-0.5 rounded transition-colors font-medium text-xs ${
                  shortRestArmed
                    ? 'text-green-400 bg-green-950/70 ring-1 ring-green-400/70'
                    : 'bg-purple-950/40 hover:bg-purple-900/60 text-purple-200'
                }`}
                title={shortRestArmed ? 'Click again to confirm Short Rest' : 'Short Rest'}
              >
                <Sun size={12} className={`mr-1 ${shortRestArmed ? 'text-green-400' : 'text-amber-400'}`} />
                Short Rest
              </button>
            )}

            {/* Long Rest with two-click confirmation */}
            <button
              type="button"
              aria-label={longRestArmed ? 'Click again to confirm Long Rest' : 'Long Rest'}
              onClick={handleLongRestClick}
              className={`flex items-center px-2 py-0.5 rounded transition-colors font-medium ${
                longRestArmed
                  ? 'text-green-400 bg-green-950/70 ring-1 ring-green-400/70'
                  : 'bg-blue-950/40 hover:bg-blue-900/60 text-blue-300'
              }`}
              title={longRestArmed ? 'Click again to confirm Long Rest' : 'Reset all spell slots on Long Rest'}
            >
              <Moon size={12} className={`mr-1 ${longRestArmed ? 'text-green-400' : 'text-blue-400'}`} />
              Long Rest
            </button>
          </div>
        </div>

        {/* Rows Grid (Collapsible Accordion Body) */}
        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
            !isCollapsed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="pt-2">
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
          </div>
        </div>
      </div>

      {/* ================= PACT MAGIC ACCORDION (WARLOCK) ================= */}
      {hasPactMagic && (
        <div className="pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
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
              <div ref={pactHintRef} className="relative">
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
                  <div className="absolute left-0 top-6 z-30 w-56 p-2.5 rounded-lg bg-dnd-card shadow-xl text-xs text-slate-200 animate-in fade-in ring-1 ring-white/10">
                    <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-white/5">
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
              aria-label={pactRestArmed ? 'Click again to confirm Short Rest' : 'Reset Pact Magic slots on Short Rest'}
              onClick={handlePactRestClick}
              className={`flex items-center px-2 py-0.5 rounded transition-colors text-xs font-medium ${
                pactRestArmed
                  ? 'text-green-400 bg-green-950/70 ring-1 ring-green-400/70'
                  : 'bg-purple-950/40 hover:bg-purple-900/60 text-purple-200'
              }`}
              title={pactRestArmed ? 'Click again to confirm Short Rest' : 'Reset Pact Magic slots on Short Rest'}
            >
              <Sun size={12} className={`mr-1 ${pactRestArmed ? 'text-green-400' : 'text-amber-400'}`} />
              Short Rest
            </button>
          </div>

          <div
            className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
              !isPactCollapsed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div className="pt-2">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2">
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Arcane Recovery Modal */}
      {showArcaneModal && (
        <ArcaneRecoveryModal
          isOpen={showArcaneModal}
          onClose={() => setShowArcaneModal(false)}
          character={character}
          effectiveSlots={effectiveSlots}
          slotsUsed={character?.slotsUsed || {}}
          onRecoverSlots={(recovered) => onArcaneRecovery?.(recovered)}
          onResetUsedFlag={() => onResetArcaneRecoveryUsed?.()}
        />
      )}
    </div>
  );
}



