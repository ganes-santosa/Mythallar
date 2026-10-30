import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BookOpen, Sparkles, AlertCircle, CheckCircle2, Settings, Plus } from 'lucide-react';
import {
  loadCharacterProfiles,
  saveCharacterProfiles,
  createDefaultProfile,
  loadHomebrewSpells,
  saveHomebrewSpells,
  loadAppSettings,
  saveAppSettings,
} from './utils/storage';
import { getEffectiveMaxSlots, isWizardCharacter } from './utils/spellSlots';
import { exportCharacterJSON, validateAndImportCharacterJSON } from './utils/fileExport';
import { useSpellFilter } from './hooks/useSpellFilter';
import { getSupabase, signInWithGoogle, signOut } from './utils/supabase';
import {
  fetchCloudData,
  syncCharactersToCloud,
  syncHomebrewToCloud,
  deleteCloudCharacter,
  mergeLocalAndCloud,
} from './utils/syncService';
import { getStoredThemeId, setTheme, applyTheme, getActiveTheme } from './utils/themeService';
import FilterBar from './components/Catalog/FilterBar';
import SpellList from './components/Catalog/SpellList';
import HomebrewSpellModal from './components/Catalog/HomebrewSpellModal';
import CharacterHeader from './components/Header/CharacterHeader';
import SettingsModal from './components/Header/SettingsModal';
import CreateCharacterModal from './components/Modal/CreateCharacterModal';
import MythallarLogo from './components/Common/MythallarLogo';
import SpellSlotTracker from './components/Spellbook/SpellSlotTracker';
import SpellbookView from './components/Spellbook/SpellbookView';
import { APP_VERSION } from './version';

export default function App() {
  // --- Character & Profile State ---
  const [profileData, setProfileData] = useState(() => loadCharacterProfiles());
  const [isCreateCharacterModalOpen, setIsCreateCharacterModalOpen] = useState(false);
  const { profiles, activeId } = profileData;

  const activeCharacter = useMemo(() => {
    return profiles.find((p) => p.id === activeId) || profiles[0] || null;
  }, [profiles, activeId]);

  const activeCharacterRef = useRef(activeCharacter);
  useEffect(() => {
    activeCharacterRef.current = activeCharacter;
  }, [activeCharacter]);

  // Persist profiles on change
  useEffect(() => {
    saveCharacterProfiles(profileData);
  }, [profileData]);

  // --- Homebrew Spells State ---
  const [homebrewSpells, setHomebrewSpells] = useState(() => loadHomebrewSpells());
  const [isHomebrewSpellModalOpen, setIsHomebrewSpellModalOpen] = useState(false);

  useEffect(() => {
    saveHomebrewSpells(homebrewSpells);
  }, [homebrewSpells]);

  // --- Settings & Theme State ---
  const [activeThemeId, setActiveThemeId] = useState(() => getStoredThemeId());
  const [customThemeRev, setCustomThemeRev] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appSettings, setAppSettings] = useState(() => loadAppSettings());
  const starCanvasRef = useRef(null);

  const handleToggleSkipCopying = useCallback((value) => {
    setAppSettings((prev) => {
      const next = { ...prev, skipCopying: value };
      saveAppSettings(next);
      return next;
    });
  }, []);

  const activeTheme = useMemo(
    () => getActiveTheme(activeThemeId),
    [activeThemeId, customThemeRev]
  );
  const activeTexture = activeTheme?.texture || 'none';

  useEffect(() => {
    applyTheme(activeThemeId);
  }, [activeThemeId, customThemeRev]);

  useEffect(() => {
    if (activeTexture !== 'stars') return;
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return;
    const canvas = starCanvasRef.current;
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 1920;
    const h = 1080;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    let s = 91827364;
    const rand = () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };

    for (let i = 0; i < 45000; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const roll = rand();
      const alpha = roll > 0.94 ? 0.65 + rand() * 0.35 : 0.1 + rand() * 0.45;
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;

      if (roll > 0.985) {
        ctx.beginPath();
        ctx.arc(x, y, 1.05 + rand() * 0.55, 0, Math.PI * 2);
        ctx.fill();
      } else if (roll > 0.82) {
        ctx.fillRect(x, y, 1.35, 1.35);
      } else {
        ctx.fillRect(x, y, 0.85, 0.85);
      }
    }
  }, [activeTexture]);

  const handleSelectTheme = (themeId) => {
    setTheme(themeId);
    setActiveThemeId(themeId);
  };

  // --- Auth & Cloud Sync State ---
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'saved' | 'error' | 'offline'
  const debounceSyncTimer = useRef(null);
  const supabase = getSupabase();

  // Listen to Supabase auth state change
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // Pull cloud data on user login
  useEffect(() => {
    if (!supabase || !user) return;

    let cancelled = false;
    setSyncStatus('syncing');

    fetchCloudData(supabase, user.id)
      .then(({ characters: cloudChars, homebrewSpells: cloudHb }) => {
        if (cancelled) return;

        // Merge cloud characters with local profiles
        setProfileData((prev) => {
          const merged = mergeLocalAndCloud(prev.profiles, cloudChars);
          return {
            ...prev,
            profiles: merged.length > 0 ? merged : prev.profiles,
          };
        });

        // Merge homebrew spells
        setHomebrewSpells((prev) => mergeLocalAndCloud(prev, cloudHb));

        setSyncStatus('saved');
        showToast('Characters synced with cloud', 'success');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Initial cloud sync error:', err);
        setSyncStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  // Debounced push to cloud when local profileData or homebrew changes
  useEffect(() => {
    if (!supabase || !user) return;

    if (debounceSyncTimer.current) {
      clearTimeout(debounceSyncTimer.current);
    }

    setSyncStatus('syncing');

    debounceSyncTimer.current = setTimeout(async () => {
      const [charRes, hbRes] = await Promise.all([
        syncCharactersToCloud(supabase, user.id, profileData.profiles),
        syncHomebrewToCloud(supabase, user.id, homebrewSpells),
      ]);

      if (charRes.success && hbRes.success) {
        setSyncStatus('saved');
      } else {
        setSyncStatus('error');
      }
    }, 1500);

    return () => {
      if (debounceSyncTimer.current) clearTimeout(debounceSyncTimer.current);
    };
  }, [profileData.profiles, homebrewSpells, user, supabase]);

  const handleSignIn = useCallback(async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      showToast(error.message, 'error');
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    const { error } = await signOut();
    if (error) {
      showToast(error.message, 'error');
    } else {
      setUser(null);
      setSyncStatus('idle');
      showToast('Signed out', 'info');
    }
  }, []);

  const handleManualSyncNow = useCallback(async () => {
    if (!supabase || !user) return;
    setSyncStatus('syncing');
    const [cRes, hRes] = await Promise.all([
      syncCharactersToCloud(supabase, user.id, profileData.profiles),
      syncHomebrewToCloud(supabase, user.id, homebrewSpells),
    ]);
    if (cRes.success && hRes.success) {
      setSyncStatus('saved');
      showToast('Cloud sync complete', 'success');
    } else {
      setSyncStatus('error');
      showToast('Cloud sync failed', 'error');
    }
  }, [supabase, user, profileData.profiles, homebrewSpells]);

  // --- Spell Catalog State ---
  const [baseSpells, setBaseSpells] = useState([]);
  const [isLoadingSpells, setIsLoadingSpells] = useState(true);
  const [spellError, setSpellError] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch('/data/spells.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch spells`);
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setBaseSpells(Array.isArray(data) ? data : []);
          setIsLoadingSpells(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Error fetching spells catalog:', err);
          setSpellError('Could not load spells dataset.');
          setIsLoadingSpells(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Merge base catalog spells + homebrew spells
  const allSpells = useMemo(() => {
    return [...homebrewSpells, ...baseSpells];
  }, [homebrewSpells, baseSpells]);

  // Quick lookup dictionary: spell.id -> Spell
  const catalogMap = useMemo(() => {
    const map = {};
    for (const s of allSpells) {
      map[s.id] = s;
    }
    return map;
  }, [allSpells]);

  // Spellbook spell ID set for fast in-book checks
  const spellbookSpellIds = useMemo(() => {
    const ids = new Set();
    if (activeCharacter?.spells) {
      for (const item of activeCharacter.spells) {
        ids.add(item.id);
      }
    }
    return ids;
  }, [activeCharacter?.spells]);

  // Spell notes map for active character
  const spellNotesMap = useMemo(() => {
    const map = {};
    if (activeCharacter?.spells) {
      for (const item of activeCharacter.spells) {
        if (item.note) {
          map[item.id] = item.note;
        }
      }
    }
    return map;
  }, [activeCharacter?.spells]);

  // --- Filter State ---
  const [filters, setFilters] = useState({
    search: '',
    level: 'all',
    className: 'all',
    school: 'all',
    legacyMode: 'all', // 'all', 'modern', 'legacy'
    source: 'all',
    isHomebrewOnly: false,
    concentration: false,
    ritual: false,
    compV: false,
    compS: false,
    compM: false,
  });

  const availableSources = useMemo(() => {
    const set = new Set();
    for (const s of allSpells) {
      if (s.source) set.add(s.source);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allSpells]);

  const filteredSpells = useSpellFilter(allSpells, filters);

  // --- Toast Notification State ---
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3200);
  }, []);

  // --- Character Profile Mutations ---
  const updateActiveCharacter = useCallback(
    (updated) => {
      setProfileData((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === updated.id ? updated : p)),
      }));
    },
    []
  );

  const handleSelectProfile = (id) => {
    setProfileData((prev) => ({ ...prev, activeId: id }));
  };

  const handleOpenCreateCharacter = () => {
    setIsCreateCharacterModalOpen(true);
  };

  const handleSaveNewCharacter = ({ name, className }) => {
    const newChar = createDefaultProfile(name, className);
    setProfileData((prev) => ({
      profiles: [...prev.profiles, newChar],
      activeId: newChar.id,
    }));
    setIsCreateCharacterModalOpen(false);
    showToast(`Created new profile: ${newChar.name}`, 'success');
  };

  const handleDeleteCharacter = useCallback(
    async (charId) => {
      const deletedChar = profileData.profiles.find((p) => p.id === charId);
      const remainingProfiles = profileData.profiles.filter((p) => p.id !== charId);
      const nextActiveId =
        profileData.activeId === charId ? (remainingProfiles[0]?.id || null) : profileData.activeId;

      setProfileData({
        profiles: remainingProfiles,
        activeId: nextActiveId,
      });

      if (supabase && user) {
        deleteCloudCharacter(supabase, user.id, charId);
      }

      showToast(`Deleted ${deletedChar?.name || 'character'}`, 'info');
    },
    [profileData, supabase, user, showToast]
  );

  const handleExport = () => {
    if (activeCharacter) {
      exportCharacterJSON(activeCharacter);
      showToast(`Exported ${activeCharacter.name}'s spellbook`, 'success');
    }
  };

  const handleImport = (jsonStr) => {
    const { character, error } = validateAndImportCharacterJSON(jsonStr);
    if (error) {
      showToast(error, 'error');
      return;
    }
    setProfileData((prev) => ({
      profiles: [...prev.profiles, character],
      activeId: character.id,
    }));
    showToast(`Imported ${character.name}!`, 'success');
  };

  // --- Homebrew Spell Action ---
  const handleSaveHomebrewSpell = (newSpell) => {
    setHomebrewSpells((prev) => [newSpell, ...prev]);
    showToast(`Created homebrew spell: ${newSpell.name}`, 'success');
  };

  const handleDeleteHomebrewSpell = useCallback((spellId) => {
    const spell = homebrewSpells.find((s) => s.id === spellId);
    setHomebrewSpells((prev) => prev.filter((s) => s.id !== spellId));

    // Also remove from all character profiles if they have it added
    setProfileData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => ({
        ...p,
        spells: (p.spells || []).filter((s) => s.id !== spellId),
      })),
    }));

    showToast(`Deleted homebrew spell${spell ? `: ${spell.name}` : ''}`, 'info');
  }, [homebrewSpells, showToast]);

  // --- Spell Management Actions ---
  const handleAddSpell = useCallback(
    (spellId) => {
      const char = activeCharacterRef.current;
      if (!char) return;
      const spell = catalogMap[spellId];
      if (!spell) return;

      const alreadyHas = char.spells?.some((s) => s.id === spellId);
      if (alreadyHas) {
        showToast(`${spell.name} is already in your spellbook`, 'info');
        return;
      }

      const shouldCopy = !appSettings.skipCopying && isWizardCharacter(char) && spell.level > 0;
      const updatedSpells = [
        ...(char.spells || []),
        { id: spellId, prepared: spell.level === 0, copying: shouldCopy },
      ];

      updateActiveCharacter({
        ...char,
        spells: updatedSpells,
      });

      showToast(
        shouldCopy ? `Added ${spell.name} to spellbook (Copying)` : `Added ${spell.name} to spellbook`,
        'success'
      );
    },
    [catalogMap, updateActiveCharacter, showToast, appSettings.skipCopying]
  );

  const handleFinishCopying = useCallback(
    (spellId) => {
      const char = activeCharacterRef.current;
      if (!char) return;
      const spell = catalogMap[spellId];
      const updatedSpells = (char.spells || []).map((s) =>
        s.id === spellId ? { ...s, copying: false } : s
      );
      updateActiveCharacter({
        ...char,
        spells: updatedSpells,
      });
      if (spell) {
        showToast(`Finished copying ${spell.name}`, 'success');
      }
    },
    [catalogMap, updateActiveCharacter, showToast]
  );

  const handleFinishCopyingAll = useCallback(() => {
    const char = activeCharacterRef.current;
    if (!char) return;
    const updatedSpells = (char.spells || []).map((s) =>
      s.copying ? { ...s, copying: false } : s
    );
    updateActiveCharacter({
      ...char,
      spells: updatedSpells,
    });
    showToast('Finished copying all spells!', 'success');
  }, [updateActiveCharacter, showToast]);

  const handleRemoveSpell = useCallback(
    (spellId) => {
      if (!activeCharacter) return;
      const spell = catalogMap[spellId];
      const updatedSpells = (activeCharacter.spells || []).filter((s) => s.id !== spellId);
      updateActiveCharacter({
        ...activeCharacter,
        spells: updatedSpells,
      });
      if (spell) {
        showToast(`Removed ${spell.name} from spellbook`, 'info');
      }
    },
    [activeCharacter, catalogMap, updateActiveCharacter, showToast]
  );

  const handleTogglePrepare = useCallback(
    (spellId) => {
      if (!activeCharacter) return;
      const updatedSpells = (activeCharacter.spells || []).map((s) =>
        s.id === spellId ? { ...s, prepared: !s.prepared } : s
      );
      updateActiveCharacter({
        ...activeCharacter,
        spells: updatedSpells,
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleUpdateSpellNote = useCallback(
    (spellId, note) => {
      const char = activeCharacterRef.current;
      if (!char) return;
      const existing = (char.spells || []).find((s) => s.id === spellId);
      let updatedSpells;
      if (existing) {
        updatedSpells = char.spells.map((s) =>
          s.id === spellId ? { ...s, note: note.trim() } : s
        );
      } else {
        const spell = catalogMap[spellId];
        const shouldCopy = !appSettings.skipCopying && isWizardCharacter(char) && spell && spell.level > 0;
        updatedSpells = [
          ...(char.spells || []),
          {
            id: spellId,
            prepared: false,
            copying: shouldCopy,
            note: note.trim(),
          },
        ];
      }
      updateActiveCharacter({
        ...char,
        spells: updatedSpells,
      });
    },
    [catalogMap, updateActiveCharacter, appSettings.skipCopying]
  );

  // --- Spell Slot Actions ---
  const slotBaselinesRef = useRef({});
  const prevActiveIdRef = useRef(activeCharacter?.id);
  if (prevActiveIdRef.current !== activeCharacter?.id) {
    prevActiveIdRef.current = activeCharacter?.id;
    slotBaselinesRef.current = {};
  }

  const handleDoneEditingMax = useCallback(() => {
    slotBaselinesRef.current = {};
  }, []);

  const handleUseSlot = useCallback(
    (level, explicitUsed) => {
      slotBaselinesRef.current = {};
      if (!activeCharacter) return;
      const currentUsed = activeCharacter.slotsUsed?.[level] || 0;
      const nextUsed = typeof explicitUsed === 'number' ? explicitUsed : currentUsed + 1;
      updateActiveCharacter({
        ...activeCharacter,
        slotsUsed: {
          ...activeCharacter.slotsUsed,
          [level]: nextUsed,
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleRestoreSlot = useCallback(
    (level, explicitUsed) => {
      slotBaselinesRef.current = {};
      if (!activeCharacter) return;
      const currentUsed = activeCharacter.slotsUsed?.[level] || 0;
      const nextUsed = typeof explicitUsed === 'number' ? explicitUsed : Math.max(0, currentUsed - 1);
      updateActiveCharacter({
        ...activeCharacter,
        slotsUsed: {
          ...activeCharacter.slotsUsed,
          [level]: nextUsed,
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleSetSlotsUsed = useCallback(
    (level, used) => {
      slotBaselinesRef.current = {};
      if (!activeCharacter) return;
      updateActiveCharacter({
        ...activeCharacter,
        slotsUsed: {
          ...activeCharacter.slotsUsed,
          [level]: Math.max(0, used),
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleUpdateMaxSlot = useCallback(
    (level, newMax) => {
      if (!activeCharacter) return;
      const effectiveSlots = getEffectiveMaxSlots(
        activeCharacter.className,
        activeCharacter.level,
        activeCharacter.customSlots,
        activeCharacter
      );
      const currentMax = effectiveSlots[level] || 0;
      const currentUsed = activeCharacter.slotsUsed?.[level] || 0;
      const safeNewMax = Math.max(0, newMax);

      // Lock baseline available slots snapshot for the editing state
      if (slotBaselinesRef.current[level] === undefined) {
        slotBaselinesRef.current[level] = Math.max(0, currentMax - currentUsed);
      }
      const baseline = slotBaselinesRef.current[level];
      const nextRemaining = Math.min(safeNewMax, baseline);
      const nextUsed = safeNewMax - nextRemaining;

      updateActiveCharacter({
        ...activeCharacter,
        customSlots: {
          ...activeCharacter.customSlots,
          [level]: safeNewMax,
        },
        slotsUsed: {
          ...activeCharacter.slotsUsed,
          [level]: nextUsed,
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleResetMaxSlot = useCallback(
    (level) => {
      if (!activeCharacter) return;
      const nextCustom = { ...activeCharacter.customSlots };
      delete nextCustom[level];

      const currentMax = getEffectiveMaxSlots(
        activeCharacter.className,
        activeCharacter.level,
        activeCharacter.customSlots,
        activeCharacter
      )[level] || 0;
      const newMax = getEffectiveMaxSlots(
        activeCharacter.className,
        activeCharacter.level,
        nextCustom,
        activeCharacter
      )[level] || 0;
      const currentUsed = activeCharacter.slotsUsed?.[level] || 0;

      if (slotBaselinesRef.current[level] === undefined) {
        slotBaselinesRef.current[level] = Math.max(0, currentMax - currentUsed);
      }
      const baseline = slotBaselinesRef.current[level];
      const nextRemaining = Math.min(newMax, baseline);
      const nextUsed = newMax - nextRemaining;

      updateActiveCharacter({
        ...activeCharacter,
        customSlots: nextCustom,
        slotsUsed: {
          ...activeCharacter.slotsUsed,
          [level]: nextUsed,
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleUsePactSlot = useCallback(() => {
    if (!activeCharacter) return;
    const currentUsed = activeCharacter.pactSlotsUsed || 0;
    updateActiveCharacter({
      ...activeCharacter,
      pactSlotsUsed: currentUsed + 1,
    });
  }, [activeCharacter, updateActiveCharacter]);

  const handleRestorePactSlot = useCallback(() => {
    if (!activeCharacter) return;
    const currentUsed = activeCharacter.pactSlotsUsed || 0;
    updateActiveCharacter({
      ...activeCharacter,
      pactSlotsUsed: Math.max(0, currentUsed - 1),
    });
  }, [activeCharacter, updateActiveCharacter]);

  const handleSetPactSlotsUsed = useCallback(
    (used) => {
      if (!activeCharacter) return;
      updateActiveCharacter({
        ...activeCharacter,
        pactSlotsUsed: Math.max(0, used),
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleLongRest = useCallback(() => {
    slotBaselinesRef.current = {};
    if (!activeCharacter) return;
    updateActiveCharacter({
      ...activeCharacter,
      slotsUsed: {},
      pactSlotsUsed: 0,
      arcaneRecoveryUsed: false,
    });
    showToast('Long Rest completed: All spell slots restored!', 'success');
  }, [activeCharacter, updateActiveCharacter, showToast]);

  const handleShortRest = useCallback(() => {
    slotBaselinesRef.current = {};
    if (!activeCharacter) return;
    const classes = activeCharacter.classes || [{ className: activeCharacter.className, level: activeCharacter.level }];
    const hasWarlock = classes.some((c) => c.className === 'Warlock');
    if (hasWarlock || activeCharacter.className === 'Warlock') {
      updateActiveCharacter({
        ...activeCharacter,
        pactSlotsUsed: 0,
        // Also restore standard slots if pure Warlock without pactSlotsUsed yet
        slotsUsed: activeCharacter.className === 'Warlock' ? {} : activeCharacter.slotsUsed,
      });
      showToast('Short Rest completed: Pact Magic slots restored!', 'success');
    } else {
      showToast('Short Rest completed.', 'info');
    }
  }, [activeCharacter, updateActiveCharacter, showToast]);

  const handleArcaneRecovery = useCallback(
    (recoveredByLevel) => {
      slotBaselinesRef.current = {};
      if (!activeCharacter) return;
      const currentUsed = activeCharacter.slotsUsed || {};
      const nextUsed = { ...currentUsed };

      for (const [lvl, count] of Object.entries(recoveredByLevel)) {
        const numLvl = Number(lvl);
        const numCount = Number(count) || 0;
        const currentExpended = nextUsed[numLvl] || 0;
        const nextExpended = Math.max(0, currentExpended - numCount);
        if (nextExpended === 0) {
          delete nextUsed[numLvl];
        } else {
          nextUsed[numLvl] = nextExpended;
        }
      }

      // Also restore pact slots if pure/multiclass Warlock on Short Rest
      const classes = activeCharacter.classes || [{ className: activeCharacter.className, level: activeCharacter.level }];
      const hasWarlock = classes.some((c) => c.className === 'Warlock');
      const nextPactUsed = hasWarlock || activeCharacter.className === 'Warlock' ? 0 : activeCharacter.pactSlotsUsed || 0;

      updateActiveCharacter({
        ...activeCharacter,
        slotsUsed: nextUsed,
        pactSlotsUsed: nextPactUsed,
        arcaneRecoveryUsed: true,
      });
      showToast('Arcane Recovery: Spell slots restored!', 'success');
    },
    [activeCharacter, updateActiveCharacter, showToast]
  );

  const handleResetArcaneRecoveryUsed = useCallback(() => {
    if (!activeCharacter) return;
    updateActiveCharacter({
      ...activeCharacter,
      arcaneRecoveryUsed: false,
    });
    showToast('Arcane Recovery reset: Available to use again.', 'info');
  }, [activeCharacter, updateActiveCharacter, showToast]);

  const handleCastSpell = useCallback(
    (spell) => {
      if (!activeCharacter || !spell) return;
      if (spell.level === 0) {
        showToast(`Cast ${spell.name} (Cantrip, at will)`, 'info');
        return;
      }

      // Check available slots
      const maxSlots = getEffectiveMaxSlots(
        activeCharacter.className,
        activeCharacter.level,
        activeCharacter.customSlots,
        activeCharacter
      );

      // Find lowest available slot level >= spell.level
      let slotToUse = null;
      for (let lvl = spell.level; lvl <= 9; lvl++) {
        const max = maxSlots[lvl] || 0;
        const used = activeCharacter.slotsUsed?.[lvl] || 0;
        if (used < max) {
          slotToUse = lvl;
          break;
        }
      }

      if (slotToUse === null) {
        showToast(`No available spell slots to cast ${spell.name} (Level ${spell.level}+)`, 'error');
        return;
      }

      handleUseSlot(slotToUse);
      const isUpcast = slotToUse > spell.level;
      showToast(
        `Cast ${spell.name} using Level ${slotToUse} slot${isUpcast ? ' (Upcast)' : ''}`,
        'success'
      );
    },
    [activeCharacter, handleUseSlot, showToast]
  );

  return (
    <div className="relative flex flex-col h-screen w-full max-w-full overflow-x-hidden bg-dnd-bg text-slate-200">
      {/* Per-Theme Background Texture Overlay (z-0, behind opaque panels) */}
      {activeTexture === 'celestial' && (
        <div
          data-testid="theme-bg-celestial"
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.14]"
        >
          <img
            src="/celestial_bg.png?t=1730134579"
            alt=""
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto min-h-full min-w-full object-cover"
            draggable="false"
          />
        </div>
      )}
      {activeTexture === 'stars' && (
        <canvas
          ref={starCanvasRef}
          data-testid="theme-bg-stars"
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover opacity-[0.45]"
        />
      )}
      {activeTexture === 'limewash' && (
        <svg
          data-testid="theme-bg-limewash"
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.18]"
        >
          <filter id="limewash-plaster">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.0035"
              numOctaves="5"
              seed="14"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.85 0 0 0 -0.2"
              in="noise"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#limewash-plaster)" />
        </svg>
      )}
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-3 right-4 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-lg shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 bg-dnd-card">
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
          {toast.type === 'info' && <Sparkles size={16} className="text-dnd-gold" />}
          <span className="text-slate-100">{toast.message}</span>
        </div>
      )}

      {/* Main Dual-Pane Body */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Spell Catalog with Integrated Branding Header */}
        <section className="w-full md:w-1/2 flex flex-col min-h-0 p-3 sm:p-4 overflow-hidden bg-dnd-panel/25">
          {/* Integrated Header */}
          <div className="flex items-center justify-between pb-2 mb-2 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-dnd-card/70 flex items-center justify-center p-1">
                <div
                  role="img"
                  aria-label="Mythallar Logo"
                  className="w-6 h-6 bg-dnd-ivory select-none pointer-events-none"
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
              </div>
              <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight font-display">
                  Mythallar
                </h1>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-dnd-gold font-medium px-1.5 py-0.5 rounded bg-dnd-gold/10">
                    DnD 5e Spellbook
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono tracking-tight select-none">
                    v{APP_VERSION}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Open settings"
              title="Appearance & Theme Settings"
              className="p-1.5 rounded-lg bg-dnd-card/60 hover:bg-dnd-card hover:text-white text-slate-400 transition-colors flex items-center justify-center"
            >
              <Settings size={15} />
            </button>
          </div>

          <FilterBar
            filters={filters}
            onChange={setFilters}
            onOpenHomebrewSpellModal={() => setIsHomebrewSpellModalOpen(true)}
            availableSources={availableSources}
          />

          {isLoadingSpells ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-sm">
              <Sparkles className="animate-spin text-dnd-gold mb-2" size={24} />
              <span>Loading spell grimoire...</span>
            </div>
          ) : spellError ? (
            <div className="flex items-center justify-center h-64 text-red-400 text-sm">
              <AlertCircle size={18} className="mr-2" />
              <span>{spellError}</span>
            </div>
          ) : (
            <SpellList
              spells={filteredSpells}
              spellbookSpellIds={spellbookSpellIds}
              notesMap={spellNotesMap}
              onAddToSpellbook={handleAddSpell}
              onDeleteHomebrew={handleDeleteHomebrewSpell}
              onUpdateNote={activeCharacter ? handleUpdateSpellNote : null}
            />
          )}
        </section>

        {/* Right Pane: Character Spellbook & Slots (Scrollable Container) */}
        <section className="w-full md:w-1/2 flex flex-col min-h-0 p-3 sm:p-4 overflow-hidden bg-dnd-panel/10">
          {activeCharacter ? (
            <>
              <CharacterHeader
                activeCharacter={activeCharacter}
                profiles={profiles}
                onUpdateCharacter={updateActiveCharacter}
                onSelectProfile={handleSelectProfile}
                onCreateProfile={handleOpenCreateCharacter}
                onDeleteProfile={handleDeleteCharacter}
                onExport={handleExport}
                onImport={handleImport}
                user={user}
                syncStatus={syncStatus}
                onSignIn={handleSignIn}
                onSignOut={handleSignOut}
                onSyncNow={handleManualSyncNow}
              />

              <SpellSlotTracker
                character={activeCharacter}
                onUseSlot={handleUseSlot}
                onRestoreSlot={handleRestoreSlot}
                onSetSlotsUsed={handleSetSlotsUsed}
                onUsePactSlot={handleUsePactSlot}
                onRestorePactSlot={handleRestorePactSlot}
                onSetPactSlotsUsed={handleSetPactSlotsUsed}
                onUpdateMaxSlot={handleUpdateMaxSlot}
                onResetMaxSlot={handleResetMaxSlot}
                onDoneEditingMax={handleDoneEditingMax}
                onLongRest={handleLongRest}
                onShortRest={handleShortRest}
                onArcaneRecovery={handleArcaneRecovery}
                onResetArcaneRecoveryUsed={handleResetArcaneRecoveryUsed}
                onUpdateCharacter={updateActiveCharacter}
              />

              <div className="flex-1 min-h-[300px] flex flex-col">
                <SpellbookView
                  character={activeCharacter}
                  catalog={catalogMap}
                  skipCopying={appSettings.skipCopying}
                  onTogglePrepare={handleTogglePrepare}
                  onFinishCopying={handleFinishCopying}
                  onFinishCopyingAll={handleFinishCopyingAll}
                  onCastSpell={handleCastSpell}
                  onRemoveSpell={handleRemoveSpell}
                  onAddSpell={handleAddSpell}
                  onUpdateCharacter={updateActiveCharacter}
                  onUpdateNote={handleUpdateSpellNote}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-dnd-panel/60 border border-white/5 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-dnd-card flex items-center justify-center shadow-lg ring-1 ring-white/10 p-2.5">
                <div
                  role="img"
                  aria-label="Mythallar Logo"
                  className="w-11 h-11 bg-dnd-ivory select-none pointer-events-none"
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
              </div>
              <div className="max-w-sm space-y-1.5">
                <h3 className="text-lg font-bold text-dnd-ivory font-display tracking-tight">
                  No Character Selected
                </h3>
                <p className="text-xs text-slate-400">
                  Begin your journey by creating your first character profile to manage spell slots and maintain your grimoire.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateCharacter}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                <Plus size={15} />
                <span>Create First Character</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Create Character Modal */}
      <CreateCharacterModal
        isOpen={isCreateCharacterModalOpen}
        onClose={() => setIsCreateCharacterModalOpen(false)}
        onCreate={handleSaveNewCharacter}
      />

      {/* Homebrew Spell Modal */}
      <HomebrewSpellModal
        isOpen={isHomebrewSpellModalOpen}
        onClose={() => setIsHomebrewSpellModalOpen(false)}
        onSave={handleSaveHomebrewSpell}
      />

      {/* Settings & Theme Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeThemeId={activeThemeId}
        onSelectTheme={handleSelectTheme}
        onUpdateCustomTheme={() => setCustomThemeRev((r) => r + 1)}
        skipCopying={appSettings.skipCopying}
        onToggleSkipCopying={handleToggleSkipCopying}
      />
    </div>
  );
}
