import React, { useState } from 'react';
import { User, X, Feather } from 'lucide-react';

export const DND_CLASSES = [
  'Artificer',
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
];

export default function CreateCharacterModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('Wizard');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate({ name: trimmed, className });
    setName('');
    setClassName('Wizard');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-dnd-card rounded-2xl p-4 sm:p-5 max-w-md w-full shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-dnd-panel text-dnd-gold">
              <User size={18} />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight font-display">
                Create Character
              </h3>
              <p className="text-xs text-slate-400">
                Adventure awaits
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
              title="Close modal"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="character-name-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Character Name
            </label>
            <input
              id="character-name-input"
              type="text"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gale of Waterdeep"
              className="w-full bg-dnd-panel rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold transition-colors"
            />
          </div>

          <div>
            <label htmlFor="character-class-select" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Starting Class (Level 1)
            </label>
            <select
              id="character-class-select"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full bg-dnd-panel rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-dnd-gold transition-colors cursor-pointer"
            >
              {DND_CLASSES.map((cls) => (
                <option key={cls} value={cls} className="bg-dnd-panel">
                  {cls}
                </option>
              ))}
            </select>
            {/* ponytail: Simple class selector for now. Upgrade to rich race/subclass/ability-score builder when full creator arrives. */}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-dnd-gold hover:bg-dnd-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <Feather size={13} />
              <span>Create Character</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
