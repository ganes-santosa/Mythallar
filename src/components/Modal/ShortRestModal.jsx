import React, { useState } from 'react';
import { Sun, Heart, Sparkles, X, RotateCcw, AlertCircle, Zap } from 'lucide-react';
import { getAbilityModifier, formatModifier } from '../../utils/dndCalculations';
import { normalizeHitDice } from '../../utils/storage';
import { getMaxArcaneRecoveryLevels, getWizardLevel } from '../../utils/spellSlots';

export default function ShortRestModal({
  isOpen,
  onClose,
  character,
  effectiveSlots = {},
  slotsUsed = {},
  onRollHitDie,
  onCompleteShortRest,
}) {
  const [manualRolls, setManualRolls] = useState({});
  const [selectedRecovery, setSelectedRecovery] = useState({});

  if (!isOpen || !character) return null;

  const classes = Array.isArray(character.classes) && character.classes.length > 0
    ? character.classes
    : [{ className: character.className || 'Wizard', level: character.level || 1 }];

  const isWizard = classes.some((c) => c.className === 'Wizard') || character.className === 'Wizard';
  const isWarlock = classes.some((c) => c.className === 'Warlock') || character.className === 'Warlock';

  const vitals = character.sheet?.vitals || {};
  const hitDice = normalizeHitDice(vitals, character);
  const conScore = character.sheet?.abilities?.con ?? 10;
  const conMod = getAbilityModifier(conScore);

  const baseMax = Number.isFinite(vitals.hpMax) ? vitals.hpMax : 10;
  const hpMaxBuff = Number.isFinite(vitals.hpMaxBuff) ? vitals.hpMaxBuff : 0;
  const effectiveMax = Math.max(1, baseMax + hpMaxBuff);
  const hpCurrent = Number.isFinite(vitals.hpCurrent) ? vitals.hpCurrent : 10;
  const hpTemp = Number.isFinite(vitals.hpTemp) ? vitals.hpTemp : 0;

  const currentHpPct = Math.min(100, Math.round((hpCurrent / effectiveMax) * 100));
  const tempHpPct = Math.min(100 - currentHpPct, Math.round((hpTemp / effectiveMax) * 100));

  // Arcane Recovery calculations
  const maxRecoveryPool = isWizard ? getMaxArcaneRecoveryLevels(character) : 0;
  const arcaneAlreadyUsed = Boolean(character.arcaneRecoveryUsed);
  const eligibleRecoveryLevels = [1, 2, 3, 4, 5].filter((lvl) => (effectiveSlots[lvl] || 0) > 0);

  const currentSlotsUsed = Object.keys(slotsUsed).length > 0 ? slotsUsed : character.slotsUsed || {};

  const recoverySelectedCost = Object.entries(selectedRecovery).reduce((sum, [lvl, count]) => {
    return sum + Number(lvl) * (Number(count) || 0);
  }, 0);
  const remainingBudget = maxRecoveryPool - recoverySelectedCost;

  const handleManualRollChange = (dieKey, value) => {
    setManualRolls((prev) => ({
      ...prev,
      [dieKey]: value,
    }));
  };

  const handleApplyManualRoll = (dieKey) => {
    const rawVal = manualRolls[dieKey];
    const parsed = parseInt(rawVal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onRollHitDie?.(dieKey, parsed);
      setManualRolls((prev) => ({ ...prev, [dieKey]: '' }));
    }
  };

  const handleIncrementRecovery = (lvl) => {
    const current = selectedRecovery[lvl] || 0;
    const expended = currentSlotsUsed[lvl] || 0;
    if (current >= expended) return;
    if (lvl > remainingBudget) return;
    setSelectedRecovery((prev) => ({
      ...prev,
      [lvl]: current + 1,
    }));
  };

  const handleDecrementRecovery = (lvl) => {
    const current = selectedRecovery[lvl] || 0;
    if (current <= 0) return;
    const nextCount = current - 1;
    setSelectedRecovery((prev) => {
      const copy = { ...prev };
      if (nextCount === 0) {
        delete copy[lvl];
      } else {
        copy[lvl] = nextCount;
      }
      return copy;
    });
  };

  const handleFinish = () => {
    onCompleteShortRest?.(selectedRecovery);
    setSelectedRecovery({});
    onClose?.();
  };

  return (
    <div
      role="dialog"
      aria-labelledby="short-rest-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-dnd-card border border-white/10 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-dnd-panel/60">
          <div className="flex items-center space-x-2">
            <Sun className="text-amber-400" size={18} />
            <h2 id="short-rest-modal-title" className="text-base font-bold text-slate-100">
              Short Rest
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Health Status Card */}
          <div className="bg-dnd-panel/70 border border-white/5 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Heart size={14} className="text-red-400 fill-red-400/20" /> Hit Points
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {formatModifier(conMod)} CON Mod
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-100">{hpCurrent}</span>
              <span className="text-xs font-semibold text-slate-400">/ {effectiveMax}</span>
              {hpTemp > 0 && (
                <span className="text-xs font-bold text-blue-400 ml-1">
                  (+{hpTemp} Temp)
                </span>
              )}
            </div>

            {/* Health Bar */}
            <div className="w-full bg-slate-950/80 h-2 rounded-full overflow-hidden border border-white/5 flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${currentHpPct}%` }}
              />
              {hpTemp > 0 && (
                <div
                  className="bg-blue-400 h-full transition-all duration-300"
                  style={{ width: `${tempHpPct}%` }}
                />
              )}
            </div>
          </div>

          {/* Hit Dice Spending Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Hit Dice Pools
              </span>
              <span className="text-[11px] text-slate-400">
                Roll die + CON mod to regain HP
              </span>
            </div>

            <div className="space-y-2">
              {Object.entries(hitDice.pools || {}).map(([dieKey, pool]) => {
                const isOutOfDice = pool.current <= 0;
                const isHpFull = hpCurrent >= effectiveMax;
                const canRoll = !isOutOfDice && !isHpFull;

                return (
                  <div
                    key={dieKey}
                    className="bg-dnd-panel/60 border border-white/5 rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-slate-200">
                          {pool.current} / {pool.max} {dieKey}
                        </span>
                        {pool.classNames?.length > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            ({pool.classNames.join(', ')})
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {isOutOfDice
                          ? 'No hit dice remaining in this pool'
                          : isHpFull
                          ? 'Hit points are already at maximum'
                          : `Heals 1${dieKey} ${formatModifier(conMod)} (min 1)`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        aria-label={`Roll 1${dieKey}`}
                        onClick={() => onRollHitDie?.(dieKey)}
                        disabled={!canRoll}
                        className="px-3 py-1.5 rounded-lg bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light disabled:opacity-40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed"
                      >
                        <Sparkles size={12} />
                        Roll 1{dieKey}
                      </button>

                      {/* Manual / Physical Roller Input */}
                      <div className="flex items-center gap-1 bg-slate-950/60 border border-white/10 rounded-lg p-0.5">
                        <input
                          type="number"
                          aria-label={`Physical Roll ${dieKey}`}
                          placeholder="Die"
                          value={manualRolls[dieKey] || ''}
                          onChange={(e) => handleManualRollChange(dieKey, e.target.value)}
                          disabled={!canRoll}
                          className="w-12 text-center bg-transparent text-xs font-mono text-slate-200 outline-none placeholder:text-slate-600 disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          aria-label={`Apply ${dieKey}`}
                          onClick={() => handleApplyManualRoll(dieKey)}
                          disabled={!canRoll || !manualRolls[dieKey]}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Embedded Arcane Recovery Section (Wizards only) */}
          {isWizard && (
            <div className="bg-dnd-panel/60 border border-white/5 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-dnd-gold" /> Arcane Recovery
                </span>
                {!arcaneAlreadyUsed && (
                  <span className="text-[11px] font-mono font-medium text-slate-400">
                    Recovery budget: <span className="font-bold text-dnd-gold">{recoverySelectedCost}</span> / {maxRecoveryPool}
                  </span>
                )}
              </div>

              {arcaneAlreadyUsed ? (
                <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>Arcane Recovery already used today (resets on Long Rest).</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-slate-400">
                    Select expended spell slots to recover (up to combined level {maxRecoveryPool}).
                  </p>
                  <div className="space-y-1 pt-1">
                    {eligibleRecoveryLevels.map((lvl) => {
                      const expended = currentSlotsUsed[lvl] || 0;
                      const selected = selectedRecovery[lvl] || 0;
                      const canIncrement = expended > selected && lvl <= remainingBudget;

                      return (
                        <div
                          key={`recovery-lvl-${lvl}`}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-950/40 border border-white/5 text-xs"
                        >
                          <span className="font-semibold text-slate-300">
                            {lvl === 1 ? '1st' : lvl === 2 ? '2nd' : lvl === 3 ? '3rd' : `${lvl}th`} Level
                          </span>

                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] text-slate-500">
                              Expended: {expended}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                aria-label={`Unstage ${lvl === 1 ? '1st' : `${lvl}th`} Level Slot`}
                                onClick={() => handleDecrementRecovery(lvl)}
                                disabled={selected <= 0}
                                className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 text-xs font-bold transition-colors cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-bold font-mono text-dnd-gold">
                                {selected}
                              </span>
                              <button
                                type="button"
                                aria-label={`Recover ${lvl === 1 ? '1st' : `${lvl}th`} Level Slot`}
                                onClick={() => handleIncrementRecovery(lvl)}
                                disabled={!canIncrement}
                                className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 text-xs font-bold transition-colors cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warlock Pact Magic Rest Notice */}
          {isWarlock && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-purple-950/30 border border-purple-500/20 text-purple-300 text-xs">
              <Zap size={14} className="text-purple-400 flex-shrink-0" />
              <span>Pact Magic slots will be restored upon completing this rest.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10 bg-dnd-panel/60">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="px-4 py-1.5 rounded-lg bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Finish Short Rest
          </button>
        </div>
      </div>
    </div>
  );
}
