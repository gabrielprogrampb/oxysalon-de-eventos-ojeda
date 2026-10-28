/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './constants.ts',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5b13ec',
        gold: '#D4AF37',
        'background-light': '#f6f6f8',
        'background-dark': '#0f0b18',
        'surface-dark': '#1E1E1E',
        'surface-light': '#FFFFFF',
        'card-dark': '#1f1b2e',
        'card-light': '#ffffff',
      },
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        body: ['Noto Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        'pan-left': 'panLeft 25s ease-in-out infinite alternate',
        'pan-right': 'panRight 25s ease-in-out infinite alternate',
        'pan-zoom': 'panZoom 20s ease-in-out infinite alternate',
        'curtain-left': 'curtainLeft 0.8s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'curtain-right': 'curtainRight 0.8s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'curtain-up': 'curtainUp 0.8s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'curtain-down': 'curtainDown 0.8s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'reveal-left': 'revealLeft 1s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'reveal-right': 'revealRight 1s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'slide-in-left': 'slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-bottom': 'slideInBottom 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        panLeft: {
          '0%': { transform: 'scale(1.2) translateX(5%)' },
          '100%': { transform: 'scale(1.2) translateX(-5%)' },
        },
        panRight: {
          '0%': { transform: 'scale(1.2) translateX(-5%)' },
          '100%': { transform: 'scale(1.2) translateX(5%)' },
        },
        panZoom: {
          '0%': { transform: 'scale(1) translateX(0)' },
          '50%': { transform: 'scale(1.15) translateX(-3%)' },
          '100%': { transform: 'scale(1.1) translateX(3%)' },
        },
        curtainLeft: {
          '0%': { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        curtainRight: {
          '0%': { clipPath: 'inset(0 0 0 100%)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        curtainUp: {
          '0%': { clipPath: 'inset(100% 0 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        curtainDown: {
          '0%': { clipPath: 'inset(0 0 100% 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        revealLeft: {
          '0%': { opacity: '0', clipPath: 'inset(0 100% 0 0)', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', clipPath: 'inset(0 0 0 0)', transform: 'translateX(0)' },
        },
        revealRight: {
          '0%': { opacity: '0', clipPath: 'inset(0 0 0 100%)', transform: 'translateX(30px)' },
          '100%': { opacity: '1', clipPath: 'inset(0 0 0 0)', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInBottom: {
          '0%': { opacity: '0', transform: 'translateY(60px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
