import React, { useState, useEffect } from 'react';
import {
  ArrowUpCircle,
  X,
  Check,
  ListChecks,
  Info,
} from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { getCharacterClasses, getTotalCharacterLevel } from '../../utils/spellSlots';
import { getLevelUpChecklist, getSubclassLevel, getSubclassLabel } from '../../utils/levelUpRules';
import { loadBuilderData } from '../../utils/builderData';
import { autoAddSubclassNote } from '../../utils/subclassNotes';

function CompassRoseIcon({ size = 13, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M249.94,120.24l-27.05-6.76a95.86,95.86,0,0,0-80.37-80.37l-6.76-27a8,8,0,0,0-15.52,0l-6.76,27.05a95.86,95.86,0,0,0-80.37,80.37l-27,6.76a8,8,0,0,0,0,15.52l27.05,6.76a95.86,95.86,0,0,0,80.37,80.37l6.76,27.05a8,8,0,0,0,15.52,0l6.76-27.05a95.86,95.86,0,0,0,80.37-80.37l27.05-6.76a8,8,0,0,0,0-15.52Zm-95.49,22.9L139.31,128l15.14-15.14L215,128Zm-52.9,0L41,128l60.57-15.14L116.69,128ZM205.77,109.2,158.6,97.4,146.8,50.23A79.88,79.88,0,0,1,205.77,109.2Zm-62.63-7.65L128,116.69l-15.14-15.14L128,41ZM109.2,50.23,97.4,97.4,50.23,109.2A79.88,79.88,0,0,1,109.2,50.23Zm-59,96.57L97.4,158.6l11.8,47.17A79.88,79.88,0,0,1,50.23,146.8Zm62.63,7.65L128,139.31l15.14,15.14L128,215Zm33.94,51.32,11.8-47.17,47.17-11.8A79.88,79.88,0,0,1,146.8,205.77Z" />
    </svg>
  );
}

const ALL_CLASSES = [
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

export default function LevelUpModal({
  isOpen,
  onClose,
  character,
  initialMode = 'levelup',
  onConfirmLevelUp,
  onUpdateCharacter,
  onShowToast,
}) {
  useScrollLock(isOpen);

  const classes = getCharacterClasses(character);
  const totalLevel = Number.isFinite(getTotalCharacterLevel(character))
    ? getTotalCharacterLevel(character)
    : 1;

  const unselectedClasses = ALL_CLASSES.filter(
    (cls) => !classes.some((c) => c.className === cls)
  );

  const [mode, setMode] = useState(initialMode);
  const [levelUpTarget, setLevelUpTarget] = useState(classes[0]?.className || 'Wizard');
  const [newMulticlassChoice, setNewMulticlassChoice] = useState(unselectedClasses[0] || 'Fighter');
  const [guideClass, setGuideClass] = useState(classes[0]?.className || 'Wizard');
  const [guideClassLevel, setGuideClassLevel] = useState(classes[0]?.level || 1);

  const [allClasses, setAllClasses] = useState([]);
  const [chosenSubclass, setChosenSubclass] = useState('');
  const [isCustomSubclass, setIsCustomSubclass] = useState(false);
  const [customSubclassText, setCustomSubclassText] = useState('');

  useEffect(() => {
    let active = true;
    loadBuilderData()
      .then((data) => {
        if (!active) return;
        if (data?.classes && data.classes.length > 0) {
          setAllClasses(data.classes);
        } else {
          import('../../../public/data/classes.json')
            .then((m) => {
              if (active && m.default) setAllClasses(m.default);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (active) {
          import('../../../public/data/classes.json')
            .then((m) => {
              if (active && m.default) setAllClasses(m.default);
            })
            .catch(() => {});
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const ruleset = character?.ruleset || '2024';
  const targetClassName = levelUpTarget === '__new_class__' ? newMulticlassChoice : levelUpTarget;
  const targetClassIdx = classes.findIndex((c) => c.className === targetClassName);
  const currentLevel = targetClassIdx >= 0 ? classes[targetClassIdx].level : 0;
  const nextLevel = targetClassIdx >= 0 ? currentLevel + 1 : 1;
  const reqSubclassLevel = getSubclassLevel(targetClassName, ruleset);
  const isSubclassEligible = nextLevel >= reqSubclassLevel;
  const currentClassSubclass = (targetClassIdx >= 0 ? classes[targetClassIdx]?.subclass : '')
    || (targetClassIdx === 0 ? character?.sheet?.identity?.subclass : '')
    || '';

  // Class data and subclasses for target class
  const classRecord = allClasses.find((c) => c.name === targetClassName && (!ruleset || c.edition === ruleset))
    || allClasses.find((c) => c.name === targetClassName);
  const availableSubclasses = classRecord?.subclasses || [];

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      const defaultTarget = classes[0]?.className || 'Wizard';
      setLevelUpTarget(defaultTarget);
      setGuideClass(defaultTarget);
      setGuideClassLevel(classes[0]?.level || 1);
      setNewMulticlassChoice(unselectedClasses[0] || 'Fighter');
      setChosenSubclass(currentClassSubclass || '');
      setIsCustomSubclass(false);
      setCustomSubclassText('');
    }
  }, [isOpen, initialMode, character?.id]);

  useEffect(() => {
    if (isOpen) {
      setChosenSubclass(currentClassSubclass || '');
      setIsCustomSubclass(false);
      setCustomSubclassText('');
    }
  }, [levelUpTarget, newMulticlassChoice, currentClassSubclass]);

  if (!isOpen || !character) return null;

  const conScore = character.abilities?.con ?? 10;
  const conMod = Math.floor((conScore - 10) / 2);

  const handlePerformLevelUp = () => {
    if (totalLevel >= 20) {
      onClose();
      return;
    }

    let updatedClasses = [];
    let leveledClassName = '';
    let leveledClassLevel = 1;

    const userPickedSubclass = Boolean(
      isCustomSubclass ? customSubclassText.trim() : chosenSubclass.trim()
    );

    const finalSubclass = isCustomSubclass
      ? customSubclassText.trim()
      : (chosenSubclass || currentClassSubclass || '');

    if (levelUpTarget === '__new_class__') {
      if (!newMulticlassChoice) return;
      leveledClassName = newMulticlassChoice;
      leveledClassLevel = 1;
      const newCls = { className: newMulticlassChoice, level: 1 };
      if (finalSubclass) newCls.subclass = finalSubclass;
      updatedClasses = [...classes, newCls];
    } else {
      leveledClassName = levelUpTarget;
      updatedClasses = classes.map((c) => {
        if (c.className === levelUpTarget) {
          leveledClassLevel = c.level + 1;
          const updated = { ...c, level: c.level + 1 };
          if (finalSubclass) {
            updated.subclass = finalSubclass;
          }
          return updated;
        }
        return c;
      });
    }

    const nextTotalLevel = updatedClasses.reduce((sum, c) => sum + c.level, 0);

    const updatedChecklist = {
      ...(character.levelUpChecklist || {}),
    };

    if (isSubclassEligible) {
      const targetReqSubclassLevel = getSubclassLevel(leveledClassName, ruleset);
      const subclassTaskId = `subclass-${leveledClassName}-${targetReqSubclassLevel}`;
      if (userPickedSubclass) {
        updatedChecklist[subclassTaskId] = true;
      } else {
        delete updatedChecklist[subclassTaskId];
      }
    }

    const updatedChar = {
      ...character,
      className: updatedClasses[0].className,
      level: nextTotalLevel,
      classes: updatedClasses,
      levelUpChecklist: updatedChecklist,
    };

    if (character.sheet) {
      const updatedSheet = {
        ...character.sheet,
        identity: {
          ...(character.sheet.identity || {}),
        },
      };
      if (targetClassIdx === 0 || classes.length === 1) {
        if (finalSubclass) {
          updatedSheet.identity.subclass = finalSubclass;
        }
      }
      updatedChar.sheet = updatedSheet;
    }

    let finalChar = updatedChar;
    if (finalSubclass) {
      const subObj = availableSubclasses.find(
        (s) => s.name === finalSubclass || s.shortName === finalSubclass
      );
      const prevNotesCount = Array.isArray(updatedChar.sheet?.notes) ? updatedChar.sheet.notes.length : 0;
      finalChar = autoAddSubclassNote({
        character: updatedChar,
        className: leveledClassName,
        subclassName: finalSubclass,
        subclassObj: subObj,
      });
      const nextNotesCount = Array.isArray(finalChar.sheet?.notes) ? finalChar.sheet.notes.length : 0;
      if (nextNotesCount > prevNotesCount) {
        onShowToast?.(`Added ${finalSubclass} features to Notes`, 'success');
      }
    }

    onConfirmLevelUp(finalChar);
    onClose();
  };

  const handleSelectGuideClass = (clsItem) => {
    setGuideClass(clsItem.className);
    setGuideClassLevel(clsItem.level);
  };

  const checklistTasks = getLevelUpChecklist({
    className: guideClass,
    classLevel: guideClassLevel,
    totalLevel,
    conMod,
    ruleset,
  });

  const checklistState = character.levelUpChecklist || {};

  const handleToggleTask = (taskId) => {
    const nextState = {
      ...checklistState,
      [taskId]: !checklistState[taskId],
    };
    onUpdateCharacter({
      ...character,
      levelUpChecklist: nextState,
    });
  };

  const handleDismissAll = () => {
    const nextState = { ...checklistState };
    for (const task of checklistTasks) {
      if (task.type !== 'passive') {
        nextState[task.id] = true;
      }
    }
    onUpdateCharacter({
      ...character,
      levelUpChecklist: nextState,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in overscroll-contain">
      <div className="bg-dnd-card rounded-2xl p-4 sm:p-5 max-w-md w-full shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center space-x-2">
            {mode === 'levelup' ? (
              <ArrowUpCircle size={18} className="text-dnd-gold" />
            ) : (
              <ListChecks size={18} className="text-dnd-gold" />
            )}
            <h3 className="text-sm sm:text-base font-bold text-dnd-ivory font-display">
              {mode === 'levelup' ? 'Level Up!' : 'Level-Up Checklist'}
            </h3>
            {mode === 'guide' && (
              <span className="text-xs text-slate-400 ml-1 font-normal">
                {guideClass} Lvl {guideClassLevel}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Mode 1: Class Selection */}
        {mode === 'levelup' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 font-medium">
              Choose Class for Level {totalLevel + 1}:
            </p>

            <div className="space-y-2">
              {/* Existing classes */}
              {classes.map((c) => (
                <label
                  key={c.className}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all text-xs ${
                    levelUpTarget === c.className
                      ? 'bg-dnd-panel shadow-sm ring-1 ring-white/20 text-dnd-ivory'
                      : 'bg-dnd-panel/40 text-slate-300 hover:bg-dnd-panel/70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="radio"
                      name="levelUpClassChoice"
                      value={c.className}
                      checked={levelUpTarget === c.className}
                      onChange={() => setLevelUpTarget(c.className)}
                      className="text-dnd-gold focus:ring-0 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-100">{c.className}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Lvl {c.level} → <span className="text-dnd-gold font-bold">Lvl {c.level + 1}</span>
                  </span>
                </label>
              ))}

              {/* Multiclass into new class option */}
              {unselectedClasses.length > 0 && totalLevel < 20 && (
                <label
                  className={`flex flex-col gap-2 p-2.5 rounded-lg cursor-pointer transition-all text-xs ${
                    levelUpTarget === '__new_class__'
                      ? 'bg-dnd-panel shadow-sm ring-1 ring-white/20 text-dnd-ivory'
                      : 'bg-dnd-panel/40 text-slate-300 hover:bg-dnd-panel/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="levelUpClassChoice"
                        value="__new_class__"
                        checked={levelUpTarget === '__new_class__'}
                        onChange={() => setLevelUpTarget('__new_class__')}
                        className="text-dnd-gold focus:ring-0 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-100">+ New Class (Multiclass)</span>
                    </div>
                    <span className="text-[11px] text-dnd-gold font-bold">Lvl 1</span>
                  </div>

                  {levelUpTarget === '__new_class__' && (
                    <select
                      value={newMulticlassChoice}
                      onChange={(e) => setNewMulticlassChoice(e.target.value)}
                      className="mt-1 w-full bg-dnd-card rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none cursor-pointer"
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

            {/* Subclass Selection Prompt when leveling to or beyond subclass level */}
            {isSubclassEligible && (
              <div className="p-3 rounded-xl bg-dnd-panel/60 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <CompassRoseIcon size={13} className="text-dnd-gold shrink-0" />
                    <span className="text-xs font-bold text-dnd-gold">
                      Choose {getSubclassLabel(targetClassName)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium bg-dnd-card/80 px-1.5 py-0.5 rounded shadow-sm">
                    Level {reqSubclassLevel}+
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">
                  {currentClassSubclass
                    ? `Current: ${currentClassSubclass}. Select below to change your archetype.`
                    : `You've unlocked your subclass! Select your ${getSubclassLabel(targetClassName)}:`}
                </p>

                <select
                  aria-label={`Select ${getSubclassLabel(targetClassName)}`}
                  value={isCustomSubclass ? '__custom__' : (chosenSubclass || '')}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomSubclass(true);
                    } else {
                      setIsCustomSubclass(false);
                      setChosenSubclass(e.target.value);
                    }
                  }}
                  className="w-full bg-dnd-card rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-dnd-gold/40 cursor-pointer shadow-sm"
                >
                  <option value="" className="bg-dnd-panel">-- Select Subclass --</option>
                  {availableSubclasses.map((s) => (
                    <option key={s.id || `${s.name}-${s.source}`} value={s.name} className="bg-dnd-panel">
                      {s.name} {s.source ? `(${s.source})` : ''}
                    </option>
                  ))}
                  <option value="__custom__" className="bg-dnd-panel">+ Custom / Other Subclass</option>
                </select>

                {isCustomSubclass && (
                  <input
                    type="text"
                    placeholder="Custom subclass name..."
                    value={customSubclassText}
                    onChange={(e) => setCustomSubclassText(e.target.value)}
                    className="w-full bg-dnd-card rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-dnd-gold/40 placeholder:text-slate-500"
                    aria-label="Custom Subclass Name"
                  />
                )}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-dnd-panel/60 hover:bg-dnd-panel text-slate-300 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePerformLevelUp}
                className="px-3.5 py-1.5 rounded-lg bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-semibold text-xs transition-colors shadow"
              >
                Level Up
              </button>
            </div>
          </div>
        )}

        {/* Mode 2: Level Guide Checklist */}
        {mode === 'guide' && (
          <div className="space-y-3">
            {/* Multiclass class tabs if character has multiple classes */}
            {classes.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                {classes.map((clsItem) => (
                  <button
                    key={clsItem.className}
                    type="button"
                    onClick={() => handleSelectGuideClass(clsItem)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      guideClass === clsItem.className
                        ? 'bg-dnd-gold text-slate-950 shadow-sm'
                        : 'bg-dnd-panel text-slate-300 hover:text-dnd-ivory'
                    }`}
                  >
                    {clsItem.className} (Lvl {clsItem.level})
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-300">
              Pending choices for your character sheet from your recent level-up:
            </p>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {checklistTasks.map((task) => {
                const isAction = task.type !== 'passive';
                const isChecked = Boolean(checklistState[task.id]);

                if (!isAction) {
                  return (
                    <div
                      key={task.id}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-dnd-panel/40 select-none transition-colors"
                    >
                      <div className="w-5 flex items-center justify-center shrink-0">
                        <Info size={15} className="text-slate-400" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-slate-300">
                            {task.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium bg-dnd-card/60 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                            {task.badge || task.category}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-400">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <label
                    key={task.id}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-dnd-panel/40 opacity-70'
                        : 'bg-dnd-panel shadow-sm hover:bg-dnd-panel/90'
                    }`}
                  >
                    <div className="w-5 flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTask(task.id)}
                        className="w-4 h-4 rounded text-dnd-gold bg-dnd-card border-0 focus:ring-0 cursor-pointer"
                        aria-label={task.title}
                      />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold ${
                            isChecked
                              ? 'line-through text-slate-400'
                              : 'text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-[10px] text-dnd-gold font-medium bg-dnd-card px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                          {task.badge || task.category}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] leading-relaxed ${
                          isChecked ? 'line-through text-slate-500' : 'text-slate-300'
                        }`}
                      >
                        {task.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              {checklistTasks.some((t) => t.type !== 'passive') && (
                <button
                  type="button"
                  onClick={handleDismissAll}
                  className="text-xs text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                  title="Mark all current tasks as done"
                >
                  Dismiss All
                </button>
              )}
              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-[11px] text-slate-400">
                  {checklistTasks.filter((t) => t.type !== 'passive' && checklistState[t.id]).length} of{' '}
                  {checklistTasks.filter((t) => t.type !== 'passive').length} Done
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center px-3.5 py-1.5 rounded-lg bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-semibold text-xs transition-colors shadow cursor-pointer"
                >
                  <Check size={13} className="mr-1" />
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
