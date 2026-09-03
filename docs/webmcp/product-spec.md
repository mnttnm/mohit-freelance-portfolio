# Mohit Tater Portfolio WebMCP — Product Specification

**Status:** Ready for implementation
**Date:** 2026-09-01
**Audience:** Product owner, implementing agent, reviewer, and demo tester
**Companion documents:** [Development specification](./development-spec.md) and [built-in browser test plan](./browser-test-plan.md)

## Product summary

Turn `mohittater.in` from a portfolio that an agent can merely read into a portfolio that a person and their agent can actively use together.

The human website remains visually focused and easy to browse. WebMCP adds a structured capability layer that lets an agent:

1. understand Mohit's professional identity;
2. research the work most relevant to a visitor's situation;
3. create a visitor-specific version of the portfolio;
4. turn the visit into a durable, shareable takeaway; and
5. prepare a useful project inquiry without sending anything on the visitor's behalf.

The intended story is not "an agent can click the contact form." It is:

> The site combines its canonical knowledge with context the visitor has already shared with their agent, producing a better experience than either the site or the agent could create alone.

## The before-and-after experience

### Before

A visitor or agent must browse several pages, infer the site's structure, compare projects manually, remember why particular work mattered, and start again from a blank contact form. Saving the visit usually means a generic bookmark, screenshots, or hand-written notes.

### After

The visitor can ask their agent, "Could Mohit help us build this?" The agent can obtain a structured overview, inspect relevant evidence across the portfolio, reshape the page for the visitor, save a polished takeaway, and carry the useful context into a reviewable project brief.

```text
"Could Mohit help us?"
        ↓
Understand Mohit
        ↓
Research relevant work
        ↓
Create a personalized view
        ↓
Human explores and refines
        ↓
Save a shareable takeaway
        ↓
Prepare a project inquiry
```

## Goals

- Give visiting agents an explicit, reliable understanding of Mohit's work instead of forcing them to reconstruct it from the DOM.
- Use the agent's knowledge of the visitor to reduce a broad portfolio into the evidence that matters to that visitor.
- Make every state-changing tool visibly update the website so the human can see, understand, and control what happened.
- Create a memorable WebMCP demo that shows understanding, research, personalization, memory, and action.
- Keep the normal portfolio excellent and fully functional when WebMCP is absent or disabled.
- Avoid paid model calls. The visitor's agent supplies the reasoning; the site supplies canonical data, deterministic selection, presentation, and persistence.

## Non-goals

- Building a general-purpose chatbot embedded in the website.
- Adding user accounts, dashboards, saved-item libraries, or collaboration permissions in the first version.
- Letting an agent send an email or submit the contact form without the human's final action.
- Generating new claims, testimonials, project outcomes, or credentials with an LLM.
- Replacing the human portfolio with an agent-only interface.
- Exposing confidential client information that is not already approved for the public portfolio.
- Guaranteeing compatibility with browsers that do not implement the experimental WebMCP API.

## Target users

### Primary users

- **Founder:** wants to know whether Mohit can turn an ambiguous idea or prototype into a shipped product.
- **CTO or engineering leader:** wants evidence of architecture, implementation, AI workflow, and production experience.
- **Recruiter or hiring manager:** wants a concise view of experience, responsibilities, skills, and representative work.
- **Product or design leader:** wants evidence of product thinking, interface craft, design systems, and cross-functional ownership.

### Secondary users

- A colleague creating a shortlist for someone else.
- A visitor returning weeks later through a saved takeaway.
- An agent comparing Mohit with other candidates or vendors.
- Mohit, who receives better-structured inquiries with less back-and-forth.

## Experience principles

### 1. Design for different strengths

Humans skim, tire, and hold limited context. Agents can inspect a larger evidence set and compare it systematically. The tools should let the agent do broad inspection while returning a small, pleasant result to the human.

### 2. Canonical facts come from the site

The website owns facts about Mohit, projects, services, links, experience, and testimonials. The agent may select and explain those facts, but it must not invent them.

### 3. Visitor context stays under visitor control

Personalized context remains in the current browser session unless the visitor explicitly asks to save it. A saved takeaway is public to anyone with its unguessable link, so saving requires an explicit confirmation flag and a clear warning.

### 4. State changes are visible and reversible

Personalization and inquiry preparation must change the human-facing page. The visitor can see what the agent did, edit it, reset it, or decline the next step.

### 5. Honest evidence is better than promotional matching

Relevant-work results should include demonstrated evidence and meaningful gaps. A project with weak evidence must not be presented as a strong match merely because a keyword appeared.

### 6. Agent support is progressive enhancement

No WebMCP support, registration error, or failed tool call may hide content, break navigation, or block the existing contact path.

## Core journey

1. The visitor opens the portfolio in an agent-capable browser.
2. Their agent discovers five clearly separated WebMCP tools.
3. The agent calls `understand_mohit` to establish a reliable baseline.
4. The agent calls `find_relevant_work` with the visitor's real goal and priorities.
5. If helpful, the agent calls `create_personalized_view`; the website visibly presents a tailored lens without changing canonical content.
6. The human browses the selected work and may ask the agent to refine the view.
7. On request, the agent calls `save_takeaway`. The tool creates nothing until the visitor acknowledges that the result is shareable by link.
8. The website returns a durable URL for a polished, printable takeaway containing both human-readable presentation and machine-readable structured context.
9. If the visitor wants to make contact, the agent calls `prepare_project_inquiry`.
10. The website displays an editable brief and prefills the existing contact form. The human reviews and submits it themselves.

## Epic 1 — Understand Mohit

### User story

As a visitor using an agent, I want a reliable overview of Mohit's professional identity so that I can decide whether deeper investigation is worthwhile without asking the agent to scrape and reconcile multiple pages.

### Acceptance criteria

- The agent can call `understand_mohit` without parameters from any primary portfolio page.
- The result contains Mohit's role, location, short positioning, services, strengths, experience summary, best-fit problems, representative project IDs, and canonical links.
- Every returned claim is traceable to approved portfolio content.
- The result is concise enough for an agent to use without summarizing a large payload again.
- The tool is marked read-only and does not alter visible page state.
- If WebMCP is unavailable, the same information remains reachable through the existing pages and structured metadata.

## Epic 2 — Find Relevant Work

### User story

As a visitor evaluating Mohit for a specific need, I want the site to identify the strongest relevant work and evidence so that I do not have to read every case study and build the comparison myself.

### Acceptance criteria

- The agent can provide a natural-language context, optional priorities, and a requested maximum of one to five results.
- The result ranks only canonical projects and returns stable project IDs, titles, links, evidence, match reasons, and any important evidence gaps.
- Matching is deterministic for the same normalized input and content version.
- Ranking uses curated capability, problem, industry, role, and outcome metadata rather than unbounded generated claims.
- A weak or ambiguous query returns a useful broad selection plus a clear suggestion about what information would sharpen the match.
- Unknown, confidential, or unpublished project IDs never appear.
- The tool does not mutate the page and is marked read-only.

## Epic 3 — Create a Personalized View

### User story

As a visitor with a particular role and goal, I want the portfolio to reorganize itself around my priorities so that I can consume a focused version without losing the quality and context of the original site.

### Acceptance criteria

- The agent can provide the visitor's audience, goal, priorities, and optional selected project IDs.
- The website visibly opens a personalized view containing a plain-language summary, relevant services, selected work, supporting evidence, and useful next questions.
- All factual content comes from canonical portfolio data. The view may reframe and reorder; it may not invent claims.
- The view clearly says it is personalized and gives the human controls to refine, reset, visit the full portfolio, save the takeaway, or prepare an inquiry.
- The visitor's raw context is not placed in the URL or analytics payload.
- The view persists across a reload in the same tab/session and disappears when reset or when the session ends.
- Creating or resetting the view does not change the underlying public pages for other visitors.
- If requested project IDs are invalid, they are ignored with a descriptive result rather than causing a broken page.

## Epic 4 — Save a Takeaway

### User story

As a visitor who found Mohit's work relevant, I want a durable, attractive artifact that preserves what mattered to me so that I can return to it, share it, print it, or give it to another agent later.

### Acceptance criteria

- The agent can request a takeaway containing a focus, selected projects, optional notes, optional questions, and an audience.
- No artifact is created unless the call explicitly confirms that the visitor understands the link can be viewed by anyone who has it.
- The server validates all user-entered text, resolves project IDs against canonical data, and stores no email address by default.
- The result is an unguessable same-origin URL under `/takeaways/{id}`.
- The page contains a clear focus statement, why the profile was saved, selected work, relevant capabilities, open questions, source links, and contact actions.
- The page is responsive, accessible, and has a print stylesheet that produces a clean PDF through the browser's Print/Save as PDF flow.
- The page contains machine-readable structured context so a future agent can reconstruct why it was saved.
- The page remains available after reload and in a new browser session.
- User text is rendered as text, never as executable HTML.
- Storage failure, rate limiting, or invalid input produces a clear failure; the tool never returns a URL for an artifact that was not durably stored.

## Epic 5 — Prepare a Project Inquiry

### User story

As a visitor who wants to contact Mohit, I want my agent to carry the useful context from our exploration into a structured brief so that I can review and send a better inquiry without rewriting everything.

### Acceptance criteria

- The agent can provide a problem statement plus optional goals, product stage, stack, timeline, budget context, relevant project IDs, questions, name, and email.
- The website visibly opens an editable inquiry preview and prefills the existing contact form.
- Canonical project links and visitor-provided details are visually distinguished.
- The tool does not submit the form, send email, book a call, or claim that Mohit has received anything.
- A prominent final action tells the human that sending is their choice.
- The existing form validation, honeypot, length limits, rate limiting, analytics, and error states remain in force.
- Invalid or missing contact details may leave fields incomplete, but the prepared brief remains usable.
- Resetting the inquiry clears prepared visitor data from the page and session storage.

## Shared requirements

### Trust and safety

- Tool descriptions must state what happens and when to use the tool; they must not contain rigid agent scripts.
- Read-only tools are annotated as read-only.
- Outputs containing visitor-authored content are annotated as untrusted where appropriate.
- Inputs are validated in application code, not trusted merely because they matched a JSON Schema.
- User-generated text is length-limited, normalized, and rendered with safe text bindings.
- No tool exposes secrets, environment variables, unpublished client material, or private analytics.
- No contact or booking action occurs without a separate human action.

### Human experience

- Every state-changing call results in a visible completion state.
- Agent-created UI uses the existing typography, color, spacing, interaction, and responsive design tokens.
- Keyboard navigation, focus management, reduced motion, and screen-reader labels are first-class requirements.
- The visitor can always reach the full unpersonalized portfolio.

### Reliability

- Registration failures are non-fatal and are logged without displaying a broken experience.
- Tool results use stable IDs and same-origin URLs.
- Outputs stay compact and point to page URLs for detail rather than returning whole pages of copy.
- The app handles cancelled tool calls without completing half-written state.
- Mutation endpoints use idempotency keys so agent retries do not create duplicate takeaways.

### Privacy

- Raw personalization context is session-scoped by default.
- Saved takeaway creation explicitly communicates its public-by-link nature.
- Email addresses are excluded from takeaways and analytics.
- Analytics record tool name, outcome, duration, selected canonical IDs, and coarse audience only; they do not record free-text context, notes, inquiry copy, names, or email addresses.

## Edge cases

- **WebMCP unsupported:** the portfolio behaves exactly as it does today; no blank shell or console exception affects users.
- **Tool registration rejected:** remaining tools attempt registration independently; the human UI still works.
- **Generic context:** return a broad result and a refinement suggestion rather than pretending to have a precise match.
- **No matching project:** return the nearest evidence, label the gap honestly, and link to the full work page.
- **Repeated personalization:** replace the current lens atomically; do not stack panels or duplicate history state.
- **Reload during a personalized session:** restore the last complete view, never an incomplete intermediate state.
- **Save retried:** the same idempotency key returns the original artifact URL.
- **Unknown takeaway ID:** show a designed not-found page with links back to the portfolio.
- **Malicious user text:** display it literally; do not interpret HTML, URLs, or prompt-like text as site instructions.
- **Storage unavailable:** show a retryable error and preserve the unsaved draft in the session.
- **Inquiry longer than the existing message limit:** show the brief but generate a shortened editable contact message within the form limit.
- **Private client work:** return only approved public summaries and explicitly label screenshot-only/private engagements.

## What we are building now

- Exactly five WebMCP tools: `understand_mohit`, `find_relevant_work`, `create_personalized_view`, `save_takeaway`, and `prepare_project_inquiry`.
- A shared canonical data layer for profile and project evidence.
- A visible agent-experience panel for personalized views and inquiry previews.
- Session persistence for unsaved personalization and prepared inquiries.
- Durable same-origin takeaway pages stored through a small storage adapter.
- Print-to-PDF styling plus a server-generated PDF endpoint for a consistent downloadable artifact.
- Safe analytics and structured browser testing across at least Luna and Terra.

## What we would add with more time

- Authenticated private takeaways, deletion controls, and expiring links.
- Image exports and additional share-card formats.
- A conditional `read_saved_takeaway` tool on takeaway pages.
- Comparison views across multiple candidates or agencies.
- Visitor-controlled annotations and collaborative comments on a takeaway.
- A richer agent-only evidence layer with approved architecture details, constraints, trade-offs, and metrics for every project.
- Locale-aware tool titles and output.
- Automated qualitative evals over a larger prompt corpus and more agent/browser combinations.

## Success measures

### Product measures

- Agents select the intended tool on the first attempt for at least 90% of the defined prompt corpus.
- Relevant-work tests place at least one expected project in the top three for every golden scenario.
- Personalized-view and inquiry-preparation calls visibly complete without manual page navigation in at least 95% of test runs.
- Every saved takeaway used in testing opens successfully after reload and in a new tab.
- Zero test runs send an inquiry without a human submission action.
- Existing human navigation, projects, about page, contact form behavior, and performance remain regression-free.

### Demo proof points

- The agent obtains accurate facts without reading every page.
- The same portfolio visibly becomes different for a founder and a CTO.
- The saved artifact retains why the visitor cared, not merely what URL they visited.
- A fresh agent can understand the saved artifact from its structured page context.
- The inquiry arrives at the point of human review already grounded in relevant work.

## Product decisions locked for implementation

- **Five tools, no overlapping helper tools.** Smaller tool sets are easier for agents to select reliably.
- **No website-owned LLM call.** Matching is deterministic and all narrative facts are curated.
- **Personalized view is session-scoped.** Sharing happens only through the explicit takeaway flow.
- **Takeaways are public by unguessable link.** The tool requires explicit acknowledgement before storage.
- **Takeaway output is web plus print stylesheet.** Server-generated PDF/image output is deferred.
- **Inquiry preparation never sends.** The human remains the final actor.
- **WebMCP remains an enhancement.** The ordinary portfolio is the fallback and source of truth.
