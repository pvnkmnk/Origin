import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00FF41',
        accent: '#FF0055',
      },
      fontFamily: {
        mono: ['Space Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        scanlines: "linear-gradient(rgba(255, 0, 85, 0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [typography],
} satisfies Config
