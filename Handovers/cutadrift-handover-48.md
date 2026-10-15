# Cut Adrift — Handover Document 48
**Updated:** 2 July 2026
**Session work:** Completed the diagnosis guide fact-check workstream across all 25 pages (5 countries × 5 pages). IE: applied the final Illness Benefit day fix to `what-to-do-after-a-serious-diagnosis-ie`. CA: checked remaining pages (what-to-do, telling-people, hub) — all clean. US: confirmed remaining pages clean; high-risk page fixes from previous session verified in place. NZ ACC rates checked — still $7,990.30. AU Phase 2 bereavement tests (4 scenarios) run via terminal — AU-3 found a gap (Carer Payment 14-week continuation not stated); fixed in Cut Adrift worker and retested PASS. Not Redundant accuracy tests run (4 scenarios across NZ/UK/IE/CA); 4 errors found and fixed via output-level corrections + prompt hardening; all 4 retested PASS. Both workers committed and deployed.
**Supersedes:** H47 (kept on disk). Cumulative session-history table preserved below.

---

## Project overview / Deploy commands

**Cut Adrift** — three tools (`bereavement`, `diagnosis`, `incapacity`/carer), six countries (NZ, AU, UK, IE, CA, US). Cloudflare Worker holds system prompts + calls Claude and streams SSE; static site (`Public/`) is the front end.

**Two separate deploys:**
- **Worker:** `npx wrangler deploy` (from `~/Desktop/Cut Adrift/`)
- **Static site:** `cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true`

**Current Cut Adrift worker version:** `9bf7ddd4` (AU bereavement Carer Payment fix)
**Current Not Redundant worker version:** `5b0b4568` (UK/IE/CA accuracy fixes)

**Test-bypass header:** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04`

---

## New this session — Diagnosis guide fact-check: COMPLETE (all 6 countries)

### Methodology
Per-country Python grep extracts lines containing financial figures from HTML. High-risk pages (financial-help, work-and-income, insurance-claims) verified against official government sources. Low-risk pages (telling-people, hub) scanned but rarely need fixes. Pattern confirmed: errors cluster on financial-figures pages.

### Final scorecard

| Country | Pages checked | Errors fixed | Key fixes |
|---------|--------------|--------------|-----------|
| AU | 5 | 1 | DSP hours threshold 20hrs → 15hrs (`what-to-do-after-a-serious-diagnosis-au`) |
| UK | 5 | 2 | PIP eligibility "aged 16 to 64" → "under State Pension age (currently 66)" on `financial-help-serious-illness-uk` (commit `9ff15d2`) and `what-to-do-after-a-serious-diagnosis-uk` (commit `de33a7c`) |
| IE | 5 | 3 | Illness Benefit day-4 → day-6 on `serious-illness-work-and-income-ie` (commit `6656146`) and `what-to-do-after-a-serious-diagnosis-ie` (commit `0828771`); Travel2Care €1,000/year unverifiable figure removed from `financial-help-serious-illness-ie` (commit `678edcd`) |
| CA | 5 | 0 | Cleanest cluster — all figures verified correct |
| US | 5 | 2 | Part D cap $2,000 → $2,100 for 2026; CFPB medical debt rule vacated July 2025 (both on `financial-help-serious-illness-us`) |
| **Total** | **25** | **8** | |

NZ diagnosis guides were checked in H46 — clean (no errors).

### IE fix applied this session
- **`what-to-do-after-a-serious-diagnosis-ie`** — Illness Benefit "from the fourth day" → "from day 6 for most employees (SSP covers the first 5 days...)" — commit `0828771`, deployed.

### CA — all figures verified correct
Key verifications: EI $729/week (55%, 26 weeks, 600 hours) ✓; Canada Disability Benefit $200→$204 from July 2026 ✓; Alberta job-protected leave 27 weeks from January 2026 ✓; self-employed EI $1.63/$100, max $1,123.07, lower in Quebec ✓; pharmacare bilateral agreements BC/Manitoba/PEI/Yukon only, diabetes + contraceptives only ✓; bankruptcy first-time 9 months ✓.

### US — fixes applied in previous session, confirmed correct this session
- **Part D cap:** "Starting in 2025... $2,000 per calendar year" → "$2,000 in 2025, rising to $2,100 in 2026 (indexed annually)". The 2026 cap is $2,100.
- **CFPB medical debt rule:** the finalized January 2025 rule was vacated by a federal court on 11 July 2025 (CFPB joined the motion). Updated to reflect vacated status. The voluntary 2022–2023 credit bureau changes (removing paid medical debt and collections under $500) remain in effect.

### NZ ACC rates — no change
ACC funeral grant confirmed $7,990.30 on acc.co.nz as of 2 July 2026. 2026/27 rates not yet published. Re-check in approximately one week.

---

## New this session — AU Phase 2 bereavement tests: COMPLETE

4 scenarios run via terminal curl against live worker (test-bypass header):

| Scenario | Result | Notes |
|----------|--------|-------|
| AU-1: Retired/Age Pension | 4/4 ✓ | Soft flag: "DVLA equivalent" leaked but self-corrected inline |
| AU-2: Employed survivor | 3/3 ✓ | 2 days compassionate leave correct, AU numbers clean |
| AU-3: Carer/accident/children | 3/4 → 3/3 ✓ | FAIL on 14 weeks → worker fix applied → retest PASS |
| AU-4: $50k payment myth | 3/3 ✓ | Myth not confirmed, correct referral to Services Australia |

**Worker fix applied (Cut Adrift):** Added Carer Payment 14-week bereavement continuation to AU verified-figures block at line 342 of worker.js. Deploy commit: `92d8351`, worker version `9bf7ddd4`.

---

## New this session — Not Redundant accuracy tests: COMPLETE

4 scenarios tested via terminal curl against firststeps-engine (`bypass_rate_limit: true`):

| Scenario | Initial | After fixes |
|----------|---------|-------------|
| NR-1: NZ redundancy | 3/3 ✓ | — |
| NR-2: UK unfair dismissal | 3/3 → 3/3 ✓ | £643 → £751 via output fix |
| NR-3: IE WRC complaint | 1/3 → 3/3 ✓ | "two years" → "6 months" via output fix |
| NR-4: CA notice/EI | 1/3 → 3/3 ✓ | CEAB removed, $650 → $729 via output fix |

**Not Redundant worker had no verified-figures block** — relying entirely on Haiku's training data, which contained 4 stale/wrong facts. Fixes applied:

1. **UK £643 weekly cap** → £751 (April 2026): output-level replacement on both live and cached paths
2. **IE WRC unfair dismissal "up to two years"** → "up to 6 months": output-level replacement (required `\*{0,2}` regex to handle markdown bold markers around the phrase)
3. **CA "Canada Emergency Assistance Benefit (CEAB)"**: phantom program sentence removed from output (CEAB is not a current active program)
4. **CA EI maximum "$650/week"** → "$729/week": output-level replacement (was citing 2024 figure)

Prompt anchors also hardened for UK, IE (WRC deadline), and CA (EI must-mention, CEAB ban, common law must-mention).

Not Redundant final worker version: `5b0b4568`. All fixes committed: `[main 1c37f49]`.

---

## Country hardening + fact-verification status (all three tools)

| Country | Contamination hardening | Bereavement guide fact-check | Diagnosis guide fact-check | Worker figures verified |
|---------|------------------------|------------------------------|---------------------------|------------------------|
| NZ | ✓ | ✓ H46 | ✓ H46 (clean) | ✓ H46 (6 figures pinned; Phase 2 PASS) |
| AU | ✓ H26 | ✓ H47 (clean) | ✓ H48 (1 fix) | ✓ H47+H48 (blocks added; Phase 2 PASS H48) |
| UK | ✓ H27 | ✓ H47 (1 fix) | ✓ H48 (2 fixes) | ✓ H47 (verified; probate fee watch 13 Jul) |
| IE | ✓ H28 | ✓ H47 (1 fix) | ✓ H48 (3 fixes) | ✓ H47 (verified correct) |
| CA | ✓ H37 | ✓ H47 (1 fix) | ✓ H48 (clean) | ✓ H47 (block added; Phase 2 PENDING) |
| US | ✓ H38 | ✓ H47 (1 fix) | ✓ H48 (2 fixes) | ✓ (instruct-don't-state model) |

---

## NEXT SESSION — START HERE

**1. UK probate fee — check 13 July 2026** (11 days away)
If the fee rises from £300 to £526 (parliamentary approval required):
- `worker.js` — update the E&W probate section (currently reads "The application fee is £300 for estates of £5,000 or more")
- `what-to-do-when-someone-dies-uk/index.html` — grep for "£300" and update if present
- Deploy both (worker + static)

**2. NZ ACC rates — check around 9–12 July 2026**
$7,990.30 confirmed unchanged as of 2 July. Last year's rates published ~4 July. If 2026/27 rates change:
- Update worker NZ verified-figures block (lines 261–271 in worker.js)
- Update `acc-death-benefit-nz/index.html`
- Deploy both

**3. Not Redundant fact-check** — same methodology as Cut Adrift diagnosis pass. High-risk pages first (financial/benefits pages with specific dollar amounts, statutory periods, tribunal deadlines). Six countries, same risk profile as Cut Adrift. Expected 2–3 sessions.
- Repo: `waynemstevens-lab/not-redundant`
- Static deploy: `firststeps` Pages project
- Worker: `firststeps-engine`

**4. AU and CA bereavement worker Phase 2 tests** (deferred from H47 — still pending)

AU scenarios (4 — use `X-Internal-Test` header):
- AU-1: Partner died, both on Age Pension, worried about funeral costs
- AU-2: Spouse died, survivor employed full-time, never on Centrelink
- AU-3: Partner killed in accident, two young children, survivor was carer
- AU-4 (optional): Survivor mentions reading about "$50,000 bereavement payment" online

CA scenarios (3 — use `X-Internal-Test` header):
- CA-1: Partner died, both had CPP contributions, survivor in Ontario
- CA-2: Partner died, survivor in federally regulated employment (bank)
- CA-3: Partner died, survivor in Ontario private sector

**5. AU DVA MRCA funeral benefit** — revisit once DVA publishes MRCA guidance (VEA closed to new claims 1 July 2026). Check `au-funeral-financial-assistance` if MRCA amounts are published.

**6. AU bereavement coverage gap** — `what-to-do-when-someone-dies-au` and `au-notify-agencies-after-death` not yet fact-checked (low risk based on pattern, but not zero).

---

## Outstanding tasks

### ⚡ Priority

1. UK probate fee — 13 July 2026
2. NZ ACC rates — ~9–12 July 2026
3. CA Phase 2 bereavement tool tests (still pending — AU now done)
4. Not Redundant: AU and US accuracy tests not yet run (NZ/UK/IE/CA done this session)

### Carried from H47

5. GSC indexing backlog: all CA + all IE + any pending US pages, once quota resets
6. Not Redundant directory pass (check GSC redirect errors cleared first)
7. Cut Adrift directory shortlist
8. Short-diagnosis-response watch (from H38)
9. Homepage design system not yet applied site-wide
10. Incapacity family-message invents unsupplied names ("Gavin") — no-invented-names guard on next incapacity pass
11. DIWM Phase 3 cover-letter (carried multiple sessions)
12. Diagnosis non-leak residuals (correct, left as-is) — see H38
13. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known
14. Watch: "The Dinner Party" residual in US bereavement
15. Mobile click-through owed on redesigned homepage
16. Pin "Notifying their employer" heading in bereavement prompt
17. Tighten `verify_crisis.mjs` Path A assertion
18. `wrangler.toml` missing `pages_build_output_dir` (non-fatal)
19. Confirm sage favicon at tab size
20. OG image placeholder
21. Feedback form → Google Sheet
22. Homepage LCP: optional polish
23. NZTA-appears-in-both-lists clarity note on `mytrove-nz-guide/` (optional)
24. AU DVA MRCA funeral benefit — revisit once DVA publishes guidance
25. AU bereavement gap: `what-to-do-when-someone-dies-au` + `au-notify-agencies-after-death` not fact-checked
26. Outreach/SEO workstream — still correctly deprioritised behind accuracy work

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
| 19 | DIWM Phase 2 (bereavement leave email + bank letter); bereavement employment question; mandatory "Your work and leave" section; max_tokens → 3000; 6-scenario E2E suite |
| 20 | Deceased's employer letter (bereavement) + weeks_ago routing fix + "Notifying their employer" section + DIWM panels |
| 21 | Closed 3 H20 priorities; fixed 4 guide pages missing disclaimers; refreshed homepage copy; began direct Claude Code file editing |
| 22 | Refined homepage hero subhead + footer trust line; verified across breakpoints |
| 23 | DIWM Phase 3: incapacity family-coordination message + question-prep panels; discovered incapacity tool IS the carer tool |
| 24 | Homepage hero/title/meta refresh; distress-adaptive bereavement intake; cleaned up superseded handovers 17–19 |
| 25 | Full homepage visual redesign (clay/sage); site-wide trust-copy fix across 26 pages; incapacity per-country hardening; bereavement-CA hardened + global guardrails |
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
| 42 | AU diagnosis cluster complete; scan refined. Commits `dc8f132`+. |
| 43 | UK + US diagnosis clusters complete; homepage diagnosis section. Commits `56b2cb6`+, `1829c4c`+. |
| 44 | IE diagnosis cluster complete — hub + Pages 1–5; homepage IE link. Commits `bd4e923`+. |
| 45 | CA diagnosis cluster complete — SIX-COUNTRY DIAGNOSIS GUIDE CLUSTER FINISHED. CTA workstream — 36 diagnosis + 38 bereavement guide pages link to tool. Commits `6561ebf`+. |
| 46 | First fact-verification pass — NZ FULLY CLOSED. Removed "Somewhere else" country option. NZ bereavement 3 fixes. Worker NZ figures block added. Phase 2 PASS. Worker `2bb74ac2`. |
| 47 | Fact-verification extended to AU/UK/IE/CA/US bereavement guides — all six complete. Worker hardening AU + CA bereavement. Static fixes: US VA burial $948→$1,002; UK death cert £11→£12.50; IE false parental bereavement claim corrected; CA CPP death benefit updated. Worker `6ca30ae5`. |
| 48 | **Diagnosis guide fact-check COMPLETE — all 25 pages across 5 countries.** 8 errors fixed. AU Phase 2 bereavement tests PASS (Carer Payment 14-week fix applied, Cut Adrift worker `9bf7ddd4`). Not Redundant accuracy tests run (NZ/UK/IE/CA): 4 errors found and fixed via output-level corrections (£643→£751, IE WRC 6-month deadline, CA CEAB removed, CA EI $650→$729). NR worker `5b0b4568`, commit `1c37f49`. NZ ACC rates confirmed $7,990.30 unchanged. |
