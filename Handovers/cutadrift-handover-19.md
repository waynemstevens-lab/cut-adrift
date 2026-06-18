# Cut Adrift — Handover Document 19
**Updated:** 18 June 2026
**Session work:** "Do it with me" Phase 2 built & deployed (bereavement leave email + bank letter); bereavement employment question added to intake; mandatory "Your work and leave" section added to bereavement plans; leave-email DIWM matcher fixed; personalised "first action" closing line added to all sectioned plans; bereavement/incapacity max_tokens raised to 3000; full 6-scenario E2E suite passed
**Supersedes:** Handover 18

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
│   ├── sitemap.xml                      ← 42 URLs
│   ├── when-someone-dies/               ← bereavement tool (NOW collects employment)
│   ├── when-someone-cant-manage/        ← incapacity/carer tool
│   ├── when-you-get-a-diagnosis/        ← diagnosis tool
│   ├── plan/                            ← shared plan renderer + all "Do it with me" panels
│   └── [guides + country index pages]
└── Handovers/
```

---

## Deploy commands

```bash
# Commit and push (from Cut Adrift/)
cd ~/Desktop/Cut\ Adrift && git add -A && git commit -m "msg" && git push

# Deploy pages (confirmed working this session)
cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --branch=main --commit-dirty=true 2>&1

# Deploy worker
cd ~/Desktop/Cut\ Adrift && npx wrangler deploy 2>&1
```

Current deployed worker version: `7bba85c1` (closing line + token bump). Latest commit: `8625e44`.

---

## Worker — current architecture (post session 19)

**File:** `~/Desktop/Cut Adrift/worker.js`

The worker keys everything off `intake.tool`: it selects the system prompt, intake formatter, model, and max-tokens from per-tool maps. Adding a new task type = add entries to all four maps under a new tool key.

### MODELS
```javascript
const MODELS = {
  bereavement: 'claude-haiku-4-5-20251001',
  incapacity:  'claude-haiku-4-5-20251001',
  carer:       'claude-haiku-4-5-20251001',
  diagnosis:   'claude-sonnet-4-6',
  'diagnosis-employer-email': 'claude-sonnet-4-6',
  'diagnosis-kiwisaver-call': 'claude-sonnet-4-6',
  'bereavement-leave-email':  'claude-sonnet-4-6',
  'bereavement-bank-letter':  'claude-sonnet-4-6'
};
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
```

### MAX_TOKENS  (⚠ bereavement/incapacity raised 2000 → 3000 this session)
```javascript
const MAX_TOKENS = {
  bereavement: 3000,   // was 2000 — sectioned plans + work/leave section + closing line truncated at 2000
  incapacity:  3000,   // was 2000 — same reason
  carer:       2000,
  diagnosis:   4000,
  'diagnosis-employer-email': 500,
  'diagnosis-kiwisaver-call': 500,
  'bereavement-leave-email':  500,
  'bereavement-bank-letter':  500
};
const DEFAULT_MAX_TOKENS = 2000;
```
**Why this matters:** the bereavement leave email panel only appears when the plan contains "## Your work and leave", and the closing line is the LAST thing in the plan. At 2000 tokens, Path B/C bereavement plans hit `stop_reason: max_tokens` and truncated before the closing line (confirmed by test). If you add more required content to these prompts, watch the token budget.

### SYSTEM_PROMPTS keys
- `bereavement`, `incapacity`, `carer` (stub), `diagnosis` — plan generators
- `diagnosis-employer-email`, `diagnosis-kiwisaver-call` — "Do it with me" Phase 1
- `bereavement-leave-email`, `bereavement-bank-letter` — "Do it with me" Phase 2 (NEW this session)

### INTAKE_FORMATTERS keys
- `formatBereavementIntake` (now includes `employment`), `formatIncapacityIntake`, `formatCarerIntake`, `formatDiagnosisIntake`
- `formatEmployerEmailIntake`, `formatKiwiSaverCallIntake` (share `diwmContextLines` helper)
- `formatBereavementLeaveEmailIntake`, `formatBankLetterIntake` (NEW)

### LABELS
Added an `employment` map: `{ employed, self_employed, not_working }`. Used by `formatBereavementIntake` and the leave-email formatter.

---

## "Do it with me" — current state

### Mechanism (all in `Public/plan/index.html`)
- `DIWM_TASKS` is an object **keyed by intake tool** (`diagnosis`, `bereavement`). `injectDiwmPanels()` reads `DIWM_TASKS[intake.tool]`; if none, it does nothing. (No more hard-coded `=== 'diagnosis'` gate — fully tool-agnostic, so Phase 3 just adds a new key.)
- After the plan renders, each task's `match(headingTextLowercased)` finds the first `<h2>` it matches; the panel is inserted after that section's last node (stops at the next `<h2>`). If no heading matches, no button shows.
- Panel flow: subtle trigger → mini form → separate streamed worker call → plain-text output in the same panel with **Copy** + **Start over** (**Cancel** collapses). Output rendered via `textContent` + `white-space: pre-wrap` (NOT marked — prompts forbid markdown).
- Generic payload sent: `{ tool, country, employment, relationship, free_text }` + the form fields.

### Phase 1 — Diagnosis (live)
- **"Your employment rights" section → "Draft my employer email →"** — matcher `includes('employment rights')`. Collects employer/manager name, job title, disclosure level (condition_only / condition_name / full).
- **"Your income" section → "Script for my KiwiSaver call →"** — matcher `includes('income')`. Collects provider name (optional).

### Phase 2 — Bereavement (live, NEW this session)
- **"Your work and leave" section → "Draft a bereavement leave email →"** — matcher `includes('work and leave') || includes('time off')`. Collects employer/manager name, job title, time needed (all optional). Only appears for EMPLOYED recent-loss plans (see the work/leave section below).
- **Estate/accounts section → "Draft a letter notifying them of the death →"** — matcher matches any of `bank / estate / admin / account`. Collects institution name, deceased's full name, your relationship, optional reference number.

**Anchor history / gotcha:** the bereavement plan emits *variable* headings (the model paraphrases them). The leave email originally matched `'the people'`, then a tolerant `this week` heuristic — both anchored unreliably (landed near finance content). The durable fix was to make the worker emit a **dedicated, fixed `## Your work and leave` heading** and point the matcher at that exact phrase. When adding Phase 3 anchors, prefer a dedicated fixed heading in the prompt over guessing the model's wording.

### Phase 3 — NOT YET BUILT (next priority)
- **Incapacity/Carer:** "Draft message to family coordinating care" + "Prepare questions for GP/specialist appointment"
- **Not Redundant:** integrate the same pattern into the existing cover-letter tool

---

## Bereavement tool — changes this session

### New intake question: employment
`Public/when-someone-dies/index.html` now asks **"Are you working at the moment?"** (Employed / Self-employed / Not working), stored as `employment` (`employed` / `self_employed` / `not_working`).
- Added to `LAYER1` and `FULL_SEQ` (after `notifications_needed`, before `dependants`), and to the progress-bar sequence.
- Because it's in `LAYER1`, it is **skipped for the `weeks_ago` path** — correct, since the leave email is only relevant in the recent timeframe.

### New plan section: "Your work and leave"
The bereavement system prompt (Path B) now contains a **MANDATORY** section, output only when `employment === 'employed'`, with the exact heading `## Your work and leave`. It covers telling the employer, country-specific bereavement/tangihanga leave (NZ Holidays Act 2003: 3 days' paid for immediate family, etc.), and adding annual/sick/unpaid leave.
- `self_employed` → a `## Your business` section instead (clients/contracts), NOT "work and leave".
- `not_working` / absent → no work section.
- **Important:** the instruction had to be made forceful ("MANDATORY… never merge… exact heading") because haiku paraphrases headings and initially folded the content into "The people"/"This week". Verified it now appears reliably for employed Path B.
- Path A (crisis) does NOT get this section.

---

## "Your first action" closing line (NEW this session)

Every **sectioned** plan now ends with a single personalised sentence beginning exactly **"The single most useful thing you can do today is…"** — no heading, no formatting. It renders as a plain muted paragraph (existing `#plan-content p` styling) and lands before the JS-appended disclaimer, so **no page change was needed**.

Implemented as a `## The closing line` instruction in three SYSTEM_PROMPTS:
- **diagnosis** — tailored to country/employment/work-impact (e.g. GP letter, or KiwiSaver cover if not working)
- **bereavement** — scoped to Paths B/C; **explicitly exempts Path A** (the crisis plan keeps its quiet "When you're ready for more, come back…" ending)
- **incapacity** — tailored to the care pathway (NASC referral, EPA, etc.)

The model picks the highest-value action rather than copying the examples verbatim — this is intended.

---

## E2E test suite — all passing (run against live worker this session)

| # | Scenario | stop_reason | Closing | DIWM anchor | md leak |
|---|----------|-------------|---------|-------------|---------|
| 1 | Diagnosis NZ, employed, affects work | end_turn ✅ | present ✅ | employment rights + income ✅ | none ✅ |
| 2 | Diagnosis NZ, not working | end_turn ✅ | present ✅ | income ✅ | none ✅ |
| 3 | Bereavement Path B, employed, partner | end_turn ✅ | present ✅ | work and leave ✅ | none ✅ |
| 4 | Bereavement Path B, not working, partner | end_turn ✅ | present ✅ | no work-and-leave ✅ | none ✅ |
| 5 | Bereavement Path A, barely holding, partner | end_turn ✅ | correctly absent ✅ | no sections ✅ | none ✅ |
| 6 | Incapacity NZ, parent in hospital | end_turn ✅ | present ✅ | n/a | none ✅ |

Reusable harness: `/tmp/test_suite.mjs` (node has global `fetch`; parses SSE, checks stop_reason / closing line / heading anchors / markdown leak). Worth re-saving into the repo as a permanent test if you want it to persist.

**Testing tips learned this session:**
- Hit the live worker with `curl -X POST <worker> -H "Origin: https://cutadrift.org" -H "Content-Type: application/json" -d '{...}'`. CORS requires the Origin header.
- Rate limit is 10 requests / IP / 24h (KV). Heavy testing can hit 429 ("rate_limited").
- To check truncation, watch the SSE `message_delta` event's `stop_reason` — `end_turn` good, `max_tokens` = truncated.

---

## Homepage / sitemap (unchanged this session)

- 4-card grid: bereavement, diagnosis, incapacity, Not Redundant (external).
- `sitemap.xml`: 42 URLs (includes `/when-you-get-a-diagnosis/`).

---

## Outstanding tasks

### ⚡ PRIORITY

**1. Build "Do it with me" — Phase 3** ← NEXT BUILD PRIORITY
- Incapacity/Carer: "Draft message to family coordinating care" + "Prepare questions for GP/specialist appointment"
- Not Redundant: integrate the same pattern
- Mechanism is tool-agnostic now: add a `DIWM_TASKS.incapacity` array in `plan/index.html`, plus new `SYSTEM_PROMPTS` + formatter + `MODELS` + `MAX_TOKENS` (500) entries per task. Prefer emitting a dedicated fixed heading in the incapacity prompt to anchor against (see Phase 2 gotcha).

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

### Ongoing
4. **Outreach follow-up** — 5 bereavement orgs contacted session 8; follow-up due week of 23 June 2026
5. **OG image** — placeholder 1200×630 PNG in place; real branded image outstanding
6. **Feedback form** — confirm still feeding Google Sheet with `[Cut Adrift]` prefix
7. **Best Man notice board redesign** — see session 16 handover
8. **Best Man placeholder testimonials** — James P., May 2026 on both sites; replace with real quotes
9. **GSC indexing queue** — remaining ~24 guide pages (see session 16)
10. **Diagnosis tool guide pages** — 30 pages (5 per country) not yet built
11. **Consider:** applying the "Your first action" closing line to the carer tool once its real prompt is built (currently a stub)

### ⏰ Time-sensitive (not Cut Adrift)
- **ProductHunt promo code for RecPokerCoach expires 19 June 2026 — that's tomorrow.**

---

## Session history summary

| Session | Key work |
|---------|----------|
| 1–6 | Initial build: bereavement, incapacity, carer tools; NZ SEO pages |
| 7 | Performance improvements |
| 8 | Outreach emails to 5 bereavement organisations |
| 9 | 5 UK bereavement guides, homepage accordion |
| 10 | Homepage cards → row layout (reverted), 5 US guides |
| 11 | Guides redesign; AU, IE, CA guides; 6-country homepage row |
| 12 | Complete sitemap.xml (41 URLs); CA + US bereavement country picker |
| 13 | Trust elements; suggest form; Ireland/Canada guides; GSC sitemap submitted |
| 14 | Full accuracy audit NZ/AU/UK/US; disclaimers added to 16 guide pages |
| 15 | Second audit pass; 4 corrections; 30 guide pages verified |
| 16 | Hero copy; GSC analysis; homepage notice board redesign; URL test |
| 17 | WAVE audit; diagnosis tool built; per-tool model + token maps; homepage 4th card; "do it with me" scoped |
| 18 | "Do it with me" Phase 1 (diagnosis employer email + KiwiSaver script); sitemap → 42 URLs; GSC indexing requested for diagnosis tool |
| 19 | "Do it with me" Phase 2 (bereavement leave email + bank letter); bereavement employment question added to intake; mandatory "Your work and leave" plan section; leave-email matcher fixed to a dedicated heading; "first action" closing line added to all sectioned plans (diagnosis/bereavement B-C/incapacity); bereavement+incapacity max_tokens 2000→3000; 6-scenario E2E suite passed. Commits aa177b2 + 8625e44 |
