import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for motorcycle/UTV rental platform
        'orange': {
          DEFAULT: '#E76F51', // Action buttons, key accents
          50: '#FDF5F3',
          100: '#FBEAE6',
          200: '#F5D0C8',
          300: '#F0B6AA',
          400: '#EB9C8C',
          500: '#E76F51', // Main orange
          600: '#E0563D',
          700: '#D84029',
          800: '#B23321',
          900: '#8B2619',
        },
        'pine': {
          DEFAULT: '#264653', // Stability color
          50: '#F0F4F3',
          100: '#E1E9E7',
          200: '#C3D2CF',
          300: '#A5BCB7',
          400: '#87A59F',
          500: '#698F87',
          600: '#4B786F',
          700: '#264653', // Main pine green
          800: '#1E3A43',
          900: '#162D33',
        },
        'sand': {
          DEFAULT: '#F4A261', // Backgrounds, warmth, and contrast
          50: '#FEF9F4',
          100: '#FDF3E9',
          200: '#FAE7D3',
          300: '#F7DBBD',
          400: '#F4CFA7',
          500: '#F1C391',
          600: '#EEB77B',
          700: '#F4A261', // Main sand beige
          800: '#E89340',
          900: '#DC841F',
        },
        'rock': {
          DEFAULT: '#6D6875', // Text or UI neutrals — keeps things grounded
          50: '#F6F6F7',
          100: '#EDEDEF',
          200: '#DBDBDF',
          300: '#C9C9CF',
          400: '#B7B7BF',
          500: '#A5A5AF',
          600: '#93939F',
          700: '#81818F',
          800: '#6D6875', // Main rock gray
          900: '#5A5A65',
        },
        'sky': {
          DEFAULT: '#FAFAFA', // Clean contrast for legibility
          50: '#FAFAFA', // Main sky white
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        // Semantic color mappings
        'primary': '#E76F51',
        'secondary': '#264653',
        'accent': '#F4A261',
        'neutral': '#6D6875',
        'background': '#FAFAFA',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;