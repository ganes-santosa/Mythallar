/** @type {import('tailwindcss').Config} */
function withOpacity(variableName, fallback) {
  return ({ opacityValue }) => {
    const varRef = fallback ? `var(${variableName}, ${fallback})` : `var(${variableName})`;
    if (opacityValue !== undefined) {
      return `color-mix(in srgb, ${varRef} calc(${opacityValue} * 100%), transparent)`;
    }
    return varRef;
  };
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dnd: {
          bg: withOpacity('--color-bg', '#17181B'),
          panel: withOpacity('--color-panel', '#202227'),
          card: withOpacity('--color-card', '#272930'),
          hover: withOpacity('--color-hover', '#32353E'),
          border: withOpacity('--color-border', 'transparent'),
          gold: withOpacity('--color-gold', '#e0a838'),
          'gold-light': withOpacity('--color-gold-light', '#f5c862'),
          'gold-dark': withOpacity('--color-gold-dark', '#9c6f1a'),
          stars: withOpacity('--color-stars', 'var(--color-gold, #e0a838)'),
          ivory: withOpacity('--color-ivory', '#EFE9E0'),
          pewter: withOpacity('--color-muted', '#979DA1'),
          slate: withOpacity('--color-border', 'transparent'),
          obsidian: withOpacity('--color-bg', '#17181B'),
          red: '#c53b3b',
          blue: '#4B6170',
          green: '#3bc56c',
        }
      },
      fontFamily: {
        display: ['"Funnel Display"', 'system-ui', 'sans-serif'],
        sans: ['"Funnel Display"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
