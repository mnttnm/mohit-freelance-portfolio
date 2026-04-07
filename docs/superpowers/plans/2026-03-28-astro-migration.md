# Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the original `freelance-site.html` portfolio to an Astro static site with component-first architecture, archive v2/v4, and deploy to Vercel.

**Architecture:** Component-first Astro project. The monolithic HTML file is split into a Layout (shell + global styles + client JS) and 8 section components. Global CSS (custom properties, reset, animations) lives in `src/styles/global.css`. Each component has scoped styles. Zero-JS default — only an IntersectionObserver script and smooth scroll handler ship to the browser.

**Tech Stack:** Astro 5.x (stable), `@astrojs/vercel` adapter, static output, vanilla CSS, vanilla JS

---

## File Structure

```text
├── archive/
│   ├── freelance-site-v2.html
│   └── freelance-site-v4.html
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── Stats.astro
│   │   ├── Services.astro
│   │   ├── Proof.astro
│   │   ├── Background.astro
│   │   ├── CTA.astro
│   │   └── Footer.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
├── public/
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

### Task 1: Archive v2 and v4

**Files:**

- Create: `archive/` directory
- Move: `freelance-site-v2.html` → `archive/freelance-site-v2.html`
- Move: `freelance-site-v4.html` → `archive/freelance-site-v4.html`

- [ ] **Step 1: Create archive directory and move files**

```bash
mkdir -p archive
git mv freelance-site-v2.html archive/freelance-site-v2.html
git mv freelance-site-v4.html archive/freelance-site-v4.html
```

- [ ] **Step 2: Verify files moved correctly**

```bash
ls archive/
```

Expected: `freelance-site-v2.html  freelance-site-v4.html`

- [ ] **Step 3: Commit**

```bash
git add archive/
git commit -m "Archive v2 and v4 site variants"
```

---

### Task 2: Scaffold Astro project

**Files:**

- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/pages/index.astro` (placeholder)

- [ ] **Step 1: Initialize Astro project**

Run from project root. Use the `--template minimal` flag to avoid interactive prompts. Install dependencies with npm.

```bash
npm create astro@latest . -- --template minimal --no-install --skip-houston
```

If it asks about overwriting, allow it — there's no existing package.json.

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

- [ ] **Step 3: Install Vercel adapter**

```bash
npm install @astrojs/vercel
```

- [ ] **Step 4: Configure Astro for static Vercel deployment**

Replace the contents of `astro.config.mjs` with:

```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  adapter: vercel(),
});
```

- [ ] **Step 5: Verify the dev server starts**

```bash
npx astro dev
```

Expected: Dev server starts on `http://localhost:4321` with the minimal template page.

Stop the server after confirming.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/
git commit -m "Scaffold Astro project with Vercel adapter"
```

---

### Task 3: Create global styles

**Files:**

- Create: `src/styles/global.css`

Extract the shared/global styles from `freelance-site.html` lines 8–623. This includes: CSS custom properties, reset, body styles, selection, noise overlay, container, section padding, button styles (shared across components), divider, animations, reveal system, and responsive base overrides.

- [ ] **Step 1: Create `src/styles/global.css`**

```css
:root {
  --bg: #0C0C0E;
  --bg-elevated: #141418;
  --bg-card: #1A1A1F;
  --border: rgba(255,255,255,0.06);
  --border-hover: rgba(255,255,255,0.12);
  --text-primary: #F0EDE6;
  --text-secondary: #8A8A8E;
  --text-muted: #5A5A5E;
  --accent: #C8F56E;
  --accent-dim: rgba(200,245,110,0.08);
  --accent-mid: rgba(200,245,110,0.15);
  --warm: #E8C4A0;
  --serif: 'DM Serif Display', Georgia, serif;
  --sans: 'Instrument Sans', -apple-system, sans-serif;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html {
  scroll-behavior: smooth;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--sans);
  line-height: 1.6;
  overflow-x: hidden;
}

::selection {
  background: var(--accent);
  color: var(--bg);
}

/* Noise Overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
}

/* Layout */
.container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 32px;
}

section { padding: 100px 0; }

/* Shared Button Styles */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent);
  color: var(--bg);
  padding: 14px 32px;
  border-radius: 100px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: transform 0.2s var(--ease-out), box-shadow 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(200,245,110,0.2);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  padding: 14px 24px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  border: 1px solid var(--border);
  border-radius: 100px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
}

/* Section Headers (shared across Services, Proof, CTA) */
.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 16px;
}

.section-title {
  font-family: var(--serif);
  font-size: clamp(2rem, 4vw, 2.8rem);
  letter-spacing: -0.02em;
  margin-bottom: 20px;
  line-height: 1.15;
}

.section-desc {
  color: var(--text-secondary);
  font-size: 1.05rem;
  max-width: 540px;
  line-height: 1.7;
  margin-bottom: 56px;
}

/* Divider */
.divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 0;
}

/* Animations */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive Base */
@media (max-width: 768px) {
  section { padding: 72px 0; }
}

@media (max-width: 480px) {
  .container { padding: 0 20px; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "Add global styles extracted from original HTML"
```

---

### Task 4: Create Layout component

**Files:**

- Create: `src/layouts/Layout.astro`

The Layout wraps every page with `<html>`, `<head>`, font imports, global CSS import, and the client-side scripts (IntersectionObserver + smooth scroll).

- [ ] **Step 1: Create `src/layouts/Layout.astro`**

```astro
---
interface Props {
  title: string;
}

const { title } = Astro.props;
import '../styles/global.css';
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <slot />

    <script>
      // Intersection Observer for reveal animations
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -60px 0px',
        }
      );

      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

      // Smooth nav scroll
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const href = this.getAttribute('href');
          if (href) {
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      });
    </script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "Add Layout component with fonts, global CSS, and client scripts"
```

---

### Task 5: Create Header component

**Files:**

- Create: `src/components/Header.astro`

The fixed navigation bar with brand, links, and CTA button.

- [ ] **Step 1: Create `src/components/Header.astro`**

```astro
<nav>
  <div class="container">
    <a href="#" class="nav-brand">Mohit Tater</a>
    <ul class="nav-links">
      <li><a href="#services">Services</a></li>
      <li><a href="#work">Work</a></li>
      <li><a href="#background">Background</a></li>
      <li><a href="#contact" class="nav-cta">Let's Talk</a></li>
    </ul>
  </div>
</nav>

<style>
  nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 20px 0;
    background: rgba(12, 12, 14, 0.8);
    backdrop-filter: blur(20px) saturate(1.4);
    border-bottom: 1px solid var(--border);
    transition: all 0.4s var(--ease-out);
  }

  nav .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-brand {
    font-family: var(--serif);
    font-size: 1.2rem;
    color: var(--text-primary);
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  .nav-links {
    display: flex;
    gap: 32px;
    align-items: center;
    list-style: none;
  }

  .nav-links a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    transition: color 0.2s;
  }

  .nav-links a:hover {
    color: var(--text-primary);
  }

  .nav-cta {
    background: var(--accent) !important;
    color: var(--bg) !important;
    padding: 8px 20px;
    border-radius: 100px;
    font-weight: 600 !important;
    transition: transform 0.2s var(--ease-out), box-shadow 0.2s !important;
  }

  .nav-cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(200, 245, 110, 0.25);
  }

  @media (max-width: 768px) {
    .nav-links {
      display: none;
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.astro
git commit -m "Add Header component with fixed nav"
```

---

### Task 6: Create Hero component

**Files:**

- Create: `src/components/Hero.astro`

Hero section with availability eyebrow, heading, description, and action buttons.

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
<section class="hero">
  <div class="container">
    <div class="hero-eyebrow">Available for Q2 2026</div>
    <h1>I help teams build <em>smarter products</em> with AI&nbsp;&&nbsp;design</h1>
    <p class="hero-desc">
      AI Product Consultant & Design Engineer with 10+ years bridging UX,
      frontend development, and AI integration. I don't just advise — I design,
      build, and ship.
    </p>
    <div class="hero-actions">
      <a href="mailto:mohittater.iiita@gmail.com" class="btn-primary"
        >Start a conversation →</a
      >
      <a href="#services" class="btn-secondary">See services</a>
    </div>
  </div>
</section>

<style>
  .hero {
    padding: 180px 0 120px;
    position: relative;
  }

  .hero::after {
    content: '';
    position: absolute;
    top: 80px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(
      circle,
      rgba(200, 245, 110, 0.04) 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  .hero-eyebrow {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
    animation: fadeUp 0.8s var(--ease-out) 0.1s forwards;
  }

  .hero-eyebrow::before {
    content: '';
    width: 32px;
    height: 1px;
    background: var(--accent);
  }

  .hero h1 {
    font-family: var(--serif);
    font-size: clamp(2.8rem, 6vw, 5rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin-bottom: 32px;
    max-width: 800px;
    opacity: 0;
    animation: fadeUp 0.8s var(--ease-out) 0.2s forwards;
  }

  .hero h1 em {
    font-style: italic;
    color: var(--accent);
  }

  .hero-desc {
    font-size: 1.15rem;
    color: var(--text-secondary);
    line-height: 1.7;
    max-width: 560px;
    margin-bottom: 48px;
    opacity: 0;
    animation: fadeUp 0.8s var(--ease-out) 0.35s forwards;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    opacity: 0;
    animation: fadeUp 0.8s var(--ease-out) 0.5s forwards;
  }

  @media (max-width: 768px) {
    .hero {
      padding: 140px 0 80px;
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Hero.astro
git commit -m "Add Hero component"
```

---

### Task 7: Create Stats component

**Files:**

- Create: `src/components/Stats.astro`

The 4-metric stats bar. Note the original has `style="padding-top: 0; padding-bottom: 100px;"` on its wrapping section — we preserve that inline.

- [ ] **Step 1: Create `src/components/Stats.astro`**

```astro
<section style="padding-top: 0; padding-bottom: 100px;">
  <div class="container">
    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-number">10+</div>
        <div class="stat-label">Years Experience</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">5,000+</div>
        <div class="stat-label">Plugin Users</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">UX × Dev</div>
        <div class="stat-label">Hybrid Practice</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">AI-Native</div>
        <div class="stat-label">Workflow</div>
      </div>
    </div>
  </div>
</section>

<style>
  .stats-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    opacity: 0;
    animation: fadeUp 0.8s var(--ease-out) 0.6s forwards;
  }

  .stat-item {
    background: var(--bg-elevated);
    padding: 32px;
    text-align: center;
  }

  .stat-number {
    font-family: var(--serif);
    font-size: 2rem;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .stat-label {
    font-size: 0.78rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 4px;
  }

  @media (max-width: 768px) {
    .stats-bar {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .stats-bar {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Stats.astro
git commit -m "Add Stats component"
```

---

### Task 8: Create Services component

**Files:**

- Create: `src/components/Services.astro`

The 6-card services grid with section header.

- [ ] **Step 1: Create `src/components/Services.astro`**

```astro
<section id="services">
  <div class="container">
    <div class="section-label reveal">What I do</div>
    <h2 class="section-title reveal">
      Services built around outcomes, not hours
    </h2>
    <p class="section-desc reveal">
      Project-based engagements designed to move fast. Each service is scoped to
      deliver measurable value in 2–6 weeks.
    </p>
    <div class="services-grid reveal">
      <div class="service-card">
        <div class="service-price">From $4K</div>
        <div class="service-icon">🔍</div>
        <h3>AI Product Evaluation & Strategy</h3>
        <p>
          Audit your AI features, identify failure modes, and build an evaluation
          framework. You'll know exactly what's working, what's not, and what to
          fix first.
        </p>
        <div class="service-tags">
          <span class="tag">AI Audit</span>
          <span class="tag">Eval Framework</span>
          <span class="tag">Product Strategy</span>
        </div>
      </div>

      <div class="service-card">
        <div class="service-price">From $6K</div>
        <div class="service-icon">⚡</div>
        <h3>Rapid AI-Powered MVP</h3>
        <p>
          From concept to clickable product in two weeks. Full-stack development
          with AI integration, designed for validation and investor demos.
        </p>
        <div class="service-tags">
          <span class="tag">Next.js</span>
          <span class="tag">React</span>
          <span class="tag">AI Integration</span>
          <span class="tag">Vercel</span>
        </div>
      </div>

      <div class="service-card">
        <div class="service-price">From $3K</div>
        <div class="service-icon">🤖</div>
        <h3>AI Workflow Automation</h3>
        <p>
          Map your manual processes, identify automation opportunities, and build
          AI-powered workflows that cut repetitive work by up to 70%.
        </p>
        <div class="service-tags">
          <span class="tag">Claude</span>
          <span class="tag">Automation</span>
          <span class="tag">Agents</span>
          <span class="tag">n8n</span>
        </div>
      </div>

      <div class="service-card">
        <div class="service-icon">🎨</div>
        <div class="service-price">From $4K</div>
        <h3>Product & UX Design</h3>
        <p>
          User research, information architecture, wireframes, and interactive
          Figma prototypes — ready for stakeholder demos, usability testing, and
          dev handoff.
        </p>
        <div class="service-tags">
          <span class="tag">Figma</span>
          <span class="tag">Prototyping</span>
          <span class="tag">UX Research</span>
        </div>
      </div>

      <div class="service-card">
        <div class="service-icon">🛠️</div>
        <div class="service-price">Contact</div>
        <h3>Fullstack Development</h3>
        <p>
          Production-grade web applications built with React, Next.js, and
          TypeScript. Clean architecture, responsive design, and deployment on
          Vercel or your stack.
        </p>
        <div class="service-tags">
          <span class="tag">TypeScript</span>
          <span class="tag">React</span>
          <span class="tag">Tailwind</span>
          <span class="tag">Supabase</span>
        </div>
      </div>

      <div
        class="service-card service-card--custom"
      >
        <h3>Need something custom?</h3>
        <p>Retainers, advisory, or compound engagements.</p>
        <a
          href="mailto:mohittater.iiita@gmail.com"
          class="btn-primary btn-primary--sm">Let's scope it →</a
        >
      </div>
    </div>
  </div>
</section>

<style>
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
  }

  .service-card {
    background: var(--bg-elevated);
    padding: 40px 36px;
    transition: background 0.3s;
    position: relative;
  }

  .service-card:hover {
    background: var(--bg-card);
  }

  .service-card--custom {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 260px;
  }

  .service-card--custom h3 {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .service-card--custom p {
    margin-bottom: 24px;
    font-size: 0.88rem;
  }

  .btn-primary--sm {
    font-size: 0.85rem;
    padding: 10px 24px;
  }

  .service-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--accent-dim);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    font-size: 1.2rem;
  }

  .service-card h3 {
    font-family: var(--serif);
    font-size: 1.3rem;
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }

  .service-card p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.65;
    margin-bottom: 20px;
  }

  .service-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag {
    font-size: 0.72rem;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 100px;
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }

  .service-price {
    position: absolute;
    top: 36px;
    right: 36px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--warm);
  }

  @media (max-width: 768px) {
    .services-grid {
      grid-template-columns: 1fr;
    }

    .service-price {
      position: static;
      display: block;
      margin-bottom: 16px;
    }
  }
</style>
```

**Note:** The last card's inline styles are replaced with a `.service-card--custom` class and `.btn-primary--sm` modifier — minor polish to remove inline styles.

- [ ] **Step 2: Commit**

```bash
git add src/components/Services.astro
git commit -m "Add Services component"
```

---

### Task 9: Create Proof component

**Files:**

- Create: `src/components/Proof.astro`

The "Shipped & proven" section with 3 outcome cards.

- [ ] **Step 1: Create `src/components/Proof.astro`**

```astro
<section id="work">
  <div class="container">
    <div class="section-label reveal">Shipped & proven</div>
    <h2 class="section-title reveal">Tools people actually use</h2>
    <p class="section-desc reveal">
      I build things and put them in front of real users. Here's what's out in
      the world.
    </p>
    <div class="proof-grid reveal">
      <div class="proof-card">
        <div class="proof-metric">5K+</div>
        <div class="proof-title">Figma Variable Explorer</div>
        <p class="proof-desc">
          A Figma plugin for exploring and managing design tokens and variables.
          Used by thousands of designers across the Figma community.
        </p>
      </div>
      <div class="proof-card">
        <div class="proof-metric">250+</div>
        <div class="proof-title">Raycast Notes Extension</div>
        <p class="proof-desc">
          A keyboard-first note-taking extension for Raycast. Built for speed —
          capture thoughts without leaving your workflow.
        </p>
      </div>
      <div class="proof-card">
        <div class="proof-metric">∞</div>
        <div class="proof-title">Client Work</div>
        <p class="proof-desc">
          React/Next.js migrations, AI-powered content tools, DAM interface
          design, SDR automation systems, and agentic workflow consulting.
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .proof-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .proof-card {
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 36px;
    background: var(--bg-elevated);
    transition: border-color 0.3s, transform 0.3s var(--ease-out);
  }

  .proof-card:hover {
    border-color: var(--border-hover);
    transform: translateY(-2px);
  }

  .proof-metric {
    font-family: var(--serif);
    font-size: 2.4rem;
    color: var(--accent);
    letter-spacing: -0.02em;
  }

  .proof-title {
    font-weight: 600;
    font-size: 1rem;
    margin: 8px 0 8px;
  }

  .proof-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .proof-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Proof.astro
git commit -m "Add Proof component"
```

---

### Task 10: Create Background component

**Files:**

- Create: `src/components/Background.astro`

Two-column layout: experience timeline on the left, toolkit on the right. The original uses inline styles for the toolkit category labels — we replace those with a `.stack-category` class as minor polish.

- [ ] **Step 1: Create `src/components/Background.astro`**

```astro
<section id="background">
  <div class="container">
    <div class="two-col reveal">
      <div>
        <div class="section-label">Background</div>
        <h2 class="section-title">Where I've been</h2>
        <div class="experience-track">
          <div class="exp-item">
            <div class="exp-period">2024 — Present</div>
            <div class="exp-role">Freelance Consultant</div>
            <div class="exp-company">AI Product & Design Engineering</div>
            <div class="exp-desc">
              UX design, frontend development, and AI product consulting for
              startups and growth-stage companies. Project-based and retainer
              engagements.
            </div>
          </div>
          <div class="exp-item">
            <div class="exp-period">Previously</div>
            <div class="exp-role">Senior Software Developer</div>
            <div class="exp-company">BlueJeans by Verizon</div>
            <div class="exp-desc">
              Frontend engineering on enterprise video conferencing products at
              scale.
            </div>
          </div>
          <div class="exp-item">
            <div class="exp-period">Previously</div>
            <div class="exp-role">PM + Developer (Dual Role)</div>
            <div class="exp-company">Query.ai</div>
            <div class="exp-desc">
              Rare hybrid role spanning product management and hands-on
              development for a security product.
            </div>
          </div>
          <div class="exp-item">
            <div class="exp-period">Previously</div>
            <div class="exp-role">UX Engineer</div>
            <div class="exp-company">GoodCode</div>
            <div class="exp-desc">
              Client-facing discovery with CPOs and CTOs. Translating business
              needs into product experiences.
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="section-label">Toolkit</div>
        <h2 class="section-title" style="margin-bottom: 32px;">
          What I work with
        </h2>
        <div class="stack-group">
          <p class="stack-category">Design</p>
          <div class="stack-cloud">
            <span class="stack-chip">Figma</span>
            <span class="stack-chip">Prototyping</span>
            <span class="stack-chip">Design Systems</span>
            <span class="stack-chip">User Research</span>
            <span class="stack-chip">Information Architecture</span>
          </div>
        </div>
        <div class="stack-group">
          <p class="stack-category">Engineering</p>
          <div class="stack-cloud">
            <span class="stack-chip">React</span>
            <span class="stack-chip">Next.js</span>
            <span class="stack-chip">TypeScript</span>
            <span class="stack-chip">Tailwind CSS</span>
            <span class="stack-chip">Vercel</span>
            <span class="stack-chip">Supabase</span>
            <span class="stack-chip">Node.js</span>
          </div>
        </div>
        <div class="stack-group">
          <p class="stack-category">AI & Automation</p>
          <div class="stack-cloud">
            <span class="stack-chip">Claude</span>
            <span class="stack-chip">Vercel AI SDK</span>
            <span class="stack-chip">Agentic Workflows</span>
            <span class="stack-chip">n8n</span>
            <span class="stack-chip">Prompt Engineering</span>
            <span class="stack-chip">LLM Evaluation</span>
          </div>
        </div>
        <div class="stack-group stack-group--last">
          <p class="stack-category">Methodology</p>
          <div class="stack-cloud">
            <span class="stack-chip">Compound Engineering</span>
            <span class="stack-chip">Skill Files</span>
            <span class="stack-chip">CLAUDE.md</span>
            <span class="stack-chip">Build in Public</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: start;
  }

  /* Experience Timeline */
  .experience-track {
    position: relative;
    padding-left: 36px;
    border-left: 1px solid var(--border);
    margin-top: 40px;
  }

  .exp-item {
    position: relative;
    padding-bottom: 48px;
  }

  .exp-item:last-child {
    padding-bottom: 0;
  }

  .exp-item::before {
    content: '';
    position: absolute;
    left: -40px;
    top: 6px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--bg);
  }

  .exp-period {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }

  .exp-role {
    font-family: var(--serif);
    font-size: 1.2rem;
    margin-bottom: 4px;
  }

  .exp-company {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 8px;
  }

  .exp-desc {
    color: var(--text-muted);
    font-size: 0.85rem;
    line-height: 1.6;
    max-width: 480px;
  }

  /* Stack / Toolkit */
  .stack-group {
    margin-bottom: 36px;
  }

  .stack-group--last {
    margin-bottom: 0;
  }

  .stack-category {
    font-size: 0.78rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
    font-weight: 600;
  }

  .stack-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .stack-chip {
    padding: 8px 18px;
    border: 1px solid var(--border);
    border-radius: 100px;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .stack-chip:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-dim);
  }

  @media (max-width: 768px) {
    .two-col {
      grid-template-columns: 1fr;
      gap: 48px;
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Background.astro
git commit -m "Add Background component with experience timeline and toolkit"
```

---

### Task 11: Create CTA component

**Files:**

- Create: `src/components/CTA.astro`

Call-to-action section with heading, email link, and social links.

- [ ] **Step 1: Create `src/components/CTA.astro`**

```astro
<section class="cta-section" id="contact">
  <div class="container">
    <div class="section-label reveal">Get in touch</div>
    <h2 class="section-title reveal">
      Let's build something <br />worth shipping
    </h2>
    <p class="section-desc reveal">
      Whether you need an AI strategy, a working prototype, or a
      design-engineering partner — I'd love to hear what you're working on.
    </p>
    <div class="reveal">
      <a
        href="mailto:mohittater.iiita@gmail.com"
        class="btn-primary btn-primary--lg"
        >mohittater.iiita@gmail.com →</a
      >
    </div>
    <div class="social-links reveal">
      <a href="https://twitter.com/tatermohit" target="_blank">↗ Twitter/X</a>
      <a href="https://linkedin.com/in/tatermohit" target="_blank"
        >↗ LinkedIn</a
      >
      <a href="https://github.com/mnttnm" target="_blank">↗ GitHub</a>
    </div>
  </div>
</section>

<style>
  .cta-section {
    text-align: center;
    padding: 120px 0;
    position: relative;
  }

  .cta-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 400px;
    background: radial-gradient(
      ellipse,
      rgba(200, 245, 110, 0.05) 0%,
      transparent 60%
    );
    pointer-events: none;
  }

  .cta-section .section-title {
    max-width: 600px;
    margin: 0 auto 16px;
  }

  .cta-section .section-desc {
    max-width: 480px;
    margin: 0 auto 48px;
  }

  .btn-primary--lg {
    font-size: 1.05rem;
    padding: 16px 40px;
  }

  .social-links {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 40px;
  }

  .social-links a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.82rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .social-links a:hover {
    color: var(--text-primary);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CTA.astro
git commit -m "Add CTA component"
```

---

### Task 12: Create Footer component

**Files:**

- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create `src/components/Footer.astro`**

```astro
<footer>
  <div class="container">
    <p>© 2026 Mohit Tater · Bengaluru, India · IIIT-Allahabad</p>
  </div>
</footer>

<style>
  footer {
    border-top: 1px solid var(--border);
    padding: 32px 0;
    text-align: center;
  }

  footer p {
    font-size: 0.78rem;
    color: var(--text-muted);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "Add Footer component"
```

---

### Task 13: Assemble index page

**Files:**

- Modify: `src/pages/index.astro`

Wire all components together into the final page.

- [ ] **Step 1: Replace `src/pages/index.astro` with the assembled page**

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import Stats from '../components/Stats.astro';
import Services from '../components/Services.astro';
import Proof from '../components/Proof.astro';
import Background from '../components/Background.astro';
import CTA from '../components/CTA.astro';
import Footer from '../components/Footer.astro';
---

<Layout title="Mohit Tater — AI Product Consultant & Design Engineer">
  <Header />
  <Hero />
  <Stats />
  <hr class="divider" />
  <Services />
  <hr class="divider" />
  <Proof />
  <hr class="divider" />
  <Background />
  <hr class="divider" />
  <CTA />
  <Footer />
</Layout>
```

- [ ] **Step 2: Run the dev server and visually verify**

```bash
npx astro dev
```

Open `http://localhost:4321` in the browser. Compare against `freelance-site.html` opened directly — verify:
- All 8 sections render in order
- Dark theme and accent colors are correct
- Navigation links work (smooth scroll to anchors)
- Scroll-reveal animations fire on scroll
- Hover effects work on cards, buttons, chips
- Responsive at 768px and 480px breakpoints

- [ ] **Step 3: Run production build**

```bash
npx astro build
```

Expected: Build succeeds with output in `dist/`. No errors.

- [ ] **Step 4: Preview the production build**

```bash
npx astro preview
```

Open `http://localhost:4321` and verify the production build matches dev.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "Assemble index page from all components"
```

---

### Task 14: Update gitignore and clean up

**Files:**

- Modify: `.gitignore`

- [ ] **Step 1: Add Astro build artifacts to `.gitignore`**

Append these lines to `.gitignore`:

```text
# Astro
node_modules/
dist/
.astro/
```

- [ ] **Step 2: Verify the original HTML is still in repo**

The original `freelance-site.html` should remain at the root as a reference during migration. It can be removed in a future cleanup once the Astro version is confirmed deployed and working.

```bash
ls freelance-site.html
```

Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "Update gitignore for Astro build artifacts"
```

---

### Task 15: Visual verification and final build

**Files:** None (verification only)

- [ ] **Step 1: Run final production build**

```bash
npx astro build
```

Expected: Clean build, no warnings, output in `dist/`.

- [ ] **Step 2: Open both versions side by side**

Open `freelance-site.html` directly in browser and `http://localhost:4321` (via `npx astro preview`) side by side. Check:

- [ ] All sections present and in correct order
- [ ] Colors, typography, and spacing match
- [ ] Noise overlay visible
- [ ] Hero fade-up animations on page load
- [ ] Scroll-reveal animations on scroll
- [ ] Nav anchor links scroll smoothly
- [ ] Service card hover effects
- [ ] Proof card hover effects
- [ ] Stack chip hover effects
- [ ] Stats bar responsive at 768px (2 columns)
- [ ] Services grid responsive at 768px (single column)
- [ ] Nav links hidden on mobile
- [ ] CTA gradient glow visible

- [ ] **Step 3: Fix any visual discrepancies**

If any styles are missing or broken due to Astro scoping, move those styles from component `<style>` blocks to `global.css` or use the `:global()` selector in the component.

- [ ] **Step 4: Final commit if fixes were needed**

```bash
git add -A
git commit -m "Fix visual discrepancies from Astro migration"
```
