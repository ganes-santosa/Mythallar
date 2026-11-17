import React from 'react';
import CLASS_ICON_PATHS from './classIconPaths.json';

export const CLASS_NAMES = [
  'artificer',
  'barbarian',
  'bard',
  'cleric',
  'druid',
  'fighter',
  'monk',
  'paladin',
  'ranger',
  'rogue',
  'sorcerer',
  'warlock',
  'wizard',
];

/**
 * Optical viewBoxes tuned per class so icons with long thin stems or small sparks
 * (e.g., Warlock, Cleric, Wizard, Bard, Rogue) have balanced visual weight and readability.
 */
export const CLASS_ICON_VIEWBOX = {
  artificer: '-4 -4 108 108',
  barbarian: '0 0 100 100',
  bard: '0 0 100 100',
  cleric: '4 0 92 92',
  druid: '0 0 100 100',
  fighter: '-3 -3 106 106',
  monk: '0 0 100 100',
  paladin: '4 4 92 92',
  ranger: '0 0 100 100',
  rogue: '4 0 92 92',
  sorcerer: '4 4 92 92',
  warlock: '12 8 76 76',
  wizard: '4 4 92 92',
};

/**
 * Renders an official D&D 5e vector class icon.
 * Dynamically styled with text color using fill="currentColor".
 */
export default function ClassIcon({
  name,
  size = 22,
  className = '',
  ...props
}) {
  if (!name || typeof name !== 'string') return null;

  const key = name.trim().toLowerCase();
  const paths = CLASS_ICON_PATHS[key];

  if (!paths || paths.length === 0) return null;

  const viewBox = CLASS_ICON_VIEWBOX[key] || '0 0 100 100';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props}
    >
      {paths.map((d, index) => (
        <path key={index} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}
