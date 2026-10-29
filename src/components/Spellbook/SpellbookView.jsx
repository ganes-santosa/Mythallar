import React, { useState } from 'react';
import { BookMarked, Download, ChevronDown, Feather, HelpCircle, X, Flame, BookCheck, Sparkles, ScrollText } from 'lucide-react';
import SpellbookLevelGroup from './SpellbookLevelGroup';
import PreparedSpellSummary from './PreparedSpellSummary';
import { getSpellcastingHints } from './spellcastingHints';
import { isWizardCharacter, getEffectiveMaxCantripsInfo } from '../../utils/spellSlots';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';
import useClickOutside from '../../hooks/useClickOutside';

const CLASSES = [
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

const SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

const INITIAL_FILTERS = {
  level: 'all',
  className: 'all',
  school: 'all',
  prepared: false,
  copying: false,
  concentration: false,
  ritual: false,
  compV: false,
  compS: false,
  compM: false,
};

export default function SpellbookView({
  character,
  catalog,
  onTogglePrepare,
  onFinishCopying,
  onFinishCopyingAll,
  onCastSpell,
  onRemoveSpell,
  onAddSpell,
  onSelectSpell,
  onUpdateCharacter,
  onUpdateNote,
}) {
  const [showSpellHint, setShowSpellHint] = useState(false);
  const spellHintRef = useClickOutside(showSpellHint, () => setShowSpellHint(false));
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [collapsedLevels, setCollapsedLevels] = useState({});
  const [expandedSpellId, setExpandedSpellId] = useState(null);
  const { armed: finishAllArmed, handleClick: handleFinishAllClick } = useTwoClickConfirm(() => onFinishCopyingAll?.());
  const isWizard = isWizardCharacter(character);
  const cantripsInfo = getEffectiveMaxCantripsInfo(character);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const isFiltered = Boolean(
    filters.level !== 'all' ||
      filters.className !== 'all' ||
      filters.school !== 'all' ||
      filters.prepared ||
      filters.copying ||
      filters.concentration ||
      filters.ritual ||
      filters.compV ||
      filters.compS ||
      filters.compM
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only turn off if leaving the dropzone boundary
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const spellId = e.dataTransfer.getData('text/plain');
    if (spellId && onAddSpell) {
      onAddSpell(spellId);
    }
  };

  // Group spells by level
  const preparedMap = {};
  const copyingMap = {};
  const notesMap = {};
  let hasCopyingSpells = false;
  let visibleSpellCount = 0;
  const spellsByLevel = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
  };

  if (character && Array.isArray(character.spells)) {
    for (const item of character.spells) {
      preparedMap[item.id] = item.prepared;
      if (item.note) notesMap[item.id] = item.note;
      const spell = catalog[item.id];
      if (spell) {
        const lvl = typeof spell.level === 'number' ? spell.level : 0;
        const copying = Boolean(isWizard && item.copying && lvl > 0);
        const effectivePrepared = Boolean(item.prepared && !copying);
        copyingMap[item.id] = copying;
        if (copying) hasCopyingSpells = true;

        if (filters.level !== 'all' && lvl !== filters.level) continue;
        if (filters.className !== 'all' && (!Array.isArray(spell.classes) || !spell.classes.includes(filters.className))) continue;
        if (filters.school !== 'all' && spell.school !== filters.school && (!Array.isArray(spell.specializations) || !spell.specializations.includes(filters.school))) continue;
        if (filters.prepared && !effectivePrepared) continue;
        if (filters.copying && !copying) continue;
        if (filters.concentration && !spell.concentration) continue;
        if (filters.ritual && !spell.ritual) continue;
        if (filters.compV && !spell.components?.v) continue;
        if (filters.compS && !spell.components?.s) continue;
        if (filters.compM && !spell.components?.m) continue;

        if (!spellsByLevel[lvl]) spellsByLevel[lvl] = [];
        spellsByLevel[lvl].push(spell);
        visibleSpellCount++;
      }
    }
  }

  // Sort within each level alphabetically
  for (const lvl of Object.keys(spellsByLevel)) {
    spellsByLevel[lvl].sort((a, b) => a.name.localeCompare(b.name));
  }

  const hasAnySpells = character && character.spells && character.spells.length > 0;

  return (
    <div
      role="region"
      aria-label="Character Spellbook Drop Zone"
      data-testid="spellbook-dropzone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative p-2.5 rounded-lg bg-dnd-panel transition-all flex flex-col min-h-0 ${
        isCollapsed ? '' : 'flex-1 h-full'
      } ${isDragOver ? 'ring-1 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.08)]' : ''}`}
    >
      {/* Drop overlay badge when dragging */}
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-dnd-panel/80 z-20 pointer-events-none">
          <div className="flex items-center space-x-2 text-dnd-gold font-semibold text-lg animate-pulse">
            <Download size={24} />
            <span>Drop to add spell to spellbook</span>
          </div>
        </div>
      )}

      {/* Accordion header matching Spell Slots */}
      <div className={`relative z-20 flex-shrink-0 flex flex-wrap items-center justify-between gap-2 bg-dnd-panel ${isCollapsed ? '' : 'pb-1.5 mb-1.5'}`}>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-1.5 text-left group focus:outline-none"
          aria-label={isCollapsed ? 'Expand Spellbook' : 'Collapse Spellbook'}
          title={isCollapsed ? 'Click to expand spellbook' : 'Click to collapse spellbook'}
        >
          <BookMarked size={14} className="text-dnd-gold group-hover:scale-110 transition-transform" />
          <h3 className="text-xs font-semibold text-slate-200 group-hover:text-dnd-gold-light transition-colors">Spellbook</h3>
          <ChevronDown size={13} className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {isWizard && hasCopyingSpells && (
            <button
              type="button"
              aria-label={finishAllArmed ? 'Click again to finish copying all spells' : 'Finish copying all spells'}
              onClick={handleFinishAllClick}
              className={`relative flex items-center space-x-1 rounded-lg px-2 py-0.5 text-xs font-semibold transition-colors ${
                finishAllArmed
                  ? 'text-green-400 bg-green-950/70 ring-1 ring-green-400/70'
                  : 'bg-dnd-card text-slate-300 hover:text-slate-100'
              }`}
              title={finishAllArmed ? 'Click again to confirm all copying spells are complete' : 'Finish copying all spells currently in progress'}
            >
              <Feather size={11} className={finishAllArmed ? 'text-green-400' : 'text-dnd-gold'} />
              <span className="text-[11px]">Finish Copying All</span>
            </button>
          )}
          <button
            type="button"
            aria-label="Toggle Spellbook Filters"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`relative flex items-center space-x-1 bg-dnd-card rounded-lg px-2 py-0.5 text-xs transition-colors ${
              isFiltered ? 'ring-1 ring-dnd-gold/50 text-slate-100' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Filter spells in spellbook"
          >
            <Flame size={11} className="text-dnd-gold" />
            <span className="text-[11px] font-semibold text-slate-200">Filters</span>
            <ChevronDown size={10} className={`text-slate-400 transition-transform duration-200 ${showFilters ? '' : '-rotate-90'}`} />
          </button>
          <PreparedSpellSummary character={character} catalog={catalog} onUpdateCharacter={onUpdateCharacter} />
          <span className="text-[11px] text-slate-400">{(character?.spells || []).length} spells</span>
          <div ref={spellHintRef} className="relative">
            <button type="button" aria-label="Spell learning hint" onClick={() => setShowSpellHint(!showSpellHint)} className="p-1 text-slate-400 hover:text-dnd-gold" title="How this class gains spells">
              <HelpCircle size={13} />
            </button>
            {showSpellHint && <div className="absolute right-0 top-7 z-30 w-80 max-w-[calc(100vw-2rem)] p-2.5 rounded-lg bg-dnd-card shadow-xl text-[11px] text-slate-200 ring-1 ring-white/10">
              <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-white/5"><span className="font-semibold text-dnd-gold">How to gain spells</span><button type="button" aria-label="Close spell learning hint" onClick={() => setShowSpellHint(false)}><X size={11} /></button></div>
              <div className="space-y-2">{getSpellcastingHints(character).map((item) => <div key={item.className}><div className="font-semibold text-slate-200">{item.className}</div><p className="text-slate-400">{item.hint}</p></div>)}</div>
            </div>}
          </div>
        </div>
      </div>

      {/* Expandable Spellbook Filter Accordion */}
      {!isCollapsed && showFilters && (
        <div className="flex-shrink-0 mb-2 space-y-2 pb-2 border-b border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={filters.level}
              onChange={(e) => updateFilter('level', e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-dnd-card rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20"
              aria-label="Filter Spellbook by Level"
            >
              <option value="all">All Levels</option>
              <option value="0">Cantrips</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level {lvl}
                </option>
              ))}
            </select>

            <select
              value={filters.className}
              onChange={(e) => updateFilter('className', e.target.value)}
              className="bg-dnd-card rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20"
              aria-label="Filter Spellbook by Class"
            >
              <option value="all">All Classes</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={filters.school}
              onChange={(e) => updateFilter('school', e.target.value)}
              className="bg-dnd-card rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20"
              aria-label="Filter Spellbook by School"
            >
              <option value="all">All Schools</option>
              {SCHOOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option disabled>────────────</option>
              <option value="Chronurgy">Chronurgy</option>
              <option value="Graviturgy">Graviturgy</option>
            </select>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => updateFilter('prepared', !filters.prepared)}
              className={`flex items-center px-2 py-1 rounded transition-colors ${
                filters.prepared
                  ? 'bg-white/15 text-white ring-1 ring-white/20'
                  : 'bg-dnd-card text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookCheck size={12} className="mr-1" />
              Prepared
            </button>

            <button
              type="button"
              onClick={() => updateFilter('copying', !filters.copying)}
              className={`flex items-center px-2 py-1 rounded transition-colors ${
                filters.copying
                  ? 'bg-white/15 text-white ring-1 ring-white/20'
                  : 'bg-dnd-card text-slate-400 hover:text-slate-200'
              }`}
            >
              <Feather size={12} className="mr-1" />
              Copying
            </button>

            <button
              type="button"
              onClick={() => updateFilter('concentration', !filters.concentration)}
              className={`flex items-center px-2 py-1 rounded transition-colors ${
                filters.concentration
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-dnd-card text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={12} className="mr-1" />
              Concentration
            </button>

            <button
              type="button"
              onClick={() => updateFilter('ritual', !filters.ritual)}
              className={`flex items-center px-2 py-1 rounded transition-colors ${
                filters.ritual
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-dnd-card text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScrollText size={12} className="mr-1" />
              Ritual
            </button>

            <button
              type="button"
              onClick={() => updateFilter('compV', !filters.compV)}
              className={`px-2 py-1 rounded font-bold transition-colors ${
                filters.compV
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-dnd-card text-slate-400 hover:text-slate-200'
              }`}
              title="Verbal Component"
            >
              V
            </button>

            <button
              type="button"
              onClick={() => updateFilter('compS', !filters.compS)}
              className={`px-2 py-1 rounded font-bold transition-colors ${
                filters.compS
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-dnd-card text-slate-400 hover:text-slate-200'
              }`}
              title="Somatic Component"
            >
              S
            </button>

            <button
              type="button"
              onClick={() => updateFilter('compM', !filters.compM)}
              className={`px-2 py-1 rounded font-bold transition-colors ${
                filters.compM
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-dnd-card text-slate-400 hover:text-slate-200'
              }`}
              title="Material Component"
            >
              M
            </button>

            {isFiltered && (
              <button
                type="button"
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="text-xs text-slate-400 hover:text-dnd-gold ml-auto"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {!isCollapsed && <div className="flex-1 min-h-0 flex flex-col overflow-y-auto px-1 pb-1">
      {!hasAnySpells ? (
        <div className="flex-1 flex flex-col items-center justify-center pb-20 pt-4 px-8 text-center text-slate-500 rounded-xl bg-dnd-card/40">
          <div
            role="img"
            aria-label="Mythallar Logo"
            className="w-16 h-16 mb-1 bg-slate-300 select-none pointer-events-none"
            style={{
              WebkitMaskImage: "url('/mythallar_logo.png')",
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskImage: "url('/mythallar_logo.png')",
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
            }}
          />
          <h3 className="font-semibold text-slate-300 text-base">Your Spellbook is Empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Drag and drop spells from the catalog on the left, or click "Add to Spellbook" in the spell detail drawer.
          </p>
        </div>
      ) : visibleSpellCount === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center text-slate-500 rounded-xl p-6 bg-dnd-card/40">
          <p className="text-xs text-slate-400">No spells match the active filters.</p>
        </div>
      ) : (
        <div>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
            <SpellbookLevelGroup
              key={lvl}
              level={lvl}
              spells={spellsByLevel[lvl]}
              isOpen={!collapsedLevels[lvl]}
              onToggle={() => setCollapsedLevels((prev) => ({ ...prev, [lvl]: !prev[lvl] }))}
              preparedMap={preparedMap}
              copyingMap={copyingMap}
              notesMap={notesMap}
              maxCantrips={lvl === 0 ? cantripsInfo.total : null}
              onTogglePrepare={onTogglePrepare}
              onFinishCopying={onFinishCopying}
              onCast={onCastSpell}
              onRemove={onRemoveSpell}
              onSelect={onSelectSpell}
              onUpdateNote={onUpdateNote}
              expandedSpellId={expandedSpellId}
              onToggleSpell={(id) => setExpandedSpellId((current) => current === id ? null : id)}
            />
          ))}
        </div>
      )}
      </div>}
    </div>
  );
}

