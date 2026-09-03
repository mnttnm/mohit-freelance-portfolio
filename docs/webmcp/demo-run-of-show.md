# MCP, Meet PCM — Under-three-minute demo

**Target length:** 2:35–2:45
**Hard limit:** under 3:00
**Format:** an edited narrated browser recording; trim agent wait time but keep every prompt, tool call, and resulting state in sequence
**Starting point:** production home page, signed out, no agent panel open
**Ending:** editable project brief with “Human review required” and the unsent contact form visible

## Recording setup

- Use the exact production URL and commit intended for Devpost.
- Open a fresh ChatGPT in-app-browser conversation or supported Chrome WebMCP client.
- Use synthetic context; do not expose email, client secrets, Vercel dashboards, browser bookmarks, or notifications.
- Set browser zoom to 100%, hide the bookmarks bar, disable unrelated extensions, and use a 16:9 recording canvas.
- Pre-copy the prompts below into a plain-text scratchpad.
- Run the full route once immediately before recording so tool availability and storage are warm.
- Capture each stage as a clean clip. Remove dead waiting time, but do not imply a result occurred before its real tool call completed.
- Record narration locally at 1080p, then upload as a **public** YouTube video and check audio from a signed-out window.

## Timed script

### 0:00–0:15 — The problem

**On screen:** Portfolio home page, then a quick scroll past representative work.

**Say:**

> A normal portfolio makes every visitor browse, compare projects, remember the useful evidence, and start again from a blank contact form. MCP, Meet PCM turns the portfolio into a context manager for the visitor and their agent.

### 0:15–0:32 — Show genuine WebMCP leverage

**Prompt:**

> Inspect this page's available website tools. List their names and explain when you would use each. Do not invoke them yet.

**On screen:** Show exactly five tools. Keep the list visible only long enough to establish breadth.

**Say:**

> The portfolio exposes five focused WebMCP tools through the page's model context: understand, research, personalize, save, and prepare an inquiry. The agent does not need to scrape the interface or guess which claims are canonical.

### 0:32–0:58 — Research with evidence and gaps

**Prompt:**

> We are a small marketing-tech team with a rough AI prototype. Find the three strongest pieces of evidence that Mohit could shape the product, design the interface, build the frontend and backend, and create a reliable human-in-the-loop workflow. Be honest about gaps.

**On screen:** Show AI Resizing Studio, ReviewHub, and Slicely, including one evidence statement and one gap.

**Say:**

> The agent combines our project context with structured portfolio evidence. Matching is deterministic, and weak evidence is reported as a gap rather than turned into a marketing claim.

### 0:58–1:28 — Turn research into a human interface

**Prompt:**

> Create a personalized view for a CTO emphasizing architecture, full-stack ownership, production delivery, and applied AI. Use the strongest three projects.

**On screen:** Let the polished portfolio context panel appear. Slowly scan the decision callout, numbered evidence rows, and next questions.

**Say:**

> A state-changing tool visibly reshapes the experience for the human. The result is private to this browser tab, uses the same canonical content as the site, and can be minimized, changed, or reset.

### 1:28–1:58 — Create a durable takeaway safely

**Prompt:**

> Save this selection for my cofounder. I confirm that anyone with the unguessable link may view the takeaway. Include the question: what should a useful first milestone prove?

**On screen:** Open the returned link. Show the green hero, project evidence, question, and **Download PDF** button. Trigger the download if it is instantaneous.

**Say:**

> With explicit public-link confirmation, the site creates an immutable, shareable web and PDF takeaway. It stores a bounded snapshot—no name, email, transcript, or hidden agent reasoning.

### 1:58–2:28 — Carry context into action without taking control

**Prompt:**

> Turn this into a project brief I can review before contacting Mohit. The product is at prototype stage, the desired timeline is six weeks, and the goal is to ship a reliable human-review workflow. Do not send anything.

**On screen:** Return to the portfolio if needed. Show the Project brief tab, stage/timeline, goals, editable message, prefilled form, and unsent boundary.

**Say:**

> The useful context carries forward into an editable brief and the existing contact form. But the agent cannot send it. The human reviews, edits, and decides whether to submit.

### 2:28–2:43 — Architecture and closing

**On screen:** Brief cut to the repository's five registrations or README architecture, then return to the unsent brief.

**Say:**

> PCM uses five bounded tool contracts, one canonical evidence layer, visible reversible state, and durable server-side artifacts. It shows an open web where agents do the broad work, websites keep authority over facts and actions, and people keep control.

**End frame:** “Human review required” and “Nothing has been sent” visible. Hold for two seconds, then stop.

## Contingency version

If tool-list narration or PDF download is slow, omit the live download click and say “available as web and PDF.” Do not speed the video above comfortable speech. Never cut the public-link confirmation or unsent-inquiry boundary; those are core product differentiators.

## Capture checklist

- [ ] Runtime is below 2:55 after export.
- [ ] Voice is intelligible without headphones and no copyrighted music is present.
- [ ] The production domain is visible at least once.
- [ ] All five tool names are readable.
- [ ] At least one tool invocation/result is unmistakable.
- [ ] The personalized UI, saved takeaway, and inquiry are shown at readable scale.
- [ ] Public-link confirmation is stated.
- [ ] The inquiry is visibly unsent.
- [ ] No secret, private client data, personal visitor data, or owner-only screen appears.
- [ ] YouTube visibility is Public, not Unlisted or Private.
- [ ] The signed-out YouTube page plays with audio and stays under three minutes.
