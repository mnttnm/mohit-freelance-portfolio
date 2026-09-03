import { z } from 'zod';

const shortText = (max: number) => z.string().trim().min(2).max(max);

export const understandMohitInputSchema = z.object({}).strict();

export const findRelevantWorkInputSchema = z
  .object({
    context: z.string().trim().min(10).max(1200),
    priorities: z.array(shortText(80)).max(6).default([]),
    maxResults: z.number().int().min(1).max(5).default(3),
  })
  .strict();

export const createPersonalizedViewInputSchema = z
  .object({
    audience: shortText(80),
    goal: z.string().trim().min(10).max(800),
    priorities: z.array(shortText(80)).max(6).default([]),
    projectIds: z.array(z.string().trim().min(1).max(64)).max(5).default([]),
  })
  .strict();

export const saveTakeawayInputSchema = z
  .object({
    focus: z.string().trim().min(10).max(500),
    audience: shortText(80).optional(),
    projectIds: z
      .array(z.string().trim().min(1).max(64))
      .min(1)
      .max(5)
      .refine((ids) => new Set(ids).size === ids.length, 'Project IDs must be unique.'),
    notes: z.string().trim().max(800).optional(),
    questions: z.array(shortText(160)).max(6).default([]),
    format: z.enum(['web', 'web_and_print']).default('web_and_print'),
    confirmedPublic: z.boolean(),
    idempotencyKey: z.string().trim().min(16).max(128),
  })
  .strict();

export const prepareProjectInquiryInputSchema = z
  .object({
    problem: z.string().trim().min(10).max(800),
    goals: z.array(shortText(160)).max(6).default([]),
    stage: z.string().trim().max(100).optional(),
    stack: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
    timeline: z.string().trim().max(120).optional(),
    budgetContext: z.string().trim().max(160).optional(),
    relevantProjectIds: z
      .array(z.string().trim().min(1).max(64))
      .max(5)
      .default([])
      .refine((ids) => new Set(ids).size === ids.length, 'Project IDs must be unique.'),
    questions: z.array(shortText(160)).max(6).default([]),
    name: z.string().trim().max(50).optional(),
    email: z.string().trim().max(254).optional(),
  })
  .strict();

export type FindRelevantWorkInput = z.infer<typeof findRelevantWorkInputSchema>;
export type CreatePersonalizedViewInput = z.infer<
  typeof createPersonalizedViewInputSchema
>;
export type SaveTakeawayInput = z.infer<typeof saveTakeawayInputSchema>;
export type PrepareProjectInquiryInput = z.infer<
  typeof prepareProjectInquiryInputSchema
>;

export interface RelevantWorkMatch {
  projectId: string;
  title: string;
  canonicalUrl: string;
  relevanceScore: number;
  reasons: string[];
  evidence: string[];
  gaps: string[];
}

export interface RelevantWorkResult {
  status: 'ok' | 'needs_context';
  querySummary: string;
  matches: RelevantWorkMatch[];
  refinementSuggestion?: string;
}

export type WebMcpErrorCode =
  | 'unsupported'
  | 'invalid_input'
  | 'confirmation_required'
  | 'idempotency_conflict'
  | 'rate_limited'
  | 'storage_unavailable'
  | 'cancelled'
  | 'not_found'
  | 'internal_error';

export interface WebMcpErrorResult {
  status: 'error';
  code: WebMcpErrorCode;
  message: string;
  retryable: boolean;
}
