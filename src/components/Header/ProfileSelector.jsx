import React from 'react';
import { User, Plus, ChevronDown, Users } from 'lucide-react';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';

export default function ProfileSelector({ profiles, activeId, onSelectProfile, onCreateProfile, onOpenManager }) {
  const { armed: createArmed, handleClick: handleCreateClick } = useTwoClickConfirm(onCreateProfile);

  return (
    <div className="flex items-center space-x-1">
      <div className="relative flex items-center bg-dnd-panel/60 hover:bg-dnd-panel rounded-md pl-2 pr-1.5 py-1 text-xs transition-colors">
        <User size={12} className="text-dnd-gold mr-1.5 flex-shrink-0" />
        <select value={activeId} onChange={(e) => onSelectProfile(e.target.value)} className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer max-w-[100px] sm:max-w-[115px] truncate pr-4 appearance-none" aria-label="Select Character Profile">
          {profiles.map((p) => <option key={p.id} value={p.id} className="bg-dnd-panel text-slate-200">{p.name}</option>)}
        </select>
        <ChevronDown size={11} className="text-slate-400 pointer-events-none absolute right-1.5" />
      </div>
      {onOpenManager && <button type="button" onClick={onOpenManager} aria-label="Manage Characters" title="Open character manager modal" className="p-1 rounded-md bg-dnd-panel/60 hover:bg-dnd-panel text-slate-400 hover:text-white transition-colors flex items-center justify-center"><Users size={13} /></button>}
      <button type="button" onClick={handleCreateClick} aria-label={createArmed ? 'Click again to create character' : 'New Character'} title={createArmed ? 'Click again to create character' : 'Create new character profile'} className={`p-1 rounded-md transition-colors flex items-center justify-center ${createArmed ? 'text-green-300 bg-green-950/70 ring-1 ring-green-400/70' : 'bg-dnd-panel/60 hover:bg-dnd-panel text-slate-400 hover:text-white'}`}><Plus size={13} /></button>
    </div>
  );
}
