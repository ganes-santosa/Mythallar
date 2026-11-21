import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clean5eText, parseEntries } from '../src/utils/textCleaner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data';
const OUTPUT_FILE = path.resolve(__dirname, '../public/data/feats.json');

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return res.json();
}

const CATEGORY_NAMES = {
  O: 'Origin Feat',
  G: 'General Feat',
  FS: 'Fighting Style Feat',
  'FS:P': 'Fighting Style Feat (Paladin)',
  'FS:R': 'Fighting Style Feat (Ranger)',
  EB: 'Epic Boon Feat',
  D: 'Dragonmark Feat',
  DG: 'Dark Gift',
};

const ABILITY_LABELS = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
};

function formatAbilityIncrease(abilityArr) {
  if (!Array.isArray(abilityArr) || abilityArr.length === 0) return '';
  const parts = [];

  for (const ab of abilityArr) {
    if (ab.choose && Array.isArray(ab.choose.from)) {
      const from = ab.choose.from.map((k) => ABILITY_LABELS[k] || k.toUpperCase());
      const amt = ab.choose.amount || 1;
      const count = ab.choose.count || 1;
      if (from.length >= 6) {
        parts.push(count > 1 ? `+${amt} to ${count} Abilities` : `+${amt} Any Ability`);
      } else {
        parts.push(`+${amt} ${from.join('/')}`);
      }
    } else {
      for (const [k, v] of Object.entries(ab)) {
        if (ABILITY_LABELS[k] && typeof v === 'number') {
          parts.push(`+${v} ${ABILITY_LABELS[k]}`);
        }
      }
    }
  }

  return parts.join(', ');
}

function formatPrerequisite(prereqArr) {
  if (!Array.isArray(prereqArr) || prereqArr.length === 0) return '';
  const parts = [];

  for (const p of prereqArr) {
    if (typeof p.level === 'number') {
      parts.push(`Level ${p.level}+`);
    } else if (p.level && typeof p.level.level === 'number') {
      const cls = p.level.class?.name ? ` ${p.level.class.name}` : '';
      parts.push(`Level ${p.level.level}+${cls}`);
    }
    if (p.spellcasting || p.spellcasting2020 || p.spellcastingFeature) {
      parts.push('Spellcasting');
    }
    if (Array.isArray(p.ability)) {
      for (const abObj of p.ability) {
        for (const [k, v] of Object.entries(abObj)) {
          if (ABILITY_LABELS[k]) {
            parts.push(`${ABILITY_LABELS[k]} ${v}+`);
          }
        }
      }
    }
    if (Array.isArray(p.race)) {
      const races = p.race
        .map((r) => (r.subrace ? `${r.name} (${r.subrace})` : r.name))
        .filter(Boolean);
      if (races.length) parts.push(races.join(' or '));
    }
    if (typeof p.other === 'string') {
      parts.push(clean5eText(p.other));
    } else if (p.otherSummary?.entrySummary) {
      parts.push(clean5eText(p.otherSummary.entrySummary));
    }
  }

  return [...new Set(parts)].join(', ');
}

function formatFeatTypeLine(feat) {
  const baseCat = CATEGORY_NAMES[feat.category] || 'Feat';
  const prereq = formatPrerequisite(feat.prerequisite);
  const asi = formatAbilityIncrease(feat.ability);

  let line = prereq ? `${baseCat} (Prerequisite: ${prereq})` : baseCat;
  if (asi) {
    line = `${line} • ${asi}`;
  }
  return line;
}

function detectTrackedResource(feat, bodyDesc) {
  const lowerName = (feat.name || '').toLowerCase();
  const lowerDesc = (bodyDesc || '').toLowerCase();

  if (lowerName === 'lucky') {
    return { max: 3, resetOn: 'LR' };
  }
  if (lowerName === 'martial adept') {
    return { max: 1, resetOn: 'SR' };
  }

  const addSpellsStr = feat.additionalSpells ? JSON.stringify(feat.additionalSpells) : '';
  const hasLimitedSpellUses = addSpellsStr.includes('"daily"') || addSpellsStr.includes('"rest"');

  const hasShortRest =
    lowerDesc.includes('short or long rest') ||
    lowerDesc.includes('short rest or a long rest') ||
    lowerDesc.includes('finish a short rest') ||
    addSpellsStr.includes('"rest"');
  const hasLongRest =
    lowerDesc.includes('finish a long rest') ||
    lowerDesc.includes('once per long rest') ||
    hasLimitedSpellUses;

  if (!hasShortRest && !hasLongRest) return undefined;

  let max = 1;
  if (
    lowerDesc.includes('number of times equal to your proficiency bonus') ||
    lowerDesc.includes('times equal to your proficiency bonus')
  ) {
    max = 2;
  } else {
    const numMatch = lowerDesc.match(/you have (\d+) [a-z\s]+ points/);
    if (numMatch) {
      max = parseInt(numMatch[1], 10) || 1;
    }
  }

  return {
    max,
    resetOn: hasShortRest ? 'SR' : 'LR',
  };
}

async function run() {
  console.log('Fetching feats.json from 5etools mirror...');
  const data = await fetchJSON(`${BASE_URL}/feats.json`);
  const rawFeats = data.feat || [];
  console.log(`Fetched ${rawFeats.length} raw feats.`);

  const seen = new Set();
  const cleaned = [];

  for (const f of rawFeats) {
    if (!f.name || typeof f.name !== 'string') continue;
    const name = f.name.trim();
    if (!name) continue;

    const key = `${name.toLowerCase()}|${(f.source || '').toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const typeLine = formatFeatTypeLine(f);
    const descLines = parseEntries(f.entries || []);
    const bodyDesc = descLines.join('\n\n').trim();

    const fullDesc = typeLine
      ? bodyDesc
        ? `${typeLine}\n\n${bodyDesc}`
        : typeLine
      : bodyDesc;

    const trackedResource = detectTrackedResource(f, bodyDesc);

    // Resilient's ASI + save proficiency depend on the chosen ability: one catalogue entry per ability.
    if (name === 'Resilient') {
      for (const [key, label] of Object.entries(ABILITY_LABELS)) {
        const fix = (s) =>
          s
            .replace('+1 Any Ability', `+1 ${label}`)
            .replace(/the chosen ability/g, `${label}`)
            .replace(/using the chosen ability/g, `using ${label}`)
            .replace(/Choose one ability score\.\s*/, '');
        cleaned.push({
          name: `Resilient (${label})`,
          source: f.source || '',
          typeLine: fix(typeLine),
          trackedResource,
          description: fix(fullDesc),
        });
      }
      continue;
    }

    cleaned.push({
      name,
      source: f.source || '',
      typeLine,
      trackedResource,
      description: fullDesc,
    });
  }

  // Sort alphabetically by name, preferring XPHB over legacy PHB when names match
  cleaned.sort((a, b) => {
    const cmp = a.name.localeCompare(b.name);
    if (cmp !== 0) return cmp;
    if (a.source === 'XPHB' && b.source !== 'XPHB') return -1;
    if (b.source === 'XPHB' && a.source !== 'XPHB') return 1;
    return a.source.localeCompare(b.source);
  });

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleaned, null, 2), 'utf8');

  console.log(
    `Saved ${cleaned.length} feats to ${OUTPUT_FILE} (${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB).`
  );
}

run().catch((err) => {
  console.error('Fetch feats failed:', err);
  process.exit(1);
});
