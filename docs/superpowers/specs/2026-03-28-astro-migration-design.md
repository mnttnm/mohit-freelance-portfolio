
# Astro Migration Design

## Summary

Migrate the original `freelance-site.html` portfolio to an Astro static site with component-first architecture. Archive v2 and v4 files. Deploy to Vercel.

## Goals

- Break monolithic HTML into maintainable Astro components
- Ship zero JavaScript by default (Astro's static output)
- Deploy via Vercel with git integration
- Preserve the existing dark theme design with minor polish where spotted
- Structure the project for easy future additions (blog, new pages)

## Non-Goals

- No blog scaffolding (will be added separately later)
- No UI framework (React/Vue/Svelte) — pure Astro components
- No design overhaul — 1:1 migration with minor polish allowed
- No CSS framework migration (keep hand-crafted CSS)

## Archiving

Move `freelance-site-v2.html` and `freelance-site-v4.html` to `archive/` folder. These remain in the repo for reference but are excluded from the Astro build.

## File Structure

```
├── archive/
│   ├── freelance-site-v2.html
│   └── freelance-site-v4.html
├── src/
│   ├── layouts/
│   │   └── Layout.astro          # <html>, <head>, meta, fonts, global styles
│   ├── components/
│   │   ├── Header.astro          # Fixed nav with smooth scroll anchor links
│   │   ├── Hero.astro            # Hero section + availability eyebrow
│   │   ├── Stats.astro           # 4-metric stats bar (4 columns)
│   │   ├── Services.astro        # 6 service cards in auto-fill grid
│   │   ├── Proof.astro           # 3 outcome cards (Figma plugin, Raycast, client work)
│   │   ├── Background.astro      # Experience timeline + tech stack (two-column layout)
│   │   ├── CTA.astro             # Call-to-action section + social links
│   │   └── Footer.astro          # Footer
│   ├── pages/
│   │   └── index.astro           # Assembles all components in order
│   └── styles/
│       └── global.css            # CSS reset, custom properties, noise overlay, keyframes, base typography
├── public/                        # Static assets (empty for now)
├── astro.config.mjs              # Static output, Vercel adapter
├── package.json
└── tsconfig.json
```

## CSS Strategy

### Global Styles (`src/styles/global.css`)

Extracted from the original `<style>` block — contains styles that are shared or affect the whole page:

- `:root` CSS custom properties (colors, fonts, easing)
- CSS reset (`* { margin: 0; padding: 0; box-sizing: border-box; }`)
- `html` and `body` base styles
- `::selection` styling
- Noise overlay (`body::before`)
- `@keyframes fadeUp` animation
- `prefers-reduced-motion` media query
- Base responsive breakpoints (768px, 480px) for global layout

### Scoped Styles (per component `<style>` block)

Each `.astro` component contains its own section-specific CSS in a `<style>` tag. Astro auto-scopes these styles to the component, preventing class name conflicts.

Component styles include:
- Section-specific layout (grid definitions, padding, margins)
- Component-specific typography
- Hover/focus states for interactive elements within the section
- Component-specific responsive overrides

### No CSS Framework

The existing hand-crafted CSS is preserved. No Tailwind, no CSS modules — just Astro's built-in scoping.

## JavaScript Strategy

### Scroll-Reveal Animations

The original site uses an `IntersectionObserver` to add a `.revealed` class to elements with `.reveal` as they scroll into view. This will be placed in a single `<script>` tag in `Layout.astro` so it runs once and observes all reveal elements across components.

```javascript
// Runs client-side, observes all .reveal elements
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

### Smooth Scrolling

Handled by CSS `scroll-behavior: smooth` on `html` — no JavaScript needed.

### Zero-JS Default

Astro ships no JavaScript bundle by default. The only client-side JS is the small IntersectionObserver script (~10 lines) included as a `<script>` tag, which Astro will inline.

## Component Breakdown

### Layout.astro
- `<!DOCTYPE html>`, `<html lang="en">`, `<head>` with meta tags
- Google Fonts link (DM Serif Display + Instrument Sans)
- Imports `global.css`
- Contains the scroll-reveal `<script>` tag
- `<slot />` for page content

### Header.astro
- Fixed position navigation bar
- Logo/brand on left
- Anchor links: #services, #work, #background, #contact
- Availability indicator badge

### Hero.astro
- Full-width hero with gradient background
- Main heading with serif font
- Subtitle/description
- CTA button
- Fade-up entrance animation (`.reveal`)

### Stats.astro
- 4-column grid of metric cards
- Numbers + labels (e.g., "50+ Projects", "8+ Years")
- `.reveal` with staggered animation delays

### Services.astro
- Section heading
- CSS Grid with `auto-fill, minmax()` for responsive card layout
- 6 service cards with title, description, pricing
- Card hover effects (border color, shadow)

### Proof.astro
- 3 outcome/proof cards
- Figma plugin (5K+ installs), Raycast extension (250+), Client work
- Card styling with accent borders

### Background.astro
- Two-column layout (CSS Grid)
- Left: Experience timeline with dates and roles
- Right: Tech stack organized by category
- Tag-style display for technologies

### CTA.astro
- Call-to-action heading
- Contact button/link
- Social links row (GitHub, Twitter/X, LinkedIn, etc.)

### Footer.astro
- Simple footer with copyright
- Possibly repeated nav links

## Deployment

- **Adapter**: `@astrojs/vercel` with static output
- **Build command**: `astro build`
- **Output directory**: `dist/`
- **Vercel**: Auto-detects Astro, git push triggers deploy
- **Preview deploys**: Automatic on PR branches

## Migration Verification

After migration, verify:
- [ ] Visual output matches original `freelance-site.html` pixel-for-pixel (minus minor polish)
- [ ] All anchor link navigation works
- [ ] Scroll-reveal animations fire correctly
- [ ] Responsive breakpoints work at 768px and 480px
- [ ] `prefers-reduced-motion` is respected
- [ ] No JavaScript shipped beyond the IntersectionObserver script
- [ ] Vercel build succeeds
- [ ] Lighthouse score >= 95 on Performance, Accessibility, Best Practices
