import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1a1a1a', light: '#4a4a4a', muted: '#8a8a8a' },
        accent: { DEFAULT: '#b8860b', light: '#d4a843' },
        cream: { DEFAULT: '#faf8f5', dark: '#f0ece6' },
        'warm-white': '#fffef9',
      },
    },
  },
  plugins: [],
};

export default config;
