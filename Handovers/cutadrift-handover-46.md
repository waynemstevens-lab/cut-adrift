# Cut Adrift — Handover Document 46
**Updated:** 1 July 2026
**Session work:** **First full fact-verification pass on live content — a new workstream, distinct from the guide-building work in H1–45. FULLY CLOSED OUT for NZ this session — Phase 2 ran and passed.** Removed the unvalidated "Somewhere else" country option (closed a real prompt-injection-adjacent accuracy hole). Fact-checked the entire NZ bereavement guide cluster (6 pages) against official sources — found and fixed 3 pages with real errors. Discovered the more serious underlying issue: **NZ financial figures in the bereavement worker prompt were mostly NOT hardcoded — the model was generating them from its own training data**, which is stale. Fixed 2 hardcoded stale values and added a new verified-figures block to the worker prompt. Added a temporary disclaimer to generated plan output as a safety net. **Phase 2 testing then ran (4 test scenarios, all PASS) confirming the model reliably respects the new verified-figures block** — every figure quoted to the cent, correct "at least"/date-caveat hedging preserved, two-tier probate rule applied contextually, zero stale values in any output. Temporary disclaimer then removed and confirmed live. **The NZ pass is complete end-to-end and is now the template for the other 5 countries — START HERE next session.**
**Supersedes:** H45 (kept on disk). Cumulative session-history table preserved below.

---

## Project overview / Deploy commands

**Cut Adrift** — a free tool that helps people in the first days after a hard life event (a death, a serious diagnosis, losing capacity to manage affairs). Three tools (`bereavement`, `diagnosis`, `incapacity`/carer), each serving six countries (NZ, AU, UK, IE, CA, US). A Cloudflare Worker holds the system prompts + calls Claude and streams SSE; a static site (`Public/`) is the front end.

**Two separate deploys — do not confuse them:**
- **Worker (the prompts + rate limiter):** `npx wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`. **A prompt change requires THIS deploy.**
- **Static site:** `cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true` → serves `cutadrift.org`.
- Per-tool model + token maps live in `worker.js` (`MODELS` / `MAX_TOKENS`).

**Current worker version:** `2bb74ac2` (was `67c366a5` at H45 — changed this session, see below).

**Test-bypass header (from H31):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04`.

---

## New this session — "Somewhere else" country option removed (all 3 tools)

**[PROBLEM]** The carer tool's country selector was found to only show 4 countries (NZ/AU/UK/IE) instead of 6 in a Claude-side fetch — turned out to be a stale-cache false alarm (Wayne's browser correctly showed all 6). But investigating it surfaced a real issue: all three tools had a "Somewhere else" free-text country option. Claude Code traced the data flow and found:
- The `other: 'Other'` fallback in `LABELS.country` was dead code — never actually triggered
- Freeform text (e.g. "Germany") was sent as the literal country value straight into the prompt, with **no validation on the worker side**
- The model would then attempt to generate country-specific legal/financial guidance for an ungrounded, unverified country

**[FIX]** Removed the "Somewhere else" button + freeform input from all three tool frontends. Added a static note: *"Currently available in NZ, AU, UK, Ireland, Canada, and the US."* **Added worker-side allowlist validation** — any `intake.country` not in `['nz','au','uk','ie','ca','us']` now gets rejected with a 400 `invalid_country` response, closing the direct-API-call path (the button removal alone would not have closed this). Removed the dead `other: 'Other'` label.

**Verification:** Cold-started local servers (frontend + `wrangler dev --local`), fetched rendered HTML from all three tools to confirm the button/notice/CSS/JS were correctly added/removed, then POSTed test payloads (`{"country":"other"}`, `{"country":"Germany"}`, valid `{"country":"nz"}`, missing country field) directly at the worker to confirm the 400 gate works and doesn't over-reject legitimate requests (e.g. the bereavement crisis-path doesn't always send a country field — confirmed this still passes).

**Commit hash not captured this session** — verify via `git log` before referencing. Deployed and confirmed live by Wayne (browser screenshot, all 6 buttons + notice showing correctly on `/when-someone-cant-manage/`).

---

## New this session — NZ bereavement guide cluster fact-check (NEW WORKSTREAM)

**Why this is different from prior sessions:** H1–45 focused on building guide content and country-hardening the *tool prompts* against cross-country contamination. This session is the first systematic check of whether the *facts themselves* — dollar figures, thresholds, legal specifics — are actually correct against current official sources. **A clean contamination scan was already known not to be an accuracy check (see H45's CA Page 1 lesson) — this session extended that lesson from the diagnosis guides to the bereavement guides, and then further to the live tool output itself.**

**Method:** Claude (chat) web-searched each specific figure against primary/official sources (govt.nz, workandincome.govt.nz, acc.co.nz, justice.govt.nz, beehive.govt.nz, legislation.govt.nz), reported findings to Wayne, then produced a copyable Claude Code brief per page. Batched fixes per-page rather than per-figure to reduce deploy overhead.

**All 6 pages in the NZ bereavement cluster checked. 3 needed fixes, all now live:**

1. **`what-to-do-when-someone-dies-nz/`** — 3 errors fixed (commit `5e7104b`):
   - ACC funeral grant: ~$6,837 → **$7,990.30** (confirmed live acc.co.nz figure)
   - Death certificate: ~$33 → **$35** (DIA fee increase took effect 18 June 2026, after the guide's "last updated June 2026" stamp — genuinely went stale mid-month, not an old error)
   - **Probate threshold: $15,000 → $40,000** (financial institution assets) — this was the most serious error. The threshold changed **24 September 2025** via the Administration (Prescribed Amounts) Amendment Regulations 2025, confirmed via Ministry of Justice and Beehive.govt.nz. This was wrong for ~9 months before being caught — not stale drift, just wrong. **Note the two-tier structure**: $40,000 applies to financial-institution-held assets; a separate, lower $15,000 threshold still applies to shares/bonds under ss.64/64A of the Administration Act; real property always requires probate regardless of value. Don't ever simplify this back to one number.

2. **`how-to-apply-funeral-grant-nz/`** — 3 issues fixed (commit `96f5ef0`, same commit also fixed the ACC page's Funeral Grant reference):
   - **Internal contradiction**: page stated $2,408 (meta description + intro) AND $2,697.43 (info card + body) for the same grant, on the same page. Both instances of $2,408 corrected to $2,697.43.
   - Misleading rate label "(2024–25 rates)" removed/corrected — $2,697.43 is the *current* rate (from 1 April 2026), not an old one.
   - ACC funeral grant: same ~$6,837 → $7,990.30 fix as page 1.

3. **`acc-death-benefit-nz/`** — 2 fixes across 2 commits:
   - Funeral Grant $6,837 → $7,990.30 (commit `96f5ef0`, caught via a repo-wide grep for the wrong figure after finding it twice — good instinct, this catches copy-paste propagation)
   - **Survivor's Grant** ~$6,837 → **$8,566.62 for a partner, $4,283.32 per dependent child** (commit `8567015`). This figure didn't match *any* year's known rate (checked back to 2022) — looks like it was simply wrong from the start, not stale. ACC republishes this rate annually on **1 July** — the day this was fixed. Confirmed rate is the one effective 1 July 2025; the 2026/27 rate may already be in effect but wasn't found in a published source during this session. Framed on the live page as "(reviewed annually each 1 July)" rather than a bare fixed number, plus the page's existing "amounts are reviewed annually... contact ACC for current rates" footer line. **Follow-up flagged: spot-check acc.co.nz in 1–2 weeks once the 2026/27 rate is likely published.**

**Checked clean, no errors found:**
- `nz-bereavement-leave-entitlements/` — every figure verified (3-day/1-day split, 6-month eligibility test, close-relative list, 2021 miscarriage/stillbirth amendment, no-proof-required rule, Employment NZ phone 0800 209 020, and the pending Employment Leave Bill status — matches MBIE's own page exactly, including "introduced March 2026, passed first reading, referred to Education and Workforce Committee")
- `nz-surviving-spouse-benefit/` — Funeral Grant, WINZ phone, ACC phone, and NZ Super rates ($854.08/fortnight couple, $1,110.30/fortnight single, from 1 April 2026) all confirmed against Work and Income's own "Services for Seniors" rates document
- `mytrove-nz-guide/` — 52.1-hour admin-time stat, free/agency-funded model, $40,000 IR625 threshold, and "up to 10 weeks" IRD processing time all matched IRD's own page and myTrove's public materials almost verbatim. **Minor clarity note (not fixed, optional polish):** NZTA appears in both "who myTrove can notify" (licence cancellation) and "what myTrove doesn't cover" (vehicle transfer) — accurate but could read as contradictory to a stressed reader.

**Pattern worth carrying into future country passes:** every error found was on a **financial-figures page** (grants, thresholds, fees). The **process/legal-mechanics pages** (bereavement leave, myTrove) were completely clean. Prioritise financial-figure pages first when extending this to AU/UK/IE/CA/US.

---

## New this session — the bigger finding: hardcoded vs. model-generated figures in the worker prompt

**This is the most important finding of the session and the thing to pick up first next time.**

Once the static guide pages were mostly clean, Wayne asked what to prioritise next. The answer: check whether the *live generated plans* (the actual product, not the supporting static content) state the same correct figures — since a generated plan is different every time and "checked once" doesn't apply the way it does to a static page.

Claude Code investigated the NZ bereavement system prompt directly and found:

**Only 2 of ~6 relevant figures were hardcoded in the prompt — and both were stale:**
- Line 214: probate threshold — still the old single-tier $15,000 framing
- Line 217: death certificate — still $33

**The other 4 figures were NOT in the prompt at all — the model was generating them from its own training data at inference time:**
- Work and Income Funeral Grant
- ACC Funeral Grant
- ACC Survivor's Grant
- NZ Super rates

This is a structurally different and more serious problem than the two hardcoded values. A hardcoded stale figure is a simple update. A figure the model generates fresh each time from training data has no ceiling on how wrong it could be, drifts the same way any model's training cutoff drifts, and can't be fixed by editing one line — it needs the model to be given the correct figure at inference time and told explicitly not to use its own knowledge.

**Fix applied (commit `884da2a`, deployed as worker version `2bb74ac2`):**
1. Fixed the 2 hardcoded stale values (two-tier probate framing; $35 cert cost)
2. **Added a new "New Zealand verified financial figures" block to the system prompt** (lines 261–271, sitting between the existing contacts block and the Canada content section). Explicit instruction: *"use exactly as given, never generate from training."* Contains all 6 verified NZ figures with source dates and appropriate hedging (e.g. the Survivor's Grant is framed as "at least $8,566.62" rather than asserted as exact, since the 2026/27 rate isn't yet confirmed).

**Safety net added while this is unverified (commit `b5d5eec`):** a temporary disclaimer note rendered above NZ bereavement/diagnosis generated plans: *"We're in the process of re-verifying all dollar figures and thresholds in this tool against official sources. If this plan mentions a specific amount (a grant, benefit, or threshold), please confirm it directly with the relevant agency before relying on it."* Implemented in `Public/plan/index.html`, read `sessionStorage` for `country === 'nz'` and `tool === 'bereavement' || 'diagnosis'`, inserted before the plan's first heading. Deliberately scoped out: DIWM draft panels (separate render path, rarely state dollar figures), the bereavement crisis short-circuit (never reaches the plan page), all non-NZ countries.

**Phase 2 verification — RUN THIS SESSION, RESULT: ALL PASS.** 4 test scenarios run against the live worker via the `X-Internal-Test` bypass header:
- T1/T2 — NZ bereavement, various scenarios (Funeral Grant focus): PASS, figure stated correctly, unprompted ACC mention also correct
- T3 — NZ bereavement, partner killed in car accident with two young children (stress test — pulls in nearly every figure in the block at once): PASS on all 5 figures checked (ACC Funeral Grant, ACC Survivor's Grant partner + child, Work and Income Funeral Grant, death certificate), including correct "reviewed each July" and "at least" framing
- T4 — NZ diagnosis, employed, income/sick-leave concern: PASS (capture-only test — correctly stated "at least 10 days" under the Holidays Act 2003 with no means-tested WINZ figures invented, which is the right behaviour since those are variable)

**Verdict:** every figure was quoted to the cent where expected, hedging language ("at least", "reviewed annually each 1 July") was preserved correctly, the two-tier probate rule was applied *contextually* rather than mechanically dumped regardless of relevance, and **zero instances of any of the three old stale values** ($6,837 / $33 / $2,408) appeared across any of the four generated outputs.

**Temporary disclaimer removed (commit `9efe230`, deployment `ca565a4d.cutadrift.pages.dev`) following the Phase 2 pass.** Clean 15-line removal — deleted lines 676–689 (the TEMP-tagged comment block + `try/catch` disclaimer injection) from `Public/plan/index.html`, left the permanent small-print disclaimer at the bottom of every plan untouched. Confirmed live: NZ bereavement/diagnosis plans now render directly with no banner.

**Take-the-site-down question:** Wayne asked whether to take the site offline while fixing this. Decision: **no** — the underlying bug had existed since launch with no new exposure from continuing; a same-day fix was in progress; errors found are wrong dollar figures (correctable via a phone call), not acute-harm information; and the temporary disclaimer covered the gap between "fix deployed" and "fix confirmed" — which is exactly the gap Phase 2 has now closed. Revisit the take-down question if actual daily traffic turns out to be meaningfully high (see item 9 in Outstanding Tasks — the 200/day alert threshold has never been checked against real volume).

---

## NEXT SESSION — START HERE

**The NZ pass is complete end-to-end** — country validation fixed, static guides fact-checked, hardcoded-vs-generated figures found and fixed, Phase 2 confirmed the fix works, temporary disclaimer removed. Nothing outstanding on NZ bereavement/diagnosis figures specifically.

**1. Extend the "hardcoded vs. generated" prompt audit to the other 5 countries' bereavement prompts, and to the diagnosis and carer prompts for all 6 countries.** This is the single highest-priority item now. NZ was checked because it's home turf and had known figures to verify against — but the same pattern (contamination-clean ≠ fact-checked; figures often generated from training data rather than hardcoded) is very likely present everywhere else in the worker. Use the exact sequence run this session as the template:
   - Search the prompt for hardcoded figures relevant to that country/tool, flag any that look stale
   - Identify which figures are NOT hardcoded (model-generated) — these are the higher-risk ones
   - Fact-check the correct current values against official sources for that country
   - Add/update a verified-figures block in the prompt, scoped per-country the way the NZ block was
   - Run a Phase-2-style live test (3–4 scenarios via `X-Internal-Test`) before considering it done
   - Only remove any temporary safety net after the test pass, not before

**2. Extend the static-guide fact-check to AU/UK/IE/CA/US bereavement clusters, and to the diagnosis guide clusters (all 6 countries).** Use the pattern observed this session — financial-figures pages are where errors cluster; process/legal-mechanics pages tend to be clean — to prioritise which pages to check first in each country.

**3. Once the wider-country audit is further along, revisit the outreach/SEO conversation from earlier in this session's predecessor discussion** (long-tail drafted-artifact pages, institutional distribution to funeral directors/hospices/CAB) — identified as the highest-leverage reach lever, but correctly deprioritised in favour of accuracy work once real errors started surfacing. **Don't promote the site further until at least the highest-traffic countries (likely NZ + AU + UK) have been through this same pass.**

**Deploy commands (unchanged):**
- Worker: `npx wrangler deploy`
- Static site: `cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true`

---

## Country-hardening status (all three tools) — unchanged from H45, now understood differently

- **Incapacity:** all 5 non-NZ countries done (NZ original). Country selector confirmed 6-country correct this session (was a stale-fetch false alarm, not a real gap).
- **Bereavement:** all 6 "hardened" per H1–45 (contamination-clean). **This session's finding means "hardened" ≠ "factually verified"** — NZ bereavement had 3 real errors despite being contamination-clean. The other 5 countries have not yet had an equivalent fact-check pass.
- **Diagnosis:** all 6 prompt-hardened (H32–38), guide content complete (H45). **Same caveat applies — contamination-clean is not the same as fact-checked.**

*(This distinction — hardened/contamination-clean vs. fact-verified — is the key conceptual shift from this session and should inform how "done" is defined going forward.)*

---

## Outstanding tasks

### ⚡ Priority (new this session)
1. **Extend the hardcoded-vs-generated audit to all remaining country/tool prompt combinations** (AU/UK/IE/CA/US × bereavement/diagnosis/carer) — top priority, see "Next Session — Start Here."
2. Extend the static-guide fact-check to the remaining 5 bereavement clusters + 6 diagnosis clusters.
3. ~~Run Phase 2 verification~~ — **DONE this session, all 4 tests PASS.**
4. ~~Remove temporary disclaimer~~ — **DONE this session (commit `9efe230`), confirmed live.**

### Carried from H45
5. GSC indexing backlog: all CA + all IE + any pending US pages, once quota resets.
6. Not Redundant directory pass (check GSC redirect errors cleared first).
7. Cut Adrift directory shortlist.
8. Short-diagnosis-response watch (from H38) — confirm truncated vs brief.
9. Homepage design system not yet applied site-wide (guide + tool pages still pre-redesign).
10. Incapacity family-message invents unsupplied names ("Gavin") — no-invented-names guard on next incapacity pass.
11. DIWM Phase 3 cover-letter (carried multiple sessions).
12. Diagnosis non-leak residuals (correct, left as-is) — see H38.
13. **`GLOBAL_ALERT_THRESHOLD = 200`** — revisit once real traffic is known. **Now also relevant to the "should we take the site down" question raised this session** — if traffic is meaningfully close to this threshold, the calculus on pausing during future fixes changes.
14. Watch: "The Dinner Party" residual in US bereavement.
15. Mobile click-through owed on redesigned homepage.
16. Pin "Notifying their employer" heading in bereavement prompt.
17. Tighten `verify_crisis.mjs` Path A assertion.
18. `wrangler.toml` missing `pages_build_output_dir` (non-fatal).
19. Confirm sage favicon at tab size.
20. OG image placeholder.
21. Feedback form → Google Sheet.
22. Homepage LCP: optional polish — Core Web Vitals currently 86% good / 0% poor, only homepage shows ~14% "needs improvement." Not urgent.
23. NZTA-appears-in-both-lists clarity note on `mytrove-nz-guide/` (new, optional, not a factual error).

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
| 18 | DIWM Phase 1 (diagnosis employer email + KiwiSaver script); sitemap → 42 URLs; GSC indexing requested for diagnosis tool |
| 19 | DIWM Phase 2 (bereavement leave email + bank letter); bereavement employment question; mandatory "Your work and leave" section; max_tokens → 3000; 6-scenario E2E suite (later lost) |
| 20 | Deceased's employer letter (bereavement) + weeks_ago routing fix + "Notifying their employer" section + DIWM panels |
| 21 | Closed 3 H20 priorities; fixed 4 guide pages missing disclaimers; refreshed homepage copy; began direct Claude Code file editing |
| 22 | Refined homepage hero subhead + footer trust line; verified across breakpoints |
| 23 | DIWM Phase 3: incapacity family-coordination message + question-prep panels; discovered incapacity tool IS the carer tool |
| 24 | Homepage hero/title/meta refresh; distress-adaptive bereavement intake; cleaned up superseded handovers 17–19 |
| 25 | Full homepage visual redesign (clay/sage); site-wide trust-copy fix across 26 pages; incapacity per-country hardening (AU/CA/UK/IE/US); bereavement-CA hardened + global guardrails |
| 26 | Bereavement Australia hardened. Worker `05a653a4`. |
| 27 | Bereavement United Kingdom hardened. Worker `bd4e5ea5`. |
| 28 | Bereavement Ireland hardened. Worker `ebf1d4cd`. |
| 29 | Per-IP audit + global daily counter + Resend alert. Worker `8c7bbe00`. |
| 30 | Bereavement United States hardened — bereavement sweep complete. Worker `960fb7e0`. |
| 31 | Test-bypass header added; homepage gallery first built; US bereavement re-test closed. Worker `afac0f2e`. |
| 32 | Diagnosis NZ-hardened. Worker `a9cafbe7`; 19/20 clean. |
| 33 | Homepage proof gallery remapped. Commit `9ed430e`. Flagged "Gavin" hallucination. |
| 34 | Diagnosis AU-hardened. Worker `84982b2b`; 12/12 clean. Commit `5f0da4d`. |
| 35 | Diagnosis UK-hardened. Worker `7fd2f854`; 48/48 clean. Commit `6520b3b`. |
| 36 | Diagnosis IE-hardened. Worker `16006a4b`; 48/48 clean. |
| 37 | Diagnosis CA-hardened. Worker `ec148b17`; ~47/47. Commit `cec766e`. |
| 38 | Diagnosis US-hardened (final). Worker `67c366a5`; ~48/48. Diagnosis prompt-hardening COMPLETE across all six. |
| 39 | Homepage gallery redesign. Commit `3bdf9d5`. |
| 40 | SEO/backlink strategy; content gap analysis; NZ diagnosis hub + Pages 1–2. Commits `08e1d10`, `1a203f7`. |
| 41 | Not Redundant GSC redirect errors fixed; NZ diagnosis Pages 3–5. Commits `4c9ebec`, `a340aba`, `a5e9fad`. |
| 42 | AU diagnosis cluster complete; scan refined (word-boundary; AU entities added). Commits `dc8f132`, `d22adc7`, `d5ccacb`, `f059721`, `c6010a6`. |
| 43 | UK + US diagnosis clusters complete; scan fixed (`myGov`→`my\.gov\.au`); homepage diagnosis section (NZ/AU/UK/US). US P2–P5 indexing deferred (quota). Commits `56b2cb6`+, `1829c4c`+. |
| 44 | IE diagnosis cluster complete — hub + Pages 1–5; homepage IE link. IE scan carve-outs. Commits `bd4e923`, `334a26b`, `8dcaae7`, `3966c81`, `98d2ed3`, `47f5f1f`, `e0faa42`. |
| 45 | CA diagnosis cluster complete — SIX-COUNTRY DIAGNOSIS GUIDE CLUSTER FINISHED. Per-page verification caught & fixed a Page 1 sick-leave error (`3d1b78b`). Tool-link CTA workstream — 36 diagnosis + 38 bereavement guide pages now link to their tool (`6561ebf`, `9030182`, `8ab7d38`). |
| 46 | **First fact-verification pass on live content (new workstream) — FULLY CLOSED for NZ.** Removed unvalidated "Somewhere else" country option, added worker-side allowlist validation. Fact-checked full NZ bereavement guide cluster (6 pages) — 3 pages had real errors (ACC grants, cert fee, and a 9-month-wrong probate threshold), all fixed and deployed (`5e7104b`, `96f5ef0`, `8567015`). **Bigger finding: most NZ financial figures in the bereavement worker prompt were not hardcoded — model was generating them from training data.** Fixed 2 hardcoded stale values + added a verified-figures block to the prompt (`884da2a`, worker `2bb74ac2`). Added temporary disclaimer to generated plans as a safety net (`b5d5eec`), **then ran Phase 2 verification (4 live test scenarios via `X-Internal-Test`) — all PASS**, confirming the model reliably respects the new block with correct hedging and zero stale values. Temporary disclaimer removed once confirmed (`9efe230`). **NZ pass complete end-to-end; now the template for AU/UK/IE/CA/US — top priority next session.** |
