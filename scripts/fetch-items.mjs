import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clean5eText, parseEntries } from '../src/utils/textCleaner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data';
const OUTPUT_FILE = path.resolve(__dirname, '../public/data/items.json');

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return res.json();
}

const TYPE_NAMES = {
  A: 'Ammunition',
  AF: 'Ammunition',
  AIR: 'Vehicle (Air)',
  AT: "Artisan's Tools",
  EXP: 'Explosive',
  FD: 'Food and Drink',
  G: 'Adventuring Gear',
  GS: 'Gaming Set',
  HA: 'Heavy Armor',
  INS: 'Instrument',
  LA: 'Light Armor',
  M: 'Melee Weapon',
  MA: 'Medium Armor',
  MNT: 'Mount',
  OTH: 'Other',
  P: 'Potion',
  R: 'Ranged Weapon',
  RD: 'Rod',
  RG: 'Ring',
  S: 'Shield',
  SC: 'Scroll',
  SCF: 'Spellcasting Focus',
  SHP: 'Vehicle (Water)',
  SPC: 'Vehicle (Space)',
  T: 'Tool',
  TAH: 'Tack and Harness',
  TB: 'Trade Bar',
  TG: 'Trade Good',
  VEH: 'Vehicle (Land)',
  WD: 'Wand',
  $: 'Treasure',
  $A: 'Treasure (Art Object)',
  $C: 'Treasure (Coin)',
  $G: 'Treasure (Gemstone)',
};

function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w+/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

function formatTypeLine(item) {
  const parts = [];

  // 1. Base Item Type
  let baseType = '';
  if (item.wondrous) {
    baseType = 'Wondrous Item';
  } else if (item.staff) {
    baseType = 'Staff';
  } else if (item.type) {
    const raw = item.type.split('|')[0].toUpperCase();
    baseType = TYPE_NAMES[raw] || toTitleCase(raw);
  } else if (item.weapon) {
    baseType = 'Weapon';
  } else if (item.armor) {
    baseType = 'Armor';
  }

  if (baseType) parts.push(baseType);

  // 2. Rarity
  if (item.rarity && item.rarity !== 'none' && item.rarity !== 'unknown') {
    const rar = item.rarity.toLowerCase() === 'varies' ? 'Rarity Varies' : toTitleCase(item.rarity);
    parts.push(rar);
  }

  let line = parts.join(', ');

  // 3. Attunement
  if (item.reqAttune) {
    let att = 'Requires Attunement';
    if (typeof item.reqAttune === 'string' && item.reqAttune.trim()) {
      const cleaned = clean5eText(item.reqAttune.trim());
      att = `Requires Attunement ${toTitleCase(cleaned)}`;
    }
    line = line ? `${line} (${att})` : `(${att})`;
  }

  return line;
}

function mapCategory(item) {
  const t = (item.type || '').toUpperCase();
  if (t === 'P' || t === 'POT' || t === 'FOOD' || t === 'TEA') return 'consumable';
  if (t === 'SC' || t === 'SCR') return 'scroll';
  if (t === 'EXP' || (item.name && item.name.toLowerCase().includes('component'))) return 'component';
  if (item.rarity && item.rarity !== 'none') return 'magic';
  if (item.wondrous) return 'magic';
  return 'gear';
}

function mapRarityColor(rarity) {
  if (!rarity || rarity === 'none') return 'none';
  const r = rarity.toLowerCase();
  if (r === 'common') return 'slate';
  if (r === 'uncommon') return 'emerald';
  if (r === 'rare') return 'sky';
  if (r === 'very rare') return 'purple';
  if (r === 'legendary' || r === 'artifact') return 'amber';
  return 'none';
}

async function run() {
  console.log('Fetching items-base.json, items.json, and magicvariants.json...');
  const [baseData, itemsData, magicVariantData] = await Promise.all([
    fetchJSON(`${BASE_URL}/items-base.json`),
    fetchJSON(`${BASE_URL}/items.json`),
    fetchJSON(`${BASE_URL}/magicvariants.json`).catch(() => ({ magicvariant: [] })),
  ]);

  const variantItems = (magicVariantData.magicvariant || []).map((v) => {
    const inh = v.inherits || {};
    let baseType;
    if (v.requires) {
      const reqList = Array.isArray(v.requires) ? v.requires : [v.requires];
      for (const req of reqList) {
        if (req.sword || req.weapon || req.axe || req.bow || req.crossbow || req.spear || req.polearm || req.mace || req.hammer || req.dagger || req.rapier) {
          baseType = 'Weapon';
          break;
        }
        if (req.armor) {
          baseType = 'Armor';
          break;
        }
        if (req.shield) {
          baseType = 'Shield';
          break;
        }
        if (req.rod) {
          baseType = 'Rod';
          break;
        }
        if (req.staff) {
          baseType = 'Staff';
          break;
        }
        if (req.wand) {
          baseType = 'Wand';
          break;
        }
        if (req.ring) {
          baseType = 'Ring';
          break;
        }
      }
    }
    return {
      name: v.name,
      source: inh.source || v.source || '',
      type: baseType,
      weapon: baseType === 'Weapon',
      armor: baseType === 'Armor',
      wondrous: !baseType,
      rarity: inh.rarity || v.rarity,
      reqAttune: inh.reqAttune !== undefined ? inh.reqAttune : v.reqAttune,
      entries: inh.entries || v.entries || [],
    };
  });

  const allRaw = [...(baseData.baseitem || []), ...(itemsData.item || []), ...variantItems];
  console.log(`Fetched ${allRaw.length} raw items combined.`);

  const seen = new Set();
  const cleaned = [];

  for (const it of allRaw) {
    if (!it.name || typeof it.name !== 'string') continue;
    const name = it.name.trim();
    if (!name) continue;

    // Stable dedup key: name + source
    const key = `${name.toLowerCase()}|${(it.source || '').toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const typeLine = formatTypeLine(it);
    const descLines = parseEntries(it.entries || []);
    const bodyDesc = descLines.join('\n\n').trim();

    const fullDesc = typeLine
      ? bodyDesc
        ? `${typeLine}\n\n${bodyDesc}`
        : typeLine
      : bodyDesc;

    cleaned.push({
      name,
      source: it.source || '',
      typeLine: typeLine || undefined,
      category: mapCategory(it),
      rarity: it.rarity && it.rarity !== 'none' ? it.rarity : undefined,
      color: mapRarityColor(it.rarity),
      requiresAttunement: Boolean(it.reqAttune),
      description: fullDesc,
    });
  }

  // Sort by name alphabetically, modern sources (XPHB/XDMG) preferred if duplicate names exist
  cleaned.sort((a, b) => a.name.localeCompare(b.name));

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleaned, null, 2), 'utf8');

  console.log(`Saved ${cleaned.length} items to ${OUTPUT_FILE} (${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB).`);
}

run().catch((err) => {
  console.error('Fetch items failed:', err);
  process.exit(1);
});
