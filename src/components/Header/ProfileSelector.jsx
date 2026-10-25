import React, { useState } from 'react';
import { User, Plus, Check, X } from 'lucide-react';

export default function ProfileSelector({
  profiles,
  activeId,
  onSelectProfile,
  onCreateProfile,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    onCreateProfile();
    setShowConfirm(false);
  };

  return (
    <div className="flex items-center space-x-1.5">
      <div className="flex items-center space-x-1.5 bg-dnd-card border border-dnd-border rounded-lg px-2.5 py-1 text-xs">
        <User size={13} className="text-dnd-gold" />
        <select
          value={activeId}
          onChange={(e) => onSelectProfile(e.target.value)}
          className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
          aria-label="Select Character Profile"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id} className="bg-dnd-panel text-slate-200">
              {p.name} (Lvl {p.level} {p.className})
            </option>
          ))}
        </select>
      </div>

      {showConfirm ? (
        <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-lg border border-dnd-gold text-xs animate-in fade-in">
          <span className="text-[11px] text-slate-300">New hero?</span>
          <button
            type="button"
            aria-label="Confirm Create Character"
            onClick={handleConfirm}
            className="p-0.5 text-emerald-400 hover:text-emerald-300"
            title="Create character"
          >
            <Check size={13} />
          </button>
          <button
            type="button"
            aria-label="Cancel Create Character"
            onClick={() => setShowConfirm(false)}
            className="p-0.5 text-red-400 hover:text-red-300"
            title="Cancel"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          aria-label="New Character"
          title="Create new character profile"
          className="p-1.5 rounded-lg bg-dnd-card border border-dnd-border hover:border-dnd-gold/60 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <Plus size={15} />
        </button>
      )}
    </div>
  );
}
