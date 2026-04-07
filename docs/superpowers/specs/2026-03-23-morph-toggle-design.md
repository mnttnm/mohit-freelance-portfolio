# Morph Toggle: About / Work Page Transition

## Overview

Replace the current show/hide subpage navigation with a morph-based transition between two equal "worlds" — About (intro/services) and Work (projects list). The page is one living surface that transforms in place, not two separate pages.

## Design Decisions

### Mental Model
- **Two equal modes**, no hierarchy. Neither About nor Work is "home" — they are peers.
- The visitor's name "Mohit Tater" is the shared anchor element present in both states, providing visual continuity during the morph.

### Toggle Triggers
1. **Split label at the top** — A sticky header bar with "About / Work" in Instrument Sans. Active word is full `--ink` color, inactive is `--ink-muted`. Clicking the inactive word triggers the morph. In About state, the header initially hides behind the hero and becomes visible when the user scrolls down past the hero. In Work state, it's always visible at the top.
   - **Header layout:** Height ~48px, `background: var(--bg)` with slight transparency (`rgba`), `z-index: 100`, `position: sticky; top: 0`. Contains: morphed brand name (left), split label (right). Separator: `border-bottom: 1px solid var(--rule)`.
   - **Mobile:** Same layout, slightly smaller text.
2. **Scroll past bottom** — When the user scrolls past the footer on either side, the page morphs to the other state and scrolls to top. A subtle hint near the footer ("keep scrolling" + small arrow) signals this is possible.
   - **Infinite loop guard:** After a scroll-triggered morph, disable the scroll trigger for 1.5 seconds (cooldown). Also require active downward scroll momentum (not just "footer is in view") by checking `IntersectionObserver` only fires when the sentinel enters from above.

### The Two States

#### About State (current landing page)
- Full-bleed hero with background image, large poster-scale "Mohit Tater"
- Role line, tagline, CTA button
- Services ruled list
- Final CTA section
- Footer

#### Work State
- "Mohit Tater" shrinks to ~1.1rem inline text and repositions into the sticky header bar (left side). The `<br>` between "Mohit" and "Tater" collapses to a space — it reads "Mohit Tater" on one line. Font stays Fraunces, weight 700.
- Hero image fades out, background becomes `--bg` cream
- Role line, tagline, hero CTA fade out
- Services section is replaced by the project list
- Final CTA section ("Let's build something worth shipping") is hidden in Work state — it's an About-specific conversion element
- Footer remains, but the "Work" link is removed from footer nav (since Work is now a toggle state). Background and Stack links remain.

### Animation Choreography

#### About → Work (all times approximate)
1. Hero background image fades out (opacity 0, ~400ms)
2. "Mohit Tater" scales down and moves to top-left (~600ms, using existing `--ease-out` cubic-bezier — no actual spring physics needed)
3. Role line, tagline, CTA, and Final CTA section fade out (300ms, staggered)
4. Split label "Work" becomes active (color swap)
5. Services section cross-fades into project list (items stagger in, 80ms apart)
6. Page background transitions from hero-dark to `--bg` cream
7. Scroll position resets to top

#### Work → About (reverse choreography)
1. Project list items fade out (staggered, 60ms apart, fast)
2. Split label "About" becomes active
3. "Mohit Tater" scales up and moves back to hero position (~600ms, `--ease-out`)
4. Hero background image fades in (opacity 1, ~400ms)
5. Role line, tagline, CTA, Final CTA section fade in (300ms, staggered)
6. Background transitions back to hero-dark
7. Scroll position resets to top

**Race condition guard:** If a morph is triggered while another is in progress, ignore the second trigger. Use a boolean `isMorphing` flag that is set true at morph start and false after all transitions complete (via `transitionend` on the slowest element).

### Project List Design

#### Layout
Same ruled-list aesthetic as the existing services section — horizontal rules, no cards, clean editorial feel.

#### Entry Structure
```
─────────────────────────────────────────────
[type tag]    [project name]         [stat/→]
[one-liner description]
─────────────────────────────────────────────
```

- **Type tag** (left): lowercase, `--ink-muted`, small caps. Categories: webapp, plugin, extension, blog, ecommerce, agency website
- **Project name** (center-left): Fraunces serif, same weight as `.svc-name`
- **Stat or marker** (right): user count for products with stats ("8K+", "1K+"), star/accent marker for learning.log, arrow "→" for others
- **One-liner** (below name): `--ink-muted`, same style as `.svc-desc`

**Grid layout:** Same 2-column grid as `.svc` — `grid-template-columns: 1fr auto`. Type tag sits above the project name inside the left column (as a small label, not its own column). Stat/arrow sits in the right column. This matches the existing services pattern exactly.

**Mobile (max-width: 600px):** Single column, type tag above name, stat below description — same collapse pattern as existing `.svc` responsive styles.

#### learning.log Special Treatment
- First in the list
- Type tag uses `--accent` color instead of muted
- Star marker on the right side

#### Hover State
- Project name shifts to `--accent` color
- Right-side arrow/stat nudges right (matching existing CTA arrow pattern)

#### Each entry is a link
Opens project URL in a new tab.

#### Scroll-stagger animation
Same IntersectionObserver pattern as existing `.svc` items — rows fade in with translateY, staggered 80ms apart.

### Project Data

| # | Name | Type | One-liner | Stat | URL |
|---|------|------|-----------|------|-----|
| 1 | learning.log | webapp | Public work journal documenting AI dev experiments and agentic patterns | ★ | https://mohit.stream |
| 2 | Figma Variable Explorer | plugin | Centralized viewer for design variables — list, JSON, and CSS formats | 8K+ (updated from 5K+ in existing markup) | https://www.figma.com/community/plugin/1310888112326715990/figma-variable-explorer |
| 3 | Notes in Google Docs | extension | Capture quick notes from Raycast straight into Google Docs | 1K+ (updated from 250+ in existing markup) | https://www.raycast.com/tatermohit/note-in-google-doc |
| 4 | Tab Triage | extension | Chrome extension for tab management and organization | → | https://chromewebstore.google.com/detail/tab-triage/lldlagjikfofnnidnoegcmkolaibndof |
| 5 | Business Co-Pilot System | blog | Step-by-step system for a personal business co-pilot with Claude Code | → | https://medium.com/@tatermohit/i-built-a-business-co-pilot-using-claude-code-heres-the-exact-system-cfe32ee59558 |
| 6 | BTech CS Career Guide | webapp | Career guide for Indian CS undergrads — built with deep research + Claude Code | → | https://btech-cs-career-guide-india-qq40xiy9w-tatermohit.vercel.app/ |
| 7 | Greetwood | ecommerce | WordPress to Shopify migration using Shopify MCP/CLI and Claude Code | → | https://greetwood.myshopify.com/ |
| 8 | GetItRight | agency website | UX audit agency — 20+ audits for 10+ SaaS startups, 3-5 day turnaround | → | https://getitright-ux.notion.site/featured-ux-audit |

## Technical Approach

### Single HTML File
Continue the current single-file approach. No build tools, no frameworks — pure HTML/CSS/JS.

### CSS
- Morph transitions use CSS transitions on the shared elements (font-size, opacity, background)
- The brand morph uses a **FLIP technique** (First, Last, Invert, Play): the brand element stays in the same DOM position but uses `position: fixed` during the animation to visually move from hero to header. After transition completes, it snaps to its final DOM context. Alternatively, the brand can exist in both locations (hero + header) with only one visible at a time, cross-fading between them — simpler to implement, same visual result.
- Services and project list both exist in the DOM; toggle visibility with opacity + `pointer-events: none` for the hidden one
- Split label uses `position: sticky` at the top
- All animations respect `prefers-reduced-motion` (instant state swap, no transitions)

### DOM Strategy
Rather than moving elements between DOM parents, use a **dual-element approach**:
- Brand text exists in two places: inside `.hero-inner` (large) and inside the sticky header (small)
- In About state: hero brand is visible, header brand is hidden
- In Work state: hero brand is hidden, header brand is visible
- Cross-fade between them during morph for the illusion of one element transforming
- Similarly, services and project list are sibling containers that swap visibility

### JavaScript
- State management: single boolean (`isWorkMode`)
- Toggle function triggers CSS class swaps on body or a root container
- Scroll-to-morph: IntersectionObserver on a sentinel element at the bottom of the footer
- Scroll-stagger on project entries: same pattern as existing `.svc` observer

### What Gets Removed
- The existing subpage divs (`#p-work`, `#p-background`, `#p-stack`) — Work content moves into the morph; Background and Stack remain as subpages accessed from footer links
- The existing `go()` and `back()` functions get simplified — only needed for Background and Stack subpages now

### What Stays
- All existing CSS variables, fonts, color tokens
- Services section markup (visible in About state)
- Footer structure
- Hero image and grain overlay (visible in About state)
- `prefers-reduced-motion` handling
