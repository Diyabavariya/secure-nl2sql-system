// tailwind.config.js
// ==================
// PURPOSE: The complete Tailwind design system for QueryShield AI.
//
// This file is a direct translation of the Stitch AI design tokens into
// Tailwind configuration. Every color, font, border-radius, and spacing
// value here matches the original HTML design exactly.
//
// HOW TAILWIND WORKS:
//   Tailwind scans all files listed in `content` and generates only the
//   CSS classes that are actually used. This keeps the production bundle tiny.

/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for class names
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],

  // Force dark mode always — QueryShield AI is a dark-only UI
  darkMode: 'class',

  theme: {
    extend: {
      // ── Color Palette (from Stitch AI design tokens) ──────────────────────
      // These map to Material Design 3 color roles.
      // Usage: bg-primary, text-on-surface, border-outline-variant, etc.
      colors: {
        // Primary brand color (periwinkle blue)
        primary: '#b3c5ff',
        'primary-container': '#0066ff',       // Button backgrounds
        'on-primary': '#002b75',              // Text on primary buttons
        'on-primary-container': '#f8f7ff',    // Text on primary-container
        'primary-fixed': '#dae1ff',
        'primary-fixed-dim': '#b3c5ff',
        'on-primary-fixed': '#001849',
        'on-primary-fixed-variant': '#003fa4',
        'inverse-primary': '#0054d6',

        // Secondary color (cyan accent)
        secondary: '#d3fbff',
        'secondary-container': '#00eefc',     // Cyan highlight elements
        'on-secondary': '#00363a',
        'on-secondary-container': '#00686f',
        'secondary-fixed': '#7df4ff',
        'secondary-fixed-dim': '#00dbe9',
        'on-secondary-fixed': '#002022',
        'on-secondary-fixed-variant': '#004f54',

        // Tertiary (neutral blue-grey)
        tertiary: '#bfc7d1',
        'tertiary-container': '#6b737c',
        'on-tertiary': '#293139',
        'on-tertiary-container': '#f5f9ff',
        'tertiary-fixed': '#dbe3ed',
        'tertiary-fixed-dim': '#bfc7d1',
        'on-tertiary-fixed': '#151c23',
        'on-tertiary-fixed-variant': '#404850',

        // Surfaces (dark backgrounds at various elevations)
        background: '#050505',
        'on-background': '#e5e2e1',
        surface: '#131313',
        'surface-dim': '#131313',
        'surface-bright': '#3a3939',
        'surface-variant': '#353534',
        'surface-tint': '#b3c5ff',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#c2c6d8',

        // Surface containers (elevation levels)
        'surface-container-lowest': '#0e0e0e',
        'surface-container-low': '#1c1b1b',
        'surface-container': '#201f1f',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534',

        // Inverse surfaces
        'inverse-surface': '#e5e2e1',
        'inverse-on-surface': '#313030',

        // Outlines
        outline: '#8c90a1',
        'outline-variant': '#424656',

        // Error states
        error: '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',
      },

      // ── Border Radius ─────────────────────────────────────────────────────
      // QueryShield AI uses very subtle rounding (enterprise feel)
      borderRadius: {
        DEFAULT: '0.125rem',  // 2px — subtle default
        lg: '0.25rem',        // 4px
        xl: '0.5rem',         // 8px
        full: '0.75rem',      // 12px — used for pills and cards
      },

      // ── Spacing Tokens ────────────────────────────────────────────────────
      spacing: {
        gutter: '24px',
        'container-max': '1440px',
        'margin-desktop': '32px',
        'margin-mobile': '16px',
        unit: '4px',
      },

      // ── Font Families ─────────────────────────────────────────────────────
      // Geist = UI text | JetBrains Mono = code/SQL output
      fontFamily: {
        'headline-lg-mobile': ['Geist', 'sans-serif'],
        'body-sm': ['Geist', 'sans-serif'],
        'display-lg': ['Geist', 'sans-serif'],
        'headline-lg': ['Geist', 'sans-serif'],
        'headline-md': ['Geist', 'sans-serif'],
        'code-sm': ['"JetBrains Mono"', 'monospace'],
        'body-lg': ['Geist', 'sans-serif'],
        sans: ['Geist', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },

      // ── Font Sizes ────────────────────────────────────────────────────────
      fontSize: {
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'code-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      },
    },
  },

  plugins: [],
};
