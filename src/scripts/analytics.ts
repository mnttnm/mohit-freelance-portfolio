/**
 * Lightweight engagement tracking for the portfolio.
 *
 * PostHog itself is initialised in `components/PostHog.astro`, which also sets
 * `window.posthog`. This module adds intent-focused custom events on top of
 * PostHog's automatic pageview + autocapture:
 *   - section_viewed       (scroll depth into key sections)
 *   - cta_clicked          ("Let's talk" / "Book a call" / email)
 *   - outbound_link_clicked (social / external links)
 *
 * Project- and form-specific events are fired from their own component scripts
 * (projects.astro, StudioFooter.astro) where the relevant state already lives.
 *
 * All capture calls are guarded — if PostHog is disabled (no key) or blocked,
 * `window.posthog?.capture` is simply a no-op.
 */

type Props = Record<string, unknown>;

/** Capture an event, always tagged with the current path. */
export function track(event: string, props: Props = {}): void {
  const ph = (window as any).posthog;
  ph?.capture?.(event, { page: window.location.pathname, ...props });
}

// Expose for sibling component scripts so they don't re-implement the helper.
(window as any).phTrack = track;

function detectNetwork(href: string): string | null {
  if (href.includes('linkedin.com')) return 'linkedin';
  if (href.includes('github.com')) return 'github';
  if (href.includes('twitter.com') || href.includes('x.com')) return 'twitter';
  if (href.includes('cal.com')) return 'cal';
  if (href.includes('mohit.stream')) return 'blog';
  return null;
}

/** section_viewed — fires once per section when it scrolls into view. */
function initSectionTracking(): void {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>('[data-ph-section]'),
  );
  if (!sections.length) return;

  const seen = new Set<string>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const name = (entry.target as HTMLElement).dataset.phSection;
        if (!name || seen.has(name)) continue;
        seen.add(name);
        track('section_viewed', { section: name });
        io.unobserve(entry.target);
      }
    },
    // threshold 0 + bottom margin so tall sections still trigger reliably
    { threshold: 0, rootMargin: '0px 0px -25% 0px' },
  );

  sections.forEach((s) => io.observe(s));
}

/** cta_clicked + outbound_link_clicked via a single delegated listener. */
function initClickTracking(): void {
  document.addEventListener(
    'click',
    (ev) => {
      const start = ev.target as HTMLElement | null;
      const el = start?.closest<HTMLElement>('a, button');
      if (!el) return;

      // 1. Explicitly tagged CTA wins.
      const taggedCta = el.dataset.phCta;
      if (taggedCta) {
        track('cta_clicked', {
          cta: taggedCta,
          location: el.dataset.phLocation ?? null,
        });
        return;
      }

      // 2. Tagged project link (demo / github) → project_engaged, not outbound.
      const phAction = el.dataset.phAction;
      if (phAction) {
        track('project_engaged', {
          project_id: el.dataset.phProject ?? null,
          action: phAction,
        });
        return;
      }

      if (!(el instanceof HTMLAnchorElement)) return;
      const href = el.getAttribute('href') ?? '';
      if (!href) return;

      // 3. Email.
      if (href.startsWith('mailto:')) {
        track('cta_clicked', { cta: 'email', location: el.dataset.phLocation ?? null });
        return;
      }

      // 4. Call booking.
      if (href.includes('cal.com')) {
        track('cta_clicked', { cta: 'book_call', location: el.dataset.phLocation ?? null });
        return;
      }

      // 5. Any other external link.
      const isExternal = /^https?:\/\//i.test(href) && !href.includes(window.location.host);
      if (isExternal) {
        track('outbound_link_clicked', {
          href,
          text: el.textContent?.trim().slice(0, 80) ?? '',
          network: detectNetwork(href),
        });
      }
    },
    { capture: true },
  );
}

initSectionTracking();
initClickTracking();
