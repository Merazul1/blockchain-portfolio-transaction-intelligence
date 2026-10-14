/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        cyber: {
          bg: '#0B0E14',
          card: '#121722',
          cardHover: '#18202F',
          border: '#232D3F',
          borderLight: '#324159',
          accent: '#F3BA2F', // BSC gold
          opbnb: '#00E676',  // opBNB neon green
          eth: '#627EEA',    // Ethereum blue
          poly: '#8247E5',   // Polygon purple
          danger: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
          textMuted: '#94A3B8',
          textBright: '#F8FAFC'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-bsc': '0 0 25px -5px rgba(243, 186, 47, 0.25)',
        'glow-opbnb': '0 0 25px -5px rgba(0, 230, 118, 0.25)',
        'glow-cyber': '0 0 20px -3px rgba(34, 197, 94, 0.15)',
        'glow-danger': '0 0 25px -5px rgba(239, 68, 68, 0.3)',
      }
    },
  },
  plugins: [],
}
