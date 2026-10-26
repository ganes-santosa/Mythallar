/**
 * Theme Palette System for Mythallar
 */

export const THEMES = [
  {
    id: 'mythallar-classic',
    name: 'Mythallar Classic',
    subtitle: 'Obsidian & Amber Gold',
    swatches: ['#17181B', '#272930', '#e0a838', '#EFE9E0'],
    colors: {
      bg: '#17181B',
      panel: '#202227',
      card: '#272930',
      hover: '#32353E',
      border: '#383C45',
      gold: '#e0a838',
      goldLight: '#f5c862',
      goldDark: '#9c6f1a',
      ivory: '#EFE9E0',
      muted: '#979DA1',
    },
  },
  {
    id: 'honeydew-fern',
    name: 'Honeydew & Fern',
    subtitle: 'Rich Mahogany, Fern & Old Gold',
    swatches: ['#291100', '#2a3518', '#657733', '#D4C04D'],
    colors: {
      bg: '#1c0c00',
      panel: '#291100',
      card: '#2a3518',
      hover: '#394721',
      border: '#425225',
      gold: '#657733',
      goldLight: '#7e9440',
      goldDark: '#4d5b27',
      stars: '#D4C04D',
      ivory: '#ECF5E2',
      muted: '#D7E3A4',
    },
  },
  {
    id: 'floral-juniper',
    name: 'Floral Juniper',
    subtitle: 'Deep Juniper, Coral & Candle',
    swatches: ['#343723', '#7D2826', '#898861', '#EFE9D7'],
    colors: {
      bg: '#1e2113',
      panel: '#2a2d1b',
      card: '#343723',
      hover: '#43472f',
      border: '#7D2826',
      gold: '#7D2826',
      goldLight: '#a03b39',
      goldDark: '#561614',
      ivory: '#EFE9D7',
      muted: '#898861',
    },
  },
  {
    id: 'chinese-black-brass',
    name: 'Chinese Black',
    subtitle: 'Dark Jungle Green, Coffee & Antique Brass',
    swatches: ['#0C1519', '#162127', '#CF9D7B', '#724B39'],
    colors: {
      bg: '#0C1519',
      panel: '#162127',
      card: '#24323b',
      hover: '#31444f',
      border: '#724B39',
      gold: '#CF9D7B',
      goldLight: '#dfb79c',
      goldDark: '#9f6f4f',
      ivory: '#f8eee7',
      muted: '#3A3534',
    },
  },
  {
    id: 'blood-god',
    name: 'Blood God',
    subtitle: 'Black Stallion, Iron River & Crimson',
    swatches: ['#081919', '#223330', '#65060E', '#CE1A1E'],
    colors: {
      bg: '#081919',
      panel: '#152525',
      card: '#223330',
      hover: '#2e4340',
      border: '#65060E',
      gold: '#CE1A1E',
      goldLight: '#e83d41',
      goldDark: '#65060E',
      ivory: '#837F78',
      muted: '#4D524B',
    },
  },
  {
    id: 'bioluminescent-cyan',
    name: 'Bioluminescent',
    subtitle: 'Jungle Green, Turquoise & Verdigris',
    swatches: ['#1E201F', '#193A31', '#3EB9A8', '#5AA371'],
    colors: {
      bg: '#141817',
      panel: '#1E201F',
      card: '#193A31',
      hover: '#245044',
      border: '#1D6C61',
      gold: '#3EB9A8',
      goldLight: '#65d5c6',
      goldDark: '#1D6C61',
      ivory: '#e4f7f4',
      muted: '#5AA371',
    },
  },
  {
    id: 'the-weave',
    name: 'The Weave',
    subtitle: 'Deep Arcane Violet & Mystra Glow',
    swatches: ['#14151d', '#1e202c', '#9d65d8', '#fef08a'],
    colors: {
      bg: '#14151d',
      panel: '#1a1b24',
      card: '#222330',
      hover: '#2d2e3d',
      border: '#53298c',
      gold: '#9d65d8',
      goldLight: '#be8fee',
      goldDark: '#703ba8',
      stars: '#fef08a',
      ivory: '#f8f1ff',
      muted: '#a892c5',
    },
  },
  {
    id: 'eerie-sparkle',
    name: 'Eerie Sparkle',
    subtitle: 'Deep Space Sparkle & Brink Pink',
    swatches: ['#181A1E', '#405C6F', '#F75E74', '#9AABBA'],
    colors: {
      bg: '#121417',
      panel: '#181A1E',
      card: '#252a32',
      hover: '#333b47',
      border: '#405C6F',
      gold: '#F75E74',
      goldLight: '#fa8697',
      goldDark: '#c72e44',
      ivory: '#9AABBA',
      muted: '#96A3B4',
    },
  },
  {
    id: 'burnt-sienna',
    name: 'Burnt Sienna',
    subtitle: 'Raisin Black, Gunmetal & Sienna',
    swatches: ['#272233', '#213241', '#DD7057', '#F4A971'],
    colors: {
      bg: '#181520',
      panel: '#221e2c',
      card: '#213241',
      hover: '#2e4559',
      border: '#3D2228',
      gold: '#DD7057',
      goldLight: '#F4A971',
      goldDark: '#b24c36',
      ivory: '#fdf1ec',
      muted: '#9ea6b5',
    },
  },
  {
    id: 'space-cadet',
    name: 'Space Cadet',
    subtitle: 'Deep Cadet, Slate Gray & Tan',
    swatches: ['#25344F', '#617891', '#D5B893', '#6F4D38'],
    colors: {
      bg: '#151d2d',
      panel: '#1e2a40',
      card: '#273754',
      hover: '#34496f',
      border: '#485e81',
      gold: '#D5B893',
      goldLight: '#e9d8c3',
      goldDark: '#6F4D38',
      ivory: '#f8f5f0',
      muted: '#9cb0c7',
    },
  },
];

export const DEFAULT_THEME_ID = 'mythallar-classic';
const STORAGE_KEY = 'mythallar_theme_id';

export function getStoredThemeId() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_THEME_ID;
}

export function applyTheme(themeId) {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    const { colors } = theme;

    const properties = {
      '--color-bg': colors.bg,
      '--color-panel': colors.panel,
      '--color-card': colors.card,
      '--color-hover': colors.hover,
      '--color-border': colors.border,
      '--color-gold': colors.gold,
      '--color-gold-light': colors.goldLight,
      '--color-gold-dark': colors.goldDark,
      '--color-stars': colors.stars || colors.gold,
      '--color-ivory': colors.ivory,
      '--color-muted': colors.muted,
    };

    // Apply to both root element and body so child contexts inherit cleanly
    for (const [prop, val] of Object.entries(properties)) {
      root.style.setProperty(prop, val);
      if (document.body) {
        document.body.style.setProperty(prop, val);
      }
    }
  }
  return theme;
}

export function setTheme(themeId) {
  const validTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  try {
    localStorage.setItem(STORAGE_KEY, validTheme.id);
  } catch (e) {
    // ignore
  }
  return applyTheme(validTheme.id);
}
