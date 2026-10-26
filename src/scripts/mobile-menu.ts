/**
 * Shared mobile menu for every page header. Markup contract:
 *   <header data-menu> … <nav data-menu-panel id="…"> … <button data-menu-toggle aria-controls="…">
 * Open state is a class on the header (`is-menu-open`); global.css owns the
 * panel's look and motion, so pages don't restyle it inline.
 */
export function initMobileMenu(header: HTMLElement | null): void {
  if (!header) return;
  const toggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = header.querySelector<HTMLElement>('[data-menu-panel]');
  if (!toggle || !panel) return;

  const isOpen = () => header.classList.contains('is-menu-open');
  const setMenu = (open: boolean) => {
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
  };

  toggle.addEventListener('click', () => setMenu(!isOpen()));
  panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('pointerdown', (e) => {
    if (isOpen() && !header.contains(e.target as Node)) setMenu(false);
  });
  // Crossing to the desktop layout should never leave a stale open state.
  window.matchMedia('(min-width: 769px)').addEventListener('change', () => setMenu(false));
}
