# Project notes

## Design system — read before building any UI
- **`DESIGN.md`** (repo root) is the brief: the token table + the intent/voice
  rules. Read it before generating or changing any interface.
- **`src/styles/tokens.css`** is the single source of truth for color, type,
  spacing, and radii. Reference tokens by name (`var(--color-accent)`,
  `var(--studio-*)`) — never hardcode a brand hex/rgba.
- Per-project decorative art ("Bucket B" in DESIGN.md) is exempt and may use
  one-off colors; wrap it in `/* design-system-exempt:start … :end */` if the
  linter flags it.

## Verifying consistency
- `npm run lint:tokens` is the gate. It fails the build on raw brand-palette
  values outside `tokens.css`. Run it (or `npm run build`) before considering a
  UI change done — green = the new UI speaks the same language.
