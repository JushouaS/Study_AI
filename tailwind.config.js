/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
        heading: ['Syne', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        mint: '#63dcb4',
        purple: '#7c6af7',
        bg: '#080810',
        card: '#12121f',
        text: {
          DEFAULT: '#e8e8f0',
          muted: '#6b6b8a',
        },
      },
      spacing: {
        sm: '0.75rem',
        md: '1.25rem',
        lg: '2rem',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dropdownFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99, 220, 180, 0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(99, 220, 180, 0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease-out both',
        fadeIn: 'fadeIn 0.4s ease-out both',
        dropdownFadeIn: 'dropdownFadeIn 0.15s ease both',
        pulseGlow: 'pulseGlow 2s infinite',
      },
    },
  },
  plugins: [],
}