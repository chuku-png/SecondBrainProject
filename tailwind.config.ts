import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:     '#F5EFE6',
          card:   '#EDE8DF',
          border: '#C4A882',
          text:   '#2C1810',
          muted:  '#8B6F47',
          dark:   '#3D2010',
        },
      },
      fontFamily: {
        mono: ['Space Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
