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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cyber: {
          50: '#f0fdff',
          100: '#ccf7fe',
          200: '#99eefe',
          300: '#4fe0fc',
          400: '#06c9f5',
          500: '#00b4d8',
          600: '#008fb6',
          700: '#007193',
          800: '#025c77',
          900: '#074d64',
        },
        neon: {
          cyan: '#00f5ff',
          purple: '#7c3aed',
          green: '#00ff87',
          red: '#ff2d55',
          yellow: '#ffd60a',
        },
      },
      backgroundImage: {
        'cyber-grid': `
          linear-gradient(rgba(0, 245, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 245, 255, 0.05) 1px, transparent 1px)
        `,
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        'hero-gradient': 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0a1628 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(0, 245, 255, 0.05))',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 245, 255, 0.2), 0 0 20px rgba(0, 245, 255, 0.1)' },
          '100%': { boxShadow: '0 0 10px rgba(0, 245, 255, 0.6), 0 0 40px rgba(0, 245, 255, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 245, 255, 0.5)',
        'neon-purple': '0 0 15px rgba(124, 58, 237, 0.5)',
        'neon-green': '0 0 15px rgba(0, 255, 135, 0.5)',
        'neon-red': '0 0 15px rgba(255, 45, 85, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
      },
    },
  },
  plugins: [],
}
