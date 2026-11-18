const SOURCE_MAP = {
  PHB: "Player's Handbook (2014)",
  XPHB: "Player's Handbook (2024)",
  DMG: "Dungeon Master's Guide",
  XGE: "Xanathar's Guide to Everything",
  TCE: "Tasha's Cauldron of Everything",
  SCAG: "Sword Coast Adventurer's Guide",
  BGG: "Bigby Presents: Glory of the Giants",
  VRGR: "Van Richten's Guide to Ravenloft",
  EGW: "Explorer's Guide to Wildemount",
  FTD: "Fizban's Treasury of Dragons",
  DSotDQ: "Dragonlance: Shadow of the Dragon Queen",
  PSA: "Plane Shift: Amonkhet",
  PSK: "Plane Shift: Kaladesh",
};

/**
 * Returns formatted note title matching convention:
 * Subclass name directly (e.g. "School of Enchantment", "Battle Master").
 * Falls back to shortName, or "<ClassName> Subclass" / "Subclass Features".
 */
export function formatSubclassNoteTitle(subclassName = '', className = '', shortName = '') {
  const cleanSub = String(subclassName || '').trim();
  const cleanClass = String(className || '').trim();
  const cleanShort = String(shortName || '').trim();

  if (cleanSub) return cleanSub;
  if (cleanShort) return cleanShort;
  return cleanClass ? `${cleanClass} Subclass` : 'Subclass Features';
}

/**
 * Converts multiple newline paragraphs to clean HTML line breaks.
 * Regular paragraph breaks use <br><br> to render a full empty line space.
 * Bullet points (starting with "•") under an intro line use single <br>
 * to stay visually grouped together as a list.
 */
export function formatFeatureDescription(description = '') {
  if (!description) return '';
  const rawBlocks = description.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const parts = [];

  for (let i = 0; i < rawBlocks.length; i++) {
    const curr = rawBlocks[i];
    const prev = i > 0 ? rawBlocks[i - 1] : null;
    const isCurrBullet = curr.startsWith('•');
    const isPrevBullet = Boolean(prev && prev.startsWith('•'));
    const isPrevIntro = Boolean(prev && prev.endsWith(':'));

    const cleanCurr = curr.replace(/\n/g, '<br>');

    if (i === 0) {
      parts.push(cleanCurr);
    } else if (isCurrBullet && (isPrevBullet || isPrevIntro)) {
      // Connect bullets within list with single <br>
      parts.push('<br>' + cleanCurr);
    } else {
      // Regular paragraph break: <br><br> for a full empty line space
      parts.push('<br><br>' + cleanCurr);
    }
  }

  return parts.join('');
}

/**
 * Builds HTML note content containing all subclass features formatted neatly.
 * Feature titles use Subheading (<span data-size="subheading"><b>...</b></span>),
 * and descriptions use Body typography with clean paragraph (<br><br>) and bullet (<br>) spacing.
 * Subclass name heading is omitted from body to avoid redundancy with note title.
 * All formatting is 100% reproducible by users in the note editor with uniform typography colors.
 */
export function buildSubclassNoteContent(className, subclassName, subclassObj) {
  if (!subclassObj || !Array.isArray(subclassObj.features) || subclassObj.features.length === 0) {
    const customHeader = subclassName
      ? `Custom ${subclassName} (${className})`
      : `Custom Subclass (${className})`;
    return `<span data-size="heading"><b>${customHeader}</b></span><br><br>Record your subclass features and notes here.`;
  }

  const parts = [];

  // Book source line
  const sourceName = SOURCE_MAP[subclassObj.source] || subclassObj.source;
  if (sourceName) {
    parts.push(`<i>Source: ${sourceName}</i>`);
  }

  const subNameLower = (subclassObj.name || '').toLowerCase();
  const subShortLower = (subclassObj.shortName || '').toLowerCase();

  // Sort so introductory flavor section comes first, then by feature level
  const sortedFeatures = [...subclassObj.features].sort((a, b) => {
    const aIsIntro = (a.name || '').toLowerCase() === subNameLower
      || (a.name || '').toLowerCase() === subShortLower
      || (a.name || '').toLowerCase().startsWith('school of');
    const bIsIntro = (b.name || '').toLowerCase() === subNameLower
      || (b.name || '').toLowerCase() === subShortLower
      || (b.name || '').toLowerCase().startsWith('school of');
    if (aIsIntro && !bIsIntro) return -1;
    if (!aIsIntro && bIsIntro) return 1;
    return (a.level || 0) - (b.level || 0);
  });

  for (const feat of sortedFeatures) {
    const featNameLower = (feat.name || '').toLowerCase();
    const isIntro = featNameLower === subNameLower
      || featNameLower === subShortLower
      || featNameLower.startsWith('school of');

    const formattedBody = formatFeatureDescription(feat.description);

    if (isIntro && feat.level <= 3) {
      // Subclass introductory flavor text without redundant subclass heading
      if (formattedBody) {
        parts.push(formattedBody);
      }
    } else {
      // Subclass feature header (Subheading) + description
      const levelLabel = feat.level ? ` <i>(Level ${feat.level})</i>` : '';
      parts.push(`<span data-size="subheading"><b>${feat.name}</b></span>${levelLabel}<br><br>${formattedBody}`);
    }
  }

  return parts.join('<br><br>');
}

/**
 * Returns a new note object for the selected subclass.
 */
export function createSubclassNote(className, subclassName, subclassObj) {
  const title = formatSubclassNoteTitle(subclassName, className, subclassObj?.shortName);
  const content = buildSubclassNoteContent(className, subclassName, subclassObj);
  const now = new Date().toISOString();

  return {
    id: `note_subclass_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    content,
    createdAt: now,
    updatedAt: now,
    pinned: false,
  };
}

/**
 * Auto-adds a subclass note to character profile if not already present.
 * ponytail: checks case-insensitive title match to prevent duplicate notes on repeat level-up.
 */
export function autoAddSubclassNote({ character, className, subclassName, subclassObj }) {
  if (!character || !subclassName) return character;

  const title = formatSubclassNoteTitle(subclassName, className, subclassObj?.shortName);
  const existingSheet = character.sheet || { identity: {}, notes: [] };
  const existingNotes = Array.isArray(existingSheet.notes) ? existingSheet.notes : [];

  const alreadyExists = existingNotes.some(
    (n) => n?.title && n.title.trim().toLowerCase() === title.trim().toLowerCase()
  );

  if (alreadyExists) {
    return character;
  }

  const newNote = createSubclassNote(className, subclassName, subclassObj);

  return {
    ...character,
    sheet: {
      ...existingSheet,
      notes: [newNote, ...existingNotes],
    },
  };
}
