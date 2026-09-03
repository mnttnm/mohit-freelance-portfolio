import { prepareProjectInquiryInputSchema } from './contracts';

export interface PersonalizedViewState {
  version: 1;
  viewId: string;
  createdAt: string;
  audience: string;
  goal: string;
  priorities: string[];
  selectedProjectIds: string[];
  selectedServiceIds: string[];
  evidence: string[];
  questions: string[];
}

export interface PreparedInquiryState {
  version: 1;
  inquiryId: string;
  createdAt: string;
  problem: string;
  goals: string[];
  stage?: string;
  stack: string[];
  timeline?: string;
  budgetContext?: string;
  relevantProjectIds: string[];
  questions: string[];
  name?: string;
  email?: string;
  contactMessage: string;
}

export const PERSONALIZED_VIEW_KEY = 'mohit:webmcp:view:v1';
export const PREPARED_INQUIRY_KEY = 'mohit:webmcp:inquiry:v1';
export const TAKEAWAY_DRAFT_KEY = 'mohit:webmcp:takeaway-draft:v1';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function parsePersonalizedView(value: string | null): PersonalizedViewState | null {
  if (!value) return null;
  try {
    const record = JSON.parse(value) as Partial<PersonalizedViewState>;
    if (
      record.version !== 1 ||
      typeof record.viewId !== 'string' ||
      typeof record.createdAt !== 'string' ||
      typeof record.audience !== 'string' ||
      typeof record.goal !== 'string' ||
      !isStringArray(record.priorities) ||
      !isStringArray(record.selectedProjectIds) ||
      !isStringArray(record.selectedServiceIds) ||
      !isStringArray(record.evidence) ||
      !isStringArray(record.questions)
    ) return null;
    return record as PersonalizedViewState;
  } catch {
    return null;
  }
}

export function parsePreparedInquiry(value: string | null): PreparedInquiryState | null {
  if (!value) return null;
  try {
    const record = JSON.parse(value) as Partial<PreparedInquiryState>;
    const parsedInput = prepareProjectInquiryInputSchema.safeParse({
      problem: record.problem,
      goals: record.goals,
      stage: record.stage,
      stack: record.stack,
      timeline: record.timeline,
      budgetContext: record.budgetContext,
      relevantProjectIds: record.relevantProjectIds,
      questions: record.questions,
      name: record.name,
      email: record.email,
    });
    if (
      record.version !== 1 ||
      typeof record.inquiryId !== 'string' ||
      typeof record.createdAt !== 'string' ||
      typeof record.contactMessage !== 'string' ||
      record.contactMessage.length > 1000 ||
      !parsedInput.success
    ) return null;
    return {
      version: 1,
      inquiryId: record.inquiryId,
      createdAt: record.createdAt,
      ...parsedInput.data,
      contactMessage: record.contactMessage,
    };
  } catch {
    return null;
  }
}

export function restoreWebMcpSession() {
  return {
    personalizedView: parsePersonalizedView(sessionStorage.getItem(PERSONALIZED_VIEW_KEY)),
    preparedInquiry: parsePreparedInquiry(sessionStorage.getItem(PREPARED_INQUIRY_KEY)),
  };
}

export function savePersonalizedView(state: PersonalizedViewState) {
  sessionStorage.setItem(PERSONALIZED_VIEW_KEY, JSON.stringify(state));
}

export function savePreparedInquiry(state: PreparedInquiryState) {
  sessionStorage.setItem(PREPARED_INQUIRY_KEY, JSON.stringify(state));
}

export function clearPersonalizedView() {
  sessionStorage.removeItem(PERSONALIZED_VIEW_KEY);
}

export function clearPreparedInquiry() {
  sessionStorage.removeItem(PREPARED_INQUIRY_KEY);
}
