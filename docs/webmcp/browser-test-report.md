# WebMCP browser test report

Base commit: `8bf783f` plus the scoped working-tree implementation
Preview deployment: `dpl_9ztuSTSKibjcfoCQTdmFF6fEtQ4G`
Preview URL: `https://mohit-freelance-portfolio-gusrj3z5z-tatermohit.vercel.app`
Production deployment: `dpl_9NqmdH1ArdY9u5bmWAjAFrwm3vBE` from commit `1df9bbd`
Production URL: `https://mohittater.in/`
Environment: local Astro 7 development server and Vercel preview on Node.js 24
Browser: Codex built-in browser
Model: current Codex task plus separate GPT-5.6 Luna and Terra QA tasks
Date: 2026-09-04

## Summary

- Automated gates: passed — 29 tests across 9 files, design-token lint, production build, `git diff --check`, and a production dependency audit with 0 vulnerabilities.
- Local P0 functional behavior: passed for discovery, canonical overview, golden relevance, visible personalization, reload persistence, confirmation gate, durable save, idempotent retry, saved-page rendering, and unsent inquiry preparation.
- Preview infrastructure: passed for HTTPS, required response headers, private Blob reads across deployments, saved-page/API availability, and WAF rate limiting. The sixth same-IP save request returned `429` as configured.
- PDF download: passed. The saved page now offers a direct `Download PDF` action backed by a server-generated attachment, while `Print page` remains available for browsers that expose their native print dialog. The built-in browser observed the download event, and both local and deployed files were checked with `pdfinfo`/`pdftotext`; the local two-page Letter rendering was also visually inspected.
- Existing-site baseline: `/`, `/projects`, and `/about` rendered with their expected primary heading. The agent panel was absent until invoked, and exactly five tools were available on each ordinary portfolio page.
- External side effects intentionally skipped: contact-form submission, Resend delivery, and every real inquiry or message.
- Model coverage: Terra selected the intended tool in 5/5 routing prompts and completed the available P0 flow. Its inquiry-clear finding was fixed and regression-tested. Luna completed page, saved-artifact, and injection baselines, but this browser runtime rejects `webmcp_list_tools` and exposes no `document.modelContext`, so Luna's real tool-routing rehearsal remains blocked by the platform.
- Public release: passed. GitHub serves the source and recognized MIT license publicly; Vercel's build log identifies commit `1df9bbd`; the public production URL completed the golden flow without owner authentication and produced no deployment error log entries.

## Final UI polish rerun — 2026-09-04

- Replaced the dense modal-like agent surface with a restrained editorial briefing that matches the portfolio's cream, forest-green, serif, and Instrument Sans design language.
- Separated the personalized portfolio context from the project brief, with clear tab state, evidence hierarchy, human-review language, and a deliberate end state for the demo.
- Verified the desktop panel and 390px mobile bottom sheet without horizontal overflow, clipped actions, or new browser errors.
- Verified that minimizing the agent experience persists across portfolio navigation and that the compact launcher reliably restores it.
- Rechecked the saved takeaway at desktop and mobile widths, its missing-link state, and the direct PDF download. The final two-page PDF passed metadata/text extraction and rendered-page inspection without clipping, overlap, or broken glyphs.
- Expanded the project brief to show editable problem, stage, timeline, budget, stack, goals, questions, optional contact details, and canonical project links. A browser edit to the structured timeline regenerated both the message preview and contact-form value.
- Moved all six “More projects” records into the shared canonical content library. The rendered page exposes stable on-site anchors, correct live destinations, no duplicate IDs, no horizontal overflow, and no new browser errors.

## Results

| ID | Result | Tool called | Visible state verified | Persistence verified | Notes/evidence |
| --- | --- | --- | --- | --- | --- |
| PF-01 | Pass | n/a | n/a | n/a | Install/build state is healthy; 29/29 tests passed across 9 files; token lint and Astro server build passed; audit reports 0 vulnerabilities; local takeaway data is ignored. |
| PF-02 | Pass | n/a | Yes | n/a | Home, Projects, and About rendered normally with no default agent panel. Desktop and narrow layouts were inspected; the mobile panel does not overlap the fixed header. |
| PF-03 | Pass | n/a | n/a | Yes | Production deployment `dpl_9NqmdH1ArdY9u5bmWAjAFrwm3vBE` is READY from commit `1df9bbd`. HTTPS, `Origin-Agent-Cluster: ?1`, and `Permissions-Policy: tools=(self)` were observed. Private Blob takeaway data remained readable and the production firewall rule is enabled at 5 saves per IP per 600 seconds. |
| DISC-01 | Pass | none | Yes | n/a | Exactly `understand_mohit`, `find_relevant_work`, `create_personalized_view`, `save_takeaway`, and `prepare_project_inquiry` were discovered on `/`, `/projects`, and `/about`. Saved takeaway pages exposed no WebMCP tools. |
| DISC-02 | Partial; Luna runtime blocked | n/a | n/a | n/a | Terra chose the intended tool in 5/5 fresh prompts. Luna's browser backend rejects `webmcp_list_tools`, so its five real routing runs could not observe or invoke the registered tools. |
| UND-01 | Pass, model coverage pending | `understand_mohit` | No UI mutation, as expected | n/a | Returned the canonical role, Bengaluru location, services, strengths, experience, best-fit work, project IDs, and public links within the output budget. |
| REL-01 | Pass, model coverage pending | `find_relevant_work` | n/a | n/a | Golden founder query returned AI Resizing Studio, ReviewHub, and Slicely with approved evidence and explicit gaps. |
| REL-02 | Pass in automated test | `find_relevant_work` | n/a | n/a | Dashboard-focused fixture ranks `dashboard-skill` first and preserves the intended top-three set. |
| REL-03 | Pass in automated test | `find_relevant_work` | n/a | n/a | Firmware-certification fixture does not manufacture supporting evidence and reports the gap. |
| REL-04 | Pass in automated test | `find_relevant_work` | n/a | n/a | Generic query returns bounded representative work and asks for sharper context. |
| PER-01 | Pass, model coverage pending | `create_personalized_view` | Yes | Yes | A single labelled collaboration panel appeared with canonical projects, evidence, questions, save/inquiry/reset actions, and no context in the URL. The complete state returned after reload. |
| PER-02 | Pass in browser sweep | `create_personalized_view` | Yes | Yes | Replacement remained a single panel; reset removed the stored view and it did not return after reload. |
| PER-03 | Pass in automated test | `create_personalized_view` | Yes | n/a | Valid IDs are preserved while fake IDs are ignored or deterministically replaced; no broken project link is created. |
| SAVE-01 | Pass, model coverage pending | `save_takeaway` | Yes | n/a | `confirmedPublic: false` returned `confirmation_required` and produced no artifact URL. |
| SAVE-02 | Pass, model coverage pending | `save_takeaway` | Yes | Yes | Local browser save produced a polished, noindex, printable same-origin page. It survived reload/new navigation; the preview API and page read durable private Blob data across deployments. |
| SAVE-03 | Pass | `save_takeaway` | n/a | Yes | Exact retry returned `existing` with the identical opaque ID and URL. |
| SAVE-04 | Pass | n/a | Yes, downloaded and rendered PDF | n/a | `Download PDF` triggered a real built-in-browser download event. The deployed endpoint returned `200`, `application/pdf`, and an attachment filename. The two-page Letter output has readable public links and text, intact project cards, deliberate notes content, no JavaScript, and no screen-only controls. |
| INQ-01 | Pass in browser and Terra coverage | `prepare_project_inquiry` | Yes | Yes | The preview exposes problem, stage, timeline, budget, stack, goals, questions, optional contact identity, and canonical project links. Editing structured context regenerates the message and contact-form value; `submitted` stays false. Clear removes both stored state and visible form values. No contact action or Resend request was made. |
| INQ-02 | Pass | `prepare_project_inquiry` | Yes | Yes | Omitting name/email left them blank; no identity was invented. |
| INQ-03 | Pass in automated test | `prepare_project_inquiry` | Yes | n/a | Long structured input is deterministically summarized within the contact-message budget without slicing through a field label. |
| SEC-01 | Pass in browser/test coverage | personalization/save | Yes | Yes | Prompt-like content remains visitor-authored data and does not alter registration, navigate, or expose environment values. |
| SEC-02 | Pass in automated and rendered-page coverage | `save_takeaway` | Yes | Yes | HTML/script-shaped strings remain inert; no injected markup or executable script appeared in the saved page. |
| SEC-03 | Pass in browser sweep | personalization/inquiry | Yes | Yes | Synthetic private context stayed out of URL, title, canonical metadata, and browser logs; versioned session state is cleared by Reset. |
| SEC-04 | Pass in automated/API coverage | inquiry/save | Yes | Yes | Public snapshot schema excludes name, email, transcript, idempotency key, and provider metadata. |
| SEC-05 | Pass | n/a | Yes | n/a | Malformed and well-formed missing IDs returned the designed unavailable state without Blob, repository, stack, or neighboring-ID leakage. |
| A11Y-01 | Pass in browser sweep | personalization/inquiry | Yes | n/a | Focusable controls, logical panel actions, editable fields, and no observed keyboard trap. |
| A11Y-02 | Pass | personalization/inquiry | Yes | n/a | Panel, personalized region, and inquiry preview expose clear headings, regions, action names, and polite status text in the accessibility tree. |
| A11Y-03 | Pass in browser sweep | personalization/inquiry | Yes | n/a | Reduced-motion inspection left all content visible and operations usable. |
| RESP-01 | Pass in browser sweep | personalization/inquiry | Yes | n/a | Phone-sized inspection showed wrapping controls and no fixed-header overlap or horizontal clipping. |
| ERR-01 | Partial; timed fixture pending | `save_takeaway` | n/a | n/a | Repository/API failures map to a retryable storage error without a false URL. The full fail-then-restore browser fixture was not retained in the final public build. |
| ERR-02 | Partial; timed fixture pending | state-changing tools | n/a | n/a | The execution signal is forwarded to network work and late success is guarded after cancellation. A timed built-in-browser cancellation fixture was not retained in the final public build. |
| ERR-03 | Pass in automated test | personalization/inquiry | n/a | Yes | Corrupt/future session records are rejected without crashing the ordinary portfolio. |
| ERR-04 | Pass in automated test | n/a | Yes | Registration is an inert no-op without WebMCP and no empty panel appears. |
| REGRESSION | Pass with email success skipped | n/a | Yes | Existing navigation, primary content, project surfaces, and contact form remained usable; no new error-level browser console entry or preview runtime error was observed. Real delivery was deliberately not tested. |

## Open coverage and blockers

1. **Release gate — GPT-5.6 Luna:** Terra's available routing and P0 coverage is complete. Luna's browser environment currently rejects the WebMCP tool-list operation and does not expose the page's model context, so its real tool-routing and invocation rehearsal must be rerun when that runtime capability is available.
2. **Preview access:** preview deployments remain protected by Vercel Authentication. The public production URL is unprotected and received the complete signed-out browser pass.
3. **Real email delivery:** intentionally skipped. Test only with explicit approval and a test inbox.

## Release verdict

**Public release verified; submission media remains.** The public repository and MIT license, exact production deployment, security controls, storage, direct PDF download, desktop/mobile UI, and production golden flow pass. Luna routing remains a disclosed client-runtime coverage gap rather than a demonstrated implementation defect. No real inquiry was sent. The public demo video and final Devpost submission are still outstanding.
