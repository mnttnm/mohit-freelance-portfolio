import { createHash, createHmac } from 'node:crypto';
import { PORTFOLIO_CONTENT_VERSION } from '../../content/portfolio';
import { getProject } from '../../content/projects';
import type { SaveTakeawayInput } from '../webmcp/contracts';
import { TAKEAWAY_SCHEMA_VERSION, type TakeawayRecord } from './model';

export class TakeawayInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TakeawayInputError';
  }
}

function normalizeText(value: string) {
  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[\t ]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function normalizeTakeawayInput(input: SaveTakeawayInput): SaveTakeawayInput {
  return {
    focus: normalizeText(input.focus),
    audience: input.audience ? normalizeText(input.audience) : undefined,
    projectIds: [...input.projectIds],
    notes: input.notes ? normalizeText(input.notes) : undefined,
    questions: input.questions.map(normalizeText),
    format: input.format,
    confirmedPublic: input.confirmedPublic,
    idempotencyKey: input.idempotencyKey,
  };
}

export function deriveTakeawayId(secret: string, idempotencyKey: string) {
  if (secret.length < 32) throw new Error('TAKEAWAY_ID_SECRET must be at least 32 characters.');
  return createHmac('sha256', secret).update(idempotencyKey).digest('base64url').slice(0, 24);
}

export function fingerprintTakeawayInput(input: SaveTakeawayInput) {
  const fingerprintInput = {
    ...input,
    projectIds: [...input.projectIds],
    questions: [...input.questions],
  };
  return createHash('sha256').update(JSON.stringify(fingerprintInput)).digest('hex');
}

function absoluteCanonicalUrl(path: string, baseUrl: string) {
  return new URL(path, baseUrl).href;
}

export function buildTakeawayRecord(
  input: SaveTakeawayInput,
  options: { id: string; baseUrl: string; createdAt?: string },
): TakeawayRecord {
  const normalized = normalizeTakeawayInput(input);
  if (!normalized.confirmedPublic) {
    throw new TakeawayInputError('Public-by-link confirmation is required.');
  }
  const projects = normalized.projectIds
    .map((id) => getProject(id))
    .filter((project) => Boolean(project));
  if (projects.length !== normalized.projectIds.length || projects.length === 0) {
    throw new TakeawayInputError('Every saved project ID must refer to canonical public work.');
  }
  const capabilityLabels = [...new Set(projects.flatMap((project) => project?.capabilities ?? []))]
    .slice(0, 12)
    .map((label) => label.replace(/-/g, ' '));

  return {
    schemaVersion: TAKEAWAY_SCHEMA_VERSION,
    id: options.id,
    createdAt: options.createdAt ?? new Date().toISOString(),
    contentVersion: PORTFOLIO_CONTENT_VERSION,
    audience: normalized.audience,
    focus: normalized.focus,
    notes: normalized.notes,
    questions: normalized.questions,
    projectSnapshots: projects.map((project) => ({
      id: project!.id,
      title: project!.title,
      outcome: project!.outcome,
      canonicalUrl: absoluteCanonicalUrl(project!.canonicalPath, options.baseUrl),
      evidence: Object.values(project!.evidenceByTag).slice(0, 2),
    })),
    capabilityLabels,
  };
}
