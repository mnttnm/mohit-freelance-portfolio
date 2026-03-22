# Autoresearch UI Loop — Changelog

**Target:** `freelance-site-v2.html`
**Metric:** Interface Grader (combined code + visual)
**Date:** 2026-03-22
**Branch:** `autoresearch-v2-improvements`

---

## Baseline (grade-001)
**Score: 72% (53/71)**
**Commit:** `e704766`

Initial grading before any changes. Established the starting point.

**Weakest areas:**
- Responsiveness & Access: 33% (2/6)
- Motion & Interaction: 60% (3/5)
- Goal Alignment: 67% (4/6)
- Typography: 67% (4/6)

---

## Iteration 1 (grade-002)
**Score: 80% (57/71) — +8 from baseline**
**Commit:** `b1c3168`
**Decision:** KEPT

**Target:** Accessibility foundations (4 independent criteria batched)
**Rationale:** SW-3.4, SW-3.5, SW-4.5, SW-4.6 are all independent accessibility fixes with no interaction. Batched into single iteration.

**Changes:**
- Added `viewport-fit=cover` to meta viewport tag → fixes SW-4.6
- Added `:focus-visible` styles with accent outline on all interactive elements → fixes SW-4.5 + SW-3.5
- Added `@media (prefers-reduced-motion: reduce)` to disable animations → fixes SW-3.4

**Criteria flipped (4):**
| Criterion | Before | After | Category |
|---|---|---|---|
| SW-3.4 | FAIL | PASS | Motion |
| SW-3.5 | FAIL | PASS | Motion |
| SW-4.5 | FAIL | PASS | Responsiveness |
| SW-4.6 | FAIL | PASS | Responsiveness |

**Category impact:**
- Motion: 60% → 100% (+40)
- Responsiveness: 33% → 67% (+34)

---

## Iteration 2 (grade-003)
**Score: 82% (58/71) — +2 from previous**
**Commit:** `6a4cc62`
**Decision:** KEPT

**Target:** WCAG AA text contrast (SW-2.2)
**Rationale:** Single independent fix. Could have been batched with Iteration 3 (typography) since they're independent, but was run separately.

**Changes:**
- Changed `--text-muted` from `#505054` (2.5:1 contrast) to `#7A7A7E` (4.7:1 contrast) → fixes SW-2.2

**Criteria flipped (1):**
| Criterion | Before | After | Category |
|---|---|---|---|
| SW-2.2 | FAIL | PASS | Color & Surface |

**Category impact:**
- Color & Surface: 86% → 100% (+14)

**Note:** This could have been batched with Iteration 3 (typography sizing) since they are independent changes. In future runs, batch independent CSS variable/sizing changes together.

---

## Iteration 3 (grade-004)
**Score: 85% (60/71) — +3 from previous**
**Commit:** `3d8a4eb`
**Decision:** KEPT

**Target:** Typography sizing (SW-1.3, SW-1.4 — independent of each other)
**Rationale:** Two typography fixes that are independent of each other and of previous changes.

**Changes:**
- Bumped `.desc` from `0.95rem` to `1rem` (15.2px → 16px) → fixes SW-1.3
- Bumped `.svc-sub` from `0.78rem` to `0.85rem` (secondary text, readability improvement)
- Bumped `.exp-desc` from `0.82rem` to `0.88rem`
- Bumped `.work-desc` from `0.85rem` to `0.9rem`
- Changed `.subpage-inner max-width` from `720px` to `65ch` → fixes SW-1.4

**Criteria flipped (2):**
| Criterion | Before | After | Category |
|---|---|---|---|
| SW-1.3 | FAIL | PASS | Typography |
| SW-1.4 | FAIL | PASS | Typography |

**Category impact:**
- Typography: 67% → 100% (+33)

---

## Iteration 4 (grade-005)
**Score: 89% (63/71) — +4 from previous**
**Commit:** `43fb608`
**Decision:** KEPT

**Target:** Goal alignment — subpage CTA and navigation (G.2, G.4, Work PP-1.6)
**Rationale:** These are dependent on each other (the CSS + HTML for the footer must ship together). Single atomic change.

**Changes:**
- Added `.subpage-footer` CSS styles (flex layout, border-top separator)
- Added `.subpage-nav` with links to sibling pages (Home + other 2 subpages)
- Added `.subpage-cta` "Let's talk →" button matching landing CTA style
- Added footer HTML to Work, Background, and Stack subpages

**Criteria flipped (3):**
| Criterion | Before | After | Category |
|---|---|---|---|
| G.2 | FAIL | PASS | Goal Alignment |
| G.4 | FAIL | PASS | Goal Alignment |
| Work PP-1.6 | FAIL | PASS | Per-page Composition |

**Category impact:**
- Goal Alignment: 67% → 100% (+33)
- Work page: 73% → 82% (+9)

---

## Iteration 5 (grade-006)
**Score: 90% (64/71) — +1 from previous**
**Commit:** `d875b52`
**Decision:** KEPT

**Target:** Touch targets (SW-4.1)
**Rationale:** Single accessibility fix. Independent of previous changes.

**Changes:**
- Added `min-height: 44px` + `padding: 12px 4px` to `.bottom-links a`
- Increased `.top-cta` padding from `8px 20px` to `12px 24px`
- Added `min-height: 44px` + padding to `.subpage-nav a`
- Increased `.subpage-cta` padding from `8px 20px` to `12px 24px`
- Added `padding: 12px 4px` + `min-height: 44px` to `.subpage-back`

**Criteria flipped (1):**
| Criterion | Before | After | Category |
|---|---|---|---|
| SW-4.1 | FAIL | PASS | Responsiveness |

**Category impact:**
- Responsiveness: 67% → 83% (+16)

---

## Summary

| Iteration | Score | Delta | Criteria Fixed | Batching |
|---|---|---|---|---|
| Baseline | 72% | — | — | — |
| 1 | 80% | +8 | 4 | Properly batched (4 independent accessibility fixes) |
| 2 | 82% | +2 | 1 | Could have batched with iteration 3 |
| 3 | 85% | +3 | 2 | Could have batched with iteration 2 |
| 4 | 89% | +4 | 3 | Properly atomic (dependent CSS + HTML) |
| 5 | 90% | +1 | 1 | Properly independent |
| **Total** | **+18** | | **11** | |

**Optimal batching (retrospective):** 3 iterations instead of 5:
1. Batch: accessibility (iteration 1) + contrast (iteration 2) + typography (iteration 3) = 7 fixes
2. Atomic: subpage footer (iteration 4) = 3 fixes
3. Batch: touch targets (iteration 5) = 1 fix

**Remaining failures (7):**
- SW-4.4: Not all display text uses fluid clamp()
- PP-1.3: Service cards not interactive
- PP-5.1: No tabular-nums (Landing + Work)
- PP-4.1: No entrance animations (Work, Background, Stack — 3 pages)
