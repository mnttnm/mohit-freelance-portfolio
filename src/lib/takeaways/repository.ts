import type { StoredTakeawayEnvelope, TakeawayRecord } from './model';

export class IdempotencyConflictError extends Error {
  constructor() {
    super('This idempotency key was already used for different takeaway content.');
    this.name = 'IdempotencyConflictError';
  }
}

export interface TakeawayRepository {
  create(
    record: TakeawayRecord,
    fingerprint: string,
  ): Promise<{ status: 'created' | 'existing'; record: TakeawayRecord }>;
  get(id: string): Promise<TakeawayRecord | null>;
  getEnvelope(id: string): Promise<StoredTakeawayEnvelope | null>;
}
