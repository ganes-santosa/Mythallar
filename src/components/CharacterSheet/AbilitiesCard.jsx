import React from 'react';
import useNumericDraft from '../../hooks/useNumericDraft';
import {
  getAbilityModifier,
  formatModifier,
  calculateSave,
  getProficiencyBonus,
} from '../../utils/dndCalculations';

function AbilityScoreInput({ label, value, effectiveScore, isEditing, onCommit }) {
  const { draft, handleChange, handleBlur } = useNumericDraft(value, onCommit, { normalize: true });

  return (
    <input
      type="number"
      readOnly={!isEditing}
      tabIndex={isEditing ? 0 : -1}
      aria-label={`${label} Score`}
      value={isEditing ? draft : effectiveScore}
      onChange={isEditing ? (e) => handleChange(e.target.value) : undefined}
      onBlur={isEditing ? handleBlur : undefined}
      className={`w-10 min-w-0 text-center text-xl font-black text-slate-100 rounded-md transition-colors leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none focus:outline-none ${
        isEditing
          ? 'bg-dnd-panel focus:ring-1 focus:ring-white/20 pointer-events-auto'
          : 'bg-transparent cursor-default select-none pointer-events-none focus:ring-0'
      }`}
    />
  );
}

const ABILITIES = [
  { key: 'str', label: 'STR' },
  { key: 'dex', label: 'DEX' },
  { key: 'con', label: 'CON' },
  { key: 'int', label: 'INT' },
  { key: 'wis', label: 'WIS' },
  { key: 'cha', label: 'CHA' },
];

export default function AbilitiesCard({ abilities, featBonuses = {}, level, isEditing = false, onUpdateAbilities }) {
  const currentAbilities = abilities || {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    saveProficiencies: ['int', 'wis'],
    saveBonuses: {},
    checkBonuses: {},
    overrides: {},
  };

  const saveProficiencies = currentAbilities.saveProficiencies || [];
  const scoreBonuses = currentAbilities.scoreBonuses || {};
  const saveBonuses = currentAbilities.saveBonuses || {};
  const safeLevel = Number(level) || 1;
  const profBonus = getProficiencyBonus(safeLevel);

  const handleScoreChange = (key, value) => {
    if (!isEditing) return;
    onUpdateAbilities?.({
      ...currentAbilities,
      [key]: Number(value),
    });
  };

  const handleScoreBonusChange = (key, value) => {
    if (!isEditing) return;
    const num = value === '' ? 0 : Number(value);
    onUpdateAbilities?.({
      ...currentAbilities,
      scoreBonuses: {
        ...scoreBonuses,
        [key]: isNaN(num) ? 0 : num,
      },
    });
  };

  const handleSaveBonusChange = (key, value) => {
    if (!isEditing) return;
    const num = value === '' ? 0 : Number(value);
    onUpdateAbilities?.({
      ...currentAbilities,
      saveBonuses: {
        ...saveBonuses,
        [key]: isNaN(num) ? 0 : num,
      },
    });
  };

  const toggleSaveProficiency = (key) => {
    if (!isEditing) return;
    const hasProf = saveProficiencies.includes(key);
    const nextProf = hasProf
      ? saveProficiencies.filter((k) => k !== key)
      : [...saveProficiencies, key];

    onUpdateAbilities?.({
      ...currentAbilities,
      saveProficiencies: nextProf,
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 text-center">
        {ABILITIES.map(({ key, label }) => {
          const rawScore = currentAbilities[key] ?? 10;
          const scoreMisc = scoreBonuses[key] || 0;
          const featBonus = featBonuses[key] || 0;
          const effectiveScore = rawScore + scoreMisc + featBonus;
          const mod = getAbilityModifier(effectiveScore);
          const isProf = saveProficiencies.includes(key);
          const saveMiscBonus = saveBonuses[key] || 0;
          const saveVal = calculateSave(effectiveScore, isProf, safeLevel, currentAbilities.overrides?.[`${key}Save`], saveMiscBonus);

          return (
            <div
              key={key}
              className={`p-2 rounded-lg relative flex flex-col justify-between transition-all shadow-sm ${
                isProf
                  ? 'bg-dnd-card ring-1 ring-dnd-gold/40'
                  : 'bg-dnd-card'
              }`}
            >
              {/* Proficiency toggle dot */}
              <button
                type="button"
                disabled={!isEditing}
                aria-label={
                  isEditing
                    ? `Toggle ${label} save proficiency`
                    : `${label} save proficiency: ${isProf ? 'proficient' : 'not proficient'}`
                }
                title={
                  isEditing
                    ? `Toggle ${label} saving throw proficiency`
                    : `${label} saving throw: ${isProf ? 'Proficient' : 'Not proficient'}`
                }
                onClick={isEditing ? () => toggleSaveProficiency(key) : undefined}
                className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full transition-all ${
                  isProf
                    ? 'bg-dnd-gold shadow-[0_0_6px_rgba(224,168,56,0.8)]'
                    : isEditing
                    ? 'bg-dnd-panel hover:bg-white/30 cursor-pointer'
                    : 'opacity-0 cursor-default'
                } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
              />

              <div
                className={`text-[10px] font-bold tracking-wider flex items-center justify-center gap-1 ${
                  isProf ? 'text-dnd-gold-light' : 'text-slate-400'
                }`}
              >
                <span>{label}</span>
                {isEditing && featBonus !== 0 && (
                  <span
                    data-testid={`ability-feat-badge-${key}`}
                    title={`Base ${rawScore}${scoreMisc ? ` + ${scoreMisc} Misc` : ''} + ${featBonus} Feat = ${effectiveScore}`}
                    className="text-[9px] font-bold px-1 py-0 rounded bg-dnd-gold/15 text-dnd-gold leading-tight"
                  >
                    {featBonus > 0 ? `+${featBonus}` : featBonus} Feat
                  </span>
                )}
              </div>

              <div className="my-0.5 flex flex-wrap items-center justify-center gap-1">
                <AbilityScoreInput
                  label={label}
                  value={rawScore}
                  effectiveScore={effectiveScore}
                  isEditing={isEditing}
                  onCommit={(value) => handleScoreChange(key, value)}
                />
                {isEditing && (
                  <input
                    type="number"
                    aria-label={`${label} score bonus`}
                    placeholder="+0"
                    value={scoreBonuses[key] !== undefined && scoreBonuses[key] !== 0 ? scoreBonuses[key] : ''}
                    onChange={(e) => handleScoreBonusChange(key, e.target.value)}
                    className="w-6 min-w-0 px-0.5 py-0.5 rounded bg-dnd-panel text-[10px] font-bold text-center text-dnd-gold focus:outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                )}
              </div>

              <div className="text-xs font-bold text-dnd-gold">
                {formatModifier(mod)}
              </div>

              <div
                className={`mt-1 pt-1 border-t text-[11px] font-medium ${
                  isProf
                    ? 'border-dnd-gold/20 text-dnd-gold font-bold'
                    : 'border-white/5 text-slate-300'
                }`}
              >
                {isEditing ? (
                  <div className="flex flex-wrap items-center justify-center gap-0.5 leading-tight">
                    <span className="text-[10px] text-slate-400">Save</span>
                    <span className="text-[10px]">{formatModifier(saveVal)}</span>
                    <input
                      type="number"
                      aria-label={`${label} save bonus`}
                      placeholder="+0"
                      value={saveBonuses[key] !== undefined && saveBonuses[key] !== 0 ? saveBonuses[key] : ''}
                      onChange={(e) => handleSaveBonusChange(key, e.target.value)}
                      className="w-6 min-w-0 px-0.5 py-0 rounded bg-dnd-panel text-[10px] font-bold text-center text-dnd-gold focus:outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                ) : (
                  `Save ${formatModifier(saveVal)}`
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
