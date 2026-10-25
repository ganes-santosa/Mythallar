import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Pencil, Check, X } from 'lucide-react';
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(activeCharacter?.name || '');

  useEffect(() => {
    if (!isEditingName && activeCharacter) {
      setNameDraft(activeCharacter.name);
    }
  }, [activeCharacter?.name, activeCharacter?.id, isEditingName]);

  const handleSaveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && activeCharacter) {
      onUpdateCharacter({ ...activeCharacter, name: trimmed });
    }
    setIsEditingName(false);
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

        {/* Permanent Character Name with Edit Pencil Button */}
        {isEditingName ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveName();
            }}
            className="flex items-center space-x-1"
          >
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Character Name"
              autoFocus
              className="bg-dnd-card border border-dnd-gold rounded-lg px-2.5 py-1 text-sm font-semibold text-slate-100 focus:outline-none w-36 sm:w-44 transition-colors"
            />
            <button
              type="submit"
              aria-label="Save Name"
              className="p-1.5 rounded-lg bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light transition-colors"
              title="Save Name"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              aria-label="Cancel Edit Name"
              onClick={() => {
                setNameDraft(activeCharacter.name);
                setIsEditingName(false);
              }}
              className="p-1.5 rounded-lg bg-dnd-card border border-dnd-border hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </form>
        ) : (
          <div className="flex items-center space-x-1.5 bg-dnd-card border border-dnd-border rounded-lg px-2.5 py-1">
            <span className="text-sm font-bold text-slate-100 max-w-[140px] sm:max-w-[180px] truncate">
              {activeCharacter.name}
            </span>
            <button
              type="button"
              aria-label="Edit Name"
              onClick={() => {
                setNameDraft(activeCharacter.name);
                setIsEditingName(true);
              }}
              className="p-0.5 rounded text-slate-400 hover:text-dnd-gold transition-colors"
              title="Edit character name"
            >
              <Pencil size={12} />
            </button>
          </div>
        )}

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
