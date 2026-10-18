import localFont from "next/font/local";

// Self-hosted subsets (Latin, Cyrillic incl. Ө ө Ү ү, №, ₮, punctuation) from
// the Google Fonts sources. Glyph coverage was checked in these exact files
// and in Chrome's rendered output; see docs/fonts.md. Licences: src/fonts/OFL-*.txt.

/** Display serif for headlines: Source Serif 4 at display optical size, weight axis 400–600. */
export const serif = localFont({
  src: "../fonts/source-serif-display.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  variable: "--font-serif",
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/** Text and interface face: Inter (text optical size), weight axis 400–600. */
export const inter = localFont({
  src: "../fonts/inter-text.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: "Arial",
  fallback: ["Arial", "sans-serif"],
});
