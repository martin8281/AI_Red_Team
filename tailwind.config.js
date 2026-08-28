/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#050A14',
          surface: '#070D18',
          card: '#0B1220',
          elevated: '#101827',
          hover: '#151F32',
        },
        border: {
          dark: '#1E293B',
          subtle: '#334155',
        },
        brand: {
          primary: '#8B5CF6',
          hover: '#A78BFA',
          secondary: '#7C3AED',
          dark: '#6D28D9',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#CBD5E1',
          muted: '#94A3B8',
          disabled: '#64748B',
        },
        severity: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#EAB308',
          low: '#22C55E',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'purple-subtle': '0 4px 20px -2px rgba(139, 92, 246, 0.15)',
        'purple-glow': '0 0 25px -5px rgba(139, 92, 246, 0.25)',
        'card-dark': '0 4px 24px -1px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        'purple-gradient-hover': 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(16, 24, 39, 0.8) 0%, rgba(11, 18, 32, 0.95) 100%)',
      }
    },
  },
  plugins: [],
}
