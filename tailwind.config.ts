import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          primary:   '#0a0a0f',
          secondary: '#111118',
          card:      '#16161f',
          hover:     '#1e1e2a',
          border:    '#2a2a3a',
        },
        accent: {
          DEFAULT: '#5b6ef5',
          hover:   '#4a5ce0',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config