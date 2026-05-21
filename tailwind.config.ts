import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: 'class',
  // Glob konten di-inject otomatis oleh modul @nuxtjs/tailwindcss;
  // properti ini hanya untuk memenuhi tipe `Config`.
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', ...defaultTheme.fontFamily.sans],
        display: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // brand = cyan dingin — warna DOMINAN UI (tombol, link, glow, gradient)
        brand: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // accent = oranye hangat — aksen sekunder (badge, eyebrow, highlight)
        accent: {
          50:  '#fff8ed',
          100: '#ffeccb',
          200: '#ffd591',
          300: '#ffb84d',
          400: '#fb9a16',
          500: '#ec8009',
          600: '#c4600a',
          700: '#9c490e',
          800: '#7e3b11',
          900: '#683210',
          950: '#3b1905',
        },
        ink: {
          950: '#05060a',
          900: '#0a0c12',
          800: '#10131c',
          700: '#171a25',
          600: '#1f2433',
          500: '#2a3142',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34, 211, 238, 0.25), 0 0 40px -10px rgba(34, 211, 238, 0.45)',
        'glow-lg': '0 0 0 1px rgba(34, 211, 238, 0.3), 0 0 80px -10px rgba(34, 211, 238, 0.6)',
        'glow-warm': '0 0 0 1px rgba(251, 154, 22, 0.25), 0 0 40px -10px rgba(251, 154, 22, 0.45)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(ellipse at top, rgba(34, 211, 238, 0.12), transparent 60%), linear-gradient(to bottom, transparent, #05060a)',
        'noise':
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.25'/%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
