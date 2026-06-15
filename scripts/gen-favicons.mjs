/**
 * Generates the brand favicons from the "MT" mark (matches public/favicon.svg).
 *   - public/favicon.ico        32×32  (replaces the default Astro logo)
 *   - public/apple-touch-icon.png 180×180 full-bleed (iOS / link unfurls)
 * Colors from src/styles/tokens.css: accent #2D5A3D on sand #FAF8F5.
 *
 * Re-run with: node scripts/gen-favicons.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = (f) => join(__dirname, '..', 'public', f);

// rounded mark for browser tabs (matches favicon.svg)
const mark = (size, radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">
  <rect width="32" height="32" rx="${radius}" fill="#2D5A3D"/>
  <text x="16" y="22" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="16" font-weight="bold" fill="#FAF8F5">MT</text>
</svg>`;

// full-bleed mark for apple-touch-icon (iOS applies its own corner mask)
const markFull = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="180" height="180">
  <rect width="32" height="32" fill="#2D5A3D"/>
  <text x="16" y="22" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="16" font-weight="bold" fill="#FAF8F5">MT</text>
</svg>`;

// favicon.ico — browsers accept PNG-encoded data here (the prior file was too)
await sharp(Buffer.from(mark(32, 6))).png().toFile(pub('favicon.ico'));
await sharp(Buffer.from(markFull)).png().toFile(pub('apple-touch-icon.png'));
console.log('Wrote favicon.ico + apple-touch-icon.png');
