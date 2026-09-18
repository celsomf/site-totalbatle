/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        fantasy: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        tb: {
          bg: '#0c0f17',
          card: '#131824',
          panel: '#182030',
          border: '#2a364f',
          gold: '#f59e0b',
          goldLight: '#fbbf24',
          accent: '#3b82f6',
          crimson: '#ef4444',
          emerald: '#10b981',
          purple: '#8b5cf6',
          slateText: '#94a3b8'
        }
      }
    }
  },
  plugins: [],
}
