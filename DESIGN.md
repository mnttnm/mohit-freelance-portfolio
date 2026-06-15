---
# Machine-readable tokens. The full, authoritative set lives in
# src/styles/tokens.css — this front-matter mirrors the semantic layer so an
# agent can read intent without parsing CSS. Keep the two in sync.
color:
  bg:             { value: "#faf8f5", role: "page background" }
  surface:        { value: "#ffffff", role: "cards, raised panels" }
  text:           { value: "#1a1a1a", role: "primary / headings" }
  text-body:      { value: "#4a4a4a", role: "paragraph body" }
  text-muted:     { value: "#8a8a8a", role: "captions, meta, de-emphasis" }
  accent:         { value: "#2d5a3d", role: "the one primary action per view" }
  accent-pressed: { value: "#234a31", role: "accent hover / active" }
  accent-wash:    { value: "#eef1ed", role: "soft accent-tinted fill" }
  on-accent:      { value: "#ffffff", role: "text/icons on accent" }
  border:         { value: "#e5e0da", role: "hairlines, dividers" }
  danger:         { value: "#b4533c", role: "errors, destructive" }
type:
  serif: "DM Serif Display"   # display moments only — hero, section titles
  sans:  "Instrument Sans"    # all body, UI, labels
  mono:  "JetBrains Mono"     # opt-in: code, project metadata
  # Fixed sizes (body/UI) — pick a step, never a raw rem.
  scale: { 2xs: .62, xs: .72, sm: .82, md: .92, lg: 1.05, xl: 1.2, 2xl: 1.5, 3xl: 2.05 } # rem
  # Fluid sizes (responsive headings).
  display: { xs: "clamp(1.2,1.45)", sm: "clamp(1.4,1.95)", md: "clamp(1.7,2.5)", lg: "clamp(2.2,3.5)", xl: "clamp(2.4,4)" } # rem
spacing: { base: 8px, scale: [4, 8, 12, 16, 24, 32, 48, 64] }
radius:  { 2xs: 2px, xs: 4px, sm: 6px, md: 10px, lg: 14px, xl: 18px, pill: 999px, circle: 50% }
# Translucent accents come from a 4-step scale, never an ad-hoc opacity.
accent-alpha:
  tint:   { value: "8%",  token: "--accent-tint",   role: "faint tinted fills" }
  soft:   { value: "18%", token: "--accent-soft",   role: "hover surfaces, soft borders" }
  line:   { value: "32%", token: "--accent-line",   role: "borders, dividers" }
  strong: { value: "50%", token: "--accent-strong", role: "focus rings, emphasis" }
---

# Design language

This file is the brief an agent (or a human) reads **before generating any UI**.
Tokens above tell you the values; the prose below tells you the *intent* — the
decisions the token table can't make for you.

## Voice

Restrained and editorial. Confident, not loud. The serif display face does the
emotional work in a few deliberate moments (hero, section openers); everything
else is quiet sans. White space is a feature, not a gap to fill. When unsure
between "more" and "less", choose less.

## How to use the system

- **Reference tokens by name, never raw values.** Use `var(--color-accent)`,
  not `#2d5a3d`. The full set is in `src/styles/tokens.css`. The original
  `--studio-*` names still work — they alias the same tokens.
- **One accent action per view.** `--color-accent` marks the single primary
  thing to do. If two things are green, neither reads as primary.
- **Type roles are fixed.** Serif for display moments, sans for everything else,
  mono only where it earns it (code, structured metadata). Don't introduce a
  fourth family.
- **Font size = a scale token.** Body/UI use the fixed `--text-*` steps;
  responsive headings use `--text-display-*`. Raw `font-size: …rem/px/clamp()`
  fails the build. Pick the nearest step rather than inventing a size.
- **Spacing is an 8px rhythm** (4px half-step allowed). Reach for a scale step,
  not an arbitrary number.
- **Radii have four steps** — `xs` inputs, `sm` buttons, `md` cards, `pill`
  chips. Don't invent a fifth.
- **Translucent accent = one of four tokens.** `--accent-tint` / `--accent-soft`
  / `--accent-line` / `--accent-strong`. Never write `rgba(45,90,61, …)` or an
  inline `color-mix` — the linter fails the build on both. If a usage doesn't
  fit one of the four, the right move is almost always to pick the nearest, not
  to add a fifth.
- **Neutral translucency = ramp tokens.** Black/ink/white at opacity come from
  one alpha ramp `[8 16 24 40 60 80]` over three bases: `--ink-aNN` (on light),
  `--white-aNN` (on dark), `--scrim-aNN` (shadows). Raw `rgba(0,0,0/26,26,26/255,255,255, …)`
  fails the build. (Bespoke dark-section colors are still raw and un-gated —
  treat them as dark-theme decorative until they're worth systematizing.)

## The two color buckets (important)

**Bucket A — the brand system.** The ~11 colors in the front-matter. These are
shared and must come from tokens. The linter (`scripts/lint-tokens.mjs`)
**enforces** these — a raw Bucket-A hex anywhere outside `tokens.css` fails the
build.

**Bucket B — per-project decorative art.** The project showcase tiles
(`projects.astro`, `work/*.astro`) use bespoke one-off colors for illustrations
and brand swatches that belong to *that* project, not this site. These are
intentionally not tokenized and are **not** enforced. If you add such art and
the linter ever flags it, wrap it:

```css
/* design-system-exempt:start */
.proj-acme-swatch { background: #c45d3e; }
/* design-system-exempt:end */
```

## Verifying consistency

`npm run lint:tokens` (also runs inside `npm run build`) is the source of truth
for "does this new UI speak the same language." Green build = no brand drift.
That check, not visual review, is what keeps session #10 consistent with #1.
