import {
  PORTFOLIO_CONTENT_VERSION,
  portfolioProfile,
  portfolioServices,
} from '../../content/portfolio';
import {
  createPersonalizedViewInputSchema,
  findRelevantWorkInputSchema,
  prepareProjectInquiryInputSchema,
  saveTakeawayInputSchema,
  understandMohitInputSchema,
  type WebMcpErrorCode,
} from './contracts';
import { dispatchUiEvent, WEBMCP_EVENTS } from './events';
import { findRelevantWork } from './relevance';
import { serializeRelevantWorkResult, serializeToolResult } from './results';
import {
  PREPARED_INQUIRY_KEY,
  PERSONALIZED_VIEW_KEY,
  TAKEAWAY_DRAFT_KEY,
  savePersonalizedView,
  savePreparedInquiry,
} from './session';
import { buildPersonalizedViewState, buildPreparedInquiryState } from './state';
import {
  createPersonalizedViewSchema,
  findRelevantWorkSchema,
  prepareProjectInquirySchema,
  saveTakeawaySchema,
  understandMohitSchema,
} from './tool-schemas';
import type { WebMcpAdapter } from './adapter';

type SafeAnalyticsProps = Record<string, string | number | boolean | string[]>;

function track(event: string, properties: SafeAnalyticsProps = {}) {
  (window as typeof window & { phTrack?: (name: string, props: SafeAnalyticsProps) => void })
    .phTrack?.(event, { content_version: PORTFOLIO_CONTENT_VERSION, ...properties });
}

function durationBucket(startedAt: number) {
  const duration = performance.now() - startedAt;
  if (duration < 100) return 'under_100ms';
  if (duration < 500) return '100_499ms';
  if (duration < 2_000) return '500_1999ms';
  return '2s_plus';
}

function errorResult(code: WebMcpErrorCode, message: string, retryable = false) {
  return serializeToolResult({ status: 'error', code, message, retryable });
}

function invalidInput(message = 'The tool input is invalid. Correct the fields and try again.') {
  return errorResult('invalid_input', message);
}

function mapExecutionError(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return errorResult('cancelled', 'The visitor or agent cancelled this action.', true);
  }
  return errorResult(
    'internal_error',
    error instanceof Error ? error.message : 'The action could not be completed.',
    true,
  );
}

function understandResult() {
  return {
    status: 'ok',
    contentVersion: PORTFOLIO_CONTENT_VERSION,
    profile: {
      name: portfolioProfile.name,
      role: portfolioProfile.role,
      location: portfolioProfile.location,
      positioning: portfolioProfile.positioning,
    },
    services: portfolioServices.map((service) => service.label),
    strengths: [...portfolioProfile.strengths],
    bestFit: [...portfolioProfile.bestFit],
    experienceSummary: portfolioProfile.experienceSummary,
    representativeProjectIds: [...portfolioProfile.representativeProjectIds],
    links: portfolioProfile.links,
  };
}

function wrapToolExecution(
  name: string,
  execute: WebMCP.ToolExecuteCallback,
): WebMCP.ToolExecuteCallback {
  return async (input, options) => {
    const startedAt = performance.now();
    track('webmcp_tool_called', { tool: name });
    try {
      const safeOptions = {
        signal: options?.signal ?? new AbortController().signal,
      };
      const result = await execute(input, safeOptions);
      track('webmcp_tool_completed', { tool: name, duration: durationBucket(startedAt) });
      return result;
    } catch (error) {
      track('webmcp_tool_failed', { tool: name, duration: durationBucket(startedAt) });
      return mapExecutionError(error);
    }
  };
}

export function createWebMcpTools(): WebMCP.ModelContextTool[] {
  return [
    {
      name: 'understand_mohit',
      title: 'Understand Mohit',
      description:
        "Get a concise, canonical overview of Mohit Tater's role, services, strengths, experience, best-fit work, representative projects, and public links. Use this to establish who Mohit is before evaluating specific work.",
      inputSchema: understandMohitSchema,
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: wrapToolExecution('understand_mohit', (input) => {
        if (!understandMohitInputSchema.safeParse(input).success) return invalidInput();
        return serializeToolResult(understandResult());
      }),
    },
    {
      name: 'find_relevant_work',
      title: 'Find relevant work',
      description:
        "Match a visitor's goal and priorities to Mohit's public portfolio. Returns ranked projects with approved evidence, links, and meaningful gaps. Use this for project-fit research rather than a general biography.",
      inputSchema: findRelevantWorkSchema,
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: wrapToolExecution('find_relevant_work', (input) => {
        const parsed = findRelevantWorkInputSchema.safeParse(input);
        if (!parsed.success) return invalidInput();
        return serializeRelevantWorkResult(findRelevantWork(parsed.data));
      }),
    },
    {
      name: 'create_personalized_view',
      title: 'Create personalized view',
      description:
        "Reframe the portfolio in the current page for a visitor's audience, goal, and priorities. It visibly presents selected services, work, evidence, and next questions and can be reset by the visitor.",
      inputSchema: createPersonalizedViewSchema,
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: wrapToolExecution('create_personalized_view', async (input, { signal }) => {
        const parsed = createPersonalizedViewInputSchema.safeParse(input);
        if (!parsed.success) return invalidInput();
        const state = buildPersonalizedViewState(parsed.data);
        const { ignoredProjectIds, ...persistableState } = state;
        await dispatchUiEvent(WEBMCP_EVENTS.personalize, persistableState, signal);
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        savePersonalizedView(persistableState);
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'personalized');
        history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
        return serializeToolResult({
          status: 'applied',
          viewId: state.viewId,
          selectedProjectIds: state.selectedProjectIds,
          ignoredProjectIds,
          visible: true,
          resetAvailable: true,
        });
      }),
    },
    {
      name: 'save_takeaway',
      title: 'Save shareable takeaway',
      description:
        'Create a durable, public-by-link portfolio takeaway with selected work, notes, and questions. Use only after the visitor agrees that anyone with the unguessable link can view it.',
      inputSchema: saveTakeawaySchema,
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: wrapToolExecution('save_takeaway', async (input, { signal }) => {
        const parsed = saveTakeawayInputSchema.safeParse(input);
        if (!parsed.success) return invalidInput();
        if (parsed.data.confirmedPublic !== true) {
          return errorResult(
            'confirmation_required',
            'Ask the visitor to confirm that anyone with the unguessable link may view this takeaway.',
          );
        }
        sessionStorage.setItem(TAKEAWAY_DRAFT_KEY, JSON.stringify(parsed.data));
        const response = await fetch('/api/takeaways', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': parsed.data.idempotencyKey,
          },
          body: JSON.stringify(parsed.data),
          signal,
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          if (response.status === 429) {
            return errorResult('rate_limited', 'Too many saves. Wait and retry.', true);
          }
          return serializeToolResult(
            result ?? {
              status: 'error',
              code: 'storage_unavailable',
              message: 'The takeaway could not be stored durably.',
              retryable: true,
            },
          );
        }
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        sessionStorage.removeItem(TAKEAWAY_DRAFT_KEY);
        return serializeToolResult(result);
      }),
    },
    {
      name: 'prepare_project_inquiry',
      title: 'Prepare project inquiry',
      description:
        "Turn the visitor's project context into a visible, editable inquiry brief and prefill the contact form. This prepares but never sends the inquiry; the visitor remains responsible for submission.",
      inputSchema: prepareProjectInquirySchema,
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: wrapToolExecution('prepare_project_inquiry', async (input, { signal }) => {
        const parsed = prepareProjectInquiryInputSchema.safeParse(input);
        if (!parsed.success) return invalidInput();
        let state;
        try {
          state = buildPreparedInquiryState(parsed.data);
        } catch (error) {
          return invalidInput(error instanceof Error ? error.message : undefined);
        }
        const { ignoredProjectIds, ...persistableState } = state;
        const acknowledgement = await dispatchUiEvent(
          WEBMCP_EVENTS.prepareInquiry,
          persistableState,
          signal,
        );
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        savePreparedInquiry(persistableState);
        return serializeToolResult({
          status: 'prepared',
          inquiryId: state.inquiryId,
          resolvedProjectIds: state.relevantProjectIds,
          ignoredProjectIds,
          contactFormPrefilled: acknowledgement.contactFormPrefilled ?? false,
          submitted: false,
          humanReviewRequired: true,
        });
      }),
    },
  ];
}

export async function registerWebMcpTools(adapter: WebMcpAdapter, signal: AbortSignal) {
  if (!adapter.supported()) return { supported: false, registered: [] as string[] };

  const registered: string[] = [];
  for (const tool of createWebMcpTools()) {
    try {
      await adapter.register(tool, signal);
      registered.push(tool.name);
      track('webmcp_tool_registered', { tool: tool.name });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') continue;
      track('webmcp_tool_registration_failed', { tool: tool.name });
    }
  }
  return { supported: true, registered };
}

export const WEBMCP_SESSION_KEYS = {
  personalizedView: PERSONALIZED_VIEW_KEY,
  preparedInquiry: PREPARED_INQUIRY_KEY,
};
