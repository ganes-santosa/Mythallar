import React, { useState, useEffect, useRef } from 'react';
import { UserPen, Check, X, Plus, Trash2, ArrowUpCircle, ChevronDown, UserRound, Users, AlertCircle, Snowflake } from 'lucide-react';
import CharacterManagerModal from './CharacterManagerModal';
import LevelUpModal from '../Modal/LevelUpModal';
import { getCharacterClasses, getTotalCharacterLevel } from '../../utils/spellSlots';
import { getPendingLevelUpTasks } from '../../utils/levelUpRules';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';
import useAutoScrollOnExpand from '../../hooks/useAutoScrollOnExpand';

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

function CharacterHeader({
  activeCharacter,
  profiles,
  onUpdateCharacter,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onExport,
  onImport,
}) {
  // Single card edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(activeCharacter?.name || '');

  // Character Manager Modal
  const [showManagerModal, setShowManagerModal] = useState(false);

  // Level Up popup modal
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpModalMode, setLevelUpModalMode] = useState('levelup');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const headerAccordionRef = useAutoScrollOnExpand(!isCollapsed);

  // Adaptive collision detection for header card items
  const headerRowRef = useRef(null);
  const nameRef = useRef(null);
  const levelRef = useRef(null);
  const actionsRef = useRef(null);
  const [showLevelText, setShowLevelText] = useState(true);
  const [showButtonText, setShowButtonText] = useState(true);

  const classes = getCharacterClasses(activeCharacter);
  const totalLevel = Number.isFinite(getTotalCharacterLevel(activeCharacter))
    ? getTotalCharacterLevel(activeCharacter)
    : 0;

  const unselectedClasses = CASTER_CLASSES.filter(
    (cls) => !classes.some((c) => c.className === cls)
  );

  const pendingTasks = getPendingLevelUpTasks(activeCharacter);
  const pendingCount = pendingTasks.length;

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

  const isSimulacrumActive = Boolean(activeCharacter?.simulacrum?.active);

  const handleToggleSimulacrum = () => {
    if (!activeCharacter) return;
    const currentSim = activeCharacter.simulacrum || {};
    const nextActive = !isSimulacrumActive;

    let vitals = currentSim.vitals;
    if (!vitals) {
      const casterVitals = activeCharacter.sheet?.vitals || {};
      const baseMax = Number.isFinite(casterVitals.hpMax) ? casterVitals.hpMax : 10;
      const hpMaxBuff = Number.isFinite(casterVitals.hpMaxBuff) ? casterVitals.hpMaxBuff : 0;
      const halfHp = Math.max(1, Math.floor((baseMax + hpMaxBuff) / 2));
      vitals = {
        hpCurrent: halfHp,
        hpMax: halfHp,
        hpMaxBuff: 0,
        hpTemp: 0,
        ac: casterVitals.ac ?? 10,
        acBonus: casterVitals.acBonus ?? 0,
        acFormula: casterVitals.acFormula ?? '',
        initiativeOverride: casterVitals.initiativeOverride ?? null,
        spellcastingAbility: casterVitals.spellcastingAbility || 'int',
        spellAttackOverride: casterVitals.spellAttackOverride ?? null,
        spellAttackBonus: casterVitals.spellAttackBonus ?? 0,
        spellDcOverride: casterVitals.spellDcOverride ?? null,
        spellDcBonus: casterVitals.spellDcBonus ?? 0,
      };
    }

    const trimmed = nameDraft.trim();
    const updatedName = (isEditing && trimmed && trimmed !== activeCharacter.name) ? trimmed : activeCharacter.name;

    onUpdateCharacter({
      ...activeCharacter,
      name: updatedName,
      simulacrum: {
        ...currentSim,
        active: nextActive,
        vitals,
        customSlots: currentSim.customSlots || {},
        slotsUsed: currentSim.slotsUsed || {},
      },
    });
  };

  // ponytail: dynamically measure actual element widths to hide level label first, then button text, only when clashing
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
      // actions width when button text labels are hidden is ~80px (3 icon buttons)
      const actionsMinIconWidth = 82;
      const actionsFullWidth = showButtonText ? actionsWidth : actionsWidth + naturalBtnLabelsWidth;

      const gapBudget = 18;

      // Stage 1: Ample space -> show Character Level AND button labels
      const fullWidthNeeded = nameWidth + naturalLevelWidth + actionsFullWidth + gapBudget;
      if (rowWidth >= fullWidthNeeded) {
        setShowLevelText(true);
        setShowButtonText(true);
        return;
      }

      // Stage 2: Character Level clashes -> hide it first, keep button labels
      const withoutLevelNeeded = nameWidth + actionsFullWidth + 8;
      if (rowWidth >= withoutLevelNeeded) {
        setShowLevelText(false);
        setShowButtonText(true);
        return;
      }

      // Stage 3: Button text labels also clash -> hide button text labels, keep icons
      const minIconNeeded = nameWidth + actionsMinIconWidth + 8;
      if (rowWidth >= minIconNeeded) {
        setShowLevelText(false);
        setShowButtonText(false);
        return;
      }

      // Stage 4: Constrained further -> icons only, character name truncates
      setShowLevelText(false);
      setShowButtonText(false);
    };

    checkFit();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(checkFit);
    observer.observe(row);
    return () => observer.disconnect();
  }, [activeCharacter?.name, totalLevel, isCollapsed, isEditing, showButtonText]);

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
    setLevelUpModalMode('levelup');
    setShowLevelUpModal(true);
  };

  const handleOpenGuideModal = () => {
    setLevelUpModalMode('guide');
    setShowLevelUpModal(true);
  };

  if (!activeCharacter) return null;

  return (
    <div ref={headerAccordionRef} className="relative p-3 rounded-lg bg-dnd-panel transition-all">
      <div className="flex items-center gap-2 max-md:min-h-[21px]">
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
            {/* Highlight Character Profile Card */}
            <div className="character-profile-card w-full p-2.5 sm:p-3 rounded-xl bg-dnd-card shadow-sm">
              {/* Name Title & Header Actions */}
        <div ref={headerRowRef} className={`flex min-w-0 items-center gap-2 ${isEditing ? 'flex-wrap' : ''}`}>
          {/* Left: Name & Character Level next to it */}
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
              <div className={`relative inline-flex items-center min-w-0 ${pendingCount > 0 ? 'pr-4' : ''}`}>
                <h2 ref={nameRef} className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight truncate max-md:whitespace-normal max-md:break-words min-w-0 font-display">
                  {activeCharacter.name}
                </h2>
                {pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenGuideModal}
                    className="absolute top-0 right-0 p-0.5 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title={`${pendingCount} pending choice${pendingCount > 1 ? 's' : ''} from Level ${totalLevel}`}
                    aria-label="Level-Up Checklist"
                  >
                    <AlertCircle size={12} className="hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            )}

            {!isEditing && (
              <span
                ref={levelRef}
                className={`character-level-label text-xs text-slate-400 font-normal whitespace-nowrap select-none shrink-0 ${
                  showLevelText ? '' : 'hidden'
                }`}
              >
                Character Level <span className="text-dnd-gold ml-0.5 font-normal">{totalLevel}</span>
              </span>
            )}
          </div>

          {/* Right: Edit & Level Up Actions (aligned right) */}
          <div ref={actionsRef} className={`flex shrink-0 items-center space-x-1.5 ml-auto ${isEditing ? 'character-edit-actions' : `max-md:absolute max-md:top-3 max-md:right-3 ${isCollapsed ? 'max-md:hidden' : ''}`}`}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  aria-label="Toggle Simulacrum"
                  aria-pressed={isSimulacrumActive}
                  onClick={handleToggleSimulacrum}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap ${
                    isSimulacrumActive
                      ? 'bg-cyan-950/80 text-cyan-200 hover:bg-cyan-900/90'
                      : 'bg-dnd-panel/80 text-slate-300 hover:text-slate-100 hover:bg-dnd-panel'
                  }`}
                  title={isSimulacrumActive ? 'Disable Simulacrum' : 'Enable Simulacrum'}
                >
                  <Snowflake size={12} className={isSimulacrumActive ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>Simulacrum</span>
                  <span
                    aria-hidden="true"
                    className={`relative inline-flex h-3.5 w-6 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                      isSimulacrumActive ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                        isSimulacrumActive ? 'translate-x-3' : 'translate-x-0.5'
                      }`}
                    />
                  </span>
                </button>
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
                  className="p-1 rounded-md bg-dnd-panel/80 hover:bg-dnd-panel text-slate-400 hover:text-dnd-gold transition-colors shadow-sm"
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
                  className="p-1 rounded-md bg-dnd-panel/80 hover:bg-dnd-panel text-slate-400 hover:text-dnd-gold transition-colors flex items-center justify-center cursor-pointer shadow-sm max-md:bg-dnd-hover max-md:hover:bg-dnd-hover/70"
                >
                  <Users size={13} />
                </button>

                <button
                  type="button"
                  aria-label="Edit Profile"
                  onClick={() => setIsEditing(true)}
                  className="p-1 rounded-md bg-dnd-panel/80 hover:bg-dnd-panel text-slate-400 hover:text-dnd-gold transition-colors flex items-center justify-center cursor-pointer shadow-sm max-md:bg-dnd-hover max-md:hover:bg-dnd-hover/70"
                  title="Edit character name and classes"
                >
                  <UserPen size={13} />
                </button>

                {totalLevel < 20 && (
                  <button
                    type="button"
                    onClick={handleOpenLevelUpModal}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-dnd-panel/80 hover:bg-dnd-panel text-slate-400 hover:text-dnd-gold text-xs font-normal transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer shadow-sm max-md:p-1 max-md:rounded-md max-md:justify-center max-md:bg-dnd-hover max-md:hover:bg-dnd-hover/70"
                    title="Level up this character"
                  >
                    <ArrowUpCircle size={12} className="flex-shrink-0 transition-colors max-md:!w-[13px] max-md:!h-[13px]" />
                    {showButtonText && <span className="character-btn-label max-md:hidden">Level Up</span>}
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
                    className="flex items-center space-x-1 bg-dnd-panel rounded-md px-1.5 py-0.5 text-xs animate-in fade-in"
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

                    {/* Remove Class button (only if > 1 class) */}
                    {classes.length > 1 && (
                      <ClassDeleteButton
                        className={clsItem.className}
                        onRemove={() => handleRemoveClass(idx)}
                      />
                    )}
                  </div>
                );
              })}

              {/* Add Class Button (shown during edit mode) */}
              {classes.length < CASTER_CLASSES.length && totalLevel < 20 && (
                <button
                  type="button"
                  onClick={handleAddClass}
                  className="flex items-center px-2 py-0.5 rounded-md bg-dnd-panel/60 hover:bg-dnd-panel text-slate-400 hover:text-dnd-gold text-xs transition-colors"
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
      </div>
          </div>
        </div>
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
        onExport={onExport}
        onImport={onImport}
      />

      {/* Level Up & Guide Modal */}
      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        character={activeCharacter}
        initialMode={levelUpModalMode}
        onConfirmLevelUp={onUpdateCharacter}
        onUpdateCharacter={onUpdateCharacter}
      />
    </div>
  );
}

export default React.memo(CharacterHeader);



