# Cut Adrift — Handover Document 18
**Updated:** 18 June 2026
**Session work:** "Do it with me" Phase 1 built and deployed (diagnosis employer email + KiwiSaver call script); sitemap updated to 42 URLs; GSC indexing requested for diagnosis tool
**Supersedes:** Handover 17

---

## Project overview

**URL:** https://cutadrift.org
**Purpose:** Free crisis navigation tools for life's hardest moments.
**Entity:** TNW Limited (NZ registered)
**GitHub:** `waynemstevens-lab/cut-adrift` (private)
**Cloudflare Pages project:** `cutadrift`
**Worker:** `cutadrift-engine`
**KV namespace ID:** `3a74818b39634ca494158c8dc55d8cd9`

---

## Local file structure

```
~/Desktop/Cut Adrift/
├── Public/                              ← deploy root
│   ├── index.html                       ← homepage (4 tool cards)
│   ├── sitemap.xml                      ← 42 URLs (diagnosis tool now included)
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── og-image.png                     ← placeholder; real image still outstanding
│   ├── privacy/index.html
│   ├── terms/index.html
│   │
│   ├── when-someone-dies/               ← bereavement tool
│   ├── when-someone-cant-manage/        ← incapacity/carer tool
│   ├── when-you-get-a-diagnosis/        ← diagnosis tool (session 17)
│   ├── plan/                            ← shared plan renderer (now hosts "Do it with me" panels)
│   │
│   ├── guides-nz/ … guides-us/         ← 6 country guide index pages
│   └── [30 guide article pages]
│
└── Handovers/
```

---

## Deploy commands

```bash
# Commit and push (from Cut Adrift/)
cd ~/Desktop/Cut\ Adrift && git add -A && git commit -m "msg" && git push

# Deploy pages — two approaches, both work:
# Session 17/18 approach (Claude Code used this, confirmed working):
cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --branch=main 2>&1
# (add --commit-dirty=true to silence the dirty-working-dir warning)
# Previous sessions approach:
cd ~/Desktop/Cut\ Adrift/Public && npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true

# Deploy worker (from Cut Adrift/)
cd ~/Desktop/Cut\ Adrift && npx wrangler deploy 2>&1
```

---

## Worker — current architecture (post session 18)

**File:** `~/Desktop/Cut Adrift/worker.js`

The worker keys everything off `intake.tool`: it selects the system prompt, intake formatter, model, and max-tokens from per-tool maps. Adding a new task type means adding entries to all four maps under a new tool key. "Do it with me" reuses this exact mechanism — each task is just another `tool` key.

### Model map (per-tool)
```javascript
const MODELS = {
  bereavement: 'claude-haiku-4-5-20251001',
  incapacity:  'claude-haiku-4-5-20251001',
  carer:       'claude-haiku-4-5-20251001',
  diagnosis:   'claude-sonnet-4-6',
  // "Do it with me" drafts — Sonnet for tone/sensitivity on disclosure wording
  'diagnosis-employer-email': 'claude-sonnet-4-6',
  'diagnosis-kiwisaver-call': 'claude-sonnet-4-6'
};
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
```

### Max tokens map (per-tool)
```javascript
const MAX_TOKENS = {
  bereavement: 2000,
  incapacity:  2000,
  carer:       2000,
  diagnosis:   4000,
  // "Do it with me" — fast, focused, output only
  'diagnosis-employer-email': 500,
  'diagnosis-kiwisaver-call': 500
};
const DEFAULT_MAX_TOKENS = 2000;
```

The API call reads: `model: MODELS[intake.tool] || DEFAULT_MODEL` and `max_tokens: MAX_TOKENS[intake.tool] || DEFAULT_MAX_TOKENS`

### SYSTEM_PROMPTS keys
- `bereavement` — existing
- `incapacity` — existing
- `carer` — existing (stub)
- `diagnosis` — existing (session 17)
- `diagnosis-employer-email` — NEW session 18
- `diagnosis-kiwisaver-call` — NEW session 18

### INTAKE_FORMATTERS keys
- `formatBereavementIntake` — existing
- `formatIncapacityIntake` — existing
- `formatCarerIntake` — existing (placeholder)
- `formatDiagnosisIntake` — existing (session 17)
- `formatEmployerEmailIntake` — NEW session 18
- `formatKiwiSaverCallIntake` — NEW session 18
- Shared helper `diwmContextLines(intake)` builds the common country / employment / free-text context lines for both "Do it with me" formatters.

---

## "Do it with me" — Phase 1 (BUILT & DEPLOYED, session 18)

### What it is
At the end of key plan sections, a button expands an inline task panel beneath that section. The person provides a small amount of extra context and the tool drafts the specific document or script they need — ready to send with minimal editing. Not a chatbot. A focused, single-task micro-tool that closes when done.

### Technical approach (as built)
- **Inline `<div>` expansion** beneath the relevant plan section — not a modal, not a new page. All logic lives in `Public/plan/index.html`.
- After the plan renders, injection runs **only when `intake.tool === 'diagnosis'`**. It locates the relevant `<h2>` sections by matching heading text (`includes('employment rights')` and `includes('income')`), then inserts the panel after the last node of that section (stops at the next `<h2>`).
- Each panel: a subtle trigger button → expands to a **mini form** → **separate API call** to the worker (same `WORKER_URL`, streamed SSE, reusing the existing delta-parsing loop) → output renders **in the same panel** as plain text with a **Copy** button (✓ confirmation) and a **Start over** button (rebuilds the panel fresh). **Cancel** collapses it.
- Output is rendered as plain text (`white-space: pre-wrap`), NOT through `marked` — the prompts forbid markdown so the draft is clean and copy-ready.
- Styling matches the existing dark/amber aesthetic (`.diwm*` classes); panels are hidden in print via `@media print`.

### Worker side (as built)
- New `SYSTEM_PROMPTS`: `diagnosis-employer-email`, `diagnosis-kiwisaver-call` — follow the task-prompt pattern (persona → context → task → tone → strict output rules: draft only, no preamble, no markdown).
- New formatters pull `country` / `employment` / `free_text` from the stored intake (sessionStorage `cutadrift_intake`) plus the mini-form fields.
- **Max tokens: 500** each. **Model: claude-sonnet-4-6** each (chosen for sensitivity around disclosure wording).
- Rate limiting is shared with the main plan call (10 requests / IP / 24h via KV) — each "Do it with me" generation counts against the same budget.

### The two Phase 1 tasks (live)
**Employment rights section → "Draft my employer email →"**
- Collects: employer/manager name (optional), job title (optional), disclosure level (`condition_only` / `condition_name` / `full`).
- Output: a ready-to-send email (Subject line + body) that discloses exactly as much as chosen and concedes nothing in writing. Confirmed in testing: `condition_only` produced an email naming only "a health condition," requesting a conversation about sick leave/flexibility.

**Income section → "Script for my KiwiSaver call →"**
- Collects: KiwiSaver provider name (optional).
- Output: three plain-text blocks — *What to say* / *What to ask* / *What to listen for* — for a call to check insurance cover held through KiwiSaver (or the equivalent super/pension/group-benefits provider for non-NZ countries). Opens with "I'm not calling to make a claim," ends with "get it in writing." Confirmed in testing.

### Build status by tool
- **Phase 1 — Diagnosis tool (2 tasks): ✅ DONE this session.**
- **Phase 2 — Bereavement tool (2 tasks): NEXT BUILD PRIORITY.**
  - Employment rights → "Draft bereavement leave email"
  - Practical steps → "Draft letter to [bank/institution] notifying of death" (collects: institution name, deceased name, relationship; output: formal notification letter)
- **Phase 3 — Remaining tools (1–2 sessions):**
  - Incapacity/Carer: Practical steps → "Draft message to family coordinating care"; Medical → "Prepare questions for GP/specialist appointment"
  - Not Redundant: already has a cover-letter tool — integrate the same pattern

### Task prompt pattern (reference for Phase 2/3)
```
You are helping someone draft a specific [email/letter/script].
Context: [country], [employment status], [free text from their intake].
Task: Draft [specific task].
Tone: Warm, professional, ready to send with minimal editing.
Output: The draft only — no preamble, no explanation. No markdown.
```

### Design notes (followed in Phase 1)
- Button sits at the bottom of the relevant section, subtle — not a CTA.
- Panel opens below with a soft fade-in animation.
- Copy button on output — no save, no account.
- "Start over" closes and resets the panel.

---

## Diagnosis tool — full spec (reference, unchanged from session 17)

**URL:** `/when-you-get-a-diagnosis/` · **Model:** claude-sonnet-4-6 · **Max tokens:** 4000 · **Tool key:** `diagnosis`

### Questions (5 steps)
1. Country — 6-picker (NZ, AU, UK, Ireland, Canada, US, Somewhere else)
2. Who received the diagnosis? (Me / Someone close to me) — "Someone close" → bridge note to carer tool, never submits
3. Are you currently employed? (Employed / Self-employed / Not currently working)
4. Is this likely to affect your ability to work? (Yes / Unsure / No)
5. Free text — situation in their own words (need not name the diagnosis)

### Plan sections (all 8 must be present — token cap was the issue if any are missing)
1. Right now — this week
2. What not to do yet
3. Your employment rights ← now hosts "Draft my employer email" panel
4. Your income ← now hosts "Script for my KiwiSaver call" panel
5. Your treatment journey
6. Practical and legal
7. Support
8. For your family (cross-link to carer tool)

### Tone rules (in system prompt)
- Open with a brief warm human acknowledgement — a sentence, not a heading
- Never comment on prognosis, severity, or treatment efficacy
- "What not to do yet" must be substantive and country-specific
- KiwiSaver insurance prompt is mandatory in the income section
- Framing throughout: practical control, not worst-case thinking

---

## Homepage — current state

### 4-card grid (in order)
1. **Someone I love has died** → `/when-someone-dies/` (amber pin)
2. **I've had a serious diagnosis** → `/when-you-get-a-diagnosis/` (amber)
3. **When someone can no longer manage** → `/when-someone-cant-manage/` (teal)
4. **I've lost my job** → notredundant.com (external link)

Animation: diagnosis card uses the pre-existing `nth-child(2)` rule (0.50s delay); `.card:nth-child(4)` rule (0.74s) added in session 17 for the Not Redundant card.

---

## Sitemap — UPDATED this session ✅

- `/when-you-get-a-diagnosis/` **added** to `Public/sitemap.xml` (core-pages group, after the bereavement tool, `lastmod` 2026-06-18).
- URL count now **42** (was 41). Note: there is no literal count comment in the file — the count is simply the number of `<url>` entries.
- Committed and pushed: **commit `33faab6`**.
- **GSC indexing requested** for `https://cutadrift.org/when-you-get-a-diagnosis/` — done.

---

## Accessibility — WAVE audit (session 17, unchanged)

**Score:** 7.6/10 (AIM Score). Fixed in session 17: missing form label on suggest-a-tool textarea (aria-label added); duplicate Canada/US buttons in bereavement country picker (removed).

Remaining (low priority): 3 contrast "errors" are a WAVE measurement limitation on gradients/transparent backgrounds (hero card passes 8.59:1 AA+AAA); noscript alert and very-small-text alert are not real problems.

---

## Strategic notes (from session 17, still relevant)

1. **Completion rate / drop-off** — no analytics yet. Worth adding privacy-preserving tracking (server-side logs or Cloudflare Analytics) to see where people abandon the questionnaire.
2. **"What concrete thing should have happened when someone leaves?"** — they made one phone call or sent one email they wouldn't have known to send. (The "Do it with me" feature directly serves this — each task ends in a ready-to-send artefact.) Consider ending plans with a single "Your first action" prompt.
3. **State machine thinking** — future: Situation → Stage → Tasks → Check-ins. Not now.
4. **Separation tool** — decided NOT to build (risk of adding false certainty to a salvageable relationship; the site's model is navigating events that have already happened).

---

## Outstanding tasks

### ⚡ PRIORITY

**1. Build "Do it with me" — Phase 2 (bereavement tool)** ← NEXT BUILD PRIORITY
Bereavement tool, 2 tasks: "Draft bereavement leave email" (employment rights section) + "Draft letter to [bank/institution] notifying of death" (practical steps section). Reuse the session-18 mechanism: new `SYSTEM_PROMPTS` + formatter + `MODELS` + `MAX_TOKENS` (500) entries per task, and extend the panel-injection config in `Public/plan/index.html`. Note the plan-page injection is currently gated to `intake.tool === 'diagnosis'` — that gate (and the section-matching config) needs extending for bereavement. See full spec under "Do it with me" above.

**2. GSC Request Indexing — corrected pages (carried from session 16)**
```
https://cutadrift.org/uk-bereavement-support-payment/
https://cutadrift.org/uk-bereavement-leave/
https://cutadrift.org/us-social-security-survivor-benefits/
https://cutadrift.org/us-funeral-financial-assistance/
https://cutadrift.org/us-bereavement-leave/
https://cutadrift.org/what-to-do-when-someone-dies-nz/
https://cutadrift.org/uk-funeral-expenses-payment/
https://cutadrift.org/what-to-do-when-someone-dies-uk/
```

**3. Check disclaimers on 4 remaining what-to-do pages**
```bash
grep -L "general information only\|page-disclaimer" \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-au/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-ireland/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-canada/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-us/index.html
```

---

### Ongoing

4. **Outreach follow-up** — 5 bereavement orgs contacted session 8; follow-up due week of 23 June 2026
5. **OG image** — placeholder 1200×630 PNG in place; real branded image outstanding
6. **Feedback form** — confirm still feeding Google Sheet with `[Cut Adrift]` prefix
7. **Best Man notice board redesign** — see session 16 handover for full instructions
8. **Best Man placeholder testimonials** — James P., May 2026 on both sites; replace with real quotes
9. **GSC indexing queue** — remaining ~24 guide pages (see session 16 for full list)
10. **Diagnosis tool guide pages** — 30 pages (5 per country) not yet built. Same structure as bereavement guides.

### ⏰ Time-sensitive (not Cut Adrift)
- **ProductHunt promo code for RecPokerCoach expires 19 June 2026 — that's tomorrow.**

---

## Session history summary

| Session | Key work |
|---------|----------|
| 1–6 | Initial build: bereavement, incapacity, carer tools; NZ SEO pages |
| 7 | Performance improvements (Lighthouse 80, async fonts, accessibility) |
| 8 | Outreach emails to 5 bereavement organisations |
| 9 | 5 UK bereavement guides, homepage accordion |
| 10 | Homepage cards → row layout (later reverted), 5 US guides |
| 11 | Guides section redesign; AU, IE, CA guides added; 6-country homepage row |
| 12 | Complete sitemap.xml deployed (41 URLs); CA + US added to bereavement country picker |
| 13 | Trust elements; suggest form wired; Ireland/Canada guides built; GSC sitemap submitted; accuracy audit |
| 14 | Full accuracy audit NZ/AU/UK/US guide pages; 5 corrections; disclaimers added to 16 guide pages |
| 15 | Second audit pass — all remaining pages checked; 4 corrections; 30 guide pages verified |
| 16 | Hero copy tweak; GSC analysis; homepage notice board redesign (cork board, pinned cards); end-to-end URL test |
| 17 | WAVE accessibility audit (7.6/10); diagnosis tool built and deployed (Sonnet 4.6, 4000 tokens); per-tool model + token maps added to worker; homepage 4th card added; bereavement duplicate button fix; aria-label fix; "do it with me" scoped |
| 18 | "Do it with me" Phase 1 built and deployed — diagnosis employer email drafter + KiwiSaver call script (inline expanding panels in `plan/index.html`, separate worker calls, new `diagnosis-employer-email` / `diagnosis-kiwisaver-call` prompts + formatters, Sonnet 4.6, 500 max tokens each); sitemap updated to 42 URLs (commit 33faab6); GSC indexing requested for diagnosis tool |
