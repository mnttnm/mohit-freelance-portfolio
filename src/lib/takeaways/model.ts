import { z } from 'zod';
import { saveTakeawayInputSchema, type SaveTakeawayInput } from '../webmcp/contracts';

export const TAKEAWAY_SCHEMA_VERSION = 1 as const;
export const TAKEAWAY_ID_PATTERN = /^[A-Za-z0-9_-]{24}$/;

export interface TakeawayRecord {
  schemaVersion: 1;
  id: string;
  createdAt: string;
  contentVersion: string;
  audience?: string;
  focus: string;
  notes?: string;
  questions: string[];
  projectSnapshots: Array<{
    id: string;
    title: string;
    outcome: string;
    canonicalUrl: string;
    evidence: string[];
  }>;
  capabilityLabels: string[];
}

export interface StoredTakeawayEnvelope {
  fingerprint: string;
  record: TakeawayRecord;
}

export const takeawayRecordSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(TAKEAWAY_ID_PATTERN),
  createdAt: z.iso.datetime(),
  contentVersion: z.string().min(1).max(80),
  audience: z.string().min(2).max(80).optional(),
  focus: z.string().min(10).max(500),
  notes: z.string().max(800).optional(),
  questions: z.array(z.string().min(2).max(160)).max(6),
  projectSnapshots: z.array(z.object({
    id: z.string().min(1).max(64),
    title: z.string().min(1).max(120),
    outcome: z.string().min(1).max(240),
    canonicalUrl: z.string().min(1).max(500),
    evidence: z.array(z.string().min(1).max(400)).min(1).max(2),
  })).min(1).max(5),
  capabilityLabels: z.array(z.string().min(1).max(100)).max(12),
}).strict();

export const storedTakeawayEnvelopeSchema = z.object({
  fingerprint: z.string().length(64),
  record: takeawayRecordSchema,
}).strict();

export function validateSaveTakeawayInput(value: unknown): SaveTakeawayInput {
  return saveTakeawayInputSchema.parse(value);
}
