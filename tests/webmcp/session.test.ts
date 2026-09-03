import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearPersonalizedView,
  parsePreparedInquiry,
  parsePersonalizedView,
  PERSONALIZED_VIEW_KEY,
} from '../../src/lib/webmcp/session';

describe('WebMCP session persistence', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('accepts version 1 and rejects corrupt or future records', () => {
    const valid = {
      version: 1,
      viewId: 'view-1',
      createdAt: '2026-09-01T00:00:00.000Z',
      audience: 'Founder',
      goal: 'Evaluate an AI product partner',
      priorities: ['AI workflow'],
      selectedProjectIds: ['ai-resizing-studio'],
      selectedServiceIds: ['ai-workflows'],
      evidence: ['Approved evidence'],
      questions: ['What should the first release prove?'],
    };
    expect(parsePersonalizedView(JSON.stringify(valid))).toEqual(valid);
    expect(parsePersonalizedView('{broken')).toBeNull();
    expect(parsePersonalizedView(JSON.stringify({ ...valid, version: 2 }))).toBeNull();
  });

  it('clears only the versioned personalized-view record', () => {
    const removeItem = vi.fn();
    vi.stubGlobal('sessionStorage', { removeItem });
    clearPersonalizedView();
    expect(removeItem).toHaveBeenCalledWith(PERSONALIZED_VIEW_KEY);
  });

  it('rejects malformed optional inquiry fields instead of restoring unsafe state', () => {
    const valid = {
      version: 1,
      inquiryId: 'inquiry-1',
      createdAt: '2026-09-04T00:00:00.000Z',
      problem: 'Build a reliable human-review workflow.',
      goals: [],
      stack: [],
      relevantProjectIds: ['ai-resizing-studio'],
      questions: [],
      contactMessage: 'Hi Mohit, this is a valid prepared inquiry.',
    };

    expect(parsePreparedInquiry(JSON.stringify(valid))).toMatchObject(valid);
    expect(parsePreparedInquiry(JSON.stringify({ ...valid, stage: { label: 'Prototype' } }))).toBeNull();
    expect(parsePreparedInquiry(JSON.stringify({ ...valid, email: ['not', 'a', 'string'] }))).toBeNull();
    expect(parsePreparedInquiry(JSON.stringify({ ...valid, contactMessage: 'x'.repeat(1001) }))).toBeNull();
  });
});
