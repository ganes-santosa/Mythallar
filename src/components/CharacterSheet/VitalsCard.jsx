import React from 'react';
import { Shield, Heart, Zap, Sparkles } from 'lucide-react';

export default function VitalsCard({ vitals, onUpdateVitals }) {
  const currentVitals = vitals || {
    hpCurrent: 10,
    hpMax: 10,
    hpTemp: 0,
    ac: 10,
    acFormula: '',
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

  return (
    <div className="rounded-lg bg-dnd-card p-3 border border-white/5 shadow-sm space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-dnd-pewter uppercase tracking-wider">
        <span>Combat Vitals & Formulations</span>
        <span className="text-[10px] text-dnd-gold/80 lowercase italic font-normal">
          direct edit
        </span>
      </div>

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
    </div>
  );
}
