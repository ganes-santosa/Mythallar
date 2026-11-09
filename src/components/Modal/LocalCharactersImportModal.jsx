import React, { useState, useEffect } from 'react';
import { CloudUpload, Check } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { getTotalCharacterLevel, getCharacterClasses } from '../../utils/spellSlots';

export default function LocalCharactersImportModal({ isOpen, characters = [], onConfirm, onKeepLocal }) {
  const [selected, setSelected] = useState(() => new Set(characters.map((c) => c.id)));

  // Re-select everything whenever a new set of candidates is offered.
  const key = characters.map((c) => c.id).join('|');
  useEffect(() => {
    setSelected(new Set(characters.map((c) => c.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const handleConfirm = () => {
    onConfirm?.(characters.filter((c) => selected.has(c.id)).map((c) => c.id));
  };

  useScrollLock(isOpen && characters.length > 0);

  if (!isOpen || characters.length === 0) return null;

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const count = characters.length;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in overscroll-contain">
      <div className="bg-dnd-card rounded-2xl p-4 sm:p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <span className="p-1.5 rounded-lg bg-dnd-panel text-dnd-gold">
            <CloudUpload size={18} />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight font-display">
              Add {count} Local {count === 1 ? 'Character' : 'Characters'} To Your Account?
            </h3>
            <p className="text-xs text-slate-400">
              Unchecked characters stay on this device and keep working. Sync them later from the character manager.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 p-1">
          {characters.map((c) => {
            const classes = getCharacterClasses(c).map((k) => `${k.className} ${k.level}`).join(' / ');
            const checked = selected.has(c.id);
            return (
              <label
                key={c.id}
                className={`flex items-center space-x-3 p-2.5 rounded-xl cursor-pointer transition-colors ${checked ? 'bg-dnd-panel/90' : 'bg-dnd-panel/40 hover:bg-dnd-panel/70'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(c.id)}
                  aria-label={`${c.name} ${classes}`}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${checked ? 'bg-dnd-gold text-slate-950' : 'bg-dnd-card'}`}
                >
                  {checked && <Check size={12} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-100 truncate font-display">{c.name}</span>
                  <span className="block text-xs text-slate-400">
                    {classes} · Lvl {getTotalCharacterLevel(c)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-end space-x-2 flex-shrink-0">
          <button
            type="button"
            onClick={onKeepLocal}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-dnd-panel/70 hover:bg-dnd-panel text-slate-200 transition-colors cursor-pointer"
          >
            Keep All Local
          </button>
          <button
            type="button"
            disabled={selected.size === 0}
            onClick={handleConfirm}
            aria-label="Add Selected To Account"
            title="Add Selected To Account"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-dnd-gold hover:bg-dnd-gold-light text-slate-950"
          >
            <CloudUpload size={13} />
            <span>Add Selected To Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
