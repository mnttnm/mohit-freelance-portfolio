# Autoresearch-Style UI Improvement Loop

**Date:** 2026-03-22
**Status:** Ready for planning

## What We're Building

An autonomous improvement loop — inspired by [Karpathy's autoresearch](https://github.com/karpathy/autoresearch) — that iteratively grades `freelance-site-v2.html`, identifies the weakest area, makes one targeted fix, and keeps or reverts the change based on whether the score improved.

### The Mapping

| Autoresearch Concept | Our UI Loop Equivalent |
|---|---|
| `train.py` (the artifact) | `freelance-site-v2.html` |
| `val_bpb` metric (lower=better) | Interface grader score (higher=better) |
| `program.md` (directives) | Grader feedback → lowest-scoring criterion |
| 5-min time budget | One focused change per iteration |
| Keep if metric improves | Keep if grade score improves or holds |
| Discard if metric worsens | `git revert` to last good commit |
| ~100 experiments/night | 5 iterations per session |

## Why This Approach

**In-session orchestrated loop** — all iterations happen within a single Claude Code session, using existing tools:
- `/interface-grader` skill for evaluation (combined code + visual analysis)
- Direct file editing for fixes
- Git commits for rollback safety

**Rejected:** External bash/Python script spawning Claude CLI — over-engineered for 5 iterations and harder to leverage existing skills.

## Key Decisions

1. **Evaluation**: `/interface-grader` skill (combined code + visual, built into the skill)
2. **Iterations**: 5 rounds
3. **Focus**: Fully autonomous — grader identifies the weakest area each round
4. **Change scope**: One focused improvement per iteration (isolates what works)
5. **Rollback**: Git-based — commit before each change, revert if score drops
6. **Stop condition**: After 5 iterations OR if score plateaus for 2 consecutive rounds

## The Loop (Pseudocode)

```
baseline_score = grade(freelance-site-v2.html)  # Initial /interface-grader run

for iteration in 1..5:
    git commit current state (checkpoint)

    weakest_area = extract_lowest_score(grader_output)

    apply_one_fix(weakest_area)  # Edit HTML/CSS targeting that specific criterion

    new_score = grade(freelance-site-v2.html)  # Re-run /interface-grader

    if new_score >= baseline_score:
        baseline_score = new_score
        log("✓ Kept: {change_description}, score: {new_score}")
    else:
        git revert to checkpoint
        log("✗ Reverted: {change_description}, score dropped to {new_score}")

    if last_2_iterations_no_improvement:
        break  # Plateau detected

print(improvement_log)  # Summary of all iterations
```

## Open Questions

- How granular should the grader's per-criterion scores be to meaningfully compare between iterations? (Will discover during first run)
- Should we allow the loop to attempt a reverted area again with a different approach, or skip it?
