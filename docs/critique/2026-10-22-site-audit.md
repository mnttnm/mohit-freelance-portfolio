# Site audit + design critique — 2026-10-22

⚠️ DEGRADED: partial isolation. Assessment A (design review) ran in the auditing agent's own context; Assessment B (detector + browser evidence) ran as an isolated sub-agent (`a97f515c637b607b0`), but its report arrived before A was finished, so detector output was visible during the last part of the design review.

- **Method:** impeccable v4.1.1 `audit` + `critique` playbooks, `detect.mjs --json src/`, live checks at 1440px and 375px on the local dev server.
- **Judged against:** `DESIGN.md` (light theme, green accent, DM Serif Display + Instrument Sans).
- **Stale file:** `.impeccable.md` still describes the old dark/lime theme with a grain overlay. It contradicts `DESIGN.md` and should be rewritten or deleted (see I-3).
- **Line numbers may drift.** Another agent was editing `V2Variation.astro`, `about.astro`, `dashboard-skill.astro`, `StudioFooter.astro`, `Layout.astro` and `global.css` while this audit ran, and the line numbers moved between reads. Every finding names its selector or element, so grep for that if a line has shifted. The edits that agent had already made are listed at the end, so nobody redoes them.
- **No snapshot written:** the brief allowed only this report, so `.impeccable/critique/` was skipped. This is the first run, so there is no trend line.

---

## 1. Scores and verdict

### Design health (Nielsen heuristics; portfolio = Experience/Persuade surface)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Form shows "Sending…" and success/error, but the home page hides everything below the hero for up to 1.75s with no sign anything is coming, and return visits show a fake skeleton loader on a static page |
| 2 | Match system / real world | 3 | Mostly plain speech; jargon leaks: "Agentic Workflow", "AI-as-judge", "MCP, meet PCM" |
| 3 | User control and freedom | 2 | Home locks scroll during the hero entrance; /projects scrolls the page by itself after 2.7s; mobile project sheet has no Escape; lightbox doesn't return focus |
| 4 | Consistency and standards | 2 | Four separately written headers with different tap sizes; "Twitter" vs "X"; "10K+ users" vs "8K+ designers"; reveal motion behaves differently on each page |
| 5 | Error prevention | 3 | Required/min-length/honeypot on the form; only the first invalid field is reported |
| 6 | Recognition rather than recall | 3 | Clear nav; desktop /projects hides 5 of 6 flagship projects behind arrows |
| 7 | Flexibility and efficiency | n/a | Portfolio: no repeat-use workflows (arrow-key nav on /projects is a nice extra) |
| 8 | Aesthetic and minimalist design | 2 | Same eyebrow → slogan headline → content formula six times; decorative glows, fake product mockup, dead space in cards |
| 9 | Error recovery | 2 | "Please email me directly." but no email address appears anywhere on the site |
| 10 | Help and documentation | n/a | Not applicable to a portfolio |
| **Total** | | **20/32 (63%)** | **Acceptable** |

### Technical health (audit playbook)

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | Muted grey text fails contrast site-wide (3.26:1); heading levels skip; no `<main>`/skip link; mobile project cards are mouse/touch-only; reveal motion ignores reduced-motion on 3 surfaces |
| 2 | Performance | 3 | Static Astro, webp, lazy images; but React island hydrates on every page for a widget most visitors never see, render-blocking Google Fonts, ~8 images on /projects without dimensions, perpetual animations |
| 3 | Responsive design | 2 | Home is 412px wide on a 375px phone (menu button clipped); on phones the headline and "Book a call" fall below the first screen; many tap targets under 44px |
| 4 | Theming | 3 | Token lint is green; a handful of raw `#fff`, `#c0392b`, `rgba()` and duplicated cubic-beziers; light-only by design |
| 5 | Implementation integrity | 2 | Header markup+CSS copied into 4 files and drifting; dead "variation" CSS; stale `.impeccable.md`; detector found 16 source findings (5 false positives) |
| **Total** | | **12/20** | **Acceptable** |

### Overall verdict

The site is competent and clean, but it is assembled from the most common "tasteful AI portfolio" parts: a DM Serif Display + Instrument Sans pairing, a roman headline ending in a green italic phrase, an uppercase grey eyebrow over every section, a fake product mockup in the hero, and soft green glows. That combination makes it look like a template rather than one person's studio. Fix the technical gaps first (contrast, mobile overflow, reduced motion, scroll hijacking), then replace the type system and hero, because those two choices are what visitors read as "AI-generated."

### Design specificity

- **LLM assessment:** Swap the name and the photo and this could belong to any design-engineer freelancer.
  - The hero's "Craft Layers" deck is a generic SaaS dashboard mockup with ★★★★★, a pulsing "LIVE" dot and a "Shipped" stamp, not a piece of Mohit's actual work.
  - The real proof is the six project screenshots and five named testimonials. Both sit below the fold, inside a green panel and a collapsed accordion.
  - The most product-specific idea on the site, the agent-readable "takeaway" pages, has no presence on the home page.
- **Deterministic scan:** 16 findings in source, all severity "warning": bounce-easing 6, side-tab 3, broken-image 3, overused-font 3, layout-transition 1.
  - **False positives (5):** the 3 broken-image hits are lightbox placeholders whose image is filled by JS; 2 of the overused-font hits are dead CSS.
  - **Live-page totals:** home 39, /about 10, /projects 17, case study 44, takeaway 9.
  - **Recurring live findings:**
    - kicker-above-heading ×5 on home
    - thin-border-wide-shadow cards ×5 on home and ×13 on the case study
    - text under 12px, recurring
    - low-contrast muted grey on every page
    - a pulsing dot
    - nested cards
    - skipped heading on /about
  - **Agreement with the design review:** the detector confirms the eyebrow formula, the glow/shadow cards and the contrast failures. It missed the italic-accent headline pattern, the scroll hijack and the fake mockup.
- **Overlays:** the sub-agent injected the detector and read its console output, but no overlay was left visible for a human. Its tab is closed.

---

## 2. Findings

**Tags:**
- **[polish]** = can be implemented now with no layout or design-direction change.
- **[redesign]** = changes what the site looks like or says, so it needs the owner's decision first.

### (a) Accessibility

**A-1 [P1] Muted grey text fails contrast everywhere** [polish]
- **What a visitor sees:** Section labels ("WORK", "HOW I WORK"), the hero trust line, testimonial roles, experience dates, the footer copyright and the takeaway date are pale grey on cream. That is 3.26:1, below the 4.5:1 minimum, and hard to read in sunlight or on a dim laptop.
- **Where:** `src/styles/tokens.css:21` (`--ink-500: #8a8a8a`) is the root. It is used through `--color-text-muted` / `--studio-text-muted` / `--v2-text-muted`.
- **Fix:** Set `--ink-500: #6b6b6b`, which gives 5.03:1 on `#faf8f5`, 4.68:1 on the accent wash and 5.33:1 on white. Update the `text-muted` value in the `DESIGN.md` front-matter to match. This is a grey, not a brand color, so the palette stays as is.

**A-2 [P1] Social links on the green About panel are low-contrast** [polish]
- **What a visitor sees:** LinkedIn / mohit.stream / GitHub on the home About card are faint (4.0:1).
- **Where:** `V2Variation.astro:2032` (`.v2-about-social { color: rgba(250, 248, 245, 0.62) }`).
- **Fix:** `color: var(--white-a80);` gives 5.5:1 and also removes a raw rgba.

**A-3 [P1] Heading levels skip** [polish]
- **What a visitor sees:** Screen-reader users jump from the page title straight to level-4 headings on /about, and the footer's big "Got a project in mind?" isn't a heading at all, so its cards (h3) hang off nothing.
- **Where:**
  - `about.astro:61` and `about.astro:85` (`<h4 class="about-subsection-heading">`)
  - `StudioFooter.astro:8` (`<p class="studio-footer-label">`)
- **Fix:** Change both `<h4>` to `<h2>`, keeping the class. Change the footer `<p class="studio-footer-label">` to `<h2 class="studio-footer-label">`. Add `margin:0` if the browser's default heading margin shows.

**A-4 [P1] No main landmark and no skip link** [polish]
- **What a visitor sees:** Keyboard and screen-reader users must tab through the full header on every page, and assistive-tech "jump to main" does nothing.
- **Where:**
  - `Layout.astro:122-123`
  - the page bodies in `V2Variation.astro` (hero → about, ~59-490), `about.astro:35-95`, `projects.astro` (hero → more projects, ~332-900) and `work/dashboard-skill.astro` (hero → last section)
- **Fix:**
  - Add `<a class="skip-link" href="#main">Skip to content</a>` as the first child of `<body>` in Layout.
  - Wrap each page's content sections in `<main id="main">`, with header and footer outside it.
  - In `global.css`: `.skip-link{position:absolute;left:16px;top:-48px;padding:8px 12px;background:var(--color-surface);border-radius:var(--radius-sm);z-index:200}` and `.skip-link:focus{top:12px}`.

**A-5 [P1] Mobile project cards on /projects can't be opened by keyboard or screen reader** [polish]
- **What a visitor sees:** On phones, a VoiceOver/Switch user hears an article but can't activate it. The detail sheet then opens with no dialog role, no Escape, and focus left behind it.
- **Where:**
  - card markup: `projects.astro:~738-790` (`<article class="mspot-card" data-mspot-card>`)
  - click handler: `projects.astro:~3905-3918`
  - sheet: `projects.astro:1006` (`.mspot-sheet`)
  - close: `~4040-4055`
- **Fix:**
  - On each card add `role="button" tabindex="0" aria-label="Open {title} details"`, and handle Enter/Space like click.
  - On the sheet add `role="dialog" aria-modal="true" aria-labelledby` (the sheet title id).
  - On open, focus `[data-mspot-close]`. On close, return focus to the card that opened it.
  - Close on Escape.

**A-6 [P2] Lightboxes don't hand focus back** [polish]
- **What a visitor sees:** After closing a screenshot viewer, keyboard focus lands at the top of the page instead of on the screenshot they opened.
- **Where:**
  - `projects.astro:~3559-3582` (`openLightbox`/`closeLightbox`)
  - the same pattern in `work/dashboard-skill.astro` (lightbox + "Five shifts" modal)
- **Fix:** Save `document.activeElement` in open and call `.focus()` on it in close. While open, keep Tab cycling inside the close/prev/next buttons.

**A-7 [P2] Current page isn't announced in the nav** [polish]
- **What a visitor sees:** Screen readers don't say which page you're on; only bold weight shows it.
- **Where:** `V2Variation.astro:47`, `about.astro:19`, `projects.astro` (Work link ~313), `work/dashboard-skill.astro:102`
- **Fix:** Add `aria-current="page"` to the active nav link.

**A-8 [P2] Contact form errors are vague and only mention one field** [polish]
- **What a visitor sees:** If two fields are wrong, only one message appears, under the button and not next to the field.
- **Where:** `StudioFooter.astro:455-461`
- **Fix:** For each key in `error.fields`, set `aria-invalid="true"` on the input and `aria-describedby` pointing to a small message element under it. Clear them on input. Keep the summary line.

**A-9 [P3] Testimonial "read more" buttons don't say whether they're open** [polish]
- **Where:** `V2Variation.astro:~2562-2604`
- **Fix:** In `syncCards`, set `aria-expanded` on each preview (`false` when collapsed). Put `aria-expanded="true"` on the active card's quote container, or drop `role=button` from the active preview.

**A-10 [P3] Agent widget assumes browser storage works** [polish]
- **Where:** `AgentExperience.tsx:37, 54, 97` (unguarded `sessionStorage`)
- **Fix:** Wrap the calls in try/catch, as `V2Variation.astro:2439-2443` already does.

### (b) Performance

**P-1 [P2] React hydrates on every page for a widget most visitors never see** [polish]
- **Where:** `Layout.astro:125` (`<AgentExperience client:load />`). The component returns `null` unless an agent session exists (`AgentExperience.tsx:84`).
- **Fix:** Use `client:idle`. A stronger alternative is a tiny inline check of sessionStorage that loads the island only when state exists.

**P-2 [P2] Fonts block first paint and load unused faces** [polish]
- **Where:** `Layout.astro:69-74, 118-120`. The Google Fonts stylesheet is render-blocking, and it loads Instrument Sans italic 400/500 (`1,400;1,500`), which nothing uses (the quotes are set in the serif).
- **Fix:**
  - Drop `1,400;1,500` from the Instrument Sans family string.
  - If the italic headline accent is removed (R-1), also drop `ital@0;1` from DM Serif Display and load `DM+Serif+Display` roman only.
  - Longer term, self-host (Astro fonts API) and preload the two woff2 files used above the fold.

**P-3 [P2] Images on /projects have no intrinsic size** [polish]
- **What a visitor sees:** About 8 images can nudge the layout as they load (39 of 47 are protected by aspect-ratio boxes).
- **Where:** `projects.astro:404` (spotlight), `:456` (thumbs), `:750` (mobile deck), `:843` (more-projects), `:889` (mobile list)
- **Fix:** Add `width`/`height` attributes from the source files (or `Image` from `astro:assets` as on the home page).

**P-4 [P3] Perpetual animations cost battery and attention** [polish]
- **Where:**
  - `V2Variation.astro:1389-1392` (`.v2-live` pulse, infinite)
  - `V2Variation.astro:783-794` (`.v2-sk` shimmer, infinite)
  - `projects.astro:1992-1994` (`nextArrowInvite`, infinite)
- **Fix:**
  - Delete the live-dot pulse.
  - Remove the skeleton (see M-3).
  - Add `animation-iteration-count: 2` to the arrow invite.

**P-5 [P3] Permanent compositor layers and a pointless blur** [polish]
- **Where:**
  - `V2Variation.astro:909` (`will-change: transform` permanently on 5 hero cards)
  - `backdrop-filter: blur(8px)` at `V2Variation.astro:600`, `about.astro:156` and `projects.astro:1180`, over a 95%-opaque header, so the blur is almost invisible but still costs a full repaint on scroll
- **Fix:** Drop `will-change` at rest (scope it to `.is-loading`/`.is-overture`) and remove the three `backdrop-filter` lines.

### (c) Responsive / mobile

**R-1m [P1] Home page is wider than the phone** [polish]
- **What a visitor sees:** At 375px the page lays out 412px wide. The menu button is pushed about 17px off the right edge, and the page can wobble sideways.
- **Cause:** The hero's front card (`.v2-product`, moved forward in 3D) pokes past the screen.
- **Where:** `V2Variation.astro:666` (`.v2-hero`) and `:1314-1320` (mobile `.v2-stack`)
- **Fix:**
  - Add `overflow-x: clip;` to `.v2-hero`.
  - Add `@media (max-width: 400px){ .v2-stack{ --card-w: 212px; --step-x: 18px; } }` after the 960px block.
  - Verify `document.documentElement.scrollWidth === 375`.

**R-2m [P1] On phones the headline and "Book a call" sit below the first screen** [redesign — small]
- **What a visitor sees:** The first phone screen is a grey uppercase label and a mock dashboard. The name of what Mohit does and the main button need a scroll.
- **Where:** `V2Variation.astro:1265-1278` (grid order `eyebrow / art / copy`)
- **Fix:** Order `eyebrow / copy / art` on mobile, or shrink the deck to a 120px strip. It is a layout change, so it needs the owner's OK.

**R-3m [P1] Tap targets under 44px** [polish]
- **Menu button on inner pages, 38×24:**
  - **Where:** `about.astro:205-213`, `projects.astro:1227-1235`, `dashboard-skill.astro:537`
  - **Fix:** Replace `padding: 8px` with `min-width:44px; min-height:44px; margin-right:-11px; align-items:center; justify-content:center;`, exactly as `V2Variation.astro:649-663` already does.
- **Carousel dots, 7×7:**
  - **Where:** `projects.astro:2826` (`.mspot-dot`)
  - **Fix:** Keep the 7px dot visual, but make the button 32×44 with `background-clip: content-box` padding, or give it an `::after` hit area of `inset:-18px -12px`.
- **Footer social links, 25px tall:**
  - **Where:** `StudioFooter.astro:347`
  - **Fix:** `padding: 10px 2px; display:inline-block`.
- **Home about-panel socials, 22px:**
  - **Where:** `V2Variation.astro:2029`
  - **Fix:** `padding: 6px 0`.
- **Text CTAs ("See my work →", "See all projects →"), 25px:**
  - **Where:** `V2Variation.astro:1516`, `:2262`
  - **Fix:** `padding-block: 10px`.
- **Form success close "×", 24px:**
  - **Where:** `StudioFooter.astro:280-288`
  - **Fix:** `min-width:44px; min-height:44px`.

**R-4m [P2] Tiny functional labels (10.4px)** [polish]
- **What a visitor sees:** Project-type pills and service badges are 10px uppercase. On phones "ENTERPRISE APP" wraps onto two lines inside its pill.
- **Where:**
  - `V2Variation.astro:2239` (`.v2-thumb-type`) and `:1626` (`.v2-team-badge`)
  - `projects.astro:2774` (`.mspot-card-eyebrow`) and `:3230` (`.mmore-badge`)
  - `dashboard-skill.astro:685` (`.cs-chip`)
- **Fix:** Change `font-size: var(--text-2xs)` to `var(--text-xs)`, and add `white-space: nowrap` to `.v2-thumb-type`. `--text-2xs` stays for purely decorative art (hero mockup, `.illo-*`).

**R-5m [P3] Thumbnail names truncate on phones** ("AI Resizing Stud…")
- **Where:** `V2Variation.astro:2225-2235` (`.v2-thumb-name { white-space: nowrap; text-overflow: ellipsis }`)
- **Fix:** At ≤768px, allow two lines: `white-space: normal; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden`.
- **Tag:** [polish]

### (d) Interaction and micro-interaction gaps

**I-1 [P1] /projects scrolls the page by itself** [polish]
- **What a visitor sees:** On desktop, 1.8s after landing the project panel lifts, glows green and casts a 130px shadow. At 2.7s the page scrolls down on its own and hides the page title. If you're reading, the page moves out from under you.
- **Where:**
  - IIFE "Auto-scroll into the spotlight": `projects.astro:~3720-3805`
  - CSS: `.work-browser.is-anticipating` at `:1285-1289`, `:1349-1377`
  - `.work-browser` spring transition: `:1278-1283`
- **Fix:**
  - Delete the IIFE and the `.is-anticipating` rules.
  - Change `.work-browser`'s transition to none, since nothing transforms it any more.
  - Reduce `.projects-hero` padding so the panel is already in view.

**I-2 [P2] Home page holds the visitor for the hero show** [polish]
- **What a visitor sees:** On first visit the page below the hero is invisible and scrolling is locked while the deck assembles (1.75s). Skip-on-scroll was added during this audit, which helps, but content is still withheld.
- **Where:**
  - `V2Variation.astro:~674-697` (`.v2-js .v2-hero ~ *` hidden plus a 5s failsafe)
  - `:2411-2423` (`lockPage` sets `overflow:hidden` on html/body)
- **Fix:**
  - Delete the `overflow` lines in `lockPage`/`releasePage`.
  - Delete the `.v2-js .v2-hero ~ * { opacity:0 }` rule and its failsafe, so sections below use their own scroll reveal.
  - Keep the deck animation; it simply no longer blocks.

**I-3 [P2] Two equal green buttons compete in the footer** [polish]
- **What a visitor sees:** "Send message" and "Book a call" sit side by side, both solid green. DESIGN.md says one green action per view.
- **Where:** `StudioFooter.astro:59` (with `.studio-footer-card--action .studio-btn-primary` at `:335-338`)
- **Fix:** Make the call card's link a secondary button: `background: transparent; color: var(--color-accent); box-shadow: inset 0 0 0 1px var(--accent-line);`, with hover `background: var(--accent-tint)`.

**I-4 [P2] Submit button gives no visual busy state** [polish]
- **Where:** `StudioFooter.astro:443-466`, `:245-250`
- **Fix:** Set `aria-busy="true"` while sending. Add `.studio-form-submit:disabled{opacity:.6; cursor:progress}`.

**I-5 [P3] Hover and press states are uneven**
- **What a visitor sees:**
  - Nav links only shift a shade of grey on hover.
  - `.studio-footer-socials a:hover` fades to 0.7 opacity.
  - `.v2-profile-link` changes color.
  - Three different hover languages for the same kind of link.
- **Fix:** Use one rule for inline text links: color → `var(--color-accent)` plus `text-decoration: underline; text-underline-offset: 3px` on hover.
- **Where:**
  - `V2Variation.astro:635`, `:1816`
  - `StudioFooter.astro:355`
  - `about.astro:191`, `:293`
  - `projects.astro:1215`
- **Tag:** [polish]

**I-6 [P3] Testimonial active card uses a left accent bar** (detector: side-tab) [polish]
- **Where:** `V2Variation.astro:1858` (`border-left: 3px solid var(--v2-accent)`)
- **Fix:** Delete the line. The white fill and the expanded quote already mark it as active.

### (e) Motion quality

**M-1 [P1] Reveal animations ignore "reduce motion" on About, Projects and the footer** [polish]
- **What a visitor sees:** Visitors who asked their device for less motion still get every block sliding up. Without JS, content depends on a CSS animation running.
- **Where:**
  - `about.astro:120-136` (CSS) and `:422-445` (JS)
  - `projects.astro:1135-1160` (CSS) and `~3272-3290` (JS)
  - `StudioFooter.astro:94-105`
- **Fix:**
  - Wrap each `.studio-reveal { opacity:0; transform…; animation… }` block (and the `nth-child` delays) in `@media (prefers-reduced-motion: no-preference) { … }`.
  - In each JS block, start with `if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;` before pausing animations.
  - `dashboard-skill.astro:868-870` already does a version of this; match it.

**M-2 [P1] Home headline can stay invisible if the page script fails** [polish]
- **What a visitor sees:** The inline script marks the page as "JS on" before paint, which hides the hero copy until the module script adds `.is-art-done`. If that module fails (blocked, slow network, error), the headline and buttons never appear. The existing 5s failsafe only covers sections below the hero.
- **Where:** `V2Variation.astro:716-746` (`.v2-js .v2-hero[data-hero-anim] .v2-hero-line { opacity:0 }`)
- **Fix:**
  - Add `animation: v2-hero-failsafe 0.01s linear 2.5s forwards;` to that rule.
  - Add `animation: none;` to the `.is-art-done .v2-hero-line` rule.
  - The `v2-hero-failsafe` keyframes already exist at `~691`.

**M-3 [P2] Fake loading skeleton on return visits** [polish]
- **What a visitor sees:** On a second visit, shimmering grey bars stand in for the headline for about 0.7s, so a static page pretends to be loading.
- **Where:**
  - markup: `V2Variation.astro:83-105`
  - CSS: `:748-847`
  - JS spring branch: `:2450-2463`
- **Fix:**
  - Delete the skeleton markup and CSS.
  - In JS, treat return visits like the reduced-motion branch at `:2445-2449`: add `is-art-instant`/`is-art-done` and `is-hero-revealed` with no lock.
  - The `.is-spring` CSS (`:1379-1387`) can go too.

**M-4 [P2] Springy overshoot on large surfaces and raw curves duplicating tokens** (detector: bounce-easing ×6) [polish]
- **Where:**
  - `projects.astro:1282` (`.work-browser`, 1.56 overshoot)
  - `projects.astro:1344` (box-shadow overshoot)
  - `V2Variation.astro:1327` (icon pop: keep, but use the token)
  - raw `cubic-bezier(0.22, 1, 0.36, 1)` at `V2Variation.astro:872, 908, 1337, 1368, 1372, 1385`
- **Fix:**
  - Replace every raw `cubic-bezier(0.22, 1, 0.36, 1)` with `var(--ease-out)`.
  - Use `var(--ease-spring)` only for the small icon pop.
  - Delete the `.work-browser` transition (see I-1).

**M-5 [P3] Testimonial accordion animates margin** [polish]
- **Where:** `V2Variation.astro:1837-1842`. The grid-rows technique was already adopted during this audit, but `margin` is still transitioned.
- **Fix:** Replace `margin-top` on `.v2-tcard-body` with `padding-top` inside the grid child (`.v2-quote { padding-top: 20px }` when active). Drop `margin` from the transition list.

**M-6 [P3] Hero dock leg is long**
- **Where:** `.v2-hero-art.is-docking`, 0.8s, `V2Variation.astro:871-873`
- **Fix:** Set it to 0.55s `var(--ease-out)`. Movement over 500ms reads as sluggish after a 1.75s overture.
- **Tag:** [polish]

### (f) Copy and clarity

**C-1 [P2] Contact failure message points to an email that isn't on the site** [polish, needs the owner's address or new wording]
- **Where:** `StudioFooter.astro:461` ("Something went wrong. Please email me directly.")
- **Fix:** Either add the address, or reword: "That didn't send. Try again in a minute, or book a call instead." (link to cal.com).

**C-2 [P2] Two different user numbers** [needs owner]
- **What a visitor sees:** "10K+ users across my tools" (hero, `V2Variation.astro:79`, and the mockup `:193`) against "tools used by 8K+ designers" (`:467`). An attentive founder sees two different numbers.
- **Fix:** Pick one claim, or make both explicitly scoped.

**C-3 [P3] "Twitter" in the footer, "X" on About** [polish]
- **Where:** `StudioFooter.astro:68` vs `about.astro:48`
- **Fix:** Use "X" in both.

**C-4 [P3] "You've an idea, but aren't sure what to build."** reads as a typo to US/UK founders [polish]
- **Where:** `V2Variation.astro:289`
- **Fix:** "You have an idea, but aren't sure what to build."

**C-5 [P3] The footer says "no pitch" twice in 50px** [polish]
- **Where:**
  - "No pitch, just a conversation." at `StudioFooter.astro:10`
  - "No slides, no pitch." at `:57`
- **Fix:** Cut the first sentence's tail: "…not sure what you need yet."

**C-6 [P3] Stale code comment says three action cards; there are two** [polish]
- **Where:** `StudioFooter.astro:5`, `:51`

**C-7 [P2] Slogan-shaped headlines** [redesign: copy voice]
- **Examples:**
  - "Things I've built, and keep building."
  - "Proof it works, in their words."
  - "Less overhead. More shipping."
  - "A decade of shipping products, and counting."
  - "Ready for the next useful conversation."
  - "The context worth carrying forward."
- **Problem:** Every one is a two-beat ad line. Together they read as generated rather than said. `.impeccable.md`'s own principle ("if it sounds like ad copy, rewrite it") is violated.
- **Fix:** Use plain labels or concrete claims, e.g. "Recent work", "What clients said", "How an engagement runs".
- **Also:** em dashes are dense (13 in visible case-study body text; about 8 in home copy). Replace about half with full stops or commas.

**C-8 [P3] Jargon in visitor-facing labels** [polish]
- **Where:**
  - "Agentic Workflow" (`V2Variation.astro:270`)
  - "AI-as-judge" pill (`projects.astro:58`)
  - "MCP, meet PCM" (`AgentExperience.tsx:194`)
- **Fix:** "Review workflow", "AI quality checks", and drop the pun.

### (g) AI-slop tells (the "dated / AI-generated" complaint)

Ordered by how strongly each one signals "template":

1. **Italic serif accent word in brand green, ending a roman serif headline**, used 9 times:
   - `V2Variation.astro:68, 231, 284, 317, 434, 466`
   - `about.astro:40`
   - `projects.astro:335`
   - `dashboard-skill.astro:121`
   - The single most recognisable AI/Framer-template headline trope of 2024-26. [redesign → R-1]
2. **DM Serif Display + Instrument Sans.** Both are top-of-list defaults for "editorial" templates. DM Serif is a high-contrast display face. Here it is also stretched to:
   - the logo
   - 17px card titles (`.v2-process-title`, `:1679-1685`)
   - italic testimonial body text (`.v2-quote`, `:1862-1871`)
   - At small sizes its hairlines break up, which reads cheap. [redesign → R-1; quote face is polish → Q-1 below]
3. **Uppercase, wide-tracked grey eyebrow above every section**:
   - Work / We'll make a good team / What clients say / How I work / About (`V2Variation.astro:230, 283, 316, 433, 465`)
   - hero eyebrow (`:65`)
   - case-study kickers and `studio-section-label` ×4
   - six `takeaway-label`s
   - It's 0.18em-tracked 11.5px grey (`:562-569`) and also fails contrast. [redesign → R-3]
4. **Fake product mockup hero**: tabs labelled Design / Engineering / QA / AI, a mini dashboard, "USERS 10K+", "CLIENTS 5.0 ★★★★★", a pulsing "LIVE" dot, a "SHIPPED" stamp, "Built by Mohit Tater" (`V2Variation.astro:112-221`). The star rating also implies a review system that doesn't exist. [redesign → R-2]
5. **Choreographed entrance with a skeleton loader and scroll lock**: "delight" that delays content (M-3, I-2).
6. **Identical section rhythm**: label → slogan headline → content block, with padding 120px or 40/120 on every section (`V2Variation.astro:1536, 1649, 1696, 1920, 2111`). Nothing gets more room than anything else. [redesign → R-3]
7. **Soft green glows and vignettes**:
   - testimonials radial wash (`:1704-1714`)
   - work mosaic radial highlight + inset vignette + green glow shadow (`:2156-2161`)
   - about panel radial (`:1981-1983`)
   - projects shell radial + 70px shadow (`projects.astro:1334-1342`)
   - Removing them is [polish → Q-2].
8. **Thin 1px border + large soft blurred shadow cards** (detector ×5 home, ×13 case study): hero layers, about portrait (`about.astro:265-267`), case-study frames. [polish where not hero art: drop to `0 1px 2px var(--ink-a08)`]
9. **Numbered 01/02/03 list plus pill badges plus serif lead plus paragraph**: four tiers per item in "We'll make a good team" (`:286-308`). [redesign → R-3]
10. **Generic 3-column "More projects" card grid** (image / eyebrow / title / blurb / "Visit store →") on `projects.astro:~834-870`. [redesign → R-4]
11. **"→" appended to every button and link label**: Book a call →, See my work →, More about me →, Send message →, See all projects →, Read the case study →. [polish: keep the arrow only on navigational text links; remove it from solid buttons. `V2Variation.astro:73, 469`, `StudioFooter.astro:45, 59`]
12. **✦ sparkle glyph**: `takeaways/[id].astro:49, 155`; `AgentExperience.tsx:176, 194`. [polish: remove]
13. **Glass header blur** (P-5). [polish]
14. **Stock micro-copy**: "Got a project in mind?", "No pitch, just a conversation.", "Proof it works, in their words." (C-7).
15. **Pulsing status dot** (P-4).
16. No emoji found. The only pictographic glyphs are ★ and ✦, both noted above.

**Q-1 [P2] Testimonial quotes in italic display serif at body size, 85% opacity** [polish: readability]
- **Where:** `V2Variation.astro:1862-1871`
- **Fix:**
  - `font-family: var(--v2-sans); font-style: normal; opacity: 1; color: var(--v2-text-body); line-height: 1.7;`
  - Same for `.v2-tcard-preview` (`:1873-1887`).
  - Display faces are not reading faces.

**Q-2 [P3] Decorative gradients** [polish]
- **Fix:**
  - Delete `.v2-testimonials-section::before` (`:1704-1714`).
  - Set `.v2-work-mosaic` background to `var(--v2-accent)` with `box-shadow: none` (`:2156-2161`).
  - Set `.v2-about-media` background to `var(--v2-accent)` (`:1981-1983`).
  - Set `.work-browser-shell` background to `var(--white-a60)` and `box-shadow: 0 1px 2px var(--ink-a08)` (`projects.astro:1334-1342`).

**Q-3 [P3] Dead space in cards** [polish: spacing only]
- **Home About card:** `min-height: 520px` plus a button pinned to the bottom (`V2Variation.astro:1960`, `:1950`) leaves a large empty band.
  - **Fix:** Delete `min-height: 520px` and set `.v2-about-actions { margin-top: 0 }`.
- **Footer action cards** stretch to the form's height, leaving empty middles (`StudioFooter.astro:311-317`).
  - **Fix:** Remove `flex: 1; justify-content: space-between` and add `align-content: start` on `.studio-footer-actions`.

### Implementation integrity

**I-1i [P2] The site header is written four times and has drifted** [redesign: structural refactor]
- **Copies:** `V2Variation.astro:43-57/592-680`, `about.astro:13-32/148-221`, `projects.astro:~307-330/1172-1243`, `dashboard-skill.astro:97-110/~530-540`
- **Drift:** only the home version has a 44px menu button.
- **Fix:** Extract a `SiteHeader.astro` with an `active` prop and one stylesheet. This touches every page, so schedule it separately from the polish batch.

**I-2i [P3] Dead CSS** [polish]
- **Where:**
  - `global.css:48-64, 83-96` (`variation-operator/conversational/minimal`; the detector's "Inter" hit lives here)
  - `V2Variation.astro:2041-2043` (`.v2-about-social-sep`)
  - `V2Variation.astro:1674-1676` (duplicate `padding-top`)
- **Fix:** Delete.

**I-3i [P2] `.impeccable.md` contradicts `DESIGN.md`** [owner decision]
- **Problem:** It specifies a dark theme, a lime `#C8F56E` accent and a grain overlay. Any agent reading it will design the wrong site.
- **Fix:** Delete it, or rewrite its "Aesthetic Direction" to point at `DESIGN.md`. Its Users / Brand Personality / Principles sections are still good and should move into a `PRODUCT.md`.

**I-4i [P3] Raw colors outside tokens** [polish]
- **Where and fix:**
  - `StudioFooter.astro:111, 263, 283` `#fff` → `var(--color-on-accent)`
  - `StudioFooter.astro:295` `#c0392b` → `var(--color-danger)`
  - `V2Variation.astro:2177` `#FFFFFF` → `var(--color-surface)`
  - `V2Variation.astro:2271` and `:2283` raw cream/white → `var(--white-a80)` / `var(--color-on-accent)`
- **Note:** The `#3f9b54` "LIVE" green in the hero art is decorative (Bucket B) and goes away with R-2.

---

## 3. Top redesign-level issues (owner decisions)

- **R-1. Type system:** retire the italic-accent headline and the DM Serif Display + Instrument Sans pairing. Three directions:
  - (A) **One grotesk, contrast through size and weight only.** Most modern; loses the editorial warmth.
  - (B) **A text serif used for reading** (long-form, quotes) **plus a sans for UI and headlines.** Warm and credible; slower to get right.
  - (C) **Sans plus the already-loaded JetBrains Mono for metadata and numbers.** Leans into "design engineer"; risks feeling dev-tool cold.
  - **Recommendation:** C, then verify candidate faces on Google Fonts and their licences before choosing.
  - **Interim, 10 minutes:** remove the `<em>` wrappers in the 9 headlines and the `… em { font-style: italic; color: accent }` rules. That is polish-sized, but it changes the look, so it needs a yes.
- **R-2. Hero:** replace the fake dashboard deck, its overture and the scroll lock with real evidence, such as one real project screenshot or the client logo row plus the strongest testimonial line. On phones, put the copy first.
- **R-3. Section rhythm:**
  - Drop the eyebrow-over-every-heading formula.
  - Let "Work" take the stage at full width with real screenshots.
  - Merge "We'll make a good team" and "How I work" into one section.
  - Vary spacing so the page has a peak and an ending, not six equal beats.
- **R-4. Work presentation:** desktop /projects is a one-at-a-time carousel with a flip card, auto-scroll and an idling arrow, so 5 of 6 flagship projects are hidden. Below it is a generic 3-up card grid. An index (one row per project: name, outcome, type, link) with screenshots revealed on open would show all the work at once and remove most of the carousel code.
- **R-5. Copy voice:** rewrite the slogan headlines and stock micro-copy (C-7) in first-call voice. Decide on the single traction number (C-2) and the contact-failure fallback (C-1).

---

## 4. Personas

- **Jordan (first-time founder, landing from a link):**
  - On a phone, sees a mock dashboard and a grey label before learning what Mohit does.
  - "Book a call" is below the fold.
  - "Agentic Workflow" and "AI-as-judge" mean nothing to them.
  - The star rating looks borrowed.
- **Casey (one-handed phone):**
  - The page wobbles sideways (412px wide), the menu button is half off-screen and only 38×24 on inner pages.
  - The carousel dots are 7px.
  - The tiny 10px pills wrap.
- **Sam (keyboard / screen reader):**
  - No skip link and no main landmark.
  - Headings jump from level 1 to 4 on About.
  - Mobile project cards can't be activated, and the project sheet traps nothing and can't be escaped.
  - Lightboxes drop focus.
  - Grey labels fail contrast.
  - Reveal motion ignores the reduced-motion setting on 3 pages.

---

## 5. Already changed in the working tree during this audit (uncommitted, by another agent)

Do not redo these; verify them instead:
- shared mobile menu (`src/scripts/mobile-menu.ts`) with `aria-expanded`, Escape and outside-click
- 44px home menu button
- global `:focus-visible` ring and `scroll-margin-top` (`global.css:21-39`)
- smooth scroll gated on reduced motion
- in-page anchors move focus (`Layout.astro:169-184`)
- Agentation widget dev-only
- hero entrance ends early on scroll, tap or key
- testimonial accordion on grid-rows, with a keyboard-operable preview
- `.v2-reveal` `will-change` scoped to the waiting state
- contact-field focus ring (`StudioFooter.astro:230-238`)
- the faux-300 serif weight fixed

Questions skipped: this run is a report-only sub-agent for an orchestrating agent, which will put the owner decisions (R-1 to R-5, C-1, C-2, I-3i) to the owner.
