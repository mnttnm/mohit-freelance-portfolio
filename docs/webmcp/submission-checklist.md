# WebMCP Challenge — final submission checklist

Deadline: **September 4, 2026 at 08:00 UTC / 1:30 PM IST**. Aim to complete the final Devpost action at least 90 minutes earlier.

## 1. Lock the entry identity

- [x] Confirm the title **MCP, Meet PCM**.
- [ ] Confirm the submitter is **Individual** and country is **India**.
- [x] Select the OSI-approved MIT license.
- [x] Confirm GitHub recognizes the committed MIT license at the top of the public repository.

## 2. Make the evidence public

- [x] Review the release set and exclude unrelated `.impeccable` material plus two pre-existing design-note documents.
- [x] Search the complete repository history and working tree for committed environment files and high-confidence API-key, token, credential, and private-key patterns. The only environment-shaped file in history is the placeholder-only `.env.example`; no high-confidence secret pattern was found.
- [x] Commit the WebMCP extension with a timestamp inside the August 25–September 4 submission period (`1df9bbd`).
- [x] Push the intended commit to GitHub.
- [x] Change repository visibility to Public only after the secret/privacy review.
- [x] Open the repository without owner authentication and verify source, README, license, and run instructions are readable.

## 3. Promote the reviewed build

- [x] Configure production Blob storage and a strong `TAKEAWAY_ID_SECRET` without committing either value.
- [x] Deploy the exact reviewed implementation commit to `https://mohittater.in/` (`dpl_9NqmdH1ArdY9u5bmWAjAFrwm3vBE`).
- [x] Confirm Vercel cloned implementation commit `1df9bbd` from the public repository.
- [x] Open the site without owner authentication; no Vercel login or credentials are required.
- [x] Confirm `/`, `/projects`, `/about`, a saved takeaway, its PDF, and a missing-takeaway URL all render.
- [x] Confirm `Origin-Agent-Cluster`, `Permissions-Policy`, and the enabled 5-request/600-second IP rate limit for `POST /api/takeaways`.

## 4. Run the production golden flow

- [x] Discover exactly five WebMCP tools.
- [x] Run the founder relevant-work prompt and confirm the evidence is factual.
- [x] Create the CTO personalized view and confirm visible state, reload persistence, minimize/restore, and reset.
- [x] Verify saving without public-link confirmation creates nothing.
- [x] Confirm saving after consent returns a durable URL and an exact retry returns the same record.
- [x] Download and open the two-page PDF.
- [x] Prepare an inquiry, verify the contact form prefill, then clear it.
- [x] Confirm the inquiry was not sent and no Resend request was triggered.
- [ ] Capture clean desktop screenshots of the five required frames.

## 5. Record and publish

- [ ] Follow [`demo-run-of-show.md`](demo-run-of-show.md).
- [ ] Export below 2:55 with clear audio.
- [ ] Upload to YouTube as Public.
- [ ] Check playback, resolution, captions if used, and audio while signed out.
- [ ] Paste the final video URL into `devpost-submission.md`.

## 6. Complete Devpost

- [ ] Paste the final live URL, public repository URL, and public YouTube URL.
- [ ] Copy the reviewed prose and official form answers from `devpost-submission.md`.
- [ ] Upload 3–5 screenshots in narrative order.
- [ ] Preview the public project page and check formatting, links, thumbnail crops, and spelling.
- [ ] Complete the actual final submit action; do not leave the project as a draft.
- [ ] Open the public Devpost project page and verify the entry is live.

## 7. Freeze for judging

- [ ] Record the final commit SHA, production deployment ID, live URL, repository URL, video URL, and public Devpost URL.
- [ ] Do not change the repository, video, or live site after the deadline until judging ends September 21 at 5:00 PM Pacific / September 22 at 00:00 UTC.
- [ ] Keep production monitoring available, but document any unavoidable operational intervention before changing the judged artifact.
