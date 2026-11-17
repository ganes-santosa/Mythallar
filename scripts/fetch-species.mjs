import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clean5eText, parseEntries } from '../src/utils/textCleaner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/races.json';
const OUTPUT_FILE = path.resolve(__dirname, '../public/data/species.json');

const ALLOWED_SOURCES = new Set([
  'XPHB', 'PHB', 'MPMM', 'VGM', 'MTF', 'FTD', 'ERLW', 'GGR', 'MOT', 'VRGR',
  'WBtW', 'AAG', 'EGW', 'DSotDQ', 'SCC', 'EEPC', 'TCE', 'AI', 'OGA', 'LR', 'SCAG', 'DMG',
  'PSA', 'PSK', 'PSX', 'PSZ', 'PSI', 'PSD',
]);

const EXCLUDE_MONSTERS = new Set([
  'Skeleton', 'Zombie', 'Troglodyte', 'Grimlock', 'Bullywug', 'Kuo-Toa', 'Gnoll', 'Merfolk',
]);

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json();
}

function parseAbilities(abilityArr) {
  const bonuses = {};
  if (!Array.isArray(abilityArr)) return bonuses;
  for (const ab of abilityArr) {
    if (ab.choose) {
      bonuses.choose = {
        count: ab.choose.count || 1,
        amount: ab.choose.amount || 1,
        from: ab.choose.from || ['str', 'dex', 'con', 'int', 'wis', 'cha'],
      };
    } else {
      for (const [k, v] of Object.entries(ab)) {
        if (['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(k.toLowerCase()) && typeof v === 'number') {
          bonuses[k.toLowerCase()] = v;
        }
      }
    }
  }
  return bonuses;
}

const DRACONIC_ANCESTRIES = [
  { name: 'Black Dragon', damageType: 'Acid', breathWeapon: '5 by 30 ft. line (Dex. save)' },
  { name: 'Blue Dragon', damageType: 'Lightning', breathWeapon: '5 by 30 ft. line (Dex. save)' },
  { name: 'Brass Dragon', damageType: 'Fire', breathWeapon: '5 by 30 ft. line (Dex. save)' },
  { name: 'Bronze Dragon', damageType: 'Lightning', breathWeapon: '5 by 30 ft. line (Dex. save)' },
  { name: 'Copper Dragon', damageType: 'Acid', breathWeapon: '5 by 30 ft. line (Dex. save)' },
  { name: 'Gold Dragon', damageType: 'Fire', breathWeapon: '15 ft. cone (Dex. save)' },
  { name: 'Green Dragon', damageType: 'Poison', breathWeapon: '15 ft. cone (Con. save)' },
  { name: 'Red Dragon', damageType: 'Fire', breathWeapon: '15 ft. cone (Dex. save)' },
  { name: 'Silver Dragon', damageType: 'Cold', breathWeapon: '15 ft. cone (Con. save)' },
  { name: 'White Dragon', damageType: 'Cold', breathWeapon: '15 ft. cone (Con. save)' },
];

const GOLIATH_2024_ANCESTRIES = [
  { name: "Cloud's Jaunt (Cloud Giant)", description: 'Magically teleport up to 30 feet as a Bonus Action PB times per Long Rest.' },
  { name: "Fire's Burn (Fire Giant)", description: 'Deal an extra 1d10 Fire damage when you hit with an attack PB times per Long Rest.' },
  { name: "Frost's Chill (Frost Giant)", description: 'Deal extra 1d6 Cold damage and reduce target speed by 10 ft PB times per Long Rest.' },
  { name: "Hill's Tumble (Hill Giant)", description: 'Knock a Large or smaller target Prone on hit PB times per Long Rest.' },
  { name: "Stone's Endurance (Stone Giant)", description: 'Reduce incoming damage by 1d12 + CON modifier as a Reaction PB times per Long Rest.' },
  { name: "Storm's Thunder (Storm Giant)", description: 'Deal 1d8 Thunder damage as Reaction when damaged by a creature within 60 ft PB times per Long Rest.' },
];

const TIEFLING_2024_LEGACIES = [
  { name: 'Abyssal Legacy', description: 'Poison Resistance. Know Poison Spray cantrip. At level 3 Ray of Sickness, at level 5 Hold Person.' },
  { name: 'Chthonic Legacy', description: 'Necrotic Resistance. Know Chill Touch cantrip. At level 3 False Life, at level 5 Ray of Enfeeblement.' },
  { name: 'Infernal Legacy', description: 'Fire Resistance. Know Fire Bolt cantrip. At level 3 Hellish Rebuke, at level 5 Darkness.' },
];

const ELF_2024_LINEAGES = [
  { name: 'Drow Lineage', description: 'Darkvision increases to 120 ft. Dancing Lights cantrip. At level 3 Faerie Fire, at level 5 Darkness.' },
  { name: 'High Elf Lineage', description: 'Know Prestidigitation (switchable on Long Rest). At level 3 Detect Magic, at level 5 Misty Step.' },
  { name: 'Wood Elf Lineage', description: 'Speed increases to 35 ft. Know Druidcraft cantrip. At level 3 Longstrider, at level 5 Pass without Trace.' },
];

const GNOME_2024_LINEAGES = [
  { name: 'Forest Gnome Lineage', description: 'Know Minor Illusion cantrip. Can cast Speak with Animals PB times per Long Rest.' },
  { name: 'Rock Gnome Lineage', description: 'Know Mending and Prestidigitation cantrips. Can craft tiny clockwork clock, firestarter, or music box devices.' },
];

async function run() {
  console.log('Fetching comprehensive races & species from 5etools mirror (main branch)...');
  const data = await fetchJSON(BASE_URL);
  const rawRaces = data.race || [];
  const rawSubraces = data.subrace || [];

  // Filter out invalid/monster records
  const validRaces = rawRaces.filter((r) => ALLOWED_SOURCES.has(r.source) && !EXCLUDE_MONSTERS.has(r.name));

  // Map subraces by parent race name
  const subraceMap = {};
  for (const s of rawSubraces) {
    if (!s.name) continue;
    if (!ALLOWED_SOURCES.has(s.source)) continue;
    const parent = s.raceName || s._copy?.raceName;
    if (!parent) continue;
    if (!subraceMap[parent]) subraceMap[parent] = [];
    subraceMap[parent].push(s);
  }

  // Group race definitions by name
  const raceGroups = {};
  for (const r of validRaces) {
    if (!raceGroups[r.name]) raceGroups[r.name] = [];
    raceGroups[r.name].push(r);
  }

  const results = [];

  for (const [raceName, variants] of Object.entries(raceGroups)) {
    // 1. Check for 2024 print (XPHB)
    const xphbVariant = variants.find((v) => v.source === 'XPHB');
    // 2. Check for 2014 core (PHB) or premier source (MPMM, VGM, ERLW, EEPC, etc.)
    const phbVariant = variants.find((v) => v.source === 'PHB');
    const mpmmVariant = variants.find((v) => v.source === 'MPMM');
    const classicVariant = phbVariant || variants.find((v) => v.source === 'VGM') || variants.find((v) => v.source === 'ERLW') || variants.find((v) => v.source === 'EEPC') || variants[0];

    const sourceSubraces = subraceMap[raceName] || [];

    // Format subraces for 2014
    let parsed2014Subraces = sourceSubraces.map((s) => {
      const subBonuses = parseAbilities(s.ability);
      const subTraits = (s.entries || [])
        .filter((e) => e.name && !['Age', 'Alignment', 'Size', 'Speed', 'Languages'].includes(e.name))
        .map((e) => ({
          name: clean5eText(e.name),
          description: clean5eText(parseEntries(e.entries || [e]).join('\n\n')),
        }));

      const cleanSubName = clean5eText(s.name.replace(/^Variant;\s*/i, ''));
      const speed = s.speed ? (typeof s.speed === 'number' ? s.speed : (s.speed.walk || 30)) : 30;
      const darkvision = s.darkvision || 0;

      return {
        id: `${raceName.toLowerCase().replace(/\s+/g, '-')}-${cleanSubName.toLowerCase().replace(/\s+/g, '-')}-2014`,
        name: cleanSubName.includes(raceName) ? cleanSubName : `${cleanSubName} ${raceName}`,
        subraceName: cleanSubName,
        source: s.source,
        abilityBonuses: subBonuses,
        traits: subTraits.length > 0 ? subTraits : [{ name: `${cleanSubName} Traits`, description: `Special traits of ${cleanSubName}.` }],
        speed,
        darkvision,
      };
    });

    // If Dragonborn: add Draconic Ancestries if not already present
    if (raceName === 'Dragonborn') {
      const ancestrySubraces = DRACONIC_ANCESTRIES.map((anc) => ({
        id: `dragonborn-${anc.name.toLowerCase().replace(/\s+/g, '-')}-2014`,
        name: `${anc.name} Dragonborn`,
        subraceName: anc.name,
        source: 'PHB',
        abilityBonuses: {},
        traits: [
          { name: 'Draconic Ancestry', description: `Ancestry: ${anc.name}. Damage Type: ${anc.damageType}. Breath Weapon: ${anc.breathWeapon}.` },
          { name: 'Damage Resistance', description: `You have resistance to ${anc.damageType} damage.` },
        ],
        speed: 30,
        darkvision: 0,
      }));
      parsed2014Subraces = [...parsed2014Subraces, ...ancestrySubraces];
    }

    // --- CREATE 2024 ENTRY ---
    // If there is an XPHB variant, use it. Otherwise, adapt modern 5e race for 2024!
    const target2024 = xphbVariant || mpmmVariant || classicVariant;
    if (target2024) {
      const traits = (target2024.entries || [])
        .filter((e) => e.name && !['Age', 'Alignment', 'Size', 'Speed', 'Languages', 'Creature Type'].includes(e.name))
        .map((e) => ({
          name: clean5eText(e.name),
          description: clean5eText(parseEntries(e.entries || [e]).join('\n\n')),
        }));

      const speed = typeof target2024.speed === 'number' ? target2024.speed : (target2024.speed?.walk || 30);
      const darkvision = target2024.darkvision || 0;
      const sizes = Array.isArray(target2024.size) ? target2024.size.map((s) => (s === 'M' ? 'Medium' : s === 'S' ? 'Small' : s)) : ['Medium'];

      // 2024 Lineages/Subraces
      let subraces2024 = [];
      if (raceName === 'Elf' && xphbVariant) {
        subraces2024 = ELF_2024_LINEAGES.map((l) => ({
          id: `elf-${l.name.toLowerCase().replace(/\s+/g, '-')}-2024`,
          name: `${l.name} (${raceName})`,
          subraceName: l.name,
          source: 'XPHB',
          abilityBonuses: {},
          traits: [{ name: l.name, description: l.description }],
          speed: l.name.includes('Wood') ? 35 : 30,
          darkvision: l.name.includes('Drow') ? 120 : 60,
        }));
      } else if (raceName === 'Gnome' && xphbVariant) {
        subraces2024 = GNOME_2024_LINEAGES.map((l) => ({
          id: `gnome-${l.name.toLowerCase().replace(/\s+/g, '-')}-2024`,
          name: `${l.name} (${raceName})`,
          subraceName: l.name,
          source: 'XPHB',
          abilityBonuses: {},
          traits: [{ name: l.name, description: l.description }],
          speed: 30,
          darkvision: 60,
        }));
      } else if (raceName === 'Goliath' && xphbVariant) {
        subraces2024 = GOLIATH_2024_ANCESTRIES.map((l) => ({
          id: `goliath-${l.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-2024`,
          name: l.name,
          subraceName: l.name,
          source: 'XPHB',
          abilityBonuses: {},
          traits: [{ name: 'Giant Ancestry', description: l.description }],
          speed: 35,
          darkvision: 0,
        }));
      } else if (raceName === 'Tiefling' && xphbVariant) {
        subraces2024 = TIEFLING_2024_LEGACIES.map((l) => ({
          id: `tiefling-${l.name.toLowerCase().replace(/\s+/g, '-')}-2024`,
          name: `${l.name} (${raceName})`,
          subraceName: l.name,
          source: 'XPHB',
          abilityBonuses: {},
          traits: [{ name: l.name, description: l.description }],
          speed: 30,
          darkvision: 60,
        }));
      } else if (raceName === 'Dragonborn') {
        subraces2024 = DRACONIC_ANCESTRIES.map((anc) => ({
          id: `dragonborn-${anc.name.toLowerCase().replace(/\s+/g, '-')}-2024`,
          name: `${anc.name} Dragonborn`,
          subraceName: anc.name,
          source: xphbVariant ? 'XPHB' : 'PHB',
          abilityBonuses: {},
          traits: [
            { name: 'Draconic Ancestry', description: `Ancestry: ${anc.name}. Damage Type: ${anc.damageType}. Breath Weapon: ${anc.breathWeapon}.` },
            { name: 'Damage Resistance', description: `You have resistance to ${anc.damageType} damage.` },
          ],
          speed: 30,
          darkvision: 60,
        }));
      } else if (parsed2014Subraces.length > 0) {
        // Reuse subraces for species that have subraces
        subraces2024 = parsed2014Subraces.map((s) => ({
          ...s,
          id: s.id.replace('-2014', '-2024'),
          abilityBonuses: {}, // in 2024 background grants ASI
        }));
      }

      results.push({
        id: `${raceName.toLowerCase().replace(/\s+/g, '-')}-2024`,
        name: raceName,
        edition: '2024',
        source: target2024.source,
        speed,
        size: sizes.join(' or '),
        darkvision,
        abilityBonuses: {}, // 2024 background provides ASI
        traits: traits.length > 0 ? traits : [{ name: `${raceName} Traits`, description: `Innate traits of ${raceName}.` }],
        subraces: subraces2024,
        description: clean5eText(parseEntries(target2024.entries?.slice(0, 2) || []).join(' ')),
      });
    }

    // --- CREATE 2014 ENTRY ---
    const target2014 = classicVariant || xphbVariant;
    if (target2014) {
      const baseBonuses = parseAbilities(target2014.ability);
      const traits = (target2014.entries || [])
        .filter((e) => e.name && !['Age', 'Alignment', 'Size', 'Speed', 'Languages', 'Subrace', 'Creature Type'].includes(e.name))
        .map((e) => ({
          name: clean5eText(e.name),
          description: clean5eText(parseEntries(e.entries || [e]).join('\n\n')),
        }));

      const speed = typeof target2014.speed === 'number' ? target2014.speed : (target2014.speed?.walk || 30);
      const darkvision = target2014.darkvision || 0;
      const sizes = Array.isArray(target2014.size) ? target2014.size.map((s) => (s === 'M' ? 'Medium' : s === 'S' ? 'Small' : s)) : ['Medium'];

      results.push({
        id: `${raceName.toLowerCase().replace(/\s+/g, '-')}-2014`,
        name: raceName,
        edition: '2014',
        source: target2014.source,
        speed,
        size: sizes.join(' or '),
        darkvision,
        abilityBonuses: baseBonuses,
        traits: traits.length > 0 ? traits : [{ name: `${raceName} Traits`, description: `Racial traits of ${raceName}.` }],
        subraces: parsed2014Subraces,
        description: clean5eText(parseEntries(target2014.entries?.slice(0, 2) || []).join(' ')),
      });
    }
  }

  // Sort by name ascending, then edition descending (2024 first)
  results.sort((a, b) => a.name.localeCompare(b.name) || b.edition.localeCompare(a.edition));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Saved ${results.length} species/races to ${OUTPUT_FILE}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
