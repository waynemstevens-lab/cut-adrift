# Cut Adrift — Handover Document 36
**Updated:** 22 June 2026
**Session work:** **Hardened the diagnosis tool for two more countries — the United Kingdom and Ireland** (carrying the per-country anti-hallucination sweep forward from NZ (H32) and AU (H34)). Four of six diagnosis countries are now done: **NZ, AU, UK, IE**; only **Canada and the United States** remain. Each pass: clone the leak harness, baseline via the test-bypass header at 48 runs, add a per-country "use only these" entity block to the diagnosis prompt, deploy, re-test at 48 runs. UK baselined near-perfect (model-strong jurisdiction); Ireland had real tail leaks and the heaviest harness-collision load yet. Both finished **48/48 clean**.
**Supersedes:** all earlier handovers (this is now the single retained handover — older files pruned this session at Wayne's request; the cumulative session-history table is preserved below).

---

## Project overview / Deploy commands

**Cut Adrift** — a free tool that helps people in the first days after a hard life event (a death, a serious diagnosis, losing capacity to manage affairs). Three tools (`bereavement`, `diagnosis`, `incapacity`/carer), each serving six countries (NZ, AU, UK, IE, CA, US). A Cloudflare Worker holds the system prompts + calls Claude and streams SSE; a static site (`Public/`) is the front end.

**Two separate deploys — do not confuse them:**
- **Worker (the prompts + rate limiter):** `npx wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`. **A prompt change requires THIS deploy.**
- **Static site:** `npx wrangler pages deploy Public` (from repo root) → serves `cutadrift.org`. The `wrangler.toml` "missing `pages_build_output_dir`" warning is benign. A pages-only deploy silently leaves the prompt stale; a worker-only deploy is correct for a prompt-only change (Pages shows "0 files… already uploaded" when `Public/` is untouched).
- Per-tool model + token maps live in `worker.js` (`MODELS` / `MAX_TOKENS`). **Diagnosis runs on `claude-sonnet-4-6`, 4000 max_tokens, ~9–15k-char outputs** (smarter + longer than the Haiku-driven bereavement/incapacity tools).

**Test-bypass header (from H31):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04` — skips the per-IP gate + global counter, so testing is free of the public rate limit. Hard-coded as a fallback in the diag harnesses.

**This session's worker versions:** UK block → `7fd2f854`; IE block → `16006a4b` (current).

---

## The diagnosis country-hardening method (reference — used four times now)

The diagnosis prompt (`SYSTEM_PROMPTS.diagnosis` in `worker.js`) is structurally different from bereavement/incapacity: it has **no per-country sections** — it inlines all six countries' benefit names + statutes into single sentences. That inline-all-countries phrasing IS the cross-country leak surface. A global two-rule guardrail (H32, after the `country` field) says "name only the user's own country's entities" + "no invented/mislocalized names or URLs"; each hardened country then gets a dedicated **"[Country] plans — use only these"** anchor-and-ban block.

**Per country:** clone `tests/diag_diagnosis_<prev>.mjs` → swap the home country + FAIL/PRESENCE checks → **baseline 48 runs** via the bypass header → read every flagged capture against the actual text (the NZ counter-lesson: confirm a "leak" is REAL before acting — many are harness false positives) → add the "use only these" block after the previous country's → `wrangler deploy` → **re-test 48 runs**. Each country has its OWN false-positive collisions to map — this is the recurring trap (see per-country notes below).

---

## New this session

### 1. Diagnosis — United Kingdom hardening (DONE) — Worker `7fd2f854`

**Harness `tests/diag_diagnosis_uk.mjs`** (clone of the AU one). **UK-specific false-positive guards:** the UK has its OWN **Human Rights Act 1998** (flag only NZ's "Human Rights Act **1993**"); UK "**HSE**" = the **Health and Safety Executive** ≠ Ireland's Health Service Executive (flag IE by full name only); Equality Act 2010 / NHS / SSP / PIP / ESA / Universal Credit / Access to Work / Macmillan / Citizens Advice / Turn2us are UK **anchors**; "Disability Living Allowance"/DLA won't trip the `/disability allowance/i` NZ/IE flag (the word "Living" separates); "Jobseeker's Allowance"/JSA isn't the AU/NZ jobseeker schemes; flag the AU "Disability Discrimination Act **1992**" by year (a bare DDA could be NI's still-in-force 1995 act).

**Baseline (worker `84982b2b`, 48 runs): 47/48** — and the one flag was a **non-leak**: *"check your superannuation — which for you means your pension"* (a benign generic-word usage immediately glossed to "pension", not an AU-scheme relabel; per the NZ counter-lesson, effectively 48/48). The UK is a model-strong jurisdiction, same pattern as US bereavement.

**Block added** (prompt only, name-only — no £ figures, to avoid a fabrication surface): DWP; SSP (employer-paid); ESA / Universal Credit limited-capability element; PIP (**Adult Disability Payment in Scotland**); Attendance Allowance / DLA (children) / Carer's Allowance; Employment Rights Act 1996 + Access to Work + ACAS; Equality Act 2010 (cancer/MS/HIV = disability from diagnosis; **NI has its own separate law — deliberately NOT naming the DDA 1995** to avoid colliding with AU's DDA); NHS + council-means-tested social care (HSC trust in NI); NHS Constitution; workplace/private insurance + a **"pension" (never "superannuation"/"KiwiSaver")** — directly retiring the baseline flag; Macmillan / Maggie's / Marie Curie / MS Society / Parkinson's UK / Citizens Advice / Turn2us; plus a "never name in a UK plan" ban list for the other five.

**Re-test (hardened, 48 runs): 48/48 clean.** superannuation → 0×. Anchors up: DWP 16→37, Access to Work 5→27, Turn2us 19→48, Macmillan/Maggie's/Marie Curie 14→23; PIP/UC/NHS/Turn2us all 48/48. *Watch (non-leak):* Attendance/Carer's/DLA 5×/48 — those are over-pension-age / children / carer benefits, correctly rare in the four working-age patient-focused scenarios. **Lesson: a model-strong English jurisdiction baselines near-perfect — the block is then preventive/parity (locks anchors, guards regression), not an active fix.** Committed `6520b3b`.

### 2. Diagnosis — Ireland hardening (DONE) — Worker `16006a4b`

**Harness `tests/diag_diagnosis_ie.mjs`.** **Ireland carried the heaviest harness-collision load of any country** — the guards matter:
- **"DSP" = Ireland's Department of Social Protection** (an IE anchor) → flag AU's "Disability Support Pension" by **full phrase only**, never the bare initialism.
- **"HSE" = Ireland's Health Service Executive** (an IE anchor) — the *reverse* of the UK pass.
- **"Disability Allowance" and "Illness Benefit" are real IE schemes** → IE anchors, not leaks.
- **Ireland has its OWN Statutory Sick Pay** (Sick Leave Act 2022, from 2023) → SSP is an IE anchor, never a UK leak.
- **"Citizens Information"** is Ireland's service (≠ UK "Citizens Advice" / NZ "Citizens Advice Bureau").
- **"Irish Cancer Society" contains "Cancer Society"** → negative-lookbehind `/(?<!irish )cancer society/i` keeps NZ's "Cancer Society" a flag while the IE anchor passes.
- Flag the UK's **"Equality Act 2010" by year** (Ireland's "Employment Equality Acts" contain "Equality Act").
- Made the NZ **"Work and Income" check case-sensitive** ("Work and Income" the agency vs generic lowercase "work and income") after a smoke-run false positive.

**Baseline (worker `7fd2f854`, 48 runs): 46/48 — two REAL tail leaks:** (a) the model fabricated **"Cancer Society of Ireland"** (its wrong name for the Irish Cancer Society); (b) NZ's **"Health and Disability Commissioner's equivalent in Ireland"** — the classic name-a-foreign-body-then-relabel pattern. (Anchors were already strong: Illness Benefit/Disability Allowance/PRSI 48, DSP 47, Citizens Information 47, HSE 44.)

**Block added** ("Ireland (Irish) plans — use only these", after the UK block): DSP/Intreo; Illness Benefit / Invalidity Pension / Disability Allowance / Partial Capacity Benefit / Carer's payments / Supplementary Welfare Allowance; Medical Card + GP Visit Card + Long-Term Illness + Drugs Payment schemes; Ireland's own SSP (**name-only, no day-count** — the entitlement has changed year to year) + Unfair Dismissals Acts + WRC; Employment Equality / Equal Status Acts + IHREC; HSE; **patient rights = HSE "You and Your Health Service" + "Your Service Your Say" + the Office of the Ombudsman, with an explicit "Ireland has no Health and Disability Commissioner"** (kills leak b); **"Irish Cancer Society (use that exact name — never 'Cancer Society of Ireland' or a bare 'Cancer Society')"** (kills leak a) + MS Ireland / Citizens Information / MABS / FLAC; ban list naming the other five (incl. DWP/MSD/NHS/Equality Act 2010/Cancer Society of NZ) + a "never name a foreign body then tell them to find Ireland's version" rule.

**Re-test (hardened, 48 runs): 48/48 clean.** Both leaks → 0×. Anchors jumped: Invalidity Pension 28→44, Partial Capacity Benefit 4→31, Intreo 22→47, Medical Card 18→40, MABS 30→48, SSP 11→24; Illness Benefit / Disability Allowance / HSE / Citizens Information / PRSI all 47–48/48. *Watch (non-leak):* Carer's Allowance 2×/48 — the scenarios are patient-focused, not carer-focused.

---

## Next session — START HERE

1. **Diagnosis — Canada, then the United States** (the last two of six). Same method: clone `tests/diag_diagnosis_ie.mjs`, swap home country + FAIL/PRESENCE checks, baseline 48 via bypass, add a "use only these" block after the IE one, deploy, re-test 48. **CA needs Ontario-vs-rest-of-Canada care** (bereavement-CA hit this — provincial bodies differ; CPP/EI/Service Canada are federal anchors; watch "Disability Tax Credit", provincial disability supports like ODSP). **US is likely the cleanest baseline** (strongest jurisdiction — expect a UK-style preventive pass; anchors: SSDI/SSI, ADA, FMLA, Medicaid/Medicare, COBRA, state vocational rehab). Map each country's OWN false-positive collisions before trusting the harness (the recurring trap — see this session's IE notes).
2. **Then: audit the Not Redundant prompts for cross-country entity bleed** — same systematic harness approach as the Cut Adrift diagnosis hardening. (Do this once all six Cut Adrift diagnosis countries are complete.)
3. **Job-loss gallery card** — still a separate Not Redundant repo session, then slot into the card-4 stub.
4. **Incapacity family-message hallucinated-name check** ("Gavin") — fold into incapacity's next QA pass.

---

## Outstanding tasks

### ⚡ Priority
1. **Diagnosis — CA + US hardening** (NZ/AU/UK/IE done). See "Next session".
2. **Audit Not Redundant prompts for cross-country entity bleed** — same systematic harness approach as Cut Adrift diagnosis hardening. Do this once all six Cut Adrift diagnosis countries are complete.
3. **Job-loss gallery card** — needs its own Not Redundant repo session, then the card-4 stub here.
4. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign).
5. *(Carried: DIWM Phase 3 cover-letter; GSC request-indexing for 8 pages.)*

### Consider / Ongoing
6. **Diagnosis non-leak residuals (correct, left as-is):** IE Carer's Allowance 2×/48 and UK Attendance/Carer's/DLA 5×/48 (carer/elderly benefits, rare in patient-focused scenarios); AU DDA anchor 0× (model uses Fair Work Act general protections); NZ Title-Case "Statutory Sick Pay" self-employed negation (~1–2/20).
7. **Incapacity family-message invents unsupplied names** ("Gavin") — no-invented-names guard on next incapacity pass.
8. Gallery renders **3 cards + bottom-right gap** until the job-loss card lands.
9. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known.
10. **Watch: "The Dinner Party" residual in US bereavement** — US-gated in-stream rewrite if it persists.
11. Mobile click-through still owed on the redesigned homepage. 12. Pin "Notifying their employer" heading in the bereavement prompt. 13. Tighten `verify_crisis.mjs` Path A assertion. 14. `wrangler.toml` missing `pages_build_output_dir` (non-fatal). 15. Confirm sage favicon at tab size. 16. **Outreach follow-up (5 bereavement orgs) was due week of 23 June 2026 — now imminent/overdue.** 17. OG image placeholder. 18. Feedback form → Google Sheet. 19. Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages.

---

## Country-hardening status (all three tools)
- **Incapacity:** all 5 non-NZ countries done (NZ original).
- **Bereavement:** all 6 done (US confirmed clean, H31).
- **Diagnosis:** NZ ✅, AU ✅, UK ✅, IE ✅ — **CA + US remain.**

Method, per-country verified-contact details, and the false-positive catalogue live in the `incapacity-country-hardening` memory.

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
| 19 | DIWM Phase 2 (bereavement leave email + bank letter); bereavement employment question; mandatory "Your work and leave" section; max_tokens → 3000; 6-scenario E2E suite (later lost) |
| 20 | Deceased's employer letter (bereavement) + weeks_ago routing fix + "Notifying their employer" section + DIWM panels (bereavement + diagnosis tell-family; diagnosis insurance call script) |
| 21 | Closed 3 H20 priorities (sitemap/link, DIWM spot-checks, test harness rebuilt into `tests/`); fixed 4 guide pages missing disclaimers; refreshed homepage copy; began direct Claude Code file editing |
| 22 | Refined homepage hero subhead + footer trust line; verified across breakpoints |
| 23 | DIWM Phase 3: incapacity family-coordination message + GP/appointment question-prep panels; mandated incapacity headings as panel anchors; fixed DIWM payload forwarding; discovered incapacity tool IS the carer tool (deleted dead scaffolding) |
| 24 | Homepage hero/title/meta refresh; distress-adaptive bereavement intake (short-circuit + opt-in continue); fixed continue-to-full routing; cleaned up superseded handovers 17–19 |
| 25 | Full homepage visual redesign (clay/sage palette, one clean stylesheet replacing three `!important` layers); site-wide trust-copy fix across 26 pages; **incapacity tool per-country hardening (AU/CA/UK/IE/US); bereavement-CA hardened + global no-URL/cross-country guardrails for all six** |
| 26 | Bereavement **Australia** hardened. Worker `05a653a4`. |
| 27 | Bereavement **United Kingdom** hardened. Worker `bd4e5ea5`. |
| 28 | Bereavement **Ireland** hardened. Worker `ebf1d4cd`. |
| 29 | Per-IP audit + **global daily counter + Resend alert**. Worker `8c7bbe00`. |
| 30 | Bereavement **United States** hardened — bereavement sweep complete. Worker `960fb7e0`. |
| 31 | **Test-bypass header** added; homepage **gallery** first built; **US bereavement re-test closed**. Worker `afac0f2e`. |
| 32 | **Diagnosis NZ-hardened** (first hardening of the only never-hardened tool). Harness `tests/diag_diagnosis_nz.mjs`; **Worker `a9cafbe7`**; 19/20 clean. Declined an in-stream rewrite — every "survivor" was a harness false positive (the counter-lesson). |
| 33 | **Homepage proof gallery remapped** to one card per intake situation. Commit `9ed430e`. Flagged: incapacity family-message hallucinated "Gavin". |
| 34 | **Diagnosis AU-hardened**. Harness `tests/diag_diagnosis_au.mjs`; baseline 11/12 (NZ/IE "Disability Allowance" mislocalised); **Worker `84982b2b`**; re-test 12/12 clean. Commit `5f0da4d`. "Site broken" report → non-bug (`file://`). Removed redundant featured NZ homepage link (`0703145`). |
| 35 | **Diagnosis UK-hardened** (3rd country). Harness `tests/diag_diagnosis_uk.mjs`; baseline already 47/48 (benign superannuation→pension non-leak); preventive/parity block; **Worker `7fd2f854`**; re-test 48/48 clean. Commit `6520b3b`. |
| 36 | **Diagnosis IE-hardened** (4th country) — heaviest harness-collision load (DSP/HSE/Disability Allowance/Illness Benefit/SSP all IE anchors). Harness `tests/diag_diagnosis_ie.mjs`; baseline 46/48 (real leaks = fabricated "Cancer Society of Ireland" + NZ "HDC equivalent in Ireland"); **Worker `16006a4b`**; re-test **48/48 clean**. Pruned all superseded handover files to this one. **CA + US remain, then the Not Redundant cross-country audit.** |
