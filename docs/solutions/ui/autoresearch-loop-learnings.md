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

3. **Batch independent changes, isolate dependent ones.** In autoresearch (ML), each experiment needs GPU time so parallelism isn't possible. But UI grading allows batching independent fixes (e.g., contrast + typography) into a single iteration. Only force isolation when changes interact (e.g., CSS + HTML for a new component). Retrospectively, our 5 iterations could have been 3 with proper batching.

4. **Git checkpoints were never needed for rollback** (100% keep rate), but they provided confidence to be bold with changes.

5. **Produce artifacts per iteration.** Every experiment needs a full grade file (scorecard snapshot) and a changelog entry. Mental re-grading is not sufficient — the evaluation is the core of the loop.

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

## Adapting Autoresearch for UI (vs. ML)

| Aspect | ML (autoresearch) | UI (our adaptation) |
|---|---|---|
| Artifact | `train.py` | `freelance-site-v2.html` |
| Metric | `val_bpb` (lower=better) | Interface grade % (higher=better) |
| Evaluation cost | 5 min GPU time | Seconds (code analysis + screenshot) |
| Parallelism | Not possible (GPU bound) | Possible for independent CSS/HTML fixes |
| Batching | Always 1 change | Batch independent, isolate dependent |
| Rollback | Discard file changes | `git revert` |
| Artifacts per experiment | Metric logged automatically | Must produce grade file + changelog entry |

## Keywords

autoresearch, iterative-improvement, interface-grading, accessibility, WCAG, focus-visible, touch-targets, reduced-motion
