/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette from PRD: "Steinway grand piano" aesthetic
        background: '#0A0A0A',
        surface: '#141414',
        'surface-light': '#1E1E1E',
        border: '#2A2A2A',
        gold: {
          DEFAULT: '#D4A853',
          dim: '#B8923F',
          bright: '#E8C068',
        },
        // Hand-specific colors
        left: {
          DEFAULT: '#D4A853',     // Gold for Left Hand (Base)
          dim: '#B8923F',
          glow: 'rgba(212, 168, 83, 0.3)',
        },
        right: {
          DEFAULT: '#E8C068',     // Bright gold for Right Hand (Treble)
          dim: '#D4A853',
          glow: 'rgba(232, 192, 104, 0.3)',
        },
        muted: '#6B6B6B',
        'text-primary': '#FAFAF5',
        'text-secondary': '#A0A0A0',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'bpm-display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '300' }],
        'ratio-display': ['3rem', { lineHeight: '1', letterSpacing: '-0.01em', fontWeight: '400' }],
        'label': ['0.75rem', { lineHeight: '1', letterSpacing: '0.1em', fontWeight: '500' }],
      },
      borderRadius: {
        'orb': '50%',
      },
      boxShadow: {
        'gold-glow': '0 0 40px rgba(212, 168, 83, 0.15)',
        'gold-glow-strong': '0 0 60px rgba(212, 168, 83, 0.3)',
        'inner-gold': 'inset 0 0 30px rgba(212, 168, 83, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
