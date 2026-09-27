/**
 * Behaviour for the Work page (/projects).
 *
 * Every feature here is an enhancement: without JS the page is a complete,
 * readable document (all projects visible, first screenshot per case, links
 * work). Each init is independent and bails quietly if its markup is absent.
 */

type Props = Record<string, unknown>;

const root = document.querySelector<HTMLElement>('[data-work-page]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

function track(event: string, props: Props = {}) {
  (window as any).posthog?.capture?.(event, { page: location.pathname, ...props });
}

function smoothBehavior(): ScrollBehavior {
  return reduceMotion.matches ? 'auto' : 'smooth';
}

/* ---------------------------------------------------------------------------
   Mobile menu
   ------------------------------------------------------------------------- */
function initMenu(scope: HTMLElement) {
  const toggle = scope.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const nav = scope.querySelector<HTMLElement>('#site-nav');
  if (!toggle || !nav) return;

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () =>
    setOpen(toggle.getAttribute('aria-expanded') !== 'true'),
  );
  nav.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    const target = event.target as Node;
    if (nav.classList.contains('is-open') && !nav.contains(target) && !toggle.contains(target)) {
      setOpen(false);
    }
  });
}

/* ---------------------------------------------------------------------------
   Lens: filter every list by discipline. State mirrors ?lens=.
   ------------------------------------------------------------------------- */
type LensApi = { set: (lens: string, opts?: { silent?: boolean }) => void; isHidden: (id: string) => boolean };

function initLens(scope: HTMLElement): LensApi | null {
  const bar = scope.querySelector<HTMLElement>('[data-lens-bar]');
  if (!bar) return null;

  const buttons = Array.from(bar.querySelectorAll<HTMLButtonElement>('[data-lens]'));
  const items = Array.from(scope.querySelectorAll<HTMLElement>('[data-item]'));
  const cases = items.filter((el) => el.hasAttribute('data-case'));
  const rows = items.filter((el) => !el.hasAttribute('data-case'));
  const frames = Array.from(scope.querySelectorAll<HTMLElement>('[data-frame]'));
  const railItems = Array.from(scope.querySelectorAll<HTMLElement>('[data-rail-item]'));
  const shippedCount = scope.querySelector<HTMLElement>('[data-rail-shipped-count]');
  const ledgerEmpty = scope.querySelector<HTMLElement>('[data-ledger-empty]');
  const statusVisual = bar.querySelector<HTMLElement>('[data-lens-status-visual]');
  const statusSr = bar.querySelector<HTMLElement>('[data-lens-status-sr]');
  const workSection = scope.querySelector<HTMLElement>('[data-work]');
  const valid = new Set(buttons.map((b) => b.dataset.lens));
  const labels = new Map(buttons.map((b) => [b.dataset.lens!, b.querySelector('span')?.textContent ?? '']));

  let current = 'all';

  const matches = (el: HTMLElement, lens: string) =>
    lens === 'all' || (el.dataset.disciplines ?? '').split(' ').includes(lens);

  const apply = (lens: string) => {
    current = lens;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lens === lens)));

    let caseCount = 0;
    let rowCount = 0;
    for (const el of cases) {
      const show = matches(el, lens);
      el.hidden = !show;
      if (show) caseCount += 1;
    }
    for (const el of rows) {
      const show = matches(el, lens);
      el.hidden = !show;
      if (show) rowCount += 1;
    }
    const visibleIds = new Set(items.filter((el) => !el.hidden).map((el) => el.id));
    frames.forEach((f) => f.classList.toggle('is-dimmed', !visibleIds.has(f.dataset.frame!)));
    railItems.forEach((li) => (li.hidden = !visibleIds.has(li.dataset.railItem!)));
    if (shippedCount) shippedCount.textContent = String(rowCount);
    if (ledgerEmpty) ledgerEmpty.hidden = rowCount > 0;

    const total = caseCount + rowCount;
    if (statusVisual) statusVisual.textContent = `${total} of ${items.length}`;
    if (statusSr) {
      statusSr.textContent =
        lens === 'all'
          ? `Showing all ${items.length} projects`
          : `Showing ${caseCount} case files and ${rowCount} smaller builds involving ${labels.get(lens)}`;
    }
    document.dispatchEvent(new CustomEvent('wk:lens', { detail: { lens } }));
  };

  const syncUrl = (lens: string) => {
    const url = new URL(location.href);
    if (lens === 'all') url.searchParams.delete('lens');
    else url.searchParams.set('lens', lens);
    history.replaceState(history.state, '', url);
  };

  const set: LensApi['set'] = (lens, opts = {}) => {
    if (!valid.has(lens) || lens === current) return;

    // If the filter bar is stuck (we're deep in the list), bring the top of
    // the results back into view so the change is visible, not off-screen.
    const needsScroll =
      !!workSection && workSection.getBoundingClientRect().top < 0 && !opts.silent;

    const run = () => {
      apply(lens);
      if (needsScroll) workSection!.scrollIntoView({ block: 'start', behavior: 'auto' });
    };

    const vt = (document as any).startViewTransition;
    if (!opts.silent && typeof vt === 'function' && !reduceMotion.matches) {
      vt.call(document, run);
    } else {
      run();
    }
    syncUrl(lens);
    if (!opts.silent) track('work_lens_changed', { lens });
  };

  buttons.forEach((b) => b.addEventListener('click', () => set(b.dataset.lens!)));
  scope.querySelectorAll('[data-lens-reset]').forEach((b) =>
    b.addEventListener('click', () => set('all')),
  );

  const initial = new URL(location.href).searchParams.get('lens');
  if (initial && valid.has(initial)) apply(initial);

  // "Stuck" styling for the sticky bar.
  const sentinel = scope.querySelector('[data-lens-sentinel]');
  if (sentinel) {
    // Stuck = the sentinel has scrolled up past the header line (not merely
    // below the fold). Compare against the root's top edge, not 0.
    new IntersectionObserver(
      ([entry]) => {
        const edge = entry.rootBounds?.top ?? 0;
        bar.classList.toggle('is-stuck', !entry.isIntersecting && entry.boundingClientRect.top <= edge);
      },
      { rootMargin: `-${64 + 1}px 0px 0px 0px` },
    ).observe(sentinel);
  }

  return {
    set,
    isHidden: (id) => {
      const el = document.getElementById(id);
      return !!el && el.hidden && el.hasAttribute('data-item');
    },
  };
}

/* Make sure an in-page link (or the landing hash) never points at something
   the lens has hidden. Runs in the capture phase, before Layout's smooth-scroll
   handler measures the target. */
function initHashGuard(lens: LensApi) {
  document.addEventListener(
    'click',
    (event) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.getAttribute('href')?.slice(1);
      if (id && lens.isHidden(decodeURIComponent(id))) lens.set('all', { silent: true });
    },
    { capture: true },
  );

  const landing = decodeURIComponent(location.hash.slice(1));
  if (landing && lens.isHidden(landing)) {
    lens.set('all', { silent: true });
    requestAnimationFrame(() => document.getElementById(landing)?.scrollIntoView({ block: 'start' }));
  }
}

/* ---------------------------------------------------------------------------
   Rail: which case file is in view.
   ------------------------------------------------------------------------- */
function initRail(scope: HTMLElement) {
  const track_ = scope.querySelector<HTMLElement>('[data-rail]');
  const indicator = scope.querySelector<HTMLElement>('[data-rail-indicator]');
  if (!track_ || !indicator) return;

  const links = new Map(
    Array.from(track_.querySelectorAll<HTMLElement>('[data-rail-item]')).map((li) => [
      li.dataset.railItem!,
      li.querySelector<HTMLAnchorElement>('a')!,
    ]),
  );
  const cases = Array.from(scope.querySelectorAll<HTMLElement>('[data-case]'));
  const viewed = new Set<string>();
  let activeId: string | null = null;

  const paint = () => {
    links.forEach((a, id) => {
      if (id === activeId) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    const link = activeId ? links.get(activeId) : null;
    if (!link || link.closest('li')!.hidden) {
      track_.classList.remove('has-active');
      return;
    }
    const base = track_.getBoundingClientRect().top;
    const box = link.getBoundingClientRect();
    indicator.style.setProperty('--rail-y', `${box.top - base}px`);
    indicator.style.setProperty('--rail-h', `${box.height}px`);
    track_.classList.add('has-active');
  };

  // A case is "active" while it crosses a line ~40% down the viewport.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          activeId = el.id;
          if (!viewed.has(el.id)) {
            viewed.add(el.id);
            track('project_viewed', { project_id: el.id, title: el.dataset.title ?? null });
          }
        } else if (activeId === el.id) {
          activeId = null;
        }
      }
      paint();
    },
    { rootMargin: '-40% 0px -59% 0px' },
  );
  cases.forEach((el) => observer.observe(el));
  document.addEventListener('wk:lens', () => requestAnimationFrame(paint));
  window.addEventListener('resize', paint, { passive: true });
}

/* ---------------------------------------------------------------------------
   Case viewers: numbered tabs crossfade between screenshots.
   ------------------------------------------------------------------------- */
function initViewers(scope: HTMLElement) {
  scope.querySelectorAll<HTMLElement>('[data-viewer]').forEach((viewer) => {
    const shots = Array.from(viewer.querySelectorAll<HTMLButtonElement>('[data-shot]'));
    const tabs = Array.from(viewer.querySelectorAll<HTMLButtonElement>('[data-shot-tab]'));
    if (tabs.length < 2) return;
    const caseId = viewer.closest<HTMLElement>('[data-case]')?.id;

    const show = (index: number, focusTab = false) => {
      shots.forEach((shot, j) => {
        const on = j === index;
        shot.classList.toggle('is-active', on);
        shot.inert = !on;
      });
      tabs.forEach((tab, j) => tab.setAttribute('aria-pressed', String(j === index)));
      if (focusTab) tabs[index].focus();
    };

    tabs.forEach((tab, j) => {
      tab.addEventListener('click', () => {
        show(j);
        track('screenshot_viewed', { project_id: caseId, index: j, source: 'tab' });
      });
      // Arrow keys move between a case's screenshots, like a segmented control.
      tab.addEventListener('keydown', (event) => {
        const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        show((j + step + tabs.length) % tabs.length, true);
      });
    });

    // Preload the other screenshots once the viewer is near, so switching is
    // instant instead of showing a half-loaded frame.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        shots.forEach((shot) => {
          const img = shot.querySelector('img');
          if (img) img.loading = 'eager';
        });
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(viewer);

    viewer.addEventListener('wk:show-shot', ((event: CustomEvent<number>) => show(event.detail)) as EventListener);
  });
}

/* ---------------------------------------------------------------------------
   Lightbox
   ------------------------------------------------------------------------- */
function initLightbox(scope: HTMLElement) {
  const dialog = scope.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const img = dialog.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const stage = dialog.querySelector<HTMLElement>('[data-lb-stage]')!;
  const projectEl = dialog.querySelector<HTMLElement>('[data-lb-project]')!;
  const captionEl = dialog.querySelector<HTMLElement>('[data-lb-caption]')!;
  const countEl = dialog.querySelector<HTMLElement>('[data-lb-count]')!;
  const nav = dialog.querySelector<HTMLElement>('[data-lb-nav]')!;

  let shots: HTMLButtonElement[] = [];
  let index = 0;
  let viewer: HTMLElement | null = null;
  let token = 0;

  const render = (direction: 0 | 1 | -1) => {
    const shot = shots[index];
    const preview = shot.querySelector('img');
    const full = shot.dataset.full!;
    const my = ++token;

    const swap = () => {
      img.classList.remove('is-leaving-next', 'is-leaving-prev');
      // Start from what's already decoded on the page; upgrade when sharp.
      img.src = preview?.currentSrc || full;
      img.alt = preview?.alt ?? '';
      captionEl.textContent = shot.dataset.caption ?? '';
      countEl.textContent = shots.length > 1 ? `${index + 1} / ${shots.length}` : '';
      stage.classList.add('is-loading');
      const hi = new Image();
      hi.decoding = 'async';
      hi.src = full;
      hi.decode()
        .catch(() => undefined)
        .then(() => {
          if (my !== token) return;
          if (hi.naturalWidth) img.src = full;
          stage.classList.remove('is-loading');
        });
    };

    if (direction && !reduceMotion.matches) {
      img.classList.add(direction > 0 ? 'is-leaving-next' : 'is-leaving-prev');
      window.setTimeout(swap, 120);
    } else {
      swap();
    }
  };

  const go = (step: 1 | -1) => {
    if (shots.length < 2) return;
    index = (index + step + shots.length) % shots.length;
    render(step);
  };

  const open = (shot: HTMLButtonElement) => {
    viewer = shot.closest<HTMLElement>('[data-viewer]');
    shots = viewer ? Array.from(viewer.querySelectorAll<HTMLButtonElement>('[data-shot]')) : [shot];
    index = Math.max(0, shots.indexOf(shot));
    const caseEl = shot.closest<HTMLElement>('[data-case]');
    projectEl.textContent = caseEl?.dataset.title ?? '';
    nav.hidden = shots.length < 2;
    render(0);
    dialog.showModal();
    track('screenshot_viewed', { project_id: caseEl?.id ?? null, index, source: 'lightbox' });
  };

  scope.querySelectorAll<HTMLButtonElement>('[data-shot]').forEach((shot) =>
    shot.addEventListener('click', () => open(shot)),
  );
  dialog.querySelector('[data-lb-prev]')?.addEventListener('click', () => go(-1));
  dialog.querySelector('[data-lb-next]')?.addEventListener('click', () => go(1));
  dialog.querySelector('[data-lb-close]')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') go(1);
    else if (event.key === 'ArrowLeft') go(-1);
  });
  // Click on the dimmed area (not the image or controls) closes.
  dialog.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target === dialog || target === stage || target.hasAttribute('data-lb-shell')) dialog.close();
  });
  // Leave the page's viewer on the screenshot you ended on, and hand focus to
  // it: the button that opened the dialog may now be inert.
  dialog.addEventListener('close', () => {
    if (!viewer) return;
    viewer.dispatchEvent(new CustomEvent('wk:show-shot', { detail: index }));
    shots[index]?.focus({ preventScroll: true });
  });

  // Swipe between screenshots on touch.
  let startX = 0;
  let startY = 0;
  stage.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
    startY = event.clientY;
  });
  stage.addEventListener('pointerup', (event) => {
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  });
}

/* ---------------------------------------------------------------------------
   "Discuss a project like this": carry the context into the contact form.
   ------------------------------------------------------------------------- */
function initDiscuss(scope: HTMLElement) {
  const message = document.querySelector<HTMLTextAreaElement>('#studio-message');
  if (!message) return;
  let autofilled = '';

  scope.querySelectorAll<HTMLAnchorElement>('[data-discuss]').forEach((link) => {
    link.addEventListener('click', () => {
      const text = link.dataset.discuss!;
      // Never overwrite something the visitor wrote themselves.
      if (!message.value.trim() || message.value === autofilled) {
        message.value = text;
        autofilled = text;
        message.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const focus = () => {
        message.focus({ preventScroll: true });
        message.setSelectionRange(message.value.length, message.value.length);
        message.classList.remove('wk-prefilled');
        void message.offsetWidth;
        message.classList.add('wk-prefilled');
        // Make sure the field itself is on screen once the scroll has settled.
        const box = message.getBoundingClientRect();
        if (box.bottom > window.innerHeight || box.top < 0) {
          message.scrollIntoView({ block: 'center', behavior: smoothBehavior() });
        }
      };
      if ('onscrollend' in window && !reduceMotion.matches) {
        let done = false;
        const once = () => {
          if (done) return;
          done = true;
          focus();
        };
        window.addEventListener('scrollend', once, { once: true });
        window.setTimeout(once, 1200);
      } else {
        window.setTimeout(focus, 50);
      }
    });
  });
}

/* ---------------------------------------------------------------------------
   Ledger: cursor-following preview (fine pointers only).
   ------------------------------------------------------------------------- */
function initLedgerPreview(scope: HTMLElement) {
  const ledger = scope.querySelector<HTMLElement>('#also-shipped');
  const preview = scope.querySelector<HTMLElement>('[data-led-preview]');
  const img = preview?.querySelector<HTMLImageElement>('img');
  if (!ledger || !preview || !img) return;

  let enabled = false;
  let raf = 0;
  let x = 0;
  let y = 0;
  let tx = 0;
  let ty = 0;
  let visible = false;
  let preloaded = false;

  const W = 360;
  const H = 225;

  const preload = () => {
    if (preloaded) return;
    preloaded = true;
    ledger.querySelectorAll<HTMLElement>('[data-preview]').forEach((el) => {
      const i = new Image();
      i.src = el.dataset.preview!;
    });
  };

  const tick = () => {
    // Critically-damped-ish follow; the tilt comes from horizontal velocity.
    const dx = tx - x;
    x += dx * 0.18;
    y += (ty - y) * 0.18;
    const tilt = Math.max(-6, Math.min(6, dx * 0.08));
    preview.style.setProperty('--x', `${x}px`);
    preview.style.setProperty('--y', `${y}px`);
    preview.style.setProperty('--r', `${tilt}deg`);
    if (visible || Math.abs(dx) > 0.5) raf = requestAnimationFrame(tick);
    else raf = 0;
  };

  const target = (event: PointerEvent) => {
    // Sit below-right of the cursor, flipping near the viewport edges.
    const gap = 24;
    let nx = event.clientX + gap;
    let ny = event.clientY + gap;
    if (nx + W > window.innerWidth - 16) nx = event.clientX - W - gap;
    if (ny + H > window.innerHeight - 16) ny = event.clientY - H - gap;
    tx = nx;
    ty = ny;
  };

  const onMove = (event: PointerEvent) => {
    target(event);
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const onOver = (event: PointerEvent) => {
    const link = (event.target as HTMLElement).closest<HTMLElement>('[data-preview]');
    if (!link) return;
    if (img.getAttribute('src') !== link.dataset.preview) img.src = link.dataset.preview!;
    if (!visible) {
      target(event);
      x = tx;
      y = ty;
      visible = true;
      preview.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(tick);
    }
  };

  const onLeaveList = () => {
    visible = false;
    preview.classList.remove('is-on');
  };

  const list = ledger.querySelector<HTMLElement>('[data-ledger]')!;

  const setEnabled = () => {
    const next = finePointer.matches && !reduceMotion.matches;
    if (next === enabled) return;
    enabled = next;
    ledger.classList.toggle('has-preview', enabled);
    if (enabled) {
      list.addEventListener('pointerenter', preload);
      list.addEventListener('pointerover', onOver);
      list.addEventListener('pointermove', onMove);
      list.addEventListener('pointerleave', onLeaveList);
    } else {
      list.removeEventListener('pointerenter', preload);
      list.removeEventListener('pointerover', onOver);
      list.removeEventListener('pointermove', onMove);
      list.removeEventListener('pointerleave', onLeaveList);
      onLeaveList();
    }
  };

  // Hide while hovering the "Source" link or gaps between rows.
  list.addEventListener('pointerover', (event) => {
    if (!enabled) return;
    if (!(event.target as HTMLElement).closest('[data-preview]')) onLeaveList();
  });
  window.addEventListener('scroll', () => visible && onLeaveList(), { passive: true });

  setEnabled();
  finePointer.addEventListener('change', setEnabled);
  reduceMotion.addEventListener('change', setEnabled);
}

/* ---------------------------------------------------------------------------
   Sticky CTA
   ------------------------------------------------------------------------- */
function initStickyCta(scope: HTMLElement) {
  const cta = scope.querySelector<HTMLElement>('[data-sticky-cta]');
  const hero = scope.querySelector<HTMLElement>('[data-hero]');
  const footer = document.getElementById('studio-footer');
  if (!cta || !hero) return;

  const KEY = 'wk-sticky-cta-dismissed';
  let dismissed = false;
  try {
    dismissed = sessionStorage.getItem(KEY) === '1';
  } catch {
    /* storage unavailable: keep the default */
  }
  if (dismissed) return;

  let pastHero = false;
  let atFooter = false;
  const update = () => {
    const show = pastHero && !atFooter && !dismissed;
    cta.classList.toggle('is-visible', show);
    cta.inert = !show;
  };

  new IntersectionObserver(([entry]) => {
    pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    update();
  }).observe(hero);

  if (footer) {
    new IntersectionObserver(
      ([entry]) => {
        atFooter = entry.isIntersecting;
        update();
      },
      { rootMargin: '0px 0px -10% 0px' },
    ).observe(footer);
  }

  cta.querySelector('[data-sticky-cta-close]')?.addEventListener('click', () => {
    dismissed = true;
    update();
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    track('sticky_cta_dismissed');
  });
}

/* ---------------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------------- */
if (root) {
  initMenu(root);
  const lens = initLens(root);
  if (lens) initHashGuard(lens);
  initRail(root);
  initViewers(root);
  initLightbox(root);
  initDiscuss(root);
  initLedgerPreview(root);
  initStickyCta(root);
}
