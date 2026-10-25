/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dnd: {
          bg: '#0f1115',
          panel: '#181b22',
          card: '#222631',
          hover: '#2d3342',
          border: '#333b4e',
          gold: '#e0a838',
          'gold-light': '#f5c862',
          'gold-dark': '#9c6f1a',
          red: '#c53b3b',
          blue: '#3b82c5',
          green: '#3bc56c',
        }
      }
    },
  },
  plugins: [],
}
