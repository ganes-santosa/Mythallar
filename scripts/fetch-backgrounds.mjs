import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clean5eText, parseEntries } from '../src/utils/textCleaner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data/backgrounds.json';
const OUTPUT_FILE = path.resolve(__dirname, '../public/data/backgrounds.json');

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json();
}

function parseSkills(skillProficiencies) {
  if (!Array.isArray(skillProficiencies) || skillProficiencies.length === 0) return [];
  const skills = [];
  for (const sp of skillProficiencies) {
    for (const [k, v] of Object.entries(sp)) {
      if (v === true && k !== 'any') {
        // CamelCase key (e.g. 'sleight of hand' -> 'sleightOfHand')
        const camel = k.replace(/\s+([a-z])/g, (_, l) => l.toUpperCase());
        skills.push(camel);
      }
    }
  }
  return skills;
}

function parseToolProfs(toolProficiencies) {
  if (!Array.isArray(toolProficiencies) || toolProficiencies.length === 0) return [];
  const tools = [];
  for (const tp of toolProficiencies) {
    for (const [k, v] of Object.entries(tp)) {
      if (v === true) {
        tools.push(k);
      }
    }
  }
  return tools;
}

async function run() {
  console.log('Fetching backgrounds from 5etools mirror...');
  const data = await fetchJSON(BASE_URL);
  const rawBg = data.background || [];

  const results = [];

  for (const bg of rawBg) {
    if (bg.source !== 'XPHB' && bg.source !== 'PHB') continue;
    if (bg.name.startsWith('Variant') || bg.name === 'Custom Background') continue;

    const edition = bg.source === 'XPHB' ? '2024' : '2014';
    const skills = parseSkills(bg.skillProficiencies);
    const tools = parseToolProfs(bg.toolProficiencies);

    // 2024 Backgrounds: eligible abilities and Origin Feat
    let eligibleAbilities = [];
    let originFeat = null;
    if (edition === '2024') {
      const chooseArr = bg.ability?.[0]?.choose?.weighted?.from || [];
      eligibleAbilities = chooseArr.map((a) => a.toLowerCase());

      if (bg.feats && bg.feats[0]) {
        const rawFeatKey = Object.keys(bg.feats[0])[0] || '';
        const featName = rawFeatKey.split('|')[0].replace(/;\s*/g, ' (').trim();
        originFeat = featName ? featName.split('(')[0].trim().replace(/\b\w/g, (c) => c.toUpperCase()) : null;
        if (rawFeatKey.includes(';')) {
          const sub = rawFeatKey.split(';')[1].split('|')[0].trim();
          originFeat = `${originFeat} (${sub.replace(/\b\w/g, (c) => c.toUpperCase())})`;
        }
      }
    }

    // 2014 Feature
    let feature = null;
    if (edition === '2014') {
      const featEntry = bg.entries?.find((e) => e.name && e.name.startsWith('Feature'));
      if (featEntry) {
        feature = {
          name: clean5eText(featEntry.name.replace(/^Feature:\s*/i, '')),
          description: clean5eText(parseEntries(featEntry.entries || []).join('\n\n')),
        };
      }
    }

    // Equipment description
    const eqItem = bg.entries?.find((e) => e.type === 'list' && e.items?.some((i) => i.name === 'Equipment:'));
    const eqEntry = eqItem?.items?.find((i) => i.name === 'Equipment:');
    const equipmentText = eqEntry ? clean5eText(eqEntry.entry) : 'Standard background equipment.';

    // Characteristics (personality traits, ideals, bonds, flaws)
    const characteristics = {
      personalityTraits: [],
      ideals: [],
      bonds: [],
      flaws: [],
    };
    const suggEntry = bg.entries?.find((e) => e.name === 'Suggested Characteristics');
    if (suggEntry && Array.isArray(suggEntry.entries)) {
      for (const tableEntry of suggEntry.entries) {
        if (tableEntry.type === 'table' && Array.isArray(tableEntry.colLabels)) {
          const colLabel = (tableEntry.colLabels[1] || '').toLowerCase();
          const rows = (tableEntry.rows || []).map((r) => clean5eText(r[1] || ''));
          if (colLabel.includes('personality')) characteristics.personalityTraits = rows;
          else if (colLabel.includes('ideal')) characteristics.ideals = rows;
          else if (colLabel.includes('bond')) characteristics.bonds = rows;
          else if (colLabel.includes('flaw')) characteristics.flaws = rows;
        }
      }
    }

    results.push({
      id: `${bg.name.toLowerCase().replace(/\s+/g, '-')}-${edition}`,
      name: bg.name,
      edition,
      source: bg.source,
      skillProficiencies: skills,
      toolProficiencies: tools,
      eligibleAbilities, // 2024
      originFeat, // 2024
      feature, // 2014
      equipmentText,
      characteristics,
      description: clean5eText(parseEntries(bg.entries?.slice(0, 1) || []).join(' ')),
    });
  }

  // Sort by name then edition descending
  results.sort((a, b) => a.name.localeCompare(b.name) || b.edition.localeCompare(a.edition));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Saved ${results.length} backgrounds to ${OUTPUT_FILE}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
