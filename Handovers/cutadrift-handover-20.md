# Cut Adrift — Handover Document 20
**Updated:** 19 June 2026
**Session work:** Deceased's employer letter (bereavement) — new intake question + mandatory plan section + DIWM panel; "Tell my family" message DIWM panels for bereavement and diagnosis; insurance call script DIWM panel for diagnosis; weeks_ago routing fix so `deceased_employment` is asked on all paths; sitemap/homepage link fix kicked off; `test-cutadrift.sh` run against live site (23/30 passed, no regressions from this session)
**Supersedes:** Handover 19

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
│   ├── sitemap.xml                      ← 42 URLs (4 known omissions — see Outstanding)
│   ├── when-someone-dies/               ← bereavement tool (NOW collects deceased_employment too)
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

# Deploy pages
cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --branch=main --commit-dirty=true 2>&1

# Deploy worker
cd ~/Desktop/Cut\ Adrift && npx wrangler deploy 2>&1
```

Three separate worker+pages deploy pairs went out this session (one per feature, in order):
1. Worker `ecadbe3b-337b-49a9-832a-543bf80fdd2e` — deceased_employment intake + employer-notify DIWM
2. Worker `7599ed52` — tell-my-family DIWM panels (bereavement + diagnosis)
3. Worker `64a36fab` — insurance-call DIWM panel (diagnosis)

Latest worker is `64a36fab`. Latest commit: `6366bf0`. All pushed to `origin/main` (fast-forwarded `aa1fe8f..6366bf0`).

---

## Worker — architecture changes this session

Three new DIWM tool keys added across all four maps (`MODELS`, `MAX_TOKENS`, `SYSTEM_PROMPTS`, `INTAKE_FORMATTERS`):

```javascript
// Added to MODELS (all Sonnet)
'bereavement-employer-notify': 'claude-sonnet-4-6',
'bereavement-family-message':  'claude-sonnet-4-6',
'diagnosis-family-message':    'claude-sonnet-4-6',
'diagnosis-insurance-call':    'claude-sonnet-4-6',

// Added to MAX_TOKENS
'bereavement-employer-notify': 600,   // note: 600, not the usual 500 — confirm reason if revisiting
'bereavement-family-message':  500,
'diagnosis-family-message':    500,
'diagnosis-insurance-call':    500,
```

New `LABELS` map: `deceasedEmployment` (`employed` / `self_employed` / `not_working` / `not_sure`).

---

## Bereavement tool — changes this session

### New intake question: `deceased_employment`
`Public/when-someone-dies/index.html` now asks **"Were they employed or running a business when they died?"** (Employed / Self-employed / Not working / Not sure), stored as `deceased_employment`.
- Step inserted after `dependants`, before `bridge`.
- Added to `FULL_SEQ` and the progress-bar array.
- **Deliberately NOT added to `LAYER1`** — this question is relevant regardless of timeframe, so it's asked on every path including `weeks_ago`.

**Routing gotcha (important for next session):** the `weeks_ago` (Path C) flow doesn't walk the `LAYER1` region of `FULL_SEQ` at all — it hardcodes a direct jump from `weeks-intro` straight to `funeral_status` via `skipTo()` and a `getNext()` branch. Simply adding a field to `FULL_SEQ` (even outside `LAYER1`) does **not** make it appear on `weeks_ago` — that path bypasses the whole region. The fix: reroute `weeks-intro → deceased_employment` (both the `skipTo()` call and the `getNext` branch), then let `getNext` walk forward as normal (it already skips `bridge` for weeks_ago and lands on `funeral_status`). **Any future field meant to appear on weeks_ago must be wired into this hardcoded jump, not just added to `FULL_SEQ`.**

### New plan section: "Notifying their employer"
Mandatory in Path B (Section 3b) and Path C (Section 2b), output only when `deceased_employment === 'employed'`. Covers: telling HR/payroll, final pay & entitlements (holiday pay, death-in-service, workplace pension/KiwiSaver), returning equipment and closing access, suggested wording — with country-specific entitlements.
- `self_employed` / `not_working` / `not_sure` → section omitted.

### New DIWM panel: bereavement-employer-notify
Anchored to the **"notifying their employer"** heading. Collects: employer name, deceased's job title, your relationship, optional HR/payroll contact name. Drafts a notification letter/email.

---

## "Tell my family" message — changes this session

### Bereavement: "The people around you"
Existing Section 2 content (previously paraphrased, variable wording) **pinned to a fixed heading `## The people around you`**, always emitted on Path B, so the DIWM matcher anchors reliably.
- **Path A (crisis):** no sections at all by design — panel doesn't appear.
- **Path C (weeks_ago):** estate/admin focused, no people section currently exists — panel doesn't appear there either.
- **Note:** if user feedback indicates weeks_ago users want this too, the section would need to be added to the Path C prompt first (see the closing-line precedent in Handover 19 for how a "carry into Path C" instruction was scoped).

### Diagnosis: "The people in your life"
New dedicated, always-included section `## The people in your life`, covering: disclosure is one-way (can't be undone), pacing, asking someone to pass the word on for you, and permission to keep distance from people who aren't helpful right now.

### Two new DIWM panels
- **bereavement-family-message** — anchored to "people around you". Fields: who to tell, tone (gentle / matter-of-fact), optional concern (free text). Uses `relationship` from intake for context.
- **diagnosis-family-message** — anchored to "people in your life". Same fields. Uses the standard diagnosis context lines; system prompt never names the condition unless the person already named it themselves.

Both draft a short message suitable to send or read aloud.

---

## Insurance call script — changes this session (diagnosis only)

### New plan section: "Your insurance"
**Conditional**, not mandatory — only emitted when relevant (employed/self-employed, `work_impact` yes/unsure, or signs they hold cover). Covers income protection, life, trauma, and TPD cover. Distinct from the scheme-attached cover already discussed in the existing **"Your income"** section.

**Verified no anchor collision:** the KiwiSaver DIWM panel stays correctly anchored to "Your income"; the new insurance panel anchors to "Your insurance" — confirmed these don't cross-match.

### New DIWM panel: diagnosis-insurance-call
Mirrors the existing KiwiSaver call script pattern: a three-block phone script (What to say / What to ask / What to listen for) for calling an insurer about a claim, tailored to policy type, never commenting on the diagnosis itself. Fields: insurer name (optional), policy type (income protection / life / trauma / not sure), optional policy number.
- Won't appear on plans where insurance clearly doesn't apply (not working, no indication of cover) — by design, consistent with the "output only when relevant" instruction.

---

## "Do it with me" — full current registry

### Diagnosis (4 panels live)
| Section heading | Panel | Built |
|---|---|---|
| "Your employment rights" | Draft my employer email | Session 18 |
| "Your income" | Script for my KiwiSaver call | Session 18 |
| "The people in your life" | Draft a message to tell someone | Session 20 (new) |
| "Your insurance" (conditional) | Script for my insurance call | Session 20 (new) |

### Bereavement (4 panels live)
| Section heading | Panel | Built |
|---|---|---|
| "Your work and leave" (Path B, employed) | Draft a bereavement leave email | Session 19 |
| Estate/bank section | Draft a letter notifying the bank | Session 19 |
| "Notifying their employer" (Path B/C, conditional) | Draft a letter to deceased's employer | Session 20 (new) |
| "The people around you" (Path B only) | Draft a message to tell someone | Session 20 (new) |

### Phase 3 — STILL NOT BUILT (carried from Handover 19, unchanged)
- **Incapacity/Carer:** "Draft message to family coordinating care" + "Prepare questions for GP/specialist appointment"
- **Not Redundant:** integrate the same DIWM pattern into the existing cover-letter tool

---

## Test results this session

**Important:** the `/tmp/test_suite.mjs` E2E scenario harness built in session 19 (checks `stop_reason`, closing-line presence, heading-anchor matches, markdown-leak per scenario) **was lost** — `/tmp/` doesn't persist between Claude Code sessions. It was never re-saved into the repo. **This should be rebuilt and saved into the repo** (e.g. `tests/` or `Handovers/`) so it survives.

In its place, ran the older `test-cutadrift.sh` (HTTP/content status checker, not a scenario runner) against the live site and worker:

**23 passed, 7 failed.**

| Section | Result |
|---|---|
| Core pages | 5/6 (1 false alarm) |
| NZ guide + specific pages | 6/6 ✅ |
| Assets | 4/4 ✅ |
| Sitemap contains all pages | 2/6 (4 real omissions) |
| Content checks | 5/7 (1 false alarm, 1 real) |
| Worker (AI engine) | 1/1 ✅ (POST → 200) |

**2 false alarms** (test-assumption issues, not bugs):
- www redirect — site correctly 301-redirects `www.cutadrift.org` → `https://cutadrift.org/`; test expected 200 and doesn't follow redirects.
- Homepage "Bereavement guides" — section exists but capitalised; test greps case-sensitively for lowercase "guides".

**5 real findings, all pre-existing and unrelated to this session's work:**
- 4 guide pages missing from `sitemap.xml`: `kiwisaver-death-claim-nz`, `how-to-register-a-death-nz`, `nz-probate-guide`, `acc-death-benefit-nz`. All return 200 and are linked from the NZ guide, just absent from the 42 `<loc>` entries.
- Homepage doesn't link to `what-to-do-when-someone-dies-nz` by slug — the guides section exists but doesn't deep-link to this page.

**None of the 7 failures touch any file changed this session.** The worker POST returning 200 confirms basic health, but **this suite does not exercise the new DIWM panel payloads** — it's an HTTP/content checker, not a scenario runner. It confirms the site didn't break; it does not confirm the three new features work end-to-end.

A fix for the sitemap omissions and homepage NZ-guide link was **kicked off at the end of this session.** Status as of last check: the 4 missing sitemap URLs were being added directly to `sitemap.xml`; for the homepage, **option 2 (add a featured "New Zealand" link alongside the existing country picker) was chosen over option 1 (repointing the existing "New Zealand →" entry)** — this preserves the country picker as a clean symmetric row (each country → its own guides index), since NZ has 30+ guide pages reachable from that index and repointing it would have made NZ the only country that skips its index. **Confirm both changes were committed and deployed before treating this as done.**

---

## Outstanding tasks

### ⚡ PRIORITY

**1. Confirm sitemap.xml + homepage NZ guide link fix landed and deployed**
Kicked off end of session 20 (4 missing guide pages + homepage deep-link). Verify committed and live.

**2. Manual spot-check the three new DIWM panels live in browser**
Generate one bereavement Path B plan (employed) and confirm "Notifying their employer" and "The people around you" panels both appear and produce sensible output. Generate one diagnosis plan (employed, insurance-relevant) and confirm "The people in your life" and "Your insurance" panels appear correctly. The automated suite can't verify this.

**3. Rebuild and persist the E2E scenario test harness**
Lost from `/tmp/` between sessions. Should live in the repo (e.g. `tests/test_suite.mjs`) going forward — it's the only check that verifies `stop_reason`, closing-line presence, and DIWM heading anchors, all of which matter more now given the new mandatory/conditional sections added this session.

**4. Build "Do it with me" — Phase 3** (carried from Handover 19, unchanged)
- Incapacity/Carer: family-coordination message + GP/specialist question prep
- Not Redundant: integrate same pattern into cover-letter tool

**5. GSC Request Indexing — corrected pages** (carried from session 16)
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

**6. Check disclaimers on 4 remaining what-to-do pages**
```bash
grep -L "general information only\|page-disclaimer" \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-au/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-ireland/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-canada/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-us/index.html
```

### Ongoing
7. **Outreach follow-up** — 5 bereavement orgs contacted session 8; follow-up due week of 23 June 2026
8. **OG image** — placeholder still in place; real branded image outstanding
9. **Feedback form** — confirm still feeding Google Sheet with `[Cut Adrift]` prefix
10. **Best Man notice board redesign** — see session 16 handover
11. **Best Man placeholder testimonials** — James P., May 2026 on both sites; replace with real quotes
12. **GSC indexing queue** — remaining ~24 guide pages (see session 16)
13. **Diagnosis tool guide pages** — 30 pages (5 per country) not yet built
14. **Consider:** extending the bereavement "tell my family" panel to Path C (weeks_ago) if feedback indicates it's needed there — currently scoped to Path B only since no people-section exists on Path C
15. **Consider:** applying the "Your first action" closing line to the carer tool once its real prompt is built (currently a stub)

---

## Commits this session

| Commit | Message |
|---|---|
| `1df25ec` | Add deceased_employment intake question and employer-notify DIWM panel (Phase 2b) |
| `d55f7b3` | Add tell-my-family DIWM panels for bereavement and diagnosis |
| `6366bf0` | Add insurance-call DIWM panel for diagnosis |

All three pushed to `origin/main` (fast-forwarded `aa1fe8f..6366bf0`).

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
| 19 | "Do it with me" Phase 2 (bereavement leave email + bank letter); bereavement employment question added to intake; mandatory "Your work and leave" plan section; leave-email matcher fixed to a dedicated heading; "first action" closing line added to all sectioned plans; bereavement+incapacity max_tokens 2000→3000; 6-scenario E2E suite passed. Commits aa177b2 + 8625e44 |
| 20 | Deceased's employer letter (bereavement): new `deceased_employment` intake question + weeks_ago routing fix + mandatory "Notifying their employer" section + DIWM panel. "Tell my family" message: pinned/added fixed headings + DIWM panels for bereavement and diagnosis. Insurance call script: conditional "Your insurance" section + DIWM panel for diagnosis. Sitemap/homepage NZ-link fix kicked off. `test-cutadrift.sh` run live: 23/30 passed, 5 real pre-existing findings unrelated to this session, 2 false alarms. E2E scenario harness lost from `/tmp/`, needs rebuilding into the repo. Commits 1df25ec + d55f7b3 + 6366bf0, all pushed.
