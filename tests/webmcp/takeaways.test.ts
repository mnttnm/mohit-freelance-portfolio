import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { SaveTakeawayInput } from '../../src/lib/webmcp/contracts';
import { FileTakeawayRepository } from '../../src/lib/takeaways/file-repository';
import { IdempotencyConflictError } from '../../src/lib/takeaways/repository';
import {
  buildTakeawayRecord,
  deriveTakeawayId,
  fingerprintTakeawayInput,
  normalizeTakeawayInput,
  TakeawayInputError,
} from '../../src/lib/takeaways/service';

const temporaryDirectories: string[] = [];
const secret = 'test-only-secret-that-is-longer-than-32-characters';

function goldenInput(overrides: Partial<SaveTakeawayInput> = {}): SaveTakeawayInput {
  return {
    focus: 'Evaluate Mohit for a human-in-the-loop AI product engagement.',
    audience: 'Founder',
    projectIds: ['ai-resizing-studio', 'reviewhub'],
    notes: 'Strong overlap with product design and evaluation.',
    questions: ['What would a useful first release prove?'],
    format: 'web_and_print',
    confirmedPublic: true,
    idempotencyKey: 'stable-test-key-1234567890',
    ...overrides,
  };
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('durable takeaways', () => {
  it('requires public-link confirmation and rejects unknown project IDs', () => {
    const id = deriveTakeawayId(secret, goldenInput().idempotencyKey);
    expect(() => buildTakeawayRecord(goldenInput({ confirmedPublic: false }), { id, baseUrl: 'https://mohittater.in' }))
      .toThrow(TakeawayInputError);
    expect(() => buildTakeawayRecord(goldenInput({ projectIds: ['not-a-project'] }), { id, baseUrl: 'https://mohittater.in' }))
      .toThrow(TakeawayInputError);
  });

  it('derives a stable opaque ID without exposing the idempotency key', () => {
    const first = deriveTakeawayId(secret, goldenInput().idempotencyKey);
    const second = deriveTakeawayId(secret, goldenInput().idempotencyKey);
    expect(first).toBe(second);
    expect(first).toMatch(/^[A-Za-z0-9_-]{24}$/);
    expect(first).not.toContain('stable-test-key');
  });

  it('returns the same immutable record for an idempotent retry and rejects changed content', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'mohit-takeaways-'));
    temporaryDirectories.push(directory);
    const repository = new FileTakeawayRepository(directory);
    const input = normalizeTakeawayInput(goldenInput());
    const id = deriveTakeawayId(secret, input.idempotencyKey);
    const record = buildTakeawayRecord(input, {
      id,
      baseUrl: 'https://mohittater.in',
      createdAt: '2026-09-01T00:00:00.000Z',
    });
    const fingerprint = fingerprintTakeawayInput(input);

    await expect(repository.create(record, fingerprint)).resolves.toMatchObject({ status: 'created' });
    await expect(repository.create({ ...record, createdAt: '2027-01-01T00:00:00.000Z' }, fingerprint))
      .resolves.toEqual({ status: 'existing', record });
    await expect(repository.create(record, fingerprintTakeawayInput(goldenInput({ notes: 'Different' }))))
      .rejects.toBeInstanceOf(IdempotencyConflictError);
  });

  it('stores a bounded public snapshot without contact data or transcripts', () => {
    const input = goldenInput({
      notes: '<script>alert("still inert when escaped by the page")</script>',
    });
    const record = buildTakeawayRecord(input, {
      id: deriveTakeawayId(secret, input.idempotencyKey),
      baseUrl: 'https://mohittater.in',
    });
    const serialized = JSON.stringify(record);
    expect(serialized).toContain('<script>');
    expect(serialized).not.toMatch(/email|name|transcript|reasoning/i);
    expect(record.projectSnapshots).toHaveLength(2);
    expect(record.projectSnapshots.every((project) => project.evidence.length <= 2)).toBe(true);
  });
});
