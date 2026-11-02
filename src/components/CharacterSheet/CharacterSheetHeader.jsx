import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Check, X, Plus, Trash2, ArrowUpCircle, ChevronDown, UserRound, Users, Camera, User } from 'lucide-react';
import CharacterManagerModal from '../Header/CharacterManagerModal';
import { getCharacterClasses, getTotalCharacterLevel } from '../../utils/spellSlots';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';
import { compressImageFile } from '../../utils/imageCompressor';

// ponytail: extracted so useTwoClickConfirm hook works per-row inside .map()
function ClassDeleteButton({ className, onRemove }) {
  const { armed, handleClick } = useTwoClickConfirm(onRemove);
  return (
    <button
      type="button"
      aria-label={armed ? `Click again to remove ${className}` : `Remove ${className}`}
      onClick={handleClick}
      className={`p-0.5 rounded transition-colors ml-0.5 ${
        armed ? 'text-red-500 bg-red-950/70 ring-1 ring-red-500/60' : 'text-slate-500 hover:text-red-400'
      }`}
      title={armed ? `Click again to remove ${className}` : `Remove ${className}`}
    >
      <Trash2 size={11} />
    </button>
  );
}

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

export default function CharacterSheetHeader({
  character,
  profiles = [],
  onUpdateCharacter,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
}) {
  const portraitInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(character?.name || '');
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [levelUpTarget, setLevelUpTarget] = useState('');
  const [newMulticlassChoice, setNewMulticlassChoice] = useState('');

  const headerRowRef = useRef(null);
  const nameRef = useRef(null);
  const levelRef = useRef(null);
  const actionsRef = useRef(null);
  const [showLevelText, setShowLevelText] = useState(true);
  const [showButtonText, setShowButtonText] = useState(true);

  const classes = getCharacterClasses(character);
  const totalLevel = Number.isFinite(getTotalCharacterLevel(character))
    ? getTotalCharacterLevel(character)
    : 0;

  const unselectedClasses = CASTER_CLASSES.filter(
    (cls) => !classes.some((c) => c.className === cls)
  );

  const sheet = character?.sheet || {};
  const identity = sheet.identity || { race: '', subclass: '', background: '', portrait: '' };

  useEffect(() => {
    setNameDraft(character?.name || '');
    setIsEditing(false);
  }, [character?.id]);

  useEffect(() => {
    if (!isEditing && character) {
      setNameDraft(character.name);
    }
  }, [character?.name, isEditing]);

  const handleSaveEdit = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && character && trimmed !== character.name) {
      onUpdateCharacter?.({ ...character, name: trimmed });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setNameDraft(character?.name || '');
    setIsEditing(false);
  };

  const handleIdentityChange = (field, value) => {
    onUpdateCharacter?.({
      ...character,
      sheet: {
        ...sheet,
        identity: {
          ...identity,
          [field]: value,
        },
      },
    });
  };

  const handlePortraitUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFile(file, 256, 0.85);
      if (compressedDataUrl) {
        handleIdentityChange('portrait', compressedDataUrl);
      }
    } catch (err) {
      console.error('Failed to compress avatar image', err);
    }
    e.target.value = '';
  };

  useEffect(() => {
    if (isCollapsed) return;
    const row = headerRowRef.current;
    if (!row) return;

    let naturalLevelWidth = 95;
    let naturalBtnLabelsWidth = 75;

    const checkFit = () => {
      const rowWidth = row.clientWidth;
      if (!rowWidth) return;

      const avatarWidth = 44;
      const nameWidth = nameRef.current?.scrollWidth || 0;
      const currentLevelWidth = levelRef.current?.offsetWidth || 0;
      if (currentLevelWidth > 0) naturalLevelWidth = currentLevelWidth;

      const actionsWidth = actionsRef.current?.offsetWidth || 0;
      const actionsMinIconWidth = 82;
      const actionsFullWidth = showButtonText ? actionsWidth : actionsWidth + naturalBtnLabelsWidth;

      const gapBudget = 22;

      const fullWidthNeeded = avatarWidth + nameWidth + naturalLevelWidth + actionsFullWidth + gapBudget;
      if (rowWidth >= fullWidthNeeded) {
        setShowLevelText(true);
        setShowButtonText(true);
        return;
      }

      const withoutLevelNeeded = avatarWidth + nameWidth + actionsFullWidth + 10;
      if (rowWidth >= withoutLevelNeeded) {
        setShowLevelText(false);
        setShowButtonText(true);
        return;
      }

      const minIconNeeded = avatarWidth + nameWidth + actionsMinIconWidth + 10;
      if (rowWidth >= minIconNeeded) {
        setShowLevelText(false);
        setShowButtonText(false);
        return;
      }

      setShowLevelText(false);
      setShowButtonText(false);
    };

    checkFit();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(checkFit);
    observer.observe(row);
    return () => observer.disconnect();
  }, [character?.name, totalLevel, isCollapsed, isEditing, showButtonText]);

  const handleClassChange = (index, newClassName) => {
    const newClasses = classes.map((c, i) => (i === index ? { ...c, className: newClassName } : c));
    const newTotal = newClasses.reduce((sum, c) => sum + c.level, 0);
    onUpdateCharacter?.({
      ...character,
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
    onUpdateCharacter?.({
      ...character,
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
    onUpdateCharacter?.({
      ...character,
      className: newClasses[0].className,
      level: newTotal,
      classes: newClasses,
    });
  };

  const handleRemoveClass = (index) => {
    if (classes.length <= 1) return;
    const newClasses = classes.filter((_, i) => i !== index);
    const newTotal = newClasses.reduce((sum, c) => sum + c.level, 0);
    onUpdateCharacter?.({
      ...character,
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
    onUpdateCharacter?.({
      ...character,
      className: newClasses[0].className,
      level: newTotal,
      classes: newClasses,
    });
    setShowLevelUpModal(false);
  };

  if (!character) return null;

  return (
    <div className="p-2.5 rounded-lg bg-dnd-panel transition-all">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-1.5 text-left group focus:outline-none"
          aria-label={isCollapsed ? 'Expand Character' : 'Collapse Character'}
          title={isCollapsed ? 'Click to expand character' : 'Click to collapse character'}
        >
          <UserRound size={14} className="text-dnd-gold group-hover:scale-110 transition-transform" />
          <h3 className="text-xs font-semibold text-slate-200 group-hover:text-dnd-gold-light transition-colors">Character</h3>
          <ChevronDown size={13} className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          !isCollapsed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-2">
            <div className="character-profile-card w-full p-2.5 sm:p-3 rounded-xl bg-dnd-card shadow-sm space-y-2">
              {/* Header row: Portrait + Name / Level + Actions */}
              <div ref={headerRowRef} className={`flex min-w-0 items-center gap-2 ${isEditing ? 'flex-wrap' : ''}`}>
                <div className={`flex min-w-0 items-center space-x-2.5 ${isEditing ? 'flex-wrap gap-y-1' : 'flex-1'}`}>
                  {/* Portrait avatar with compressed upload */}
                  <div className="relative group flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => portraitInputRef.current?.click()}
                      aria-label="Upload character portrait"
                      title="Click to upload portrait (auto-compressed to 256px WebP)"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-dnd-gold/40 bg-black/40 overflow-hidden flex items-center justify-center shadow-sm relative group cursor-pointer"
                    >
                      {identity.portrait ? (
                        <img
                          src={identity.portrait}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={18} className="text-slate-400 group-hover:text-dnd-gold transition-colors" />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={11} className="text-white" />
                      </div>
                    </button>
                    <input
                      ref={portraitInputRef}
                      type="file"
                      accept="image/*"
                      aria-label="Portrait file input"
                      onChange={handlePortraitUpload}
                      className="hidden"
                    />
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      placeholder="Character Name"
                      autoFocus
                      className="bg-dnd-panel rounded-lg px-2.5 py-0.5 text-base sm:text-lg font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-white/20 w-44 sm:w-56 transition-colors"
                    />
                  ) : (
                    <h2 ref={nameRef} className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight truncate min-w-0 font-display">
                      {character.name}
                    </h2>
                  )}

                  {!isEditing && (
                    <span
                      ref={levelRef}
                      className={`character-level-label text-xs text-slate-400 font-normal whitespace-nowrap select-none ${
                        showLevelText ? '' : 'hidden'
                      }`}
                    >
                      Character Level <span className="text-dnd-gold ml-0.5 font-normal">{totalLevel}</span>
                    </span>
                  )}
                </div>

                {/* Right: Actions */}
                <div ref={actionsRef} className={`flex shrink-0 items-center space-x-1.5 ml-auto ${isEditing ? 'character-edit-actions' : ''}`}>
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        aria-label="Save Profile"
                        onClick={handleSaveEdit}
                        className="flex items-center px-2 py-0.5 rounded-md bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light text-xs font-medium transition-colors shadow-sm cursor-pointer"
                        title="Done editing profile"
                      >
                        <Check size={12} className="mr-1" />
                        Done
                      </button>
                      <button
                        type="button"
                        aria-label="Cancel Edit Profile"
                        onClick={handleCancelEdit}
                        className="p-1 rounded-md bg-dnd-panel hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        title="Cancel editing"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowManagerModal(true)}
                        aria-label="Manage Characters"
                        title="Open character manager modal"
                        className="p-1 rounded-md bg-dnd-panel/60 hover:bg-dnd-panel text-slate-300 hover:text-dnd-gold transition-colors flex items-center justify-center cursor-pointer"
                      >
                        <Users size={13} />
                      </button>

                      <button
                        type="button"
                        aria-label="Edit Profile"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-1.5 py-0.5 rounded-md bg-dnd-panel/60 hover:bg-dnd-panel text-slate-300 hover:text-dnd-gold text-xs font-normal transition-colors cursor-pointer"
                        title="Edit character name and classes"
                      >
                        <Pencil size={11} className="text-slate-400" />
                        {showButtonText && <span className="character-btn-label ml-1">Edit</span>}
                      </button>

                      {totalLevel < 20 && (
                        <button
                          type="button"
                          onClick={handleOpenLevelUpModal}
                          className="flex items-center px-1.5 py-0.5 rounded-md bg-dnd-panel/60 hover:bg-dnd-panel text-slate-300 hover:text-dnd-gold text-xs font-normal transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer"
                          title="Level up this character"
                        >
                          <ArrowUpCircle size={12} className="text-slate-400 flex-shrink-0" />
                          {showButtonText && <span className="character-btn-label ml-1">Level Up</span>}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Multiclass Rows */}
              <div className="flex flex-wrap items-center gap-1.5">
                {isEditing ? (
                  <>
                    {classes.map((clsItem, idx) => {
                      const maxLvlForThisClass = 20 - (totalLevel - clsItem.level);
                      return (
                        <div
                          key={idx}
                          className="flex items-center space-x-1 bg-dnd-panel rounded-md px-1.5 py-0.5 text-xs animate-in fade-in"
                        >
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

                          <div className="flex items-center space-x-1 pl-1">
                            <span className="text-[11px] text-slate-400">Lvl</span>
                            <select
                              value={clsItem.level}
                              onChange={(e) => handleSetClassLevel(idx, e.target.value)}
                              className="bg-dnd-panel/80 rounded px-1 py-0.5 text-[11px] text-slate-100 font-normal focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer"
                              aria-label={`Level for ${clsItem.className}`}
                            >
                              {Array.from({ length: maxLvlForThisClass }, (_, i) => i + 1).map((lvl) => (
                                <option key={lvl} value={lvl} className="bg-dnd-panel">
                                  {lvl}
                                </option>
                              ))}
                            </select>
                          </div>

                          {classes.length > 1 && (
                            <ClassDeleteButton
                              className={clsItem.className}
                              onRemove={() => handleRemoveClass(idx)}
                            />
                          )}
                        </div>
                      );
                    })}

                    {classes.length < CASTER_CLASSES.length && totalLevel < 20 && (
                      <button
                        type="button"
                        onClick={handleAddClass}
                        className="flex items-center px-2 py-0.5 rounded-md bg-dnd-panel/60 hover:bg-dnd-panel text-slate-400 hover:text-dnd-gold text-xs transition-colors cursor-pointer"
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
                      className="flex items-center space-x-1.5 bg-dnd-panel/60 rounded-md px-2 py-0.5 text-xs text-slate-200"
                    >
                      <span className="font-normal text-slate-200">{clsItem.className}</span>
                      <span className="text-[11px] text-dnd-gold font-normal">Lvl {clsItem.level}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Identity Metadata Fields (Race, Subclass, Background) */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px]">
                <div>
                  <label htmlFor="sheet-id-race" className="block text-[9px] text-slate-400 mb-0.5">
                    Race / Species
                  </label>
                  <input
                    id="sheet-id-race"
                    type="text"
                    placeholder="e.g. High Elf"
                    value={identity.race || ''}
                    onChange={(e) => handleIdentityChange('race', e.target.value)}
                    className="w-full px-2 py-0.5 rounded-lg bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>

                <div>
                  <label htmlFor="sheet-id-subclass" className="block text-[9px] text-slate-400 mb-0.5">
                    Subclass / Tradition
                  </label>
                  <input
                    id="sheet-id-subclass"
                    type="text"
                    placeholder="e.g. Chronurgy"
                    value={identity.subclass || ''}
                    onChange={(e) => handleIdentityChange('subclass', e.target.value)}
                    className="w-full px-2 py-0.5 rounded-lg bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>

                <div>
                  <label htmlFor="sheet-id-background" className="block text-[9px] text-slate-400 mb-0.5">
                    Background
                  </label>
                  <input
                    id="sheet-id-background"
                    type="text"
                    placeholder="e.g. Sage"
                    value={identity.background || ''}
                    onChange={(e) => handleIdentityChange('background', e.target.value)}
                    className="w-full px-2 py-0.5 rounded-lg bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Character Manager Modal */}
      <CharacterManagerModal
        isOpen={showManagerModal}
        onClose={() => setShowManagerModal(false)}
        profiles={profiles}
        activeId={character.id}
        onSelectProfile={onSelectProfile}
        onCreateProfile={onCreateProfile}
        onDeleteProfile={onDeleteProfile}
      />

      {/* Level Up Selection Popup Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-dnd-card rounded-2xl p-4 sm:p-5 max-w-sm w-full shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2">
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
                {classes.map((c) => (
                  <label
                    key={c.className}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all text-xs ${
                      levelUpTarget === c.className
                        ? 'bg-dnd-panel/90 shadow-[0_0_15px_rgba(255,255,255,0.08)] ring-1 ring-white/25 text-dnd-ivory'
                        : 'bg-dnd-panel/40 text-slate-300 hover:bg-dnd-panel/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sheetLevelUpClass"
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

                {unselectedClasses.length > 0 && (
                  <label
                    className={`flex flex-col gap-1.5 p-2 rounded-lg cursor-pointer transition-all text-xs ${
                      levelUpTarget === '__new_class__'
                        ? 'bg-dnd-panel/90 shadow-[0_0_15px_rgba(255,255,255,0.08)] ring-1 ring-white/25 text-dnd-ivory'
                        : 'bg-dnd-panel/40 text-slate-300 hover:bg-dnd-panel/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sheetLevelUpClass"
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
                        className="mt-1 w-full bg-dnd-panel rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer"
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

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLevelUpModal(false)}
                className="px-3 py-1.5 rounded-lg bg-dnd-panel/60 hover:bg-dnd-panel text-slate-300 text-xs transition-colors"
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
