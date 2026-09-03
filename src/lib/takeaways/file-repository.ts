import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { storedTakeawayEnvelopeSchema, type StoredTakeawayEnvelope, type TakeawayRecord } from './model';
import { IdempotencyConflictError, type TakeawayRepository } from './repository';

export class FileTakeawayRepository implements TakeawayRepository {
  constructor(private readonly rootDirectory: string) {}

  private recordPath(id: string) {
    return join(this.rootDirectory, `${id}.json`);
  }

  async getEnvelope(id: string): Promise<StoredTakeawayEnvelope | null> {
    try {
      const value = JSON.parse(await readFile(this.recordPath(id), 'utf8'));
      return storedTakeawayEnvelopeSchema.parse(value);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async get(id: string) {
    return (await this.getEnvelope(id))?.record ?? null;
  }

  async create(record: TakeawayRecord, fingerprint: string) {
    await mkdir(this.rootDirectory, { recursive: true });
    const envelope: StoredTakeawayEnvelope = { fingerprint, record };
    try {
      await writeFile(this.recordPath(record.id), JSON.stringify(envelope), {
        encoding: 'utf8',
        flag: 'wx',
        mode: 0o600,
      });
      const stored = await this.getEnvelope(record.id);
      if (!stored || stored.fingerprint !== fingerprint) {
        throw new Error('Takeaway read-after-write verification failed.');
      }
      return { status: 'created' as const, record: stored.record };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      const existing = await this.getEnvelope(record.id);
      if (!existing || existing.fingerprint !== fingerprint) throw new IdempotencyConflictError();
      return { status: 'existing' as const, record: existing.record };
    }
  }
}
