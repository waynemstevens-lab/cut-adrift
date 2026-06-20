# Cut Adrift — Handover Document 24
**Updated:** 20 June 2026
**Session work:** Refreshed homepage hero copy, title, and meta tags away from "without warning" framing (didn't fit the incapacity/diagnosis personas) to "where to start." Built the distress-adaptive bereavement intake — a short-circuit path that detects high-distress Q4 answers and delivers an abbreviated, calm "next few hours only" response instead of continuing the full 15-question flow, with a clear opt-in to the fuller plan. Found and fixed a routing asymmetry where continuing from the short-circuit could still land on the existing bereavement tool's brief Path A instead of the full Path B. Cleaned up superseded handovers 17–19.
**Supersedes:** Handover 23

---

## Project overview

**URL:** https://cutadrift.org
**Purpose:** Free crisis navigation tools for life's hardest moments.
**Entity:** TNW Limited (NZ registered)
**GitHub:** `waynemstevens-lab/cut-adrift` (private)
**Cloudflare Pages project:** `cutadrift`
**Worker:** `cutadrift-engine`
**KV namespace ID:** `3a74818b39634ca494158c8dc55d8cd9`

*(Unchanged from Handover 23.)*

---

## Deploy commands

```bash
# Commit and push (from Cut Adrift/)
cd ~/Desktop/Cut\ Adrift && git add -A && git commit -m "msg" && git push

# Deploy the WORKER (worker.js → cutadrift-engine) — needed for any prompt/logic change
cd ~/Desktop/Cut\ Adrift && npx wrangler deploy

# Deploy Pages (Public/ → cutadrift)
cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --branch=main --commit-dirty=true

# Tests
node tests/test_suite.mjs          # live E2E (hits deployed worker, costs tokens)
node tests/verify_phase3.mjs       # deterministic, no API cost — DIWM Phase 3 (23/23)
node tests/verify_crisis.mjs       # deterministic, no API cost — distress-adaptive intake (new this session, 27/27)
node tests/live_incapacity_check.mjs  # live incapacity heading check (costs tokens)
```

*(Unchanged structure from Handover 23 — `verify_crisis.mjs` added.)*

---

## New work this session

### 1. Homepage copy refresh — "without warning" → "where to start"

The previous hero line ("When life changes without warning.") was reassessed: it fits the bereavement persona but not incapacity (often gradual decline, not sudden) or diagnosis (often anticipated after testing). Reframed around the shared feeling across all three personas — not knowing where to start — rather than the speed of onset.

- **Hero h1:** "When you don't know" / *"where to start."* (italic accent line preserved via existing `<em>`)
- **Subhead:** unchanged this session — already live from session 22: "Free, step-by-step guidance for life's hardest moments — with the letters, calls, and messages already drafted for you."
- **Homepage meta description + og:description:** updated to "Free, step-by-step guidance for life's hardest moments. We'll draft the letters, calls, and messages too." (resolves Handover 23's outstanding item #6 — stale meta copy)
- **Homepage `<title>` + og:title:** updated to "Cut Adrift — When you don't know where to start" in a follow-up pass, once the title/og:title mismatch with the new hero was spotted.

Copy-only changes, no logic. Guide page meta tags deliberately untouched — different, SEO-keyword-driven pattern.

**Commits:** `d4967e5` (hero + meta description/og:description), `5fc395f` (title + og:title)
**Deploys:** Pages only — `a81b9f4f.cutadrift.pages.dev`, then `e651f4ef.cutadrift.pages.dev`

---

### 2. Distress-adaptive bereavement intake (short-circuit path)

**Problem:** the bereavement intake runs ~15 questions before generating a plan. Question 4 ("How are you holding up?") offers "Barely holding it together — shocked, not thinking clearly" as an option, but the flow didn't adapt — everyone answers all 15 regardless. For someone in that state, a long form is a real abandonment risk, and a half-finished form means no output at all.

**Design decided in chat before build:**
- **Trigger:** after Q4, branches on *either* "Barely holding it together" *or* "I'm managing, but overwhelmed" (deliberately broader than just the most severe option — "overwhelmed" is arguably the larger group this actually helps).
- **Abbreviated output:** a new, separate system prompt (not a trimmed version of the existing one), scoped strictly to the next few hours — is there someone who can be with you, what genuinely doesn't need to happen today, one urgent call only if warranted. Explicitly excludes legal/financial/employment content, since that data hasn't been collected yet at this point in the flow.
- **Continue path:** a single CTA ("Want the fuller plan? A few more questions →") resumes the existing flow at Q5 using everything already answered — nothing re-asked — and generates a full plan via the existing bereavement tool on completion.

**Build:**
- `worker.js` — new `SYSTEM_PROMPTS['bereavement-crisis']` (next-few-hours scope, hard exclusions, ends with an open-door offer to continue), `formatBereavementCrisisIntake` (reads country/timing/relationship/emotional_state only), and `MODELS`/`MAX_TOKENS` entries on a fast profile — Haiku, 1000 tokens. **Not yet confirmed:** Claude Code capped this below the full bereavement tool's 3000 since the output is deliberately short, but explicitly flagged it as worth checking — revisit if 1000 ever reads as tight.
- `Public/when-someone-dies/index.html` — inline `step-crisis` state, `getNext` branch logic, `startCrisis`/`streamCrisis`/`continueToFull` functions, matching CSS. Existing prompt/formatter and the non-triggering flow left untouched.
- `tests/verify_crisis.mjs` — new deterministic harness (no API cost).

**Verification:**
- Deterministic: 21/21 initially (trigger fires only on the two specified answers, doesn't fire on others, formatter renders all fields cleanly with no leaked raw keys/blank context). Phase 3 suite re-run clean at 23/23 — no regression.
- Live (automated, part of the build's own verification): crisis output 1193 chars, ended cleanly, read as prose not a checklist, zero legal/financial/employment content hits; resuming to the full plan generated cleanly with proper section structure end to end.
- Live, manual click-through (separate pass) — confirmed across two countries that the emergency-call guidance correctly reads the country field rather than being hardcoded: NZ → "111", UK → "999". Tone read as calm and validating without being clinical or saccharine in both cases; the continue CTA read as a genuine open door, not a dead end.

**Commit:** `9f78368`
**Deploys:** Worker `fcd3e1e1`, Pages `6ef3c018.cutadrift.pages.dev`

---

### 3. Continue-to-full routing fix

**Found during live verification:** a user who short-circuits via "Barely holding it together," then clicks "Want the fuller plan?", was routed into the *existing* bereavement tool's own Path A — itself a brief, ~0-section plan — because Path A/B selection in the original tool is keyed on the same `emotional_state` field the crisis trigger reads. Someone who short-circuited via "I'm managing, but overwhelmed" got the full Path B. Not a bug in the new build — pre-existing routing the crisis feature happened to inherit — but a real product question: does clicking "fuller plan" after 11 more questions deliver something that actually feels fuller?

**Decision:** override — clicking continue should always deliver the full Path B plan, regardless of the original Q4 answer. Reasoning: choosing to continue is a stronger, more deliberate readiness signal than the original answer, and the CTA explicitly promises "the fuller plan."

**Build (without corrupting the original answer):**
- Frontend: `continueToFull()` sets `answers.from_crisis_continue = true` *only* on the continue-from-crisis path. Default `submit()` path untouched — the user's actual `emotional_state` answer is preserved, never overwritten.
- `worker.js`: a path-selection override at the top of the bereavement prompt — when the formatted intake carries "Continuing from the brief crisis response: yes," it must use Path B regardless of `emotional_state`/`timing`, with `weeks_ago` → Path C explicitly protected from the override.

**Verification:**
- Deterministic: `verify_crisis.mjs` extended to 27/27. Phase 3 suite still 23/23.
- Live: same `barely_functioning` payload run twice — without the flag, brief Path A (938 chars, with one stray heading appearing — Path A occasionally emits one; not caused by this build, and the specific heading wasn't logged. Plausibly the same flakiness already flagged in Handover 23 item #7, though that's not explicitly confirmed); with the flag, full Path B (11,392 chars, 7 sections: Right now / The people around you / Your work and leave / Notifying their employer / This week / The practical steps — estate and admin / People and places that can help).

**Commit:** `5c2f174`
**Deploys:** Worker `c9be6d4e`, Pages `9b45ef85.cutadrift.pages.dev`

---

### 4. Cleanup

Handovers 17, 18, and 19 deleted (intentional pruning, same pattern as the session 23 cleanup of 2–13/15/16 — full content remains recoverable from git history if ever needed). Committed separately from the feature work.

**Commit:** `67826ae` ("Remove superseded handovers 17, 18, 19")
`Handovers/` now contains 14 and 20–24.

---

## Closed without action

- **AU emergency-number phrasing** — a live crisis check for Australia returned generic "a GP or emergency services" phrasing rather than naming "000" specifically, unlike the NZ (111) and UK (999) runs which named the number directly. Flagged, reviewed, and explicitly deprioritized — not worth chasing further. Noted here only so it isn't re-investigated.

---

## Commits this session

| Commit | Message |
|---|---|
| `d4967e5` | Refresh homepage hero copy and homepage meta description |
| `5fc395f` | Align homepage title and og:title with new hero copy |
| `9f78368` | *(message not confirmed on screen — covers the bereavement-crisis build: worker.js, when-someone-dies/index.html, verify_crisis.mjs)* |
| `5c2f174` | *(message not confirmed on screen — covers the continue-to-full routing override fix)* |
| `67826ae` | Remove superseded handovers 17, 18, 19 |

All pushed to `origin/main`. The first, second, and last messages above were shown verbatim in Claude Code's output; the two marked are paraphrased from what was built, not quoted from `git log` — worth a `git log --oneline` glance to confirm exact wording if it matters later.

---

## Outstanding tasks

### ⚡ Priority

1. **Investigate incapacity tool's missing Canada/US options.** `/when-someone-cant-manage/` only offers NZ / AU / UK / Ireland, while bereavement and diagnosis both offer NZ / AU / UK / Ireland / Canada / US. Brief drafted this session but not yet run — first step is read-only: check whether `SYSTEM_PROMPTS.incapacity` in `worker.js` has any CA/US-specific content underneath before touching the frontend dropdown.
2. **DIWM Phase 3 item #3 — Not Redundant cover-letter integration.** Still parked — link-out approach decided, but Not Redundant's cover-letter tool isn't live yet.
3. **Capture payloads for the stubbed test scenarios** in `tests/test_suite.mjs` (Phase 3 panel scenarios + incapacity full-plan headings). Method documented inline.
4. **GSC Request Indexing — corrected pages** (carried from session 16):
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

### Consider

5. ~~**Update meta description / og:description tags**~~ — ✅ Done this session, plus title/og:title aligned too.
6. **Pin "Notifying their employer" heading** in the bereavement prompt (test-harness flakiness source) — possibly relevant again this session, since the routing-fix verification's Path A run emitted one stray heading; the specific heading wasn't logged at the time, so this is a plausible connection, not a confirmed one.
7. **Consider tightening the `verify_crisis.mjs` Path A assertion** — it currently expects exactly zero sections, which is stricter than Path A's actual (pre-existing, non-deterministic) behavior. Low priority; the test still serves its purpose.

### Ongoing

8. **Outreach follow-up** — 5 bereavement orgs contacted session 8; follow-up was due week of 23 June 2026 (this coming week).
9. **OG image** — still flagged as placeholder as of Handover 23; not re-verified this session.
10. **Feedback form** — confirm still feeding Google Sheet with `[Cut Adrift]` prefix.
11. **Best Man notice board redesign** — see session 16 handover.
12. **Best Man placeholder testimonials** — James P., May 2026 on both sites; replace with real quotes.
13. **GSC indexing queue** — remaining ~24 guide pages (see session 16).
14. **Diagnosis tool guide pages** — 30 pages (5 per country) not yet built.

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
| 19 | "Do it with me" Phase 2 (bereavement leave email + bank letter); bereavement employment question; mandatory "Your work and leave" section; leave-email matcher fixed; "first action" closing line; bereavement+incapacity max_tokens → 3000; 6-scenario E2E suite (later lost) |
| 20 | Deceased's employer letter (bereavement) + weeks_ago routing fix + "Notifying their employer" section + DIWM panel. "Tell my family" DIWM panels (bereavement + diagnosis). Insurance call script DIWM panel (diagnosis). |
| 21 | Closed 3 priority items from Handover 20 (sitemap/link, DIWM spot-checks, test harness rebuilt into `tests/`). Found 4 guide pages with no disclaimer — fixed/deployed/verified. Refreshed homepage copy. Began direct Claude Code file editing. |
| 22 | Refined homepage hero subhead and footer trust line; verified live across mobile/tablet/desktop breakpoints. |
| 23 | DIWM Phase 3: incapacity family-coordination message + GP/appointment question-prep panels (incapacity + diagnosis), scoped to questions only. Added mandated `## The people around you` / `## Questions for the medical team` headings to the incapacity prompt as stable panel anchors. Fixed DIWM payload to forward full intake (incapacity field names). Discovered the incapacity tool IS the carer tool and deleted the dead `carer` scaffolding (saved to memory). Worker + Pages deployed; new headings verified live across paths. Cover-letter (#3) parked as link-out pending Not Redundant going live. |
| 24 | Homepage hero/title/meta refresh ("without warning" → "where to start," fitting all three personas, not just bereavement). Built the distress-adaptive bereavement intake — short-circuit on high-distress Q4 answers, abbreviated "next few hours only" output, opt-in continue to full plan. Live-verified country-correct emergency numbers (NZ/UK). Found and fixed a routing asymmetry so continuing from the short-circuit always delivers the full sectioned plan. Cleaned up superseded handovers 17–19. |

---

## Workflow note

This session ran across both Claude.ai chat (strategy, copy direction, design trade-offs, decision-making) and Claude Code (all builds, deploys, commits) — the established split held well, including for a genuinely consequential product decision (the continue-to-full routing override) that got talked through with trade-offs on both sides before any code was written. Verification followed the now-standard pattern: deterministic harness first (cheap, catches plumbing bugs), then a focused live check for what only the model can confirm (tone, country-correct content) — but this session added a manual browser click-through as a third layer, specifically because automated checks can confirm content correctness but not lived experience, which matters more than usual on emotionally sensitive output. Worth keeping that distinction deliberate going forward: automated tests for correctness, live API checks for content quality, manual click-through for anything where the *experience* of using it is itself the thing being verified.
