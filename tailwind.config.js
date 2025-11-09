/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#E8EDDF',
        accent: '#007979',
        green: '#22c55e',
        yellow: '#facc15',
      },
    },
  },
  plugins: [require('daisyui'), require('tailwindcss-neumorphism-ui')],
}
