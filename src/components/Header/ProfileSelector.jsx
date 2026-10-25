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
      {/* Character Profile Dropdown */}
      <div className="flex items-center space-x-1.5 bg-dnd-card border border-dnd-border hover:border-dnd-gold rounded-lg px-2.5 py-1 text-xs transition-colors">
        <User size={13} className="text-dnd-gold flex-shrink-0" />
        <select
          value={activeId}
          onChange={(e) => onSelectProfile(e.target.value)}
          className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 max-w-[140px] sm:max-w-[190px] truncate"
          aria-label="Select Character Profile"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id} className="bg-dnd-panel text-slate-200">
              {p.name} (Lvl {p.level} {p.className})
            </option>
          ))}
        </select>
      </div>

      {/* New Character Button with Inverted Light Confirmation */}
      {showConfirm ? (
        <div className="flex items-center space-x-1.5 bg-[#EFE9E0] text-slate-900 px-2 py-1 rounded-lg border border-slate-300 shadow-md text-xs animate-in fade-in">
          <span className="text-[11px] font-semibold text-slate-900">New hero?</span>
          <button
            type="button"
            aria-label="Confirm Create Character"
            onClick={handleConfirm}
            className="p-0.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/80 rounded transition-colors"
            title="Create character"
          >
            <Check size={13} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Cancel Create Character"
            onClick={() => setShowConfirm(false)}
            className="p-0.5 text-red-700 hover:text-red-900 hover:bg-red-100/80 rounded transition-colors"
            title="Cancel"
          >
            <X size={13} strokeWidth={2.5} />
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
