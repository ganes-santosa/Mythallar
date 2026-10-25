import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Pencil, Check, X, Plus, BookOpen } from 'lucide-react';
import ProfileSelector from './ProfileSelector';
import { getEffectiveMaxPrepared } from '../../utils/spellSlots';

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

  // Name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(activeCharacter?.name || '');

  // Level editing
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [levelDraft, setLevelDraft] = useState(activeCharacter?.level || 1);
  const [showLevelConfirm, setShowLevelConfirm] = useState(false);

  // Prepared max editing
  const [isEditingPrepared, setIsEditingPrepared] = useState(false);
  const effectiveMaxPrepared = getEffectiveMaxPrepared(activeCharacter);
  const [preparedDraft, setPreparedDraft] = useState(effectiveMaxPrepared ?? '');

  // Count currently prepared level 1+ spells
  const preparedCount = (activeCharacter?.spells || []).filter(
    (s) => s.prepared
  ).length;

  useEffect(() => {
    if (!isEditingName && activeCharacter) {
      setNameDraft(activeCharacter.name);
    }
  }, [activeCharacter?.name, activeCharacter?.id, isEditingName]);

  useEffect(() => {
    if (!isEditingLevel && activeCharacter) {
      setLevelDraft(activeCharacter.level);
    }
  }, [activeCharacter?.level, activeCharacter?.id, isEditingLevel]);

  useEffect(() => {
    if (!isEditingPrepared && activeCharacter) {
      setPreparedDraft(effectiveMaxPrepared ?? '');
    }
  }, [effectiveMaxPrepared, activeCharacter?.id, isEditingPrepared]);

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

  const handleSaveLevel = (val) => {
    const num = Math.min(20, Math.max(1, Number(val) || 1));
    if (activeCharacter) {
      onUpdateCharacter({ ...activeCharacter, level: num });
    }
    setIsEditingLevel(false);
  };

  const handleConfirmLevelUp = () => {
    if (activeCharacter && activeCharacter.level < 20) {
      onUpdateCharacter({ ...activeCharacter, level: activeCharacter.level + 1 });
    }
    setShowLevelConfirm(false);
  };

  const handleSaveMaxPrepared = () => {
    if (!activeCharacter) return;
    const num = Number(preparedDraft);
    if (!isNaN(num) && num >= 0) {
      onUpdateCharacter({ ...activeCharacter, customMaxPrepared: num });
    }
    setIsEditingPrepared(false);
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
      {/* Profile & Name / Class / Level / Prepared Slots */}
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
              className="p-1.5 rounded-lg bg-dnd-gold text-slate-100 hover:bg-dnd-gold-light hover:text-slate-950 transition-colors"
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
            <span className="text-sm font-semibold text-slate-100 max-w-[140px] sm:max-w-[180px] truncate">
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

        {/* Level Controls: Lvl x + Edit Pencil + Plus Button (+ Confirmation) */}
        <div className="flex items-center space-x-1 bg-dnd-card border border-dnd-border rounded-lg px-2 py-1 text-xs">
          {isEditingLevel ? (
            <div className="flex items-center space-x-1">
              <span className="text-slate-400">Lvl</span>
              <input
                type="number"
                min="1"
                max="20"
                value={levelDraft}
                onChange={(e) => setLevelDraft(e.target.value)}
                autoFocus
                className="w-10 bg-slate-900 border border-dnd-gold rounded px-1 text-xs text-slate-100 text-center focus:outline-none"
              />
              <button
                type="button"
                aria-label="Save Level"
                onClick={() => handleSaveLevel(levelDraft)}
                className="p-0.5 text-emerald-400 hover:text-emerald-300"
                title="Save Level"
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                aria-label="Cancel Edit Level"
                onClick={() => setIsEditingLevel(false)}
                className="p-0.5 text-slate-400 hover:text-slate-200"
                title="Cancel"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <span className="font-semibold text-slate-200">
              Lvl {activeCharacter.level}
            </span>
          )}

          {!isEditingLevel && (
            <button
              type="button"
              aria-label="Edit Level"
              onClick={() => setIsEditingLevel(true)}
              className="p-0.5 rounded text-slate-400 hover:text-dnd-gold transition-colors"
              title="Edit character level directly"
            >
              <Pencil size={11} />
            </button>
          )}

          {/* Plus Level Up Button */}
          {showLevelConfirm ? (
            <div className="flex items-center space-x-1 bg-slate-900 px-1.5 py-0.5 rounded border border-dnd-gold text-xs animate-in fade-in">
              <span className="text-[11px] text-slate-300 font-medium">Level Up?</span>
              <button
                type="button"
                aria-label="Confirm Level Up"
                onClick={handleConfirmLevelUp}
                className="p-0.5 text-emerald-400 hover:text-emerald-300"
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
              className="p-0.5 rounded text-slate-400 hover:text-dnd-gold transition-colors disabled:opacity-40"
              title="Level Up (+1)"
            >
              <Plus size={13} />
            </button>
          )}
        </div>

        {/* Max Prepared Spells Badge with Edit Button */}
        <div className="flex items-center space-x-1.5 bg-dnd-card border border-dnd-border rounded-lg px-2 py-1 text-xs">
          <BookOpen size={12} className="text-dnd-gold" />
          <span className="text-slate-400">Prepared:</span>
          {isEditingPrepared ? (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="0"
                max="50"
                value={preparedDraft}
                onChange={(e) => setPreparedDraft(e.target.value)}
                autoFocus
                placeholder="Max"
                className="w-12 bg-slate-900 border border-dnd-gold rounded px-1 text-xs text-slate-100 text-center focus:outline-none"
              />
              <button
                type="button"
                aria-label="Save Max Prepared"
                onClick={handleSaveMaxPrepared}
                className="p-0.5 text-emerald-400 hover:text-emerald-300"
                title="Save Max Prepared"
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                aria-label="Cancel Edit Max Prepared"
                onClick={() => setIsEditingPrepared(false)}
                className="p-0.5 text-slate-400 hover:text-slate-200"
                title="Cancel"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <span className="font-semibold text-slate-200">
              {preparedCount}
              {effectiveMaxPrepared !== null ? ` / ${effectiveMaxPrepared}` : ''}
            </span>
          )}

          {!isEditingPrepared && (
            <button
              type="button"
              aria-label="Edit Max Prepared"
              onClick={() => setIsEditingPrepared(true)}
              className="p-0.5 rounded text-slate-400 hover:text-dnd-gold transition-colors"
              title="Edit maximum prepared spells"
            >
              <Pencil size={11} />
            </button>
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
