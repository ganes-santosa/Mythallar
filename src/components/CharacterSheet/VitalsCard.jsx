import React, { useState, useEffect, useRef } from 'react';
import { Shield, Heart, Zap, Lightbulb, Footprints, Flame, X, Plus, Activity, Edit3 } from 'lucide-react';
import { getAbilityModifier, formatModifier } from '../../utils/dndCalculations';
import { normalizeSpeeds } from '../../utils/storage';

const OPTIONAL_SPEED_TYPES = [
  { key: 'climb', label: 'Climbing' },
  { key: 'swim', label: 'Swimming' },
  { key: 'fly', label: 'Flying' },
  { key: 'burrow', label: 'Burrowing' },
];

export default function VitalsCard({ vitals, dexScore = 10, isEditing = false, onUpdateVitals }) {
  const currentVitals = vitals || {
    hpCurrent: 10,
    hpMax: 10,
    hpMaxBuff: 0,
    hpTemp: 0,
    ac: 10,
    acFormula: '',
    speed: 30,
    initiativeOverride: null,
    hitDice: { current: 1, max: 1, die: 'd6' },
    deathSaves: { successes: 0, failures: 0 },
    defenses: [],
    inspiration: 0,
    conditions: [],
  };

  const baseMax = Number.isFinite(currentVitals.hpMax) ? currentVitals.hpMax : 10;
  const hpMaxBuff = Number.isFinite(currentVitals.hpMaxBuff) ? currentVitals.hpMaxBuff : 0;
  const effectiveMax = Math.max(1, baseMax + hpMaxBuff);
  const hpCurrent = Number.isFinite(currentVitals.hpCurrent) ? currentVitals.hpCurrent : 10;
  const hpTemp = Number.isFinite(currentVitals.hpTemp) ? currentVitals.hpTemp : 0;

  const [quickHpAmount, setQuickHpAmount] = useState('');
  const [isEditingAcNote, setIsEditingAcNote] = useState(false);
  const [acNoteDraft, setAcNoteDraft] = useState('');

  const speeds = normalizeSpeeds(currentVitals);
  const [isAddingSpeed, setIsAddingSpeed] = useState(false);
  const [newSpeedType, setNewSpeedType] = useState('fly');
  const [newSpeedValue, setNewSpeedValue] = useState('30');

  const availableSpeedTypes = OPTIONAL_SPEED_TYPES.filter((t) => speeds[t.key] === undefined);

  const handleUpdateSpeed = (key, val) => {
    const nextSpeeds = { ...speeds };
    if (val === null || val === undefined) {
      delete nextSpeeds[key];
    } else {
      nextSpeeds[key] = Math.max(0, Number(val) || 0);
    }
    onUpdateVitals?.({
      ...currentVitals,
      speed: nextSpeeds.walk ?? 30,
      speeds: nextSpeeds,
    });
  };

  const handleSaveSpeed = (e) => {
    e.preventDefault();
    if (!newSpeedType) return;
    handleUpdateSpeed(newSpeedType, Math.max(0, Number(newSpeedValue) || 30));
    setIsAddingSpeed(false);
  };

  const [currentHpDraft, setCurrentHpDraft] = useState(String(hpCurrent));
  const [tempHpDraft, setTempHpDraft] = useState(String(hpTemp));
  const isCancelingCurrentHp = useRef(false);
  const isCancelingTempHp = useRef(false);

  useEffect(() => {
    setCurrentHpDraft(String(hpCurrent));
  }, [hpCurrent]);

  useEffect(() => {
    setTempHpDraft(String(hpTemp));
  }, [hpTemp]);

  const handleCommitCurrentHp = () => {
    if (isCancelingCurrentHp.current) {
      isCancelingCurrentHp.current = false;
      return;
    }
    const val = Number(currentHpDraft);
    if (!isNaN(val) && currentHpDraft.trim() !== '') {
      handleFieldChange('hpCurrent', Math.max(0, Math.floor(val)));
    } else {
      setCurrentHpDraft(String(hpCurrent));
    }
  };

  const handleCommitTempHp = () => {
    if (isCancelingTempHp.current) {
      isCancelingTempHp.current = false;
      return;
    }
    const val = Number(tempHpDraft);
    if (!isNaN(val) && tempHpDraft.trim() !== '') {
      handleFieldChange('hpTemp', Math.max(0, Math.floor(val)));
    } else {
      setTempHpDraft(String(hpTemp));
    }
  };

  const currentPercent = Math.min(100, Math.max(0, (hpCurrent / effectiveMax) * 100));
  const tempPercent = Math.min(100 - currentPercent, Math.max(0, (hpTemp / effectiveMax) * 100));

  const inspirationCount =
    typeof currentVitals.inspiration === 'number'
      ? currentVitals.inspiration
      : typeof currentVitals.conditions?.inspiration === 'number'
      ? currentVitals.conditions.inspiration
      : currentVitals.conditions?.inspiration
      ? 1
      : 0;

  const rawExhaustion =
    typeof currentVitals.exhaustion === 'number'
      ? currentVitals.exhaustion
      : typeof currentVitals.conditions?.exhaustion === 'number'
      ? currentVitals.conditions.exhaustion
      : 0;
  const exhaustionLevel = Math.max(0, Math.min(6, rawExhaustion));

  const activeConditions = Array.isArray(currentVitals.conditions)
    ? currentVitals.conditions
    : typeof currentVitals.conditions === 'object' && currentVitals.conditions !== null
    ? currentVitals.conditions.exhaustion > 0
      ? [`Exhausted ${currentVitals.conditions.exhaustion}`]
      : []
    : [];

  const hitDice = currentVitals.hitDice || { current: 1, max: 1, die: 'd6' };
  const deathSaves = currentVitals.deathSaves || { successes: 0, failures: 0 };
  const defenses = currentVitals.defenses || [];

  const [newDefense, setNewDefense] = useState('');
  const [isAddingDefense, setIsAddingDefense] = useState(false);
  const [newCondition, setNewCondition] = useState('');
  const [isAddingCondition, setIsAddingCondition] = useState(false);

  const initMod =
    typeof currentVitals.initiativeOverride === 'number' &&
    !isNaN(currentVitals.initiativeOverride)
      ? currentVitals.initiativeOverride
      : getAbilityModifier(dexScore);

  const handleFieldChange = (field, value) => {
    onUpdateVitals?.({
      ...currentVitals,
      [field]: value,
    });
  };

  const handleQuickDamage = () => {
    const parsed = parseInt(quickHpAmount, 10);
    if (isNaN(parsed) || parsed <= 0) return;
    let nextTemp = hpTemp;
    let nextCurrent = hpCurrent;
    if (parsed <= nextTemp) {
      nextTemp -= parsed;
    } else {
      const rem = parsed - nextTemp;
      nextTemp = 0;
      nextCurrent = Math.max(0, nextCurrent - rem);
    }
    onUpdateVitals?.({
      ...currentVitals,
      hpTemp: nextTemp,
      hpCurrent: nextCurrent,
    });
    setQuickHpAmount('');
  };

  const handleQuickHeal = () => {
    const parsed = parseInt(quickHpAmount, 10);
    if (isNaN(parsed) || parsed <= 0) return;
    if (hpCurrent >= effectiveMax) {
      setQuickHpAmount('');
      return;
    }
    const nextCurrent = Math.min(effectiveMax, hpCurrent + parsed);
    onUpdateVitals?.({
      ...currentVitals,
      hpCurrent: nextCurrent,
    });
    setQuickHpAmount('');
  };

  const handleInspirationStep = (delta) => {
    const next = Math.max(0, inspirationCount + delta);
    onUpdateVitals?.({
      ...currentVitals,
      inspiration: next,
    });
  };

  const handleExhaustionStep = (delta) => {
    const next = Math.max(0, Math.min(6, exhaustionLevel + delta));
    onUpdateVitals?.({
      ...currentVitals,
      exhaustion: next,
    });
  };

  const handleAddCondition = (e) => {
    e.preventDefault();
    if (!newCondition.trim()) return;
    const cond = newCondition.trim();
    if (!activeConditions.includes(cond)) {
      onUpdateVitals?.({
        ...currentVitals,
        conditions: [...activeConditions, cond],
      });
    }
    setNewCondition('');
    setIsAddingCondition(false);
  };

  const handleRemoveCondition = (condToRemove) => {
    onUpdateVitals?.({
      ...currentVitals,
      conditions: activeConditions.filter((c) => c !== condToRemove),
    });
  };

  const toggleDeathSave = (type, index) => {
    // index is 1, 2, or 3
    const currentCount = deathSaves[type] || 0;
    const nextCount = currentCount === index ? index - 1 : index;
    onUpdateVitals?.({
      ...currentVitals,
      deathSaves: {
        ...deathSaves,
        [type]: nextCount,
      },
    });
  };

  const changeHitDice = (delta) => {
    const maxVal = hitDice.max || 1;
    const next = Math.max(0, Math.min(maxVal, (hitDice.current || 0) + delta));
    onUpdateVitals?.({
      ...currentVitals,
      hitDice: {
        ...hitDice,
        current: next,
      },
    });
  };

  const handleAddDefense = (e) => {
    e.preventDefault();
    if (!newDefense.trim()) return;
    onUpdateVitals?.({
      ...currentVitals,
      defenses: [...defenses, newDefense.trim()],
    });
    setNewDefense('');
    setIsAddingDefense(false);
  };

  const handleRemoveDefense = (def) => {
    onUpdateVitals?.({
      ...currentVitals,
      defenses: defenses.filter((d) => d !== def),
    });
  };

  return (
    <div className="space-y-2.5 p-0.5">
      {/* Row 1: Primary Health, AC, Conditions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[12fr_6fr_6fr] gap-2 text-xs">
        {/* Hit Points Hero Card */}
        {isEditing ? (
          <div className="bg-dnd-card p-2 rounded-lg flex flex-col justify-between shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                <Heart size={12} className="text-red-400 fill-red-400/20" /> Hit Points Settings
              </span>
              <span className="text-[9px] text-slate-500 font-medium">
                Effective Max: <strong className="text-slate-200">{effectiveMax}</strong>
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 my-1">
              <div>
                <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Current</label>
                <input
                  type="number"
                  aria-label="Current HP"
                  value={hpCurrent}
                  onChange={(e) => handleFieldChange('hpCurrent', Number(e.target.value))}
                  className="w-full px-1 py-0.5 rounded bg-dnd-panel text-xs font-bold text-slate-100 text-center border border-white/10 focus:border-dnd-gold/60 outline-none"
                />
              </div>
              <div>
                <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Base Max</label>
                <input
                  type="number"
                  aria-label="Base Max HP"
                  value={baseMax}
                  onChange={(e) => handleFieldChange('hpMax', Number(e.target.value))}
                  className="w-full px-1 py-0.5 rounded bg-dnd-panel text-xs font-bold text-slate-100 text-center border border-white/10 focus:border-dnd-gold/60 outline-none"
                />
              </div>
              <div>
                <label className="text-[8px] text-amber-400 font-semibold block mb-0.5">Max HP Buff</label>
                <input
                  type="number"
                  aria-label="Max HP Buff"
                  placeholder="+0"
                  value={hpMaxBuff || ''}
                  onChange={(e) => handleFieldChange('hpMaxBuff', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-1 py-0.5 rounded bg-dnd-panel text-xs font-bold text-amber-300 text-center border border-amber-500/30 focus:border-dnd-gold/60 outline-none"
                />
              </div>
              <div>
                <label className="text-[8px] text-blue-400 font-semibold block mb-0.5">Temp HP</label>
                <input
                  type="number"
                  aria-label="Temp HP"
                  value={hpTemp}
                  onChange={(e) => handleFieldChange('hpTemp', Number(e.target.value))}
                  className="w-full px-1 py-0.5 rounded bg-dnd-panel text-xs font-bold text-blue-300 text-center border border-blue-500/30 focus:border-dnd-gold/60 outline-none"
                />
              </div>
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-white/5">
              <span>Effective Max:</span>
              <span className="font-bold text-slate-200">{effectiveMax} HP</span>
            </div>
          </div>
        ) : (
          <div className="bg-dnd-card hover:border-white/10 transition-colors p-2 rounded-lg flex items-stretch justify-between gap-2 shadow-sm sm:col-span-2 lg:col-span-1">
            {/* Left: HP Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                  <Heart size={12} className="text-red-400 fill-red-400/20" /> Hit Points
                </span>
                {hpMaxBuff !== 0 && (
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.2 rounded">
                    {hpMaxBuff > 0 ? `+${hpMaxBuff} Buff` : `${hpMaxBuff} Buff`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 my-0.5">
                {/* Sub-container 1: Current & Max */}
                <div className="bg-dnd-panel/60 hover:bg-dnd-panel/90 border border-white/5 hover:border-white/20 transition-all rounded-md px-2.5 py-1 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[8px] font-semibold text-slate-400 px-0.5 mb-0.5">
                    <span>Current</span>
                    <span>Max</span>
                  </div>
                  <div className="flex items-baseline justify-center px-0.5">
                    <input
                      type="number"
                      aria-label="Current HP"
                      value={currentHpDraft}
                      style={{ width: `${Math.max(1, String(currentHpDraft).length)}ch` }}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setCurrentHpDraft(e.target.value)}
                      onBlur={handleCommitCurrentHp}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCommitCurrentHp();
                          e.target.blur();
                        }
                        if (e.key === 'Escape') {
                          isCancelingCurrentHp.current = true;
                          setCurrentHpDraft(String(hpCurrent));
                          e.target.blur();
                        }
                      }}
                      className="text-right text-2xl font-black text-slate-100 hover:text-dnd-gold bg-transparent outline-none focus:ring-1 focus:ring-dnd-gold/60 rounded leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text transition-colors"
                    />
                    <span className="text-base text-slate-600 font-bold self-center px-1.5 select-none">/</span>
                    <div className="text-lg font-bold text-slate-400 leading-none self-center text-left">
                      {effectiveMax}
                    </div>
                  </div>
                </div>

                {/* Sub-container 2: Temp HP */}
                <div className="bg-dnd-panel/60 hover:bg-dnd-panel/90 border border-white/5 hover:border-white/20 transition-all rounded-md px-2.5 py-1 flex flex-col justify-between self-stretch min-w-[2.75rem]">
                  <div className="text-[8px] font-semibold text-blue-400 text-center mb-0.5">
                    Temp
                  </div>
                  <div className="flex items-baseline justify-center flex-1 items-center">
                    <input
                      type="number"
                      aria-label="Temp HP"
                      value={tempHpDraft}
                      style={{ width: `${Math.max(1, String(tempHpDraft).length)}ch` }}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setTempHpDraft(e.target.value)}
                      onBlur={handleCommitTempHp}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCommitTempHp();
                          e.target.blur();
                        }
                        if (e.key === 'Escape') {
                          isCancelingTempHp.current = true;
                          setTempHpDraft(String(hpTemp));
                          e.target.blur();
                        }
                      }}
                      className="text-center text-lg font-bold text-blue-300 hover:text-blue-200 bg-transparent outline-none focus:ring-1 focus:ring-blue-400/60 rounded leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Mini Health Bar */}
              <div className="bg-dnd-panel h-1.5 rounded-full overflow-hidden mt-1 border border-white/5 flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-200"
                  style={{ width: `${currentPercent}%` }}
                />
                <div
                  className="bg-blue-400 h-full transition-all duration-200"
                  style={{ width: `${tempPercent}%` }}
                />
              </div>
            </div>

            {/* Subtle Subdivision Border */}
            <div className="w-px bg-white/5 my-0.5" />

            {/* Right: Treatment A Capsule */}
            <div className="flex flex-col justify-center">
              <div className="bg-dnd-panel/60 border border-white/5 rounded-md p-1 flex flex-col gap-1 w-16 box-border">
                <button
                  type="button"
                  aria-label="Apply Damage"
                  onClick={handleQuickDamage}
                  className="w-full bg-red-950/40 hover:bg-red-900/50 border border-red-500/20 text-red-400 rounded py-0.5 text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Damage
                </button>
                <input
                  type="number"
                  aria-label="Amount"
                  placeholder="0"
                  value={quickHpAmount}
                  onChange={(e) => setQuickHpAmount(e.target.value)}
                  className="w-full text-center bg-dnd-panel/90 border border-white/10 rounded text-[10px] font-bold text-slate-100 py-0.5 outline-none focus:border-dnd-gold/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  aria-label="Apply Heal"
                  onClick={handleQuickHeal}
                  className="w-full bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/20 text-emerald-400 rounded py-0.5 text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Heal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card 2: Stacked AC & Initiative Cards */}
        <div className="flex flex-col gap-2 sm:col-span-1 lg:col-span-1">
          {/* Armor Class Card */}
          <div className="bg-dnd-card p-2 rounded-lg flex flex-col justify-between shadow-sm flex-1">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 font-bold text-slate-400">
                <Shield size={12} className="text-dnd-gold" /> AC
              </span>
              {!isEditing && !isEditingAcNote && !currentVitals.acFormula && (
                <button
                  type="button"
                  aria-label="+ Note"
                  onClick={() => {
                    setAcNoteDraft('');
                    setIsEditingAcNote(true);
                  }}
                  className="text-[10px] text-slate-400 hover:text-dnd-gold font-medium flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  <Plus size={10} /> Note
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="flex items-center gap-1.5 mt-1 mb-1">
                <input
                  type="number"
                  aria-label="Armor Class"
                  value={currentVitals.ac ?? 10}
                  onChange={(e) => handleFieldChange('ac', Number(e.target.value))}
                  className="w-12 px-1.5 py-0.5 rounded bg-dnd-panel text-sm font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
                <input
                  type="text"
                  aria-label="AC Formula Breakdown"
                  placeholder="e.g. 14 + 2 DEX"
                  value={currentVitals.acFormula ?? ''}
                  onChange={(e) => handleFieldChange('acFormula', e.target.value)}
                  className="flex-1 min-w-0 px-1 py-0.5 rounded bg-dnd-panel text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>
            ) : isEditingAcNote ? (
              <div className="mt-1 flex flex-col gap-1">
                <textarea
                  value={acNoteDraft}
                  onChange={(e) => setAcNoteDraft(e.target.value)}
                  placeholder="e.g. 14 + 2 DEX, Shield"
                  rows={2}
                  autoFocus
                  className="w-full bg-dnd-panel rounded p-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold resize-none"
                />
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingAcNote(false)}
                    className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleFieldChange('acFormula', acNoteDraft.trim());
                      setIsEditingAcNote(false);
                    }}
                    className="px-2 py-0.5 rounded bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-bold text-[10px]"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-between my-auto">
                <div className="text-2xl font-black text-slate-100 leading-none my-0.5">
                  {currentVitals.ac ?? 10}
                </div>
                {currentVitals.acFormula ? (
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span
                      onClick={() => {
                        setAcNoteDraft(currentVitals.acFormula);
                        setIsEditingAcNote(true);
                      }}
                      className="text-[11px] text-slate-300 truncate cursor-pointer hover:text-dnd-gold transition-colors flex-1"
                      title={currentVitals.acFormula}
                    >
                      {currentVitals.acFormula}
                    </span>
                    <button
                      type="button"
                      aria-label="Edit AC Note"
                      onClick={() => {
                        setAcNoteDraft(currentVitals.acFormula);
                        setIsEditingAcNote(true);
                      }}
                      className="text-slate-400 hover:text-dnd-gold p-0.5 rounded hover:bg-white/5 transition-colors flex-shrink-0"
                      title="Edit note"
                    >
                      <Edit3 size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic">Armor Class</div>
                )}
              </div>
            )}
          </div>

          {/* Initiative Card */}
          <div className="bg-dnd-card p-2 rounded-lg flex items-center justify-between shadow-sm">
            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <Zap size={11} className="text-dnd-gold" />
              <span className="hidden sm:inline">Initiative</span>
              <span className="sm:hidden" aria-label="Initiative">Init</span>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-100">
                  {formatModifier(initMod)}
                </span>
                <input
                  type="number"
                  aria-label="Initiative Override"
                  placeholder="Over"
                  value={currentVitals.initiativeOverride ?? ''}
                  onChange={(e) =>
                    handleFieldChange(
                      'initiativeOverride',
                      e.target.value === '' ? null : Number(e.target.value)
                    )
                  }
                  className="w-11 px-1 py-0.5 rounded bg-dnd-panel text-[10px] text-slate-100 text-center border border-white/10 focus:border-dnd-gold/60 outline-none"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100">
                  {formatModifier(initMod)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Dedicated Movement Speeds Card */}
        <div className="bg-dnd-card p-2 rounded-lg flex flex-col justify-between shadow-sm sm:col-span-1 lg:col-span-1">
          {/* Header */}
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 font-bold text-slate-400">
              <Footprints size={12} className="text-emerald-400" /> Speed
            </span>
            {availableSpeedTypes.length > 0 && !isAddingSpeed && (
              <button
                type="button"
                aria-label="+ Speed"
                onClick={() => {
                  setNewSpeedType(availableSpeedTypes[0].key);
                  setNewSpeedValue('30');
                  setIsAddingSpeed(true);
                }}
                className="text-[10px] text-dnd-gold hover:text-dnd-gold-light font-medium flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                <Plus size={10} /> Speed
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex items-center justify-between gap-2 my-auto pt-1">
            {/* Left: Walking Speed Hero */}
            <div className="flex-shrink-0 flex flex-col justify-center">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    aria-label="Walking Speed"
                    value={speeds.walk ?? 30}
                    onChange={(e) => handleUpdateSpeed('walk', Number(e.target.value))}
                    className="w-14 px-1 py-0.5 rounded bg-dnd-panel text-sm font-bold text-slate-100 text-center border border-white/10 focus:border-dnd-gold/60 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">ft</span>
                </div>
              ) : (
                <div className="text-2xl font-black text-slate-100 leading-none">
                  {speeds.walk ?? 30} ft
                </div>
              )}
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                Walking
              </div>
            </div>

            {/* Right: Optional Speeds List */}
            <div className="flex-1 min-w-0 flex flex-col items-end gap-1">
              {OPTIONAL_SPEED_TYPES.filter((t) => speeds[t.key] !== undefined).map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center gap-1 text-[11px] bg-dnd-panel/60 border border-white/5 rounded px-1.5 py-0.5 text-slate-200 whitespace-nowrap"
                >
                  <span className="text-slate-400 text-[10px]">{label}:</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        aria-label={`${label} Speed`}
                        value={speeds[key]}
                        onChange={(e) => handleUpdateSpeed(key, Number(e.target.value))}
                        className="w-10 px-1 py-0.5 rounded bg-dnd-panel text-[11px] font-bold text-slate-100 text-center border border-white/10 focus:border-dnd-gold/60 outline-none"
                      />
                      <span className="font-bold text-slate-100 text-[10px]">ft</span>
                      <button
                        type="button"
                        aria-label={`Remove ${label} speed`}
                        onClick={() => handleUpdateSpeed(key, null)}
                        className="ml-0.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <span className="font-bold text-slate-100">{speeds[key]} ft</span>
                  )}
                </div>
              ))}
              {OPTIONAL_SPEED_TYPES.every((t) => speeds[t.key] === undefined) && !isAddingSpeed && (
                <span className="text-[10px] text-slate-500 italic">No extra speeds</span>
              )}
            </div>
          </div>

          {/* Inline Add Speed Form */}
          {isAddingSpeed && (
            <form
              noValidate
              onSubmit={handleSaveSpeed}
              className="mt-1.5 pt-1.5 border-t border-white/5 flex items-center gap-1 text-[10px]"
            >
              <select
                aria-label="Movement Type"
                value={newSpeedType}
                onChange={(e) => setNewSpeedType(e.target.value)}
                className="bg-dnd-panel text-slate-200 rounded px-1 py-0.5 border border-white/10 text-[10px] focus:outline-none"
              >
                {availableSpeedTypes.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                aria-label="Speed Distance"
                value={newSpeedValue}
                onChange={(e) => setNewSpeedValue(e.target.value)}
                className="w-10 bg-dnd-panel text-slate-100 rounded px-1 py-0.5 text-center border border-white/10 text-[10px] focus:outline-none"
              />
              <span className="text-slate-400 text-[9px]">ft</span>
              <button
                type="submit"
                className="px-1.5 py-0.5 rounded bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-bold text-[9px]"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSpeed(false)}
                className="px-1 py-0.5 rounded text-slate-400 hover:text-white text-[9px]"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Row 2: Compact Trackers Strip (Hit Dice, Death Saves, Inspiration) */}
      <div className="bg-dnd-card/60 border border-white/5 rounded-lg p-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        {/* Hit Dice */}
        <div className="flex-1 flex items-center justify-between sm:justify-start gap-2">
          <span className="text-[10px] font-bold text-slate-400">
            Hit Dice
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              aria-label="Spend Hit Die"
              onClick={() => changeHitDice(-1)}
              className="w-4 h-4 flex items-center justify-center rounded bg-dnd-panel text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              -
            </button>
            <span className="text-xs font-bold text-slate-200 min-w-[50px] text-center">
              {hitDice.current ?? 1} / {hitDice.max ?? 1} {hitDice.die || 'd6'}
            </span>
            <button
              type="button"
              aria-label="Recover Hit Die"
              onClick={() => changeHitDice(1)}
              className="w-4 h-4 flex items-center justify-center rounded bg-dnd-panel text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-white/5 self-center" />

        {/* Death Saves */}
        <div className="flex-1 flex items-center justify-between sm:justify-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Activity size={11} className="text-red-400" /> Death Saves
          </span>
          <div className="flex items-center gap-2">
            {/* Successes */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-emerald-400 font-bold">Succ</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3].map((num) => {
                  const active = (deathSaves.successes || 0) >= num;
                  return (
                    <button
                      key={`ds-succ-${num}`}
                      type="button"
                      aria-label={`Death Save Success ${num}`}
                      onClick={() => toggleDeathSave('successes', num)}
                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                          : 'bg-dnd-panel hover:bg-emerald-400/40'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Failures */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-red-400 font-bold">Fail</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3].map((num) => {
                  const active = (deathSaves.failures || 0) >= num;
                  return (
                    <button
                      key={`ds-fail-${num}`}
                      type="button"
                      aria-label={`Death Save Failure ${num}`}
                      onClick={() => toggleDeathSave('failures', num)}
                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                        active
                          ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                          : 'bg-dnd-panel hover:bg-red-400/40'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-white/5 self-center" />

        {/* Inspiration */}
        <div className="flex-1 flex items-center justify-between sm:justify-end gap-2">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Lightbulb size={11} className="text-dnd-gold" /> Inspiration
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              aria-label="Decrement inspiration"
              onClick={() => handleInspirationStep(-1)}
              className="w-4 h-4 flex items-center justify-center rounded bg-dnd-panel text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              -
            </button>
            <span data-testid="inspiration-value" className="w-5 text-center text-sm font-bold text-dnd-gold">
              {inspirationCount}
            </span>
            <button
              type="button"
              aria-label="Increment inspiration"
              onClick={() => handleInspirationStep(1)}
              className="w-4 h-4 flex items-center justify-center rounded bg-dnd-panel text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="pt-1 border-t border-white/5 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Activity size={10} className="text-amber-400" /> Conditions:
          </span>
          <button
            type="button"
            onClick={() => setIsAddingCondition(!isAddingCondition)}
            className="text-dnd-gold hover:text-dnd-gold-light"
          >
            + Add Condition
          </button>
        </div>

        {isAddingCondition && (
          <form noValidate onSubmit={handleAddCondition} className="flex items-center space-x-1.5 pt-1 px-0.5">
            <input
              type="text"
              autoFocus
              placeholder="e.g. Paralyzed, Blinded, Exhausted 1"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              className="flex-1 px-2.5 py-1 rounded-lg bg-dnd-card border border-white/20 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 shadow-inner"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-dnd-gold text-slate-950 font-bold text-xs hover:bg-dnd-gold-light transition-colors shadow-sm"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCondition(false)}
              className="px-2 py-1 rounded-lg bg-dnd-card text-slate-400 text-xs hover:text-white transition-colors"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="flex flex-wrap items-center gap-1 min-h-[20px]">
          {/* Permanent Exhaustion Chip */}
          <span
            data-testid="exhaustion-chip"
            className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg text-[11px] shadow-sm bg-dnd-card text-slate-300"
          >
            <span className="font-medium">Exhaustion</span>
            <div className="flex items-center space-x-0.5 bg-dnd-panel/80 px-1 py-0.2 rounded">
              <button
                type="button"
                aria-label="Decrease exhaustion"
                disabled={exhaustionLevel <= 0}
                onClick={() => handleExhaustionStep(-1)}
                className="w-3.5 h-3.5 flex items-center justify-center rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                -
              </button>
              <span
                data-testid="exhaustion-level"
                className="w-3.5 text-center font-bold text-dnd-gold"
              >
                {exhaustionLevel}
              </span>
              <button
                type="button"
                aria-label="Increase exhaustion"
                disabled={exhaustionLevel >= 6}
                onClick={() => handleExhaustionStep(1)}
                className="w-3.5 h-3.5 flex items-center justify-center rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
            </div>
          </span>

          {activeConditions.map((cond) => (
            <span
              key={cond}
              className="group inline-flex items-center px-2 py-0.5 rounded-lg bg-dnd-card text-[11px] text-slate-300 shadow-sm"
            >
              <span>{cond}</span>
              <button
                type="button"
                aria-label={`Remove condition ${cond}`}
                onClick={() => handleRemoveCondition(cond)}
                className="ml-1 text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100"
              >
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Row 3: Defenses & Resistances */}
      <div className="pt-1 border-t border-white/5 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Flame size={10} className="text-amber-400" /> Defenses & Resistances:
          </span>
          <button
            type="button"
            onClick={() => setIsAddingDefense(!isAddingDefense)}
            className="text-dnd-gold hover:text-dnd-gold-light"
          >
            + Add Defense
          </button>
        </div>

        {isAddingDefense && (
          <form noValidate onSubmit={handleAddDefense} className="flex items-center space-x-1.5 pt-1 px-0.5">
            <input
              type="text"
              autoFocus
              placeholder="e.g. Fire (Resistance)"
              value={newDefense}
              onChange={(e) => setNewDefense(e.target.value)}
              className="flex-1 px-2.5 py-1 rounded-lg bg-dnd-card border border-white/20 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 shadow-inner"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-dnd-gold text-slate-950 font-bold text-xs hover:bg-dnd-gold-light transition-colors shadow-sm"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingDefense(false)}
              className="px-2 py-1 rounded-lg bg-dnd-card text-slate-400 text-xs hover:text-white transition-colors"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-1 min-h-[20px]">
          {defenses.length === 0 && !isAddingDefense && (
            <span className="text-[10px] text-slate-500 italic">None recorded</span>
          )}
          {defenses.map((def) => (
            <span
              key={def}
              className="group inline-flex items-center px-2 py-0.5 rounded-lg bg-dnd-card text-[11px] text-slate-300 shadow-sm"
            >
              <span>{def}</span>
              <button
                type="button"
                onClick={() => handleRemoveDefense(def)}
                className="ml-1 text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100"
              >
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
