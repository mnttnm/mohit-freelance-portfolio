import type { RelevantWorkResult } from './contracts';

export const WEBMCP_RESULT_BUDGET = 1500;

export function serializeToolResult(value: unknown, budget = WEBMCP_RESULT_BUDGET) {
  const serialized = JSON.stringify(value);
  if (serialized.length > budget) {
    throw new Error(`WebMCP tool result exceeds the ${budget}-character budget.`);
  }
  return serialized;
}

export function serializeRelevantWorkResult(result: RelevantWorkResult) {
  let candidate: RelevantWorkResult = {
    ...result,
    querySummary:
      result.querySummary.length > 100
        ? `${result.querySummary.slice(0, 97).trimEnd()}…`
        : result.querySummary,
    matches: result.matches.map((match) => ({
      ...match,
      reasons: match.reasons.slice(0, 1),
      evidence: match.evidence.slice(0, 1),
      gaps: match.gaps.slice(0, 1),
    })),
  };
  while (true) {
    const serialized = JSON.stringify(candidate);
    if (serialized.length <= WEBMCP_RESULT_BUDGET) return serialized;

    const matches = candidate.matches;

    if (matches.length > 1) {
      candidate = { ...candidate, matches: matches.slice(0, -1) };
      continue;
    }

    candidate = { ...candidate, matches };
    return serializeToolResult(candidate);
  }
}
