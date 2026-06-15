#!/usr/bin/env node
/* =============================================================================
   lint-tokens — the verifiable gate for the design system.

   Scans src/ for raw brand color values that should only live in tokens.css.
   These are the "drift vectors": values that, when hand-typed inline, quietly
   fork the design language (e.g. the accent's pressed state existed as both
   #234a31 and #24492f before this gate). Exits 1 if any are found.

   It does NOT flag every hex — per-project decorative art ("Bucket B" in
   DESIGN.md) is intentionally one-off and is left alone. Only the shared
   brand palette is enforced.

   Escape hatch: wrap a genuinely-exempt block in CSS comments tagged
   "design-system-exempt:start" and "design-system-exempt:end", or mark a
   single line with a trailing "design-system-exempt" CSS comment.

   Usage:  node scripts/lint-tokens.mjs        (run by `npm run build`)
   ============================================================================= */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');
const SELF_SKIP = ['tokens.css']; // the source of truth is allowed to hold raw values

// Brand hex -> the token that should be used instead. Keys are lowercased.
const ENFORCED = {
  '#2d5a3d': '--color-accent',
  '#234a31': '--color-accent-pressed',
  '#24492f': '--color-accent-pressed', // drift variant — same intent, different value
  '#faf8f5': '--color-bg',
  '#1a1a1a': '--color-text',
  '#4a4a4a': '--color-text-body',
  '#8a8a8a': '--color-text-muted',
  '#e5e0da': '--color-border',
  '#eef1ed': '--color-accent-wash',
};

// Accent green written as an inline rgba at some opacity (legacy form).
const ACCENT_RGBA = /rgba\(\s*45\s*,\s*90\s*,\s*61\s*,/i;

// Translucent accents must use the named opacity scale (--accent-tint/soft/
// line/strong), not a hand-picked inline color-mix. tokens.css is exempt.
const INLINE_ACCENT_MIX = /color-mix\([^)]*var\(--color-accent\)/i;

// Corner radii must come from the radius scale, not a raw px / 50%.
const RAW_RADIUS = /border(?:-[a-z]+)?-radius:[^;}{]*(?:[0-9.]+px|\b50%)/i;

// Neutral translucency must use the ramp tokens (--ink/white/scrim-aNN),
// not raw rgba of black, ink (#1a1a1a), or white.
const NEUTRAL_RGBA = /rgba\(\s*(?:0\s*,\s*0\s*,\s*0|26\s*,\s*26\s*,\s*26|255\s*,\s*255\s*,\s*255)\s*,/i;

// Font sizes must come from the type scale (--text-* / --text-display-*),
// not a raw rem/px/clamp.
const RAW_FONT_SIZE = /font-size:\s*(?:[0-9.]+(?:rem|px|em)|clamp\()/i;

const EXEMPT_LINE = /design-system-exempt(?!:)/;
const EXEMPT_START = /design-system-exempt:start/;
const EXEMPT_END = /design-system-exempt:end/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(astro|css)$/.test(name) && !SELF_SKIP.includes(name)) out.push(p);
  }
  return out;
}

const errors = [];
const warnings = [];

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  const lines = readFileSync(file, 'utf8').split('\n');
  let exempt = false;

  lines.forEach((line, i) => {
    if (EXEMPT_START.test(line)) exempt = true;
    if (EXEMPT_END.test(line)) { exempt = false; return; }
    if (exempt || EXEMPT_LINE.test(line)) return;

    const lower = line.toLowerCase();
    for (const [hex, token] of Object.entries(ENFORCED)) {
      if (lower.includes(hex)) {
        errors.push(`${rel}:${i + 1}  raw ${hex} → use var(${token})`);
      }
    }
    if (ACCENT_RGBA.test(line)) {
      errors.push(`${rel}:${i + 1}  inline accent rgba → use --accent-tint/soft/line/strong`);
    }
    if (INLINE_ACCENT_MIX.test(line)) {
      errors.push(`${rel}:${i + 1}  off-scale accent color-mix → use --accent-tint/soft/line/strong`);
    }
    if (RAW_RADIUS.test(line)) {
      errors.push(`${rel}:${i + 1}  raw border-radius → use var(--radius-*)`);
    }
    if (NEUTRAL_RGBA.test(line)) {
      errors.push(`${rel}:${i + 1}  raw neutral rgba → use var(--ink/white/scrim-aNN)`);
    }
    if (RAW_FONT_SIZE.test(line)) {
      errors.push(`${rel}:${i + 1}  raw font-size → use var(--text-*) / var(--text-display-*)`);
    }
  });
}

if (warnings.length) {
  console.warn(`\n⚠  ${warnings.length} accent-opacity warning(s) (not blocking):`);
  for (const w of warnings) console.warn('   ' + w);
}

if (errors.length) {
  console.error(`\n✗ ${errors.length} design-token violation(s):\n`);
  for (const e of errors) console.error('   ' + e);
  console.error('\n  Add the value to src/styles/tokens.css and reference it by name,');
  console.error('  or mark intentional one-off art with /* design-system-exempt */.\n');
  process.exit(1);
}

console.log('✓ design tokens: no brand-palette drift found');
