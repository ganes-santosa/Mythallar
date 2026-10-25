import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

function getLevelLabel(level) {
  const ordinals = ['th', 'st', 'nd', 'rd'];
  const v = level % 100;
  const ord = ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0];
  return `${level}${ord} Level`;
}

export default function SlotLevelRow({
  level,
  maxSlots = 0,
  usedSlots = 0,
  isEditingMax,
  onUseSlot,
  onRestoreSlot,
  onSetSlotsUsed,
  onUpdateMaxSlot,
  onResetMaxSlot,
}) {
  const safeMax = Number.isFinite(maxSlots) ? Math.max(0, maxSlots) : 0;
  const safeUsed = Number.isFinite(usedSlots) ? Math.max(0, usedSlots) : 0;
  const remainingSlots = Math.max(0, safeMax - safeUsed);

  // Array of pips: index 0 to safeMax - 1
  // If index < remainingSlots -> available (filled)
  // Else -> expended (empty)
  const pips = [];
  for (let i = 0; i < safeMax; i++) {
    const isAvailable = i < remainingSlots;
    pips.push(isAvailable);
  }

  const handlePipClick = (index, isAvailable) => {
    // Directly sets the remaining slot count to clicked pip (1-indexed).
    // If clicking current boundary star, toggles down by 1.
    const targetRemaining = remainingSlots === index + 1 ? index : index + 1;
    const newUsed = Math.max(0, safeMax - targetRemaining);

    if (onSetSlotsUsed) {
      onSetSlotsUsed(level, newUsed);
    } else if (isAvailable) {
      onUseSlot?.(level);
    } else {
      onRestoreSlot?.(level);
    }
  };

  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg bg-dnd-card border border-dnd-border min-w-0">
      {/* Persistent Left Column: Level Label, Count, and Edit Controls underneath */}
      <div className="flex flex-col items-start justify-center flex-shrink-0 min-w-[95px] sm:min-w-[105px]">
        <div className="flex items-center space-x-1 sm:space-x-1.5 whitespace-nowrap">
          <span className="text-xs font-semibold text-dnd-ivory whitespace-nowrap">
            {getLevelLabel(level)}
          </span>
          {isEditingMax ? (
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-dnd-pewter tabular-nums">
                {remainingSlots} /
              </span>
              <input
                type="number"
                min="0"
                max="20"
                value={safeMax}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onUpdateMaxSlot?.(level, isNaN(val) ? 0 : Math.max(0, val));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.target.blur();
                }}
                aria-label={`Max ${getLevelLabel(level)} slots`}
                className="w-9 bg-slate-950 border border-dnd-gold rounded px-1 py-0 text-center text-xs text-dnd-gold font-medium focus:outline-none"
              />
            </div>
          ) : (
            <span className="text-[10px] sm:text-[11px] font-medium px-1 sm:px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700/80 text-dnd-pewter tabular-nums whitespace-nowrap">
              {remainingSlots} / {safeMax}
            </span>
          )}
        </div>

        {/* Persistent edit buttons under text so position never jumps */}
        {isEditingMax && (
          <div className="flex items-center space-x-0.5 mt-1">
            <button
              type="button"
              aria-label={`Decrease max ${getLevelLabel(level)} slots`}
              onClick={() => onUpdateMaxSlot(level, Math.max(0, safeMax - 1))}
              className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-dnd-gold transition-colors"
              title="Decrease max slots"
            >
              <Minus size={10} />
            </button>
            <button
              type="button"
              aria-label={`Increase max ${getLevelLabel(level)} slots`}
              onClick={() => onUpdateMaxSlot(level, safeMax + 1)}
              className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-dnd-gold transition-colors"
              title="Increase max slots"
            >
              <Plus size={10} />
            </button>
            {onResetMaxSlot && (
              <button
                type="button"
                aria-label={`Reset max ${getLevelLabel(level)} slots to default`}
                onClick={() => onResetMaxSlot(level)}
                className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-dnd-gold transition-colors"
                title="Reset to 5e rules"
              >
                <RotateCcw size={10} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pips container: 4-pointed stars arranged in a compact 4-column grid */}
      <div className="grid grid-cols-4 gap-0.5 sm:gap-1 items-center justify-items-center flex-shrink-0">
        {pips.map((isAvailable, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={
              isAvailable
                ? `Use ${getLevelLabel(level)} slot`
                : `Restore ${getLevelLabel(level)} slot`
            }
            onClick={() => handlePipClick(idx, isAvailable)}
            className="w-[18px] h-[18px] sm:w-5 sm:h-5 flex items-center justify-center rounded hover:bg-slate-800/80 active:scale-95 flex-shrink-0"
            title={`Set ${getLevelLabel(level)} slots to ${idx + 1}`}
          >
            {/* Four-pointed star SVG: instant color update without transition lag */}
            <svg
              viewBox="0 0 24 24"
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                isAvailable
                  ? 'text-dnd-gold drop-shadow-[0_0_4px_rgba(75,97,112,0.6)]'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
              fill={isAvailable ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            >
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6Z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
