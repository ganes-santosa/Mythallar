import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Wand2,
  Sparkles,
  RotateCcw,
  Search,
  User,
  Footprints,
  Eye,
  BookOpen,
  UserRound,
  Swords,
  ScrollText,
  Compass,
  Zap,
  Package,
  Camera,
} from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { compressImageFile } from '../../utils/imageCompressor';
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
import { formatModifier, SKILLS_DEFINITION } from '../../utils/dndCalculations';
import SmoothSize from '../Common/SmoothSize';
import ClassIcon from '../Common/ClassIcon';
import ImageCropModal from '../Modal/ImageCropModal';

const SKILL_LABELS = Object.fromEntries(
  SKILLS_DEFINITION.map((s) => [s.key, s.label])
);
const getSkillLabel = (k) => SKILL_LABELS[k] || k;

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
  const [selectedSpeciesId, setSelectedSpeciesId] = useState('');
  const [selectedSubraceId, setSelectedSubraceId] = useState('');
  const [selectedBackgroundId, setSelectedBackgroundId] = useState('');
  const [speciesSearch, setSpeciesSearch] = useState('');

  // Class skill picks & feature preview
  const [chosenSkills, setChosenSkills] = useState([]);
  const [showClassFeatures, setShowClassFeatures] = useState(false);

  // Ability Scores
  const [abilityMethod, setAbilityMethod] = useState('standard'); // 'standard' | 'pointbuy' | 'roll' | 'custom'
  const [baseScores, setBaseScores] = useState({
    str: null,
    dex: null,
    con: null,
    int: null,
    wis: null,
    cha: null,
  });
  const [rollPool, setRollPool] = useState([]);
  const [rollAssignments, setRollAssignments] = useState({
    str: null,
    dex: null,
    con: null,
    int: null,
    wis: null,
    cha: null,
  });
  const [bgBonusChoice, setBgBonusChoice] = useState({}); // e.g. { int: 2, con: 1 }
  const [racialChoice, setRacialChoice] = useState({});

  // Equipment
  const [equipmentOption, setEquipmentOption] = useState('A');

  // Identity / Backstory
  const portraitInputRef = useRef(null);
  const [cropModalState, setCropModalState] = useState({ isOpen: false, imageSrc: '' });
  const [details, setDetails] = useState({
    portrait: '',
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

  const handlePortraitUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result;
      if (src && typeof src === 'string') {
        setCropModalState({ isOpen: true, imageSrc: src });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyCrop = (croppedUrl) => {
    setDetails((prev) => ({ ...prev, portrait: croppedUrl }));
    setCropModalState({ isOpen: false, imageSrc: '' });
  };

  // Data catalogues
  const [allClasses, setAllClasses] = useState([]);
  const [allSpecies, setAllSpecies] = useState([]);
  const [allBackgrounds, setAllBackgrounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load datasets on mount
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    loadBuilderData().then((builderData) => {
      if (!active) return;
      setAllClasses(builderData?.classes || []);
      setAllSpecies(builderData?.species || []);
      setAllBackgrounds(builderData?.backgrounds || []);
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

  // Persistent refs for closing animations (prevents abrupt unmount during collapse transitions)
  const hasSelectedClass = Boolean(selectedClass);
  const lastSelectedClassRef = useRef(null);
  if (hasSelectedClass) lastSelectedClassRef.current = selectedClass;
  const displayedClass = hasSelectedClass ? selectedClass : lastSelectedClassRef.current;

  const hasSubraces = Boolean(selectedSpecies?.subraces?.length > 0);
  const lastSubracesSpeciesRef = useRef(null);
  if (hasSubraces) lastSubracesSpeciesRef.current = selectedSpecies;
  const subracesSpeciesToDisplay = hasSubraces ? selectedSpecies : lastSubracesSpeciesRef.current;

  const hasSelectedSpecies = Boolean(selectedSpecies);
  const lastSelectedSpeciesRef = useRef(null);
  if (hasSelectedSpecies) lastSelectedSpeciesRef.current = selectedSpecies;
  const displayedSpecies = hasSelectedSpecies ? selectedSpecies : lastSelectedSpeciesRef.current;

  const hasSelectedBg = Boolean(selectedBackground);
  const lastSelectedBgRef = useRef(null);
  if (hasSelectedBg) lastSelectedBgRef.current = selectedBackground;
  const displayedBackground = hasSelectedBg ? selectedBackground : lastSelectedBgRef.current;

  const lastBannerMethodRef = useRef('standard');

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

  // Reset 2024 Background ASI choices to 0/unfilled when background or ruleset changes
  const prevBgIdRef = useRef(selectedBackgroundId);
  const prevRulesetRef = useRef(ruleset);
  useEffect(() => {
    if (
      (prevBgIdRef.current && prevBgIdRef.current !== selectedBackgroundId) ||
      (prevRulesetRef.current && prevRulesetRef.current !== ruleset)
    ) {
      setBgBonusChoice({});
    }
    prevBgIdRef.current = selectedBackgroundId;
    prevRulesetRef.current = ruleset;
  }, [ruleset, selectedBackgroundId]);

  // Roll pool generator
  useEffect(() => {
    if (rollPool.length === 0) {
      setRollPool(generateRollPool());
    }
  }, [rollPool]);

  // Dynamic step sequences per ruleset - Identity is step 2 right after Ruleset
  const STEPS_2024 = [
    { key: 'ruleset', label: 'Ruleset' },
    { key: 'identity', label: 'Identity' },
    { key: 'class', label: 'Class' },
    { key: 'background', label: 'Background' },
    { key: 'species', label: 'Species' },
    { key: 'abilities', label: 'Abilities' },
    { key: 'equipment', label: 'Equipment' },
  ];

  const STEPS_2014 = [
    { key: 'ruleset', label: 'Ruleset' },
    { key: 'identity', label: 'Identity' },
    { key: 'race', label: 'Race & Subrace' },
    { key: 'class', label: 'Class' },
    { key: 'abilities', label: 'Abilities' },
    { key: 'background', label: 'Background' },
    { key: 'equipment', label: 'Equipment' },
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

  // Ability score assignment & calculation helpers
  const handleStandardArrayChange = (targetKey, newScore) => {
    const currentTargetVal = baseScores[targetKey];
    if (currentTargetVal === newScore) {
      setBaseScores((prev) => ({ ...prev, [targetKey]: null }));
      return;
    }

    const otherKey = ABILITY_KEYS.find(
      (key) => key !== targetKey && baseScores[key] === newScore
    );

    setBaseScores((prev) => {
      const next = { ...prev, [targetKey]: newScore };
      if (otherKey) {
        next[otherKey] = currentTargetVal ?? null;
      }
      return next;
    });
  };

  const pointBuyCost = useMemo(() => calculatePointBuyCost(baseScores), [baseScores]);
  const pointBuyRemaining = POINT_BUY_TOTAL - pointBuyCost;

  const canPointBuyPlus = (key) => {
    const val = baseScores[key] ?? 8;
    if (val >= 15) return false;
    const costDiff = (POINT_BUY_COSTS[val + 1] ?? 99) - (POINT_BUY_COSTS[val] ?? 0);
    return pointBuyRemaining >= costDiff;
  };

  const canPointBuyMinus = (key) => {
    const val = baseScores[key] ?? 8;
    return val > 8;
  };

  const handlePointBuyChange = (key, delta) => {
    if (delta > 0 && canPointBuyPlus(key)) {
      setBaseScores((prev) => ({ ...prev, [key]: (prev[key] || 8) + 1 }));
    } else if (delta < 0 && canPointBuyMinus(key)) {
      setBaseScores((prev) => ({ ...prev, [key]: (prev[key] || 8) - 1 }));
    }
  };

  const handleRollReroll = () => {
    const newPool = generateRollPool();
    setRollPool(newPool);
    setBaseScores({
      str: rollAssignments.str !== null ? (newPool[rollAssignments.str]?.total ?? 10) : null,
      dex: rollAssignments.dex !== null ? (newPool[rollAssignments.dex]?.total ?? 10) : null,
      con: rollAssignments.con !== null ? (newPool[rollAssignments.con]?.total ?? 10) : null,
      int: rollAssignments.int !== null ? (newPool[rollAssignments.int]?.total ?? 10) : null,
      wis: rollAssignments.wis !== null ? (newPool[rollAssignments.wis]?.total ?? 10) : null,
      cha: rollAssignments.cha !== null ? (newPool[rollAssignments.cha]?.total ?? 10) : null,
    });
  };

  const handleRollAssignmentChange = (targetKey, newIndex) => {
    const currentTargetIndex = rollAssignments[targetKey];
    if (currentTargetIndex === newIndex) {
      setRollAssignments((prev) => ({ ...prev, [targetKey]: null }));
      setBaseScores((prev) => ({ ...prev, [targetKey]: null }));
      return;
    }

    const otherKey = ABILITY_KEYS.find(
      (key) => key !== targetKey && rollAssignments[key] === newIndex
    );

    const nextAssignments = { ...rollAssignments, [targetKey]: newIndex };
    if (otherKey) {
      nextAssignments[otherKey] = currentTargetIndex ?? null;
    }
    setRollAssignments(nextAssignments);

    setBaseScores((prev) => {
      const next = { ...prev, [targetKey]: rollPool[newIndex]?.total ?? 10 };
      if (otherKey) {
        next[otherKey] =
          currentTargetIndex !== null && currentTargetIndex !== undefined
            ? (rollPool[currentTargetIndex]?.total ?? 10)
            : null;
      }
      return next;
    });
  };

  const handleCustomScoreChange = (key, rawVal) => {
    const num = parseInt(rawVal, 10);
    setBaseScores((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 10 : Math.max(1, Math.min(30, num)),
    }));
  };

  const handleCustomStepper = (key, delta) => {
    setBaseScores((prev) => {
      const cur = Number(prev[key]) || 10;
      return {
        ...prev,
        [key]: Math.max(1, Math.min(30, cur + delta)),
      };
    });
  };

  const switchToStandard = () => {
    setAbilityMethod('standard');
    setBaseScores({ str: null, dex: null, con: null, int: null, wis: null, cha: null });
  };

  const switchToPointBuy = () => {
    setAbilityMethod('pointbuy');
    const isValidPB =
      ABILITY_KEYS.every((k) => typeof baseScores[k] === 'number' && baseScores[k] >= 8 && baseScores[k] <= 15) &&
      calculatePointBuyCost(baseScores) <= POINT_BUY_TOTAL;
    if (!isValidPB) {
      setBaseScores({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 });
    }
  };

  const switchToRoll = () => {
    setAbilityMethod('roll');
    let pool = rollPool;
    if (!pool || pool.length < 6) {
      pool = generateRollPool();
      setRollPool(pool);
    }
    setRollAssignments({ str: null, dex: null, con: null, int: null, wis: null, cha: null });
    setBaseScores({ str: null, dex: null, con: null, int: null, wis: null, cha: null });
  };

  const switchToCustom = () => {
    setAbilityMethod('custom');
    setBaseScores((prev) => {
      const next = { ...prev };
      for (const k of ABILITY_KEYS) {
        if (next[k] === null || next[k] === undefined || next[k] === '') {
          next[k] = 10;
        }
      }
      return next;
    });
  };

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
    if (container && (targetIndex === 0 || key === steps[0]?.key)) {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        container.scrollTop = 0;
      }
    } else if (container && target) {
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

    // Bottom reached -> mark last step as active
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
      selectedSubclass: null,
      selectedSpecies,
      selectedSubrace,
      selectedBackground,
      baseScores,
      bgBonusChoice,
      racialChoice,
      chosenSkills,
      equipmentOption,
      selectedSpells: [],
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
              <div className="flex items-center space-x-2">
                <BookOpen size={14} className="text-dnd-gold shrink-0" />
                <h4 className="text-sm font-bold text-slate-200 font-display">
                  Choose Your Ruleset
                </h4>
              </div>
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
                className={`p-4 rounded-xl text-left transition-colors cursor-pointer shadow-sm ${
                  ruleset === '2024'
                    ? 'bg-dnd-panel ring-1 ring-dnd-gold/40'
                    : 'bg-dnd-panel/60 hover:bg-dnd-panel'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-100">
                    D&amp;D 5th Edition 2024
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-dnd-gold/15 text-dnd-gold">
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
                className={`p-4 rounded-xl text-left transition-colors cursor-pointer shadow-sm ${
                  ruleset === '2014'
                    ? 'bg-dnd-panel ring-1 ring-dnd-gold/40'
                    : 'bg-dnd-panel/60 hover:bg-dnd-panel'
                }`}
              >
                <div className="text-sm font-semibold text-slate-100">
                  D&amp;D 5th Edition 2014 (Legacy)
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  The original fifth edition ruleset, featuring classic race, class, and background mechanics.
                </p>
              </button>
            </div>
          </div>
        );

      case 'identity':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <UserRound size={14} className="text-dnd-gold shrink-0" />
                <h4 className="text-sm font-bold text-slate-200 font-display">
                  Character Identity
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bring your adventurer to life with a name, alignment, appearance, and personal backstory.
              </p>
            </div>

            <div className="space-y-3">
              <div className="character-profile-card w-full rounded-xl bg-dnd-card shadow-sm flex items-stretch overflow-hidden">
                {/* Left: Prominent Portrait Column with Gradient Fade to Right */}
                <div className="relative flex-shrink-0 w-28 sm:w-36 md:w-40 max-h-36 sm:max-h-40 self-stretch overflow-hidden group select-none">
                  {details.portrait ? (
                    <img
                      src={details.portrait}
                      alt={characterName || 'Character Portrait'}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[110px] bg-dnd-panel/70 flex flex-col items-center justify-center text-slate-500 group-hover:text-dnd-gold transition-colors p-2 text-center">
                      <User size={32} />
                      <span className="text-[10px] mt-1 text-slate-400 font-medium">Add Portrait</span>
                    </div>
                  )}

                  {/* Vertical gradient on the right edge of the portrait fading into card background */}
                  <div className="absolute inset-y-0 right-0 w-12 sm:w-16 bg-gradient-to-r from-transparent via-dnd-card/50 to-dnd-card pointer-events-none z-10" />

                  {/* Hover overlay to change avatar with soft right gradient */}
                  <button
                    type="button"
                    onClick={() => portraitInputRef.current?.click()}
                    aria-label="Upload character portrait"
                    title="Click to upload portrait (auto-compressed to 256px WebP)"
                    className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer focus:outline-none focus:opacity-100 z-20"
                  >
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-black/75 text-slate-200 text-[10px] shadow">
                      <Camera size={12} className="text-dnd-gold" />
                      <span>{details.portrait ? 'Change' : 'Upload'}</span>
                    </div>
                  </button>

                  {/* Remove portrait button */}
                  {details.portrait && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetails((prev) => ({ ...prev, portrait: '' }));
                      }}
                      aria-label="Remove portrait"
                      title="Remove portrait"
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 hover:bg-black/80 text-slate-400 hover:text-red-400 transition-colors z-20 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}

                  <input
                    ref={portraitInputRef}
                    type="file"
                    accept="image/*"
                    aria-label="Portrait file input"
                    onChange={handlePortraitUpload}
                    className="hidden"
                  />
                </div>

                {/* Right: Info Fields Column */}
                <div className="flex-1 p-3 sm:p-3.5 min-w-0 flex flex-col justify-between space-y-2.5">
                  {/* Line 1: Character Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Character Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gale of Waterdeep"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      className="w-full bg-dnd-panel rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold/40 transition-colors"
                    />
                  </div>

                  {/* Line 2: Age, Gender, Alignment */}
                  {/* Age (col-span-1 = 1/4), Gender (col-span-1 = 1/4), Alignment (col-span-2 = 2/4) */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-300 mb-1 truncate">Age</label>
                      <input
                        type="text"
                        placeholder="e.g. 28"
                        value={details.age}
                        onChange={(e) =>
                          setDetails((prev) => ({ ...prev, age: e.target.value }))
                        }
                        className="w-full bg-dnd-panel rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold/40 transition-colors"
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-300 mb-1 truncate">Gender</label>
                      <input
                        type="text"
                        placeholder="e.g. Male / Female / Non-binary"
                        value={details.gender}
                        onChange={(e) =>
                          setDetails((prev) => ({ ...prev, gender: e.target.value }))
                        }
                        className="w-full bg-dnd-panel rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold/40 transition-colors"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1 truncate">Alignment</label>
                      <input
                        type="text"
                        placeholder="e.g. Chaotic Good"
                        value={details.alignment}
                        onChange={(e) =>
                          setDetails((prev) => ({ ...prev, alignment: e.target.value }))
                        }
                        className="w-full bg-dnd-panel rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold/40 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Backstory & Lore textarea below */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Backstory &amp; Lore</label>
                <textarea
                  rows={3}
                  placeholder="Write character background, origin, or personal history..."
                  value={details.backstory}
                  onChange={(e) =>
                    setDetails((prev) => ({ ...prev, backstory: e.target.value }))
                  }
                  className="w-full bg-dnd-panel rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold/40 resize-none transition-colors"
                />
              </div>
            </div>
          </div>
        );

      case 'class':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <Swords size={14} className="text-dnd-gold shrink-0" />
                <h4 className="text-sm font-bold text-slate-200 font-display">
                  Choose Your Class
                </h4>
              </div>
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
                    className={`p-2.5 sm:p-3 rounded-xl text-left transition-colors cursor-pointer shadow-sm group ${
                      isSel
                        ? 'bg-dnd-panel ring-1 ring-dnd-gold/40'
                        : 'bg-dnd-panel/50 hover:bg-dnd-panel'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSel
                            ? 'bg-dnd-gold/15 text-dnd-gold'
                            : 'bg-white/5 text-slate-400 group-hover:text-slate-200 group-hover:bg-white/10'
                        }`}
                      >
                        <ClassIcon name={cls.name} size={23} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-100 truncate">{cls.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          Hit Die: {cls.hitDieString}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Class Detail Viewer */}
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                hasSelectedClass
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                {displayedClass && (
                  <SmoothSize
                    watchKey={[displayedClass.id, showClassFeatures, chosenSkills.length]}
                    duration={300}
                    className="p-3.5 rounded-xl bg-dnd-panel/70 space-y-3 text-xs text-slate-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-dnd-gold/15 text-dnd-gold flex items-center justify-center shrink-0">
                          <ClassIcon name={displayedClass.name} size={24} />
                        </div>
                        <span className="font-bold text-slate-200 text-sm">{displayedClass.name}</span>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-dnd-gold/15 text-dnd-gold font-semibold">
                        Hit Die: {displayedClass.hitDieString} • Saves:{' '}
                        {displayedClass.savingThrows?.map((s) => s.toUpperCase()).join(', ')}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {displayedClass.description}
                    </p>

                    {/* Skill choice with checkboxes and Title Case labels */}
                    {displayedClass.skillChoices && (
                      <div className="pt-2 border-t border-white/5 space-y-1.5">
                        <div className="text-[11px] font-medium text-slate-300">
                          Choose {displayedClass.skillChoices.count} Skill Proficiencies ({chosenSkills.length}/{displayedClass.skillChoices.count}):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(displayedClass.skillChoices.from === 'all'
                            ? ['acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand', 'stealth', 'survival']
                            : displayedClass.skillChoices.from
                          ).map((sk) => {
                            const isPicked = chosenSkills.includes(sk);
                            return (
                              <button
                                key={sk}
                                type="button"
                                onClick={() => {
                                  if (isPicked) {
                                    setChosenSkills(chosenSkills.filter((s) => s !== sk));
                                  } else if (chosenSkills.length < displayedClass.skillChoices.count) {
                                    setChosenSkills([...chosenSkills, sk]);
                                  }
                                }}
                                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-sm ${
                                  isPicked
                                    ? 'bg-dnd-card ring-1 ring-dnd-gold/40 text-slate-100 font-bold'
                                    : 'bg-dnd-card/70 text-slate-300 hover:bg-dnd-card'
                                }`}
                              >
                                <span
                                  className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 transition-colors ${
                                    isPicked
                                      ? 'bg-dnd-gold text-slate-950'
                                      : 'bg-white/5 border border-white/20'
                                  }`}
                                >
                                  {isPicked && <Check size={11} strokeWidth={3} />}
                                </span>
                                <span>{getSkillLabel(sk)}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Starting Features Accordion */}
                    {displayedClass.level1Features?.length > 0 && (
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <button
                          type="button"
                          onClick={() => setShowClassFeatures(!showClassFeatures)}
                          className="flex items-center space-x-1.5 text-left group focus:outline-none cursor-pointer"
                          aria-label={showClassFeatures ? 'Collapse Starting Features' : 'Expand Starting Features'}
                        >
                          <Sparkles size={14} className="text-dnd-gold group-hover:scale-110 transition-transform flex-shrink-0" />
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-dnd-gold-light transition-colors">
                            Starting Features
                          </span>
                          <ChevronDown
                            size={13}
                            className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${
                              showClassFeatures ? '' : '-rotate-90'
                            }`}
                          />
                        </button>

                        <div
                          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${
                            showClassFeatures ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="pt-1.5 space-y-2">
                              {displayedClass.level1Features.map((f) => (
                                <div key={f.name} className="p-2.5 rounded-lg bg-dnd-card shadow-sm space-y-1">
                                  <div className="font-bold text-white text-xs">{f.name}</div>
                                  <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-line">
                                    {f.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </SmoothSize>
                )}
              </div>
            </div>
          </div>
        );

      case 'species':
      case 'race':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Compass size={14} className="text-dnd-gold shrink-0" />
                  <h4 className="text-sm font-bold text-slate-200 font-display">
                    {key === 'species' ? 'Choose Your Species' : 'Choose Your Race & Subrace'}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {key === 'species'
                    ? 'Determine your ancestry and innate traits.'
                    : 'Ancestry grants racial ability score increases and unique traits.'}
                </p>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-64">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search species (e.g. Tabaxi)..."
                  value={speciesSearch}
                  onChange={(e) => setSpeciesSearch(e.target.value)}
                  className="w-full bg-dnd-panel rounded-lg pl-7 pr-12 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold/40 transition-colors"
                />
                {speciesSearch && (
                  <button
                    type="button"
                    onClick={() => setSpeciesSearch('')}
                    className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Species Grid */}
            <div className="max-h-48 overflow-y-auto custom-scroll pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredSpecies.map((sp) => {
                const isSel = selectedSpecies?.id === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setSelectedSpeciesId(sp.id)}
                    className={`p-3 rounded-xl text-left transition-colors cursor-pointer shadow-sm ${
                      isSel
                        ? 'bg-dnd-panel ring-1 ring-dnd-gold/40'
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
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                hasSubraces
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                {subracesSpeciesToDisplay?.subraces?.length > 0 && (
                  <SmoothSize
                    watchKey={subracesSpeciesToDisplay.id}
                    duration={250}
                    className="p-3 rounded-xl bg-dnd-panel/60 space-y-2"
                  >
                    <div className="text-xs font-semibold text-slate-300">
                      {ruleset === '2024' ? 'Choose Lineage / Ancestry for' : 'Choose Subrace for'} {subracesSpeciesToDisplay.name}:
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scroll pr-1">
                      {subracesSpeciesToDisplay.subraces.map((sub) => {
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
                  </SmoothSize>
                )}
              </div>
            </div>

            {/* Selected Species Preview */}
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                hasSelectedSpecies
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                {displayedSpecies && (
                  <SmoothSize
                    watchKey={[displayedSpecies.id, selectedSubrace?.id, ruleset]}
                    duration={300}
                    className="p-3.5 rounded-xl bg-dnd-panel/70 space-y-2 text-xs text-slate-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-200 text-sm">
                        {selectedSubrace?.name || displayedSpecies.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {displayedSpecies.size && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-dnd-card text-[10px] font-medium text-slate-300 shadow-sm">
                            <User size={11} className="text-dnd-gold" />
                            <span>{displayedSpecies.size}</span>
                          </span>
                        )}
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-dnd-card text-[10px] font-medium text-slate-300 shadow-sm">
                          <Footprints size={11} className="text-emerald-400" />
                          <span>{selectedSubrace?.speed || displayedSpecies.speed} ft Speed</span>
                        </span>
                        {(selectedSubrace?.darkvision || displayedSpecies.darkvision) > 0 && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-dnd-card text-[10px] font-medium text-slate-300 shadow-sm">
                            <Eye size={11} className="text-purple-400" />
                            <span>Darkvision {selectedSubrace?.darkvision || displayedSpecies.darkvision} ft</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2014 Racial ASI */}
                    {ruleset === '2014' && (
                      <div className="text-[11px] text-dnd-gold font-medium">
                        Ability Bonuses:{' '}
                        {Object.entries({
                          ...(displayedSpecies.abilityBonuses || {}),
                          ...(selectedSubrace?.abilityBonuses || {}),
                        })
                          .filter(([k, v]) => typeof v === 'number' && v > 0)
                          .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                          .join(', ') || 'Flexible'}
                      </div>
                    )}

                    {/* Traits / Starting Features */}
                    <div className="space-y-2 pt-1 border-t border-white/5 max-h-72 overflow-y-auto custom-scroll pr-1">
                      {[
                        ...(displayedSpecies.traits || []),
                        ...(selectedSubrace?.traits || []),
                      ].map((t) => (
                        <div key={t.name} className="p-2.5 rounded-lg bg-dnd-card shadow-sm space-y-1">
                          <div className="font-bold text-white text-xs">{t.name}</div>
                          <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-line">
                            {t.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </SmoothSize>
                )}
              </div>
            </div>
          </div>
        );

      case 'background':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <ScrollText size={14} className="text-dnd-gold shrink-0" />
                <h4 className="text-sm font-bold text-slate-200 font-display">
                  Choose Your Background
                </h4>
              </div>
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
                    className={`p-3 rounded-xl text-left transition-colors cursor-pointer shadow-sm ${
                      isSel
                        ? 'bg-dnd-panel ring-1 ring-dnd-gold/40'
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

            {/* Background Detail Viewer */}
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                hasSelectedBg
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                {displayedBackground && (
                  <SmoothSize
                    watchKey={[displayedBackground.id, ruleset]}
                    duration={300}
                    className="p-3.5 rounded-xl bg-dnd-panel/70 space-y-3 text-xs text-slate-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-sm">{displayedBackground.name}</span>
                      {displayedBackground.originFeat && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-dnd-gold/15 text-dnd-gold font-semibold">
                          Origin Feat: {displayedBackground.originFeat}
                        </span>
                      )}
                    </div>

                    {/* 2024 Background ASI Distribution: Point-Buy Style Stepper */}
                    {ruleset === '2024' && displayedBackground.eligibleAbilities?.length > 0 && (() => {
                      const allocatedPoints = displayedBackground.eligibleAbilities.reduce(
                        (sum, ab) => sum + (bgBonusChoice[ab] || 0),
                        0
                      );
                      const remainingPoints = 3 - allocatedPoints;

                      return (
                        <div className="pt-2 border-t border-white/5 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
                            <span>
                              Ability Score Boost (Eligible: {displayedBackground.eligibleAbilities.map((a) => a.toUpperCase()).join(', ')}):
                            </span>
                            <span className="font-bold text-amber-400">
                              {remainingPoints} of 3 points remaining
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Allocate up to +2 to one ability and +1 to another, or +1 to each of the three abilities.
                          </p>
                          <div className="flex flex-wrap gap-2.5 pt-1">
                            {displayedBackground.eligibleAbilities.map((ab) => {
                              const val = bgBonusChoice[ab] || 0;
                              const canMinus = val > 0;
                              const canPlus = val < 2 && remainingPoints > 0;
                              return (
                                <div
                                  key={ab}
                                  className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl transition-colors shadow-sm ${
                                    val > 0
                                      ? 'bg-dnd-card ring-1 ring-dnd-gold/40'
                                      : 'bg-dnd-card'
                                  }`}
                                >
                                  <span className="text-xs font-bold text-slate-100">{ab.toUpperCase()}</span>
                                  <div className="flex items-center space-x-1.5">
                                    <button
                                      type="button"
                                      aria-label={`Decrease ${ab.toUpperCase()}`}
                                      disabled={!canMinus}
                                      onClick={() =>
                                        setBgBonusChoice((prev) => ({
                                          ...prev,
                                          [ab]: Math.max(0, (prev[ab] || 0) - 1),
                                        }))
                                      }
                                      className="w-5 h-5 rounded bg-dnd-panel text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-xs font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="font-bold text-xs text-dnd-gold w-6 text-center">
                                      +{val}
                                    </span>
                                    <button
                                      type="button"
                                      aria-label={`Increase ${ab.toUpperCase()}`}
                                      disabled={!canPlus}
                                      onClick={() =>
                                        setBgBonusChoice((prev) => ({
                                          ...prev,
                                          [ab]: Math.min(2, (prev[ab] || 0) + 1),
                                        }))
                                      }
                                      className="w-5 h-5 rounded bg-dnd-panel text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-xs font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 2014 Feature */}
                    {ruleset === '2014' && displayedBackground.feature && (
                      <div className="pt-2 border-t border-white/5 text-[11px]">
                        <strong className="text-slate-200">
                          Feature: {displayedBackground.feature.name}
                        </strong>
                        <p className="text-slate-400 mt-1 leading-relaxed">
                          {displayedBackground.feature.description}
                        </p>
                      </div>
                    )}
                  </SmoothSize>
                )}
              </div>
            </div>
          </div>
        );

      case 'abilities':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <Zap size={14} className="text-dnd-gold shrink-0" />
                <h4 className="text-sm font-bold text-slate-200 font-display">
                  Determine Your Ability Scores
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Establish your character&apos;s physical and mental capabilities.
              </p>
            </div>

            {/* Method selector buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              {[
                { id: 'roll', label: 'Stat Roll', handler: switchToRoll },
                { id: 'custom', label: 'Custom', handler: switchToCustom },
                { id: 'standard', label: 'Standard Array', handler: switchToStandard },
                { id: 'pointbuy', label: 'Point Buy', handler: switchToPointBuy },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={m.handler}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    abilityMethod === m.id
                      ? 'bg-dnd-gold text-slate-950 font-bold'
                      : 'bg-dnd-panel text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Method-specific helper banners with uniform opening & closing animations */}
            {(() => {
              const hasTopCard = abilityMethod !== 'custom';
              if (hasTopCard) lastBannerMethodRef.current = abilityMethod;
              const displayedBannerMethod = hasTopCard ? abilityMethod : (lastBannerMethodRef.current || 'standard');

              return (
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    hasTopCard
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    {displayedBannerMethod === 'roll' && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-dnd-panel/60 text-xs text-slate-300 min-h-[40px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-slate-400">Rolled Pool:</span>
                          {rollPool.map((r, i) => {
                            const assignedKey = ABILITY_KEYS.find((k) => rollAssignments[k] === i);
                            return (
                              <span
                                key={i}
                                title={`Dice: [${r.rolls.join(', ')}], dropped: ${r.dropped}`}
                                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm transition-colors ${
                                  assignedKey
                                    ? 'bg-dnd-card text-slate-400'
                                    : 'bg-dnd-gold/20 text-dnd-gold ring-1 ring-dnd-gold/40'
                                }`}
                              >
                                <span>{r.total}</span>
                                {assignedKey && (
                                  <span className="text-[10px] text-dnd-gold font-semibold">
                                    ({assignedKey.toUpperCase()})
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={handleRollReroll}
                          className="text-dnd-gold hover:text-dnd-gold-light font-bold flex items-center space-x-1 cursor-pointer text-xs"
                        >
                          <RotateCcw size={12} />
                          <span>Re-roll Pool</span>
                        </button>
                      </div>
                    )}

                    {displayedBannerMethod === 'standard' && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-dnd-panel/60 text-xs text-slate-300 min-h-[40px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-slate-400">Standard Array Pool:</span>
                          {STANDARD_ARRAY.map((num) => {
                            const assignedKey = abilityMethod === 'standard'
                              ? ABILITY_KEYS.find((k) => baseScores[k] === num)
                              : null;
                            return (
                              <span
                                key={num}
                                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm transition-colors ${
                                  assignedKey
                                    ? 'bg-dnd-card text-slate-400'
                                    : 'bg-dnd-gold/20 text-dnd-gold ring-1 ring-dnd-gold/40'
                                }`}
                              >
                                <span>{num}</span>
                                {assignedKey && (
                                  <span className="text-[10px] text-dnd-gold font-semibold">
                                    ({assignedKey.toUpperCase()})
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => setBaseScores({ str: null, dex: null, con: null, int: null, wis: null, cha: null })}
                          className="text-dnd-gold hover:text-dnd-gold-light font-bold flex items-center space-x-1 cursor-pointer text-xs"
                        >
                          <RotateCcw size={12} />
                          <span>Reset</span>
                        </button>
                      </div>
                    )}

                    {displayedBannerMethod === 'pointbuy' && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-dnd-panel/60 text-xs text-slate-300 min-h-[40px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-slate-400">Point Buy Budget:</span>
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm transition-colors ${
                              pointBuyRemaining === 0
                                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
                                : pointBuyRemaining > 0
                                ? 'bg-dnd-gold/20 text-dnd-gold ring-1 ring-dnd-gold/40'
                                : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40'
                            }`}
                          >
                            <span>{pointBuyRemaining}</span>
                            <span
                              className={`text-[10px] font-semibold ${
                                pointBuyRemaining === 0
                                  ? 'text-emerald-400'
                                  : pointBuyRemaining > 0
                                  ? 'text-dnd-gold'
                                  : 'text-red-400'
                              }`}
                            >
                              of {POINT_BUY_TOTAL} Remaining
                            </span>
                          </span>
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm bg-dnd-card text-slate-400">
                            <span>{Math.max(0, POINT_BUY_TOTAL - pointBuyRemaining)}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              Spent
                            </span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBaseScores({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 })}
                          className="text-dnd-gold hover:text-dnd-gold-light font-bold flex items-center space-x-1 cursor-pointer text-xs"
                        >
                          <RotateCcw size={12} />
                          <span>Reset</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* D&D Beyond-Style Unified Ability Score Grid */}
            <div className="grid items-start grid-cols-2 sm:grid-cols-3 gap-3">
              {ABILITY_KEYS.map((k) => {
                const rawBase = baseScores[k];
                const isAssigned = rawBase !== null && rawBase !== undefined && rawBase !== '';
                const base = isAssigned ? Number(rawBase) : 10;
                const bonus = abilityCalculation.bonuses[k] || 0;
                const finalVal = isAssigned ? abilityCalculation.finalScores[k] : null;
                const mod = isAssigned ? abilityCalculation.modifiers[k] : null;

                return (
                  <SmoothSize
                    key={k}
                    watchKey={abilityMethod}
                    duration={250}
                    className="p-3 rounded-xl bg-dnd-panel/70 shadow-sm flex flex-col items-center text-center space-y-2.5"
                  >
                    {/* Top: Ability Label */}
                    <div className="text-xs font-bold text-slate-100 tracking-wide">
                      {ABILITY_LABELS[k]}
                    </div>

                    {/* Middle: Base Score Input / Pool Assignment */}
                    <div className="w-full flex flex-col items-center justify-center min-h-[48px]">
                      {abilityMethod === 'standard' && (
                        <div className="space-y-1.5 w-full flex flex-col items-center animate-in fade-in duration-200">
                          <div
                            aria-label={`${ABILITY_LABELS[k]} Base Score`}
                            className="w-16 h-9 rounded-lg bg-dnd-card shadow-sm flex items-center justify-center text-base font-black text-slate-100"
                          >
                            {isAssigned ? rawBase : '—'}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Assign :
                          </span>
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {STANDARD_ARRAY.map((val) => {
                              const isThisSelected = rawBase === val;
                              const otherOwner = ABILITY_KEYS.find(
                                (otherKey) => otherKey !== k && baseScores[otherKey] === val
                              );
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  aria-label={`Assign ${val} to ${ABILITY_LABELS[k]}`}
                                  title={
                                    isThisSelected
                                      ? 'Click to unassign'
                                      : otherOwner
                                      ? `Currently on ${ABILITY_LABELS[otherOwner]} (click to swap)`
                                      : `Assign ${val}`
                                  }
                                  onClick={() => handleStandardArrayChange(k, val)}
                                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                                    isThisSelected
                                      ? 'bg-dnd-gold text-slate-950 shadow-sm scale-105'
                                      : otherOwner
                                      ? 'bg-dnd-card/50 text-slate-500 hover:text-slate-200 hover:bg-dnd-card'
                                      : 'bg-dnd-card text-slate-200 hover:bg-white/10 ring-1 ring-dnd-gold/40'
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {abilityMethod === 'roll' && (
                        <div className="space-y-1.5 w-full flex flex-col items-center animate-in fade-in duration-200">
                          <div
                            aria-label={`${ABILITY_LABELS[k]} Base Score`}
                            className="w-16 h-9 rounded-lg bg-dnd-card shadow-sm flex items-center justify-center text-base font-black text-slate-100"
                          >
                            {isAssigned ? rawBase : '—'}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Assign :
                          </span>
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {rollPool.map((r, idx) => {
                              const isThisSelected = rollAssignments[k] === idx;
                              const otherOwner = ABILITY_KEYS.find(
                                (otherKey) => otherKey !== k && rollAssignments[otherKey] === idx
                              );
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  aria-label={`Assign roll ${r.total} to ${ABILITY_LABELS[k]}`}
                                  title={
                                    isThisSelected
                                      ? 'Click to unassign'
                                      : otherOwner
                                      ? `Currently on ${ABILITY_LABELS[otherOwner]} (click to swap)`
                                      : `Assign ${r.total} (Dice: ${r.rolls.join(', ')})`
                                  }
                                  onClick={() => handleRollAssignmentChange(k, idx)}
                                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                                    isThisSelected
                                      ? 'bg-dnd-gold text-slate-950 shadow-sm scale-105'
                                      : otherOwner
                                      ? 'bg-dnd-card/50 text-slate-500 hover:text-slate-200 hover:bg-dnd-card'
                                      : 'bg-dnd-card text-slate-200 hover:bg-white/10 ring-1 ring-dnd-gold/40'
                                  }`}
                                >
                                  {r.total}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {abilityMethod === 'pointbuy' && (
                        <div className="flex items-center space-x-1.5 animate-in fade-in duration-200">
                          <button
                            type="button"
                            aria-label={`Decrease base ${ABILITY_LABELS[k]}`}
                            disabled={!canPointBuyMinus(k)}
                            onClick={() => handlePointBuyChange(k, -1)}
                            className="w-7 h-8 rounded-lg bg-dnd-card text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-sm font-bold shadow-sm"
                          >
                            -
                          </button>
                          <div
                            aria-label={`${ABILITY_LABELS[k]} Base Score`}
                            className="w-12 h-9 rounded-lg bg-dnd-card shadow-sm flex items-center justify-center font-black text-base text-slate-100"
                          >
                            {base}
                          </div>
                          <button
                            type="button"
                            aria-label={`Increase base ${ABILITY_LABELS[k]}`}
                            disabled={!canPointBuyPlus(k)}
                            onClick={() => handlePointBuyChange(k, 1)}
                            className="w-7 h-8 rounded-lg bg-dnd-card text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-sm font-bold shadow-sm"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {abilityMethod === 'custom' && (
                        <div className="flex items-center space-x-1.5 animate-in fade-in duration-200">
                          <button
                            type="button"
                            aria-label={`Decrease base ${ABILITY_LABELS[k]}`}
                            disabled={base <= 1}
                            onClick={() => handleCustomStepper(k, -1)}
                            className="w-7 h-8 rounded-lg bg-dnd-card text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-sm font-bold shadow-sm"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            aria-label={`${ABILITY_LABELS[k]} Base Score`}
                            value={base}
                            onChange={(e) => handleCustomScoreChange(k, e.target.value)}
                            className="w-12 h-9 text-center rounded-lg bg-dnd-card text-slate-100 text-base font-black shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-dnd-gold/40"
                          />
                          <button
                            type="button"
                            aria-label={`Increase base ${ABILITY_LABELS[k]}`}
                            disabled={base >= 30}
                            onClick={() => handleCustomStepper(k, 1)}
                            className="w-7 h-8 rounded-lg bg-dnd-card text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-sm font-bold shadow-sm"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Unified D&D Beyond-Style "Total: X" + Modifier + Bonus */}
                    <div className="w-full pt-1.5 flex flex-col items-center space-y-0.5 bg-dnd-card/60 rounded-lg py-1.5 px-2">
                      <div className="flex items-center justify-center space-x-1.5">
                        <span className="text-xs font-semibold text-slate-300">
                          Total:{' '}
                          <strong className="text-sm font-black text-slate-100">
                            {isAssigned ? finalVal : '—'}
                          </strong>
                        </span>
                        {isAssigned && (
                          <span className="text-xs font-bold text-dnd-gold">
                            ({formatModifier(mod)})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isAssigned && bonus !== 0 ? (
                          <span>
                            Base {base}{' '}
                            <span className="text-amber-400 font-semibold">
                              +{bonus} {ruleset === '2024' ? 'Background' : 'Species'}
                            </span>
                          </span>
                        ) : isAssigned ? (
                          <span>Base {base}</span>
                        ) : (
                          <span>Unassigned</span>
                        )}
                      </div>
                    </div>
                  </SmoothSize>
                );
              })}
            </div>
          </div>
        );

      case 'equipment':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <Package size={14} className="text-dnd-gold shrink-0" />
                <h4 className="text-sm font-bold text-slate-200 font-display">
                  Prepare Your Equipment
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose starting gear granted by your class and background.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEquipmentOption('A')}
                className={`p-4 rounded-xl text-left transition-colors cursor-pointer shadow-sm ${
                  equipmentOption === 'A'
                    ? 'bg-dnd-panel ring-1 ring-dnd-gold/40'
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
                className={`p-4 rounded-xl text-left transition-colors cursor-pointer shadow-sm ${
                  equipmentOption === 'B'
                    ? 'bg-dnd-panel ring-1 ring-dnd-gold/40'
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
            steps.map((st) => (
              <section
                key={st.key}
                id={`builder-section-${st.key}`}
                className="space-y-4 pt-6 first:pt-0 border-t border-white/5 first:border-0 scroll-mt-2"
              >
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

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalState.isOpen}
        imageSrc={cropModalState.imageSrc}
        onClose={() => setCropModalState({ isOpen: false, imageSrc: '' })}
        onApplyCrop={handleApplyCrop}
      />
    </div>
  );
}
