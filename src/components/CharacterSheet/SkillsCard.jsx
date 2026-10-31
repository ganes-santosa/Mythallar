import React, { useState } from 'react';
import { Eye, Search, Sparkles } from 'lucide-react';
import {
  SKILLS_DEFINITION,
  calculateSkillBonus,
  calculatePassiveScore,
  formatModifier,
} from '../../utils/dndCalculations';

export default function SkillsCard({
  abilities = {},
  skills = {},
  level = 1,
  senses = {},
  onUpdateSkills,
  onUpdateSenses,
}) {
  const [filterQuery, setFilterQuery] = useState('');

  const currentSkills = skills || {};
  const currentSenses = senses || { darkvision: 0, custom: '' };
  const safeLevel = Number(level) || 1;

  // Passives calculation
  const passivePerception = calculatePassiveScore(
    abilities.wis ?? 10,
    currentSkills.perception || 'none',
    safeLevel
  );
  const passiveInvestigation = calculatePassiveScore(
    abilities.int ?? 10,
    currentSkills.investigation || 'none',
    safeLevel
  );
  const passiveInsight = calculatePassiveScore(
    abilities.wis ?? 10,
    currentSkills.insight || 'none',
    safeLevel
  );

  const cycleSkillProficiency = (skillKey) => {
    const cur = currentSkills[skillKey] || 'none';
    const next =
      cur === 'none' ? 'proficient' : cur === 'proficient' ? 'expertise' : 'none';

    onUpdateSkills?.({
      ...currentSkills,
      [skillKey]: next,
    });
  };

  const handleSensesChange = (field, value) => {
    onUpdateSenses?.({
      ...currentSenses,
      [field]: value,
    });
  };

  const filteredSkills = SKILLS_DEFINITION.filter((s) => {
    if (!filterQuery) return true;
    return (
      s.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.ability.toLowerCase().includes(filterQuery.toLowerCase())
    );
  });

  return (
    <div className="rounded-lg bg-dnd-card p-3 border border-white/5 shadow-sm space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-white/5 text-xs">
        <span className="font-semibold text-dnd-pewter uppercase tracking-wider">
          Skills & Senses
        </span>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search size={11} className="absolute left-1.5 top-1.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter skills..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="pl-5 pr-2 py-0.5 rounded bg-black/20 border border-white/5 text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-dnd-gold/40 w-28 sm:w-36"
            />
          </div>
        </div>
      </div>

      {/* Passive Senses & Darkvision Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-dnd-panel/90 p-1.5 rounded border border-white/5 flex items-center justify-between">
          <div className="text-[10px] text-slate-400">Passive Perception</div>
          <span data-testid="passive-perception-value" className="text-sm font-bold text-dnd-gold">
            {passivePerception}
          </span>
        </div>

        <div className="bg-dnd-panel/90 p-1.5 rounded border border-white/5 flex items-center justify-between">
          <div className="text-[10px] text-slate-400">Passive Investigation</div>
          <span data-testid="passive-investigation-value" className="text-sm font-bold text-dnd-gold">
            {passiveInvestigation}
          </span>
        </div>

        <div className="bg-dnd-panel/90 p-1.5 rounded border border-white/5 flex items-center justify-between">
          <div className="text-[10px] text-slate-400">Passive Insight</div>
          <span data-testid="passive-insight-value" className="text-sm font-bold text-dnd-gold">
            {passiveInsight}
          </span>
        </div>

        <div className="bg-dnd-panel/90 p-1.5 rounded border border-white/5 flex items-center justify-between">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Eye size={11} className="text-purple-400" /> Darkvision (ft)
          </div>
          <input
            type="number"
            aria-label="Darkvision distance"
            value={currentSenses.darkvision ?? 0}
            onChange={(e) => handleSensesChange('darkvision', Number(e.target.value))}
            className="w-12 px-1 py-0.2 rounded bg-black/30 border border-white/10 text-xs font-bold text-center text-purple-300 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* 18 Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {filteredSkills.map((s) => {
          const prof = currentSkills[s.key] || 'none';
          const abilityScore = abilities[s.ability] ?? 10;
          const bonus = calculateSkillBonus(abilityScore, prof, safeLevel);
          const isProf = prof === 'proficient';
          const isExp = prof === 'expertise';

          return (
            <div
              key={s.key}
              className={`flex items-center justify-between px-2 py-1 rounded border transition-colors ${
                isExp
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : isProf
                  ? 'bg-dnd-panel/90 border-white/10'
                  : 'bg-dnd-panel/50 border-white/5 hover:bg-dnd-panel/70'
              }`}
            >
              <div className="flex items-center space-x-2">
                {/* 3-State Proficiency Button */}
                <button
                  type="button"
                  aria-label={`Cycle ${s.label} proficiency`}
                  title={`${s.label}: current is ${prof}. Click to cycle (none -> proficient -> expertise)`}
                  onClick={() => cycleSkillProficiency(s.key)}
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                    isExp
                      ? 'bg-amber-400 ring-2 ring-dnd-gold shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                      : isProf
                      ? 'bg-dnd-gold shadow-[0_0_6px_rgba(224,168,56,0.8)]'
                      : 'border border-white/20 bg-black/30 hover:border-white/40'
                  }`}
                >
                  {isExp && <span className="text-[8px] font-black text-slate-950">★</span>}
                </button>

                <span
                  className={`font-medium ${
                    isExp
                      ? 'text-amber-300 font-bold'
                      : isProf
                      ? 'text-slate-100 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  {s.label}
                </span>

                <span className="text-[10px] text-slate-500 uppercase font-mono">
                  {s.ability}
                </span>
              </div>

              <span
                className={`font-mono text-xs font-bold ${
                  isExp ? 'text-amber-400' : isProf ? 'text-dnd-gold' : 'text-slate-400'
                }`}
              >
                {formatModifier(bonus)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
