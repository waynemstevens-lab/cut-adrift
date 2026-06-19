# Cut Adrift — Handover Document 23
**Updated:** 20 June 2026
**Session work:** Built "Do it with me" (DIWM) Phase 3 — incapacity family-coordination message panel and GP/appointment question-prep panels (incapacity + diagnosis). Discovered and resolved that the "carer" tool was never a separate tool: the incapacity tool *is* the carer tool, and the standalone `carer` key was dead scaffolding (now deleted). Deployed worker + Pages, verified the new mandated headings emit on live output across paths.
**Supersedes:** Handover 22

---

## Project overview

**URL:** https://cutadrift.org
**Purpose:** Free crisis navigation tools for life's hardest moments.
**Entity:** TNW Limited (NZ registered)
**GitHub:** `waynemstevens-lab/cut-adrift` (private)
**Cloudflare Pages project:** `cutadrift`
**Worker:** `cutadrift-engine`
**KV namespace ID:** `3a74818b39634ca494158c8dc55d8cd9`

*(Unchanged from Handover 22.)*

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
node tests/verify_phase3.mjs       # deterministic, no API cost
node tests/live_incapacity_check.mjs  # live incapacity heading check (costs tokens)
```

> **Note:** Handover 22 only documented the Pages deploy. The worker deploys *separately* via `npx wrangler deploy` (config in `wrangler.toml`, `main = worker.js`). Any change to system prompts, formatters, model/token maps, or routing requires a worker deploy — the live test harness hits `cutadrift-engine.waynemstevens.workers.dev`, so prompt changes are invisible to it until the worker is deployed.

---

## Key finding this session — the "carer tool" does not exist as a separate tool

The Phase 3 brief asked to build a DIWM panel for "both incapacity and carer," with a note to build a real carer system prompt first if it was still a placeholder. Investigation showed the situation was different and simpler:

- **The incapacity tool IS the carer tool.** `/when-someone-cant-manage/` submits `tool: 'incapacity'`. The homepage card ("When someone can no longer manage… you're the one who has to figure it out"), the diagnosis page's "Go to the carer tool →" redirect, and the bereavement/diagnosis prompts all point to that page and call it "the carer tool." One tool, two names.
- **The standalone `carer` key was dead scaffolding.** Nothing ever submitted `tool: 'carer'`, so `SYSTEM_PROMPTS.carer` (the "coming soon" stub), `formatCarerIntake`, and the `carer` entries in `MODELS`/`MAX_TOKENS` were never routed to (dispatch is `SYSTEM_PROMPTS[intake.tool]` / `INTAKE_FORMATTERS[intake.tool]`). Leftover from an abandoned two-tool plan.

**Consequences:** No separate carer tool needed building. The "build the carer prompt first" prerequisite was moot. The outstanding "add the 'first action' closing line to carer" item (Handover 22 #14) was *also* moot — the incapacity prompt already ends with the exact `"The single most useful thing you can do today is"` line. The dead `carer` scaffolding was deleted. This finding is saved to project memory (`incapacity-is-carer-tool.md`) so it isn't re-investigated next session.

---

## New work this session — DIWM Phase 3

### 1. Mandated heading sections added to the incapacity prompt (prerequisite)

Unlike the diagnosis/bereavement prompts, the incapacity prompt mandated **no fixed section headings** — section titles were model-chosen and varied run to run, so a DIWM matcher (which anchors panels under plan `<h2>` headings) had nothing stable to grab. This is the same bug class as the session-19 leave-email matcher fix.

Added a "## Sections to always include" block to the incapacity prompt mandating two exact headings, explicitly carved out as the exception to "do not include sections that do not apply":
- **`## The people around you`** — wider-circle family/coordination content (telling people, naming a single point of contact, making vague offers concrete).
- **`## Questions for the medical team`** — practical prompt to go into appointments with written questions; "no medical, diagnostic, or treatment advice."

### 2. Incapacity family-coordination message panel (Phase 3 item #1)

- New `incapacity-family-message` system prompt + `formatIncapacityFamilyMessageIntake` formatter (reads incapacity's own intake fields: `who` → relationship, `what_happened`, `country`, `free_text`).
- It's a *coordination* message, not just a news message — a "What's the message for?" field drives three variants: **inform** / **ask_help** (names concrete help) / **organise** (proposes planning together).
- Panel anchored to `## The people around you`.

### 3. GP/appointment question-prep panels (Phase 3 item #2)

- New `incapacity-gp-questions` and `diagnosis-gp-questions` prompts + formatters. Both hard-scoped to **questions only — no diagnostic/treatment advice** (clinicians give answers).
- Incapacity version anchors to `## Questions for the medical team`; diagnosis version anchors to the always-emitted `## Your treatment journey`.
- Fields: who the appointment is with + an optional "anything specific to ask about" focus.
- (Per decision: carer does not need a separate version — incapacity already covers it.)

### 4. DIWM payload fix (the second flagged risk)

`Public/plan/index.html` previously built the panel POST body by cherry-picking `country`/`employment`/`relationship`/`free_text` — fields that don't exist on incapacity intake. Changed to forward the whole intake: `const payload = { ...intake, tool: task.tool }` (panel field values applied last so they win on any collision). Now every tool's formatter receives the fields it actually uses.

### 5. Cleanup

Deleted the dead `carer` scaffolding (prompt stub, `formatCarerIntake`, `carer` entries in `INTAKE_FORMATTERS`/`MODELS`/`MAX_TOKENS`).

---

## Verification

- **`tests/verify_phase3.mjs`** (new, deterministic, no API cost) — loads the real `worker.js` internals and the real `DIWM_TASKS` from `plan/index.html`. 19/19 pass: matchers fire on the mandated headings, pick the right section, don't mis-fire when a section is absent, existing diagnosis matchers don't regress, formatters render `who`→"their parent" / `what_happened`→"they had a stroke" from a spread payload with no blank context or raw-key leakage, and the dead `carer` key is gone.
- **`tests/live_incapacity_check.mjs`** (new, live) — POSTs two real incapacity intakes (Path A EPA-emergency, and a non-A path). Both emit `## The people around you` + `## Questions for the medical team` + the closing line. **Confirmed the model reliably emits both new headings across paths.**
- **Live panel smoke test** — all three new panels generate clean ready-to-use output (`end_turn`, non-empty, not a markdown plan). Spot-checked the incapacity GP-questions output: every line a question, grouped under plain headings, NZ-appropriate (ACC/DHB), honours the focus field, zero treatment advice.
- **`tests/test_suite.mjs`** extended with the new mandated incapacity headings and three new panel scenarios (as `needsPayload: true` stubs — capture live payloads via DevTools to enable).

---

## Commits this session

| Commit | Message |
|---|---|
| `0ae8d3e` | Add DIWM Phase 3: incapacity family-coordination message + GP question-prep panels |

Pushed to `origin/main`. Worker deployed (version `94020aa5`); Pages deployed (`ebb13f3a.cutadrift.pages.dev`).

> Only the five Phase 3 files were staged (`worker.js`, `Public/plan/index.html`, `tests/test_suite.mjs`, `tests/verify_phase3.mjs`, `tests/live_incapacity_check.mjs`). The pre-existing handover deletions (handovers 2–13, 15, 16 — note 14 is *not* deleted) and the untracked `cutadrift-handover-22.md` were left unstaged at the time of that commit; handovers 22 + 23 were committed afterwards as a separate tidy-up commit.

---

## Outstanding tasks

### ⚡ Priority

1. **DIWM Phase 3 item #3 — Not Redundant cover-letter integration.** Decided: **link-out, not shared code** (different repos; cross-repo code sharing has burned us before — cf. the RecPokerCoach EN/PT App.js rule). **Parked** because Not Redundant's cover-letter tool isn't live yet — nothing to link to. When it ships, add a simple link-out from the incapacity tool.
2. **Capture payloads for the stubbed test scenarios** in `tests/test_suite.mjs` (now includes the 3 new Phase 3 panel scenarios + incapacity full-plan headings). Method documented inline.
3. **GSC Request Indexing — corrected pages** (carried from session 16):
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
4. ~~**Commit/clean the working-tree handover deletions**~~ — ✅ Done this session. Handovers 22 + 23 committed (`908de3e`); superseded handovers 2–13, 15, 16 deletions committed (`5be88b8`). Working tree clean. `Handovers/` now holds 14, 17–23.

### Consider

5. ~~**Extend the bereavement "tell my family" panel to Path C (weeks_ago)**~~ — ✅ Done this session. Added a reframed (weeks-on, *not* a copy of Path B's) `## The people around you` section to bereavement Path C so the panel now anchors there; taught the `bereavement-family-message` prompt to handle belated news using `timing` (now forwarded by the formatter — rides on the Phase 3 full-intake payload fix). No frontend change needed. Verified deterministically (23/23) + live: Path C plan emits the heading and a `weeks_ago` message gracefully acknowledges the delay. Worker deployed (version `87325d92`).
6. **Update meta description / og:description tags** — still say "clear, short-term plan," out of step with the refreshed hero copy.
7. **Pin "Notifying their employer" heading** in the bereavement prompt (test-harness flakiness source).

### Ongoing

8. **Outreach follow-up** — 5 bereavement orgs contacted session 8; follow-up was due week of 23 June 2026.
9. **OG image** — placeholder still in place; real branded image outstanding.
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

---

## Workflow note

This session ran end-to-end in Claude Code: investigation → decisions confirmed with the user → build → deterministic verification (no token cost) → worker + Pages deploy → live verification (confirmed the model emits the new mandated headings on real output) → commit/push. Pattern worth repeating: write a deterministic `verify_*.mjs` harness against the real code first (matchers, formatter field plumbing) to catch the cheap-to-find bugs, then spend tokens on a focused live check only for what genuinely needs the model (here, that the mandated headings actually appear). Deploy the **worker** (not just Pages) whenever prompt/logic changes — the live harness only sees deployed worker code.
