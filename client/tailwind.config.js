/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        glow: '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.25)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.25)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        laserScan: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { transform: 'translateY(350%)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        nodeBeacon: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
          '50%': { transform: 'scale(1.15)', boxShadow: '0 0 0 8px rgba(16, 185, 129, 0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'laser-scan': 'laserScan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        shimmer: 'shimmer 2.2s infinite',
        float: 'float 6s ease-in-out infinite',
        'node-beacon': 'nodeBeacon 2.5s infinite',
      },
    },
  },
  plugins: [],
};
