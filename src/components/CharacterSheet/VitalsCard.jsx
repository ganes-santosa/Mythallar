import React, { useState } from 'react';
import { Shield, Heart, Zap, Sparkles, Footprints, Flame, X, Plus } from 'lucide-react';
import { getAbilityModifier, formatModifier } from '../../utils/dndCalculations';

export default function VitalsCard({ vitals, dexScore = 10, onUpdateVitals }) {
  const currentVitals = vitals || {
    hpCurrent: 10,
    hpMax: 10,
    hpTemp: 0,
    ac: 10,
    acFormula: '',
    speed: 30,
    initiativeOverride: null,
    hitDice: { current: 1, max: 1, die: 'd6' },
    deathSaves: { successes: 0, failures: 0 },
    defenses: [],
    conditions: {
      exhaustion: 0,
      inspiration: false,
      heroicInspiration: false,
    },
  };

  const conditions = currentVitals.conditions || {
    exhaustion: 0,
    inspiration: false,
    heroicInspiration: false,
  };

  const hitDice = currentVitals.hitDice || { current: 1, max: 1, die: 'd6' };
  const deathSaves = currentVitals.deathSaves || { successes: 0, failures: 0 };
  const defenses = currentVitals.defenses || [];

  const [newDefense, setNewDefense] = useState('');
  const [isAddingDefense, setIsAddingDefense] = useState(false);

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

  const handleConditionChange = (conditionKey, value) => {
    onUpdateVitals?.({
      ...currentVitals,
      conditions: {
        ...conditions,
        [conditionKey]: value,
      },
    });
  };

  const changeExhaustion = (delta) => {
    const next = Math.max(0, Math.min(6, (conditions.exhaustion || 0) + delta));
    handleConditionChange('exhaustion', next);
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
    <div className="rounded-lg bg-dnd-card p-3 border border-white/5 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between text-xs font-semibold text-dnd-pewter uppercase tracking-wider">
        <span>Combat Vitals & Formulations</span>
        <span className="text-[10px] text-dnd-gold/80 lowercase italic font-normal">
          direct edit
        </span>
      </div>

      {/* Row 1: Primary Health, AC, Conditions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Hit Points */}
        <div className="bg-dnd-panel/80 p-2 rounded border border-white/5 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Heart size={11} className="text-red-400" /> HP
            </span>
            <span className="text-green-400 font-medium">/ {currentVitals.hpMax ?? 10}</span>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            <input
              type="number"
              aria-label="Current HP"
              value={currentVitals.hpCurrent ?? 0}
              onChange={(e) => handleFieldChange('hpCurrent', Number(e.target.value))}
              className="w-14 px-1.5 py-0.5 rounded bg-black/30 border border-white/10 text-sm font-bold text-slate-100 focus:outline-none focus:border-dnd-gold/60"
            />
            <span className="text-slate-500 text-xs">/</span>
            <input
              type="number"
              aria-label="Max HP"
              value={currentVitals.hpMax ?? 10}
              onChange={(e) => handleFieldChange('hpMax', Number(e.target.value))}
              className="w-14 px-1.5 py-0.5 rounded bg-black/20 border border-white/5 text-xs text-slate-400 focus:outline-none focus:border-dnd-gold/40"
            />
          </div>
        </div>

        {/* Temp HP */}
        <div className="bg-dnd-panel/80 p-2 rounded border border-white/5 flex flex-col justify-between">
          <div className="text-[10px] text-blue-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Zap size={11} className="text-blue-400" /> Temp HP
            </span>
          </div>
          <div className="mt-1">
            <input
              type="number"
              aria-label="Temp HP"
              value={currentVitals.hpTemp ?? 0}
              onChange={(e) => handleFieldChange('hpTemp', Number(e.target.value))}
              className="w-full px-1.5 py-0.5 rounded bg-black/30 border border-white/10 text-sm font-bold text-blue-200 focus:outline-none focus:border-blue-400/60"
            />
          </div>
        </div>

        {/* Armor Class */}
        <div className="bg-dnd-panel/80 p-2 rounded border border-white/5 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Shield size={11} className="text-dnd-gold" /> AC
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="number"
              aria-label="Armor Class"
              value={currentVitals.ac ?? 10}
              onChange={(e) => handleFieldChange('ac', Number(e.target.value))}
              className="w-12 px-1.5 py-0.5 rounded bg-black/30 border border-white/10 text-sm font-bold text-dnd-gold focus:outline-none focus:border-dnd-gold/60"
            />
            <input
              type="text"
              aria-label="AC Formula Breakdown"
              placeholder="e.g. 14 + 2 DEX"
              value={currentVitals.acFormula ?? ''}
              onChange={(e) => handleFieldChange('acFormula', e.target.value)}
              className="flex-1 min-w-0 px-1 py-0.5 rounded bg-black/20 border border-white/5 text-[11px] text-slate-300 focus:outline-none focus:border-dnd-gold/40"
            />
          </div>
        </div>

        {/* Conditions & Inspiration */}
        <div className="bg-dnd-panel/80 p-2 rounded border border-white/5 flex flex-col justify-between space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Conditions</span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                aria-label="Decrement exhaustion"
                onClick={() => changeExhaustion(-1)}
                className="w-4 h-4 flex items-center justify-center rounded bg-black/30 text-slate-400 hover:text-white"
              >
                -
              </button>
              <span className="text-[10px] text-amber-400 font-bold">
                Exh: {conditions.exhaustion ?? 0}
              </span>
              <button
                type="button"
                aria-label="Increment exhaustion"
                onClick={() => changeExhaustion(1)}
                className="w-4 h-4 flex items-center justify-center rounded bg-black/30 text-slate-400 hover:text-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5 gap-1">
            <button
              type="button"
              aria-label="Toggle inspiration"
              onClick={() => handleConditionChange('inspiration', !conditions.inspiration)}
              className={`flex-1 px-1 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                conditions.inspiration
                  ? 'bg-dnd-gold/20 text-dnd-gold border-dnd-gold/40'
                  : 'bg-black/20 text-slate-500 border-white/5 hover:text-slate-300'
              }`}
            >
              Inspo
            </button>
            <button
              type="button"
              aria-label="Toggle heroic inspiration"
              onClick={() =>
                handleConditionChange('heroicInspiration', !conditions.heroicInspiration)
              }
              className={`flex-1 px-1 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                conditions.heroicInspiration
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-black/20 text-slate-500 border-white/5 hover:text-slate-300'
              }`}
            >
              Heroic
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Initiative, Speed, Hit Dice, Death Saves */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Initiative */}
        <div className="bg-dnd-panel/80 p-2 rounded border border-white/5 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400">Initiative</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-base font-bold text-dnd-gold">
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
              className="w-11 px-1 py-0.5 rounded bg-black/20 border border-white/5 text-[10px] text-slate-400 text-center focus:outline-none focus:border-dnd-gold"
            />
          </div>
        </div>

        {/* Speed */}
        <div className="bg-dnd-panel/80 p-2 rounded border border-white/5 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Footprints size={11} className="text-emerald-400" /> Speed (ft)
          </div>
          <div className="mt-1">
            <input
              type="number"
              aria-label="Walking Speed"
              value={currentVitals.speed ?? 30}
              onChange={(e) => handleFieldChange('speed', Number(e.target.value))}
              className="w-full px-1.5 py-0.5 rounded bg-black/30 border border-white/10 text-sm font-bold text-slate-100 focus:outline-none focus:border-dnd-gold/60"
            />
          </div>
        </div>

        {/* Hit Dice */}
        <div className="bg-dnd-panel/80 p-2 rounded border border-white/5 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Hit Dice</span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                aria-label="Spend Hit Die"
                onClick={() => changeHitDice(-1)}
                className="w-3.5 h-3.5 flex items-center justify-center rounded bg-black/30 text-slate-400 hover:text-white"
              >
                -
              </button>
              <button
                type="button"
                aria-label="Recover Hit Die"
                onClick={() => changeHitDice(1)}
                className="w-3.5 h-3.5 flex items-center justify-center rounded bg-black/30 text-slate-400 hover:text-white"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-200">
            {hitDice.current ?? 1} / {hitDice.max ?? 1} {hitDice.die || 'd6'}
          </div>
        </div>

        {/* Death Saves */}
        <div className="bg-dnd-panel/80 p-2 rounded border border-white/5 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400">Death Saves</div>
          <div className="space-y-1 mt-0.5">
            {/* Successes */}
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span className="text-emerald-400 font-semibold">Succ</span>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3].map((num) => {
                  const active = (deathSaves.successes || 0) >= num;
                  return (
                    <button
                      key={`ds-succ-${num}`}
                      type="button"
                      aria-label={`Death Save Success ${num}`}
                      onClick={() => toggleDeathSave('successes', num)}
                      className={`w-2.5 h-2.5 rounded-full border transition-all ${
                        active
                          ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                          : 'border-white/20 hover:border-emerald-400/60 bg-black/20'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Failures */}
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span className="text-red-400 font-semibold">Fail</span>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3].map((num) => {
                  const active = (deathSaves.failures || 0) >= num;
                  return (
                    <button
                      key={`ds-fail-${num}`}
                      type="button"
                      aria-label={`Death Save Failure ${num}`}
                      onClick={() => toggleDeathSave('failures', num)}
                      className={`w-2.5 h-2.5 rounded-full border transition-all ${
                        active
                          ? 'bg-red-500 border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                          : 'border-white/20 hover:border-red-400/60 bg-black/20'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
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
          <form onSubmit={handleAddDefense} className="flex items-center space-x-1.5 pt-1">
            <input
              type="text"
              placeholder="e.g. Fire (Resistance)"
              value={newDefense}
              onChange={(e) => setNewDefense(e.target.value)}
              className="flex-1 px-2 py-0.5 rounded bg-black/30 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-dnd-gold"
            />
            <button
              type="submit"
              className="px-2 py-0.5 rounded bg-dnd-gold text-slate-950 font-bold text-xs"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingDefense(false)}
              className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 text-xs hover:text-white"
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
              className="group inline-flex items-center px-1.5 py-0.5 rounded bg-black/30 border border-white/10 text-[10px] text-slate-300"
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
