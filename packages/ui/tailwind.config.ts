import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 36ZERO Brand Colors
        'brand-navy': {
          DEFAULT: '#071923',
          50: '#0d2e3d',
          100: '#0a2530',
          200: '#081c24',
          300: '#071923',
          400: '#051318',
          500: '#030c0f',
          600: '#020608',
          700: '#010304',
          800: '#000102',
          900: '#000000',
        },
        'brand-blue': {
          DEFAULT: '#2f97dd',
          50: '#e8f4fc',
          100: '#c5e3f7',
          200: '#9ed0f1',
          300: '#77bdeb',
          400: '#50aae5',
          500: '#2f97dd',
          600: '#247ab5',
          700: '#1a5d8a',
          800: '#10405f',
          900: '#062334',
        },
        // Accent Colors
        'accent-gold': '#c9a962',
        'accent-teal': '#1a9e8c',
        'accent-coral': '#e07a5f',
      },
      fontFamily: {
        // Inter Tight for headings and body
        sans: ['Inter Tight', 'system-ui', 'sans-serif'],
        display: ['Inter Tight', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      backgroundImage: {
        // Gradient overlays for glassmorphism
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-ocean': 'linear-gradient(135deg, #071923 0%, #0d3a52 50%, #071923 100%)',
        'gradient-horizon': 'linear-gradient(180deg, transparent 0%, rgba(7, 25, 35, 0.8) 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(47, 151, 221, 0.4) 50%, transparent 100%)',
      },
      animation: {
        'shimmer': 'shimmer 5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 8s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '25%': { transform: 'translateX(5px) translateY(-5px)' },
          '50%': { transform: 'translateX(0) translateY(-10px)' },
          '75%': { transform: 'translateX(-5px) translateY(-5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 8px 32px rgba(7, 25, 35, 0.3)',
        'glow': '0 0 20px rgba(47, 151, 221, 0.3)',
        'glow-lg': '0 0 40px rgba(47, 151, 221, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(47, 151, 221, 0.1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
