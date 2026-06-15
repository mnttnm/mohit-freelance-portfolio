/**
 * Generates public/og-image.png (1200×630) — the social-share card.
 * Brand values pulled from src/styles/tokens.css. Rendered via sharp's SVG
 * pipeline using the token-defined font fallbacks (Georgia for the serif
 * display face, a system sans for body) so it renders without network fonts.
 *
 * Re-run with: node scripts/gen-og-image.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og-image.png');

// Tokens
const bg = '#faf8f5';        // --color-bg
const ink = '#1a1a1a';       // --color-text
const body = '#4a4a4a';      // --color-text-body
const muted = '#8a8a8a';     // --color-text-muted
const accent = '#2d5a3d';    // --color-accent
const wash = '#eef1ed';      // --color-accent-wash
const onAccent = '#ffffff';  // --color-on-accent
const border = '#e5e0da';    // --color-border

const serif = "Georgia, 'Times New Roman', serif";          // --font-serif fallback
const sans = "'Helvetica Neue', Helvetica, Arial, sans-serif"; // --font-sans fallback

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${bg}"/>

  <!-- soft tinted corner for warmth -->
  <circle cx="1210" cy="-30" r="240" fill="${wash}"/>

  <!-- inset hairline frame -->
  <rect x="28" y="28" width="1144" height="574" rx="18" fill="none" stroke="${border}" stroke-width="2"/>

  <!-- brand spine -->
  <rect x="28" y="28" width="10" height="574" rx="5" fill="${accent}"/>

  <!-- eyebrow -->
  <circle cx="92" cy="118" r="6" fill="${accent}"/>
  <text x="110" y="124" font-family="${sans}" font-size="22" font-weight="600"
        letter-spacing="2" fill="${body}">MOHIT TATER — DESIGN ENGINEER &amp; PRODUCT PARTNER</text>

  <!-- headline -->
  <text x="88" y="262" font-family="${serif}" font-size="74" font-weight="400" fill="${ink}">Turn your idea into a</text>
  <text x="88" y="346" font-family="${serif}" font-size="74" font-weight="400" fill="${ink}">shipped product.</text>

  <!-- subline -->
  <text x="90" y="416" font-family="${sans}" font-size="28" font-weight="400" fill="${body}">Design, engineering, and QA — handled end-to-end by one person.</text>

  <!-- CTA pill -->
  <rect x="88" y="476" width="258" height="68" rx="34" fill="${accent}"/>
  <text x="217" y="519" font-family="${sans}" font-size="25" font-weight="600" fill="${onAccent}"
        text-anchor="middle">Book a call&#160;&#160;→</text>

  <!-- domain -->
  <text x="1128" y="519" font-family="${sans}" font-size="24" font-weight="500" fill="${muted}"
        text-anchor="end">mohittater.in</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log('Wrote', OUT);
