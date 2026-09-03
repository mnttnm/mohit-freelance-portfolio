import {
  get,
  put,
} from '@vercel/blob';
import {
  storedTakeawayEnvelopeSchema,
  type StoredTakeawayEnvelope,
  type TakeawayRecord,
} from './model';
import { IdempotencyConflictError, type TakeawayRepository } from './repository';

export class BlobTakeawayRepository implements TakeawayRepository {
  constructor(private readonly token: string) {}

  private pathname(id: string) {
    return `takeaways/v1/${id}.json`;
  }

  async getEnvelope(id: string): Promise<StoredTakeawayEnvelope | null> {
    const result = await get(this.pathname(id), {
      access: 'private',
      token: this.token,
      useCache: false,
    });
    if (!result || result.statusCode !== 200) return null;
    const text = await new Response(result.stream).text();
    return storedTakeawayEnvelopeSchema.parse(JSON.parse(text));
  }

  async get(id: string) {
    return (await this.getEnvelope(id))?.record ?? null;
  }

  async create(record: TakeawayRecord, fingerprint: string) {
    const envelope: StoredTakeawayEnvelope = { fingerprint, record };
    const existing = await this.getEnvelope(record.id);
    if (existing) {
      if (existing.fingerprint !== fingerprint) throw new IdempotencyConflictError();
      return { status: 'existing' as const, record: existing.record };
    }

    try {
      await put(this.pathname(record.id), JSON.stringify(envelope), {
        access: 'private',
        token: this.token,
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: false,
      });
    } catch (error) {
      const raced = await this.getEnvelope(record.id);
      if (!raced) throw error;
      if (raced.fingerprint !== fingerprint) throw new IdempotencyConflictError();
      return { status: 'existing' as const, record: raced.record };
    }
    const stored = await this.getEnvelope(record.id);
    if (!stored || stored.fingerprint !== fingerprint) {
      throw new Error('Takeaway read-after-write verification failed.');
    }
    return { status: 'created' as const, record: stored.record };
  }
}
