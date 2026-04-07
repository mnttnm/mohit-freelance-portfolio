# Morph Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current show/hide page navigation with a morph transition between About and Work states on a single living surface.

**Architecture:** Single HTML file (freelance-site-v4.html). Dual-element approach for brand morph — brand text exists in hero and sticky header, cross-fading between them. Services and project list are sibling containers swapping visibility via CSS class on `<body>`. All state driven by a single `isWorkMode` boolean toggling a `.work-mode` class on body.

**Tech Stack:** Vanilla HTML, CSS transitions, vanilla JS. No build tools, no frameworks.

**Spec:** `docs/superpowers/specs/2026-03-23-morph-toggle-design.md`

**Source file:** `freelance-site-v4.html`

---

## File Map

- **Modify:** `freelance-site-v4.html` — all changes are in this single file (CSS, HTML, JS sections)

No new files. No test files (static HTML site with no test infrastructure).

---

### Task 1: Add Sticky Header with Split Label

**Files:**
- Modify: `freelance-site-v4.html` (CSS section + HTML section)

**What:** Add the sticky header bar containing the small brand name and the About/Work split label. It sits above the hero in the DOM but sticks to top on scroll.

- [ ] **Step 1: Add header CSS**

Add these styles after the existing `::selection` block (around line 44), before the hero styles:

```css
/* ════════════════════════════════════════════════
   STICKY HEADER — split label toggle
   ════════════════════════════════════════════════ */
.morph-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(28px, 5vw, 64px);
  background: rgba(244, 240, 232, 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--rule);
  opacity: 0;
  transform: translateY(-100%);
  transition: opacity 0.4s var(--ease-out), transform 0.4s var(--ease-out), background 0.4s var(--ease-out);
}

/* Header revealed when scrolled past hero OR in work mode */
.morph-header.revealed {
  opacity: 1;
  transform: translateY(0);
}

.morph-brand {
  font-family: var(--serif);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.02em;
  text-decoration: none;
  opacity: 0;
  transition: opacity 0.4s var(--ease-out);
}

.morph-label {
  display: flex;
  gap: 6px;
  align-items: center;
  font-family: var(--sans);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.morph-label-item {
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.3s;
  background: none;
  border: none;
  font: inherit;
  letter-spacing: inherit;
}

.morph-label-item.active {
  color: var(--ink);
}

.morph-label-item:not(.active) {
  color: var(--ink-muted);
}

.morph-label-item:not(.active):hover {
  color: var(--ink-secondary);
}

.morph-label-sep {
  color: var(--ink-faint);
  user-select: none;
}
```

- [ ] **Step 2: Add header HTML**

Insert this immediately after `<body>`, before the `<!-- ═══════════ LANDING ═══════════ -->` comment:

```html
<!-- ─── STICKY HEADER: morph toggle ─── -->
<header class="morph-header">
  <span class="morph-brand">Mohit Tater</span>
  <nav class="morph-label">
    <button class="morph-label-item active" data-mode="about" onclick="morphTo('about')">About</button>
    <span class="morph-label-sep">/</span>
    <button class="morph-label-item" data-mode="work" onclick="morphTo('work')">Work</button>
  </nav>
</header>
```

- [ ] **Step 3: Verify in browser**

Open `freelance-site-v4.html` in browser. The sticky header should be hidden (translated up off-screen). It will become visible later when JS reveals it on scroll past hero. The "About" label should be dark, "Work" should be muted. Clicking does nothing yet.

- [ ] **Step 4: Commit**

```bash
git add freelance-site-v4.html
git commit -m "Add sticky header with About/Work split label"
```

---

### Task 2: Add Project List HTML and CSS

**Files:**
- Modify: `freelance-site-v4.html` (CSS section + HTML section)

**What:** Add the project list markup and styles. It will be hidden by default (About state) and shown in Work state.

- [ ] **Step 1: Add project list CSS**

Add after the services CSS section (after the `.svc.vis` rule, around line 253):

```css
/* ════════════════════════════════════════════════
   PROJECT LIST — Work state content
   ════════════════════════════════════════════════ */
.projects {
  padding: clamp(56px, 8vw, 96px) clamp(28px, 5vw, 64px);
  opacity: 0;
  pointer-events: none;
  position: absolute;
  width: 100%;
  transition: opacity 0.45s var(--ease-out);
}

.projects-inner {
  max-width: 860px;
  margin: 0 auto;
}

.projects .sh {
  margin-bottom: 8px;
}

.projects .ss {
  margin-bottom: clamp(32px, 4.5vw, 52px);
}

.prj {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: baseline;
  padding: clamp(18px, 2.2vw, 26px) 0;
  border-top: 1px solid var(--rule);
  text-decoration: none;
  color: inherit;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.55s var(--ease-out), transform 0.55s var(--ease-out);
}

.prj:last-child { border-bottom: 1px solid var(--rule); }

.prj.vis {
  opacity: 1;
  transform: translateY(0);
}

.prj-type {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 3px;
}

.prj-type.accent {
  color: var(--accent);
}

.prj-name {
  font-family: var(--serif);
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  transition: color 0.2s;
}

.prj:hover .prj-name {
  color: var(--accent);
}

.prj-desc {
  font-size: 0.84rem;
  color: var(--ink-muted);
  line-height: 1.55;
  margin-top: 3px;
  max-width: 480px;
}

.prj-stat {
  font-family: var(--serif);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--accent);
  white-space: nowrap;
  transition: transform 0.25s var(--ease-out);
}

.prj:hover .prj-stat {
  transform: translateX(4px);
}
```

- [ ] **Step 2: Add responsive CSS for projects**

Add inside the existing `@media (max-width: 600px)` block:

```css
.prj {
  grid-template-columns: 1fr;
  gap: 4px;
}
.prj-stat { text-align: left; }
```

- [ ] **Step 3: Add project list HTML**

Insert this after the closing `</section>` of the services section (after `</div></section>` around line 543) and before the Final CTA section:

```html
<!-- ─── PROJECTS: Work state content ─── -->
<section class="projects">
  <div class="projects-inner">
    <h2 class="sh">Shipped & proven</h2>
    <p class="ss">Products, tools, and client work — built and launched.</p>

    <a href="https://mohit.stream" target="_blank" rel="noopener" class="prj">
      <div>
        <div class="prj-type accent">webapp</div>
        <div class="prj-name">learning.log</div>
        <p class="prj-desc">Public work journal documenting AI dev experiments and agentic patterns.</p>
      </div>
      <div class="prj-stat">★</div>
    </a>

    <a href="https://www.figma.com/community/plugin/1310888112326715990/figma-variable-explorer" target="_blank" rel="noopener" class="prj">
      <div>
        <div class="prj-type">plugin</div>
        <div class="prj-name">Figma Variable Explorer</div>
        <p class="prj-desc">Centralized viewer for design variables — list, JSON, and CSS formats.</p>
      </div>
      <div class="prj-stat">8K+</div>
    </a>

    <a href="https://www.raycast.com/tatermohit/note-in-google-doc" target="_blank" rel="noopener" class="prj">
      <div>
        <div class="prj-type">extension</div>
        <div class="prj-name">Notes in Google Docs</div>
        <p class="prj-desc">Capture quick notes from Raycast straight into Google Docs.</p>
      </div>
      <div class="prj-stat">1K+</div>
    </a>

    <a href="https://chromewebstore.google.com/detail/tab-triage/lldlagjikfofnnidnoegcmkolaibndof" target="_blank" rel="noopener" class="prj">
      <div>
        <div class="prj-type">extension</div>
        <div class="prj-name">Tab Triage</div>
        <p class="prj-desc">Chrome extension for tab management and organization.</p>
      </div>
      <div class="prj-stat">→</div>
    </a>

    <a href="https://medium.com/@tatermohit/i-built-a-business-co-pilot-using-claude-code-heres-the-exact-system-cfe32ee59558" target="_blank" rel="noopener" class="prj">
      <div>
        <div class="prj-type">blog</div>
        <div class="prj-name">Business Co-Pilot System</div>
        <p class="prj-desc">Step-by-step system for a personal business co-pilot with Claude Code.</p>
      </div>
      <div class="prj-stat">→</div>
    </a>

    <a href="https://btech-cs-career-guide-india-qq40xiy9w-tatermohit.vercel.app/" target="_blank" rel="noopener" class="prj">
      <div>
        <div class="prj-type">webapp</div>
        <div class="prj-name">BTech CS Career Guide</div>
        <p class="prj-desc">Career guide for Indian CS undergrads — built with deep research + Claude Code.</p>
      </div>
      <div class="prj-stat">→</div>
    </a>

    <a href="https://greetwood.myshopify.com/" target="_blank" rel="noopener" class="prj">
      <div>
        <div class="prj-type">ecommerce</div>
        <div class="prj-name">Greetwood</div>
        <p class="prj-desc">WordPress to Shopify migration using Shopify MCP/CLI and Claude Code.</p>
      </div>
      <div class="prj-stat">→</div>
    </a>

    <a href="https://getitright-ux.notion.site/featured-ux-audit" target="_blank" rel="noopener" class="prj">
      <div>
        <div class="prj-type">agency website</div>
        <div class="prj-name">GetItRight</div>
        <p class="prj-desc">UX audit agency — 20+ audits for 10+ SaaS startups, 3-5 day turnaround.</p>
      </div>
      <div class="prj-stat">→</div>
    </a>
  </div>
</section>
```

- [ ] **Step 4: Verify HTML structure**

Open in browser. The project list should NOT be visible (it has `opacity: 0; pointer-events: none`). Inspect DOM to confirm the `.projects` section exists between services and final-cta.

- [ ] **Step 5: Commit**

```bash
git add freelance-site-v4.html
git commit -m "Add project list HTML and CSS for Work state"
```

---

### Task 3: Implement Morph State Toggle (Core JS + CSS)

**Files:**
- Modify: `freelance-site-v4.html` (CSS section + JS section)

**What:** Add the `.work-mode` body class that drives all state changes, the `morphTo()` function, and the CSS transitions for the morph.

- [ ] **Step 1: Add morph state CSS**

Add these rules after the project list CSS (before the Final CTA section styles):

```css
/* ════════════════════════════════════════════════
   MORPH STATE — body.work-mode toggles everything
   ════════════════════════════════════════════════ */

/* Container for services + projects to share the same space */
.content-swap {
  position: relative;
}

/* Header: brand visible in work mode */
body.work-mode .morph-brand {
  opacity: 1;
}

/* Hero: collapse in work mode using max-height for smooth animation */
body.work-mode .hero {
  max-height: 0;
  min-height: 0;
  overflow: hidden;
  opacity: 0;
}

/* Services: hidden in work mode */
body.work-mode .services {
  opacity: 0;
  pointer-events: none;
  position: absolute;
  width: 100%;
}

/* Projects: visible in work mode */
body.work-mode .projects {
  opacity: 1;
  pointer-events: auto;
  position: relative;
}

/* Final CTA: hidden in work mode */
body.work-mode .final-cta {
  opacity: 0;
  pointer-events: none;
  height: 0;
  overflow: hidden;
  padding: 0;
  border: none;
  transition: opacity 0.3s var(--ease-out);
}

/* Transition timing for About state elements */
.hero {
  max-height: 100vh;
  transition: opacity 0.4s var(--ease-out), max-height 0.6s var(--ease-out), min-height 0.6s var(--ease-out);
}

.services {
  transition: opacity 0.4s var(--ease-out);
}

.final-cta {
  transition: opacity 0.3s var(--ease-out), height 0.5s var(--ease-out), padding 0.5s var(--ease-out);
}

/* Header: always revealed + opaque background in work mode */
body.work-mode .morph-header {
  opacity: 1;
  transform: translateY(0);
  background: rgba(244, 240, 232, 0.97);
}
```

- [ ] **Step 2: Wrap services + projects in a content-swap container**

In the HTML, wrap the `.services` section and the `.projects` section together:

```html
<div class="content-swap">
  <section class="services">...</section>
  <section class="projects">...</section>
</div>
```

- [ ] **Step 3: Add morph JS**

Replace the existing `<script>` block at the bottom with:

```javascript
// ═══════════ STATE ═══════════
var isWorkMode = false;
var isMorphing = false;
var morphCooldown = false;

// ═══════════ MORPH TOGGLE ═══════════
function morphTo(mode) {
  if (isMorphing) return;
  if (mode === 'work' && isWorkMode) return;
  if (mode === 'about' && !isWorkMode) return;

  isMorphing = true;
  isWorkMode = mode === 'work';

  // Update body class
  document.body.classList.toggle('work-mode', isWorkMode);

  // Update split label
  document.querySelectorAll('.morph-label-item').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Scroll to top
  window.scrollTo(0, 0);

  // Trigger project stagger animation in work mode
  if (isWorkMode) {
    setTimeout(function() {
      var prjs = document.querySelectorAll('.prj');
      prjs.forEach(function(el, i) {
        setTimeout(function() { el.classList.add('vis'); }, i * 80);
      });
    }, 300);
  } else {
    // Reset project visibility for next morph
    document.querySelectorAll('.prj').forEach(function(el) {
      el.classList.remove('vis');
    });
  }

  // Reveal header in work mode, or let hero observer control it in about mode
  if (isWorkMode) {
    document.querySelector('.morph-header').classList.add('revealed');
  }

  // Release morph lock after transitions complete
  setTimeout(function() {
    isMorphing = false;
  }, 700);
}

// ═══════════ SUBPAGE NAVIGATION (Background, Stack) ═══════════
// Track morph state before entering subpage so we can restore it
var preSubpageWorkMode = false;

function go(id) {
  preSubpageWorkMode = isWorkMode;
  document.getElementById('landing').style.display = 'none';
  document.querySelector('.morph-header').style.display = 'none';
  document.querySelectorAll('.subpage').forEach(function(p) { p.classList.remove('on'); });
  document.getElementById('p-' + id).classList.add('on');
  window.scrollTo(0, 0);
}

function back() {
  document.querySelectorAll('.subpage').forEach(function(p) { p.classList.remove('on'); });
  document.getElementById('landing').style.display = 'block';
  document.querySelector('.morph-header').style.display = 'flex';
  // Restore morph state (About or Work) from before entering subpage
  document.body.classList.toggle('work-mode', preSubpageWorkMode);
  if (preSubpageWorkMode) {
    document.querySelector('.morph-header').classList.add('revealed');
    // Re-trigger project stagger
    document.querySelectorAll('.prj').forEach(function(el, i) {
      setTimeout(function() { el.classList.add('vis'); }, i * 80);
    });
  }
  window.scrollTo(0, 0);
}

// ═══════════ SCROLL STAGGER — services ═══════════
var svcObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      var rows = document.querySelectorAll('.svc');
      var i = Array.prototype.indexOf.call(rows, entry.target);
      setTimeout(function() { entry.target.classList.add('vis'); }, i * 90);
      svcObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.svc').forEach(function(el) { svcObs.observe(el); });

// ═══════════ HEADER SCROLL-REVEAL (About state only) ═══════════
// In About state, reveal header when user scrolls past the hero
var heroEl = document.querySelector('.hero');
var headerEl = document.querySelector('.morph-header');
var heroObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    // When hero is NOT intersecting (scrolled past), reveal header
    // In work mode, header is always revealed (handled in morphTo)
    if (!isWorkMode) {
      headerEl.classList.toggle('revealed', !entry.isIntersecting);
    }
  });
}, { threshold: 0 });

if (heroEl) heroObs.observe(heroEl);
```

- [ ] **Step 4: Verify morph works**

Open in browser. Click "Work" in the split label — hero should collapse, services should hide, project list should appear with stagger animation, brand name should appear in header. Click "About" — everything reverses.

- [ ] **Step 5: Commit**

```bash
git add freelance-site-v4.html
git commit -m "Implement morph state toggle between About and Work"
```

---

### Task 4: Add Scroll-to-Morph Trigger

**Files:**
- Modify: `freelance-site-v4.html` (HTML + JS sections)

**What:** Add the scroll-past-footer trigger with cooldown guard and the "keep scrolling" hint.

- [ ] **Step 1: Add scroll hint CSS**

Add after the morph state CSS:

```css
/* ════════════════════════════════════════════════
   SCROLL HINT — "keep scrolling" near footer
   ════════════════════════════════════════════════ */
.scroll-hint {
  text-align: center;
  padding: 20px 0 0;
  opacity: 0.4;
  transition: opacity 0.3s;
}

.scroll-hint:hover {
  opacity: 0.6;
}

.scroll-hint-text {
  font-size: 0.72rem;
  color: var(--ink-muted);
  font-weight: 500;
  letter-spacing: 0.04em;
}

.scroll-hint-arrow {
  display: block;
  font-size: 0.9rem;
  color: var(--ink-faint);
  margin-top: 2px;
  animation: bobDown 2s var(--ease-out) infinite;
}

@keyframes bobDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}
```

- [ ] **Step 2: Add scroll hint HTML and sentinel**

Insert just before the `<footer class="foot">`:

```html
<!-- ─── SCROLL HINT + SENTINEL ─── -->
<div class="scroll-hint">
  <span class="scroll-hint-text">keep scrolling</span>
  <span class="scroll-hint-arrow">↓</span>
</div>
<div id="morph-sentinel" style="height:1px;"></div>
```

- [ ] **Step 3: Add scroll-to-morph JS**

Add at the end of the script block, after the svcObs code:

```javascript
// ═══════════ SCROLL-TO-MORPH ═══════════
var sentinel = document.getElementById('morph-sentinel');
var lastScrollY = window.scrollY;

// Track scroll direction
window.addEventListener('scroll', function() {
  lastScrollY = window.scrollY;
}, { passive: true });

var scrollMorphObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    // Only trigger when sentinel enters from above (user scrolling down)
    // entry.boundingClientRect.top <= 0 means it scrolled past the viewport top
    // But for a bottom sentinel, we check it's near bottom of viewport
    var isScrollingDown = entry.boundingClientRect.top < window.innerHeight;
    if (entry.isIntersecting && isScrollingDown && !isMorphing && !morphCooldown) {
      morphCooldown = true;
      morphTo(isWorkMode ? 'about' : 'work');
      setTimeout(function() { morphCooldown = false; }, 1500);
    }
  });
}, { threshold: 1.0 });

if (sentinel) scrollMorphObs.observe(sentinel);
```

- [ ] **Step 4: Verify scroll trigger**

Open in browser. Scroll all the way past the footer — the page should morph to Work state and scroll to top. Wait 1.5s, scroll past footer again — should morph back to About. Rapid scrolling should NOT cause double-morphs.

- [ ] **Step 5: Commit**

```bash
git add freelance-site-v4.html
git commit -m "Add scroll-to-morph trigger with cooldown guard"
```

---

### Task 5: Clean Up Legacy Subpages and Footer

**Files:**
- Modify: `freelance-site-v4.html` (HTML section)

**What:** Remove the old `#p-work` subpage (now replaced by morph), remove "Work" from footer links, keep Background and Stack subpages.

- [ ] **Step 1: Remove the `#p-work` subpage div**

Delete the entire `<div class="subpage" id="p-work">...</div>` block (the old work subpage from lines ~572-597).

- [ ] **Step 2: Update footer links**

Change the "Work" footer link from opening a subpage to triggering the morph toggle. Change:

```html
<a href="#" onclick="go('work');return false">Work</a>
```

To:

```html
<a href="#" onclick="morphTo('work');return false">Work</a>
```

- [ ] **Step 3: Verify subpages still work**

Open in browser. Click "Background" in footer — should show the Background subpage. Click "← Back" — should return to landing. Same for "Stack". The Work toggle in the header should still work independently.

- [ ] **Step 4: Commit**

```bash
git add freelance-site-v4.html
git commit -m "Remove legacy work subpage, clean up footer nav"
```

---

### Task 6: Add prefers-reduced-motion Support

**Files:**
- Modify: `freelance-site-v4.html` (CSS section)

**What:** Ensure the morph respects reduced motion preferences — instant state swap with no transitions.

- [ ] **Step 1: Update the existing `prefers-reduced-motion` media query**

Replace the existing `@media (prefers-reduced-motion: reduce)` block with:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .scroll-hint-arrow {
    animation: none;
  }
}
```

- [ ] **Step 2: Verify with dev tools**

In browser dev tools, enable "Prefer reduced motion" in Rendering panel. Toggle between About/Work — state should swap instantly with no visible animation.

- [ ] **Step 3: Commit**

```bash
git add freelance-site-v4.html
git commit -m "Ensure morph respects prefers-reduced-motion"
```

---

### Task 7: Final Visual Polish and Browser Test

**Files:**
- Modify: `freelance-site-v4.html` (minor CSS tweaks)

**What:** Verify the full flow, fix spacing issues, test edge cases.

- [ ] **Step 1: Test complete flow**

Open in browser and verify:
1. Page loads in About state — hero, services, CTA all visible
2. Sticky header is hidden while hero is in viewport
3. Scroll down past hero — sticky header slides in with About/Work label
4. Click "Work" — morph to Work state is smooth
4. Project list staggers in with 80ms delay between items
5. learning.log has accent-colored type tag and star marker
6. Click any project — opens URL in new tab
7. Click "About" — morph back, hero and services return
8. Scroll to bottom — "keep scrolling" hint visible
9. Scroll past sentinel — auto-morphs to other state
10. Rapid scroll does not cause double-morph
11. Footer "Background" and "Stack" links still work
12. "← Back" from subpages returns correctly
13. Header hides when viewing Background/Stack subpages
14. Navigate to subpage while in Work mode, click Back — returns to Work mode correctly
15. Footer "Work" link triggers morph (not subpage navigation)

- [ ] **Step 2: Test mobile (600px)**

Resize browser to 600px width. Verify:
1. Split label still fits in header
2. Project list collapses to single column
3. Services still collapse correctly
4. Morph transitions work on narrow viewport

- [ ] **Step 3: Fix any spacing/alignment issues found**

Adjust padding, margins, or transition timing as needed based on visual review.

- [ ] **Step 4: Final commit**

```bash
git add freelance-site-v4.html
git commit -m "Polish morph toggle transitions and responsive layout"
```
