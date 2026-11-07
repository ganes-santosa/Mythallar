import React, { useState, useEffect, useRef } from 'react';
import { UserPen, Check, X, Plus, Trash2, ArrowUpCircle, ChevronDown, UserRound, Users, Camera, User, FingerprintPattern } from 'lucide-react';
import CharacterManagerModal from '../Header/CharacterManagerModal';
import { getCharacterClasses, getTotalCharacterLevel } from '../../utils/spellSlots';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';
import useAutoScrollOnExpand from '../../hooks/useAutoScrollOnExpand';
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

function CharacterSheetHeader({
  character,
  profiles = [],
  onUpdateCharacter,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onExport,
  onImport,
}) {
  const portraitInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(character?.name || '');
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const headerAccordionRef = useAutoScrollOnExpand(!isCollapsed);
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
  const identity = sheet.identity || { race: '', subclass: '', background: '', portrait: '', lore: '' };

  const [isLoreCollapsed, setIsLoreCollapsed] = useState(true);
  const loreRef = useAutoScrollOnExpand(!isLoreCollapsed);
  const [isEditingLore, setIsEditingLore] = useState(false);
  const [loreDraft, setLoreDraft] = useState(identity.lore || '');

  useEffect(() => {
    setLoreDraft(identity.lore || '');
    setIsEditingLore(false);
  }, [character?.id, identity.lore]);

  const handleSaveLore = () => {
    handleIdentityChange('lore', loreDraft);
    setIsEditingLore(false);
  };

  const handleCancelLore = () => {
    setLoreDraft(identity.lore || '');
    setIsEditingLore(false);
  };

  useEffect(() => {
    setNameDraft(character?.name || '');
    setIsEditingLore(false);
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

      const nameWidth = nameRef.current?.scrollWidth || 0;
      const currentLevelWidth = levelRef.current?.offsetWidth || 0;
      if (currentLevelWidth > 0) naturalLevelWidth = currentLevelWidth;

      const actionsWidth = actionsRef.current?.offsetWidth || 0;
      const actionsMinIconWidth = 82;
      const actionsFullWidth = showButtonText ? actionsWidth : actionsWidth + naturalBtnLabelsWidth;

      const gapBudget = 16;

      const fullWidthNeeded = nameWidth + naturalLevelWidth + actionsFullWidth + gapBudget;
      if (rowWidth >= fullWidthNeeded) {
        setShowLevelText(true);
        setShowButtonText(true);
        return;
      }

      const withoutLevelNeeded = nameWidth + actionsFullWidth + 8;
      if (rowWidth >= withoutLevelNeeded) {
        setShowLevelText(false);
        setShowButtonText(true);
        return;
      }

      const minIconNeeded = nameWidth + actionsMinIconWidth + 8;
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
    <div ref={headerAccordionRef} className="p-2.5 rounded-lg bg-dnd-panel transition-all">
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
          <div className="pt-2 space-y-2.5">
            <div className="character-profile-card w-full rounded-xl bg-dnd-card shadow-sm flex items-stretch overflow-hidden">
              {/* Left: Prominent Portrait Column with Gradient Fade to Right */}
              <div className="relative flex-shrink-0 w-28 sm:w-36 md:w-44 self-stretch overflow-hidden group select-none">
                {identity.portrait ? (
                  <img
                    src={identity.portrait}
                    alt={character.name}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full min-h-[110px] bg-dnd-panel/60 flex flex-col items-center justify-center text-slate-500 group-hover:text-dnd-gold transition-colors p-2 text-center">
                    <User size={32} />
                    <span className="text-[10px] mt-1 text-slate-400 font-medium">Add Portrait</span>
                  </div>
                )}

                {/* Vertical gradient on the right edge of the portrait fading into card background */}
                <div className="absolute inset-y-0 right-0 w-12 sm:w-16 bg-gradient-to-r from-transparent via-dnd-card/50 to-dnd-card pointer-events-none z-10" />

                {/* Hover overlay to change avatar with soft right gradient */}
                <button
                  type="button"
                  onClick={() => portraitInputRef.current?.click()}
                  aria-label="Upload character portrait"
                  title="Click to upload portrait (auto-compressed to 256px WebP)"
                  className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer focus:outline-none focus:opacity-100"
                >
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-black/75 text-slate-200 text-[10px] shadow">
                    <Camera size={12} className="text-dnd-gold" />
                    <span>Change</span>
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

              {/* Right: Info container (Name, Level, Actions, Multiclass, Identity fields) */}
              <div className="flex-1 min-w-0 p-2.5 sm:p-3 flex flex-col justify-between space-y-2">
                {/* Row 1: Name / Level + Actions */}
                <div ref={headerRowRef} className={`flex min-w-0 items-center gap-2 ${isEditing ? 'flex-wrap' : ''}`}>
                  <div className={`flex min-w-0 items-center space-x-2.5 ${isEditing ? 'flex-wrap gap-y-1' : 'flex-1'}`}>
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

                  {/* Actions (aligned right) */}
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
                          <UserPen size={11} className="text-slate-400" />
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

                {/* Row 2: Multiclass Rows */}
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

                {/* Row 3: Identity Metadata Fields (Race above Subclass & Background) */}
                <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px]">
                  <div>
                    <label htmlFor="sheet-id-race" className="block text-[9px] text-slate-400 mb-0.5">
                      Race / Species
                    </label>
                    {isEditing ? (
                      <input
                        id="sheet-id-race"
                        type="text"
                        placeholder="e.g. High Elf"
                        value={identity.race || ''}
                        onChange={(e) => handleIdentityChange('race', e.target.value)}
                        className="w-full px-2 py-0.5 rounded-lg bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                      />
                    ) : (
                      <div className="w-full px-2 py-0.5 rounded-lg bg-dnd-panel/60 text-slate-200 text-xs truncate min-h-[24px] flex items-center">
                        {identity.race || <span className="text-slate-500 italic">None</span>}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="sheet-id-subclass" className="block text-[9px] text-slate-400 mb-0.5">
                        Subclass / Tradition
                      </label>
                      {isEditing ? (
                        <input
                          id="sheet-id-subclass"
                          type="text"
                          placeholder="e.g. Chronurgy"
                          value={identity.subclass || ''}
                          onChange={(e) => handleIdentityChange('subclass', e.target.value)}
                          className="w-full px-2 py-0.5 rounded-lg bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                        />
                      ) : (
                        <div className="w-full px-2 py-0.5 rounded-lg bg-dnd-panel/60 text-slate-200 text-xs truncate min-h-[24px] flex items-center">
                          {identity.subclass || <span className="text-slate-500 italic">None</span>}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="sheet-id-background" className="block text-[9px] text-slate-400 mb-0.5">
                        Background
                      </label>
                      {isEditing ? (
                        <input
                          id="sheet-id-background"
                          type="text"
                          placeholder="e.g. Sage"
                          value={identity.background || ''}
                          onChange={(e) => handleIdentityChange('background', e.target.value)}
                          className="w-full px-2 py-0.5 rounded-lg bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                        />
                      ) : (
                        <div className="w-full px-2 py-0.5 rounded-lg bg-dnd-panel/60 text-slate-200 text-xs truncate min-h-[24px] flex items-center">
                          {identity.background || <span className="text-slate-500 italic">None</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-accordion Card: Character Lore */}
            <div ref={loreRef} className="character-lore-card w-full rounded-lg bg-dnd-card px-3 py-1.5 shadow-sm">
              <div className="flex items-center justify-between min-h-[26px]">
                <button
                  type="button"
                  onClick={() => setIsLoreCollapsed(!isLoreCollapsed)}
                  className="flex items-center space-x-1.5 text-left group focus:outline-none"
                  aria-label={isLoreCollapsed ? 'Expand Character Lore' : 'Collapse Character Lore'}
                  title={isLoreCollapsed ? 'Click to expand character lore' : 'Click to collapse character lore'}
                >
                  <FingerprintPattern size={13} className="text-dnd-gold group-hover:scale-110 transition-transform flex-shrink-0" />
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-dnd-gold-light transition-colors">
                    Character Lore
                  </h4>
                  <ChevronDown
                    size={12}
                    className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${
                      isLoreCollapsed ? '-rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Edit Lore Action Button */}
                <div className="flex items-center space-x-1.5">
                  {isEditingLore ? (
                    <>
                      <button
                        type="button"
                        aria-label="Save Character Lore"
                        onClick={handleSaveLore}
                        className="flex items-center px-2 py-0.5 rounded-md bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light text-xs font-medium transition-colors shadow-sm cursor-pointer"
                        title="Done editing lore"
                      >
                        <Check size={12} className="mr-1" />
                        Done
                      </button>
                      <button
                        type="button"
                        aria-label="Cancel Editing Character Lore"
                        onClick={handleCancelLore}
                        className="p-1 rounded-md bg-dnd-panel hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        title="Cancel editing lore"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      aria-label="Edit Character Lore"
                      onClick={() => {
                        setIsLoreCollapsed(false);
                        setLoreDraft(identity.lore || '');
                        setIsEditingLore(true);
                      }}
                      className="p-1 rounded-md bg-dnd-panel/60 hover:bg-dnd-panel text-slate-400 hover:text-dnd-gold transition-colors cursor-pointer"
                      title="Edit character lore"
                    >
                      <UserPen size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-accordion collapsible body */}
              <div
                className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
                  !isLoreCollapsed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pt-2 mt-2 border-t border-white/5">
                    {isEditingLore ? (
                      <div className="space-y-1.5">
                        <textarea
                          value={loreDraft}
                          onChange={(e) => setLoreDraft(e.target.value)}
                          placeholder="Write character backstory, personality traits, appearance, or campaign lore..."
                          rows={4}
                          autoFocus
                          aria-label="Character Lore Text Editor"
                          className="w-full bg-dnd-panel rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold/60 resize-y leading-relaxed font-sans min-h-[80px]"
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setIsLoreCollapsed(false);
                          setLoreDraft(identity.lore || '');
                          setIsEditingLore(true);
                        }}
                        className="cursor-pointer group/lore"
                      >
                        {identity.lore && identity.lore.trim().length > 0 ? (
                          <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed px-0.5 py-1">
                            {identity.lore}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic px-0.5 py-1 hover:text-slate-400 transition-colors">
                            No character lore written yet. Click to write backstory, personality traits, or notes...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
        onExport={onExport}
        onImport={onImport}
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

export default React.memo(CharacterSheetHeader);
