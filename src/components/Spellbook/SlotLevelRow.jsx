import React from 'react';
import { Plus, Minus } from 'lucide-react';

function getLevelLabel(level) {
  const ordinals = ['th', 'st', 'nd', 'rd'];
  const v = level % 100;
  const ord = ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0];
  return `${level}${ord} Level`;
}

export default function SlotLevelRow({
  level,
  maxSlots,
  usedSlots = 0,
  isEditingMax,
  onUseSlot,
  onRestoreSlot,
  onSetSlotsUsed,
  onUpdateMaxSlot,
}) {
  const remainingSlots = Math.max(0, maxSlots - usedSlots);

  // Array of pips: index 0 to maxSlots - 1
  // If index < remainingSlots -> available (filled)
  // Else -> expended (empty)
  const pips = [];
  for (let i = 0; i < maxSlots; i++) {
    const isAvailable = i < remainingSlots;
    pips.push(isAvailable);
  }

  const handlePipClick = (index, isAvailable) => {
    // Directly sets the remaining slot count to clicked pip (1-indexed).
    // If clicking current boundary star, toggles down by 1.
    const targetRemaining = remainingSlots === index + 1 ? index : index + 1;
    const newUsed = Math.max(0, maxSlots - targetRemaining);

    if (onSetSlotsUsed) {
      onSetSlotsUsed(level, newUsed);
    } else if (isAvailable) {
      onUseSlot?.(level);
    } else {
      onRestoreSlot?.(level);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-dnd-card border border-dnd-border">
      {/* Persistent Left Column: Level Label, Count, and Edit Controls underneath */}
      <div className="flex flex-col items-start justify-center flex-shrink-0 w-[100px]">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-semibold text-dnd-ivory">
            {getLevelLabel(level)}
          </span>
          <span className="text-[11px] font-medium px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700/80 text-dnd-pewter tabular-nums">
            {remainingSlots} / {maxSlots}
          </span>
        </div>

        {/* Persistent edit buttons under text so position never jumps */}
        {isEditingMax && (
          <div className="flex items-center space-x-1 mt-1">
            <button
              type="button"
              aria-label={`Decrease max ${getLevelLabel(level)} slots`}
              onClick={() => onUpdateMaxSlot(level, Math.max(0, maxSlots - 1))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-dnd-gold transition-colors"
              title="Decrease max slots"
            >
              <Minus size={11} />
            </button>
            <button
              type="button"
              aria-label={`Increase max ${getLevelLabel(level)} slots`}
              onClick={() => onUpdateMaxSlot(level, maxSlots + 1)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-dnd-gold transition-colors"
              title="Increase max slots"
            >
              <Plus size={11} />
            </button>
          </div>
        )}
      </div>

      {/* Pips container: 4-pointed stars aligned left */}
      <div className="flex flex-wrap gap-1 items-center justify-start flex-1 px-1.5">
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
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-800/80 active:scale-95 flex-shrink-0"
            title={`Set ${getLevelLabel(level)} slots to ${idx + 1}`}
          >
            {/* Four-pointed star SVG: instant color update without transition lag */}
            <svg
              viewBox="0 0 24 24"
              className={`w-3.5 h-3.5 ${
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
