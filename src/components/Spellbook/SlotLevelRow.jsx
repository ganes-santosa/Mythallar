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
    if (isAvailable) {
      onUseSlot(level);
    } else {
      onRestoreSlot(level);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-dnd-card border border-dnd-border">
      {/* Persistent Left Column: Level Label, Count, and Edit Controls underneath */}
      <div className="flex flex-col items-start justify-center flex-shrink-0 min-w-[76px]">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-semibold text-dnd-ivory">
            {getLevelLabel(level)}
          </span>
          <span className="text-[11px] font-medium px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700/80 text-dnd-pewter">
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

      {/* Pips container: 4-pointed stars with generous clickable hitbox */}
      <div className="flex flex-wrap gap-1 items-center justify-end flex-1 pl-1">
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
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-800/80 active:scale-90 transition-all flex-shrink-0"
            title={isAvailable ? 'Click to expend slot' : 'Click to restore slot'}
          >
            {/* Four-pointed star SVG */}
            <svg
              viewBox="0 0 24 24"
              className={`w-5 h-5 transition-all ${
                isAvailable
                  ? 'text-dnd-gold drop-shadow-[0_0_5px_rgba(75,97,112,0.7)]'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
              fill={isAvailable ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={isAvailable ? '0.75' : '1.75'}
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
