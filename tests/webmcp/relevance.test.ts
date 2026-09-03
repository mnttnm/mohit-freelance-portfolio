import { describe, expect, it } from 'vitest';
import { findRelevantWork } from '../../src/lib/webmcp/relevance';

describe('findRelevantWork', () => {
  it('ranks the AI product founder evidence in the expected top three', () => {
    const result = findRelevantWork({
      context:
        'We are a small marketing-tech team with a rough AI prototype. We need one person who can shape the product, design the interface, build the frontend and backend, and create a reliable human-in-the-loop AI workflow.',
      priorities: ['production delivery', 'evaluation strategy'],
      maxResults: 3,
    });

    expect(result.status).toBe('ok');
    expect(result.matches.map((match) => match.projectId)).toEqual([
      'ai-resizing-studio',
      'reviewhub',
      'slicely',
    ]);
  });

  it('ranks the dashboard case study first for design-leadership needs', () => {
    const result = findRelevantWork({
      context:
        'I am a design leader evaluating dashboard UX, design systems, and turning complex data into interfaces people can act on.',
      priorities: [],
      maxResults: 3,
    });

    expect(result.status).toBe('ok');
    expect(result.matches.map((match) => match.projectId)).toEqual([
      'dashboard-skill',
      'ai-toolkit',
      'ai-resizing-studio',
    ]);
  });

  it('does not manufacture a match for unsupported firmware certification', () => {
    const result = findRelevantWork({
      context:
        'I need a specialist with proven medical-device firmware certification and ten years of embedded C safety work.',
      priorities: [],
      maxResults: 3,
    });

    expect(result.status).toBe('needs_context');
    expect(result.refinementSuggestion).toBeTruthy();
    expect(JSON.stringify(result)).not.toMatch(/certified|firmware experience/i);
  });

  it('asks for context on a generic best-work query', () => {
    const result = findRelevantWork({
      context: "Show me Mohit's best work.",
      priorities: [],
      maxResults: 3,
    });

    expect(result.status).toBe('needs_context');
    expect(result.matches).toHaveLength(2);
  });

  it('is deterministic', () => {
    const input = {
      context: 'We need dashboard UX and design systems for an enterprise internal tool.',
      priorities: ['product design'],
      maxResults: 3,
    };

    expect(findRelevantWork(input)).toEqual(findRelevantWork(input));
  });
});
