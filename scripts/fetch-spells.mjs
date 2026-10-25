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

  // Pre-index class mappings: spellName.toLowerCase() -> Set<string>
  const spellClassMap = new Map();
  for (const [sourceKey, spellMap] of Object.entries(sources)) {
    for (const [spellName, info] of Object.entries(spellMap)) {
      const lower = spellName.toLowerCase();
      if (!spellClassMap.has(lower)) {
        spellClassMap.set(lower, new Set());
      }
      const set = spellClassMap.get(lower);
      if (Array.isArray(info.class)) {
        for (const c of info.class) {
          if (c && c.name) set.add(c.name);
        }
      }
      if (Array.isArray(info.classVariant)) {
        for (const c of info.classVariant) {
          if (c && c.name) set.add(c.name);
        }
      }
    }
  }

  const spellFiles = ['spells-phb.json', 'spells-xge.json', 'spells-tce.json'];
  const allSpells = [];
  const seenIds = new Set();

  for (const file of spellFiles) {
    console.log(`Fetching ${file}...`);
    try {
      const data = await fetchJSON(`${BASE_URL}/${file}`);
      const rawSpells = data.spell || [];

      for (const raw of rawSpells) {
        const id = (raw.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (seenIds.has(id)) continue;
        seenIds.add(id);

        const classes = Array.from(spellClassMap.get(raw.name.toLowerCase()) || []);
        // Fallback default classes if sources.json didn't have it
        if (classes.length === 0 && Array.isArray(raw.classes?.fromClassList)) {
          for (const c of raw.classes.fromClassList) {
            classes.push(c.name);
          }
        }

        const entries = parseEntries(raw.entries);
        let higherLevels = '';
        if (Array.isArray(raw.entriesHigherLevel) && raw.entriesHigherLevel.length > 0) {
          const hl = raw.entriesHigherLevel[0];
          higherLevels = parseEntries(hl.entries).join('\n');
        }

        allSpells.push({
          id,
          name: raw.name,
          source: raw.source,
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
        });
      }
    } catch (err) {
      console.error(`Error loading ${file}:`, err);
    }
  }

  // Sort spells alphabetically
  allSpells.sort((a, b) => a.name.localeCompare(b.name));

  const outDir = path.join(__dirname, '..', 'public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'spells.json');
  fs.writeFileSync(outPath, JSON.stringify(allSpells, null, 2), 'utf-8');

  console.log(`Wrote ${allSpells.length} spells to ${outPath}`);
}

run();
