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
          bg: '#17181B', // Obsidian Black
          panel: '#202227', // Slate Obsidian tint
          card: '#292B32', // Elevated dark surface
          hover: '#363942', // Interactive hover
          border: '#434A50', // Cathedral Slate
          gold: '#4B6170', // Storm Blue (Primary Accent)
          'gold-light': '#979DA1', // Antique Pewter (Secondary Accent / Highlight)
          'gold-dark': '#32414B', // Deep Storm Blue
          ivory: '#EFE9E0', // Moonstone Ivory (Text Primary)
          pewter: '#979DA1', // Antique Pewter
          slate: '#434A50', // Cathedral Slate
          obsidian: '#17181B', // Obsidian Black
          red: '#c53b3b',
          blue: '#4B6170',
          green: '#3bc56c',
        }
      }
    },
  },
  plugins: [],
}
