/** @type {import('tailwindcss').Config} */

// Centralized palette so we don't retype values in multiple places
const palette = {
  light: {
    // use RGB channels for CSS vars (works with Tailwind's <alpha-value>)
    bg: '245 245 244', // #f5f5f4 (less-harsh white)
    text: '17 17 17', // #111111 (readable black)
    primary: '0 121 121', // #007979 teal (brand primary)
    secondary: '252 109 9', // #fc6d09 orange
  },
  dark: {
    bg: '0 0 0', // #000000 (AMOLED)
    text: '229 229 229', // #e5e5e5 (less-harsh white)
    primary: '0 121 121', // keep teal primary in dark mode too
    secondary: '252 109 9',
  },
  tokens: {
    green: '#22c55e',
    yellow: '#facc15',
  },
}

module.exports = {
  // Respect the user's OS-level color scheme preference automatically
  darkMode: 'media',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Semantic colors backed by CSS variables so they adapt to light/dark
      colors: {
        background: 'rgb(var(--color-bg) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          primary: '#007979',
          secondary: '#fc6d09',
          'base-100': '#f5f5f4',
          neutral: '#111111',
        },
      },
      {
        dark: {
          primary: '#007979',
          secondary: '#fc6d09',
          'base-100': '#000000',
          neutral: '#e5e5e5',
        },
      },
    ],
  },
  plugins: [
    require('daisyui'),
    // Inject global CSS variables for light/dark schemes and manual overrides
    function ({ addBase }) {
      addBase({
        ':root': {
          '--color-bg': palette.light.bg,
          '--color-text': palette.light.text,
          '--color-primary': palette.light.primary,
          '--color-secondary': palette.light.secondary,
        },
        '@media (prefers-color-scheme: dark)': {
          ':root': {
            '--color-bg': palette.dark.bg,
            '--color-text': palette.dark.text,
            '--color-primary': palette.dark.primary,
            '--color-secondary': palette.dark.secondary,
          },
        },
        "[data-theme='light']": {
          '--color-bg': palette.light.bg,
          '--color-text': palette.light.text,
          '--color-primary': palette.light.primary,
          '--color-secondary': palette.light.secondary,
        },
        "[data-theme='dark']": {
          '--color-bg': palette.dark.bg,
          '--color-text': palette.dark.text,
          '--color-primary': palette.dark.primary,
          '--color-secondary': palette.dark.secondary,
        },
      })
    },
  ],
}
