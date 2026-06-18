# Cut Adrift — Handover Document 17
**Updated:** 18 June 2026
**Session work:** WAVE accessibility audit; diagnosis tool built and deployed; worker model/token maps added; homepage card added; bereavement duplicate button fix; aria-label accessibility fix; "do it with me" scoped
**Supersedes:** Handover 16

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
│   ├── index.html                       ← homepage (4 tool cards now)
│   ├── sitemap.xml                      ← 41 URLs (needs updating — new tool not yet in sitemap)
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── og-image.png                     ← placeholder; real image still outstanding
│   ├── privacy/index.html
│   ├── terms/index.html
│   │
│   ├── when-someone-dies/               ← bereavement tool (duplicate CA/US buttons now fixed)
│   ├── when-someone-cant-manage/        ← incapacity/carer tool
│   ├── when-you-get-a-diagnosis/        ← NEW — diagnosis tool (session 17)
│   ├── plan/                            ← shared plan renderer (all tools)
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
# Session 17 approach (Claude Code used this, confirmed working):
cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --branch=main 2>&1
# Previous sessions approach:
cd ~/Desktop/Cut\ Adrift/Public && npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true

# Deploy worker (from Cut Adrift/)
cd ~/Desktop/Cut\ Adrift && npx wrangler deploy 2>&1
```

---

## Worker — current architecture (post session 17)

**File:** `~/Desktop/Cut Adrift/worker.js`

### Model map (per-tool)
```javascript
const MODELS = {
  bereavement: 'claude-haiku-4-5-20251001',
  incapacity:  'claude-haiku-4-5-20251001',
  carer:       'claude-haiku-4-5-20251001',
  diagnosis:   'claude-sonnet-4-6',          // ← Sonnet for sensitivity
};
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
```

### Max tokens map (per-tool)
```javascript
const MAX_TOKENS = {
  bereavement: 2000,
  incapacity:  2000,
  carer:       2000,
  diagnosis:   4000,   // ← 8 sections need headroom
};
const DEFAULT_MAX_TOKENS = 2000;
```

The API call reads: `model: MODELS[intake.tool] || DEFAULT_MODEL` and `max_tokens: MAX_TOKENS[intake.tool] || DEFAULT_MAX_TOKENS`

### SYSTEM_PROMPTS keys
- `bereavement` — existing
- `incapacity` — existing
- `carer-stub` — existing
- `diagnosis` — NEW session 17

### INTAKE_FORMATTERS keys
- `formatBereavementIntake` — existing
- `formatDiagnosisIntake` — NEW session 17

---

## Diagnosis tool — full spec

**URL:** `/when-you-get-a-diagnosis/`
**Model:** claude-sonnet-4-6
**Max tokens:** 4000
**Tool key:** `diagnosis`

### Questions (5 steps)
1. Country — same 6-picker (NZ, AU, UK, Ireland, Canada, US, Somewhere else)
2. Who received the diagnosis? (Me / Someone close to me)
   - If "Someone close to me" → bridge-note step, links to carer tool, never submits
3. Are you currently employed? (Employed / Self-employed / Not currently working)
4. Is this likely to affect your ability to work? (Yes / Unsure / No)
5. Free text — "Tell us a little about your situation — you don't need to name the diagnosis if you'd prefer not to"

### Plan sections (all 8 must be present — token cap was the issue if any are missing)
1. **Right now — this week** (pause, tell one person, contact GP, don't tell employer yet)
2. **What not to do yet** (don't resign, don't agree to reduced hours verbally, don't cancel insurance, don't stop KiwiSaver, don't make irreversible financial moves)
3. **Your employment rights** (sick leave specifics, disclosure rules, what employer can/can't do, ERA 2000 / HRA 1993 protections — NZ-specific example)
4. **Your income** (sick pay, benefits, KiwiSaver insurance prompt, mortgage protection, credit card cover, life/income/trauma policies, financial adviser recommendation)
5. **Your treatment** (second opinions, bring someone to appointments, patient rights, public vs private)
6. **Practical and legal** (will, EPA, Advance Care Directive, beneficiaries, where to keep documents)
7. **Support** (condition-specific orgs if named, Health Navigator NZ fallback if unnamed, HDAS, CAB, WINZ)
8. **For your family** (cross-link to carer tool)

### Tone rules (in system prompt)
- Open with a brief warm human acknowledgement — NOT a heading, a sentence
- Never comment on prognosis, severity, or treatment efficacy
- "What not to do yet" must be substantive and country-specific
- KiwiSaver insurance prompt is mandatory in the income section
- Framing throughout: practical control, not worst-case thinking

### Bridge note (someone close to me)
- Heading: "There's a better tool for this."
- Explains this tool is for the person who received the diagnosis
- Two buttons: "Go to the carer tool →" and "Back to all tools"
- Never submits to /plan/

---

## Homepage — current state (post session 17)

### 4-card grid (in order)
1. **Someone I love has died** → `/when-someone-dies/` (amber pin)
2. **I've had a serious diagnosis** → `/when-you-get-a-diagnosis/` (amber) ← NEW — inserted directly after bereavement card
3. **When someone can no longer manage** → `/when-someone-cant-manage/` (teal)
4. **I've lost my job** → notredundant.com (external link)

Note: Card icons use emoji — verify diagnosis card icon on live site (terminal rendering was unclear).

### Card copy for diagnosis card
- Title: "I've had a serious diagnosis"
- Description: "The first week's plan — what to sort, what NOT to do yet, and the income protection cover you may not realise you have."

### Animation rule added this session
```css
.card:nth-child(4) { animation: rise 0.6s 0.74s ease forwards; }
```
This was added because inserting diagnosis as card 2 pushed Not Redundant to position 4, which had no animation rule. Diagnosis card uses the pre-existing nth-child(2) rule (0.50s delay).

---

## Accessibility — WAVE audit (session 17)

**Score:** 7.6/10 (AIM Score)
**Audit URL:** cutadrift.org homepage

### Fixed this session
- ✅ Missing form label on suggest-a-tool textarea → added `aria-label` attribute
- ✅ Duplicate Canada and United States buttons in bereavement country picker → removed

### Remaining (low priority)
- 3 contrast "errors" — WAVE limitation: cannot measure contrast on gradients/transparent backgrounds. Hero card passes 8.59:1 (WCAG AA + AAA). Cork board texture is a measurement limitation, not a genuine failure.
- Noscript element alert — not a real problem
- Very small text alert — likely footer disclaimer, acceptable

---

## Strategic notes (from ChatGPT/Grok analysis, session 17)

### Key insights worth acting on
1. **Completion rate and drop-off** — currently no analytics. Worth adding privacy-preserving tracking (server-side logs or Cloudflare Analytics) to understand where people abandon the questionnaire.
2. **"What concrete thing should have happened when someone leaves?"** — the answer is: they made one phone call or sent one email they wouldn't have known to send. The plan should end with a single "Your first action" prompt.
3. **State machine thinking** — future version: Situation → Stage → Tasks → Check-ins. Not now, but worth keeping in mind as the platform matures.
4. **Separation tool** — decided NOT to build. Concern: tool could add false certainty to a relationship breakdown that might be salvageable. The site's model is navigating events that have already happened, not decisions in progress.

---

## "Do it with me" — next feature (fully scoped)

### What it is
At the end of key plan sections, a **"Do this with me →"** button expands an inline task panel. The person provides a small amount of extra context (employer name, how much to disclose, etc.) and the tool drafts the specific document or script they need — ready to send with minimal editing.

Not a chatbot. A focused, single-task micro-tool. Closes when done.

### Technical approach
- Inline `<div>` expansion beneath the relevant plan section (not a modal, not a new page)
- Mini form collects minimum extra context
- Separate API call to worker with focused task prompt
- New SYSTEM_PROMPTS entries per task type (e.g. `diagnosis-employer-email`, `bereavement-bank-letter`)
- Max tokens: 500 — fast, focused, output only
- Output renders in same panel with a copy button

### Task prompt pattern
```
You are helping someone draft a specific [email/letter/script].
Context: [country], [employment status], [free text from their intake].
Task: Draft [specific task].
Tone: Warm, professional, ready to send with minimal editing.
Output: The draft only — no preamble, no explanation. No markdown.
```

### Tasks by tool

**Diagnosis tool (Phase 1 — build first)**
- Employment rights section → "Draft my employer email"
  - Collects: employer name, job title, how much to disclose (health condition only / condition name / full situation)
  - Output: ready-to-send email on their terms
- Income section → "Script for my KiwiSaver call"
  - Collects: KiwiSaver provider name (optional)
  - Output: what to say, what to ask, what to listen for

**Bereavement tool (Phase 2)**
- Employment rights → "Draft bereavement leave email"
- Practical steps → "Draft letter to [bank/institution] notifying of death"
  - Collects: institution name, deceased name, relationship
  - Output: formal notification letter

**Incapacity/Carer tool (Phase 3)**
- Practical steps → "Draft message to family coordinating care"
- Medical → "Prepare questions for GP/specialist appointment"

**Not Redundant (Phase 3)**
- Already has cover letter tool — integrate same pattern

### Build order
1. **Phase 1** — Diagnosis tool, 2 tasks (1 session)
2. **Phase 2** — Bereavement tool, 2 tasks (1 session)
3. **Phase 3** — Remaining tools (1–2 sessions)

### Design notes
- Button label: "Do this with me →" or "Help me write this →"
- Sits at the bottom of the relevant section, subtle — not a CTA
- Panel opens below with a soft animation
- Copy button on output — no save, no account
- "Start over" closes and resets the panel

---

## Sitemap — needs updating

The new tool is not yet in `sitemap.xml`. Add before next GSC submission:
```
https://cutadrift.org/when-you-get-a-diagnosis/
```

Update sitemap URL count from 41 to 42.

---

## Outstanding tasks

### ⚡ PRIORITY

**1. Add diagnosis tool to sitemap.xml**
Add `/when-you-get-a-diagnosis/` to sitemap, update count to 42, deploy, submit to GSC.

**2. Build "Do it with me" — Phase 1**
Diagnosis tool: employer email drafter + KiwiSaver call script.
See full spec above.

**3. GSC Request Indexing — all corrected pages (carried from session 16)**
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

**4. Check disclaimers on 4 remaining what-to-do pages**
```bash
grep -L "general information only\|page-disclaimer" \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-au/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-ireland/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-canada/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-us/index.html
```

---

### Ongoing

5. **Outreach follow-up** — 5 bereavement orgs contacted session 8; follow-up due week of 23 June 2026
6. **OG image** — placeholder 1200×630 PNG in place; real branded image outstanding
7. **Feedback form** — confirm still feeding Google Sheet with `[Cut Adrift]` prefix
8. **Best Man notice board redesign** — see session 16 handover for full instructions
9. **Best Man placeholder testimonials** — James P., May 2026 on both sites; replace with real quotes
10. **GSC indexing queue** — remaining ~24 guide pages (see session 16 for full list)
11. **Diagnosis tool guide pages** — 30 pages (5 per country) not yet built. Same structure as bereavement guides.

### ⏰ Time-sensitive (not Cut Adrift)
- **ProductHunt promo code for RecPokerCoach expires 19 June 2026** — that's tomorrow.

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
| 17 | WAVE accessibility audit (7.6/10); diagnosis tool built and deployed (Sonnet 4.6, 4000 tokens); per-tool model + token maps added to worker; homepage 4th card added; bereavement duplicate button fix; aria-label fix; "do it with me" scoped for next session |
