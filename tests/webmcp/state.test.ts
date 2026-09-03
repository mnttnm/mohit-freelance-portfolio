import { describe, expect, it } from 'vitest';
import {
  buildPersonalizedViewState,
  buildPreparedInquiryMessage,
  buildPreparedInquiryState,
} from '../../src/lib/webmcp/state';

describe('agent-prepared UI state', () => {
  it('preserves a valid selected project while filling the rest deterministically', () => {
    const state = buildPersonalizedViewState({
      audience: 'Founder',
      goal: 'Evaluate an AI workflow product partner for a working prototype.',
      priorities: ['human-in-the-loop AI'],
      projectIds: ['reviewhub', 'unknown-project'],
    });
    expect(state.selectedProjectIds).toContain('reviewhub');
    expect(state.selectedProjectIds.length).toBeGreaterThanOrEqual(2);
    expect(state.ignoredProjectIds).toEqual(['unknown-project']);
  });

  it('builds an unsent bounded contact message from canonical project titles', () => {
    const state = buildPreparedInquiryState({
      problem: 'Turn a working AI prototype into a product with human review.',
      goals: ['Ship a focused first release'],
      stack: ['Next.js'],
      relevantProjectIds: ['ai-resizing-studio', 'missing'],
      questions: [],
    });
    expect(state.contactMessage).toContain('AI Resizing Studio');
    expect(state.contactMessage.length).toBeLessThanOrEqual(1000);
    expect(state.relevantProjectIds).toEqual(['ai-resizing-studio']);
    expect(state.ignoredProjectIds).toEqual(['missing']);
  });

  it('summarizes oversized inquiry fields without cutting a field label', () => {
    const state = buildPreparedInquiryState({
      problem: `Turn a working AI prototype into a reliable product ${'with detailed context '.repeat(35)}`,
      goals: Array.from({ length: 6 }, (_, index) => `Goal ${index + 1}: ${'measurable outcome '.repeat(8)}`),
      stage: 'Working prototype with early internal users',
      stack: Array.from({ length: 12 }, (_, index) => `Technology-${index + 1}`),
      timeline: 'Ship a validated first release within six weeks',
      budgetContext: 'Use a staged engagement with an explicit pilot decision gate',
      relevantProjectIds: ['ai-resizing-studio', 'reviewhub', 'slicely'],
      questions: Array.from({ length: 6 }, (_, index) => `Question ${index + 1}: ${'important decision '.repeat(8)}`),
    });

    expect(state.contactMessage.length).toBeLessThanOrEqual(1000);
    expect(state.contactMessage).toContain('Problem:\n');
    expect(state.contactMessage).not.toMatch(/(?:Probl|Goa|Sta|Current sta|Timel|Budget cont|Relevant wo|Quest)$/);
  });

  it('regenerates the plain-text message from edited structured context', () => {
    const original = {
      problem: 'Turn a rough workflow into a reliable AI product.',
      goals: ['Ship a focused release'],
      stage: 'Prototype',
      stack: ['Astro'],
      timeline: 'Six weeks',
      budgetContext: undefined,
      relevantProjectIds: ['ai-resizing-studio'],
      questions: ['What should the pilot prove?'],
    };
    const edited = buildPreparedInquiryMessage({
      ...original,
      stage: 'Production pilot',
      timeline: 'Eight weeks',
    });

    expect(edited).toContain('Stage: Production pilot');
    expect(edited).toContain('Timeline: Eight weeks');
    expect(edited).not.toContain('Stage: Prototype');
  });
});
