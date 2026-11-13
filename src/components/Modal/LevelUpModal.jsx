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
import { getLevelUpChecklist } from '../../utils/levelUpRules';

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

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      const defaultTarget = classes[0]?.className || 'Wizard';
      setLevelUpTarget(defaultTarget);
      setGuideClass(defaultTarget);
      setGuideClassLevel(classes[0]?.level || 1);
      setNewMulticlassChoice(unselectedClasses[0] || 'Fighter');
    }
  }, [isOpen, initialMode, character?.id]);

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

    if (levelUpTarget === '__new_class__') {
      if (!newMulticlassChoice) return;
      leveledClassName = newMulticlassChoice;
      leveledClassLevel = 1;
      updatedClasses = [...classes, { className: newMulticlassChoice, level: 1 }];
    } else {
      leveledClassName = levelUpTarget;
      updatedClasses = classes.map((c) => {
        if (c.className === levelUpTarget) {
          leveledClassLevel = c.level + 1;
          return { ...c, level: c.level + 1 };
        }
        return c;
      });
    }

    const nextTotalLevel = updatedClasses.reduce((sum, c) => sum + c.level, 0);
    const updatedChar = {
      ...character,
      className: updatedClasses[0].className,
      level: nextTotalLevel,
      classes: updatedClasses,
    };

    onConfirmLevelUp(updatedChar);
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
