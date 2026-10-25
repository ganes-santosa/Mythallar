import React, { useState } from 'react';
import { User, Plus, Check, X, ChevronDown, Users } from 'lucide-react';

export default function ProfileSelector({
  profiles,
  activeId,
  onSelectProfile,
  onCreateProfile,
  onOpenManager,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    onCreateProfile();
    setShowConfirm(false);
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Quick Dropdown Pill for Recent Switch */}
      <div className="relative flex items-center bg-slate-900/80 border border-dnd-border hover:border-dnd-gold rounded-md pl-2 pr-1.5 py-1 text-xs transition-colors">
        <User size={12} className="text-dnd-gold mr-1.5 flex-shrink-0" />
        <select
          value={activeId}
          onChange={(e) => onSelectProfile(e.target.value)}
          className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer max-w-[100px] sm:max-w-[115px] truncate pr-4 appearance-none"
          aria-label="Select Character Profile"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id} className="bg-dnd-panel text-slate-200">
              {p.name}
            </option>
          ))}
        </select>
        <ChevronDown size={11} className="text-slate-400 pointer-events-none absolute right-1.5" />
      </div>

      {/* Full Grimoire / Character Manager Modal Trigger */}
      {onOpenManager && (
        <button
          type="button"
          onClick={onOpenManager}
          aria-label="Manage Characters"
          title="Open character manager modal"
          className="p-1 rounded-md bg-slate-900/80 border border-dnd-border hover:border-dnd-gold text-slate-400 hover:text-dnd-gold transition-colors flex items-center justify-center"
        >
          <Users size={13} />
        </button>
      )}

      {/* New Hero Button */}
      {showConfirm ? (
        <div className="flex items-center space-x-1 bg-[#EFE9E0] text-slate-900 px-1.5 py-0.5 rounded-md border border-slate-300 shadow-md text-xs animate-in fade-in">
          <span className="text-[10px] font-semibold text-slate-900">New?</span>
          <button
            type="button"
            aria-label="Confirm Create Character"
            onClick={handleConfirm}
            className="p-0.5 text-emerald-700 hover:text-emerald-900 rounded transition-colors"
            title="Create character"
          >
            <Check size={12} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Cancel Create Character"
            onClick={() => setShowConfirm(false)}
            className="p-0.5 text-red-700 hover:text-red-900 rounded transition-colors"
            title="Cancel"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          aria-label="New Character"
          title="Create new character profile"
          className="p-1 rounded-md bg-slate-900/80 border border-dnd-border hover:border-dnd-gold text-slate-400 hover:text-dnd-gold transition-colors flex items-center justify-center"
        >
          <Plus size={13} />
        </button>
      )}
    </div>
  );
}
