import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Wand2,
  BookOpen,
  Sparkles,
  Shield,
  Heart,
  Dices,
  RotateCcw,
  User,
  Backpack,
  Award,
  Search,
} from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import {
  loadBuilderData,
  getCachedClasses,
  getCachedSpecies,
  getCachedBackgrounds,
} from '../../utils/builderData';
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  STANDARD_ARRAY,
  POINT_BUY_TOTAL,
  POINT_BUY_COSTS,
  calculatePointBuyCost,
  generateRollPool,
  calculateFinalAbilities,
} from '../../utils/abilityScoreGenerator';
import { buildLevel1Character } from '../../utils/characterGenerator';
import { formatModifier } from '../../utils/dndCalculations';

export default function CharacterBuilderModal({
  isOpen,
  onClose,
  onCreate,
}) {
  useScrollLock(isOpen);

  // --- Refs for Scroll-Based Long Form UI ---
  const scrollContainerRef = useRef(null);
  const pillBarRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // --- Draft State ---
  const [ruleset, setRuleset] = useState('2024'); // '2024' | '2014'
  const [stepIndex, setStepIndex] = useState(0);

  // Selections
  const [characterName, setCharacterName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubclassId, setSelectedSubclassId] = useState('');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState('');
  const [selectedSubraceId, setSelectedSubraceId] = useState('');
  const [selectedBackgroundId, setSelectedBackgroundId] = useState('');
  const [speciesSearch, setSpeciesSearch] = useState('');

  // Class skill picks
  const [chosenSkills, setChosenSkills] = useState([]);

  // Ability Scores
  const [abilityMethod, setAbilityMethod] = useState('standard'); // 'standard' | 'pointbuy' | 'roll'
  const [baseScores, setBaseScores] = useState({
    str: 15,
    dex: 14,
    con: 13,
    int: 12,
    wis: 10,
    cha: 8,
  });
  const [rollPool, setRollPool] = useState([]);
  const [bgBonusChoice, setBgBonusChoice] = useState({}); // e.g. { int: 2, con: 1 }
  const [racialChoice, setRacialChoice] = useState({});

  // Equipment & Spells
  const [equipmentOption, setEquipmentOption] = useState('A');
  const [selectedSpells, setSelectedSpells] = useState([]);

  // Details
  const [details, setDetails] = useState({
    appearance: '',
    age: '',
    gender: '',
    alignment: '',
    backstory: '',
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
  });

  // Data catalogues
  const [allClasses, setAllClasses] = useState([]);
  const [allSpecies, setAllSpecies] = useState([]);
  const [allBackgrounds, setAllBackgrounds] = useState([]);
  const [availableSpells, setAvailableSpells] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load datasets on mount
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    Promise.all([
      loadBuilderData(),
      fetch('/data/spells.json').then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([builderData, spellsData]) => {
      if (!active) return;
      setAllClasses(builderData.classes || []);
      setAllSpecies(builderData.species || []);
      setAllBackgrounds(builderData.backgrounds || []);
      setAvailableSpells(Array.isArray(spellsData) ? spellsData : []);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Filter options by active ruleset
  const classesForRuleset = useMemo(
    () => allClasses.filter((c) => c.edition === ruleset),
    [allClasses, ruleset]
  );
  const speciesForRuleset = useMemo(
    () => allSpecies.filter((s) => s.edition === ruleset),
    [allSpecies, ruleset]
  );
  const backgroundsForRuleset = useMemo(
    () => allBackgrounds.filter((b) => b.edition === ruleset),
    [allBackgrounds, ruleset]
  );

  // Resolved selected objects
  const selectedClass = useMemo(
    () => classesForRuleset.find((c) => c.id === selectedClassId) || classesForRuleset[0] || null,
    [classesForRuleset, selectedClassId]
  );
  const selectedSubclass = useMemo(
    () => selectedClass?.subclasses?.find((s) => s.id === selectedSubclassId) || null,
    [selectedClass, selectedSubclassId]
  );
  const filteredSpecies = useMemo(() => {
    if (!speciesSearch.trim()) return speciesForRuleset;
    const q = speciesSearch.toLowerCase().trim();
    return speciesForRuleset.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.subraces?.some((sub) => sub.name.toLowerCase().includes(q))
    );
  }, [speciesForRuleset, speciesSearch]);
  const selectedSpecies = useMemo(
    () => speciesForRuleset.find((s) => s.id === selectedSpeciesId) || speciesForRuleset[0] || null,
    [speciesForRuleset, selectedSpeciesId]
  );
  const selectedSubrace = useMemo(
    () => selectedSpecies?.subraces?.find((s) => s.id === selectedSubraceId) || selectedSpecies?.subraces?.[0] || null,
    [selectedSpecies, selectedSubraceId]
  );
  const selectedBackground = useMemo(
    () => backgroundsForRuleset.find((b) => b.id === selectedBackgroundId) || backgroundsForRuleset[0] || null,
    [backgroundsForRuleset, selectedBackgroundId]
  );

  // Set default selections once loaded
  useEffect(() => {
    if (classesForRuleset.length > 0 && !selectedClassId) {
      setSelectedClassId(classesForRuleset[0].id);
    }
    if (speciesForRuleset.length > 0 && !selectedSpeciesId) {
      setSelectedSpeciesId(speciesForRuleset[0].id);
    }
    if (backgroundsForRuleset.length > 0 && !selectedBackgroundId) {
      setSelectedBackgroundId(backgroundsForRuleset[0].id);
    }
  }, [classesForRuleset, speciesForRuleset, backgroundsForRuleset, selectedClassId, selectedSpeciesId, selectedBackgroundId]);

  // Keep subrace synced with selected species
  useEffect(() => {
    if (selectedSpecies?.subraces?.length > 0) {
      if (!selectedSpecies.subraces.some((s) => s.id === selectedSubraceId)) {
        setSelectedSubraceId(selectedSpecies.subraces[0].id);
      }
    } else {
      setSelectedSubraceId('');
    }
  }, [selectedSpecies, selectedSubraceId]);

  // Handle 2024 Background ASI defaults
  useEffect(() => {
    if (ruleset === '2024' && selectedBackground?.eligibleAbilities?.length >= 2) {
      const [ab1, ab2] = selectedBackground.eligibleAbilities;
      setBgBonusChoice({ [ab1]: 2, [ab2]: 1 });
    }
  }, [ruleset, selectedBackground]);

  // Roll pool generator
  useEffect(() => {
    if (rollPool.length === 0) {
      setRollPool(generateRollPool());
    }
  }, [rollPool]);

  // Dynamic step sequences per ruleset
  const STEPS_2024 = [
    { key: 'ruleset', label: 'Ruleset' },
    { key: 'class', label: 'Class' },
    { key: 'background', label: 'Background' },
    { key: 'species', label: 'Species' },
    { key: 'abilities', label: 'Abilities' },
    { key: 'details', label: 'Details' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'spells', label: 'Spells & Features' },
    { key: 'review', label: 'Review' },
  ];

  const STEPS_2014 = [
    { key: 'ruleset', label: 'Ruleset' },
    { key: 'race', label: 'Race & Subrace' },
    { key: 'class', label: 'Class' },
    { key: 'abilities', label: 'Abilities' },
    { key: 'background', label: 'Background' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'spells', label: 'Spells & Features' },
    { key: 'details', label: 'Details' },
    { key: 'review', label: 'Review' },
  ];

  const steps = ruleset === '2024' ? STEPS_2024 : STEPS_2014;
  const currentStep = steps[stepIndex] || steps[0];

  // Calculated final abilities
  const abilityCalculation = useMemo(() => {
    return calculateFinalAbilities({
      baseScores,
      ruleset,
      race: selectedSpecies,
      subrace: selectedSubrace,
      background: selectedBackground,
      bgBonusChoice,
      racialChoice,
    });
  }, [baseScores, ruleset, selectedSpecies, selectedSubrace, selectedBackground, bgBonusChoice, racialChoice]);

  // Spells available for selected class at Level 1 (cantrips & 1st level)
  const classLevel1Spells = useMemo(() => {
    if (!selectedClass?.hasSpellcasting) return [];
    const cName = selectedClass.name.toLowerCase();
    return availableSpells.filter((s) => {
      const cls = Array.isArray(s.classes) ? s.classes.map((c) => c.toLowerCase()) : [];
      return cls.includes(cName) && (s.level === 0 || s.level === 1);
    });
  }, [selectedClass, availableSpells]);

  // Auto-scroll pill bar when active step index changes
  useEffect(() => {
    const activePill = pillBarRef.current?.querySelector(`[data-step-index="${stepIndex}"]`);
    if (activePill && typeof activePill.scrollIntoView === 'function') {
      activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [stepIndex]);

  // Clean programmatic scroll to target section
  const scrollToSection = (key, targetIndex) => {
    if (typeof targetIndex === 'number') {
      setStepIndex(targetIndex);
    }
    isProgrammaticScrollRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 650);

    const container = scrollContainerRef.current;
    const target = document.getElementById(`builder-section-${key}`);
    if (container && target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top + container.scrollTop;
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top: Math.max(0, relativeTop - 14), behavior: 'smooth' });
      } else {
        container.scrollTop = Math.max(0, relativeTop - 14);
      }
    } else if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll spy listener to detect current active section in long-form layout
  const handleScroll = () => {
    if (isProgrammaticScrollRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Bottom reached -> mark review step as active
    if (scrollHeight > 0 && scrollTop + clientHeight >= scrollHeight - 40) {
      setStepIndex(steps.length - 1);
      return;
    }

    let currentIdx = 0;
    for (let i = 0; i < steps.length; i++) {
      const el = document.getElementById(`builder-section-${steps[i].key}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top - containerRect.top <= 100) {
          currentIdx = i;
        }
      }
    }
    setStepIndex(currentIdx);
  };

  // Navigation handlers
  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      const nextIdx = stepIndex + 1;
      scrollToSection(steps[nextIdx].key, nextIdx);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      const prevIdx = stepIndex - 1;
      scrollToSection(steps[prevIdx].key, prevIdx);
    }
  };

  const handleFinish = () => {
    const finalProfile = buildLevel1Character({
      name: characterName,
      ruleset,
      selectedClass,
      selectedSubclass,
      selectedSpecies,
      selectedSubrace,
      selectedBackground,
      baseScores,
      bgBonusChoice,
      racialChoice,
      chosenSkills,
      equipmentOption,
      selectedSpells,
      details,
    });
    onCreate(finalProfile);
    onClose();
  };

  if (!isOpen) return null;

  // --- Render Section Content by Key ---
  const renderSectionContent = (key) => {
    switch (key) {
      case 'ruleset':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200 font-display">
                Choose your ruleset
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Select which version of D&amp;D 5th Edition you&apos;d like to use.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRuleset('2024');
                  setStepIndex(0);
                  scrollToSection('ruleset', 0);
                }}
                className={`p-4 rounded-xl text-left transition-all cursor-pointer shadow-sm ${
                  ruleset === '2024'
                    ? 'bg-dnd-panel ring-1 ring-dnd-gold'
                    : 'bg-dnd-panel/60 hover:bg-dnd-panel'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-100">
                    D&amp;D 5th Edition (2024)
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-dnd-gold/20 text-dnd-gold font-bold">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  The latest revised rules featuring background ability score increases, origin feats, and refreshed species traits.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRuleset('2014');
                  setStepIndex(0);
                  scrollToSection('ruleset', 0);
                }}
                className={`p-4 rounded-xl text-left transition-all cursor-pointer shadow-sm ${
                  ruleset === '2014'
                    ? 'bg-dnd-panel ring-1 ring-dnd-gold'
                    : 'bg-dnd-panel/60 hover:bg-dnd-panel'
                }`}
              >
                <div className="text-sm font-semibold text-slate-100">
                  D&amp;D 5th Edition (2014)
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  The original fifth edition ruleset, featuring classic race, class, and background mechanics.
                </p>
              </button>
            </div>
          </div>
        );

      case 'class':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200 font-display">
                Choose your class
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Determine your character&apos;s role, combat style, and adventuring abilities.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {classesForRuleset.map((cls) => {
                const isSel = selectedClass?.id === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setChosenSkills([]);
                    }}
                    className={`p-3 rounded-xl text-left transition-all cursor-pointer shadow-sm ${
                      isSel
                        ? 'bg-dnd-panel ring-1 ring-dnd-gold'
                        : 'bg-dnd-panel/50 hover:bg-dnd-panel'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-100">{cls.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Hit Die: {cls.hitDieString}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedClass && (
              <div className="p-3.5 rounded-xl bg-dnd-panel/70 space-y-3 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm">{selectedClass.name}</span>
                  <span className="text-[11px] text-dnd-gold font-mono">
                    Hit Die: {selectedClass.hitDieString} • Saves:{' '}
                    {selectedClass.savingThrows?.map((s) => s.toUpperCase()).join(', ')}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {selectedClass.description}
                </p>

                {/* Skill choice */}
                {selectedClass.skillChoices && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="text-[11px] font-medium text-slate-300">
                      Choose {selectedClass.skillChoices.count} Skill Proficiencies ({chosenSkills.length}/{selectedClass.skillChoices.count}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedClass.skillChoices.from === 'all'
                        ? ['acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand', 'stealth', 'survival']
                        : selectedClass.skillChoices.from
                      ).map((sk) => {
                        const isPicked = chosenSkills.includes(sk);
                        return (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => {
                              if (isPicked) {
                                setChosenSkills(chosenSkills.filter((s) => s !== sk));
                              } else if (chosenSkills.length < selectedClass.skillChoices.count) {
                                setChosenSkills([...chosenSkills, sk]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                              isPicked
                                ? 'bg-dnd-gold text-slate-950 font-bold'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            {sk}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Subclass / Archetype */}
                {selectedClass.subclasses?.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
                      <span>
                        {selectedClass.name === 'Cleric'
                          ? 'Divine Domain'
                          : selectedClass.name === 'Warlock'
                          ? 'Otherworldly Patron'
                          : selectedClass.name === 'Sorcerer'
                          ? 'Sorcerous Origin'
                          : 'Subclass / Archetype'}
                        {ruleset === '2024' || (selectedClass.name !== 'Cleric' && selectedClass.name !== 'Warlock' && selectedClass.name !== 'Sorcerer')
                          ? ' (Planned / Level 3):'
                          : ' (Level 1 Choice):'}
                      </span>
                      {selectedSubclass && (
                        <button
                          type="button"
                          onClick={() => setSelectedSubclassId('')}
                          className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scroll pr-1">
                      {selectedClass.subclasses.map((sub) => {
                        const isSubPicked = selectedSubclassId === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setSelectedSubclassId(isSubPicked ? '' : sub.id)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                              isSubPicked
                                ? 'bg-dnd-gold text-slate-950 font-bold'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'species':
      case 'race':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-200 font-display">
                  {key === 'species' ? 'Choose your species' : 'Choose your race & subrace'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {key === 'species'
                    ? 'Determine your ancestry and innate traits.'
                    : 'Ancestry grants racial ability score increases and unique traits.'}
                </p>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-64">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search species (e.g. Tabaxi)..."
                  value={speciesSearch}
                  onChange={(e) => setSpeciesSearch(e.target.value)}
                  className="w-full bg-dnd-panel rounded-lg pl-7 pr-12 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold"
                />
                {speciesSearch && (
                  <button
                    type="button"
                    onClick={() => setSpeciesSearch('')}
                    className="absolute right-2 top-1.5 text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Species Grid */}
            <div className="max-h-60 overflow-y-auto custom-scroll pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredSpecies.map((sp) => {
                const isSel = selectedSpecies?.id === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setSelectedSpeciesId(sp.id)}
                    className={`p-3 rounded-xl text-left transition-all cursor-pointer shadow-sm ${
                      isSel
                        ? 'bg-dnd-panel ring-1 ring-dnd-gold'
                        : 'bg-dnd-panel/50 hover:bg-dnd-panel'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-100 truncate">{sp.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {sp.subraces?.length > 0
                        ? `${sp.subraces.length} ${ruleset === '2024' ? 'Lineages' : 'Subraces'}`
                        : `Speed: ${sp.speed} ft`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Subrace / Lineage Selector */}
            {selectedSpecies?.subraces?.length > 0 && (
              <div className="p-3 rounded-xl bg-dnd-panel/60 space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  {ruleset === '2024' ? 'Choose Lineage / Ancestry for' : 'Choose Subrace for'} {selectedSpecies.name}:
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scroll pr-1">
                  {selectedSpecies.subraces.map((sub) => {
                    const isSubSel = selectedSubrace?.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubraceId(sub.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          isSubSel
                            ? 'bg-dnd-gold text-slate-950 font-bold'
                            : 'bg-dnd-card text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {sub.subraceName || sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Species Preview */}
            {selectedSpecies && (
              <div className="p-3.5 rounded-xl bg-dnd-panel/70 space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm">
                    {selectedSubrace?.name || selectedSpecies.name}
                  </span>
                  <span className="text-[10px] text-amber-400">
                    {selectedSpecies.size} • {selectedSubrace?.speed || selectedSpecies.speed} ft Speed
                    {(selectedSubrace?.darkvision || selectedSpecies.darkvision) > 0 &&
                      ` • Darkvision ${selectedSubrace?.darkvision || selectedSpecies.darkvision} ft`}
                  </span>
                </div>

                {/* 2014 Racial ASI */}
                {ruleset === '2014' && (
                  <div className="text-[11px] text-dnd-gold font-medium">
                    Ability Bonuses:{' '}
                    {Object.entries({
                      ...(selectedSpecies.abilityBonuses || {}),
                      ...(selectedSubrace?.abilityBonuses || {}),
                    })
                      .filter(([k, v]) => typeof v === 'number' && v > 0)
                      .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                      .join(', ') || 'Flexible'}
                  </div>
                )}

                {/* Traits */}
                <div className="space-y-1.5 pt-1 border-t border-white/5 max-h-40 overflow-y-auto custom-scroll pr-1">
                  {[
                    ...(selectedSpecies.traits || []),
                    ...(selectedSubrace?.traits || []),
                  ].map((t) => (
                    <div key={t.name} className="text-[11px]">
                      <strong className="text-slate-200">{t.name}:</strong>{' '}
                      <span className="text-slate-400">{t.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'background':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200 font-display">
                Choose your background
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {ruleset === '2024'
                  ? 'Background determines ability score increases (+2/+1 or +1/+1/+1) and an Origin Feat.'
                  : 'Background provides story origins, skill proficiencies, and starting gear.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {backgroundsForRuleset.map((bg) => {
                const isSel = selectedBackground?.id === bg.id;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setSelectedBackgroundId(bg.id)}
                    className={`p-3 rounded-xl text-left transition-all cursor-pointer shadow-sm ${
                      isSel
                        ? 'bg-dnd-panel ring-1 ring-dnd-gold'
                        : 'bg-dnd-panel/50 hover:bg-dnd-panel'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-100">{bg.name}</div>
                    {bg.originFeat && (
                      <div className="text-[10px] text-dnd-gold mt-0.5 truncate">
                        Feat: {bg.originFeat}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedBackground && (
              <div className="p-3.5 rounded-xl bg-dnd-panel/70 space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm">{selectedBackground.name}</span>
                  {selectedBackground.originFeat && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-dnd-gold/15 text-dnd-gold font-semibold">
                      Origin Feat: {selectedBackground.originFeat}
                    </span>
                  )}
                </div>

                {/* 2024 Background ASI Distribution */}
                {ruleset === '2024' && selectedBackground.eligibleAbilities?.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="text-[11px] font-medium text-slate-300">
                      Ability Score Boost (Eligible: {selectedBackground.eligibleAbilities.map((a) => a.toUpperCase()).join(', ')}):
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Choose +2 / +1 distribution among eligible abilities:
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedBackground.eligibleAbilities.map((ab) => {
                        const currentVal = bgBonusChoice[ab] || 0;
                        return (
                          <button
                            key={ab}
                            type="button"
                            onClick={() => {
                              const next = currentVal === 2 ? 0 : currentVal + 1;
                              setBgBonusChoice((prev) => ({ ...prev, [ab]: next }));
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentVal > 0
                                ? 'bg-dnd-gold text-slate-950'
                                : 'bg-dnd-card text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {ab.toUpperCase()}: +{currentVal}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2014 Feature */}
                {ruleset === '2014' && selectedBackground.feature && (
                  <div className="pt-2 border-t border-white/5 text-[11px]">
                    <strong className="text-slate-200">
                      Feature: {selectedBackground.feature.name}
                    </strong>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      {selectedBackground.feature.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'abilities':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200 font-display">
                Determine your ability scores
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Establish your character&apos;s physical and mental capabilities.
              </p>
            </div>

            {/* Method selector */}
            <div className="flex items-center space-x-2 pb-1">
              <button
                type="button"
                onClick={() => {
                  setAbilityMethod('standard');
                  setBaseScores({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  abilityMethod === 'standard'
                    ? 'bg-dnd-gold text-slate-950 font-bold'
                    : 'bg-dnd-panel text-slate-300 hover:bg-white/10'
                }`}
              >
                Standard Array
              </button>
              <button
                type="button"
                onClick={() => setAbilityMethod('pointbuy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  abilityMethod === 'pointbuy'
                    ? 'bg-dnd-gold text-slate-950 font-bold'
                    : 'bg-dnd-panel text-slate-300 hover:bg-white/10'
                }`}
              >
                Point Buy (27 pts)
              </button>
              <button
                type="button"
                onClick={() => setAbilityMethod('roll')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  abilityMethod === 'roll'
                    ? 'bg-dnd-gold text-slate-950 font-bold'
                    : 'bg-dnd-panel text-slate-300 hover:bg-white/10'
                }`}
              >
                Roll (4d6 drop lowest)
              </button>
            </div>

            {/* Point buy budget display */}
            {abilityMethod === 'pointbuy' && (
              <div className="text-xs text-slate-300 bg-dnd-panel/60 p-2.5 rounded-lg flex items-center justify-between">
                <span>Point Buy Budget:</span>
                <span className="font-bold text-amber-400">
                  {POINT_BUY_TOTAL - calculatePointBuyCost(baseScores)} points remaining
                </span>
              </div>
            )}

            {/* Roll re-roll button */}
            {abilityMethod === 'roll' && (
              <div className="flex items-center justify-between text-xs text-slate-300 bg-dnd-panel/60 p-2.5 rounded-lg">
                <span>Rolled pool: {rollPool.map((r) => r.total).join(', ')}</span>
                <button
                  type="button"
                  onClick={() => setRollPool(generateRollPool())}
                  className="text-dnd-gold hover:text-dnd-gold-light font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Re-roll</span>
                </button>
              </div>
            )}

            {/* Ability Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ABILITY_KEYS.map((k) => {
                const base = baseScores[k] || 10;
                const bonus = abilityCalculation.bonuses[k] || 0;
                const finalVal = abilityCalculation.finalScores[k] || 10;
                const mod = abilityCalculation.modifiers[k] || 0;

                return (
                  <div
                    key={k}
                    className="p-3 rounded-xl bg-dnd-panel/60 space-y-2 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        {ABILITY_LABELS[k]}
                      </span>
                      <span className="text-xs font-mono font-bold text-dnd-gold">
                        {formatModifier(mod)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">Score:</span>
                      <div className="flex items-center space-x-1.5">
                        {abilityMethod === 'pointbuy' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setBaseScores((prev) => ({
                                  ...prev,
                                  [k]: Math.max(8, (prev[k] || 8) - 1),
                                }))
                              }
                              className="w-5 h-5 rounded bg-dnd-card text-slate-300 hover:text-white flex items-center justify-center cursor-pointer text-xs"
                            >
                              -
                            </button>
                            <span className="font-bold text-xs text-slate-100">{base}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setBaseScores((prev) => ({
                                  ...prev,
                                  [k]: Math.min(15, (prev[k] || 8) + 1),
                                }))
                              }
                              className="w-5 h-5 rounded bg-dnd-card text-slate-300 hover:text-white flex items-center justify-center cursor-pointer text-xs"
                            >
                              +
                            </button>
                          </>
                        )}
                        {abilityMethod !== 'pointbuy' && (
                          <input
                            type="number"
                            min={3}
                            max={20}
                            value={base}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 10;
                              setBaseScores((prev) => ({ ...prev, [k]: val }));
                            }}
                            className="w-12 text-center py-0.5 rounded bg-dnd-card text-slate-100 text-xs font-bold"
                          />
                        )}
                      </div>
                    </div>

                    {bonus !== 0 && (
                      <div className="text-[10px] text-amber-400 text-right">
                        +{bonus} bonus = {finalVal} total
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200 font-display">
                Who is your character?
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Give your adventurer an identity beyond their statistics.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Character Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gale of Waterdeep"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="w-full bg-dnd-panel rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Alignment</label>
                  <input
                    type="text"
                    placeholder="e.g. Chaotic Good"
                    value={details.alignment}
                    onChange={(e) =>
                      setDetails((prev) => ({ ...prev, alignment: e.target.value }))
                    }
                    className="w-full bg-dnd-panel rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-dnd-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 28"
                    value={details.age}
                    onChange={(e) =>
                      setDetails((prev) => ({ ...prev, age: e.target.value }))
                    }
                    className="w-full bg-dnd-panel rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-dnd-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Gender</label>
                  <input
                    type="text"
                    placeholder="e.g. Male / Female / Non-binary"
                    value={details.gender}
                    onChange={(e) =>
                      setDetails((prev) => ({ ...prev, gender: e.target.value }))
                    }
                    className="w-full bg-dnd-panel rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-dnd-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Backstory &amp; Lore</label>
                <textarea
                  rows={3}
                  placeholder="Write character background, origin, or notes..."
                  value={details.backstory}
                  onChange={(e) =>
                    setDetails((prev) => ({ ...prev, backstory: e.target.value }))
                  }
                  className="w-full bg-dnd-panel rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-dnd-gold resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 'equipment':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200 font-display">
                Prepare your equipment
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose starting gear granted by your class and background.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEquipmentOption('A')}
                className={`p-4 rounded-xl text-left transition-all cursor-pointer shadow-sm ${
                  equipmentOption === 'A'
                    ? 'bg-dnd-panel ring-1 ring-dnd-gold'
                    : 'bg-dnd-panel/60 hover:bg-dnd-panel'
                }`}
              >
                <div className="text-sm font-bold text-slate-100">Option A: Starting Equipment</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Receive default adventuring pack, weapons, armor, and 10 GP.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEquipmentOption('B')}
                className={`p-4 rounded-xl text-left transition-all cursor-pointer shadow-sm ${
                  equipmentOption === 'B'
                    ? 'bg-dnd-panel ring-1 ring-dnd-gold'
                    : 'bg-dnd-panel/60 hover:bg-dnd-panel'
                }`}
              >
                <div className="text-sm font-bold text-slate-100">Option B: Starting Gold</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Start with 100 GP to purchase custom gear during adventure.
                </p>
              </button>
            </div>
          </div>
        );

      case 'spells':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200 font-display">
                Configure your abilities &amp; spells
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Review Level 1 class capabilities and configure starting spells if applicable.
              </p>
            </div>

            {/* Level 1 Features */}
            <div className="p-3.5 rounded-xl bg-dnd-panel/60 space-y-2">
              <div className="text-xs font-bold text-slate-200">
                Level 1 {selectedClass?.name} Features:
              </div>
              <div className="space-y-1.5">
                {selectedClass?.level1Features?.map((f) => (
                  <div key={f.name} className="text-[11px]">
                    <strong className="text-amber-400">{f.name}:</strong>{' '}
                    <span className="text-slate-300">{f.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spell selection if spellcaster */}
            {selectedClass?.hasSpellcasting && classLevel1Spells.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-200">
                  Select Starting 1st-Level Spells &amp; Cantrips:
                </div>
                <div className="max-h-48 overflow-y-auto custom-scroll grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1">
                  {classLevel1Spells.map((sp) => {
                    const isSel = selectedSpells.some((s) => (s.id || s) === sp.id);
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => {
                          if (isSel) {
                            setSelectedSpells(selectedSpells.filter((s) => (s.id || s) !== sp.id));
                          } else {
                            setSelectedSpells([...selectedSpells, sp]);
                          }
                        }}
                        className={`p-2 rounded-lg text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                          isSel
                            ? 'bg-dnd-gold text-slate-950 font-bold'
                            : 'bg-dnd-panel/70 text-slate-300 hover:bg-dnd-panel'
                        }`}
                      >
                        <span>{sp.name}</span>
                        <span className="text-[10px] opacity-80">
                          {sp.level === 0 ? 'Cantrip' : 'Level 1'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4 text-xs text-slate-300">
            <div>
              <h4 className="text-sm font-bold text-slate-200 font-display">
                Review your character
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Confirm your selections to create your Level 1 character sheet.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-dnd-panel/60">
                <div className="text-[10px] text-slate-500 uppercase">Name</div>
                <div className="font-bold text-slate-100 text-sm truncate">
                  {characterName.trim() || 'New Adventurer'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-dnd-panel/60">
                <div className="text-[10px] text-slate-500 uppercase">Class &amp; Level</div>
                <div className="font-bold text-slate-100 text-sm">
                  {selectedClass?.name} 1
                </div>
                {selectedSubclass && (
                  <div className="text-[11px] text-amber-400 truncate">
                    {selectedSubclass.name}
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-dnd-panel/60">
                <div className="text-[10px] text-slate-500 uppercase">Ruleset</div>
                <div className="font-bold text-slate-100 text-sm">
                  5e ({ruleset})
                </div>
              </div>
              <div className="p-3 rounded-xl bg-dnd-panel/60">
                <div className="text-[10px] text-slate-500 uppercase">Ancestry</div>
                <div className="font-bold text-slate-100 text-sm truncate">
                  {selectedSubrace?.name || selectedSpecies?.name || 'None'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-dnd-panel/60 space-y-2">
              <div className="font-bold text-slate-200">Abilities &amp; Modifiers:</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                {ABILITY_KEYS.map((k) => (
                  <div key={k} className="p-2 rounded-lg bg-dnd-card">
                    <div className="text-[10px] text-slate-400 uppercase">{k}</div>
                    <div className="font-bold text-sm text-slate-100">
                      {abilityCalculation.finalScores[k]}
                    </div>
                    <div className="text-[10px] font-mono text-dnd-gold">
                      {formatModifier(abilityCalculation.modifiers[k])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in overscroll-contain">
      <div className="bg-dnd-card rounded-2xl w-full max-w-3xl h-[88vh] sm:h-[90vh] max-h-[860px] flex flex-col shadow-2xl overflow-hidden">
        {/* Wizard Header */}
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between bg-dnd-card shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-dnd-gold/10 text-dnd-gold">
              <Wand2 size={17} />
            </span>
            <div>
              <h3 className="text-base font-bold text-dnd-ivory tracking-tight font-display">
                Character Builder (Level 1)
              </h3>
              <p className="text-xs text-slate-400">
                Section {stepIndex + 1} of {steps.length} — {currentStep.label}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Exit Builder"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Progress Pill Bar */}
        <div
          ref={pillBarRef}
          className="px-5 py-2 bg-dnd-panel/40 border-b border-white/5 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0"
        >
          {steps.map((st, idx) => {
            const isActive = idx === stepIndex;
            const isCompleted = idx < stepIndex;
            return (
              <button
                key={st.key}
                type="button"
                data-step-index={idx}
                onClick={() => scrollToSection(st.key, idx)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-dnd-gold text-slate-950 font-bold shadow-sm'
                    : isCompleted
                    ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <span className="opacity-60 mr-1">{idx + 1}.</span>
                {st.label}
              </button>
            );
          })}
        </div>

        {/* Long Form Scrollable Content Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 p-5 overflow-y-auto custom-scroll space-y-10"
        >
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs italic">
              Loading ruleset data from 5etools...
            </div>
          ) : (
            steps.map((st, idx) => (
              <section
                key={st.key}
                id={`builder-section-${st.key}`}
                className="space-y-4 pt-6 first:pt-0 border-t border-white/5 first:border-0 scroll-mt-2"
              >
                <div className="flex items-center space-x-2 text-xs font-semibold text-dnd-gold">
                  <span className="px-1.5 py-0.5 rounded bg-dnd-gold/10 text-dnd-gold font-mono text-[10px]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="tracking-wide uppercase text-[10px]">{st.label}</span>
                </div>
                {renderSectionContent(st.key)}
              </section>
            ))
          )}
        </div>

        {/* Wizard Persistent Footer Controls */}
        <div className="px-5 py-3.5 border-t border-white/5 flex items-center justify-between bg-dnd-card shrink-0">
          <button
            type="button"
            aria-label="Previous step"
            disabled={stepIndex === 0}
            onClick={handleBack}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-2">
            {stepIndex < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1 px-4 py-1.5 rounded-lg bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center space-x-1.5 px-5 py-1.5 rounded-lg bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>Create Character</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
