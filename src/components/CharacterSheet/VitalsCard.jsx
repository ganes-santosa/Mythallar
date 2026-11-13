import React, { useState, useEffect, useRef } from 'react';
import { Shield, ShieldHalf, Heart, Zap, Lightbulb, X, Plus, Activity, Edit3, Dices, ChevronLeft, ChevronRight, CheckCircle2, Undo2, Redo2 } from 'lucide-react';

export function CrystalBallIcon({ size = 16, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M6.73 17.018a8 8 0 1 1 10.54 0" />
      <path d="M5 19a2 2 0 0 0 2 2h10a2 2 0 1 0 0 -4h-10a2 2 0 0 0 -2 2" />
      <path d="M11 7a3 3 0 0 0 -3 3" />
    </svg>
  );
}
import {
  getAbilityModifier,
  formatModifier,
  rollHitDie,
  getDefaultSpellcastingAbility,
  calculateSpellDC,
  calculateSpellAttack,
} from '../../utils/dndCalculations';
import { normalizeHitDice } from '../../utils/storage';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';

// ponytail: extracted so useTwoClickConfirm hook works per-pool inside .map()
function HitDieRollChip({ dieKey, pool, onRoll, disabled, conScore }) {
  const { armed, handleClick } = useTwoClickConfirm(onRoll);
  const conMod = getAbilityModifier(conScore);

  return (
    <button
      type="button"
      aria-label={armed ? `Click again to roll ${dieKey}` : `Roll ${dieKey}`}
      onClick={handleClick}
      disabled={disabled}
      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-default ${
        armed
          ? 'text-green-400 bg-green-950/70 ring-1 ring-green-400/70'
          : 'bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-gold'
      }`}
      title={
        armed
          ? `Click again to roll ${dieKey} and heal`
          : `Roll 1${dieKey} + CON mod (${conMod >= 0 ? '+' : ''}${conMod}) to heal`
      }
    >
      <Dices size={10} className="flex-shrink-0" />
      <span>{pool.current}/{pool.max} {dieKey}</span>
    </button>
  );
}

export default function VitalsCard({
  characterId = null,
  isSimulacrum = false,
  vitals,
  dexScore = 10,
  conScore = 10,
  abilities = {},
  classes = [],
  isEditing = false,
  onUpdateVitals,
  onShortRest,
  onShowToast,
}) {
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

  const totalLevel = Array.isArray(classes) && classes.length > 0
    ? classes.reduce((sum, c) => sum + (Number(c.level) || 0), 0)
    : 1;
  const primaryClass = classes?.[0]?.className || 'Wizard';
  const defaultAbility = getDefaultSpellcastingAbility(primaryClass);
  const effectiveAbility = currentVitals.spellcastingAbility || defaultAbility;
  const abilityScore = abilities?.[effectiveAbility] ?? 10;

  const effectiveAc = (Number.isFinite(currentVitals.ac) ? currentVitals.ac : 10) + (Number(currentVitals.acBonus) || 0);

  const calculatedAttack = calculateSpellAttack(abilityScore, totalLevel, currentVitals.spellAttackBonus || 0);
  const calculatedDc = calculateSpellDC(abilityScore, totalLevel, currentVitals.spellDcBonus || 0);

  const displayAttack = currentVitals.spellAttackOverride !== null && currentVitals.spellAttackOverride !== undefined
    ? currentVitals.spellAttackOverride
    : calculatedAttack;

  const displayDc = currentVitals.spellDcOverride !== null && currentVitals.spellDcOverride !== undefined
    ? currentVitals.spellDcOverride
    : calculatedDc;

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

  // ponytail: in-memory past/future undo-redo stack for table HP retcons; upgrade to character-level command history if action logging is needed
  const [hpHistory, setHpHistory] = useState({ past: [], future: [] });
  const isUndoRedoRef = useRef(false);
  const prevHpRef = useRef({ hpCurrent, hpTemp });
  const lastCharIdRef = useRef(characterId);

  useEffect(() => {
    if (lastCharIdRef.current !== characterId) {
      lastCharIdRef.current = characterId;
      setHpHistory({ past: [], future: [] });
      prevHpRef.current = { hpCurrent, hpTemp };
      isUndoRedoRef.current = false;
      return;
    }

    const prev = prevHpRef.current;
    if (prev.hpCurrent !== hpCurrent || prev.hpTemp !== hpTemp) {
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
      } else {
        setHpHistory((curr) => ({
          past: [...curr.past.slice(-29), { hpCurrent: prev.hpCurrent, hpTemp: prev.hpTemp }],
          future: [],
        }));
      }
      prevHpRef.current = { hpCurrent, hpTemp };
    }
  }, [characterId, hpCurrent, hpTemp]);

  const canUndo = hpHistory.past.length > 0;
  const canRedo = hpHistory.future.length > 0;
  const previousSnapshot = canUndo ? hpHistory.past[hpHistory.past.length - 1] : null;
  const nextSnapshot = canRedo ? hpHistory.future[0] : null;

  const handleUndoHp = () => {
    if (!canUndo || !previousSnapshot) return;
    isUndoRedoRef.current = true;
    setHpHistory((curr) => ({
      past: curr.past.slice(0, -1),
      future: [{ hpCurrent, hpTemp }, ...curr.future],
    }));
    onUpdateVitals?.({
      ...currentVitals,
      hpCurrent: previousSnapshot.hpCurrent,
      hpTemp: previousSnapshot.hpTemp,
    });
  };

  const handleRedoHp = () => {
    if (!canRedo || !nextSnapshot) return;
    isUndoRedoRef.current = true;
    setHpHistory((curr) => ({
      past: [...curr.past, { hpCurrent, hpTemp }],
      future: curr.future.slice(1),
    }));
    onUpdateVitals?.({
      ...currentVitals,
      hpCurrent: nextSnapshot.hpCurrent,
      hpTemp: nextSnapshot.hpTemp,
    });
  };

  const isBuffed = hpMaxBuff > 0 && effectiveMax > 0;
  const basePercent = isBuffed ? Math.min(100, Math.max(0, (baseMax / effectiveMax) * 100)) : 100;
  const baseCurrentPercent = isBuffed
    ? Math.min(basePercent, Math.max(0, (Math.min(hpCurrent, baseMax) / effectiveMax) * 100))
    : Math.min(100, Math.max(0, (hpCurrent / (effectiveMax || 1)) * 100));
  const buffedCurrentPercent = isBuffed
    ? Math.min(100 - baseCurrentPercent, Math.max(0, (Math.max(0, hpCurrent - baseMax) / effectiveMax) * 100))
    : 0;
  const tempPercent = Math.min(
    100 - (baseCurrentPercent + buffedCurrentPercent),
    Math.max(0, (hpTemp / (effectiveMax || 1)) * 100)
  );

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

  const hitDice = normalizeHitDice(currentVitals, { classes });
  const deathSaves = currentVitals.deathSaves || { successes: 0, failures: 0 };
  const defenses = currentVitals.defenses || [];

  const [newDefense, setNewDefense] = useState('');
  const [defenseType, setDefenseType] = useState('resistance');
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

  const hitDiceScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHitDiceOverflowing, setIsHitDiceOverflowing] = useState(false);
  const [internalToast, setInternalToast] = useState(null);

  const checkHitDiceScroll = () => {
    const el = hitDiceScrollRef.current;
    if (!el) return;
    const overflowing = el.scrollWidth > el.clientWidth + 2;
    setIsHitDiceOverflowing(overflowing);
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    checkHitDiceScroll();
    window.addEventListener('resize', checkHitDiceScroll);
    return () => window.removeEventListener('resize', checkHitDiceScroll);
  }, [hitDice.pools]);

  const scrollHitDice = (direction) => {
    const el = hitDiceScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 80, behavior: 'smooth' });
    setTimeout(checkHitDiceScroll, 150);
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

  const handleRollHitDie = (dieKey) => {
    const pool = hitDice.pools?.[dieKey];
    if (!pool || pool.current <= 0) return;
    if (hpCurrent >= effectiveMax) return;

    const { roll, conMod, total } = rollHitDie(dieKey, conScore);
    const newHp = Math.min(effectiveMax, hpCurrent + total);
    const restoredHp = newHp - hpCurrent;
    const updatedPools = {
      ...hitDice.pools,
      [dieKey]: {
        ...pool,
        current: pool.current - 1,
      },
    };
    let newTotalCurrent = 0;
    for (const p of Object.values(updatedPools)) {
      newTotalCurrent += p.current;
    }

    onUpdateVitals?.({
      ...currentVitals,
      hpCurrent: newHp,
      hitDice: {
        ...hitDice,
        current: newTotalCurrent,
        pools: updatedPools,
      },
    });

    const msg = `Restored ${dieKey} (${restoredHp}) HP`;
    if (onShowToast) {
      onShowToast(msg, 'success');
    } else {
      setInternalToast({ message: msg, type: 'success' });
      setTimeout(() => {
        setInternalToast((curr) => (curr?.message === msg ? null : curr));
      }, 3200);
    }
  };

  const changeHitDice = (dieKey, delta) => {
    let actualKey = dieKey;
    let actualDelta = delta;
    if (typeof dieKey === 'number' && delta === undefined) {
      actualDelta = dieKey;
      actualKey = hitDice.die || Object.keys(hitDice.pools || {})[0] || 'd8';
    }

    const pool = hitDice.pools?.[actualKey] || { current: hitDice.current || 0, max: hitDice.max || 1 };
    const nextCurrent = Math.max(0, Math.min(pool.max, (pool.current || 0) + actualDelta));
    const updatedPools = {
      ...(hitDice.pools || {}),
      [actualKey]: {
        ...pool,
        current: nextCurrent,
      },
    };
    let newTotalCurrent = 0;
    for (const p of Object.values(updatedPools)) {
      newTotalCurrent += p.current;
    }

    onUpdateVitals?.({
      ...currentVitals,
      hitDice: {
        ...hitDice,
        current: newTotalCurrent,
        pools: updatedPools,
      },
    });
  };

  const handleAddDefense = (e) => {
    e.preventDefault();
    const trimmed = newDefense.trim();
    if (!trimmed) return;

    let entry = trimmed;
    if (!/\((resistance|immune|immunity)\)/i.test(trimmed)) {
      entry = defenseType === 'immunity' ? `${trimmed} (Immune)` : `${trimmed} (Resistance)`;
    }

    onUpdateVitals?.({
      ...currentVitals,
      defenses: [...defenses, entry],
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
    <div className="space-y-2.5 relative">
      {!onShowToast && internalToast && (
        <div className="absolute top-2 right-2 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-lg shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 bg-dnd-card border border-white/5 pointer-events-none">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-slate-100">{internalToast.message}</span>
        </div>
      )}
      {/* Row 1: Primary Health, AC, Conditions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 min-[1390px]:grid-cols-[10fr_7fr_9fr] gap-2 text-xs">
        {/* Hit Points Hero Card */}
        {isEditing ? (
          <div className="bg-dnd-card p-2 rounded-lg flex flex-col justify-between shadow-sm sm:col-span-2 min-[1390px]:col-span-1">
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
                  className="w-full px-1 py-0.5 rounded bg-dnd-panel/70 text-xs font-bold text-slate-100 text-center border border-white/10 focus:border-dnd-gold/60 outline-none"
                />
              </div>
              <div>
                <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Base Max</label>
                <input
                  type="number"
                  aria-label="Base Max HP"
                  value={baseMax}
                  onChange={(e) => handleFieldChange('hpMax', Number(e.target.value))}
                  className="w-full px-1 py-0.5 rounded bg-dnd-panel/70 text-xs font-bold text-slate-100 text-center border border-white/10 focus:border-dnd-gold/60 outline-none"
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
                  className="w-full px-1 py-0.5 rounded bg-dnd-panel/70 text-xs font-bold text-amber-400 text-center border border-amber-500/30 focus:border-dnd-gold/60 outline-none"
                />
              </div>
              <div>
                <label className="text-[8px] text-blue-400 font-semibold block mb-0.5">Temp HP</label>
                <input
                  type="number"
                  aria-label="Temp HP"
                  value={hpTemp}
                  onChange={(e) => handleFieldChange('hpTemp', Number(e.target.value))}
                  className="w-full px-1 py-0.5 rounded bg-dnd-panel/70 text-xs font-bold text-blue-300 text-center border border-blue-500/30 focus:border-dnd-gold/60 outline-none"
                />
              </div>
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-white/5">
              <span>Effective Max:</span>
              <span className="font-bold text-slate-200">{effectiveMax} HP</span>
            </div>
          </div>
        ) : (
          <div className="bg-dnd-card hover:border-white/10 transition-colors p-2 rounded-lg flex items-stretch justify-between gap-2 shadow-sm min-w-0 sm:col-span-2 min-[1390px]:col-span-1">
            {/* Left: HP Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                  <Heart size={12} className="text-red-400 fill-red-400/20" /> Hit Points
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    aria-label="Undo HP"
                    title={
                      canUndo
                        ? `Undo HP to ${previousSnapshot.hpCurrent}${previousSnapshot.hpTemp > 0 ? ` (+${previousSnapshot.hpTemp} Temp)` : ''}`
                        : 'Nothing to undo'
                    }
                    disabled={!canUndo}
                    onClick={handleUndoHp}
                    className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-default"
                  >
                    <Undo2 size={11} />
                  </button>
                  <button
                    type="button"
                    aria-label="Redo HP"
                    title={
                      canRedo
                        ? `Redo HP to ${nextSnapshot.hpCurrent}${nextSnapshot.hpTemp > 0 ? ` (+${nextSnapshot.hpTemp} Temp)` : ''}`
                        : 'Nothing to redo'
                    }
                    disabled={!canRedo}
                    onClick={handleRedoHp}
                    className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-default"
                  >
                    <Redo2 size={11} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 my-0.5">
                {/* Sub-container 1: Current & Max */}
                <div className="bg-dnd-panel/70 hover:bg-dnd-panel/90 border border-white/5 hover:border-white/20 transition-all rounded-md px-2.5 py-1 flex flex-col justify-between">
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
                      className="text-right text-xl font-black text-slate-100 hover:text-dnd-gold bg-transparent outline-none focus:ring-1 focus:ring-dnd-gold/60 rounded leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text transition-colors"
                    />
                    <span className="text-base text-slate-600 font-bold self-center px-1.5 select-none">/</span>
                    <div
                      className={`text-xl font-black leading-none self-center text-left ${
                        hpMaxBuff > 0 ? 'text-amber-400' : hpMaxBuff < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}
                      title={
                        hpMaxBuff !== 0
                          ? `Base Max: ${baseMax} (${hpMaxBuff > 0 ? `+${hpMaxBuff}` : hpMaxBuff} ${hpMaxBuff > 0 ? 'Buff' : 'Drain'})`
                          : undefined
                      }
                    >
                      {effectiveMax}
                    </div>
                  </div>
                </div>

                {/* Sub-container 2: Temp HP */}
                <div className="bg-dnd-panel/70 hover:bg-dnd-panel/90 border border-white/5 hover:border-white/20 transition-all rounded-md px-2.5 py-1 flex flex-col justify-between self-stretch min-w-[2.75rem]">
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
                      className="text-center text-xl font-black text-blue-300 hover:text-blue-200 bg-transparent outline-none focus:ring-1 focus:ring-blue-400/60 rounded leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Mini Health Bar */}
              <div className="relative bg-dnd-panel h-1.5 rounded-full overflow-hidden mt-1 border border-white/5 flex">
                {isBuffed && (
                  <>
                    <div
                      data-testid="hp-buff-track"
                      className="absolute top-0 bottom-0 bg-amber-400/20 pointer-events-none"
                      style={{ left: `${basePercent}%`, width: `${100 - basePercent}%` }}
                    />
                    <div
                      data-testid="hp-base-max-notch"
                      className="absolute top-0 bottom-0 w-[1.5px] bg-amber-400/80 z-10 pointer-events-none"
                      style={{ left: `${basePercent}%` }}
                    />
                  </>
                )}
                <div
                  data-testid="hp-bar-base-current"
                  className="bg-emerald-500 h-full transition-all duration-200"
                  style={{ width: `${baseCurrentPercent}%` }}
                />
                {isBuffed && (
                  <div
                    data-testid="hp-bar-buffed-current"
                    className="bg-amber-400 h-full transition-all duration-200"
                    style={{ width: `${buffedCurrentPercent}%` }}
                  />
                )}
                <div
                  data-testid="hp-bar-temp"
                  className="bg-blue-400 h-full transition-all duration-200"
                  style={{ width: `${tempPercent}%` }}
                />
              </div>
            </div>

            {/* Subtle Subdivision Border */}
            <div className="w-px bg-white/5 my-0.5" />

            {/* Right: Treatment A Capsule */}
            <div className="flex flex-col justify-center">
              <div className="bg-dnd-panel/70 border border-white/5 rounded-md p-1 flex flex-col gap-1 w-16 box-border">
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
                  className="w-full text-center bg-dnd-panel/70 border border-white/10 rounded text-[10px] font-bold text-slate-100 py-0.5 outline-none focus:border-dnd-gold/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

        {/* Card 2: Dedicated Armor Class Card (Full height matching Hit Points) */}
        <div className="bg-dnd-card p-2 rounded-lg flex flex-col justify-between shadow-sm min-w-0 sm:col-span-1 min-[1390px]:col-span-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between mb-0.5">
            <span className="flex items-center gap-1 font-bold text-slate-400">
              <ShieldHalf size={12} className="text-dnd-gold" /> AC
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
            <div className="flex flex-col gap-1.5 my-auto">
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[8px] text-slate-400 font-semibold block mb-0.5 text-center">Base</label>
                  <input
                    type="number"
                    aria-label="Armor Class"
                    value={currentVitals.ac ?? 10}
                    onChange={(e) => handleFieldChange('ac', Number(e.target.value))}
                    className="w-full px-1 py-0.5 rounded bg-dnd-panel/70 text-xs font-bold text-slate-100 text-center focus:outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-dnd-gold font-semibold block mb-0.5 text-center">Bonus</label>
                  <input
                    type="number"
                    aria-label="AC Misc Bonus"
                    placeholder="+0"
                    value={currentVitals.acBonus !== undefined && currentVitals.acBonus !== 0 ? currentVitals.acBonus : ''}
                    onChange={(e) => handleFieldChange('acBonus', e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full px-1 py-0.5 rounded bg-dnd-panel text-xs font-bold text-center text-dnd-gold focus:outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-[8px] text-slate-400 font-semibold">Note / Breakdown:</label>
                <input
                  type="text"
                  aria-label="AC Formula Breakdown"
                  placeholder="e.g. 14 + 2 DEX, Shield"
                  value={currentVitals.acFormula ?? ''}
                  onChange={(e) => handleFieldChange('acFormula', e.target.value)}
                  className="w-full px-1.5 py-0.5 rounded bg-dnd-panel/70 text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>
            </div>
          ) : isEditingAcNote ? (
            <div className="mt-1 flex flex-col gap-1 my-auto">
              <textarea
                value={acNoteDraft}
                onChange={(e) => setAcNoteDraft(e.target.value)}
                placeholder="e.g. 14 + 2 DEX, Shield"
                rows={2}
                autoFocus
                className="w-full bg-dnd-panel/70 rounded p-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold resize-none"
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
              <div className="text-xl font-black text-slate-100 leading-none my-0.5">
                {effectiveAc}
              </div>
              {currentVitals.acFormula ? (
                <div className="flex items-start justify-between gap-1 mt-1">
                  <span
                    onClick={() => {
                      setAcNoteDraft(currentVitals.acFormula);
                      setIsEditingAcNote(true);
                    }}
                    className="text-[11px] text-slate-300 cursor-pointer hover:text-dnd-gold transition-colors flex-1 line-clamp-2 break-words"
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
                <div className="text-[10px] text-slate-500 italic mt-0.5">Armor Class</div>
              )}
            </div>
          )}
        </div>

        {/* Card 3: Stacked Spellcasting & Initiative Group */}
        <div className="flex flex-col gap-1.5 min-w-0 sm:col-span-1 min-[1390px]:col-span-1">
          {/* Spellcasting Card */}
          <div className="bg-dnd-card p-2 rounded-lg flex flex-col justify-between shadow-sm flex-1 min-w-0">
            {/* Header */}
            <div className="text-[10px] text-slate-400 flex items-center justify-between mb-0.5">
              <span className="flex items-center gap-1 font-bold text-slate-400">
                <CrystalBallIcon size={12} className="text-dnd-gold" /> Spellcasting
              </span>
              {isEditing ? (
                <select
                  aria-label="Spellcasting Ability"
                  value={effectiveAbility}
                  onChange={(e) =>
                    onUpdateVitals?.({
                      ...currentVitals,
                      spellcastingAbility: e.target.value,
                    })
                  }
                  className="bg-dnd-panel/70 text-slate-200 uppercase font-semibold text-[9px] px-1 py-0.2 rounded focus:outline-none focus:ring-1 focus:ring-dnd-gold/60"
                >
                  <option value="int">INT</option>
                  <option value="wis">WIS</option>
                  <option value="cha">CHA</option>
                </select>
              ) : (
                <span className="text-[9px] uppercase font-semibold text-slate-400 bg-dnd-panel/70 px-1 py-0.2 rounded leading-none">
                  {effectiveAbility.toUpperCase()}
                </span>
              )}
            </div>

            {/* Body */}
            <div className="flex items-center justify-around my-auto py-1">
              {/* Left: Spell Attack */}
              <div className="flex-1 flex flex-col items-center justify-center min-w-0">
                {isEditing ? (
                  <div className="w-full max-w-[100px] text-center">
                    <div className="grid grid-cols-2 gap-1 mb-1">
                      <div>
                        <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Base</label>
                        <input
                          type="number"
                          aria-label="Spell Attack Override"
                          placeholder={formatModifier(calculatedAttack)}
                          value={currentVitals.spellAttackOverride ?? ''}
                          onChange={(e) =>
                            onUpdateVitals?.({
                              ...currentVitals,
                              spellAttackOverride: e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                          className="w-full px-1 py-0.5 rounded bg-dnd-panel/70 text-xs font-bold text-slate-100 text-center outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] text-dnd-gold font-semibold block mb-0.5">Bonus</label>
                        <input
                          type="number"
                          aria-label="Spell Attack Misc Bonus"
                          placeholder="+0"
                          value={currentVitals.spellAttackBonus !== undefined && currentVitals.spellAttackBonus !== 0 ? currentVitals.spellAttackBonus : ''}
                          onChange={(e) =>
                            onUpdateVitals?.({
                              ...currentVitals,
                              spellAttackBonus: e.target.value === '' ? 0 : Number(e.target.value),
                            })
                          }
                          className="w-full px-0.5 py-0.5 rounded bg-dnd-panel text-xs font-bold text-center text-dnd-gold focus:outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium truncate">
                      Spell Attack
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-xl font-black text-slate-100 leading-none">
                      {formatModifier(displayAttack)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1">
                      Spell Attack
                    </div>
                  </>
                )}
              </div>

              {/* Middle Divider */}
              <div className="w-px self-stretch bg-white/5 my-0.5" />

              {/* Right: Spell DC */}
              <div className="flex-1 flex flex-col items-center justify-center min-w-0">
                {isEditing ? (
                  <div className="w-full max-w-[100px] text-center">
                    <div className="grid grid-cols-2 gap-1 mb-1">
                      <div>
                        <label className="text-[8px] text-slate-400 font-semibold block mb-0.5">Base</label>
                        <input
                          type="number"
                          aria-label="Spell DC Override"
                          placeholder={String(calculatedDc)}
                          value={currentVitals.spellDcOverride ?? ''}
                          onChange={(e) =>
                            onUpdateVitals?.({
                              ...currentVitals,
                              spellDcOverride: e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                          className="w-full px-1 py-0.5 rounded bg-dnd-panel/70 text-xs font-bold text-slate-100 text-center outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] text-dnd-gold font-semibold block mb-0.5">Bonus</label>
                        <input
                          type="number"
                          aria-label="Spell DC Misc Bonus"
                          placeholder="+0"
                          value={currentVitals.spellDcBonus !== undefined && currentVitals.spellDcBonus !== 0 ? currentVitals.spellDcBonus : ''}
                          onChange={(e) =>
                            onUpdateVitals?.({
                              ...currentVitals,
                              spellDcBonus: e.target.value === '' ? 0 : Number(e.target.value),
                            })
                          }
                          className="w-full px-0.5 py-0.5 rounded bg-dnd-panel text-xs font-bold text-center text-dnd-gold focus:outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium truncate">
                      Spell DC
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-xl font-black text-slate-100 leading-none">
                      {displayDc}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1">
                      Spell DC
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Initiative Card */}
          <div className="bg-dnd-card p-2 rounded-lg flex items-center justify-between shadow-sm">
            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <Zap size={11} className="text-dnd-gold" />
              <span>Initiative</span>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-100 pr-1">
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
                  className="w-11 px-1 py-0.5 rounded bg-dnd-panel/70 text-[10px] text-slate-100 text-center outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>
            ) : (
              <div className="flex items-center">
                <span className="text-xs font-bold text-slate-100 pr-1">
                  {formatModifier(initMod)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Compact Trackers Strip (Hit Dice, Inspiration, Death Saves) in ONE Single Card */}
        {!isSimulacrum && (
          <div className="col-span-1 sm:col-span-2 min-[1390px]:col-span-3 grid grid-cols-1 sm:grid-cols-2 min-[1390px]:grid-cols-subgrid sm:gap-x-2 text-xs items-stretch relative">
            {/* Unified Card Background */}
            <div className="absolute inset-0 bg-dnd-card/60 border border-white/5 rounded-lg pointer-events-none -z-0" />

            {/* Subdivision 1: Hit Dice */}
            <div className="relative z-10 flex items-center justify-between sm:justify-start gap-1 sm:gap-1.5 min-w-0 sm:col-span-2 min-[1390px]:col-span-1 border-b min-[1390px]:border-b-0 border-white/5 py-1.5 pl-2 pr-1.5">
              <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">
                Hit Dice
              </span>

              {/* Hit Dice Pools Carousel */}
              <div className="flex items-center min-w-0 flex-1">
                {isHitDiceOverflowing && (
                  <button
                    type="button"
                    aria-label="Scroll hit dice left"
                    onClick={() => scrollHitDice(-1)}
                    disabled={!canScrollLeft}
                    className="w-3.5 h-5 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 flex-shrink-0 -ml-0.5 mr-0.5 transition-opacity cursor-pointer disabled:cursor-default"
                  >
                    <ChevronLeft size={11} />
                  </button>
                )}

                <div
                  ref={hitDiceScrollRef}
                  onScroll={checkHitDiceScroll}
                  className="flex items-center gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1"
                >
                  {Object.entries(hitDice.pools || {}).map(([dieKey, pool]) => (
                    <div
                      key={dieKey}
                      className="flex items-center space-x-1 bg-dnd-panel/70 px-1.5 py-0.5 rounded border border-white/5 flex-shrink-0"
                    >
                      <button
                        type="button"
                        aria-label={`Spend ${dieKey} Hit Die`}
                        onClick={() => changeHitDice(dieKey, -1)}
                        disabled={pool.current <= 0}
                        className="w-3.5 h-3.5 flex items-center justify-center rounded bg-dnd-card text-slate-400 hover:text-white disabled:opacity-30 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <HitDieRollChip
                        dieKey={dieKey}
                        pool={pool}
                        onRoll={() => handleRollHitDie(dieKey)}
                        disabled={pool.current <= 0 || hpCurrent >= effectiveMax}
                        conScore={conScore}
                      />
                      <button
                        type="button"
                        aria-label={`Recover ${dieKey} Hit Die`}
                        onClick={() => changeHitDice(dieKey, 1)}
                        disabled={pool.current >= pool.max}
                        className="w-3.5 h-3.5 flex items-center justify-center rounded bg-dnd-card text-slate-400 hover:text-white disabled:opacity-30 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>

                {isHitDiceOverflowing && (
                  <button
                    type="button"
                    aria-label="Scroll hit dice right"
                    onClick={() => scrollHitDice(1)}
                    disabled={!canScrollRight}
                    className="w-3.5 h-5 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 flex-shrink-0 -mr-0.5 ml-0.5 transition-opacity cursor-pointer disabled:cursor-default"
                  >
                    <ChevronRight size={11} />
                  </button>
                )}
              </div>
              {/* Divider 1: Centered in gap between Card 1 & Card 2 on xl */}
              <div className="hidden min-[1390px]:block absolute right-[-5px] top-1.5 bottom-1.5 w-[1px] bg-white/5 pointer-events-none" />
            </div>

            {/* Subdivision 2: Inspiration */}
            <div className="relative z-10 flex flex-col 2xl:flex-row items-center justify-center gap-x-1.5 gap-y-0.5 min-w-0 sm:col-span-1 min-[1390px]:col-span-1 border-b sm:border-b-0 border-white/5 py-1.5 px-2 text-center">
              <span className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1 min-w-0 flex-shrink-0">
                <Lightbulb size={11} className="text-dnd-gold flex-shrink-0" />
                <span className="truncate">Inspiration</span>
              </span>
              <div className="flex items-center justify-center space-x-1 flex-shrink-0">
                <button
                  type="button"
                  aria-label="Decrement inspiration"
                  onClick={() => handleInspirationStep(-1)}
                  className="w-3.5 h-3.5 flex items-center justify-center rounded bg-dnd-panel/70 text-slate-400 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <span data-testid="inspiration-value" className="w-4 text-center text-xs font-bold text-dnd-gold leading-none">
                  {inspirationCount}
                </span>
                <button
                  type="button"
                  aria-label="Increment inspiration"
                  onClick={() => handleInspirationStep(1)}
                  className="w-3.5 h-3.5 flex items-center justify-center rounded bg-dnd-panel/70 text-slate-400 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
              {/* Divider 2: Centered in gap between Card 2 & Card 3 on xl and sm */}
              <div className="hidden sm:block absolute right-[-5px] top-1.5 bottom-1.5 w-[1px] bg-white/5 pointer-events-none" />
            </div>

            {/* Subdivision 3: Death Saves */}
            <div className="relative z-10 flex flex-col items-center justify-center min-w-0 sm:col-span-1 min-[1390px]:col-span-1 py-1.5 pl-1 pr-2.5">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0 mb-0.5">
                <Activity size={11} className="text-red-400 flex-shrink-0" />
                <span>Death Saves</span>
              </span>
              <div className="flex items-center gap-2.5 flex-shrink-0">
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
                              : 'bg-dnd-panel/70 hover:bg-emerald-400/40'
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
                              : 'bg-dnd-panel/70 hover:bg-red-400/40'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isSimulacrum && (
        <>
          {/* Conditions */}
          <div className="pt-1.5 border-t border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Activity size={10} className="text-amber-400" /> Conditions:
              </span>
              <button
                type="button"
                aria-label="+ Add Condition"
                onClick={() => setIsAddingCondition(!isAddingCondition)}
                className="text-dnd-gold hover:text-dnd-gold-light cursor-pointer"
              >
                + Add
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
                <div className="flex items-center space-x-0.5 bg-dnd-panel/70 px-1 py-0.2 rounded">
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
                  {isEditing && (
                    <button
                      type="button"
                      aria-label={`Remove condition ${cond}`}
                      onClick={() => handleRemoveCondition(cond)}
                      className="ml-1 text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 cursor-pointer"
                    >
                      <X size={9} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Resistance & Immunities */}
          <div className="pt-1.5 border-t border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Shield size={10} className="text-amber-400" /> Resistance & Immunities:
              </span>
              <button
                type="button"
                aria-label="+ Add Defense"
                onClick={() => setIsAddingDefense(!isAddingDefense)}
                className="text-dnd-gold hover:text-dnd-gold-light cursor-pointer"
              >
                + Add
              </button>
            </div>

            {isAddingDefense && (
              <form noValidate onSubmit={handleAddDefense} className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 pt-1 px-0.5">
                <div className="inline-flex rounded-lg bg-dnd-panel/70 p-0.5 shrink-0 text-xs">
                  <button
                    type="button"
                    onClick={() => setDefenseType('resistance')}
                    className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                      defenseType === 'resistance'
                        ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Resistance
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefenseType('immunity')}
                    className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                      defenseType === 'immunity'
                        ? 'bg-dnd-gold/20 text-dnd-gold font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Immunity
                  </button>
                </div>
                <input
                  type="text"
                  autoFocus
                  placeholder={defenseType === 'resistance' ? 'e.g. Fire, Cold' : 'e.g. Poison, Charmed'}
                  value={newDefense}
                  onChange={(e) => setNewDefense(e.target.value)}
                  className="flex-1 min-w-[120px] px-2 py-0.5 rounded bg-dnd-card border border-white/20 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 shadow-inner"
                />
                <button
                  type="submit"
                  className="px-2 py-0.5 rounded bg-dnd-gold text-slate-950 font-bold text-xs hover:bg-dnd-gold-light transition-colors shadow-sm cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingDefense(false)}
                  className="px-1.5 py-0.5 rounded bg-dnd-card text-slate-400 text-xs hover:text-white transition-colors cursor-pointer"
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
                  className="group inline-flex items-center px-1.5 py-0.5 rounded-lg bg-dnd-card text-[11px] text-slate-300 shadow-sm border border-white/5"
                >
                  <span>{def}</span>
                  {isEditing && (
                    <button
                      type="button"
                      aria-label={`Remove defense ${def}`}
                      onClick={() => handleRemoveDefense(def)}
                      className="ml-1 text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 cursor-pointer"
                    >
                      <X size={9} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
