import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: '#FF5C39',
          light: '#FF7A5C',
          dark: '#E5421F',
          50: 'rgba(255, 92, 57, 0.05)',
          100: 'rgba(255, 92, 57, 0.1)',
          200: 'rgba(255, 92, 57, 0.2)',
        },
        surface: {
          0: '#09090B',
          1: '#111114',
          2: '#18181B',
          3: '#27272A',
          4: '#3F3F46',
        },
      },
      fontFamily: {
        display: ['"Syne"', 'system-ui', 'sans-serif'],
        body: ['"Figtree"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'float-slower': 'float 10s ease-in-out 3s infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.8s ease forwards',
        'fade-in-up': 'fade-in-up 0.8s ease forwards',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(2deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      typography: () => ({
        oopsie: {
          css: {
            '--tw-prose-body': '#A1A1AA',
            '--tw-prose-headings': '#FAFAFA',
            '--tw-prose-links': '#38BDF8',
            '--tw-prose-bold': '#E4E4E7',
            '--tw-prose-counters': '#FF5C39',
            '--tw-prose-bullets': '#FF5C39',
            '--tw-prose-hr': '#27272A',
            '--tw-prose-quotes': '#A1A1AA',
            '--tw-prose-quote-borders': '#FF5C39',
            '--tw-prose-code': '#FF7A5C',
            '--tw-prose-pre-code': '#D4D4D8',
            '--tw-prose-pre-bg': '#111114',
            '--tw-prose-th-borders': '#3F3F46',
            '--tw-prose-td-borders': '#27272A',
            maxWidth: 'none',
            lineHeight: '1.8',
            'h1, h2, h3, h4': {
              fontFamily: '"Syne", system-ui, sans-serif',
              fontWeight: '700',
              letterSpacing: '-0.02em',
            },
            h2: {
              marginTop: '2.5em',
              paddingBottom: '0.5em',
              borderBottom: '1px solid #27272A',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            code: {
              backgroundColor: 'rgba(255, 92, 57, 0.1)',
              color: '#FF7A5C',
              padding: '0.15em 0.4em',
              borderRadius: '0.3em',
              fontSize: '0.875em',
              fontWeight: '400',
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            },
            pre: {
              backgroundColor: '#111114',
              borderRadius: '0.75rem',
              border: '1px solid #27272A',
              paddingTop: '2.75rem',
              position: 'relative',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              color: '#D4D4D8',
              fontSize: '0.85em',
            },
            a: {
              color: '#38BDF8',
              textDecoration: 'none',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s ease, color 0.2s ease',
              '&:hover': {
                borderBottomColor: '#38BDF8',
              },
            },
            strong: {
              color: '#E4E4E7',
            },
            'ul > li::marker': {
              color: '#FF5C39',
            },
            'ol > li::marker': {
              color: '#FF5C39',
            },
            blockquote: {
              borderLeftColor: '#FF5C39',
              fontStyle: 'normal',
              color: '#A1A1AA',
            },
            'thead th': {
              color: '#E4E4E7',
              borderBottomColor: '#3F3F46',
            },
            'tbody td': {
              borderBottomColor: '#27272A',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
