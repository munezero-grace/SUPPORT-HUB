import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          light: '#EFF6FF',
          dark: '#1D4ED8',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        status: {
          new: {
            bg: 'var(--status-new-bg, #EFF6FF)',
            text: 'var(--status-new-text, #3B82F6)'
          },
          'in-progress': {
            bg: 'var(--status-progress-bg, #FEF3C7)',
            text: 'var(--status-progress-text, #D97706)'
          },
          resolved: {
            bg: 'var(--status-resolved-bg, #F3F4F6)',
            text: 'var(--status-resolved-text, #374151)'
          },
          closed: {
            bg: 'var(--status-closed-bg, #F3F4F6)',
            text: 'var(--status-closed-text, #374151)'
          }
        },
        priority: {
          high: {
            bg: 'var(--priority-high-bg, #FEE2E2)',
            text: 'var(--priority-high-text, #DC2626)'
          },
          medium: {
            bg: 'var(--priority-medium-bg, #FEF3C7)',
            text: 'var(--priority-medium-text, #D97706)'
          },
          low: {
            bg: 'var(--priority-low-bg, #ECFDF5)',
            text: 'var(--priority-low-text, #059669)'
          }
        },        brand: {
          primary: '#3B82F6',
          success: '#059669',
          warning: '#F59E0B',
          danger: '#DC2626'
        }},
      spacing: {
        62: '15.5rem', // For sidebar width
        18: '4.5rem',  // For header height
      },
      fontSize: {
        xxs: '0.625rem', // 10px
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
} satisfies Config

export default config