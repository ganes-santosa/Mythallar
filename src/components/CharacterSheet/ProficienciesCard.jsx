import React, { useState } from 'react';
import { Shield, Sword, Wrench, Languages, X, Plus } from 'lucide-react';

const CATEGORIES = [
  { key: 'armor', label: 'Armor', icon: Shield, placeholder: 'e.g. Shields' },
  { key: 'weapons', label: 'Weapons', icon: Sword, placeholder: 'e.g. Simple Weapons' },
  { key: 'tools', label: 'Tools', icon: Wrench, placeholder: "e.g. Thieves' Tools" },
  { key: 'languages', label: 'Languages', icon: Languages, placeholder: 'e.g. Draconic' },
];

export default function ProficienciesCard({ proficiencies = {}, onUpdateProficiencies }) {
  const currentProf = proficiencies || {
    armor: [],
    weapons: [],
    tools: [],
    languages: [],
  };

  const [activeCategory, setActiveCategory] = useState(null);
  const [newVal, setNewVal] = useState('');

  const handleAdd = (catKey) => {
    if (!newVal.trim()) return;
    const existing = currentProf[catKey] || [];
    onUpdateProficiencies?.({
      ...currentProf,
      [catKey]: [...existing, newVal.trim()],
    });
    setNewVal('');
    setActiveCategory(null);
  };

  const handleRemove = (catKey, item) => {
    const existing = currentProf[catKey] || [];
    onUpdateProficiencies?.({
      ...currentProf,
      [catKey]: existing.filter((i) => i !== item),
    });
  };

  return (
    <div className="rounded-lg bg-dnd-card p-3 border border-white/5 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between pb-1 border-b border-white/5 text-xs">
        <span className="font-semibold text-dnd-pewter uppercase tracking-wider">
          Proficiencies & Training
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {CATEGORIES.map(({ key, label, icon: Icon, placeholder }) => {
          const items = currentProf[key] || [];
          const isAdding = activeCategory === key;

          return (
            <div
              key={key}
              className="bg-dnd-panel/70 p-2.5 rounded border border-white/5 space-y-1.5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                  <Icon size={12} className="text-dnd-gold" />
                  <span>{label}</span>
                </span>
                <button
                  type="button"
                  aria-label={`Add ${key} proficiency`}
                  onClick={() => {
                    setActiveCategory(isAdding ? null : key);
                    setNewVal('');
                  }}
                  className="text-[10px] text-dnd-gold hover:text-dnd-gold-light font-medium"
                >
                  + Add
                </button>
              </div>

              {isAdding && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAdd(key);
                  }}
                  className="flex items-center space-x-1 pt-1"
                >
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    autoFocus
                    className="flex-1 px-1.5 py-0.5 rounded bg-black/30 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-dnd-gold"
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 rounded bg-dnd-gold text-slate-950 font-bold text-[11px]"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className="px-1 py-0.5 rounded text-slate-400 hover:text-white text-[11px]"
                  >
                    Cancel
                  </button>
                </form>
              )}

              <div className="flex flex-wrap gap-1 min-h-[22px]">
                {items.length === 0 && !isAdding && (
                  <span className="text-[10px] text-slate-500 italic">None</span>
                )}
                {items.map((item) => (
                  <span
                    key={item}
                    className="group inline-flex items-center px-1.5 py-0.5 rounded bg-black/20 border border-white/5 text-[11px] text-slate-300"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${item} ${key.slice(0, -1)}`}
                      onClick={() => handleRemove(key, item)}
                      className="ml-1 text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100"
                    >
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
