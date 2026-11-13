import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LibraryBig, UserRound, BookOpen, Sparkles, AlertCircle, CheckCircle2, Settings, Plus, Upload, Snowflake } from 'lucide-react';
import {
  loadCharacterProfiles,
  saveCharacterProfiles,
  createDefaultProfile,
  loadHomebrewSpells,
  saveHomebrewSpells,
  loadAppSettings,
  saveAppSettings,
  normalizeHitDice,
  recoverHitDiceOnLongRest,
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
  deleteCloudHomebrew,
  reconcileCloudPull,
  isVisibleProfile,
  splitForPull,
  localConflictCopies,
  subscribeToUserChanges,
  fingerprint,
  buildSynced,
  changedItems,
  loadSynced,
  saveSynced,
  loadPending,
  savePending,
  flushPendingDeletes,
  loadPromptedLocalIds,
  savePromptedLocalIds,
} from './utils/syncService';

const newLocalId = () => `char_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
import { getStoredThemeId, setTheme, applyTheme, getActiveTheme } from './utils/themeService';
import FilterBar from './components/Catalog/FilterBar';
import SpellList from './components/Catalog/SpellList';
import HomebrewSpellModal from './components/Catalog/HomebrewSpellModal';
import CharacterHeader from './components/Header/CharacterHeader';
import AuthStatus from './components/Header/AuthStatus';
import SettingsModal from './components/Header/SettingsModal';
import CreateCharacterModal from './components/Modal/CreateCharacterModal';
import LocalCharactersImportModal from './components/Modal/LocalCharactersImportModal';
import { CloudSyncContext } from './context/CloudSyncContext';
import ShortRestModal from './components/Modal/ShortRestModal';
import useAccordionMount from './hooks/useAccordionMount';
import MythallarLogo from './components/Common/MythallarLogo';
import SpellSlotTracker from './components/Spellbook/SpellSlotTracker';
import SpellbookView from './components/Spellbook/SpellbookView';
import CharacterSheetView from './components/CharacterSheet/CharacterSheetView';
import { APP_VERSION } from './version';

export default function App() {
  // --- Character & Profile State ---
  const [profileData, setProfileData] = useState(() => loadCharacterProfiles());
  const [isCreateCharacterModalOpen, setIsCreateCharacterModalOpen] = useState(false);
  const [leftPaneView, setLeftPaneView] = useState('spells'); // 'spells' | 'sheet'
  const [mobileView, setMobileView] = useState(() => (profileData?.profiles?.length ? 'spellbook' : 'catalog')); // 'sheet' | 'spellbook' | 'catalog'
  const [isFilterHidden, setIsFilterHidden] = useState(false); // mobile only: hide search panel on scroll down
  const [isSwitcherHovered, setIsSwitcherHovered] = useState(false);
  const handleCatalogScrollDirection = useCallback((dir) => {
    setIsFilterHidden(dir === 'down');
  }, []);
  const [user, setUser] = useState(null);
  const { activeId } = profileData;
  // profileData.profiles holds every stored character (Local Only + each account's cache).
  // `profiles` is what this session may see: Local Only plus the signed-in account's.
  const profiles = useMemo(
    () => profileData.profiles.filter((p) => isVisibleProfile(p, user?.id)),
    [profileData.profiles, user]
  );

  const activeCharacter = useMemo(() => {
    return profiles.find((p) => p.id === activeId) || profiles[0] || null;
  }, [profiles, activeId]);

  const activeCharacterRef = useRef(activeCharacter);
  activeCharacterRef.current = activeCharacter;

  // Persist profiles on change
  useEffect(() => {
    saveCharacterProfiles(profileData);
  }, [profileData]);

  // --- Homebrew Spells State ---
  const [homebrewSpells, setHomebrewSpells] = useState(() => loadHomebrewSpells());
  const [isHomebrewSpellModalOpen, setIsHomebrewSpellModalOpen] = useState(false);
  const [isShortRestOpen, setIsShortRestOpen] = useState(false);

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
    const timers = new WeakMap();
    const handleScroll = (e) => {
      const el = e.target;
      if (!el || !el.classList) return;
      if (!el.classList.contains('is-scrolling')) {
        el.classList.add('is-scrolling');
      }
      const prev = timers.get(el);
      if (prev) clearTimeout(prev);
      timers.set(
        el,
        setTimeout(() => {
          el.classList.remove('is-scrolling');
          timers.delete(el);
        }, 3000)
      );
    };
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

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
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'saved' | 'error' | 'offline'
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

  // Cloud is the source of truth. `syncedRef` holds, per kind, id -> fingerprint of the
  // last state known to match the cloud (persisted per user). Push is blocked until the
  // first successful pull for the signed-in user (`pulledUserId`).
  const profileDataRef = useRef(profileData);
  profileDataRef.current = profileData;
  const homebrewRef = useRef(homebrewSpells);
  homebrewRef.current = homebrewSpells;
  const syncedRef = useRef({ characters: {}, homebrew: {} });
  const [pulledUserId, setPulledUserId] = useState(null);
  const [importCandidates, setImportCandidates] = useState({ characterIds: [], spellIds: [] });
  const [retryTick, setRetryTick] = useState(0);

  const persistSynced = useCallback(
    (kind) => {
      if (user) saveSynced(user.id, kind, syncedRef.current[kind]);
    },
    [user]
  );

  // Pull cloud data on login. Errors never fall through to "empty cloud".
  useEffect(() => {
    if (!supabase || !user) {
      setPulledUserId(null);
      setImportCandidates({ characterIds: [], spellIds: [] });
      return;
    }

    let cancelled = false;
    setSyncStatus('syncing');

    (async () => {
      try {
        await flushPendingDeletes(supabase, user.id, 'characters', deleteCloudCharacter);
        await flushPendingDeletes(supabase, user.id, 'homebrew', deleteCloudHomebrew);
        const { characters: cloudChars, homebrewSpells: cloudHb } = await fetchCloudData(supabase, user.id);
        if (cancelled) return;

        const notPending = (kind, list) => {
          const pending = new Set(loadPending(user.id, kind));
          return list.filter((i) => !pending.has(i.id));
        };

        // Characters: this account's cache + Local Only twins of cloud ids are reconciled
        // against the cloud; everything else (Local Only, other accounts) is left alone.
        const charCloud = notPending('characters', cloudChars);
        const charSynced = loadSynced(user.id, 'characters');
        const { mine, others } = splitForPull(
          profileDataRef.current.profiles,
          new Set(charCloud.map((c) => c.id)),
          user.id
        );
        const copies = localConflictCopies(mine, charCloud, newLocalId);
        const reconciled = reconcileCloudPull(mine, charCloud, charSynced);
        syncedRef.current.characters = buildSynced(reconciled, charCloud, charSynced);
        const nextProfiles = [...others, ...copies, ...reconciled];

        // Homebrew: same split, cloud wins (no conflict copies).
        // Unowned local homebrew stays local unless explicitly imported; other accounts' stays hidden.
        const hbCloud = notPending('homebrew', cloudHb);
        const hbSynced = loadSynced(user.id, 'homebrew');
        const hbMine = homebrewRef.current.filter((s) => !s.syncOwner || s.syncOwner === user.id);
        const hbOthers = homebrewRef.current.filter((s) => s.syncOwner && s.syncOwner !== user.id);
        const hbReconciled = reconcileCloudPull(hbMine, hbCloud, hbSynced);
        syncedRef.current.homebrew = buildSynced(hbReconciled, hbCloud, hbSynced);
        const nextHomebrew = [...hbOthers, ...hbReconciled];

        persistSynced('characters');
        persistSynced('homebrew');

        const prev = profileDataRef.current;
        const visible = nextProfiles.filter((p) => isVisibleProfile(p, user.id));
        setProfileData({
          profiles: nextProfiles,
          activeId:
            prev.activeId && visible.some((p) => p.id === prev.activeId)
              ? prev.activeId
              : visible[0]?.id || null,
        });
        setHomebrewSpells(nextHomebrew);
        setPulledUserId(user.id);

        // Offer Local Only items whenever there are items not yet prompted for this account.
        const prompted = loadPromptedLocalIds(user.id);
        const unpromptedChars = nextProfiles.filter((p) => !p.syncOwner && !prompted.has(p.id));
        const unpromptedSpells = nextHomebrew.filter((s) => !s.syncOwner && !prompted.has(s.id));
        if (unpromptedChars.length > 0 || unpromptedSpells.length > 0) {
          setImportCandidates({
            characterIds: unpromptedChars.map((p) => p.id),
            spellIds: unpromptedSpells.map((s) => s.id),
          });
        }
        setSyncStatus('saved');
        showToast('Characters & homebrew spells synced', 'success');
      } catch (err) {
        if (cancelled) return;
        console.error('Cloud pull error:', err);
        setSyncStatus('error');
        setTimeout(() => !cancelled && setRetryTick((t) => t + 1), 10000);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, supabase, persistSynced, retryTick]);

  // Real-time synchronization across devices
  useEffect(() => {
    if (!supabase || !user) return;

    const unsubscribe = subscribeToUserChanges(supabase, user.id, {
      onCharacterDelete: (charId) => {
        if (!charId) return;
        delete syncedRef.current.characters[charId];
        persistSynced('characters');
        setProfileData((prev) => {
          const remaining = prev.profiles.filter((p) => p.id !== charId);
          const nextActiveId =
            prev.activeId === charId
              ? remaining.find((p) => isVisibleProfile(p, user.id))?.id || null
              : prev.activeId;
          return {
            profiles: remaining,
            activeId: nextActiveId,
          };
        });
      },
      onCharacterChange: (updatedChar) => {
        if (!updatedChar || !updatedChar.id) return;
        const fp = fingerprint(updatedChar);
        if (syncedRef.current.characters[updatedChar.id] === fp) return; // echo of our own push
        syncedRef.current.characters[updatedChar.id] = fp;
        persistSynced('characters');
        setProfileData((prev) => {
          const existingIdx = prev.profiles.findIndex((p) => p.id === updatedChar.id);
          let nextProfiles;
          if (existingIdx >= 0) {
            nextProfiles = [...prev.profiles];
            nextProfiles[existingIdx] = updatedChar;
          } else {
            nextProfiles = [...prev.profiles, updatedChar];
          }
          return {
            ...prev,
            profiles: nextProfiles,
          };
        });
      },
      onHomebrewDelete: (spellId) => {
        if (!spellId) return;
        delete syncedRef.current.homebrew[spellId];
        persistSynced('homebrew');
        setHomebrewSpells((prev) => prev.filter((s) => s.id !== spellId));
      },
      onHomebrewChange: (updatedSpell) => {
        if (!updatedSpell || !updatedSpell.id) return;
        const fp = fingerprint(updatedSpell);
        if (syncedRef.current.homebrew[updatedSpell.id] === fp) return;
        syncedRef.current.homebrew[updatedSpell.id] = fp;
        persistSynced('homebrew');
        setHomebrewSpells((prev) => {
          const existingIdx = prev.findIndex((s) => s.id === updatedSpell.id);
          if (existingIdx >= 0) {
            const copy = [...prev];
            copy[existingIdx] = updatedSpell;
            return copy;
          }
          return [updatedSpell, ...prev];
        });
      },
    });

    return () => {
      unsubscribe();
    };
  }, [supabase, user, persistSynced]);

  // Deleting while signed in: queue the cloud delete (retried until confirmed).
  // Deleting while signed out: local only, cloud stays the source of truth.
  const queueCloudDelete = useCallback(
    (kind, id) => {
      if (!user || syncedRef.current[kind][id] === undefined) return;
      delete syncedRef.current[kind][id];
      persistSynced(kind);
      savePending(user.id, kind, [...new Set([...loadPending(user.id, kind), id])]);
    },
    [user, persistSynced]
  );

  // Pushes only items that differ from the last known cloud state, then flushes queued deletes.
  // Never runs before the first successful pull for this user.
  const pushToCloud = useCallback(async () => {
    if (!supabase || !user || pulledUserId !== user.id) return true;
    // Only items owned by this account sync. Local Only characters never upload.
    const mine = (list) => list.filter((i) => i.syncOwner === user.id);
    const kinds = [
      ['characters', mine(profileDataRef.current.profiles), syncCharactersToCloud, deleteCloudCharacter],
      ['homebrew', mine(homebrewRef.current), syncHomebrewToCloud, deleteCloudHomebrew],
    ];
    let ok = true;
    for (const [kind, list, push, del] of kinds) {
      const changed = changedItems(list, syncedRef.current[kind]);
      if (changed.length > 0) {
        const res = await push(supabase, user.id, changed);
        if (res.success) {
          for (const item of changed) syncedRef.current[kind][item.id] = fingerprint(item);
          persistSynced(kind);
        } else {
          ok = false;
        }
      }
      if (!(await flushPendingDeletes(supabase, user.id, kind, del))) ok = false;
    }
    return ok;
  }, [supabase, user, pulledUserId, persistSynced]);

  // Debounced push when local data changes
  useEffect(() => {
    if (!supabase || !user || pulledUserId !== user.id) return;

    setSyncStatus('syncing');
    let cancelled = false;
    const timer = setTimeout(async () => {
      const ok = await pushToCloud();
      if (cancelled) return;
      setSyncStatus(ok ? 'saved' : 'error');
      if (!ok) setTimeout(() => setRetryTick((t) => t + 1), 10000);
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [profileData.profiles, homebrewSpells, user, supabase, pulledUserId, pushToCloud]);

  // --- Toast Notification State ---
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3200);
  }, []);

  // --- Local Only -> Cloud ---
  const markOwned = useCallback(
    (ids) => {
      if (!user || ids.length === 0) return;
      const set = new Set(ids);
      setProfileData((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) => (set.has(p.id) && !p.syncOwner ? { ...p, syncOwner: user.id } : p)),
      }));
    },
    [user]
  );

  const markSpellsOwned = useCallback(
    (ids) => {
      if (!user || ids.length === 0) return;
      const set = new Set(ids);
      setHomebrewSpells((prev) =>
        prev.map((s) => (set.has(s.id) && !s.syncOwner ? { ...s, syncOwner: user.id } : s))
      );
    },
    [user]
  );

  const handleSyncCharacter = useCallback(
    (id) => {
      markOwned([id]);
      showToast('Syncing character to cloud', 'info');
    },
    [markOwned, showToast]
  );

  const dismissImportPrompt = useCallback(() => {
    if (user) {
      const allCandidateIds = [
        ...(importCandidates.characterIds || []),
        ...(importCandidates.spellIds || []),
      ];
      if (allCandidateIds.length > 0) {
        savePromptedLocalIds(user.id, allCandidateIds);
      }
    }
    setImportCandidates({ characterIds: [], spellIds: [] });
  }, [user, importCandidates]);

  const handleImportConfirm = useCallback(
    (charIds = [], spellIds = []) => {
      const resolvedCharIds = Array.isArray(charIds) ? charIds : (charIds?.characterIds || []);
      const resolvedSpellIds = Array.isArray(spellIds) ? spellIds : (charIds?.spellIds || []);
      markOwned(resolvedCharIds);
      markSpellsOwned(resolvedSpellIds);
      dismissImportPrompt();
      const total = resolvedCharIds.length + resolvedSpellIds.length;
      if (total > 0) {
        showToast(`Adding ${total} ${total === 1 ? 'item' : 'items'} to your account`, 'info');
      }
    },
    [markOwned, markSpellsOwned, dismissImportPrompt, showToast]
  );

  const cloudSyncValue = useMemo(
    () => ({
      signedIn: !!user,
      onSyncCharacter: handleSyncCharacter,
      getStatus: (c) => {
        if (!c.syncOwner) return 'local';
        if (syncedRef.current.characters[c.id] === fingerprint(c)) return 'synced';
        return syncStatus === 'error' ? 'error' : 'syncing';
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, handleSyncCharacter, syncStatus, profileData.profiles]
  );

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
    if (pulledUserId !== user.id) {
      setRetryTick((t) => t + 1); // re-pull first; push follows automatically
      return;
    }
    const ok = await pushToCloud();
    setSyncStatus(ok ? 'saved' : 'error');
    showToast(ok ? 'Cloud sync complete' : 'Cloud sync failed', ok ? 'success' : 'error');
  }, [supabase, user, pulledUserId, pushToCloud]);

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

  // Spellbook spell ID set for fast in-book checks (keeps reference stable when only prepared/copying changes)
  const spellIdsSignature = useMemo(() => {
    if (!activeCharacter?.spells) return '';
    return activeCharacter.spells.map((item) => item.id).join('\0');
  }, [activeCharacter?.spells]);

  const spellbookSpellIds = useMemo(() => {
    const ids = new Set();
    if (spellIdsSignature) {
      for (const id of spellIdsSignature.split('\0')) {
        ids.add(id);
      }
    }
    return ids;
  }, [spellIdsSignature]);

  // Spell notes map for active character (keeps reference stable when only prepared/copying changes)
  const spellNotesSignature = useMemo(() => {
    if (!activeCharacter?.spells) return '';
    return activeCharacter.spells
      .filter((item) => item.note)
      .map((item) => `${item.id}:${item.note}`)
      .join('\0');
  }, [activeCharacter?.spells]);

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
  }, [spellNotesSignature]);

  // --- Filter State ---
  const [filters, setFilters] = useState({
    search: '',
    level: 'all',
    className: 'all',
    school: 'all',
    legacyMode: 'all', // 'all', 'modern', 'legacy'
    source: 'all',
    isHomebrewOnly: false,
    hideUA: false,
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

  const [leftToast, setLeftToast] = useState(null);
  const showLeftToast = useCallback((message, type = 'success') => {
    setLeftToast({ message, type });
    setTimeout(() => {
      setLeftToast((curr) => (curr?.message === message ? null : curr));
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

  const handleSelectProfile = useCallback((id) => {
    setProfileData((prev) => ({ ...prev, activeId: id }));
  }, []);

  const handleOpenCreateCharacter = useCallback(() => {
    setIsCreateCharacterModalOpen(true);
  }, []);

  const handleOpenHomebrewModal = useCallback(() => {
    setIsHomebrewSpellModalOpen(true);
  }, []);

  const handleSaveNewCharacter = ({ name, className }) => {
    const created = createDefaultProfile(name, className);
    // Signed in: new characters belong to the account and sync. Signed out: Local Only.
    const newChar = user ? { ...created, syncOwner: user.id } : created;
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
        profileData.activeId === charId
          ? remainingProfiles.find((p) => isVisibleProfile(p, user?.id))?.id || null
          : profileData.activeId;

      setProfileData({
        profiles: remainingProfiles,
        activeId: nextActiveId,
      });

      queueCloudDelete('characters', charId);

      showToast(`Deleted ${deletedChar?.name || 'character'}`, 'info');
    },
    [profileData, user, queueCloudDelete, showToast]
  );

  const handleExport = useCallback(() => {
    const char = activeCharacterRef.current;
    if (char) {
      exportCharacterJSON(char);
      showToast(`Exported ${char.name}'s spellbook`, 'success');
    }
  }, [showToast]);

  const handleImport = useCallback(
    (jsonStr) => {
      const { character, error } = validateAndImportCharacterJSON(jsonStr);
      if (error) {
        showToast(error, 'error');
        return;
      }

      if (Array.isArray(character.homebrewSpells) && character.homebrewSpells.length > 0) {
        setHomebrewSpells((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const toAdd = character.homebrewSpells
            .filter((s) => !existingIds.has(s.id))
            .map((s) => (user ? { ...s, syncOwner: user.id } : s));
          return toAdd.length > 0 ? [...toAdd, ...prev] : prev;
        });
      }

      const imported = user ? { ...character, syncOwner: user.id } : character;
      setProfileData((prev) => ({
        profiles: [...prev.profiles, imported],
        activeId: character.id,
      }));
      showToast(`Imported ${character.name}!`, 'success');
    },
    [user, showToast]
  );

  const emptyStateFileInputRef = useRef(null);

  const handleEmptyStateFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleImport(event.target.result);
      if (emptyStateFileInputRef.current) emptyStateFileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // --- Homebrew Spell Action ---
  const handleSaveHomebrewSpell = (newSpell) => {
    const { syncToCloud, ...spellData } = newSpell;
    const shouldSync = Boolean(user && syncToCloud !== false);
    setHomebrewSpells((prev) => [
      shouldSync ? { ...spellData, syncOwner: user.id } : spellData,
      ...prev,
    ]);
    showToast(`Created homebrew spell: ${newSpell.name}`, 'success');
  };

  const handleDeleteHomebrewSpell = useCallback((spellId) => {
    const spell = homebrewSpells.find((s) => s.id === spellId);
    setHomebrewSpells((prev) => prev.filter((s) => s.id !== spellId));

    queueCloudDelete('homebrew', spellId);

    // Also remove from all character profiles if they have it added
    setProfileData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => ({
        ...p,
        spells: (p.spells || []).filter((s) => s.id !== spellId),
      })),
    }));

    showToast(`Deleted homebrew spell${spell ? `: ${spell.name}` : ''}`, 'info');
  }, [homebrewSpells, queueCloudDelete, showToast]);

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
      const char = activeCharacterRef.current;
      if (!char) return;
      const spell = catalogMap[spellId];
      const updatedSpells = (char.spells || []).filter((s) => s.id !== spellId);
      updateActiveCharacter({
        ...char,
        spells: updatedSpells,
      });
      if (spell) {
        showToast(`Removed ${spell.name} from spellbook`, 'info');
      }
    },
    [catalogMap, updateActiveCharacter, showToast]
  );

  const handleTogglePrepare = useCallback(
    (spellId) => {
      const char = activeCharacterRef.current;
      if (!char) return;
      const updatedSpells = (char.spells || []).map((s) =>
        s.id === spellId ? { ...s, prepared: !s.prepared } : s
      );
      updateActiveCharacter({
        ...char,
        spells: updatedSpells,
      });
    },
    [updateActiveCharacter]
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
  const simulacrumSlotBaselinesRef = useRef({});
  const prevActiveIdRef = useRef(activeCharacter?.id);
  if (prevActiveIdRef.current !== activeCharacter?.id) {
    prevActiveIdRef.current = activeCharacter?.id;
    slotBaselinesRef.current = {};
    simulacrumSlotBaselinesRef.current = {};
  }

  const handleDoneEditingMax = useCallback(() => {
    slotBaselinesRef.current = {};
  }, []);

  const handleUseSlot = useCallback(
    (level, explicitUsed) => {
      slotBaselinesRef.current = {};
      const char = activeCharacterRef.current;
      if (!char) return;
      const currentUsed = char.slotsUsed?.[level] || 0;
      const nextUsed = typeof explicitUsed === 'number' ? explicitUsed : currentUsed + 1;
      updateActiveCharacter({
        ...char,
        slotsUsed: {
          ...char.slotsUsed,
          [level]: nextUsed,
        },
      });
    },
    [updateActiveCharacter]
  );

  const handleRestoreSlot = useCallback(
    (level, explicitUsed) => {
      slotBaselinesRef.current = {};
      const char = activeCharacterRef.current;
      if (!char) return;
      const currentUsed = char.slotsUsed?.[level] || 0;
      const nextUsed = typeof explicitUsed === 'number' ? explicitUsed : Math.max(0, currentUsed - 1);
      updateActiveCharacter({
        ...char,
        slotsUsed: {
          ...char.slotsUsed,
          [level]: nextUsed,
        },
      });
    },
    [updateActiveCharacter]
  );

  const handleSetSlotsUsed = useCallback(
    (level, used) => {
      slotBaselinesRef.current = {};
      const char = activeCharacterRef.current;
      if (!char) return;
      updateActiveCharacter({
        ...char,
        slotsUsed: {
          ...char.slotsUsed,
          [level]: Math.max(0, used),
        },
      });
    },
    [updateActiveCharacter]
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

  const handleDoneEditingSimulacrumMax = useCallback(() => {
    simulacrumSlotBaselinesRef.current = {};
  }, []);

  const handleUseSimulacrumSlot = useCallback(
    (level, explicitUsed) => {
      simulacrumSlotBaselinesRef.current = {};
      const char = activeCharacterRef.current;
      if (!char || !char.simulacrum) return;
      const sim = char.simulacrum;
      const currentUsed = sim.slotsUsed?.[level] || 0;
      const nextUsed = typeof explicitUsed === 'number' ? explicitUsed : currentUsed + 1;
      updateActiveCharacter({
        ...char,
        simulacrum: {
          ...sim,
          slotsUsed: {
            ...sim.slotsUsed,
            [level]: nextUsed,
          },
        },
      });
    },
    [updateActiveCharacter]
  );

  const handleRestoreSimulacrumSlot = useCallback(
    (level, explicitUsed) => {
      simulacrumSlotBaselinesRef.current = {};
      const char = activeCharacterRef.current;
      if (!char || !char.simulacrum) return;
      const sim = char.simulacrum;
      const currentUsed = sim.slotsUsed?.[level] || 0;
      const nextUsed = typeof explicitUsed === 'number' ? explicitUsed : Math.max(0, currentUsed - 1);
      updateActiveCharacter({
        ...char,
        simulacrum: {
          ...sim,
          slotsUsed: {
            ...sim.slotsUsed,
            [level]: nextUsed,
          },
        },
      });
    },
    [updateActiveCharacter]
  );

  const handleSetSimulacrumSlotsUsed = useCallback(
    (level, used) => {
      simulacrumSlotBaselinesRef.current = {};
      const char = activeCharacterRef.current;
      if (!char || !char.simulacrum) return;
      const sim = char.simulacrum;
      updateActiveCharacter({
        ...char,
        simulacrum: {
          ...sim,
          slotsUsed: {
            ...sim.slotsUsed,
            [level]: Math.max(0, used),
          },
        },
      });
    },
    [updateActiveCharacter]
  );

  const handleUpdateSimulacrumMaxSlot = useCallback(
    (level, newMax) => {
      if (!activeCharacter || !activeCharacter.simulacrum) return;
      const sim = activeCharacter.simulacrum;
      const effectiveSlots = getEffectiveMaxSlots(
        activeCharacter.className,
        activeCharacter.level,
        sim.customSlots,
        activeCharacter
      );
      const currentMax = effectiveSlots[level] || 0;
      const currentUsed = sim.slotsUsed?.[level] || 0;
      const safeNewMax = Math.max(0, newMax);

      if (simulacrumSlotBaselinesRef.current[level] === undefined) {
        simulacrumSlotBaselinesRef.current[level] = Math.max(0, currentMax - currentUsed);
      }
      const baseline = simulacrumSlotBaselinesRef.current[level];
      const nextRemaining = Math.min(safeNewMax, baseline);
      const nextUsed = safeNewMax - nextRemaining;

      updateActiveCharacter({
        ...activeCharacter,
        simulacrum: {
          ...sim,
          customSlots: {
            ...sim.customSlots,
            [level]: safeNewMax,
          },
          slotsUsed: {
            ...sim.slotsUsed,
            [level]: nextUsed,
          },
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleResetSimulacrumMaxSlot = useCallback(
    (level) => {
      if (!activeCharacter || !activeCharacter.simulacrum) return;
      const sim = activeCharacter.simulacrum;
      const nextCustom = { ...sim.customSlots };
      delete nextCustom[level];

      const currentMax = getEffectiveMaxSlots(
        activeCharacter.className,
        activeCharacter.level,
        sim.customSlots,
        activeCharacter
      )[level] || 0;
      const newMax = getEffectiveMaxSlots(
        activeCharacter.className,
        activeCharacter.level,
        nextCustom,
        activeCharacter
      )[level] || 0;
      const currentUsed = sim.slotsUsed?.[level] || 0;

      if (simulacrumSlotBaselinesRef.current[level] === undefined) {
        simulacrumSlotBaselinesRef.current[level] = Math.max(0, currentMax - currentUsed);
      }
      const baseline = simulacrumSlotBaselinesRef.current[level];
      const nextRemaining = Math.min(newMax, baseline);
      const nextUsed = newMax - nextRemaining;

      updateActiveCharacter({
        ...activeCharacter,
        simulacrum: {
          ...sim,
          customSlots: nextCustom,
          slotsUsed: {
            ...sim.slotsUsed,
            [level]: nextUsed,
          },
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleUseSimulacrumPactSlot = useCallback(() => {
    if (!activeCharacter || !activeCharacter.simulacrum) return;
    const sim = activeCharacter.simulacrum;
    const currentUsed = sim.pactSlotsUsed || 0;
    updateActiveCharacter({
      ...activeCharacter,
      simulacrum: {
        ...sim,
        pactSlotsUsed: currentUsed + 1,
      },
    });
  }, [activeCharacter, updateActiveCharacter]);

  const handleRestoreSimulacrumPactSlot = useCallback(() => {
    if (!activeCharacter || !activeCharacter.simulacrum) return;
    const sim = activeCharacter.simulacrum;
    const currentUsed = sim.pactSlotsUsed || 0;
    updateActiveCharacter({
      ...activeCharacter,
      simulacrum: {
        ...sim,
        pactSlotsUsed: Math.max(0, currentUsed - 1),
      },
    });
  }, [activeCharacter, updateActiveCharacter]);

  const handleSetSimulacrumPactSlotsUsed = useCallback(
    (used) => {
      if (!activeCharacter || !activeCharacter.simulacrum) return;
      const sim = activeCharacter.simulacrum;
      updateActiveCharacter({
        ...activeCharacter,
        simulacrum: {
          ...sim,
          pactSlotsUsed: Math.max(0, used),
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const simulacrumCharacter = useMemo(() => {
    if (!activeCharacter) return null;
    const sim = activeCharacter.simulacrum || {};
    return {
      ...activeCharacter,
      customSlots: sim.customSlots || {},
      slotsUsed: sim.slotsUsed || {},
      pactSlotsUsed: sim.pactSlotsUsed || 0,
    };
  }, [activeCharacter]);

  const isSimulacrumActive = Boolean(activeCharacter?.simulacrum?.active);
  const { shouldRender: shouldRenderSimulacrumSlots, isClosing: isSimulacrumSlotsClosing } = useAccordionMount(
    isSimulacrumActive,
    200
  );

  const handleLongRest = useCallback(() => {
    slotBaselinesRef.current = {};
    if (!activeCharacter) return;

    let updatedSheet = activeCharacter.sheet;
    if (activeCharacter.sheet?.vitals) {
      const vitals = activeCharacter.sheet.vitals;
      const baseMax = Number.isFinite(vitals.hpMax) ? vitals.hpMax : 10;
      const hpMaxBuff = Number.isFinite(vitals.hpMaxBuff) ? vitals.hpMaxBuff : 0;
      const effectiveMax = Math.max(1, baseMax + hpMaxBuff);

      const normHitDice = normalizeHitDice(vitals, activeCharacter);
      const recoveredHitDice = recoverHitDiceOnLongRest(normHitDice, activeCharacter.level || 1);

      updatedSheet = {
        ...activeCharacter.sheet,
        vitals: {
          ...vitals,
          hpCurrent: effectiveMax,
          hpTemp: 0,
          deathSaves: { successes: 0, failures: 0 },
          hitDice: recoveredHitDice,
        },
      };
    }

    updateActiveCharacter({
      ...activeCharacter,
      sheet: updatedSheet,
      slotsUsed: {},
      pactSlotsUsed: 0,
      arcaneRecoveryUsed: false,
    });
    showToast('Long Rest completed: HP, Hit Dice, and Spell Slots restored!', 'success');
  }, [activeCharacter, updateActiveCharacter, showToast]);

  const handleShortRest = useCallback(() => {
    setIsShortRestOpen(true);
  }, []);

  const handleRollHitDie = useCallback(
    () => {
      // ShortRestModal stages rolls locally; character is updated only on Finish Short Rest
    },
    []
  );

  const handleCompleteShortRest = useCallback(
    (payload = {}) => {
      slotBaselinesRef.current = {};
      if (!activeCharacter) return;

      const stagedRecovery = payload.stagedRecovery || payload || {};
      const stagedHp = payload.hpCurrent;
      const stagedHitDice = payload.hitDice;

      let nextUsed = { ...(activeCharacter.slotsUsed || {}) };
      let arcaneUsed = activeCharacter.arcaneRecoveryUsed;

      if (Object.keys(stagedRecovery).length > 0) {
        for (const [lvl, count] of Object.entries(stagedRecovery)) {
          if (lvl === 'stagedRecovery' || lvl === 'hpCurrent' || lvl === 'hitDice') continue;
          const numLvl = Number(lvl);
          const numCount = Number(count) || 0;
          if (isNaN(numLvl) || numCount <= 0) continue;
          const currentExpended = nextUsed[numLvl] || 0;
          const nextExpended = Math.max(0, currentExpended - numCount);
          if (nextExpended === 0) {
            delete nextUsed[numLvl];
          } else {
            nextUsed[numLvl] = nextExpended;
          }
        }
        arcaneUsed = true;
      }

      const classes = activeCharacter.classes || [{ className: activeCharacter.className, level: activeCharacter.level }];
      const hasWarlock = classes.some((c) => c.className === 'Warlock');
      const isPureWarlock = activeCharacter.className === 'Warlock';

      let nextPactUsed = activeCharacter.pactSlotsUsed || 0;
      if (hasWarlock || isPureWarlock) {
        nextPactUsed = 0;
        if (isPureWarlock) {
          nextUsed = {};
        }
      }

      const currentVitals = activeCharacter.sheet?.vitals || {};
      const nextVitals = {
        ...currentVitals,
        ...(stagedHp !== undefined ? { hpCurrent: stagedHp } : {}),
        ...(stagedHitDice ? { hitDice: stagedHitDice } : {}),
      };

      updateActiveCharacter({
        ...activeCharacter,
        slotsUsed: nextUsed,
        pactSlotsUsed: nextPactUsed,
        arcaneRecoveryUsed: arcaneUsed,
        sheet: {
          ...activeCharacter.sheet,
          vitals: nextVitals,
        },
      });

      setIsShortRestOpen(false);
      showToast('Short Rest completed!', 'success');
    },
    [activeCharacter, updateActiveCharacter, showToast]
  );

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
      const char = activeCharacterRef.current;
      if (!char || !spell) return;
      if (spell.level === 0) {
        showToast(`Cast ${spell.name} (Cantrip, at will)`, 'info');
        return;
      }

      // Check available slots
      const maxSlots = getEffectiveMaxSlots(
        char.className,
        char.level,
        char.customSlots,
        char
      );

      // Find lowest available slot level >= spell.level
      let slotToUse = null;
      for (let lvl = spell.level; lvl <= 9; lvl++) {
        const max = maxSlots[lvl] || 0;
        const used = char.slotsUsed?.[lvl] || 0;
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
    [handleUseSlot, showToast]
  );

  const rightPaneScrollRef = useRef(null);
  const [hasRightScrollbar, setHasRightScrollbar] = useState(leftPaneView === 'spells');

  useEffect(() => {
    const el = rightPaneScrollRef.current;
    if (!el || typeof window === 'undefined') return undefined;

    const updateScrollbarState = () => {
      if (!el.clientHeight) return;
      const headerInner = el.children[0]?.firstElementChild?.firstElementChild;
      const slotsWrapper = el.children[1];
      const spellbookRoot = el.children[2]?.firstElementChild;
      const headerTargetH = leftPaneView === 'spells' && headerInner ? headerInner.offsetHeight + 10 : 0;
      const slotsH = slotsWrapper ? slotsWrapper.offsetHeight : 0;
      const isSbCollapsed = spellbookRoot?.getAttribute('data-collapsed') === 'true';
      const sbTargetH = isSbCollapsed
        ? (spellbookRoot.offsetHeight || 48)
        : Math.max(spellbookRoot.offsetHeight || 0, window.innerHeight * 0.75);
      const computed = window.getComputedStyle ? window.getComputedStyle(el) : null;
      const padY = computed ? (parseFloat(computed.paddingTop) || 0) + (parseFloat(computed.paddingBottom) || 0) : 24;
      const next = padY + headerTargetH + slotsH + sbTargetH > el.clientHeight + 1;
      setHasRightScrollbar((prev) => (prev === next ? prev : next));
    };

    updateScrollbarState();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(updateScrollbarState);
    ro.observe(el);
    const headerInner = el.children[0]?.firstElementChild?.firstElementChild;
    const slotsWrapper = el.children[1];
    const spellbookRoot = el.children[2]?.firstElementChild;
    if (headerInner) ro.observe(headerInner);
    if (slotsWrapper) ro.observe(slotsWrapper);
    if (spellbookRoot) ro.observe(spellbookRoot);

    const mo = typeof MutationObserver !== 'undefined' && spellbookRoot
      ? new MutationObserver(updateScrollbarState)
      : null;
    if (mo && spellbookRoot) {
      mo.observe(spellbookRoot, { attributes: true, attributeFilter: ['data-collapsed'] });
    }

    return () => {
      ro.disconnect();
      mo?.disconnect();
    };
  }, [leftPaneView, activeCharacter?.id]);

  return (
    <CloudSyncContext.Provider value={cloudSyncValue}>
    <div className="relative flex flex-col h-screen h-[100dvh] w-full max-w-full overflow-x-hidden bg-dnd-bg text-slate-200">
      {/* Per-Theme Background Texture Overlay (z-0, behind opaque panels) */}
      {activeTexture === 'celestial' && (
        <div
          data-testid="theme-bg-celestial"
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.14]"
        >
          <img
            src="/celestial_bg.webp"
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
        <section
          data-testid="left-pane-section"
          className={`w-full md:w-1/2 flex flex-col min-h-0 p-3 sm:p-4 overflow-hidden bg-dnd-panel/10 relative ${
            mobileView === 'spellbook' ? 'flex-shrink-0 pb-0 md:pb-4 md:flex-1' : 'flex-1'
          }`}
        >
          {/* Left Pane Toast Banner */}
          {leftToast && (
            <div className="absolute top-3 right-4 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-lg shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 bg-dnd-card border border-white/5 pointer-events-none">
              {leftToast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
              {leftToast.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
              {leftToast.type === 'info' && <Sparkles size={16} className="text-dnd-gold" />}
              <span className="text-slate-100">{leftToast.message}</span>
            </div>
          )}

          {/* Integrated Header */}
          <div className="catalog-header-container pb-2 mb-2 flex-shrink-0">
            <div className="catalog-header-grid">
              {/* 1. Branding */}
              <div className="catalog-header-branding flex items-center space-x-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-dnd-card/70 flex items-center justify-center p-1 shrink-0">
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
                <div className="flex items-center space-x-2 min-w-0">
                  <h1 className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight font-display whitespace-nowrap">
                    Mythallar
                  </h1>
                  <div className="flex flex-col justify-center leading-tight">
                    <span className="text-[10px] text-dnd-gold font-medium whitespace-nowrap tracking-tight">
                      DnD 5e Spellbook
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono tracking-tight select-none">
                      v{APP_VERSION}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. AuthStatus */}
              <div className="catalog-header-auth flex items-center">
                <AuthStatus
                  user={user}
                  syncStatus={syncStatus}
                  onSignIn={handleSignIn}
                  onSignOut={handleSignOut}
                  onSyncNow={handleManualSyncNow}
                  isCompact={isSwitcherHovered}
                />
              </div>

              {/* 3. Symmetrical Middle-Anchored View Switcher */}
              <div className="catalog-header-switcher flex items-center">
                {/* Desktop Switcher: Hidden on mobile (< md) */}
                <div
                  className="hidden md:flex relative items-center h-7 select-none mr-24"
                  style={{ width: '60px' }}
                  onMouseEnter={() => {
                    if (typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)')?.matches) {
                      setIsSwitcherHovered(true);
                    }
                  }}
                  onMouseLeave={() => setIsSwitcherHovered(false)}
                >
                {/* Center Anchor Point P at 50% */}
                <div
                  className="absolute left-1/2 top-0 bottom-0 flex items-center"
                  onMouseEnter={() => {
                    if (typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)')?.matches) {
                      setIsSwitcherHovered(true);
                    }
                  }}
                  onMouseLeave={() => setIsSwitcherHovered(false)}
                >
                  {/* Left Button (Spell Library): right edge pinned to P */}
                  <button
                    type="button"
                    onClick={() => {
                      setLeftPaneView('spells');
                      setMobileView('catalog');
                    }}
                    aria-label="Spell Library"
                    title="Spell Library"
                    className={`absolute right-0 flex items-center justify-end h-7 px-2 rounded-l-lg border border-r border-white/10 text-xs font-medium transition-all duration-300 cursor-pointer shadow-md ${
                      leftPaneView === 'spells'
                        ? 'bg-dnd-gold text-slate-950 font-bold z-10 border-dnd-gold'
                        : 'bg-dnd-card/90 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden inline-block ${
                        isSwitcherHovered ? 'max-w-[120px] opacity-100 mr-1.5' : 'max-w-0 opacity-0 mr-0'
                      }`}
                    >
                      Spell Library
                    </span>
                    <LibraryBig size={14} className="shrink-0" />
                  </button>

                  {/* Right Button (Character Sheet): left edge pinned to P */}
                  <button
                    type="button"
                    onClick={() => {
                      setLeftPaneView('sheet');
                      setMobileView('sheet');
                    }}
                    aria-label="Character Sheet"
                    title="Character Sheet"
                    className={`absolute left-0 flex items-center justify-start h-7 px-2 rounded-r-lg border border-l border-white/10 text-xs font-medium transition-all duration-300 cursor-pointer shadow-md ${
                      leftPaneView === 'sheet'
                        ? 'bg-dnd-gold text-slate-950 font-bold z-10 border-dnd-gold'
                        : 'bg-dnd-card/90 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserRound size={14} className="shrink-0" />
                    <span
                      className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden inline-block ${
                        isSwitcherHovered ? 'max-w-[120px] opacity-100 ml-1.5' : 'max-w-0 opacity-0 ml-0'
                      }`}
                    >
                      Character Sheet
                    </span>
                  </button>
                </div>
              </div>

              {/* Mobile 3-Way Switcher: Visible on mobile (< md), hidden on desktop */}
              <div className="flex md:hidden items-center h-7 w-full bg-dnd-card/90 rounded-lg p-0.5 border border-white/10 shadow-md">
                <button
                  type="button"
                  data-testid="mobile-tab-catalog"
                  data-active={mobileView === 'catalog'}
                  onClick={() => {
                    setMobileView('catalog');
                    setLeftPaneView('spells');
                  }}
                  aria-label="Mobile Library"
                  title="Spell Library"
                  className={`flex items-center justify-center space-x-1 flex-1 h-6 px-2 rounded-md text-xs font-medium transition-all ${
                    mobileView === 'catalog'
                      ? 'bg-dnd-gold text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LibraryBig size={13} className="shrink-0" />
                  <span>Library</span>
                </button>
                <button
                  type="button"
                  data-testid="mobile-tab-spellbook"
                  data-active={mobileView === 'spellbook'}
                  onClick={() => setMobileView('spellbook')}
                  aria-label="Mobile Spellbook"
                  title="Spellbook & Slots"
                  className={`flex items-center justify-center space-x-1 flex-1 h-6 px-2 rounded-md text-xs font-medium transition-all ${
                    mobileView === 'spellbook'
                      ? 'bg-dnd-gold text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen size={13} className="shrink-0" />
                  <span>Spellbook</span>
                </button>
                <button
                  type="button"
                  data-testid="mobile-tab-sheet"
                  data-active={mobileView === 'sheet'}
                  onClick={() => {
                    setMobileView('sheet');
                    setLeftPaneView('sheet');
                  }}
                  aria-label="Mobile Sheet"
                  title="Character Sheet"
                  className={`flex items-center justify-center space-x-1 flex-1 h-6 px-2 rounded-md text-xs font-medium transition-all ${
                    mobileView === 'sheet'
                      ? 'bg-dnd-gold text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserRound size={13} className="shrink-0" />
                  <span>Sheet</span>
                </button>
              </div>
            </div>

            {/* 4. Settings Button */}
              <div className="catalog-header-settings flex items-center">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  aria-label="Open settings"
                  title="Appearance & Theme Settings"
                  className="p-1.5 rounded-lg bg-dnd-card/60 hover:bg-dnd-card hover:text-white text-slate-400 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Settings size={15} />
                </button>
              </div>
            </div>
          </div>

          <div
            data-testid="sheet-view-container"
            className={mobileView === 'sheet' ? 'flex-1 flex flex-col min-h-0' : 'hidden md:contents'}
          >
            {!activeCharacter && mobileView === 'sheet' ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20 text-center space-y-4">
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
                    Begin your journey by creating your first character profile to manage spell slots and maintain your spellbook.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenCreateCharacter}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-bold text-xs shadow-lg transition-all"
                  >
                    <Plus size={15} />
                    <span>Create First Character</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => emptyStateFileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-dnd-card hover:bg-slate-800 text-slate-300 hover:text-slate-100 font-semibold text-xs border border-white/5 transition-all shadow-sm"
                  >
                    <Upload size={15} />
                    <span>Import Character</span>
                  </button>
                </div>
              </div>
            ) : (
              <CharacterSheetView
                character={activeCharacter}
                profiles={profiles}
                isActive={leftPaneView === 'sheet'}
                onUpdateCharacter={updateActiveCharacter}
                onSelectProfile={handleSelectProfile}
                onCreateProfile={handleOpenCreateCharacter}
                onDeleteProfile={handleDeleteCharacter}
                onExport={handleExport}
                onImport={handleImport}
                onShortRest={handleShortRest}
                onShowToast={showLeftToast}
              />
            )}
          </div>

          <div
            data-testid="catalog-view-container"
            className={
              leftPaneView === 'spells'
                ? mobileView === 'catalog'
                  ? 'flex-1 flex flex-col min-h-0'
                  : 'hidden md:flex md:flex-1 md:flex-col md:min-h-0'
                : 'hidden'
            }
          >
            <div
              className={`max-md:grid max-md:transition-[grid-template-rows,opacity] max-md:duration-150 max-md:ease-out ${
                isFilterHidden ? 'max-md:grid-rows-[0fr] max-md:opacity-0' : 'max-md:grid-rows-[1fr] max-md:opacity-100'
              }`}
            >
              <div className="max-md:overflow-hidden max-md:min-h-0">
                <FilterBar
                  filters={filters}
                  onChange={setFilters}
                  onOpenHomebrewSpellModal={handleOpenHomebrewModal}
                  availableSources={availableSources}
                />
              </div>
            </div>

            {isLoadingSpells ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-sm">
                <div
                  role="img"
                  aria-label="Loading Spells"
                  className="w-7 h-7 mb-2 animate-spin bg-dnd-gold select-none pointer-events-none"
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
                <span>Loading spells...</span>
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
                onScrollDirection={handleCatalogScrollDirection}
              />
            )}
          </div>
        </section>

        {/* Right Pane: Character Spellbook & Slots (Scrollable Container) */}
        <section
          data-testid="right-pane-section"
          className={`w-full md:w-1/2 flex flex-col min-h-0 overflow-hidden bg-dnd-panel/10 p-0 ${mobileView === 'spellbook' ? 'flex-1' : 'hidden md:flex'}`}
        >
          {activeCharacter ? (
            <div
              ref={rightPaneScrollRef}
              data-testid="right-pane-scroll"
              className={`flex-1 min-h-0 overflow-y-auto custom-scroll [scrollbar-gutter:stable] p-3 sm:p-4 pr-1 sm:pr-1 pb-0 max-md:pt-0 max-md:pr-3 max-md:[scrollbar-gutter:auto] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden max-md:!mr-0 flex flex-col transition-[margin-right] duration-300 ease-in-out ${
                hasRightScrollbar ? 'mr-0' : '-mr-2.5 [--scrollbar-alpha:0%]'
              }`}
            >
              {/* Right Character Header Accordion (Animates closed when Left Pane toggles to Character Sheet) */}
              <div
                aria-hidden={leftPaneView !== 'spells' && mobileView !== 'spellbook'}
                className={`flex-shrink-0 grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${
                  leftPaneView === 'spells' || mobileView === 'spellbook'
                    ? 'grid-rows-[1fr] opacity-100 mb-2.5'
                    : 'grid-rows-[0fr] opacity-0 mb-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden">
                  <CharacterHeader
                    activeCharacter={activeCharacter}
                    profiles={profiles}
                    onUpdateCharacter={updateActiveCharacter}
                    onSelectProfile={handleSelectProfile}
                    onCreateProfile={handleOpenCreateCharacter}
                    onDeleteProfile={handleDeleteCharacter}
                    onExport={handleExport}
                    onImport={handleImport}
                  />
                </div>
              </div>

              <div className="flex-shrink-0">
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
                {/* Simulacrum Spell Slots Tracker Accordion (Animates open/close with Simulacrum toggle) */}
                {shouldRenderSimulacrumSlots && simulacrumCharacter && (
                  <div
                    data-testid="simulacrum-spell-slots-accordion"
                    className={isSimulacrumSlotsClosing ? 'animate-accordion-up' : 'animate-accordion-down'}
                  >
                    <div className="overflow-hidden">
                      <SpellSlotTracker
                        title="Simulacrum Spell Slots"
                        icon={Snowflake}
                        hideRestButtons={true}
                        character={simulacrumCharacter}
                        onUseSlot={handleUseSimulacrumSlot}
                        onRestoreSlot={handleRestoreSimulacrumSlot}
                        onSetSlotsUsed={handleSetSimulacrumSlotsUsed}
                        onUsePactSlot={handleUseSimulacrumPactSlot}
                        onRestorePactSlot={handleRestoreSimulacrumPactSlot}
                        onSetPactSlotsUsed={handleSetSimulacrumPactSlotsUsed}
                        onUpdateMaxSlot={handleUpdateSimulacrumMaxSlot}
                        onResetMaxSlot={handleResetSimulacrumMaxSlot}
                        onDoneEditingMax={handleDoneEditingSimulacrumMax}
                        onUpdateCharacter={updateActiveCharacter}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-h-0 flex flex-col">
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
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24 text-center space-y-4 m-3 sm:m-4">
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
                  Begin your journey by creating your first character profile to manage spell slots and maintain your spellbook.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenCreateCharacter}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-bold text-xs shadow-lg transition-all"
                >
                  <Plus size={15} />
                  <span>Create First Character</span>
                </button>
                <input
                  ref={emptyStateFileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleEmptyStateFileChange}
                  className="hidden"
                  aria-label="Import Character JSON File"
                />
                <button
                  type="button"
                  onClick={() => emptyStateFileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-dnd-card hover:bg-slate-800 text-slate-300 hover:text-slate-100 font-semibold text-xs border border-white/5 transition-all shadow-sm"
                >
                  <Upload size={15} />
                  <span>Import Character</span>
                </button>
              </div>
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
        isSignedIn={Boolean(user)}
      />

      {/* Short Rest Modal */}
      <ShortRestModal
        isOpen={isShortRestOpen}
        onClose={() => setIsShortRestOpen(false)}
        character={activeCharacter}
        effectiveSlots={activeCharacter ? getEffectiveMaxSlots(
          activeCharacter.className,
          activeCharacter.level,
          activeCharacter.customSlots,
          activeCharacter
        ) : {}}
        slotsUsed={activeCharacter?.slotsUsed || {}}
        onRollHitDie={handleRollHitDie}
        onCompleteShortRest={handleCompleteShortRest}
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

      {/* One-time offer to move Local Only items into the account */}
      <LocalCharactersImportModal
        isOpen={
          (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('previewImportModal')) ||
          (Boolean(user) &&
          ((importCandidates.characterIds?.length > 0) || (importCandidates.spellIds?.length > 0)))
        }
        characters={
          (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('previewImportModal'))
            ? profileData.profiles
            : profileData.profiles.filter(
                (p) => importCandidates.characterIds?.includes(p.id) && !p.syncOwner
              )
        }
        spells={
          (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('previewImportModal'))
            ? (homebrewSpells.length > 0
                ? homebrewSpells
                : [
                    { id: 'hb-preview-1', name: 'Blood Spear', level: 2, school: 'Necromancy' },
                    { id: 'hb-preview-2', name: 'Shadow Step', level: 1, school: 'Illusion' },
                    { id: 'hb-preview-3', name: 'Arcane Flare', level: 0, school: 'Evocation' },
                  ])
            : homebrewSpells.filter(
                (s) => importCandidates.spellIds?.includes(s.id) && !s.syncOwner
              )
        }
        onConfirm={handleImportConfirm}
        onKeepLocal={dismissImportPrompt}
      />
    </div>
    </CloudSyncContext.Provider>
  );
}
