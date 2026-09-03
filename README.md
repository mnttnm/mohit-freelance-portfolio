# MCP, Meet PCM

PCM is Mohit Tater's **Portfolio Context Manager**: a WebMCP-enabled website that a visitor and their agent can investigate together, reshape around a real project, save as a durable takeaway, and carry into a human-reviewed inquiry.

The ordinary portfolio remains fully usable without WebMCP. In a compatible browser, the site exposes a focused capability layer through `document.modelContext.registerTool`.

## What people and agents can do together

Most portfolios make every visitor repeat the same manual process: browse several pages, compare projects, remember which evidence mattered, and rewrite their context in a blank contact form. PCM lets the visitor's agent combine context it already knows with facts the portfolio owns.

The result is a five-step journey:

1. Establish a canonical understanding of Mohit's experience and services.
2. Rank relevant work using approved evidence and explicit evidence gaps.
3. Create visible, visitor-specific portfolio context.
4. Save selected evidence as a public-by-link web and PDF takeaway, after confirmation.
5. Prepare an editable project inquiry without sending it.

## WebMCP tools

| Tool | Purpose | Changes the page? |
| --- | --- | --- |
| `understand_mohit` | Return a concise canonical profile, services, strengths, and public links. | No |
| `find_relevant_work` | Rank public projects against the visitor's goal and priorities. | No |
| `create_personalized_view` | Present a focused portfolio briefing with selected evidence and next questions. | Yes, visibly and reversibly |
| `save_takeaway` | Create a durable, public-by-link takeaway after explicit confirmation. | Creates a new web/PDF artifact |
| `prepare_project_inquiry` | Build an editable brief and prefill the contact form. | Yes, but never sends |

The tools are registered in [`src/lib/webmcp/register-tools.ts`](src/lib/webmcp/register-tools.ts). Canonical portfolio claims live in [`src/content`](src/content), so the human interface and agent results use the same reviewed source material.

## Architecture

```text
Compatible visitor agent
        |
        | document.modelContext
        v
Five bounded WebMCP tools
        |
        +--> Canonical profile and project evidence
        +--> Deterministic relevance scoring
        +--> Visible React briefing / inquiry state
        +--> Astro API --> private Vercel Blob storage
                              |
                              +--> public-by-link web takeaway
                              +--> server-generated PDF
```

- **Web app:** Astro 7 with React islands, deployed on Vercel.
- **Tool contracts:** strict Zod schemas with bounded structured results.
- **Reasoning boundary:** the visitor's agent reasons over context; the site supplies canonical facts, deterministic matching, state, and presentation. The site makes no paid model call.
- **Session state:** personalized views and prepared inquiries remain in versioned browser-session storage and can be reset.
- **Durable artifacts:** confirmed takeaways use an HMAC-derived opaque ID and private Blob-backed persistence.
- **Safety:** saved takeaways require explicit public-link confirmation; inquiry tools prepare but never send; stored public snapshots exclude names, emails, transcripts, and agent reasoning.
- **Deployment controls:** response headers enable the same-origin tools policy, and the production save endpoint is designed for rate limiting.

## Run locally

Requirements: Node.js 24 and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:4321` in ChatGPT's in-app browser or Google Chrome with WebMCP enabled. Local development uses file-backed takeaway storage unless overridden.

## Environment

The WebMCP read and in-session tools do not require credentials. Durable takeaways in preview or production require:

```text
TAKEAWAY_STORAGE_DRIVER=vercel-blob
BLOB_READ_WRITE_TOKEN=...
TAKEAWAY_ID_SECRET=at-least-32-random-characters
```

The existing contact form uses `RESEND_API_KEY`. `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, and PostHog variables are optional; see [`.env.example`](.env.example). Never commit real environment values.

## Verify

```bash
npm test
npm run build
npm audit --omit=dev
```

The current suite covers tool discovery shape, strict contracts, deterministic relevance, weak-match honesty, personalized and inquiry state, contact-form prefill/clear behavior, public-link confirmation, idempotent takeaway persistence, and PDF generation.

Browser acceptance evidence and the complete test matrix are in [`docs/webmcp/browser-test-report.md`](docs/webmcp/browser-test-report.md) and [`docs/webmcp/browser-test-plan.md`](docs/webmcp/browser-test-plan.md).

## Demo path

The recommended judge flow is documented in [`docs/webmcp/demo-run-of-show.md`](docs/webmcp/demo-run-of-show.md). It starts with a founder's real evaluation problem, moves through evidence and personalization, creates a confirmed takeaway, and ends on an editable inquiry clearly marked as not sent.

## Known limitations

- WebMCP is experimental, and availability varies across browser and agent runtimes.
- Saved takeaways are public to anyone with the unguessable link; there is no account or revocation interface in this release.
- The inquiry tool never sends a message. Human review and final form submission are intentional boundaries.
- The portfolio contains approved summaries of private client work; it does not expose private client source code or confidential data.

## License

MIT — see [LICENSE](./LICENSE).
