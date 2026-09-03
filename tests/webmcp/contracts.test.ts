import { describe, expect, it } from 'vitest';
import {
  createPersonalizedViewInputSchema,
  findRelevantWorkInputSchema,
  prepareProjectInquiryInputSchema,
  saveTakeawayInputSchema,
} from '../../src/lib/webmcp/contracts';
import { findRelevantWork } from '../../src/lib/webmcp/relevance';
import {
  serializeRelevantWorkResult,
  WEBMCP_RESULT_BUDGET,
} from '../../src/lib/webmcp/results';

describe('WebMCP contracts', () => {
  it('accepts the golden inputs', () => {
    expect(
      findRelevantWorkInputSchema.safeParse({
        context: 'Build an AI product from a rough prototype.',
      }).success,
    ).toBe(true);
    expect(
      createPersonalizedViewInputSchema.safeParse({
        audience: 'CTO',
        goal: 'Evaluate architecture and production delivery.',
      }).success,
    ).toBe(true);
    expect(
      saveTakeawayInputSchema.safeParse({
        focus: 'Evaluate end-to-end ownership for our AI product.',
        projectIds: ['ai-resizing-studio'],
        confirmedPublic: true,
        idempotencyKey: 'test-idempotency-key-123',
      }).success,
    ).toBe(true);
    expect(
      prepareProjectInquiryInputSchema.safeParse({
        problem: 'Turn a rough workflow prototype into a production product.',
      }).success,
    ).toBe(true);
  });

  it('rejects oversized, duplicate, and unknown properties', () => {
    expect(
      findRelevantWorkInputSchema.safeParse({
        context: 'x'.repeat(1201),
      }).success,
    ).toBe(false);
    expect(
      saveTakeawayInputSchema.safeParse({
        focus: 'A valid focus for this saved profile.',
        projectIds: ['reviewhub', 'reviewhub'],
        confirmedPublic: true,
        idempotencyKey: 'test-idempotency-key-123',
      }).success,
    ).toBe(false);
    expect(
      createPersonalizedViewInputSchema.safeParse({
        audience: 'CTO',
        goal: 'Evaluate architecture and production delivery.',
        extra: true,
      }).success,
    ).toBe(false);
  });

  it('keeps relevance results inside the normal WebMCP output budget', () => {
    const result = findRelevantWork({
      context:
        'We need product shaping, full-stack implementation, production delivery, AI workflows, human review, evaluation, dashboards, design systems, automation, and QA.',
      priorities: [
        'architecture',
        'complex enterprise workflows',
        'data visualization',
      ],
      maxResults: 5,
    });
    const serialized = serializeRelevantWorkResult(result);

    expect(serialized.length).toBeLessThanOrEqual(WEBMCP_RESULT_BUDGET);
    expect(() => JSON.parse(serialized)).not.toThrow();
  });

  it('preserves all three golden recommendations inside the budget', () => {
    const result = findRelevantWork({
      context:
        'We are a small marketing-tech team with a rough AI prototype. We need one person who can shape the product, design the interface, build the frontend and backend, and create a reliable human-in-the-loop AI workflow.',
      priorities: ['production delivery', 'evaluation strategy'],
      maxResults: 3,
    });
    const parsed = JSON.parse(serializeRelevantWorkResult(result));
    expect(parsed.matches.map((match: { projectId: string }) => match.projectId)).toEqual([
      'ai-resizing-studio',
      'reviewhub',
      'slicely',
    ]);
  });
});
