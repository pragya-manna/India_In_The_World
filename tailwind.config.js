/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        india: {
          orange: '#FF9933',
          white: '#FFFFFF',
          green: '#138808',
          navy: '#000080',
        },
        dark: {
          50: '#1a1f2e',
          100: '#161b29',
          200: '#121624',
          300: '#0e111e',
          400: '#0a0d18',
          500: '#060912',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'spin-medium': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        'float-slow': 'float 9s ease-in-out infinite 4s',
        'blob': 'blob 7s infinite',
        'blob-delayed': 'blob 7s infinite 2s',
        'blob-slow': 'blob 10s infinite 4s',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'wave': 'wave 8s ease-in-out infinite',
        'wave-delayed': 'wave 8s ease-in-out infinite 2s',
        'draw-line': 'drawLine 2s ease forwards',
        'morph': 'morph 8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'slide-in-left': 'slideInLeft 0.6s ease forwards',
        'slide-in-right': 'slideInRight 0.6s ease forwards',
        'scale-in': 'scaleIn 0.5s ease forwards',
        'counter': 'counter 1.5s ease forwards',
        'ticker': 'ticker 40s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wave: {
          '0%, 100%': { d: 'path("M0,100 C300,150 600,50 900,100 C1200,150 1400,80 1500,100 L1500,300 L0,300 Z")' },
          '50%': { d: 'path("M0,120 C300,70 600,160 900,120 C1200,80 1400,140 1500,120 L1500,300 L0,300 Z")' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 153, 51, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 153, 51, 0.8), 0 0 80px rgba(255, 153, 51, 0.3)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
};
