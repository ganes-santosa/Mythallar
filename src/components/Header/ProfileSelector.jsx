import React from 'react';
import { User, Plus } from 'lucide-react';

export default function ProfileSelector({
  profiles,
  activeId,
  onSelectProfile,
  onCreateProfile,
}) {
  return (
    <div className="flex items-center space-x-2">
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

      <button
        type="button"
        onClick={onCreateProfile}
        aria-label="New Character"
        title="Create new character profile"
        className="p-1.5 rounded-lg bg-dnd-card border border-dnd-border hover:border-dnd-gold/60 text-slate-400 hover:text-slate-100 transition-colors"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
