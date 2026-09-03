# Title

**MCP, Meet PCM**

Subtitle: **Portfolio Context Manager — a WebMCP-powered portfolio that turns visitor context into evidence, a durable takeaway, and a human-reviewed project brief.**

## One-line Summary

PCM turns Mohit's portfolio into a context manager where people and agents find relevant proof, create a tailored takeaway, and prepare the next conversation together.

## Problem

Professional portfolios are designed for browsing, not collaboration. A founder, CTO, recruiter, or design leader must scan several pages, infer which projects matter, verify whether the evidence truly supports their need, remember the useful parts, and then repeat the context in a blank contact form.

An agent can help, but without a structured interface it must scrape presentation-oriented pages, reconstruct the site's meaning, and guess which claims are canonical. The website knows the facts; the agent knows the visitor's context. Conventional portfolios give them no reliable way to work together.

## Solution

PCM adds five WebMCP tools to the existing portfolio. The agent can establish a canonical profile, rank relevant work with evidence and honest gaps, create a visible visitor-specific briefing, save selected work as a durable web/PDF takeaway, and prepare an editable project brief.

The human stays in the loop. Page-changing actions are visible and reversible. A takeaway is created only after the visitor confirms that anyone with its unguessable link may view it. An inquiry is prepared and the contact form is prefilled, but the tool never sends it.

This produces a better experience than either side can create alone: the site contributes reviewed, structured evidence; the agent contributes the visitor's already-known goals and priorities; the human sees, edits, saves, or rejects the result.

## Why This Matters

The same pattern applies far beyond portfolios. Today, useful web experiences repeatedly ask people to translate context from their agent back into forms and filters. A structured website capability layer can let agents do the broad comparison work while the website retains authority over facts, validation, presentation, persistence, and side effects.

MCP, Meet PCM demonstrates that future on a familiar, high-friction decision: “Could this person help us?” Instead of producing a generic summary, the collaboration ends in inspectable evidence and an actionable—but deliberately unsent—next step.

## Why This Is a Strong Fit for WebMCP

- The agent needs reliable access to facts and actions owned by the live website, not a second copy of the portfolio in an external database.
- Visitor context is what makes the experience valuable, but that context should not need to be permanently uploaded to the site.
- Read-only research and state-changing actions have meaningfully different contracts and safety boundaries.
- The best result is visible on the web page: a human can inspect what the agent selected, edit it, reset it, save it, or continue manually.
- The five tools form a coherent journey rather than a decorative one-tool integration.

## How We Used AI

The visitor's agent supplies the reasoning. The website supplies canonical public data, strict tool contracts, deterministic matching, evidence boundaries, visible UI state, and durable artifacts. No embedded chatbot or paid model call is required.

AI is useful here because it can combine the visitor's nuanced intent with a larger evidence set, explain why specific work is relevant, and carry context between research, personalization, saving, and inquiry preparation. The site's deterministic layer prevents that reasoning from becoming an excuse to invent credentials, project outcomes, or client claims.

The implementation was tested through Codex's in-app browser and with GPT-5.6 Terra. GPT-5.6 Luna completed page, saved-artifact, and injection baselines, but its available browser runtime did not expose `document.modelContext` or the WebMCP tool-list operation; that limitation is reported rather than treated as a pass.

## How We Used Codex

Codex was a working product and engineering partner throughout the WebMCP extension. It helped:

- turn the initial concept into product, development, and browser acceptance specifications;
- define bounded tool contracts and the human/agent safety model;
- implement the five tools, canonical content layer, relevance engine, browser state, storage API, and PDF output;
- write regression tests and exercise complete browser flows rather than checking registration alone;
- inspect desktop and mobile UI, identify the unfinished modal-like experience, and redesign it into a polished editorial briefing and project-brief surface;
- validate persistence, confirmation gates, error states, privacy boundaries, response headers, deployment storage, and rate limiting;
- prepare the demo narrative and Devpost materials while keeping unverified claims and release blockers explicit.

## Key Features

1. **Canonical understanding** — a concise, bounded profile and service overview from reviewed site content.
2. **Evidence-based matching** — deterministic project ranking with approved evidence, stable links, and explicit evidence gaps.
3. **Visible portfolio context** — an editorial briefing tailored to the visitor's role, goal, and priorities, with reset and persistence behavior.
4. **Durable takeaway** — an immutable public-by-link page and server-generated PDF, created only after confirmation.
5. **Human-reviewed inquiry** — an editable brief that prefills the existing contact form while remaining clearly unsent.
6. **Progressive enhancement** — the normal portfolio remains complete when WebMCP is unavailable.

## Architecture

PCM is an Astro 7 application with React islands deployed on Vercel. A browser adapter checks for `document.modelContext.registerTool` and registers exactly five tools. Zod validates bounded inputs; outputs are compact structured results.

The human pages and tools consume the same canonical content under `src/content`. Relevance matching is deterministic and uses curated capabilities, audiences, problem types, roles, outcomes, evidence, and evidence gaps. Personalized views and inquiries use versioned `sessionStorage` and custom events to keep state changes visible.

Confirmed takeaways are written through an Astro API to private Vercel Blob storage. IDs are opaque, stable, HMAC-derived values; exact retries are idempotent. Public records exclude identity, email, transcripts, and hidden reasoning. Saved pages are no-index and offer a server-generated PDF.

## Testing Instructions

No account or credentials should be required on the final live URL.

1. Open the live URL in ChatGPT's in-app browser or Google Chrome with WebMCP enabled.
2. Ask: **“Inspect this page's available website tools. List their names and explain when you would use each. Do not invoke them yet.”** Confirm exactly five PCM tools appear.
3. Ask: **“We are a small marketing-tech team with a rough AI prototype. Find the three strongest pieces of evidence that Mohit could shape, design, and build it. Be honest about gaps.”**
4. Ask: **“Create a personalized view for a CTO emphasizing architecture, full-stack ownership, production delivery, and applied AI.”** Confirm the portfolio opens a visible briefing.
5. Ask to save the selected evidence. The agent should request public-link confirmation. Confirm, then open the returned takeaway and use **Download PDF**.
6. Ask: **“Turn this into a project brief I can review before contacting Mohit.”** Confirm the editable brief and contact form are populated and that the interface says the inquiry has not been sent.
7. Do not submit the contact form during judging unless you intentionally want to send a real message.

Expected golden match for the founder query: AI Resizing Studio, ReviewHub, and Slicely. Minor ordering changes are acceptable only if the client adds context that changes relevance.

## Public Demo Link

**Verified:** https://mohittater.in/

The public production deployment was verified without owner authentication on September 4. It serves the WebMCP release from implementation commit `1df9bbd`, exposes the required response headers, and completed the golden tool flow against durable production storage.

## Public Repository Link

**Verified:** https://github.com/mnttnm/mohit-freelance-portfolio

The repository is public, synchronized with `main`, and GitHub recognizes the included license as MIT.

## Demo Video

**Public YouTube URL:** `TODO — upload an under-three-minute public video`

Use the exact script and capture plan in [`docs/webmcp/demo-run-of-show.md`](docs/webmcp/demo-run-of-show.md). Target runtime: 2:35–2:45 to leave margin under the hard three-minute limit.

## Screenshot Shot List

1. **Ordinary portfolio + agent prompt** — establish that this remains a polished human website.
2. **Relevant-work result** — show the three selected projects with approved evidence and a visible evidence boundary.
3. **Personalized portfolio context** — capture the editorial briefing, strongest-fit list, and “Private to this tab” label.
4. **Saved takeaway** — capture the asymmetric green hero, evidence rows, and Download PDF action.
5. **Prepared project brief** — capture problem, stage/timeline, goals, editable message, and “Human review required / not sent” boundary.

Capture at desktop width with real browser chrome omitted or neatly cropped. Use only synthetic project context and identity data.

## Submission Readiness Notes

### Verified

- Exactly five registered WebMCP tools.
- Complete local golden flow from research through unsent inquiry.
- Responsive desktop and 390px mobile presentation with no horizontal overflow.
- Personalized-view and inquiry persistence/reset behavior.
- Public-link confirmation and idempotent durable takeaway behavior.
- Saved page, missing-link state, PDF download, PDF content, and two-page visual rendering.
- 29 automated tests across 9 files.
- Design-token lint and production build.
- Production dependency audit with zero reported vulnerabilities.
- Preview HTTPS, WebMCP response headers, Blob persistence, and save-endpoint rate limiting.
- Public GitHub repository with a recognized MIT license and readable source/README.
- Public production deployment from implementation commit `1df9bbd` with no authentication wall.
- Production golden flow covering discovery, relevance, personalization persistence/reset, confirmation gating, durable save/idempotency, PDF rendering, and unsent inquiry preparation/clearing.

### Must finish before the deadline

- Record, upload, and verify the public YouTube demo.
- Add the final video URL here and in Devpost.
- Complete Devpost's final submit action before September 4, 2026 at 08:00 UTC / 1:30 PM IST.
- Freeze the repository, video, and live site after the deadline until judging ends September 21 at 5:00 PM Pacific.

## Known Limitations

- WebMCP support varies across experimental browser and agent runtimes.
- The available GPT-5.6 Luna browser runtime did not expose the required page model context, so real Luna routing remains blocked by that runtime.
- Preview deployments remain owner-protected; the production judging URL is public and was verified separately.
- Saved takeaways are public by unguessable link and do not yet have an account-based library or revocation UI.
- Inquiry preparation intentionally stops before external communication.
- Real email delivery, timed cancellation, and timed storage-failure recovery were not exercised against production.

## TODO Official Form Fields

### 28249 — Submitter Type

**Draft answer:** Individual

### 28250 — Country of residence

**Draft answer:** India

### 28251 — Organization name

**Draft answer:** Leave blank; not applicable to an individual entry.

### 28252 — App Status

**Draft answer:** Existing

### 28253 — What was updated during the submission period?

**Draft answer:**

The portfolio existed before the challenge. Between August 25 and September 4, I added the complete WebMCP experience: five purpose-specific tools; a shared canonical evidence layer; deterministic relevant-work ranking with honest evidence gaps; visible personalized portfolio and editable inquiry interfaces; session persistence and reset controls; explicit public-link confirmation; durable Blob-backed takeaways with web and PDF views; strict schemas, privacy boundaries, deployment headers, rate limiting, automated tests, and browser verification. These additions turn a conventional portfolio into a collaborative workflow for people and their agents.

### 28254 — Live URL

**Draft answer:** https://mohittater.in/

**Do not paste until the WebMCP production deployment is verified.**

### 28255 — Testing instructions

**Draft answer:**

No credentials are required. Open the URL in ChatGPT's in-app browser or Chrome with WebMCP enabled. Ask the client to list the page tools; exactly five should appear. Run the founder relevant-work prompt, create the CTO personalized view, confirm a public-by-link saved takeaway, download its PDF, and prepare a project inquiry. The final inquiry must remain editable and explicitly unsent. Please do not submit the contact form unless you want to send a real message.

### 28256 — Public code repository

**Draft answer:** https://github.com/mnttnm/mohit-freelance-portfolio

**Do not paste until the repository is public and the license is visible.**

### 28257 — Agents or clients used for testing

**Draft answer:**

Codex's in-app browser with WebMCP support and GPT-5.6 Terra were used for live discovery, routing, and end-to-end tool-flow tests. GPT-5.6 Luna was used for page, saved-artifact, and injection baselines; its available browser runtime did not expose `document.modelContext` or the WebMCP tool-list operation, so I am not claiming a successful Luna tool-routing pass.

### 28258 — AI tools leveraged

**Draft answer:**

OpenAI Codex was used for product specification, implementation, refactoring, automated tests, browser QA, responsive UI review, debugging, security and privacy checks, and submission preparation. GPT-5.6 Terra and Luna were used for cross-runtime evaluation of the browser experience. The shipped website itself does not call a paid model: the visitor's chosen agent supplies reasoning through WebMCP while the site supplies canonical data and bounded actions.

### 28259 — Learning level

**Draft answer:** Significant

### 28260 — Career AI value

**Draft answer:** Yes
