export const understandMohitSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false,
} as const;

export const findRelevantWorkSchema = {
  type: 'object',
  properties: {
    context: {
      type: 'string',
      minLength: 10,
      maxLength: 1200,
      description: "The visitor's problem, product, role, or evaluation goal in their own words.",
    },
    priorities: {
      type: 'array',
      maxItems: 6,
      items: { type: 'string', minLength: 2, maxLength: 80 },
      description: 'Optional capabilities or outcomes that matter most.',
    },
    maxResults: {
      type: 'integer',
      minimum: 1,
      maximum: 5,
      default: 3,
      description: 'Maximum number of ranked projects to return.',
    },
  },
  required: ['context'],
  additionalProperties: false,
} as const;

export const createPersonalizedViewSchema = {
  type: 'object',
  properties: {
    audience: {
      type: 'string',
      minLength: 2,
      maxLength: 80,
      description: 'Who is evaluating Mohit, such as a founder, CTO, recruiter, or design leader.',
    },
    goal: {
      type: 'string',
      minLength: 10,
      maxLength: 800,
      description: 'What the visitor is trying to decide or accomplish.',
    },
    priorities: {
      type: 'array',
      maxItems: 6,
      items: { type: 'string', minLength: 2, maxLength: 80 },
    },
    projectIds: {
      type: 'array',
      maxItems: 5,
      items: { type: 'string', minLength: 1, maxLength: 64 },
      description: 'Optional canonical project IDs already selected during research.',
    },
  },
  required: ['audience', 'goal'],
  additionalProperties: false,
} as const;

export const saveTakeawaySchema = {
  type: 'object',
  properties: {
    focus: {
      type: 'string',
      minLength: 10,
      maxLength: 500,
      description: "Why Mohit's profile is relevant to the visitor.",
    },
    audience: { type: 'string', minLength: 2, maxLength: 80 },
    projectIds: {
      type: 'array',
      minItems: 1,
      maxItems: 5,
      uniqueItems: true,
      items: { type: 'string', minLength: 1, maxLength: 64 },
    },
    notes: { type: 'string', maxLength: 800 },
    questions: {
      type: 'array',
      maxItems: 6,
      items: { type: 'string', minLength: 2, maxLength: 160 },
    },
    format: {
      type: 'string',
      enum: ['web', 'web_and_print'],
      default: 'web_and_print',
    },
    confirmedPublic: {
      type: 'boolean',
      description: 'True only after the visitor agrees anyone with its link can view it.',
    },
    idempotencyKey: {
      type: 'string',
      minLength: 16,
      maxLength: 128,
      description: 'Stable key for retrying the same save without creating a duplicate.',
    },
  },
  required: ['focus', 'projectIds', 'confirmedPublic', 'idempotencyKey'],
  additionalProperties: false,
} as const;

export const prepareProjectInquirySchema = {
  type: 'object',
  properties: {
    problem: { type: 'string', minLength: 10, maxLength: 800 },
    goals: {
      type: 'array',
      maxItems: 6,
      items: { type: 'string', minLength: 2, maxLength: 160 },
    },
    stage: { type: 'string', maxLength: 100 },
    stack: {
      type: 'array',
      maxItems: 12,
      items: { type: 'string', minLength: 1, maxLength: 60 },
    },
    timeline: { type: 'string', maxLength: 120 },
    budgetContext: { type: 'string', maxLength: 160 },
    relevantProjectIds: {
      type: 'array',
      maxItems: 5,
      uniqueItems: true,
      items: { type: 'string', minLength: 1, maxLength: 64 },
    },
    questions: {
      type: 'array',
      maxItems: 6,
      items: { type: 'string', minLength: 2, maxLength: 160 },
    },
    name: { type: 'string', maxLength: 50 },
    email: { type: 'string', maxLength: 254 },
  },
  required: ['problem'],
  additionalProperties: false,
} as const;
