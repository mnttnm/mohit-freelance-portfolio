# WebMCP Challenge — final submission checklist

Deadline: **September 4, 2026 at 08:00 UTC / 1:30 PM IST**. Aim to complete the final Devpost action at least 90 minutes earlier.

## 1. Lock the entry identity

- [x] Confirm the title **MCP, Meet PCM**.
- [ ] Confirm the submitter is **Individual** and country is **India**.
- [x] Select the OSI-approved MIT license.
- [ ] Confirm GitHub recognizes the committed MIT license at the top of the public repository.

## 2. Make the evidence public

- [ ] Review every changed/untracked file; exclude private notes and temporary data.
- [x] Search the complete repository history and working tree for committed environment files and high-confidence API-key, token, credential, and private-key patterns. The only environment-shaped file in history is the placeholder-only `.env.example`; no high-confidence secret pattern was found.
- [ ] Commit the WebMCP extension with a timestamp inside the August 25–September 4 submission period.
- [ ] Push the intended commit to GitHub.
- [ ] Change repository visibility to Public only after the secret/privacy review.
- [ ] Open the repository while signed out and verify source, README, license, and run instructions are readable.

## 3. Promote the reviewed build

- [ ] Configure production Blob storage and a strong `TAKEAWAY_ID_SECRET` without committing either value.
- [ ] Deploy the exact reviewed commit to `https://mohittater.in/`.
- [ ] Confirm the deployed commit SHA matches the public repository.
- [ ] Open the site in an incognito or non-owner browser; no Vercel login or credentials should be required.
- [ ] Confirm `/`, `/projects`, `/about`, a saved takeaway, its PDF, and a missing-takeaway URL all render.
- [ ] Confirm the required response headers and production save-rate limit remain active.

## 4. Run the production golden flow

- [ ] Discover exactly five WebMCP tools.
- [ ] Run the founder relevant-work prompt and confirm the evidence is factual.
- [ ] Create the CTO personalized view and confirm visible state, navigation persistence, minimize, and reset.
- [ ] Verify saving without public-link confirmation creates nothing.
- [ ] Confirm saving after consent returns a durable URL that survives a new tab/reload.
- [ ] Download and open the PDF.
- [ ] Prepare an inquiry, verify the contact form prefill, then clear it.
- [ ] Confirm the inquiry was not sent and no Resend request was triggered.
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
