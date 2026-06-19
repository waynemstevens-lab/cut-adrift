# Cut Adrift — Handover Document 24
**Updated:** 20 June 2026
**Session work:** Built the distress-adaptive bereavement intake (a crisis short-circuit that branches after Q4 to an abbreviated "next few hours only" holding response, with a low-pressure CTA back into the full flow). Refreshed the homepage hero, title, and meta tags onto the "where to start" framing. (Path C tell-my-family extension was also completed and is recorded in Handover 23.)
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
node tests/verify_phase3.mjs   # deterministic Phase 3 + Path C, no API cost
node tests/verify_crisis.mjs   # deterministic crisis short-circuit, no API cost
node tests/test_suite.mjs      # live E2E (hits deployed worker, costs tokens)
```

> Worker and Pages deploy **separately**. Prompt/routing changes need `npx wrangler deploy`; frontend changes need the Pages deploy. The live test harness only sees deployed worker code.

---

## New work this session

### 1. Distress-adaptive bereavement intake — crisis short-circuit (main build)

**The problem:** the bereavement intake asked the same 15 questions of everyone, including people who had just selected "barely holding it together." For someone in acute shock, a long questionnaire and a full multi-section plan is the wrong response.

**The trigger:** after Q4 ("Before we go any further — how are you holding up?"), branch **only** if the answer is `barely_functioning` ("Barely holding it together") OR `holding_together` ("I'm managing, but overwhelmed"). `need_the_list` and `not_sure` continue the existing flow unchanged. No other behaviour changes anywhere in the intake.

**Abbreviated output (new prompt, not a trimmed full plan):** at the trigger point we only have four facts — country, timing, relationship, and the holding-up answer. The new `bereavement-crisis` system prompt is scoped strictly to the next few hours:
- Open warmly, meeting them where they are (no melodrama, no telling them how they feel).
- What does NOT need to happen today (registering the death, funeral decisions, paperwork, banks, telling everyone — all can wait).
- Encourage having someone with them right now.
- ONE urgent action only if it genuinely cannot wait (e.g. if the death is very recent and not yet reported to anyone official) — otherwise omit it, no invented urgency.
- Close with a calm, low-pressure offer of the fuller plan when ready — an open door, not a dead end.
- **Explicitly excludes legal, financial, and employment content** — we don't have that information at this point and guessing would be worse than omitting.

**Routing (`worker.js`):** new tool key `bereavement-crisis` added to `SYSTEM_PROMPTS`, `INTAKE_FORMATTERS` (`formatBereavementCrisisIntake`, reads country/timing/relationship/emotional_state), `MODELS` (`claude-haiku-4-5-20251001` — same fast profile as `bereavement`), and `MAX_TOKENS` (**1000** — deliberately short holding response; note this is lower than bereavement's 3000 by design, since the output is meant to be brief; bump to 3000 if ever truncating, which it isn't). Dispatch follows the existing `SYSTEM_PROMPTS[intake.tool]` / `INTAKE_FORMATTERS[intake.tool]` pattern — no allowlist to update.

**Frontend (`Public/when-someone-dies/index.html`):** on trigger, an inline `step-crisis` step streams the abbreviated plan from the worker (same SSE pattern as `/plan/`), shown instead of continuing to Q5. Below it, a single CTA — *"Want the fuller plan? A few more questions →"* (`continueToFull()`) — resumes the existing flow at Q5 (`support_situation`) using all answers already given; nothing is re-asked. On completion the full plan generates exactly as before via `tool: 'bereavement'`. Added `WORKER_URL`, `startCrisis()`/`streamCrisis()`, a gentle error fallback (never a glitchy dead end), and matching CSS. The existing `bereavement` prompt/formatter and the non-triggering flow are untouched.

**Deliberately out of scope (v1):** no dedup between the abbreviated plan and the eventual full plan (some overlap on continue is acceptable); no change to question flow/wording for non-triggering users; existing full prompt/formatter not modified.

### 2. Homepage copy refresh

Moved the homepage onto the "where to start" framing (copy-only, Pages-only):
| Element | New value |
|---|---|
| Hero h1 | "When you don't know" / *"where to start."* |
| Hero subhead | (already updated session 22 — unchanged) |
| `meta description` + `og:description` | "Free, step-by-step guidance for life's hardest moments. We'll draft the letters, calls, and messages too." |
| `<title>` + `og:title` | "Cut Adrift — When you don't know where to start" |

Guide-page meta tags were left untouched. Hero, title, og:title, meta description, and og:description are now all aligned.

### 3. Path C tell-my-family extension (also completed)

The bereavement "tell my family" DIWM panel was extended to Path C (`weeks_ago`) — a reframed (weeks-on) `## The people around you` section plus belated-news handling in the `bereavement-family-message` prompt (using the now-forwarded `timing`). Full detail is in Handover 23, outstanding item #5 (struck through / done). Worker version at that point: `87325d92`.

---

## Verification

- **`tests/verify_crisis.mjs`** (new, deterministic, no API cost): 21/21. Trigger fires only on the two specified Q4 answers and on no other step — tested against the **real `getNext`** extracted from the intake page, not a copy. Formatter renders all four fields and leaks neither stray intake fields, nor raw keys, nor "undefined". Prompt carries all three exclusions and the continue-offer. Existing bereavement tool confirmed intact.
- **`tests/verify_phase3.mjs`**: still 23/23 (no regression).
- **Live (worker):** crisis output ~1193 chars, `end_turn`, prose (not a checklist), **zero** legal/financial/employment hits against a curated forbidden-term scan; resume→full `bereavement` plan generates with `##` sections end to end.
- **Live (production page):** `https://cutadrift.org/when-someone-dies/` confirmed serving all branch markup/logic (`step-crisis`, `startCrisis`, `continueToFull`, `tool: 'bereavement-crisis'`, the trigger condition).
- **Not automated:** a DOM-driven browser click-through of the live branch. The routing is unit-tested, streaming reuses the proven `/plan/` pattern, and both worker endpoints are live-verified — but a ~60-second manual click-through on the live site is worth doing when next in front of it (carried as an outstanding item).

---

## Commits this session

| Commit | Message |
|---|---|
| `0b169e5` | Extend tell-my-family panel to bereavement Path C (weeks_ago) |
| `d4967e5` | Refresh homepage hero copy and homepage meta description |
| `5fc395f` | Align homepage title and og:title with new hero copy |
| `9f78368` | Add distress-adaptive bereavement intake (crisis short-circuit) |

All pushed to `origin/main`.
**Deploys:** worker versions `87325d92` (Path C) and `fcd3e1e1` (crisis); Pages deploys for homepage copy and the intake branch. All live on `cutadrift.org`.

---

## Outstanding tasks

### ⚡ Priority

1. **Manual click-through of the crisis short-circuit on the live site** — confirm the inline abbreviated plan streams and the "Want the fuller plan?" CTA resumes Q5 correctly in a real browser (logic is unit-tested + worker live-verified, but the DOM flow wasn't automated this session).
2. **DIWM Phase 3 item #3 — Not Redundant cover-letter integration.** Decided: link-out, not shared code. Parked until Not Redundant's cover-letter tool is live.
3. **Capture payloads for the stubbed `tests/test_suite.mjs` scenarios** (includes the Phase 3 panels + incapacity headings). Method documented inline. Consider adding a `bereavement-crisis` live scenario too.
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

5. **Crisis short-circuit for the other tools** — the same distress-adaptive pattern could apply to incapacity and diagnosis if it proves useful on bereavement. No decision yet.
6. **Pin "Notifying their employer" heading** in the bereavement prompt (test-harness flakiness source).

### Ongoing

7. **Outreach follow-up** — 5 bereavement orgs contacted session 8; follow-up was due week of 23 June 2026.
8. **OG image** — placeholder still in place; real branded image outstanding.
9. **Feedback form** — confirm still feeding Google Sheet with `[Cut Adrift]` prefix.
10. **Best Man notice board redesign** — see session 16 handover.
11. **Best Man placeholder testimonials** — James P., May 2026 on both sites; replace with real quotes.
12. **GSC indexing queue** — remaining ~24 guide pages (see session 16).
13. **Diagnosis tool guide pages** — 30 pages (5 per country) not yet built.

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
| 17 | WAVE audit; diagnosis tool built; per-tool model + token maps; "do it with me" scoped |
| 18 | "Do it with me" Phase 1 (diagnosis employer email + KiwiSaver script); sitemap → 42 URLs |
| 19 | "Do it with me" Phase 2 (bereavement leave email + bank letter); employment intake; leave-email matcher fixed; "first action" line |
| 20 | Deceased's employer letter + weeks_ago routing fix; tell-my-family DIWM panels (bereavement + diagnosis); insurance call panel (diagnosis) |
| 21 | Closed Handover 20 priorities; disclaimer fixes on 4 guide pages; homepage copy refresh; began direct Claude Code editing |
| 22 | Homepage hero subhead + footer trust line; verified across breakpoints |
| 23 | DIWM Phase 3: incapacity family-coordination + GP question-prep panels; mandated incapacity headings; full-intake payload fix; deleted dead `carer` scaffolding (incapacity IS the carer tool); Path C tell-my-family extension. Handover cleanup. |
| 24 | Distress-adaptive bereavement intake (crisis short-circuit): new `bereavement-crisis` prompt scoped to the next few hours (excludes legal/financial/employment), inline frontend branch after Q4 with CTA back into the full flow, deterministic + live verification, worker + Pages deployed. Homepage hero/title/meta refreshed to the "where to start" framing. |

---

## Workflow note

Same proven pattern as session 23: read existing conventions first → confirm scope → build worker + frontend → deterministic `verify_*.mjs` against the **real** code (this time extracting the live `getNext` from the intake page so the trigger test exercises actual routing, not a reimplementation) → live worker verification for what genuinely needs the model (in-scope crisis output, end-to-end full-plan resume) → deploy worker + Pages → confirm production serves the new code → commit/push. The one gap worth noting for next time: automate the DOM click-through (e.g. via Chrome DevTools Protocol) when a build adds real frontend branching, rather than relying on unit-tested routing + curl'd markup.
