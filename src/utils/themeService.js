/**
 * Theme Palette System for Mythallar
 */

const CUSTOM_THEME_STORAGE_KEY = 'mythallar_custom_theme';

export const DEFAULT_CUSTOM_THEME = {
  id: 'custom',
  name: 'Custom',
  subtitle: 'Build Your Own Palette & Texture',
  isCustom: true,
  texture: 'none',
  swatches: ['#15161a', '#242730', '#e0a838', '#f5f2eb'],
  colors: {
    bg: '#15161a',
    panel: '#1e2026',
    card: '#262932',
    hover: '#323642',
    border: '#454a59',
    gold: '#e0a838',
    goldLight: '#f5c862',
    goldDark: '#9c6f1a',
    stars: '#e0a838',
    ivory: '#f5f2eb',
    muted: '#949ba6',
  },
};

export const THEMES = [
  {
    id: 'mythallar-classic',
    name: 'Mythallar Classic',
    subtitle: 'Obsidian & Amber Gold',
    texture: 'none',
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
    id: 'the-weave',
    name: 'The Weave',
    subtitle: 'Deep Arcane Violet & Mystra Glow',
    texture: 'celestial',
    swatches: ['#0c0d13', '#1e202c', '#9d65d8', '#fef08a'],
    colors: {
      bg: '#0c0d13',
      panel: '#1a1b24',
      card: '#222330',
      hover: '#2d2e3d',
      border: '#7335DF',
      gold: '#9d65d8',
      goldLight: '#be8fee',
      goldDark: '#703ba8',
      stars: '#fef08a',
      ivory: '#f8f1ff',
      muted: '#a892c5',
    },
  },
  {
    id: 'space-cadet',
    name: 'Space Cadet',
    subtitle: 'Deep Cadet, Slate Gray & Tan',
    texture: 'stars',
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
  {
    id: 'underdark',
    name: 'Underdark',
    subtitle: 'Abyssal Cavern, Turquoise & Verdigris',
    texture: 'limewash',
    swatches: ['#0a0d0c', '#193A31', '#3EB9A8', '#5AA371'],
    colors: {
      bg: '#0a0d0c',
      panel: '#121615',
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
    id: 'desert-dunes',
    name: 'Desert Dunes',
    subtitle: 'Warm Sand, Driftwood Taupe & Basalt',
    texture: 'limewash',
    swatches: ['#474645', '#726A66', '#D5C3B0', '#DEDAD2'],
    colors: {
      bg: '#1c1b1a',
      panel: '#272625',
      card: '#353230',
      hover: '#474645',
      border: '#726A66',
      gold: '#D5C3B0',
      goldLight: '#DEDAD2',
      goldDark: '#9e8c7a',
      ivory: '#F3F2F0',
      muted: '#a89f97',
    },
  },
  {
    id: 'earthy-olive',
    name: 'Woodland Olive',
    subtitle: 'Rich Umber, Moss & Olive Sage',
    texture: 'limewash',
    swatches: ['#120e0b', '#241c16', '#8a9a5b', '#f0ede4'],
    colors: {
      bg: '#120e0b',
      panel: '#1a1410',
      card: '#241c16',
      hover: '#30261e',
      border: '#4d5438',
      gold: '#8a9a5b',
      goldLight: '#a6b874',
      goldDark: '#63703d',
      ivory: '#f0ede4',
      muted: '#9e9a89',
    },
  },
  {
    id: 'monochrome-slate',
    name: 'Gunmetal',
    subtitle: 'Charcoal Slate, Ash Grey & Alabaster',
    texture: 'none',
    swatches: ['#141517', '#26292e', '#e2e8f0', '#ffffff'],
    colors: {
      bg: '#141517',
      panel: '#1c1e21',
      card: '#26292e',
      hover: '#32363d',
      border: '#525866',
      gold: '#e2e8f0',
      goldLight: '#ffffff',
      goldDark: '#94a3b8',
      ivory: '#ffffff',
      muted: '#94a3b8',
    },
  },
  {
    id: 'blood-god',
    name: 'Blood God',
    subtitle: 'Black Stallion, Iron River & Crimson',
    texture: 'none',
    swatches: ['#060e0e', '#131e1d', '#65060E', '#CE1A1E'],
    colors: {
      bg: '#060e0e',
      panel: '#0e1918',
      card: '#131e1d',
      hover: '#1a2928',
      border: '#65060E',
      gold: '#CE1A1E',
      goldLight: '#e83d41',
      goldDark: '#65060E',
      ivory: '#837F78',
      muted: '#37403f',
    },
  },
  DEFAULT_CUSTOM_THEME,
];

export const DEFAULT_THEME_ID = 'mythallar-classic';
const STORAGE_KEY = 'mythallar_theme_id';

const LEGACY_THEME_ALIASES = {
  'bioluminescent-cyan': 'underdark',
};

export function getCustomThemeConfig() {
  try {
    const raw = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const colors = { ...DEFAULT_CUSTOM_THEME.colors, ...(parsed.colors || {}) };
      const texture = parsed.texture || DEFAULT_CUSTOM_THEME.texture;
      return {
        ...DEFAULT_CUSTOM_THEME,
        texture,
        colors,
        swatches: [colors.bg, colors.card, colors.gold, colors.ivory],
      };
    }
  } catch (e) {
    // ignore
  }
  return {
    ...DEFAULT_CUSTOM_THEME,
    colors: { ...DEFAULT_CUSTOM_THEME.colors },
    swatches: [...DEFAULT_CUSTOM_THEME.swatches],
  };
}

export function saveCustomThemeConfig(partial = {}) {
  const current = getCustomThemeConfig();
  const nextColors = {
    ...current.colors,
    ...(partial.colors || {}),
  };
  if (partial.colors?.gold && !partial.colors?.stars) {
    nextColors.stars = partial.colors.gold;
  }
  const nextTexture = partial.texture !== undefined ? partial.texture : current.texture;
  const updated = {
    ...DEFAULT_CUSTOM_THEME,
    texture: nextTexture,
    colors: nextColors,
    swatches: [nextColors.bg, nextColors.card, nextColors.gold, nextColors.ivory],
  };
  try {
    localStorage.setItem(
      CUSTOM_THEME_STORAGE_KEY,
      JSON.stringify({ colors: nextColors, texture: nextTexture })
    );
  } catch (e) {
    // ignore
  }
  return updated;
}

export function getActiveTheme(themeId) {
  const resolvedId = LEGACY_THEME_ALIASES[themeId] || themeId;
  if (resolvedId === 'custom') {
    return getCustomThemeConfig();
  }
  return THEMES.find((t) => t.id === resolvedId) || THEMES[0];
}

export function getStoredThemeId() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const resolved = LEGACY_THEME_ALIASES[saved] || saved;
    if (resolved && THEMES.some((t) => t.id === resolved)) {
      return resolved;
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_THEME_ID;
}

export function applyTheme(themeId) {
  const theme = getActiveTheme(themeId);
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
      '--color-gold-light': colors.goldLight || colors.gold,
      '--color-gold-dark': colors.goldDark || colors.gold,
      '--color-stars': colors.stars || colors.gold,
      '--color-ivory': colors.ivory,
      '--color-muted': colors.muted,
    };

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
  const validTheme = getActiveTheme(themeId);
  try {
    localStorage.setItem(STORAGE_KEY, validTheme.id);
  } catch (e) {
    // ignore
  }
  return applyTheme(validTheme.id);
}
