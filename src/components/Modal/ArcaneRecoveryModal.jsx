import React, { useState } from 'react';
import { Sparkles, X, Check, RotateCcw, AlertCircle } from 'lucide-react';
import { getMaxArcaneRecoveryLevels, getWizardLevel } from '../../utils/spellSlots';

/**
 * ArcaneRecoveryModal: D&D 5e Arcane Recovery on Short Rest.
 * Wizard recovers spell slots with a combined level <= ceil(wizardLevel / 2).
 * Slots recovered must be 5th level or lower. Once per long rest.
 */
function SlotPipStar({ status }) {
  // status: 'available' | 'recovering' | 'expended'
  const isAvailable = status === 'available';
  const isRecovering = status === 'recovering';

  let colorClasses = 'text-slate-700';
  let fill = 'none';

  if (isAvailable) {
    colorClasses = 'text-slate-500';
    fill = 'currentColor';
  } else if (isRecovering) {
    colorClasses = 'text-dnd-stars drop-shadow-[0_0_6px_currentColor] animate-pulse';
    fill = 'currentColor';
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-3.5 h-3.5 transition-all flex-shrink-0 ${colorClasses}`}
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6Z" />
    </svg>
  );
}
export default function ArcaneRecoveryModal({
  isOpen,
  onClose,
  character,
  effectiveSlots,
  slotsUsed,
  onRecoverSlots,
  onResetUsedFlag,
}) {
  const [selectedRecovery, setSelectedRecovery] = useState({});

  if (!isOpen || !character) return null;

  const wizardLevel = getWizardLevel(character);
  const maxPool = getMaxArcaneRecoveryLevels(character);
  const alreadyUsed = Boolean(character.arcaneRecoveryUsed);

  // Eligible levels: 1 to 5, only if the character has max slots for that level
  const eligibleLevels = [1, 2, 3, 4, 5].filter((lvl) => (effectiveSlots[lvl] || 0) > 0);

  // Current selected budget cost
  const selectedCost = Object.entries(selectedRecovery).reduce((sum, [lvl, count]) => {
    return sum + Number(lvl) * (Number(count) || 0);
  }, 0);

  const remainingBudget = maxPool - selectedCost;

  const handleIncrement = (lvl) => {
    const current = selectedRecovery[lvl] || 0;
    const expended = slotsUsed[lvl] || 0;
    // Cannot recover more than currently expended
    if (current >= expended) return;
    // Cannot exceed budget
    if (lvl > remainingBudget) return;
    setSelectedRecovery((prev) => ({
      ...prev,
      [lvl]: current + 1,
    }));
  };

  const handleDecrement = (lvl) => {
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

  const handleConfirm = () => {
    if (selectedCost === 0 && !alreadyUsed) {
      onClose();
      return;
    }
    onRecoverSlots(selectedRecovery);
    setSelectedRecovery({});
    onClose();
  };

  const hasAnyExpendedSlots = eligibleLevels.some((lvl) => (slotsUsed[lvl] || 0) > 0);

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-dnd-card rounded-2xl p-4 sm:p-5 max-w-md w-full shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-dnd-panel text-dnd-gold">
              <Sparkles size={18} />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight font-display">
                Arcane Recovery
              </h3>
              <p className="text-xs text-slate-400">
                Short Rest • Level {wizardLevel} Wizard (Max {maxPool} slot level{maxPool === 1 ? '' : 's'})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
            title="Close modal"
            aria-label="Close Arcane Recovery"
          >
            <X size={16} />
          </button>
        </div>

        {/* Once per long rest warning / status */}
        {alreadyUsed ? (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-start justify-between space-x-2">
            <div className="flex items-start space-x-2">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-semibold">Already used today</p>
                <p className="text-[11px] text-amber-400/80">
                  Arcane Recovery can only be used once per day between long rests.
                </p>
              </div>
            </div>
            {onResetUsedFlag && (
              <button
                type="button"
                onClick={onResetUsedFlag}
                className="px-2 py-1 rounded bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 text-[10px] font-medium transition-colors flex-shrink-0"
                title="Manually reset usage"
              >
                Reset
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-dnd-panel/60 text-xs">
            <span className="text-slate-300 font-medium">Recovery Budget:</span>
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-sm ${remainingBudget === 0 ? 'text-amber-400' : 'text-dnd-gold'}`}>
                {selectedCost} / {maxPool} levels
              </span>
              <span className="text-[11px] text-slate-400">({remainingBudget} left)</span>
            </div>
          </div>
        )}

        {/* Slot Selection Rows */}
        {!alreadyUsed && (
          <div className="space-y-2">
            {!hasAnyExpendedSlots ? (
              <p className="text-xs text-slate-400 text-center py-4 italic">
                No expended spell slots of 5th level or lower to recover.
              </p>
            ) : (
              eligibleLevels.map((lvl) => {
                const total = effectiveSlots[lvl] || 0;
                const expended = slotsUsed[lvl] || 0;
                const recovering = selectedRecovery[lvl] || 0;
                const available = Math.max(0, total - expended);
                const canAdd = expended > recovering && remainingBudget >= lvl;

                // Build status array of length `total`
                // 1..available: 'available' (current available slots)
                // available+1..available+recovering: 'recovering' (newly recovering slots)
                // rest: 'expended' (still expended)
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
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-dnd-panel/40 border border-white/5 text-xs gap-2"
                  >
                    <span className="font-semibold text-slate-200 w-14 sm:w-16 flex-shrink-0">
                      Level {lvl}
                    </span>

                    {/* Stars visualization */}
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {stars.map((status, idx) => (
                        <SlotPipStar key={idx} status={status} />
                      ))}
                    </div>

                    {/* Availability / Recovery indicator */}
                    <div className="flex-1 text-right text-[10px] text-slate-400 truncate px-1">
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
                        onClick={() => handleDecrement(lvl)}
                        disabled={recovering <= 0}
                        className="w-6 h-6 rounded flex items-center justify-center bg-dnd-card text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors text-sm font-semibold"
                      >
                        -
                      </button>
                      <span className="w-3.5 text-center font-bold text-dnd-gold">{recovering}</span>
                      <button
                        type="button"
                        aria-label={`Increase recovered level ${lvl} slots`}
                        onClick={() => handleIncrement(lvl)}
                        disabled={!canAdd}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors text-sm font-bold ${
                          canAdd
                            ? 'bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light shadow-sm'
                            : 'bg-dnd-card text-slate-300 opacity-30 pointer-events-none'
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
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          {!alreadyUsed && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedCost === 0}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Check size={13} />
              <span>Recover Slots</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
