import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import ProfileSelector from './ProfileSelector';

const CASTER_CLASSES = [
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

export default function CharacterHeader({
  activeCharacter,
  profiles,
  onUpdateCharacter,
  onSelectProfile,
  onCreateProfile,
  onExport,
  onImport,
}) {
  const fileInputRef = useRef(null);

  const handleNameChange = (e) => {
    onUpdateCharacter({ ...activeCharacter, name: e.target.value });
  };

  const handleClassChange = (e) => {
    onUpdateCharacter({ ...activeCharacter, className: e.target.value });
  };

  const handleLevelChange = (e) => {
    onUpdateCharacter({ ...activeCharacter, level: Number(e.target.value) });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        onImport(content);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset for re-selection
  };

  if (!activeCharacter) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-dnd-border">
      {/* Profile & Name / Class / Level */}
      <div className="flex flex-wrap items-center gap-2">
        <ProfileSelector
          profiles={profiles}
          activeId={activeCharacter.id}
          onSelectProfile={onSelectProfile}
          onCreateProfile={onCreateProfile}
        />

        {/* Character Name Input */}
        <input
          type="text"
          value={activeCharacter.name}
          onChange={handleNameChange}
          placeholder="Character Name"
          className="bg-dnd-card border border-dnd-border rounded-lg px-2.5 py-1 text-sm font-semibold text-slate-100 focus:outline-none focus:border-dnd-gold w-36 sm:w-44 transition-colors"
        />

        {/* Class Dropdown */}
        <select
          value={activeCharacter.className}
          onChange={handleClassChange}
          className="bg-dnd-card border border-dnd-border rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-dnd-gold"
          aria-label="Character Class"
        >
          {CASTER_CLASSES.map((cls) => (
            <option key={cls} value={cls} className="bg-dnd-panel">
              {cls}
            </option>
          ))}
        </select>

        {/* Level Dropdown */}
        <select
          value={activeCharacter.level}
          onChange={handleLevelChange}
          className="bg-dnd-card border border-dnd-border rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-dnd-gold font-mono"
          aria-label="Character Level"
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((lvl) => (
            <option key={lvl} value={lvl} className="bg-dnd-panel">
              Lvl {lvl}
            </option>
          ))}
        </select>
      </div>

      {/* Export & Import Buttons */}
      <div className="flex items-center space-x-2 text-xs">
        <button
          type="button"
          onClick={onExport}
          className="flex items-center px-2.5 py-1 rounded-lg bg-dnd-card border border-dnd-border hover:border-dnd-gold text-slate-300 hover:text-dnd-gold transition-colors"
          title="Export character spellbook as JSON"
        >
          <Download size={13} className="mr-1" />
          Export
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center px-2.5 py-1 rounded-lg bg-dnd-card border border-dnd-border hover:border-dnd-gold text-slate-300 hover:text-dnd-gold transition-colors"
          title="Import character spellbook from JSON"
        >
          <Upload size={13} className="mr-1" />
          Import
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
