import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Pencil, Check, X, Plus, Trash2, ArrowUpCircle } from 'lucide-react';
import ProfileSelector from './ProfileSelector';
import CharacterManagerModal from './CharacterManagerModal';
import AuthStatus from './AuthStatus';
import { getCharacterClasses, getTotalCharacterLevel } from '../../utils/spellSlots';

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
  onDeleteProfile,
  onExport,
  onImport,
  user,
  syncStatus,
  onSignIn,
  onSignOut,
  onSyncNow,
}) {
  const fileInputRef = useRef(null);

  // Single card edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(activeCharacter?.name || '');

  // Character Manager Modal
  const [showManagerModal, setShowManagerModal] = useState(false);

  // Level Up popup modal
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpTarget, setLevelUpTarget] = useState('');
  const [newMulticlassChoice, setNewMulticlassChoice] = useState('');

  const classes = getCharacterClasses(activeCharacter);
  const totalLevel = Number.isFinite(getTotalCharacterLevel(activeCharacter))
    ? getTotalCharacterLevel(activeCharacter)
    : 0;

  const unselectedClasses = CASTER_CLASSES.filter(
    (cls) => !classes.some((c) => c.className === cls)
  );

  useEffect(() => {
    setNameDraft(activeCharacter?.name || '');
    setIsEditing(false);
  }, [activeCharacter?.id]);

  useEffect(() => {
    if (!isEditing && activeCharacter) {
      setNameDraft(activeCharacter.name);
    }
  }, [activeCharacter?.name, isEditing]);

  const handleSaveEdit = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && activeCharacter && trimmed !== activeCharacter.name) {
      onUpdateCharacter({ ...activeCharacter, name: trimmed });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setNameDraft(activeCharacter?.name || '');
    setIsEditing(false);
  };

  const handleClassChange = (index, newClassName) => {
    const newClasses = classes.map((c, i) => (i === index ? { ...c, className: newClassName } : c));
    const newTotal = newClasses.reduce((sum, c) => sum + c.level, 0);
    onUpdateCharacter({
      ...activeCharacter,
      className: newClasses[0].className,
      level: newTotal,
      classes: newClasses,
    });
  };

  const handleSetClassLevel = (index, val) => {
    const parsed = Number(val);
    const num = Number.isFinite(parsed) ? Math.max(1, Math.min(20, parsed)) : 1;
    const newClasses = classes.map((c, i) => (i === index ? { ...c, level: num } : c));
    const newTotal = newClasses.reduce((sum, c) => sum + (Number(c.level) || 0), 0);
    if (newTotal > 20) return;
    onUpdateCharacter({
      ...activeCharacter,
      className: newClasses[0].className,
      level: newTotal,
      classes: newClasses,
    });
  };

  const handleAddClass = () => {
    const existing = new Set(classes.map((c) => c.className));
    const nextAvailable = CASTER_CLASSES.find((cls) => !existing.has(cls)) || 'Fighter';
    const newClasses = [...classes, { className: nextAvailable, level: 1 }];
    const newTotal = newClasses.reduce((sum, c) => sum + c.level, 0);
    if (newTotal > 20) return;
    onUpdateCharacter({
      ...activeCharacter,
      className: newClasses[0].className,
      level: newTotal,
      classes: newClasses,
    });
  };

  const handleRemoveClass = (index) => {
    if (classes.length <= 1) return;
    const newClasses = classes.filter((_, i) => i !== index);
    const newTotal = newClasses.reduce((sum, c) => sum + c.level, 0);
    onUpdateCharacter({
      ...activeCharacter,
      className: newClasses[0].className,
      level: newTotal,
      classes: newClasses,
    });
  };

  const handleOpenLevelUpModal = () => {
    setLevelUpTarget(classes[0]?.className || 'Wizard');
    setNewMulticlassChoice(unselectedClasses[0] || '');
    setShowLevelUpModal(true);
  };

  const handleConfirmLevelUp = () => {
    if (totalLevel >= 20) {
      setShowLevelUpModal(false);
      return;
    }

    let newClasses = [];
    if (levelUpTarget === '__new_class__') {
      if (!newMulticlassChoice) return;
      newClasses = [...classes, { className: newMulticlassChoice, level: 1 }];
    } else {
      newClasses = classes.map((c) =>
        c.className === levelUpTarget ? { ...c, level: c.level + 1 } : c
      );
    }

    const newTotal = newClasses.reduce((sum, c) => sum + c.level, 0);
    onUpdateCharacter({
      ...activeCharacter,
      className: newClasses[0].className,
      level: newTotal,
      classes: newClasses,
    });
    setShowLevelUpModal(false);
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
    <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-dnd-border">
      {/* Left: Highlight Character Profile Card */}
      <div className="flex-1 min-w-[280px] p-2.5 sm:p-3 rounded-xl bg-dnd-card border border-dnd-border shadow-sm">
        {/* Name Title & Header Actions */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Name & Character Level next to it */}
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            {isEditing ? (
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Character Name"
                autoFocus
                className="bg-slate-900 border border-dnd-gold rounded-lg px-2.5 py-0.5 text-base sm:text-lg font-bold text-slate-100 focus:outline-none w-44 sm:w-56 transition-colors"
              />
            ) : (
              <h2 className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight truncate max-w-[180px] sm:max-w-xs">
                {activeCharacter.name}
              </h2>
            )}

            <span className="text-xs text-slate-400 font-normal whitespace-nowrap select-none">
              Character Level <span className="text-dnd-gold ml-0.5 font-normal">{totalLevel}</span>
            </span>
          </div>

          {/* Right: Edit & Level Up Actions (aligned right) */}
          <div className="flex items-center space-x-1.5 ml-auto">
            {isEditing ? (
              <>
                <button
                  type="button"
                  aria-label="Save Profile"
                  onClick={handleSaveEdit}
                  className="flex items-center px-2 py-0.5 rounded-md bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light text-xs font-medium transition-colors shadow-sm"
                  title="Done editing profile"
                >
                  <Check size={12} className="mr-1" />
                  Done
                </button>
                <button
                  type="button"
                  aria-label="Cancel Edit Profile"
                  onClick={handleCancelEdit}
                  className="p-1 rounded-md bg-slate-900 border border-dnd-border hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Cancel editing"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  aria-label="Edit Profile"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-2 py-0.5 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-dnd-gold border border-dnd-border hover:border-dnd-gold text-xs font-normal transition-colors"
                  title="Edit character name and classes"
                >
                  <Pencil size={11} className="mr-1 text-slate-400" />
                  Edit
                </button>

                {totalLevel < 20 && (
                  <button
                    type="button"
                    onClick={handleOpenLevelUpModal}
                    className="flex items-center px-2 py-0.5 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-dnd-gold border border-dnd-border hover:border-dnd-gold text-xs font-normal transition-colors whitespace-nowrap flex-shrink-0"
                    title="Level up this character"
                  >
                    <ArrowUpCircle size={12} className="mr-1 text-slate-400 flex-shrink-0" />
                    Level Up
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Multiclass Rows */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {isEditing ? (
            <>
              {classes.map((clsItem, idx) => {
                const maxLvlForThisClass = 20 - (totalLevel - clsItem.level);
                return (
                  <div
                    key={idx}
                    className="flex items-center space-x-1 bg-slate-900/95 border border-dnd-border rounded-md px-1.5 py-0.5 text-xs animate-in fade-in"
                  >
                    {/* Class Dropdown */}
                    <select
                      value={clsItem.className}
                      onChange={(e) => handleClassChange(idx, e.target.value)}
                      className="bg-transparent border-0 text-slate-200 font-normal focus:outline-none cursor-pointer pr-1"
                      aria-label={`Character Class ${idx + 1}`}
                    >
                      {CASTER_CLASSES.map((cls) => (
                        <option key={cls} value={cls} className="bg-dnd-panel">
                          {cls}
                        </option>
                      ))}
                    </select>

                    {/* Class Level Dropdown */}
                    <div className="flex items-center space-x-1 pl-1 border-l border-slate-700/60">
                      <span className="text-[11px] text-slate-400">Lvl</span>
                      <select
                        value={clsItem.level}
                        onChange={(e) => handleSetClassLevel(idx, e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[11px] text-slate-100 font-normal focus:outline-none focus:border-dnd-gold cursor-pointer"
                        aria-label={`Level for ${clsItem.className}`}
                      >
                        {Array.from({ length: maxLvlForThisClass }, (_, i) => i + 1).map((lvl) => (
                          <option key={lvl} value={lvl} className="bg-dnd-panel">
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Remove Class button (only if > 1 class) */}
                    {classes.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Remove ${clsItem.className}`}
                        onClick={() => handleRemoveClass(idx)}
                        className="p-0.5 text-slate-500 hover:text-red-400 transition-colors ml-0.5"
                        title={`Remove ${clsItem.className}`}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Class Button (shown during edit mode) */}
              {classes.length < CASTER_CLASSES.length && totalLevel < 20 && (
                <button
                  type="button"
                  onClick={handleAddClass}
                  className="flex items-center px-2 py-0.5 rounded-md bg-slate-900/60 border border-dashed border-slate-700 hover:border-dnd-gold text-slate-400 hover:text-dnd-gold text-xs transition-colors"
                  title="Add another class for multiclassing"
                >
                  <Plus size={12} className="mr-1" />
                  Add Class
                </button>
              )}
            </>
          ) : (
            classes.map((clsItem, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-1.5 bg-slate-900/90 border border-dnd-border rounded-md px-2 py-0.5 text-xs text-slate-200"
              >
                <span className="font-normal text-slate-200">{clsItem.className}</span>
                <span className="text-[11px] text-dnd-gold font-normal">Lvl {clsItem.level}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Unified Character & File Actions Card */}
      <div className="flex flex-col items-end justify-center p-2 rounded-xl bg-dnd-card border border-dnd-border shadow-sm space-y-1.5 flex-shrink-0">
        <div className="flex items-center space-x-1.5 w-full justify-between">
          <ProfileSelector
            profiles={profiles}
            activeId={activeCharacter.id}
            onSelectProfile={onSelectProfile}
            onCreateProfile={onCreateProfile}
            onOpenManager={() => setShowManagerModal(true)}
          />
          <AuthStatus
            user={user}
            syncStatus={syncStatus}
            onSignIn={onSignIn}
            onSignOut={onSignOut}
            onSyncNow={onSyncNow}
          />
        </div>

        <div className="flex items-center space-x-1 w-full justify-end">
          <button
            type="button"
            onClick={onExport}
            className="flex-1 flex items-center justify-center px-2 py-1 rounded-md bg-slate-900/80 border border-dnd-border hover:border-dnd-gold text-slate-300 hover:text-dnd-gold transition-colors text-[11px] font-medium"
            title="Export character spellbook as JSON"
          >
            <Download size={11} className="mr-1" />
            Export
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center px-2 py-1 rounded-md bg-slate-900/80 border border-dnd-border hover:border-dnd-gold text-slate-300 hover:text-dnd-gold transition-colors text-[11px] font-medium"
            title="Import character spellbook from JSON"
          >
            <Upload size={11} className="mr-1" />
            Import
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Character Manager Modal */}
      <CharacterManagerModal
        isOpen={showManagerModal}
        onClose={() => setShowManagerModal(false)}
        profiles={profiles}
        activeId={activeCharacter.id}
        onSelectProfile={onSelectProfile}
        onCreateProfile={onCreateProfile}
        onDeleteProfile={onDeleteProfile}
      />

      {/* Level Up Selection Popup Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-dnd-card border border-slate-700/80 rounded-xl p-4 sm:p-5 max-w-sm w-full shadow-[0_0_30px_rgba(212,175,55,0.12)] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-dnd-border">
              <div className="flex items-center space-x-2">
                <ArrowUpCircle size={18} className="text-dnd-gold" />
                <h3 className="text-sm sm:text-base font-bold text-dnd-ivory">
                  Level Up!
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLevelUpModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Cancel"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-300 font-medium">
                Choose class for Level {totalLevel + 1}:
              </p>
              <div className="space-y-1.5 pt-1">
                {/* Existing classes */}
                {classes.map((c) => (
                  <label
                    key={c.className}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                      levelUpTarget === c.className
                        ? 'bg-dnd-gold/10 border-slate-600 shadow-[0_0_12px_rgba(212,175,55,0.1)] text-dnd-ivory'
                        : 'bg-slate-900/80 border-dnd-border text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="levelUpClass"
                        value={c.className}
                        checked={levelUpTarget === c.className}
                        onChange={() => setLevelUpTarget(c.className)}
                        className="text-dnd-gold focus:ring-0"
                      />
                      <span className="font-semibold">{c.className}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Lvl {c.level} → <span className="text-dnd-gold font-bold">Lvl {c.level + 1}</span>
                    </span>
                  </label>
                ))}

                {/* Multiclass into new class option */}
                {unselectedClasses.length > 0 && (
                  <label
                    className={`flex flex-col gap-1.5 p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                      levelUpTarget === '__new_class__'
                        ? 'bg-dnd-gold/10 border-slate-600 shadow-[0_0_12px_rgba(212,175,55,0.1)] text-dnd-ivory'
                        : 'bg-slate-900/80 border-dnd-border text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="levelUpClass"
                          value="__new_class__"
                          checked={levelUpTarget === '__new_class__'}
                          onChange={() => setLevelUpTarget('__new_class__')}
                          className="text-dnd-gold focus:ring-0"
                        />
                        <span className="font-semibold">+ New Class (Multiclass)</span>
                      </div>
                      <span className="text-[11px] text-dnd-gold font-bold">Lvl 1</span>
                    </div>

                    {levelUpTarget === '__new_class__' && (
                      <select
                        value={newMulticlassChoice}
                        onChange={(e) => setNewMulticlassChoice(e.target.value)}
                        className="mt-1 w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-dnd-gold cursor-pointer"
                        aria-label="Select new multiclass"
                      >
                        {unselectedClasses.map((cls) => (
                          <option key={cls} value={cls} className="bg-dnd-panel">
                            {cls}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-dnd-border">
              <button
                type="button"
                onClick={() => setShowLevelUpModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-dnd-border hover:bg-slate-800 text-slate-300 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLevelUp}
                className="px-3 py-1.5 rounded-lg bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-semibold text-xs transition-colors shadow"
              >
                Level Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
