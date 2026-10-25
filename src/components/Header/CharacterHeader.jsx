import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Pencil, Check, X, Plus } from 'lucide-react';
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
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [showLevelConfirm, setShowLevelConfirm] = useState(false);

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

  const handleLevelUp = () => {
    if (activeCharacter && activeCharacter.level < 20) {
      onUpdateCharacter({ ...activeCharacter, level: activeCharacter.level + 1 });
    }
    setShowLevelConfirm(false);
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
    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-dnd-border">
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

        {/* Character Level: Edit Mode with Plus and Yes/No Confirmation */}
        <div className="flex items-center space-x-1 bg-dnd-card border border-dnd-border rounded-lg px-2 py-0.5 text-xs">
          <span className="font-semibold text-slate-200">
            Lvl {activeCharacter.level}
          </span>

          {!isEditingLevel ? (
            <button
              type="button"
              aria-label="Edit Level"
              onClick={() => {
                setIsEditingLevel(true);
                setShowLevelConfirm(false);
              }}
              className="p-0.5 rounded text-slate-400 hover:text-dnd-gold transition-colors"
              title="Edit level"
            >
              <Pencil size={11} />
            </button>
          ) : (
            <div className="flex items-center space-x-1 pl-1 border-l border-dnd-border/80">
              {showLevelConfirm ? (
                <div className="flex items-center space-x-1 bg-slate-900/80 px-1.5 py-0.5 rounded border border-dnd-gold">
                  <span className="text-[10px] text-slate-300">
                    Lvl {activeCharacter.level + 1}?
                  </span>
                  <button
                    type="button"
                    aria-label="Confirm Level Up"
                    onClick={handleLevelUp}
                    className="p-0.5 text-emerald-400 hover:text-emerald-300 font-bold"
                    title="Confirm level up"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    type="button"
                    aria-label="Cancel Level Up"
                    onClick={() => setShowLevelConfirm(false)}
                    className="p-0.5 text-red-400 hover:text-red-300"
                    title="Cancel"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label="Level Up"
                  onClick={() => setShowLevelConfirm(true)}
                  disabled={activeCharacter.level >= 20}
                  className="flex items-center px-1.5 py-0.2 rounded bg-dnd-gold/20 hover:bg-dnd-gold/40 text-dnd-gold font-bold text-[11px] disabled:opacity-40 transition-colors"
                  title="Level up (+1)"
                >
                  <Plus size={11} className="mr-0.5" />
                  +1
                </button>
              )}

              <button
                type="button"
                aria-label="Done Editing Level"
                onClick={() => {
                  setIsEditingLevel(false);
                  setShowLevelConfirm(false);
                }}
                className="p-0.5 text-slate-400 hover:text-slate-200"
                title="Done"
              >
                <Check size={12} />
              </button>
            </div>
          )}
        </div>
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
