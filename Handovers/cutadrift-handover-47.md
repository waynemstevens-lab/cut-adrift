# Cut Adrift — Handover Document 47
**Updated:** 1 July 2026
**Session work:** Extended the fact-verification workstream (begun in H46 for NZ) to all five remaining countries — AU, UK, IE, CA, US. Two distinct workstreams ran in parallel this session: (1) worker prompt hardening for AU and CA, adding verified-figures blocks and wrong-details guards; (2) static guide page fact-checks across all six countries' bereavement clusters. Four guide pages had real errors and were fixed. The full six-country bereavement guide fact-check is now complete. **START NEXT SESSION with: run AU and CA tool test scenarios (deferred this session), then check whether UK probate fee rose to £526 on 13 July.**
**Supersedes:** H46 (kept on disk). Cumulative session-history table preserved below.

---

## Project overview / Deploy commands

**Cut Adrift** — three tools (`bereavement`, `diagnosis`, `incapacity`/carer), six countries (NZ, AU, UK, IE, CA, US). Cloudflare Worker holds system prompts + calls Claude and streams SSE; static site (`Public/`) is the front end.

**Two separate deploys:**
- **Worker:** `npx wrangler deploy` → `cutadrift-engine`
- **Static site:** `cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true`

**Current worker version:** `6ca30ae5` (was `2bb74ac2` at H46 — three worker deploys this session, see below).

**Test-bypass header:** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04`

---

## New this session — Worker prompt hardening: AU and CA bereavement

### Australia — two new blocks added (commits `3601270` + `a6c3eb2`, workers `cadd3c15` → `e1fdbf0a`)

**Block 1 — AU bereavement payments** (inserted after the compassionate-leave paragraph, before the estate-terminology heading):
- Centrelink bereavement payment is circumstantial — never state a dollar figure; always direct to 132 300
- Single-person deaths: no extra lump sum — executor accesses final payment from the bank account
- "Bereavement Allowance" is obsolete (closed 20 March 2020, folded into JobSeeker) — never name it as a current payment
- No national funeral grant — the Australian Government has none; the bereavement payment may help offset costs, state hardship programs exist but don't invent one
- Probate fees and death-certificate fees are state/territory-set — never state a national figure
- Guards explicitly block the "$50,000 bereavement payment" and "$2,500 death benefit" myths that circulate online

**Block 2 — AU wrong-details guard** (inserted before the compassionate-leave paragraph, inside the contacts section):
- Never give "1-800-MEDICARE" or any Medicare phone number — that is the US Medicare line; AU Medicare is handled via Services Australia 132 300 or the Australian Death Notification Service
- Never state "$40,000" or "$15,000" as a national probate/bank-release threshold — those are New Zealand figures; AU is state-by-state
- Never name "Form 1041" — that is a US tax form; Australia has no equivalent; direct to ATO 13 28 61
- Never give a ballpark range for death-certificate copy fees — state-based; name the relevant BDM and tell them to check
- Never refer to the "DVLA" — that is the UK agency; in Australia name the state/territory transport authority

### Canada — verified figures block added (commit `5ab31c6`, worker `6ca30ae5`)

Inserted before the Ontario estate-terminology heading:
- **CPP Death Benefit:** base $2,500 (every eligible estate); top-up of an additional $2,500 (max $5,000 total) only if the deceased never received CPP/QPP retirement/disability benefits AND has no eligible surviving spouse — most retired contributors receive only the $2,500 base. Form ISP1200, executor applies within 60 days.
- **Bereavement leave:** federally regulated employees get 10 days (first 3 paid after 3 months' service, up to 8 weeks for death of a child under the Dec 2025 amendment); Ontario ESA employees get 2 days unpaid; provinces vary — never say "3 days" as a universal Canadian entitlement
- **No national funeral grant** — CPP death benefit may offset costs; provincial/municipal hardship programs exist but don't invent a federal payment
- **Estate Administration Tax (Ontario):** calculated on estate value — never state a flat fee; name it correctly and refer to ontario.ca or their estate lawyer

**Phase 2 testing for AU and CA was deferred** — tool scenarios were not run this session. Run them before considering AU/CA worker hardening fully closed. See "Next Session" below.

---

## New this session — Static guide fact-checks (all 6 countries)

The NZ pass (H46) established the template. This session extended it to AU, UK, IE, CA, US bereavement guide clusters. The diagnostic command used: `python3 -c "..."` to strip HTML tags and grep for figures, run per country.

**Pattern confirmed again:** financial-figures pages are where errors cluster. Process/legal-mechanics pages tend to be clean.

### Results by country

| Country | Pages checked | Errors found | Fixed | Commits |
|---------|--------------|--------------|-------|---------|
| US | `us-funeral-financial-assistance`, `us-social-security-survivor-benefits`, `us-bereavement-leave`, `us-notify-agencies-after-death`, `what-to-do-when-someone-dies-us` | 1 | 1 | `b58815f` |
| AU | `au-funeral-financial-assistance`, `au-bereavement-payment`, `au-bereavement-leave` | 0 | — | — |
| UK | `uk-funeral-expenses-payment`, `uk-bereavement-support-payment`, `uk-bereavement-leave`, `what-to-do-when-someone-dies-uk` | 1 | 1 | `dc1ada7` |
| IE | `ireland-bereavement-payments`, `ireland-funeral-financial-assistance`, `ireland-bereavement-leave`, `what-to-do-when-someone-dies-ireland` | 1 | 1 | `b28af51` |
| CA | `what-to-do-when-someone-dies-canada`, `canada-survivor-benefits`, `canada-bereavement-leave`, `canada-funeral-financial-assistance` | 1 | 1 | `4fd5a23` |
| NZ | Done in H46 | — | — | — |

### Errors fixed

1. **US — VA burial allowance: $948 → $1,002** (`us-funeral-financial-assistance`, commit `b58815f`)
   The non-service-connected VA burial allowance increased from $948 to $1,002 effective 1 October 2025. The service-connected figure of $2,000 was correct and untouched. The 2.8% Social Security COLA for 2026 and survivor benefit percentages (37.5% under 65, 60% at 65+) were verified correct.

2. **UK — Death certificate fee: £11 → £12.50** (`what-to-do-when-someone-dies-uk`, commit `dc1ada7`)
   The statutory register office fee and GRO standard service fee in England & Wales is £12.50. The page stated £11. The worker already had £12.50 ("about £12.50 each"), confirming the guide was wrong. BSP rates (£3,500/£350 higher rate; £2,500/£100 standard rate), IHT thresholds (£325k NRB, £175k RNRB, 40%), and FEP £1,000 cap were all verified correct.
   **Upcoming watch:** UK probate fee is due to rise from £300 to £526 on **13 July 2026** (subject to parliamentary approval) — check GOV.UK that day and update the worker's England & Wales probate section and any guide pages if it passes.

3. **IE — False statutory parental bereavement leave claim corrected** (`ireland-bereavement-leave`, commit `b28af51`)
   The page stated "Since 2022, parents are entitled to 5 days' paid Parental Bereavement Leave following the death of a child under 18." This is wrong for the Republic of Ireland — there is no statutory entitlement to parental bereavement leave in the Republic (the Parental Bereavement Leave (Amendment) Bill 2021 was still at Second Stage in Dáil Éireann as of 2023 and was not enacted). The 2-week entitlement exists in Northern Ireland, not the Republic. The guide page text was corrected to accurately describe the position (no statutory entitlement; employer custom and practice typically 3–5 days). The heading was renamed from "Parental Bereavement Leave" to "Parental Bereavement Leave — no statutory entitlement in Ireland." The €850 Special Funeral Grant under the Occupational Injuries Benefits Scheme was verified correct.

4. **CA — CPP Death Benefit reference updated: "$2,500" → "base $2,500, up to $5,000"** (`canada-funeral-financial-assistance`, commit `4fd5a23`)
   The page stated "The CPP Death Benefit ($2,500)" — this was the pre-January 2025 flat amount. Effective 1 January 2025, a top-up of an additional $2,500 applies in certain circumstances (deceased never received CPP/QPP retirement or disability benefits and leaves no eligible surviving spouse), raising the maximum to $5,000. The `canada-survivor-benefits` page already had the correct two-tier description; only the funeral page needed updating. Survivor pension percentages (37.5% under 65, 60% at 65+) verified correct on canada.ca.

### Verified clean (no errors)

- **AU:** the three pages checked (`au-funeral-financial-assistance`, `au-bereavement-payment`, `au-bereavement-leave`) were clean. DVA funeral benefit $2,000 confirmed per DVA's own CLIK policy library. **Coverage gap: `what-to-do-when-someone-dies-au` and `au-notify-agencies-after-death` not checked this session** — add to next AU pass (risk is low based on consistent pattern, but not zero). Watch note: effective 1 July 2026 the VEA closed to new claims (all new claims under MRCA); $2,000 remains valid for existing VEA claims; revisit once DVA publishes MRCA funeral benefit guidance.
- **IE:** €850 funeral grant confirmed on gov.ie and citizensinformation.ie. No other specific figures on the cluster.
- **CA:** CPP survivor pension percentages correct; bereavement leave provincial breakdown approximately correct (federal 3 days paid, Ontario 2 days unpaid, BC 3 days paid, Alberta 3 days paid after 90 days, Quebec 1 day paid + 4 unpaid).
- **UK:** BSP, IHT thresholds, FEP cap, probate fee all correct at time of check. Probate fee watch as noted above.

### NZ ACC rate watch (ongoing from H46)

The ACC Funeral Grant ($7,990.30) and Survivor's Grant ($8,566.62 partner / $4,283.32 per child) were verified on 1 July 2026 — unchanged from the 1 July 2025 rates published on acc.co.nz (last published 4 July 2025). The 2026/27 rates have not yet been published. **Re-check acc.co.nz around 4–7 July 2026** — last year's refresh landed on 4 July. If the figures bump, update: (a) the worker's NZ verified-figures block (lines 261–271), and (b) `acc-death-benefit-nz/index.html`.

---

## NEXT SESSION — START HERE

**1. Run AU and CA Phase 2 test scenarios** (deferred this session — do these first).

**AU test scenarios** (4 scenarios via `X-Internal-Test` header):
- AU-1: Partner died (expected), both on Age Pension, retired, worried about funeral costs. Pass: bereavement payment circumstantial/no figure; no invented funeral grant; no "$50,000" / "$2,500" / "Bereavement Allowance"; 132 300 correctly referenced.
- AU-2: Spouse died, survivor employed full-time, never on Centrelink. Pass: compassionate leave **2 days, paid** (the one pinned figure); bereavement payment correctly flagged as likely not applicable; none of the blocked terms.
- AU-3: Partner killed in accident, two young children, survivor was carer on Carer Payment, working part-time. Pass: bereavement payment circumstantial/no figure; Carer Payment continuation as "up to 14 weeks" with no dollar amount; 2-day leave correct for part-time; no invented funeral grant; correct estate terms (Grant of Probate / Letters of Administration, state registry).
- AU-4 (optional): Same as AU-1 but survivor mentions reading about a "$50,000 bereavement payment" online. Pass: model does not confirm $50,000 — corrects to "circumstantial, confirm with Services Australia."

**CA test scenarios** (3–4 scenarios via `X-Internal-Test` header):
- CA-1: Partner died, both had CPP contributions, survivor employed in Ontario. Pass: CPP death benefit correctly stated as "base $2,500, up to $5,000 if [conditions met]"; bereavement leave correctly described as depending on whether federally regulated; never "3 days" as universal.
- CA-2: Partner died, survivor in federally regulated employment (e.g. bank employee). Pass: 10 days bereavement leave (3 paid), form ISP1200 within 60 days, CPP death benefit two-tier correctly stated.
- CA-3: Partner died, survivor in Ontario private sector. Pass: Ontario ESA 2 days unpaid correctly described; CPP death benefit two-tier; no invented federal funeral grant.

**2. UK probate fee check — 13 July 2026.** If the fee rises from £300 to £526 (parliamentary approval pending), update:
- `worker.js` line in the E&W probate section (currently reads "The application fee is £300 for estates of £5,000 or more")
- `what-to-do-when-someone-dies-uk/index.html` if it mentions the £300 fee (check with grep)
- Deploy both (worker deploy + static site deploy)

**3. NZ ACC rates check — around 4–7 July 2026.** If acc.co.nz publishes new 2026/27 rates, update the worker's NZ verified-figures block and `acc-death-benefit-nz/index.html`. (See NZ ACC rate watch section above.)

**4. AU DVA MRCA funeral benefit — revisit in 2–3 weeks.** VEA closed to new claims 1 July 2026. Once DVA publishes guidance on MRCA funeral benefit amounts, check if `au-funeral-financial-assistance` needs updating.

**5. Continue fact-verification to diagnosis guide clusters (all 6 countries)** — same methodology as bereavement guides. Financial-figures pages first. Run the per-country grep, spot-check specific dollar amounts against official sources. No priority country order established yet; NZ diagnosis guides were checked separately in H46 (no errors found — myTrove, funeral grant, probate threshold all clean); AU, UK, IE, CA, US diagnosis clusters not yet checked.

**6. Outreach/SEO workstream** (carried from H46) — long-tail drafted-artifact pages, institutional distribution to funeral directors/hospices/CAB. Still correctly deprioritised in favour of accuracy work. Revisit once at least the highest-traffic countries (NZ, AU, UK) are through both bereavement and diagnosis fact-checks.

---

## Country hardening + fact-verification status (all three tools)

| Country | Contamination hardening | Bereavement guide fact-check | Diagnosis guide fact-check | Worker figures verified |
|---------|------------------------|------------------------------|---------------------------|------------------------|
| NZ | ✓ (H1–H30) | ✓ H46 | ✓ H46 (clean) | ✓ H46 (6 figures pinned, Phase 2 PASS) |
| AU | ✓ (H26) | ✓ H47 (clean) | ✗ not yet | ✓ H47 (blocks added; Phase 2 PENDING) |
| UK | ✓ (H27) | ✓ H47 (1 fix) | ✗ not yet | ✓ H47 (verified; probate fee watch 13 Jul) |
| IE | ✓ (H28) | ✓ H47 (1 fix) | ✗ not yet | ✓ H47 (verified correct) |
| CA | ✓ (H37) | ✓ H47 (1 fix) | ✗ not yet | ✓ H47 (block added; Phase 2 PENDING) |
| US | ✓ (H38) | ✓ H47 (1 fix) | ✗ not yet | ✓ (instruct-don't-state model; no changes needed) |

---

## Outstanding tasks

### ⚡ Priority

1. **Run AU Phase 2 test scenarios** (4 scenarios) — confirm worker blocks are respected before calling AU done.
2. **Run CA Phase 2 test scenarios** (3–4 scenarios) — same.
3. **UK probate fee — check 13 July 2026** — update worker + guide page if £526 passes.
4. **NZ ACC rates — check 4–7 July 2026** — update worker block + acc-death-benefit-nz page if rates change.
5. **Extend fact-check to diagnosis guide clusters** — AU, UK, IE, CA, US all unchecked.
6. **Complete AU bereavement guide check** — `what-to-do-when-someone-dies-au` and `au-notify-agencies-after-death` not yet checked (also `uk-tell-us-once-guide` and notify-agencies pages for UK, IE, CA not checked — low risk but worth a pass).

### Carried from H46

7. GSC indexing backlog: all CA + all IE + any pending US pages, once quota resets.
8. Not Redundant directory pass (check GSC redirect errors cleared first).
9. Cut Adrift directory shortlist.
10. Short-diagnosis-response watch (from H38).
11. Homepage design system not yet applied site-wide.
12. Incapacity family-message invents unsupplied names ("Gavin") — no-invented-names guard on next incapacity pass.
13. DIWM Phase 3 cover-letter (carried multiple sessions).
14. Diagnosis non-leak residuals (correct, left as-is) — see H38.
15. **`GLOBAL_ALERT_THRESHOLD = 200`** — revisit once real traffic is known.
16. Watch: "The Dinner Party" residual in US bereavement.
17. Mobile click-through owed on redesigned homepage.
18. Pin "Notifying their employer" heading in bereavement prompt.
19. Tighten `verify_crisis.mjs` Path A assertion.
20. `wrangler.toml` missing `pages_build_output_dir` (non-fatal).
21. Confirm sage favicon at tab size.
22. OG image placeholder.
23. Feedback form → Google Sheet.
24. Homepage LCP: optional polish.
25. NZTA-appears-in-both-lists clarity note on `mytrove-nz-guide/` (optional, not a factual error).
26. AU DVA MRCA funeral benefit — revisit once DVA publishes guidance (new, see above).

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
| 46 | First fact-verification pass on live content (new workstream) — FULLY CLOSED for NZ. Removed unvalidated "Somewhere else" country option, added worker-side allowlist validation. Fact-checked full NZ bereavement guide cluster — 3 pages fixed (`5e7104b`, `96f5ef0`, `8567015`). Bigger finding: most NZ financial figures in bereavement worker prompt were not hardcoded — model was generating them from training data. Fixed 2 hardcoded stale values + added verified-figures block to prompt (`884da2a`, worker `2bb74ac2`). Phase 2 verification (4 live test scenarios) — all PASS. Temporary disclaimer removed (`9efe230`). |
| 47 | **Fact-verification extended to AU/UK/IE/CA/US bereavement guide clusters — all six countries now complete.** Worker hardening for AU (bereavement payments block + wrong-details guard; workers `cadd3c15`, `e1fdbf0a`) and CA (verified figures block; worker `6ca30ae5`). Static guide fixes: US VA burial $948→$1,002 (`b58815f`); UK death cert £11→£12.50 (`dc1ada7`); IE false parental bereavement leave claim corrected (`b28af51`); CA CPP death benefit $2,500→base $2,500/up to $5,000 (`4fd5a23`). AU and CA worker Phase 2 tests deferred. **Note: AU check covered 3 of 5 guide pages — `what-to-do-when-someone-dies-au` and `au-notify-agencies-after-death` not yet checked.** UK probate fee watch: £300→£526 likely 13 July 2026. NZ ACC rates watch: re-check acc.co.nz around 4–7 July. |
