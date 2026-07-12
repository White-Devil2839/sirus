/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Warm paper canvas — editorial, not "SaaS gray".
        paper: '#F8F7F3',
        paperdim: '#EFEDE6',
        brand: {
          50: '#f2f1ff',
          100: '#e7e5ff',
          200: '#d0ccff',
          300: '#b1a9ff',
          400: '#8e7dff',
          500: '#6d5efc',
          600: '#5b45f0',
          700: '#4c37d4',
          800: '#3f2fab',
          900: '#362d87',
          950: '#101936',
        },
        ink: '#101936',
        gold: '#F6BF2F',
        coral: '#FF6B6B',
      },
      fontSize: {
        // Editorial display scale — big jumps, tight tracking.
        'display-sm': ['clamp(2rem, 4.5vw, 3.25rem)', { lineHeight: '1.06', letterSpacing: '-0.02em' }],
        display: ['clamp(2.5rem, 7vw, 5.25rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
      },
      borderRadius: {
        '4xl': '2.5rem',
        blob: '42% 58% 63% 37% / 41% 44% 56% 59%',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,25,54,0.04), 0 8px 24px -8px rgba(16,25,54,0.10)',
        card: '0 2px 4px rgba(16,25,54,0.04), 0 24px 48px -16px rgba(16,25,54,0.16)',
        float: '0 20px 60px -20px rgba(16,25,54,0.25)',
        glow: '0 0 0 1px rgba(109,94,252,0.15), 0 12px 40px -12px rgba(109,94,252,0.45)',
      },
      transitionTimingFunction: {
        entry: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-16px) rotate(1.2deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(4%, -5%) scale(1.06)' },
          '66%': { transform: 'translate(-4%, 3%) scale(0.96)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        drift: 'drift 20s ease-in-out infinite',
        shimmer: 'shimmer 2.2s infinite',
      },
    },
  },
  plugins: [],
};
