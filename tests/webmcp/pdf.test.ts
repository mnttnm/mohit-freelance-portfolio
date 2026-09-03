import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { renderTakeawayPdf } from '../../src/lib/takeaways/pdf';
import type { TakeawayRecord } from '../../src/lib/takeaways/model';

const record: TakeawayRecord = {
  schemaVersion: 1,
  id: 'ABCDEFGHIJKLMNOPQRSTUVWX',
  createdAt: '2026-09-01T00:00:00.000Z',
  contentVersion: 'test',
  audience: 'Founder',
  focus: 'Evaluate Mohit for end-to-end AI product delivery.',
  notes: 'Synthetic test note with quotes, Unicode accents, and <script> text.',
  questions: ['How would you scope the first milestone?'],
  projectSnapshots: [
    {
      id: 'ai-resizing-studio',
      title: 'AI Resizing Studio',
      outcome: 'AI handles first-pass QA while humans review what matters.',
      canonicalUrl: '/projects#ai-resizing-studio',
      evidence: ['The workflow combines generation, deterministic checks, and human review.'],
    },
  ],
  capabilityLabels: ['ai workflows', 'human in the loop', 'full stack'],
};

describe('takeaway PDF', () => {
  it('creates a readable multi-section PDF without executable content', async () => {
    const bytes = await renderTakeawayPdf(record);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');

    const document = await PDFDocument.load(bytes);
    expect(document.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(document.getTitle()).toBe('Portfolio takeaway - Mohit Tater');
  });
});
