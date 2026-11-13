import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clean5eText, parseEntries } from '../src/utils/textCleaner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data/spells';

const SCHOOL_MAP = {
  A: 'Abjuration',
  C: 'Conjuration',
  D: 'Divination',
  E: 'Enchantment',
  V: 'Evocation',
  I: 'Illusion',
  N: 'Necromancy',
  T: 'Transmutation',
};

const DUNAMANCY_SPECIALIZATIONS = {
  'Gift of Alacrity': ['Chronurgy'],
  'Temporal Shunt': ['Chronurgy'],
  'Reality Break': ['Chronurgy'],
  'Time Ravage': ['Chronurgy'],
  'Magnify Gravity': ['Graviturgy'],
  'Immovable Object': ['Graviturgy'],
  'Gravity Sinkhole': ['Graviturgy'],
  'Gravity Fissure': ['Graviturgy'],
  'Dark Star': ['Graviturgy'],
  'Ravenous Void': ['Graviturgy'],
  'Sapping Sting': ['Chronurgy', 'Graviturgy'],
  'Fortune\'s Favor': ['Chronurgy', 'Graviturgy'],
  'Wristpocket': ['Chronurgy', 'Graviturgy'],
  'Pulse Wave': ['Chronurgy', 'Graviturgy'],
  'Tether Essence': ['Chronurgy', 'Graviturgy'],
};

function formatTime(timeList) {
  if (!Array.isArray(timeList) || timeList.length === 0) return 'Special';
  const t = timeList[0];
  const num = t.number ? `${t.number} ` : '1 ';
  return `${num}${t.unit || ''}`.trim() || '1 action';
}

function formatRange(range) {
  if (!range) return 'Self';
  const dist = range.distance;
  if (!dist) return range.type || 'Self';
  if (dist.type === 'self') return 'Self';
  if (dist.type === 'touch') return 'Touch';
  if (dist.amount && dist.type) return `${dist.amount} ${dist.type}`;
  return dist.type || 'Self';
}

function formatDuration(durationList) {
  if (!Array.isArray(durationList) || durationList.length === 0) return 'Instantaneous';
  const d = durationList[0];
  if (d.type === 'instant') return 'Instantaneous';
  if (d.type === 'permanent') return 'Until dispelled';
  if (d.type === 'special') return 'Special';
  if (d.type === 'timed' && d.duration) {
    const amount = d.duration.amount || 1;
    const unit = d.duration.type ? `${d.duration.type}${amount > 1 ? 's' : ''}` : 'minute';
    const upTo = d.duration.upTo ? 'Up to ' : '';
    return `${upTo}${amount} ${unit}`;
  }
  return 'Instantaneous';
}

function formatComponents(comp) {
  if (!comp) return { v: false, s: false, m: false };
  let mVal = false;
  if (comp.m) {
    if (typeof comp.m === 'string') {
      mVal = clean5eText(comp.m);
    } else if (typeof comp.m === 'object' && comp.m.text) {
      mVal = clean5eText(comp.m.text);
    } else {
      mVal = true;
    }
  }
  return {
    v: Boolean(comp.v),
    s: Boolean(comp.s),
    m: mVal,
  };
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  return res.json();
}

async function run() {
  console.log('Fetching sources.json for class mappings...');
  let sources = {};
  try {
    sources = await fetchJSON(`${BASE_URL}/sources.json`);
  } catch (err) {
    console.warn('Could not fetch sources.json, using fallback classes map', err);
  }

  // Pre-index class mappings: (spellName.toLowerCase() + '|' + source) -> Set<string>
  // Also fallback by spellName.toLowerCase()
  const spellClassMap = new Map();
  const spellNameOnlyClassMap = new Map();

  for (const [sourceKey, spellMap] of Object.entries(sources)) {
    for (const [spellName, info] of Object.entries(spellMap)) {
      const lower = spellName.toLowerCase();
      const specificKey = `${lower}|${sourceKey.toLowerCase()}`;

      if (!spellClassMap.has(specificKey)) {
        spellClassMap.set(specificKey, new Set());
      }
      if (!spellNameOnlyClassMap.has(lower)) {
        spellNameOnlyClassMap.set(lower, new Set());
      }

      const specificSet = spellClassMap.get(specificKey);
      const generalSet = spellNameOnlyClassMap.get(lower);

      const addClasses = (arr) => {
        if (!Array.isArray(arr)) return;
        for (const c of arr) {
          if (c && c.name) {
            specificSet.add(c.name);
            generalSet.add(c.name);
          }
        }
      };

      addClasses(info.class);
      addClasses(info.classVariant);
    }
  }

  console.log('Fetching index.json to discover all official spell sourcebooks...');
  let indexMap = {};
  try {
    indexMap = await fetchJSON(`${BASE_URL}/index.json`);
  } catch (err) {
    console.error('Failed to load index.json', err);
    return;
  }

  // Desired order: 2024 (XPHB) first, then PHB 2014, then other official supplements
  const indexEntries = Object.entries(indexMap);
  // Separate into XPHB, PHB, and others
  const orderedFiles = [];
  const xphbEntry = indexEntries.find(([k]) => k === 'XPHB');
  if (xphbEntry) orderedFiles.push(xphbEntry);

  const phbEntry = indexEntries.find(([k]) => k === 'PHB');
  if (phbEntry) orderedFiles.push(phbEntry);

  for (const entry of indexEntries) {
    if (entry[0] !== 'XPHB' && entry[0] !== 'PHB') {
      orderedFiles.push(entry);
    }
  }

  const allSpells = [];
  const seenIds = new Set();

  // Saved spellbooks reference ids, so an existing (name, source) keeps its id forever
  // and new spells may never take an id that already exists.
  const prevPath = path.join(__dirname, '..', 'public', 'data', 'spells.json');
  const prevSpells = fs.existsSync(prevPath) ? JSON.parse(fs.readFileSync(prevPath, 'utf-8')) : [];
  // App-facing source codes differ from 5etools for some books (AU = Unearthed Arcana, "UA" at the table).
  const SOURCE_ALIAS = { AU: 'UA' };
  const appSource = (s) => SOURCE_ALIAS[s] || s;
  // Books released with the 2024 rules; every other official book is 'Legacy'. New books default to '2024'.
  const LEGACY_SOURCES = new Set(['PHB', 'XGE', 'TCE', 'EGW', 'GGR', 'SCC', 'AI', 'AAG', 'FTD', 'SatO', 'IDRotF', 'LLK', 'BMT', 'AitFR-AVT', 'UA']);
  const prevIdByKey = new Map(prevSpells.map((s) => [`${s.name}|${appSource(s.source)}`, s.id]));
  const reservedIds = new Set(prevSpells.map((s) => s.id));

  for (const [bookSource, fileName] of orderedFiles) {
    console.log(`Fetching ${bookSource} (${fileName})...`);
    try {
      const data = await fetchJSON(`${BASE_URL}/${fileName}`);
      const rawSpells = data.spell || [];

      for (const raw of rawSpells) {
        const rawSource = appSource(raw.source || bookSource);
        const isLegacy = LEGACY_SOURCES.has(rawSource) || Boolean(raw.isLegacy);
        const baseSlug = (raw.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        let id = prevIdByKey.get(`${raw.name}|${rawSource}`);
        if (!id) {
          const taken = (x) => seenIds.has(x) || reservedIds.has(x);
          id = baseSlug;
          if (taken(id)) id = isLegacy ? `${baseSlug}-legacy` : `${baseSlug}-${rawSource.toLowerCase()}`;
          if (taken(id)) id = `${baseSlug}-${rawSource.toLowerCase()}`;
        }
        if (seenIds.has(id)) continue;
        seenIds.add(id);

        const lowerName = (raw.name || '').toLowerCase();
        let classes = Array.from(spellClassMap.get(`${lowerName}|${rawSource.toLowerCase()}`) || []);
        if (classes.length === 0) {
          classes = Array.from(spellNameOnlyClassMap.get(lowerName) || []);
        }

        // Fallback default classes if sources.json didn't have it
        if (classes.length === 0 && Array.isArray(raw.classes?.fromClassList)) {
          for (const c of raw.classes.fromClassList) {
            if (c?.name) classes.push(c.name);
          }
        }

        const specializations = DUNAMANCY_SPECIALIZATIONS[raw.name];
        if (specializations && !classes.includes('Wizard')) {
          classes.push('Wizard');
        }

        const entries = parseEntries(raw.entries);
        let higherLevels = '';
        if (Array.isArray(raw.entriesHigherLevel) && raw.entriesHigherLevel.length > 0) {
          const hl = raw.entriesHigherLevel[0];
          higherLevels = parseEntries(hl.entries).join('\n');
        }

        const spellObj = {
          id,
          name: raw.name,
          source: rawSource,
          isLegacy,
          level: typeof raw.level === 'number' ? raw.level : 0,
          school: SCHOOL_MAP[raw.school] || raw.school || 'Universal',
          time: formatTime(raw.time),
          range: formatRange(raw.range),
          components: formatComponents(raw.components),
          duration: formatDuration(raw.duration),
          concentration: Boolean(raw.duration?.[0]?.concentration),
          ritual: Boolean(raw.meta?.ritual),
          classes,
          entries,
          higherLevels,
        };

        if (specializations) {
          spellObj.specializations = specializations;
        }

        allSpells.push(spellObj);
      }
    } catch (err) {
      console.error(`Error loading ${fileName}:`, err);
    }
  }

  // Sort spells: alphabetically, legacy versions right after modern versions if names match
  allSpells.sort((a, b) => {
    const n = a.name.localeCompare(b.name);
    if (n !== 0) return n;
    return a.isLegacy ? 1 : -1;
  });

  // Always-on badges: UA and 2024-era non-XPHB books always show their identity.
  const SOURCES_2024_NONXPHB = new Set(['WoW', 'FRHoF', 'EFA']);
  for (const s of allSpells) {
    if (s.source === 'UA') {
      s.variantSource = 'UA';
    } else if (SOURCES_2024_NONXPHB.has(s.source)) {
      s.variantEra = '5.5e';
      s.variantSource = s.source;
    }
  }

  // Same-name spells get badges so the UI can tell versions apart.
  // Lone spells get no badges. Spells already tagged above are skipped.
  const nameCounts = new Map();
  for (const s of allSpells) nameCounts.set(s.name, (nameCounts.get(s.name) || 0) + 1);
  for (const s of allSpells) {
    if (s.variantEra || s.variantSource) continue; // already tagged by always-on block
    if (nameCounts.get(s.name) > 1) {
      if (s.source === 'XPHB') {
        // XPHB is the implied 5.5e default; no badge
      } else if (s.source === 'PHB') {
        s.variantEra = 'Legacy';
      } else {
        s.variantEra = s.isLegacy ? 'Legacy' : '5.5e';
        if (!s.isLegacy) s.variantSource = s.source;
      }
    }
  }

  const outDir = path.join(__dirname, '..', 'public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'spells.json');

  // Saved spellbooks reference spells by id; refuse to drop ids unless --force.
  if (fs.existsSync(outPath)) {
    const oldIds = JSON.parse(fs.readFileSync(outPath, 'utf-8')).map((s) => s.id);
    const newIds = new Set(allSpells.map((s) => s.id));
    const oldSet = new Set(oldIds);
    const removed = oldIds.filter((id) => !newIds.has(id));
    const added = allSpells.filter((s) => !oldSet.has(s.id));
    console.log(`Added ${added.length}, removed ${removed.length}.`);
    added.forEach((s) => console.log(`  + ${s.id} (${s.source})`));
    if (removed.length && !process.argv.includes('--force')) {
      removed.forEach((id) => console.error(`  - ${id}`));
      console.error('Aborted: ids removed (renamed upstream or a book failed to fetch). Not written. Use --force to override.');
      process.exit(1);
    }
  }

  // Repo keeps this file with CRLF endings; match it so catalogue updates
  // produce content-only diffs instead of a whole-file rewrite.
  const json = JSON.stringify(allSpells, null, 2).replace(/\n/g, '\r\n');
  fs.writeFileSync(outPath, json, 'utf-8');

  console.log(`Wrote ${allSpells.length} spells to ${outPath}`);
}

run();
