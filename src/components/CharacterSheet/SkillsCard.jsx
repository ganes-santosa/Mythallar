import React, { useState } from 'react';
import { Eye, Search, Sparkles, RotateCcw } from 'lucide-react';
import {
  SKILLS_DEFINITION,
  calculateSkillBonus,
  calculatePassiveScore,
  formatModifier,
} from '../../utils/dndCalculations';

const SKILL_COLUMNS = [
  ['str', 'dex', 'int'],
  ['wis', 'cha'],
];

export default function SkillsCard({
  abilities = {},
  skills = {},
  skillBonuses = {},
  level = 1,
  senses = {},
  filterQuery: externalFilterQuery,
  hideSearch = false,
  isEditing = false,
  onUpdateSkills,
  onUpdateSkillBonuses,
  onUpdateSenses,
}) {
  const [internalFilterQuery, setInternalFilterQuery] = useState('');
  const filterQuery = externalFilterQuery !== undefined ? externalFilterQuery : internalFilterQuery;
  const showSearch = !hideSearch && externalFilterQuery === undefined;

  const currentSkills = skills || {};
  const currentSkillBonuses = skillBonuses || {};
  const currentSenses = senses || { darkvision: 0, custom: '', bonuses: {} };
  const safeLevel = Number(level) || 1;

  // Passives calculation
  const autoPerception = calculatePassiveScore(
    abilities.wis ?? 10,
    currentSkills.perception || 'none',
    safeLevel,
    currentSenses.bonuses?.perception || 0,
    currentSkillBonuses.perception || 0
  );
  const autoInvestigation = calculatePassiveScore(
    abilities.int ?? 10,
    currentSkills.investigation || 'none',
    safeLevel,
    currentSenses.bonuses?.investigation || 0,
    currentSkillBonuses.investigation || 0
  );
  const autoInsight = calculatePassiveScore(
    abilities.wis ?? 10,
    currentSkills.insight || 'none',
    safeLevel,
    currentSenses.bonuses?.insight || 0,
    currentSkillBonuses.insight || 0
  );

  const passivePerception = currentSenses.overrides?.perception ?? autoPerception;
  const passiveInvestigation = currentSenses.overrides?.investigation ?? autoInvestigation;
  const passiveInsight = currentSenses.overrides?.insight ?? autoInsight;

  const isPerceptionOverridden = typeof currentSenses.overrides?.perception === 'number';
  const isInvestigationOverridden = typeof currentSenses.overrides?.investigation === 'number';
  const isInsightOverridden = typeof currentSenses.overrides?.insight === 'number';

  const handlePassiveChange = (field, value) => {
    if (!isEditing) return;
    if (value === '') {
      handleResetPassive(field);
      return;
    }
    const num = Number(value);
    onUpdateSenses?.({
      ...currentSenses,
      overrides: {
        ...(currentSenses.overrides || {}),
        [field]: num,
      },
    });
  };

  const handleResetPassive = (field) => {
    const newOverrides = { ...(currentSenses.overrides || {}) };
    delete newOverrides[field];
    onUpdateSenses?.({
      ...currentSenses,
      overrides: newOverrides,
    });
  };

  const cycleSkillProficiency = (skillKey) => {
    if (!isEditing) return;
    const cur = currentSkills[skillKey] || 'none';
    const next =
      cur === 'none' ? 'proficient' : cur === 'proficient' ? 'expertise' : 'none';

    onUpdateSkills?.({
      ...currentSkills,
      [skillKey]: next,
    });
  };

  const handleSkillBonusChange = (skillKey, value) => {
    if (!isEditing) return;
    const num = value === '' ? 0 : Number(value);
    onUpdateSkillBonuses?.({
      ...currentSkillBonuses,
      [skillKey]: isNaN(num) ? 0 : num,
    });
  };

  const handleSensesChange = (field, value) => {
    if (!isEditing) return;
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
    <div className="space-y-2.5">
      {/* Search & Quick Filter */}
      {showSearch && (
        <div className="flex items-center justify-end pb-1 border-b border-white/5 text-xs">
          <div className="relative">
            <Search size={11} className="absolute left-1.5 top-1.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter skills..."
              value={filterQuery}
              onChange={(e) => setInternalFilterQuery(e.target.value)}
              className="pl-5 pr-2 py-0.5 rounded-lg bg-dnd-card text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20 w-32 sm:w-44"
            />
          </div>
        </div>
      )}

      {/* Passive Senses & Darkvision Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-dnd-card p-1.5 rounded-lg flex items-center justify-between shadow-sm">
          <div className="text-[10px] text-slate-400">Passive Perception</div>
          {isEditing ? (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                aria-label="Passive Perception score"
                value={passivePerception}
                onChange={(e) => handlePassiveChange('perception', e.target.value)}
                className="w-10 px-1 py-0.2 rounded bg-dnd-panel text-xs font-bold text-center text-dnd-gold focus:outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {isPerceptionOverridden && (
                <button
                  type="button"
                  aria-label="Reset Passive Perception"
                  title="Reset to precalculated value"
                  onClick={() => handleResetPassive('perception')}
                  className="p-0.5 text-slate-400 hover:text-dnd-gold transition-colors"
                >
                  <RotateCcw size={10} />
                </button>
              )}
            </div>
          ) : (
            <span data-testid="passive-perception-value" className="text-sm font-bold text-dnd-gold">
              {passivePerception}
            </span>
          )}
        </div>

        <div className="bg-dnd-card p-1.5 rounded-lg flex items-center justify-between shadow-sm">
          <div className="text-[10px] text-slate-400">Passive Investigation</div>
          {isEditing ? (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                aria-label="Passive Investigation score"
                value={passiveInvestigation}
                onChange={(e) => handlePassiveChange('investigation', e.target.value)}
                className="w-10 px-1 py-0.2 rounded bg-dnd-panel text-xs font-bold text-center text-dnd-gold focus:outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {isInvestigationOverridden && (
                <button
                  type="button"
                  aria-label="Reset Passive Investigation"
                  title="Reset to precalculated value"
                  onClick={() => handleResetPassive('investigation')}
                  className="p-0.5 text-slate-400 hover:text-dnd-gold transition-colors"
                >
                  <RotateCcw size={10} />
                </button>
              )}
            </div>
          ) : (
            <span data-testid="passive-investigation-value" className="text-sm font-bold text-dnd-gold">
              {passiveInvestigation}
            </span>
          )}
        </div>

        <div className="bg-dnd-card p-1.5 rounded-lg flex items-center justify-between shadow-sm">
          <div className="text-[10px] text-slate-400">Passive Insight</div>
          {isEditing ? (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                aria-label="Passive Insight score"
                value={passiveInsight}
                onChange={(e) => handlePassiveChange('insight', e.target.value)}
                className="w-10 px-1 py-0.2 rounded bg-dnd-panel text-xs font-bold text-center text-dnd-gold focus:outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {isInsightOverridden && (
                <button
                  type="button"
                  aria-label="Reset Passive Insight"
                  title="Reset to precalculated value"
                  onClick={() => handleResetPassive('insight')}
                  className="p-0.5 text-slate-400 hover:text-dnd-gold transition-colors"
                >
                  <RotateCcw size={10} />
                </button>
              )}
            </div>
          ) : (
            <span data-testid="passive-insight-value" className="text-sm font-bold text-dnd-gold">
              {passiveInsight}
            </span>
          )}
        </div>

        <div className="bg-dnd-card p-1.5 rounded-lg flex items-center justify-between shadow-sm">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Eye size={11} className="text-purple-400" /> Darkvision (ft)
          </div>
          <input
            type="number"
            readOnly={!isEditing}
            aria-label="Darkvision distance"
            value={currentSenses.darkvision ?? 0}
            onChange={isEditing ? (e) => handleSensesChange('darkvision', Number(e.target.value)) : undefined}
            className={`w-12 px-1 py-0.2 rounded text-xs font-bold text-center text-purple-300 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              isEditing
                ? 'bg-dnd-panel focus:outline-none focus:ring-1 focus:ring-white/25 focus:border-white/30 focus:shadow-[0_0_8px_rgba(255,255,255,0.08)]'
                : 'bg-transparent cursor-default select-none focus:outline-none'
            }`}
          />
        </div>
      </div>

      {/* Grouped Skills Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {SKILL_COLUMNS.map((abilitiesInCol, colIdx) => {
          let renderedGroupsCount = 0;

          return (
            <div key={colIdx} data-testid={`skills-column-${colIdx}`}>
              {abilitiesInCol.map((abilityKey) => {
                const groupSkills = filteredSkills.filter((s) => s.ability === abilityKey);
                if (groupSkills.length === 0) return null;
                const isFirstGroup = renderedGroupsCount === 0;
                renderedGroupsCount++;

                return (
                  <div key={abilityKey}>
                    {!isFirstGroup && <div className="border-t border-white/5 my-2.5" />}
                    <div className="space-y-1">
                      {groupSkills.map((s) => {
                        const prof = currentSkills[s.key] || 'none';
                        const abilityScore = abilities[s.ability] ?? 10;
                        const skillMiscBonus = currentSkillBonuses[s.key] || 0;
                        const bonus = calculateSkillBonus(abilityScore, prof, safeLevel, undefined, skillMiscBonus);
                        const isProf = prof === 'proficient';
                        const isExp = prof === 'expertise';

                        return (
                          <div
                            key={s.key}
                            className={`flex items-center justify-between px-2 py-1 rounded-lg bg-dnd-card transition-colors shadow-sm ${
                              isEditing ? 'hover:bg-dnd-hover' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {/* 3-State Proficiency Button */}
                              <button
                                type="button"
                                disabled={!isEditing}
                                aria-label={
                                  isEditing ? `Cycle ${s.label} proficiency` : `${s.label}: ${prof}`
                                }
                                title={
                                  isEditing
                                    ? `${s.label}: current is ${prof}. Click to cycle (none -> proficient -> expertise)`
                                    : `${s.label}: ${prof}`
                                }
                                onClick={isEditing ? () => cycleSkillProficiency(s.key) : undefined}
                                className={`w-2 h-2 rounded-full flex items-center justify-center transition-all shrink-0 ${
                                  isExp
                                    ? 'border border-dnd-gold bg-transparent'
                                    : isProf
                                    ? 'bg-dnd-gold'
                                    : `border border-white/20 bg-transparent ${
                                        isEditing ? 'hover:border-dnd-gold/60' : ''
                                      }`
                                } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                              >
                                {isExp && <span className="w-0.5 h-0.5 rounded-full bg-dnd-gold" />}
                              </button>

                              <span
                                className={`font-medium ${
                                  isExp
                                    ? 'text-dnd-gold-light font-bold'
                                    : isProf
                                    ? 'text-slate-100 font-semibold'
                                    : 'text-slate-300'
                                }`}
                              >
                                {s.label}
                              </span>

                              <span className="text-[10px] text-slate-500 uppercase">
                                {s.ability}
                              </span>
                            </div>

                            <div className="flex items-center">
                              <span
                                className={`text-xs font-bold ${
                                  isExp ? 'text-amber-400' : isProf ? 'text-dnd-gold' : 'text-slate-400'
                                }`}
                              >
                                {formatModifier(bonus)}
                              </span>
                              {isEditing && (
                                <input
                                  type="number"
                                  aria-label={`${s.label} misc bonus`}
                                  placeholder="+0"
                                  value={
                                    currentSkillBonuses[s.key] !== undefined && currentSkillBonuses[s.key] !== 0
                                      ? currentSkillBonuses[s.key]
                                      : ''
                                  }
                                  onChange={(e) => handleSkillBonusChange(s.key, e.target.value)}
                                  className="w-9 px-1 py-0.5 rounded bg-dnd-panel text-[11px] font-bold text-center text-dnd-gold focus:outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ml-1.5"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
