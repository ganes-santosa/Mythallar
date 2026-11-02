import React, { useState } from 'react';
import { Sun, Heart, Sparkles, X, AlertCircle, Zap } from 'lucide-react';
import { getAbilityModifier, formatModifier } from '../../utils/dndCalculations';
import { normalizeHitDice } from '../../utils/storage';
import { getMaxArcaneRecoveryLevels, getWizardLevel } from '../../utils/spellSlots';
import { SlotPipStar } from './ArcaneRecoveryModal';

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
  const isHpFull = hpCurrent >= effectiveMax;

  const currentHpPct = Math.min(100, Math.round((hpCurrent / effectiveMax) * 100));
  const tempHpPct = Math.min(100 - currentHpPct, Math.round((hpTemp / effectiveMax) * 100));

  // Arcane Recovery calculations
  const wizardLevel = isWizard ? getWizardLevel(character) : 0;
  const maxRecoveryPool = isWizard ? getMaxArcaneRecoveryLevels(character) : 0;
  const arcaneAlreadyUsed = Boolean(character.arcaneRecoveryUsed);
  const eligibleRecoveryLevels = [1, 2, 3, 4, 5].filter((lvl) => (effectiveSlots[lvl] || 0) > 0);

  const currentSlotsUsed = Object.keys(slotsUsed).length > 0 ? slotsUsed : character.slotsUsed || {};

  const recoverySelectedCost = Object.entries(selectedRecovery).reduce((sum, [lvl, count]) => {
    return sum + Number(lvl) * (Number(count) || 0);
  }, 0);
  const remainingBudget = maxRecoveryPool - recoverySelectedCost;
  const hasAnyExpendedSlots = eligibleRecoveryLevels.some((lvl) => (currentSlotsUsed[lvl] || 0) > 0);

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
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
    >
      <div className="bg-dnd-card rounded-2xl p-4 sm:p-5 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-dnd-panel text-amber-400">
              <Sun size={18} />
            </span>
            <div>
              <h3 id="short-rest-modal-title" className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight font-display">
                Short Rest
              </h3>
              <p className="text-xs text-slate-400">
                Spend hit dice to heal • Recover class features
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            title="Close modal"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="space-y-3.5 overflow-y-auto flex-1 pr-0.5">
          {/* Health Summary Card */}
          <div className="bg-dnd-panel/60 border border-white/5 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Heart size={14} className="text-red-400 fill-red-400/20" /> Hit Points
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {formatModifier(conMod)} CON Mod
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-100">{hpCurrent}</span>
              <span className="text-xs text-slate-400">/ {effectiveMax}</span>
              {hpTemp > 0 && (
                <span className="text-xs font-semibold text-blue-400 ml-1">
                  (+{hpTemp} Temp)
                </span>
              )}
              {isHpFull && (
                <span className="text-xs font-semibold text-emerald-400 ml-auto">
                  Full Health
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

          {/* Hit Dice Rolling Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-0.5">
              <span>Hit Dice</span>
              <span className="text-[11px] text-slate-400">
                Roll or enter physical dice + {formatModifier(conMod)} CON mod
              </span>
            </div>

            <div className="space-y-1.5">
              {Object.entries(hitDice.pools || {}).map(([dieKey, pool]) => {
                const canRoll = pool.current > 0 && !isHpFull;

                return (
                  <div
                    key={dieKey}
                    className="flex items-center justify-between p-2 rounded-lg bg-dnd-panel/40 border border-white/5 text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-slate-200">
                        {dieKey}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({pool.current} / {pool.max} {dieKey})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        aria-label={`Roll 1${dieKey}`}
                        onClick={() => onRollHitDie?.(dieKey)}
                        disabled={!canRoll}
                        className="px-2.5 py-1 rounded bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light disabled:opacity-30 disabled:pointer-events-none font-bold text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                      >
                        <Sparkles size={11} />
                        Roll 1{dieKey}
                      </button>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          aria-label={`Physical Roll ${dieKey}`}
                          placeholder="Die"
                          value={manualRolls[dieKey] || ''}
                          onChange={(e) => handleManualRollChange(dieKey, e.target.value)}
                          disabled={!canRoll}
                          className="w-11 text-center bg-dnd-card border border-white/10 rounded px-1 py-0.5 text-xs text-slate-200 outline-none focus:border-dnd-gold/60 placeholder:text-slate-500 disabled:opacity-30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          aria-label={`Apply ${dieKey}`}
                          onClick={() => handleApplyManualRoll(dieKey)}
                          disabled={!canRoll || !manualRolls[dieKey]}
                          className="px-2 py-1 rounded bg-dnd-card hover:bg-dnd-hover disabled:opacity-30 disabled:pointer-events-none text-[11px] font-semibold text-slate-300 transition-colors cursor-pointer"
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
            <div className="space-y-2.5 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="p-1 rounded-md bg-dnd-panel text-dnd-gold">
                    <Sparkles size={15} />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-dnd-ivory font-display leading-tight">
                      Arcane Recovery
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Short Rest • Level {wizardLevel} Wizard (Max {maxRecoveryPool} slot level{maxRecoveryPool === 1 ? '' : 's'})
                    </p>
                  </div>
                </div>
              </div>

              {arcaneAlreadyUsed ? (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <p className="font-semibold">Already used today</p>
                    <p className="text-[11px] text-amber-400/80">
                      Arcane Recovery already used today (resets on Long Rest).
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-dnd-panel/60 border border-white/5 text-xs">
                    <span className="text-slate-300 font-semibold text-xs">Recovery Budget:</span>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-sm ${remainingBudget === 0 ? 'text-amber-400' : 'text-dnd-gold'}`}>
                        {recoverySelectedCost} / {maxRecoveryPool} levels
                      </span>
                      <span className="text-[11px] text-slate-400">({remainingBudget} left)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {!hasAnyExpendedSlots ? (
                      <p className="text-xs text-slate-400 text-center py-3 italic">
                        No expended spell slots of 5th level or lower to recover.
                      </p>
                    ) : (
                      eligibleRecoveryLevels.map((lvl) => {
                        const total = effectiveSlots[lvl] || 0;
                        const expended = currentSlotsUsed[lvl] || 0;
                        const recovering = selectedRecovery[lvl] || 0;
                        const available = Math.max(0, total - expended);
                        const canAdd = expended > recovering && remainingBudget >= lvl;

                        const stars = [];
                        for (let i = 0; i < total; i++) {
                          if (i < available) {
                            stars.push('available');
                          } else if (i < available + recovering) {
                            stars.push('recovering');
                          } else {
                            stars.push('expended');
                          }
                        }

                        return (
                          <div
                            key={lvl}
                            className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-dnd-panel/40 border border-white/5 text-xs gap-2"
                          >
                            <span className="font-bold text-sm text-slate-100 w-16 sm:w-20 flex-shrink-0">
                              Level {lvl}
                            </span>

                            {/* Stars visualization */}
                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              {stars.map((status, idx) => (
                                <SlotPipStar key={idx} status={status} />
                              ))}
                            </div>

                            {/* Availability / Recovery indicator */}
                            <div className="flex-1 text-right text-xs text-slate-400 truncate px-2">
                              {recovering > 0 ? (
                                <>
                                  <span className="text-dnd-gold font-medium">+{recovering}</span>{' '}
                                  <span className="text-slate-400">({available + recovering}/{total})</span>
                                </>
                              ) : (
                                `${available}/${total} available`
                              )}
                            </div>

                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <button
                                type="button"
                                aria-label={`Decrease recovered level ${lvl} slots`}
                                onClick={() => handleDecrementRecovery(lvl)}
                                disabled={recovering <= 0}
                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors text-base font-semibold cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-4 text-center font-bold text-sm text-dnd-gold">{recovering}</span>
                              <button
                                type="button"
                                aria-label={`Increase recovered level ${lvl} slots`}
                                onClick={() => handleIncrementRecovery(lvl)}
                                disabled={!canAdd}
                                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors text-sm font-bold cursor-pointer ${
                                  canAdd
                                    ? 'bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light shadow-sm'
                                    : 'text-slate-500 opacity-30 pointer-events-none'
                                }`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Warlock Pact Magic Rest Notice */}
          {isWarlock && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/20 text-purple-300 text-xs">
              <Zap size={14} className="text-purple-400 flex-shrink-0" />
              <span>Pact Magic slots will be restored upon completing this rest.</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
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
