const decanter = require("decanter");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [decanter],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    // Put the self-hosted next/font families (see app/layout.tsx) ahead of
    // Decanter's own stacks, which name the fonts but don't load them.
    fontFamily: {
      ...decanter.theme.fontFamily,
      sans: ["var(--font-source-sans)", ...decanter.theme.fontFamily.sans],
      serif: ["var(--font-source-serif)", ...decanter.theme.fontFamily.serif],
    },
    extend: {
      // Tints from the reference demo that Decanter doesn't have. Each pairs
      // with a Decanter color: palo-alto, digital-red, plum, poppy.
      colors: {
        "good-tint": "#E6F0EE",
        "warn-tint": "#FBEAEA",
        "sws-tint": "#F3E8F2",
        "sample-tint": "#FFF7DB",
      },
    },
  },
};
