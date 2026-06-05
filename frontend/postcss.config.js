// postcss.config.js
// =================
// PURPOSE: PostCSS is the CSS transformer that Tailwind runs through.
// This file tells PostCSS to use Tailwind and Autoprefixer.
// You rarely need to touch this file.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}, // Adds vendor prefixes for browser compatibility
  },
};
