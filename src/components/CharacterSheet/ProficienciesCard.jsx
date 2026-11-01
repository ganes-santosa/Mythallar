import React, { useState, useRef } from 'react';
import { Shield, Sword, Wrench, Languages, X } from 'lucide-react';
import useClickOutside from '../../hooks/useClickOutside';

const CATEGORIES = [
  { key: 'armor', label: 'Armor', icon: Shield, placeholder: 'e.g. Shields' },
  { key: 'weapons', label: 'Weapons', icon: Sword, placeholder: 'e.g. Simple Weapons' },
  { key: 'tools', label: 'Tools', icon: Wrench, placeholder: "e.g. Thieves' Tools" },
  { key: 'languages', label: 'Languages', icon: Languages, placeholder: 'e.g. Draconic' },
];

function ProficiencyCategoryCard({
  category: { key, label, icon: Icon, placeholder },
  items = [],
  isEditing,
  isAdding,
  onOpenAdd,
  onCloseAdd,
  onAdd,
  onRemove,
}) {
  const [newVal, setNewVal] = useState('');
  const inputRef = useRef(null);
  const cardRef = useClickOutside(isAdding, () => {
    setNewVal('');
    onCloseAdd();
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newVal.trim()) return;
    onAdd(key, newVal.trim());
    setNewVal('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setNewVal('');
      onCloseAdd();
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-dnd-card p-2.5 rounded-lg space-y-1.5 flex flex-col justify-start shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
          <Icon size={12} className="text-dnd-gold" />
          <span>{label}</span>
        </span>
        {isEditing && (
          <button
            type="button"
            aria-label={`Add ${key} proficiency`}
            onClick={() => {
              if (isAdding) {
                setNewVal('');
                onCloseAdd();
              } else {
                onOpenAdd(key);
              }
            }}
            className="text-[10px] text-dnd-gold hover:text-dnd-gold-light font-medium"
          >
            + Add
          </button>
        )}
      </div>

      {isEditing && isAdding && (
        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex items-center space-x-1 pt-1"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 px-2.5 py-1 rounded-lg bg-dnd-card border border-white/20 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20"
          />
          <button
            type="submit"
            className="px-2 py-0.5 rounded bg-dnd-gold text-slate-950 font-bold text-[11px]"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setNewVal('');
              onCloseAdd();
            }}
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
            className="group inline-flex items-center px-2 py-0.5 rounded-md bg-dnd-panel text-[11px] text-slate-300"
          >
            <span>{item}</span>
            {isEditing && (
              <button
                type="button"
                aria-label={`Remove ${item} ${key.slice(0, -1)}`}
                onClick={() => onRemove(key, item)}
                className="ml-1 text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100"
              >
                <X size={9} />
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProficienciesCard({
  proficiencies = {},
  isEditing = false,
  onUpdateProficiencies,
}) {
  const currentProf = proficiencies || {
    armor: [],
    weapons: [],
    tools: [],
    languages: [],
  };

  const [activeCategory, setActiveCategory] = useState(null);

  const handleAdd = (catKey, value) => {
    const existing = currentProf[catKey] || [];
    onUpdateProficiencies?.({
      ...currentProf,
      [catKey]: [...existing, value],
    });
  };

  const handleRemove = (catKey, item) => {
    const existing = currentProf[catKey] || [];
    onUpdateProficiencies?.({
      ...currentProf,
      [catKey]: existing.filter((i) => i !== item),
    });
  };

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {CATEGORIES.map((category) => (
          <ProficiencyCategoryCard
            key={category.key}
            category={category}
            items={currentProf[category.key] || []}
            isEditing={isEditing}
            isAdding={activeCategory === category.key}
            onOpenAdd={(key) => setActiveCategory(key)}
            onCloseAdd={() => setActiveCategory(null)}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
}
