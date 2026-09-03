# Mohit Tater Portfolio WebMCP — Development Specification

**Status:** Ready for implementation
**Date:** 2026-09-01
**Implements:** [Product specification](./product-spec.md)
**Verification:** [Built-in browser test plan](./browser-test-plan.md)

## 1. Overview

Add a progressive WebMCP layer to the Astro 7 portfolio. The implementation registers five browser tools through `document.modelContext`, keeps all factual output grounded in shared portfolio data, renders state changes in the existing human interface, and stores explicit saved takeaways as durable same-origin pages.

The WebMCP API is experimental and changing. As of this specification, the current standards surface is `document.modelContext.registerTool()`. Do not implement older examples that use `navigator.modelContext`, `navigator.webmcp`, `provideContext`, or a readable `.tools` array.

Primary references:

- [OpenAI WebMCP Challenge and in-app-browser testing](https://openai.com/webmcp-challenge/)
- [Chrome WebMCP overview](https://developer.chrome.com/docs/ai/webmcp)
- [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [Chrome WebMCP best practices](https://developer.chrome.com/docs/ai/webmcp/best-practices)
- [Chrome WebMCP tool security guidance](https://developer.chrome.com/docs/ai/webmcp/secure-tools)
- [WebMCP draft specification](https://webmachinelearning.github.io/webmcp/)
- [Vercel Blob](https://vercel.com/docs/vercel-blob)
- [Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)

## 2. Existing application constraints

- Framework: Astro 7 with server output and the Vercel adapter.
- UI: primarily `.astro` components, with React already available for client islands.
- Deployment: Vercel; `main` deploys automatically.
- Existing server mutation: Astro Action `server.contact` sends through Resend.
- Existing content: profile and experience in `about.astro`; project records embedded in `projects.astro`; services, fit, testimonials, and project teaser content embedded in `V2Variation.astro`.
- Existing analytics: PostHog client integration.
- Existing build gate: `npm run build`, which includes the design-token linter.
- Working-tree rule: preserve unrelated untracked files and changes.

## 3. Architecture decisions

### 3.1 Progressive enhancement

Load a small client entry point on every primary page. It must first feature-detect `document.modelContext?.registerTool`. Unsupported browsers return immediately. No page content or navigation depends on successful registration.

### 3.2 Standards adapter

All direct interaction with the experimental browser API lives in one module. Application code receives a local `WebMcpAdapter` interface and must not access `document.modelContext` elsewhere. This limits migration cost when the draft changes.

### 3.3 Canonical content plus agent metadata

Move the public project records out of `projects.astro` into shared TypeScript data. Add curated agent metadata to each project: capabilities, problem types, roles, outcomes, constraints, evidence statements, evidence gaps, and confidentiality label.

The human project page and the WebMCP tools must consume the same canonical titles, summaries, URLs, technologies, and approved evidence. Agent-only metadata can be richer, but it must remain public-safe and reviewed.

### 3.4 Deterministic relevance engine

`find_relevant_work` must not call an LLM. It normalizes the supplied context and priorities, scores them against curated project metadata, and returns a compact explanation assembled from approved evidence strings.

The relevance score indicates query match, not project quality or hiring recommendation.

### 3.5 Visible collaboration island

A single React island, mounted by the shared layout, owns personalized-view and inquiry-preview UI. WebMCP callbacks dispatch typed application events to this island. The island writes only complete validated state to `sessionStorage` and restores it after reload.

### 3.6 Durable takeaway storage

Use a storage interface with two drivers:

- local filesystem under `.data/webmcp-takeaways/` during local development;
- a private Vercel Blob store in preview/production.

Production must fail the takeaway request clearly if the storage configuration is absent. It must not silently fall back to ephemeral server memory.

### 3.7 Human-gated side effects

`save_takeaway` requires an explicit `confirmedPublic: true` input before writing. `prepare_project_inquiry` only updates session/UI state and prefills the form. It never invokes the contact Astro Action.

## 4. Proposed file structure

```text
src/
  components/
    agent/
      AgentExperience.tsx          # Personalized view + inquiry preview + reset controls
      PersonalizedView.tsx         # Focused portfolio presentation
      InquiryPreview.tsx           # Editable brief and contact handoff
  content/
    portfolio.ts                    # Profile, services, experience, fit, public links
    projects.ts                     # Canonical projects + curated agent evidence metadata
    testimonials.ts                 # Approved testimonial records used by UI and tools
  lib/
    webmcp/
      adapter.ts                    # Only direct document.modelContext access
      contracts.ts                  # Local tool/input/output types and validators
      register-tools.ts             # Registers exactly five tools
      relevance.ts                  # Deterministic project matching
      results.ts                    # Compact stable result serialization
      session.ts                    # Versioned sessionStorage reads/writes
      events.ts                     # Typed DOM event names and payloads
    takeaways/
      model.ts                      # Takeaway record type and canonical resolution
      repository.ts                 # Storage interface and driver selection
      file-repository.ts            # Local development implementation
      blob-repository.ts            # Vercel Blob implementation
      ids.ts                        # Unguessable IDs and idempotency handling
      sanitize.ts                   # Input normalization and length enforcement
  pages/
    api/
      takeaways/
        index.ts                    # POST create
        [id].ts                     # GET machine-readable artifact
    takeaways/
      [id].astro                    # Human-readable and printable saved artifact
  scripts/
    analytics.ts                    # Add privacy-safe WebMCP events
    webmcp.ts                       # Browser entry point imported by Layout.astro
  types/
    webmcp.d.ts                     # Only if the selected typings package is insufficient

tests/
  webmcp/
    relevance.test.ts               # Golden ranking scenarios
    contracts.test.ts               # Valid/invalid inputs and output budgets
    takeaways.test.ts               # Sanitization, idempotency, repository behavior
    session.test.ts                 # Restore/reset/version mismatch
    fixtures.ts                     # Shared product scenarios

docs/webmcp/
  product-spec.md
  development-spec.md
  browser-test-plan.md
```

Also update:

- `src/layouts/Layout.astro` to mount the agent island and import the WebMCP entry point.
- `src/pages/projects.astro`, `src/pages/about.astro`, and `src/components/variations/V2Variation.astro` to consume extracted content where applicable.
- `src/components/StudioFooter.astro` to accept prepared inquiry state without weakening existing validation.
- `vercel.json` for explicit origin-agent-cluster and tools permissions headers.
- `.gitignore` for local takeaway data.
- `package.json` for typings, Vercel Blob, validation, and tests.

## 5. Domain model

### 5.1 Canonical project

```ts
type Confidentiality = 'public' | 'public-summary' | 'screenshots-only';

interface PortfolioProject {
  id: string;
  title: string;
  type: string;
  outcome: string;
  summary: string;
  canonicalPath: string;
  technologies: string[];
  capabilities: string[];
  problemTypes: string[];
  audiences: string[];
  roles: string[];
  evidence: string[];
  evidenceGaps: string[];
  confidentiality: Confidentiality;
  links: Array<{ label: string; url: string; kind: 'case-study' | 'source' | 'demo' }>;
}
```

Rules:

- IDs are stable, lowercase, and URL-safe.
- `evidence` contains approved factual statements, not generated prose.
- `evidenceGaps` describes material unknowns honestly.
- Tool code never returns screenshots-only details beyond the public page.

### 5.2 Personalized session state

```ts
interface PersonalizedViewState {
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
```

Store under a versioned key such as `mohit:webmcp:view:v1`. Never store name or email in this record.

### 5.3 Prepared inquiry state

```ts
interface PreparedInquiryState {
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
```

This record may live in `sessionStorage`, but analytics must not record its free text or contact fields.

### 5.4 Saved takeaway

```ts
interface TakeawayRecord {
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
```

Store a bounded approved snapshot so an old takeaway remains meaningful after portfolio copy changes. Do not store names, email addresses, analytics identifiers, agent transcripts, or hidden chain-of-thought.

## 6. WebMCP adapter

Define a local interface similar to:

```ts
interface WebMcpAdapter {
  supported(): boolean;
  register(tool: LocalTool, signal: AbortSignal): Promise<void>;
}
```

Implementation requirements:

- Use `document.modelContext.registerTool(tool, { signal })`.
- Create one `AbortController` for the site-level registrations and abort it on page teardown.
- Register tools independently so one invalid schema does not prevent the others from registering.
- Treat a rejected `NotAllowedError` as a non-fatal unsupported state.
- Pass the execution callback's `AbortSignal` into fetches and check it before committing UI state.
- Return compact JSON strings from tool callbacks for compatibility and debuggability.
- Do not depend on a readable tool array. `getTools()` is for test/inspector use, not application behavior.
- Use the current WebMCP typings package as a development dependency if it matches the active draft; otherwise keep minimal local declarations behind this adapter.

## 7. Tool contracts

Tool names and parameter names stay under the current Chrome guidance budgets. Descriptions must stay below 500 characters; parameter descriptions below 150 characters; each normal result below 1,500 characters.

All callback inputs are validated again with application validators. The JSON Schema helps the agent choose arguments but is not a security boundary.

### 7.1 `understand_mohit`

**Implements:** Product spec, Epic 1
**Title:** Understand Mohit
**Description:** `Get a concise, canonical overview of Mohit Tater's role, services, strengths, experience, best-fit work, representative projects, and public links. Use this to establish who Mohit is before evaluating specific work.`
**Annotations:** `readOnlyHint: true`, `untrustedContentHint: false`

Input schema:

```json
{ "type": "object", "properties": {}, "additionalProperties": false }
```

Output shape:

```ts
interface UnderstandResult {
  status: 'ok';
  contentVersion: string;
  profile: { name: string; role: string; location: string; positioning: string };
  services: string[];
  strengths: string[];
  bestFit: string[];
  experienceSummary: string;
  representativeProjectIds: string[];
  links: { home: string; work: string; about: string; contact: string; booking: string };
}
```

Execution:

- Read static canonical data only.
- Return stable same-origin links.
- If serialization exceeds the output budget, shorten lists in a documented priority order; do not truncate JSON.

### 7.2 `find_relevant_work`

**Implements:** Product spec, Epic 2
**Title:** Find relevant work
**Description:** `Match a visitor's goal and priorities to Mohit's public portfolio. Returns ranked projects with approved evidence, links, and meaningful gaps. Use this for project-fit research rather than a general biography.`
**Annotations:** `readOnlyHint: true`, `untrustedContentHint: false`

Input schema:

```json
{
  "type": "object",
  "properties": {
    "context": {
      "type": "string",
      "minLength": 10,
      "maxLength": 1200,
      "description": "The visitor's problem, product, role, or evaluation goal in their own words."
    },
    "priorities": {
      "type": "array",
      "maxItems": 6,
      "items": { "type": "string", "minLength": 2, "maxLength": 80 },
      "description": "Optional capabilities or outcomes that matter most."
    },
    "maxResults": {
      "type": "integer",
      "minimum": 1,
      "maximum": 5,
      "default": 3,
      "description": "Maximum number of ranked projects to return."
    }
  },
  "required": ["context"],
  "additionalProperties": false
}
```

Output shape:

```ts
interface RelevantWorkResult {
  status: 'ok' | 'needs_context';
  querySummary: string;
  matches: Array<{
    projectId: string;
    title: string;
    canonicalUrl: string;
    relevanceScore: number;
    reasons: string[];
    evidence: string[];
    gaps: string[];
  }>;
  refinementSuggestion?: string;
}
```

Scoring algorithm:

1. Normalize Unicode, lowercase, strip punctuation, and tokenize context plus priorities.
2. Expand only through a reviewed synonym map, for example `saas → product`, `agentic → ai-workflows`, `ux → product-design`.
3. Score exact capability and problem-type matches highest, then audience, role, technology, and summary matches.
4. Add a small curated boost for explicit priorities.
5. Deduplicate reasons and cap each result at two reasons, two evidence statements, and one gap.
6. Sort by descending score, then by a stable editorial order.
7. If all scores are below the reviewed threshold, return `needs_context` with up to two broadly representative projects and a refinement suggestion.

Golden ranking examples live in the browser test plan and automated fixtures.

### 7.3 `create_personalized_view`

**Implements:** Product spec, Epic 3
**Title:** Create personalized view
**Description:** `Reframe the portfolio in the current page for a visitor's audience, goal, and priorities. It visibly presents selected services, work, evidence, and next questions and can be reset by the visitor.`
**Annotations:** `readOnlyHint: false`, `untrustedContentHint: true`

Input schema:

```json
{
  "type": "object",
  "properties": {
    "audience": {
      "type": "string",
      "minLength": 2,
      "maxLength": 80,
      "description": "Who is evaluating Mohit, such as a founder, CTO, recruiter, or design leader."
    },
    "goal": {
      "type": "string",
      "minLength": 10,
      "maxLength": 800,
      "description": "What the visitor is trying to decide or accomplish."
    },
    "priorities": {
      "type": "array",
      "maxItems": 6,
      "items": { "type": "string", "minLength": 2, "maxLength": 80 }
    },
    "projectIds": {
      "type": "array",
      "maxItems": 5,
      "items": { "type": "string", "minLength": 1, "maxLength": 64 },
      "description": "Optional canonical project IDs already selected during research."
    }
  },
  "required": ["audience", "goal"],
  "additionalProperties": false
}
```

Execution:

1. Validate and normalize.
2. Resolve provided IDs. If fewer than two valid IDs remain, call the internal deterministic relevance function, not the registered WebMCP tool.
3. Build `PersonalizedViewState` from approved content.
4. Dispatch `mohit:webmcp:personalize` with the complete state.
5. Wait for the React island's applied acknowledgement or abort.
6. Store the complete state in session storage and add `?view=personalized` through `history.replaceState`; never put raw context in the URL.
7. Move focus to the personalized panel heading and announce completion through an `aria-live` region.

Output:

```ts
interface PersonalizedViewResult {
  status: 'applied';
  viewId: string;
  selectedProjectIds: string[];
  ignoredProjectIds: string[];
  visible: true;
  resetAvailable: true;
}
```

### 7.4 `save_takeaway`

**Implements:** Product spec, Epic 4
**Title:** Save shareable takeaway
**Description:** `Create a durable, public-by-link portfolio takeaway with selected work, notes, and questions. Use only after the visitor agrees that anyone with the unguessable link can view it.`
**Annotations:** `readOnlyHint: false`, `untrustedContentHint: true`

Input schema:

```json
{
  "type": "object",
  "properties": {
    "focus": {
      "type": "string",
      "minLength": 10,
      "maxLength": 500,
      "description": "Why Mohit's profile is relevant to the visitor."
    },
    "audience": { "type": "string", "minLength": 2, "maxLength": 80 },
    "projectIds": {
      "type": "array",
      "minItems": 1,
      "maxItems": 5,
      "uniqueItems": true,
      "items": { "type": "string", "minLength": 1, "maxLength": 64 }
    },
    "notes": { "type": "string", "maxLength": 800 },
    "questions": {
      "type": "array",
      "maxItems": 6,
      "items": { "type": "string", "minLength": 2, "maxLength": 160 }
    },
    "format": {
      "type": "string",
      "enum": ["web", "web_and_print"],
      "default": "web_and_print"
    },
    "confirmedPublic": {
      "type": "boolean",
      "description": "True only after the visitor agrees the artifact is viewable by anyone with its link."
    },
    "idempotencyKey": {
      "type": "string",
      "minLength": 16,
      "maxLength": 128,
      "description": "Stable key for retrying the same save without creating a duplicate."
    }
  },
  "required": ["focus", "projectIds", "confirmedPublic", "idempotencyKey"],
  "additionalProperties": false
}
```

Execution:

- Reject with `confirmation_required` when `confirmedPublic` is not exactly true. Do not write a draft server-side.
- POST to `/api/takeaways` with the execution signal.
- Keep the unsaved draft in session storage before the request.
- Clear the unsaved marker only after the server confirms durable storage.
- Render returned user text only through safe bindings.

Output:

```ts
interface SaveTakeawayResult {
  status: 'created' | 'existing';
  takeawayId: string;
  url: string;
  printable: boolean;
  publicByLink: true;
}
```

### 7.5 `prepare_project_inquiry`

**Implements:** Product spec, Epic 5
**Title:** Prepare project inquiry
**Description:** `Turn the visitor's project context into a visible, editable inquiry brief and prefill the contact form. This prepares but never sends the inquiry; the visitor remains responsible for submission.`
**Annotations:** `readOnlyHint: false`, `untrustedContentHint: true`

Input schema:

```json
{
  "type": "object",
  "properties": {
    "problem": { "type": "string", "minLength": 10, "maxLength": 800 },
    "goals": {
      "type": "array",
      "maxItems": 6,
      "items": { "type": "string", "minLength": 2, "maxLength": 160 }
    },
    "stage": { "type": "string", "maxLength": 100 },
    "stack": {
      "type": "array",
      "maxItems": 12,
      "items": { "type": "string", "minLength": 1, "maxLength": 60 }
    },
    "timeline": { "type": "string", "maxLength": 120 },
    "budgetContext": { "type": "string", "maxLength": 160 },
    "relevantProjectIds": {
      "type": "array",
      "maxItems": 5,
      "uniqueItems": true,
      "items": { "type": "string", "minLength": 1, "maxLength": 64 }
    },
    "questions": {
      "type": "array",
      "maxItems": 6,
      "items": { "type": "string", "minLength": 2, "maxLength": 160 }
    },
    "name": { "type": "string", "maxLength": 50 },
    "email": { "type": "string", "maxLength": 254 }
  },
  "required": ["problem"],
  "additionalProperties": false
}
```

Execution:

1. Validate fields with the same name/email rules used by the contact action when those fields are provided.
2. Resolve canonical project IDs and build a plain-text contact message of 10–1,000 characters.
3. Dispatch `mohit:webmcp:prepare-inquiry` and wait for the UI acknowledgement.
4. Persist the prepared state in session storage.
5. Prefill but do not submit `#studio-contact-form`.
6. Move focus to the inquiry-preview heading; the panel's primary action scrolls to the form.

Output:

```ts
interface PrepareInquiryResult {
  status: 'prepared';
  inquiryId: string;
  resolvedProjectIds: string[];
  ignoredProjectIds: string[];
  contactFormPrefilled: boolean;
  submitted: false;
  humanReviewRequired: true;
}
```

## 8. UI components and behavior

### 8.1 Agent experience shell

The island is hidden when it has no state. When opened, it appears as a full-width section directly below the fixed header on narrow screens and as a large anchored panel on desktop. It must feel like part of the existing portfolio rather than browser chrome.

Required shared elements:

- label: `Prepared with your agent`;
- visible explanation of what changed;
- dismiss/reset control;
- full-portfolio link;
- keyboard-contained focus only when presented as a modal; otherwise use normal document flow;
- polite `aria-live` completion status;
- reduced-motion behavior with no forced entrance animation.

### 8.2 Personalized view

Render:

- audience and goal summary;
- two to five selected projects with approved evidence and gaps;
- selected service/capability chips;
- questions worth discussing;
- actions: `View full work`, `Save this takeaway`, `Prepare an inquiry`, and `Reset view`.

The panel may reorder or select canonical content. It must not alter the original project records in memory.

### 8.3 Inquiry preview

Render an editable structured brief separately from the contact form. Updates in the preview regenerate the plain-text contact message. The contact form remains the final delivery surface and retains existing validation and submission behavior.

### 8.4 Takeaway page

The dynamic page must include:

- a clear title and created date;
- `Relevant for` focus statement;
- selected project cards with canonical links;
- relevant capabilities;
- visitor notes and questions, if supplied;
- actions to open the portfolio, contact Mohit, copy the link, and print/save as PDF;
- noindex metadata by default, because public-by-link does not imply search indexing;
- JSON-LD or an equivalent machine-readable JSON script containing the bounded `TakeawayRecord`;
- a print stylesheet that removes navigation/actions and preserves readable project grouping.

## 9. Server API contracts

### 9.1 `POST /api/takeaways`

Request headers:

- `Content-Type: application/json`
- `Idempotency-Key: <same value as body.idempotencyKey>`
- same-origin `Origin` required in preview/production

Request body matches the validated save input, excluding fields generated by the server.

Behavior:

1. Enforce a conservative body-size limit before parsing.
2. Validate the origin, body, acknowledgement, and idempotency key.
3. Resolve project IDs against canonical data.
4. Reject if zero valid projects remain.
5. Sanitize and normalize all strings.
6. Hash the normalized request body to create an idempotency fingerprint.
7. Derive an unguessable stable ID from `HMAC-SHA-256(TAKEAWAY_ID_SECRET, idempotencyKey)` and encode a bounded base64url form. Never use the raw idempotency key as a path or ID.
8. Write the record to `takeaways/v1/{id}.json` in a private Blob store with overwriting disabled. If the object already exists, read it: return it only when its fingerprint matches; otherwise return `idempotency_conflict`.
9. Read the stored object back before returning success.
10. Return `201` for a new artifact or `200` with the original URL for an idempotent retry.

Success body:

```json
{
  "status": "created",
  "takeawayId": "opaque-id",
  "url": "https://mohittater.in/takeaways/opaque-id",
  "printable": true,
  "publicByLink": true
}
```

### 9.2 `GET /api/takeaways/{id}`

- Validate the ID before repository access.
- Return the bounded public `TakeawayRecord` with `Cache-Control` appropriate for immutable-by-ID content.
- Return a small JSON error for missing/malformed IDs.
- Do not expose storage URLs or implementation metadata.

### 9.3 Error contract

```ts
interface ToolErrorResult {
  status: 'error';
  code:
    | 'unsupported'
    | 'invalid_input'
    | 'confirmation_required'
    | 'idempotency_conflict'
    | 'rate_limited'
    | 'storage_unavailable'
    | 'cancelled'
    | 'not_found'
    | 'internal_error';
  message: string;
  retryable: boolean;
}
```

Messages must tell the agent what can be corrected without exposing stack traces or provider details.

## 10. Storage and configuration

### Repository interface

```ts
interface TakeawayRepository {
  create(record: TakeawayRecord, idempotencyKey: string): Promise<
    | { status: 'created'; record: TakeawayRecord }
    | { status: 'existing'; record: TakeawayRecord }
  >;
  get(id: string): Promise<TakeawayRecord | null>;
}
```

### Environment

```text
TAKEAWAY_STORAGE_DRIVER=file|vercel-blob
BLOB_READ_WRITE_TOKEN=...          # required only for the blob driver
TAKEAWAY_ID_SECRET=...             # at least 32 random bytes; required outside local dev
TAKEAWAY_BASE_URL=https://...      # optional; prefer Astro.site/request origin
```

Rules:

- `file` is permitted only when `import.meta.env.DEV` is true.
- preview and production default to `vercel-blob` and fail closed if the token is missing.
- preview and production also fail closed if `TAKEAWAY_ID_SECRET` is missing or too short.
- `.data/webmcp-takeaways/` is ignored by Git.
- takeaways are immutable by ID in the MVP.
- Blob objects are private; only the same-origin page/API expose the bounded public record.
- Blob writes use deterministic paths with overwriting disabled. A same-key/same-body retry returns the existing object; a same-key/different-body retry returns `409 idempotency_conflict`.
- provider-specific code remains behind `TakeawayRepository`.

## 11. Browser and deployment headers

Add explicit response headers for portfolio pages:

```text
Origin-Agent-Cluster: ?1
Permissions-Policy: tools=(self)
```

Do not add `Origin-Agent-Cluster: ?0`. Confirm the final deployed responses retain the headers and do not conflict with Vercel or other middleware. Cross-origin iframe exposure is not required and `exposedTo` must not be configured in the MVP.

## 12. Security and privacy

- Treat every tool input as untrusted external input.
- Use strict server-side validation and explicit maximum lengths.
- Render visitor text with JSX/Astro escaped bindings or `textContent`; never use `set:html`, `innerHTML`, or template interpolation into scripts.
- Keep free text out of URLs, logs, analytics, email subjects, and storage keys.
- Mark tools whose outputs may contain visitor text with `untrustedContentHint: true`.
- Use `readOnlyHint: true` only for `understand_mohit` and `find_relevant_work`.
- Do not set `exposedTo` for other origins.
- Require same-origin requests for takeaway creation and retain standard CSRF protections.
- Configure a Vercel WAF fixed-window rule for `POST /api/takeaways`: five requests per source IP per ten minutes, followed by a `429` action. Verify the rule in preview/production. Do not rely on the existing process-local `Map` for durable abuse protection.
- Escape and validate all contact data again in the existing Astro Action.
- Do not store email/name in a saved takeaway even if inquiry state contains them.
- Avoid including external or user-generated content in relevance evidence.
- Ensure cancellation prevents late UI commits and avoids returning false success after an aborted fetch.

## 13. Analytics

Add privacy-safe events:

```text
webmcp_tool_registered
webmcp_tool_registration_failed
webmcp_tool_called
webmcp_tool_completed
webmcp_tool_failed
webmcp_personalized_view_reset
webmcp_takeaway_opened
webmcp_takeaway_print_started
```

Allowed properties:

- tool name;
- success/error code;
- duration bucket;
- count of projects selected;
- canonical project IDs;
- coarse audience category when it matches a reviewed enum;
- content version;
- local/preview/production environment.

Forbidden properties:

- context, goal, focus, notes, questions, problem statement, generated contact message;
- name, email, budget text, timeline text;
- full takeaway URL or ID;
- agent transcript or model reasoning.

## 14. Automated verification

Add a lightweight test runner appropriate for the repository, preferably Vitest. Required deterministic coverage:

- every project ID is unique and every canonical path exists;
- every evidence string is non-empty and within output budgets;
- all five JSON Schemas accept golden inputs and reject malformed/oversized inputs;
- golden relevance scenarios produce expected top-three sets and stable ordering;
- generic/no-match queries return `needs_context`;
- output serialization produces valid JSON under the 1,500-character normal budget;
- invalid project IDs cannot reach a stored takeaway;
- save confirmation is mandatory;
- idempotency returns the same record;
- stored records exclude forbidden fields;
- HTML/script-like visitor text remains inert after rendering;
- session restore accepts version 1, rejects corrupted or future-version records, and resets cleanly;
- cancellation prevents storage/UI completion;
- unsupported WebMCP detection is a no-op.

## 15. Implementation sequence

### Phase 1 — Canonical data and deterministic core

1. Extract canonical profile/project/testimonial data.
2. Refactor existing pages to consume extracted project records without visual change.
3. Add validators, result types, content versioning, and relevance scoring.
4. Add unit tests and golden relevance fixtures.

Exit gate: existing build passes; project page content and links are unchanged; golden relevance tests pass.

### Phase 2 — Read-only WebMCP

1. Add standards adapter and global entry point.
2. Register `understand_mohit` and `find_relevant_work`.
3. Add compact result serialization, annotations, analytics, and unsupported-browser fallback.

Exit gate: the built-in browser discovers both tools and returns grounded results for the golden prompts.

### Phase 3 — Visible agent collaboration

1. Build the agent-experience React island.
2. Add typed events and versioned session persistence.
3. Register `create_personalized_view` and `prepare_project_inquiry`.
4. Wire prepared inquiry state to the existing contact form without auto-submit.

Exit gate: visible state, reload persistence, reset behavior, focus management, and non-submission tests pass.

### Phase 4 — Durable takeaway

1. Add takeaway model, sanitization, repository interface, and local driver.
2. Add create/read API routes with confirmation, idempotency, and read-after-write verification.
3. Build the saved takeaway page and print stylesheet.
4. Add Vercel Blob driver and production configuration.
5. Register `save_takeaway`.

Exit gate: a built-in-browser-created artifact survives reload/new tab, prints cleanly, exposes machine-readable context, and contains no forbidden data.

### Phase 5 — Hardening and release

1. Add deployment headers and production rate limiting.
2. Run token lint, build, automated tests, and the full built-in browser plan with Luna and Terra.
3. Run existing human-site regression checks.
4. Deploy a preview, repeat the browser plan, inspect errors/analytics, then promote only after all P0/P1 gates pass.

## 16. Risks and mitigations

### Experimental API drift

Risk: the WebMCP draft changes between implementation and judging.
Mitigation: one adapter, current official links, no dependency on unstandardized output schemas, and an explicit smoke test in the target in-app browser.

### Tool-selection ambiguity

Risk: agents choose personalization when research was intended, or save when inquiry preparation was intended.
Mitigation: exactly five non-overlapping names/descriptions, small schemas, compact outputs, and multi-model prompt evals.

### Overclaiming relevance

Risk: deterministic keyword matching creates promotional but weak matches.
Mitigation: curated metadata, stable thresholds, evidence gaps, golden scenarios, and explicit score semantics.

### Public storage abuse or privacy mistakes

Risk: anonymous artifact creation can be abused or include confidential context.
Mitigation: explicit acknowledgement, bounded fields, no email storage, unguessable IDs, same-origin checks, distributed rate limiting, safe rendering, and analytics minimization.

### Human UI regression

Risk: extracting content and mounting a global island changes layout or performance.
Mitigation: phased refactor, screenshot/visual comparison, hidden-until-used island, no WebMCP dependency in server rendering, and existing build/token gates.

## 17. Definition of done

- Exactly five intended tools are discoverable on the home, work, and about pages in ChatGPT's built-in browser.
- Tool names, descriptions, schemas, annotations, and behavior match this specification.
- Every tool passes its P0/P1 browser cases with Luna and Terra.
- The two read-only tools return accurate canonical information without visible mutation.
- The three state-changing tools visibly update the page and are reversible or human-gated as specified.
- A saved takeaway is durably stored, printable, machine-readable, safe, and reachable through an unguessable same-origin URL.
- Inquiry preparation never submits or sends.
- Unsupported browsers retain the full existing site with no user-facing error.
- Automated tests, `npm run lint:tokens`, and `npm run build` pass.
- Existing navigation, project interactions, about page, contact validation, and analytics are regression-tested.
- Deployment headers, storage configuration, rate limiting, and live artifact persistence are verified on the preview deployment.
- The built-in browser test report records actual tool calls, visible outcomes, persistence checks, console/network issues, model used, and any skipped external side effects.
