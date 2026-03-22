---
title: "Autoresearch-Style UI Improvement Loop"
type: feat
date: 2026-03-22
brainstorm: docs/brainstorms/2026-03-22-autoresearch-ui-loop-brainstorm.md
---

# Autoresearch-Style UI Improvement Loop

## Overview

Build an in-session improvement loop that iteratively grades `freelance-site-v2.html` using the `/interface-grader` skill, identifies the weakest scoring area, makes one targeted fix, and keeps or reverts the change based on whether the overall score improved. Inspired by [Karpathy's autoresearch](https://github.com/karpathy/autoresearch) — applied to UI design quality instead of ML training loss.

## Problem Statement

The site exists as a static HTML file with no quality feedback loop. Improvements are ad-hoc — there's no systematic way to identify what's weakest, fix it, and verify the fix actually helped. The autoresearch pattern solves this: propose → measure → keep/discard → repeat.

## Proposed Solution

A manually-orchestrated loop within a Claude Code session, executed in phases:

```
┌─────────────────────────────────────────────────┐
│                  PREREQUISITES                   │
│  git init → initial commit → baseline grade      │
└──────────────────────┬──────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│              ITERATION N (1..5)                   │
│                                                   │
│  1. Parse grader output → find lowest criterion   │
│  2. git commit checkpoint                         │
│  3. Make ONE targeted fix to HTML/CSS             │
│  4. Re-run /interface-grader                      │
│  5. Compare: new_score vs baseline_score          │
│     ├─ improved/equal → KEEP, update baseline     │
│     └─ worse → git revert, log failure            │
│  6. Check plateau (2 consecutive no-improve)      │
│     ├─ plateau → STOP early                       │
│     └─ continue → next iteration                  │
└──────────────────────┬──────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│                 WRAP-UP                           │
│  Print improvement log → document learnings       │
└─────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 0: Prerequisites

**Goal:** Establish git safety net and capture the starting point.

- [x] **0.1** Initialize git repo: `git init` in project root
- [x] **0.2** Create `.gitignore` (if needed — exclude `.DS_Store`, `.vscode/`)
- [x] **0.3** Stage and commit all existing files: `git add -A && git commit -m "Initial commit: existing site versions"`
- [x] **0.4** Create a working branch: `git checkout -b autoresearch-v2-improvements`
- [x] **0.5** Run `/interface-grader` on `freelance-site-v2.html` — this is the **baseline grade**
- [x] **0.6** Record baseline scores in a log structure:

```
# Improvement Log

## Baseline (Iteration 0)
- Overall score: [X/100]
- Per-criterion scores: { criterion: score, ... }
- Weakest area: [criterion name]
```

**Files touched:** `.gitignore` (new), git state only

### Phase 1: The Loop Engine (Iterations 1–5)

Each iteration follows this exact sequence:

#### Step 1: Analyze Grader Output

- [ ] **1.1** From the most recent `/interface-grader` output, extract:
  - Overall score (the number to beat)
  - Per-criterion pass/fail results
  - The **single lowest-scoring or most-failed criterion** — this becomes the improvement target
  - Specific feedback text for that criterion (the "what's wrong")

#### Step 2: Checkpoint

- [ ] **1.2** Commit current state: `git commit -am "checkpoint: before iteration N"`

#### Step 3: Apply One Focused Fix

- [ ] **1.3** Make a **single, targeted edit** to `freelance-site-v2.html` that addresses the weakest criterion identified in Step 1
- [ ] **1.4** The fix should be minimal — change only what's needed to improve that one area
- [ ] **1.5** Examples of single-focus fixes:
  - Weakest: accessibility → add ARIA labels, semantic elements, focus styles
  - Weakest: visual hierarchy → adjust font sizes, spacing, contrast
  - Weakest: responsive design → fix mobile breakpoints, touch targets
  - Weakest: spacing/alignment → adjust padding, margins, grid gaps
  - Weakest: interaction design → add hover states, transitions, feedback

**File touched:** `freelance-site-v2.html`

#### Step 4: Re-Grade

- [ ] **1.6** Run `/interface-grader` on the modified `freelance-site-v2.html`
- [ ] **1.7** Extract the new overall score and per-criterion results

#### Step 5: Keep or Revert

- [ ] **1.8** Compare `new_score` vs `baseline_score`:
  - **If `new_score >= baseline_score`**: Keep the change. Update `baseline_score = new_score`. Log as success.
  - **If `new_score < baseline_score`**: Revert with `git checkout -- freelance-site-v2.html`. Log as failure with the score delta.

#### Step 6: Plateau Detection

- [ ] **1.9** If the last **2 consecutive iterations** showed no score improvement (kept but same score, or both reverted), stop the loop early — we've plateaued.

#### Iteration Log Entry Format

```
## Iteration N
- Target: [criterion name]
- Change: [one-line description of what was changed]
- Score: [before] → [after] (Δ [delta])
- Decision: ✓ KEPT / ✗ REVERTED
- Cumulative: [running best score]
```

### Phase 2: Wrap-Up

- [ ] **2.1** Print the full improvement log showing all iterations
- [ ] **2.2** Show the total improvement: `final_score - original_baseline`
- [ ] **2.3** Commit final state: `git commit -am "autoresearch loop complete: score X → Y"`
- [ ] **2.4** Create `docs/solutions/ui/autoresearch-loop-learnings.md` documenting:
  - Which criteria improved most
  - Which fixes were reverted and why
  - Patterns that emerged (what types of changes reliably improve scores)

**Files touched:** `docs/solutions/ui/autoresearch-loop-learnings.md` (new)

## Acceptance Criteria

- [ ] Git repo initialized with clean history
- [ ] Baseline grade captured before any changes
- [ ] Each iteration: one fix, one re-grade, one keep/revert decision
- [ ] Git commits at each checkpoint for rollback safety
- [ ] Loop stops after 5 iterations or on plateau
- [ ] Final improvement log with score progression
- [ ] No regression: final score >= baseline score

## Technical Considerations

- **Single file**: All edits happen in `freelance-site-v2.html` (inline CSS/JS). No build step.
- **Grader consistency**: The `/interface-grader` skill does combined code + visual analysis. Scores may have some variance between runs — a small drop (1-2 points) might be noise rather than a true regression. Consider a **tolerance threshold** of ~2 points.
- **Fix isolation**: One change per iteration is critical. If we change 3 things and the score drops, we don't know which one caused it.
- **Revert strategy**: `git checkout -- freelance-site-v2.html` restores the file to the last commit. Simple and reliable.
- **Previously-failed areas**: If an area was targeted and reverted, the loop should try a **different approach** to that area or move to the next-weakest criterion.

## Dependencies & Risks

| Risk | Mitigation |
|---|---|
| Grader scores are noisy between runs | Use a 2-point tolerance threshold before reverting |
| Same weak area identified repeatedly | Track attempted fixes; try different approach or skip to next-weakest |
| Loop makes changes that break layout | Visual check is part of grader; git revert is always available |
| 5 iterations not enough | Can re-run the loop in a new session; git branch preserves progress |

## Success Metrics

- **Primary**: Overall interface grade improves from baseline
- **Secondary**: Number of grader criteria that flip from fail → pass
- **Tertiary**: Learnings documented for future UI improvement sessions
