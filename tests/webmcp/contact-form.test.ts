import { describe, expect, it, vi } from 'vitest';
import {
  applyPreparedInquiryToForm,
  clearPreparedInquiryForm,
  type ContactFormRoot,
} from '../../src/lib/webmcp/contact-form';
import type { PreparedInquiryState } from '../../src/lib/webmcp/session';

function field() {
  return {
    value: '',
    dispatchEvent: vi.fn(() => true),
  };
}

function fixture(missing: string[] = []) {
  const fields = {
    '#studio-name': field(),
    '#studio-email': field(),
    '#studio-message': field(),
  };
  const root: ContactFormRoot = {
    querySelector: (selector) => (
      missing.includes(selector) ? null : fields[selector as keyof typeof fields]
    ) as never,
  };
  return { fields, root };
}

const inquiry: PreparedInquiryState = {
  version: 1,
  inquiryId: 'inquiry-1',
  createdAt: '2026-09-01T00:00:00.000Z',
  problem: 'Build a reliable AI workflow product.',
  goals: [],
  stack: [],
  relevantProjectIds: ['ai-resizing-studio'],
  questions: [],
  name: 'Test Person',
  email: 'test@example.com',
  contactMessage: 'Hi Mohit, this is a synthetic regression check.',
};

describe('prepared inquiry contact form', () => {
  it('fills every supplied field before reporting success', () => {
    const { fields, root } = fixture();

    expect(applyPreparedInquiryToForm(inquiry, root)).toBe(true);
    expect(fields['#studio-name'].value).toBe('Test Person');
    expect(fields['#studio-email'].value).toBe('test@example.com');
    expect(fields['#studio-message'].value).toBe(inquiry.contactMessage);
  });

  it('does not report a complete prefill when a supplied field is unavailable', () => {
    const { root } = fixture(['#studio-email']);
    expect(applyPreparedInquiryToForm(inquiry, root)).toBe(false);
  });

  it('clears all inquiry-owned contact fields', () => {
    const { fields, root } = fixture();
    applyPreparedInquiryToForm(inquiry, root);

    clearPreparedInquiryForm(root);

    expect(fields['#studio-name'].value).toBe('');
    expect(fields['#studio-email'].value).toBe('');
    expect(fields['#studio-message'].value).toBe('');
  });
});
