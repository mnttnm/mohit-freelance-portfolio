# Autoresearch UI Loop — Learnings

## Summary

Applied Karpathy's autoresearch pattern to iteratively improve `freelance-site-v2.html`. 5 iterations, all kept, score improved from **72% → 90%** (+18 points).

## The Loop

| Iteration | Target | Change | Delta | Decision |
|---|---|---|---|---|
| 1 | Accessibility foundations | :focus-visible, prefers-reduced-motion, viewport-fit=cover | +8% | KEPT |
| 2 | WCAG AA contrast | --text-muted #505054 → #7A7A7E | +2% | KEPT |
| 3 | Typography sizing | Body text to 1rem, subpage max-width to 65ch | +3% | KEPT |
| 4 | Goal alignment | Added nav footer + CTA to all subpages | +4% | KEPT |
| 5 | Touch targets | min-height: 44px on all interactive elements | +1% | KEPT |

## What Worked

1. **Accessibility fixes give the highest ROI.** Iteration 1 fixed 4 criteria at once (+8%) because accessibility rules are binary and well-defined. Code changes are small, impact is large.

2. **Goal alignment fixes are high-leverage.** Adding CTA + nav to subpages fixed 3 criteria across Layer 1 and per-page scoring (+4%). Structural improvements compound across page types.

3. **One-change-per-iteration isolation works.** Every iteration was a clear keep. No need to debug what went wrong because each change was focused.

4. **Git checkpoints were never needed for rollback** (100% keep rate), but they provided confidence to be bold with changes.

## Patterns for Reliable Score Improvement

- **Accessibility first**: Focus-visible, reduced-motion, viewport-fit, touch targets — all are code-only fixes with clear pass/fail criteria
- **Contrast fixes**: Easy to calculate, easy to verify, clear WCAG thresholds
- **Structural additions** (nav, CTAs): Fix goal alignment criteria that apply across multiple pages
- **Typography sizing**: Small rem adjustments have outsized impact on readability criteria

## What's Left (Remaining Failures)

| Criterion | Issue | Difficulty |
|---|---|---|
| SW-4.4 | Not all display text uses fluid clamp() | Easy — add clamp() to .svc-name |
| PP-1.3 | Service cards not interactive | Medium — requires design decision on what clicking does |
| PP-5.1 | No tabular-nums on prices/metrics | Easy — add font-variant-numeric |
| PP-4.1 | Subpages lack entrance animations (3 pages) | Medium — add fadeIn or stagger animations |

## Keywords

autoresearch, iterative-improvement, interface-grading, accessibility, WCAG, focus-visible, touch-targets, reduced-motion
