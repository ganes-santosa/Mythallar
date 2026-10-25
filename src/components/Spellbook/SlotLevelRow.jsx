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
      {/* Tidy, aligned level label and count */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <span className="text-xs font-semibold text-dnd-ivory">
          {getLevelLabel(level)}
        </span>
        <span className="text-[11px] font-medium px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700/80 text-dnd-pewter">
          {remainingSlots} / {maxSlots}
        </span>
      </div>

      {/* Pips container: orderly layout */}
      <div className="flex flex-wrap gap-1.5 items-center justify-end flex-1 pl-1">
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
            className={`w-4 h-4 rounded transition-all transform active:scale-90 flex-shrink-0 ${
              isAvailable
                ? 'bg-dnd-gold border border-dnd-gold-light shadow-[0_0_6px_rgba(75,97,112,0.35)] hover:bg-[#5a7384]'
                : 'bg-slate-900 border border-slate-700/80 hover:border-slate-500'
            }`}
            title={isAvailable ? 'Click to expend slot' : 'Click to restore slot'}
          />
        ))}
      </div>

      {/* Edit max controls */}
      {isEditingMax && (
        <div className="flex items-center space-x-1 pl-1.5 border-l border-dnd-border">
          <button
            type="button"
            aria-label={`Decrease max ${getLevelLabel(level)} slots`}
            onClick={() => onUpdateMaxSlot(level, Math.max(0, maxSlots - 1))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <Minus size={12} />
          </button>
          <button
            type="button"
            aria-label={`Increase max ${getLevelLabel(level)} slots`}
            onClick={() => onUpdateMaxSlot(level, maxSlots + 1)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <Plus size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
