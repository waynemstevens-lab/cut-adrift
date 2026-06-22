# Cut Adrift — Handover Document 37
**Updated:** 22 June 2026
**Session work:** **Hardened the diagnosis tool for Canada** (carrying the per-country anti-hallucination sweep forward from NZ (H32), AU (H34), UK (H35), IE (H36)). **Five of six diagnosis countries are now done: NZ, AU, UK, IE, CA**; only the **United States** remains. Same method: clone the leak harness, baseline via the test-bypass header, read every flagged capture against the actual text, add a per-country "use only these" entity block to the diagnosis prompt, deploy, re-test. Canada baselined as a model-strong jurisdiction (like UK/US) — effectively **46/47** at baseline (only a single real PRSI tail leak; the other 9 flags were insurance-context false positives), and effectively **47/47** after the block (the two residual flags are a streaming self-correction and a correct generic-phrase usage, neither a wrong-country recommendation). The block also lifted the weak anchors massively.
**Supersedes:** H36 (kept on disk this session; not pruned). The cumulative session-history table is preserved below.

---

## Project overview / Deploy commands

**Cut Adrift** — a free tool that helps people in the first days after a hard life event (a death, a serious diagnosis, losing capacity to manage affairs). Three tools (`bereavement`, `diagnosis`, `incapacity`/carer), each serving six countries (NZ, AU, UK, IE, CA, US). A Cloudflare Worker holds the system prompts + calls Claude and streams SSE; a static site (`Public/`) is the front end.

**Two separate deploys — do not confuse them:**
- **Worker (the prompts + rate limiter):** `npx wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`. **A prompt change requires THIS deploy.**
- **Static site:** `npx wrangler pages deploy Public` (from repo root) → serves `cutadrift.org`. The `wrangler.toml` "missing `pages_build_output_dir`" warning is benign. A pages-only deploy silently leaves the prompt stale; a worker-only deploy is correct for a prompt-only change (Pages shows "0 files… already uploaded" when `Public/` is untouched).
- Per-tool model + token maps live in `worker.js` (`MODELS` / `MAX_TOKENS`). **Diagnosis runs on `claude-sonnet-4-6`, 4000 max_tokens, ~8–16k-char outputs** (smarter + longer than the Haiku-driven bereavement/incapacity tools).

**Test-bypass header (from H31):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04` — skips the per-IP gate + global counter, so testing is free of the public rate limit. Hard-coded as a fallback in the diag harnesses.

**This session's worker version:** CA block → `ec148b17` (current).

---

## The diagnosis country-hardening method (reference — used five times now)

The diagnosis prompt (`SYSTEM_PROMPTS.diagnosis` in `worker.js`) is structurally different from bereavement/incapacity: it has **no per-country sections** — it inlines all six countries' benefit names + statutes into single sentences. That inline-all-countries phrasing IS the cross-country leak surface. A global two-rule guardrail (H32, after the `country` field) says "name only the user's own country's entities" + "no invented/mislocalized names or URLs"; each hardened country then gets a dedicated **"[Country] plans — use only these"** anchor-and-ban block.

**Per country:** clone `tests/diag_diagnosis_<prev>.mjs` → swap the home country + FAIL/PRESENCE checks → **baseline via the bypass header** → read every flagged capture against the actual text (the NZ counter-lesson: confirm a "leak" is REAL before acting — many are harness false positives) → add the "use only these" block after the previous country's → `wrangler deploy` → **re-test**. Each country has its OWN false-positive collisions to map — this is the recurring trap (see per-country notes in H36 and below).

---

## New this session

### Diagnosis — Canada hardening (DONE) — Worker `ec148b17`

**Harness `tests/diag_diagnosis_ca.mjs`** (clone of the IE one). **CA-specific false-positive guards (the home anchors that were the *CA-leak* checks in every prior harness flip to anchors here):**
- **EI / Employment Insurance / CPP / Canada Pension Plan / Service Canada / Canadian Human Rights Act** are now CA **anchors** — never flagged.
- **"ESA" is NOT flagged** — in Canada it's the (Ontario) **Employment Standards Act** (a CA anchor); the UK's Employment and Support Allowance is flagged by its **full phrase only** (same pattern as IE's DSP / AU's Disability Support Pension).
- **"Medicare" is genuine Canadian usage** (the colloquial name for the public system) as well as a US/AU term → kept as a **soft flag**; read context on any survivor. The CA block steers the model to the provincial plan name (OHIP etc.) + the Canada Health Act, so it stayed at 0× in both runs.
- **"Canadian Cancer Society" contains "Cancer Society"** → negative-lookbehind `/(?<!canadian )cancer society/i` keeps NZ's "Cancer Society" a flag while the CA anchor passes.
- **"Employment Equity Act"** is a real federal Canadian statute and ≠ Ireland's "Employment Equality Acts" — `/employment equality act/i` won't match "Equity", so no collision.
- Flag NZ's **"Human Rights Act 1993" by year** (Canada has the Canadian Human Rights Act + provincial Human Rights Codes; UK has its own 1998 act).
- **"Disability Allowance" stays a leak** for CA (it's NZ/IE) — Canada's provincial disability income is ODSP / AISH / PWD. ("ODSP" does not match `/\bDSP\b/`, so AU is flagged by the full "Disability Support Pension" phrase.)
- **The "Illness Benefit" check was tightened to case-sensitive proper-noun + insurance-adjective exclusion** `/(?<!serious |critical |terminal |accelerated |chronic )Illness Benefit/` — the baseline's 9 "Illness Benefit" flags were ALL the insurance rider "serious/critical/terminal illness benefit" (generic, lowercase), not Ireland's scheme. This is the NZ counter-lesson again; the fix took those 9 false positives to 0×.

**Baseline (un-hardened CA, 47 real-content runs): 37/47 raw → effectively 46/47.** The 9 "Illness Benefit" flags were all insurance-context false positives (fixed in the harness as above). The **one real leak was "PRSI"** ("your PRSI contribution history" — Ireland's social-insurance system; in Canada that's CPP/EI contributions). Canada is a strong jurisdiction — **no US-bleed** (no ADA/FMLA/SSDI/Medicaid surfaced at all), same pattern as UK/US. Weak anchors at baseline: **Canada Disability Benefit 0×, Canada Health Act 0×, Employment Standards Act/ESA 0×**, provincial disability 23×, provincial health plan 19×.

**Block added** ("Canadian (Canada) plans — use only these", after the IE block): Service Canada / ESDC; **EI sickness benefits** (medical cert; self-employed only via the EI special-benefits program); **CPP-D** (QPP/Retraite Québec in Quebec); the **Canada Disability Benefit**; provincial/territorial disability income **ODSP / AISH / PWD** ("name the type, check your own province"); provincial/territorial health plan (OHIP/RAMQ/MSP) under the **Canada Health Act** — "call it 'your provincial health plan', not 'Medicare'"; job-protected leave under the provincial **Employment Standards Act** (Canada Labour Code for federally regulated) + **duty to accommodate to undue hardship**; provincial **Human Rights Code** / Tribunal (Canadian Human Rights Act federally); patient rights = provincial Patient Ombudsman ("Canada has no single national patient-rights body"); employer group benefits / **LTD** / critical-illness / private income-protection / RRSP; **Canadian Cancer Society** ("use that exact name — never a bare 'Cancer Society' or 'Cancer Society of Canada'") / MS Canada / Parkinson Canada / **211**; ban list naming the other five (incl. **PRSI** explicitly, plus "never call the public health system 'Medicare' in the US sense") + a "never name a foreign body then tell them to find Canada's version" rule.

**Re-test (hardened, 47 real-content runs): 45/47 raw → effectively 47/47 clean.** Both residual flags are **non-leaks**: (a) **PRSI** — the model self-corrected mid-stream *"records of your PRSI — wait, strike that. In Canada, gather records of your CPP contributions…"* (cosmetically awkward but lands on the correct CA entity); (b) **"statutory sick pay"** — *"as a self-employed person… no statutory sick pay to claim"*, a correct generic-phrase statement, not the UK scheme (NZ-counter-lesson class). The 9 Illness-Benefit false positives → 0×. **Anchors jumped:** Canada Disability Benefit 0→30, provincial disability 23→46, provincial health plan 19→41, Canada Health Act 0→10, duty to accommodate 32→38, Canadian Cancer Society 12→23, MS/Parkinson Canada 24→30, 211 28→47; CPP-D/Service Canada/EI all 46–47/47.

***Watch (non-leak):*** **Employment Standards Act / ESA anchor still 0×** in both runs — the model covers job-protected leave conceptually ("employment standards legislation") without naming the Act or the abbreviation. Substantively fine; same class as AU's DDA-0× watch item. The mid-stream "wait, strike that" PRSI self-correction is cosmetically imperfect output but not a wrong-country recommendation; left as-is.

---

## Next session — START HERE

1. **Diagnosis — the United States** (the last of six). Same method: clone `tests/diag_diagnosis_ca.mjs`, swap home country + FAIL/PRESENCE checks, baseline via bypass, add a "use only these" block after the CA one, deploy, re-test. **US is expected to be the cleanest baseline** (strongest jurisdiction — expect a UK/CA-style preventive/parity pass). **US anchors:** SSDI/SSI, the ADA, FMLA, COBRA, Medicaid + Medicare (both genuine US — so the CA harness's Medicare soft-flag and the US-leak checks for ADA/FMLA/SSDI/Medicaid all flip to **anchors**), state vocational rehabilitation, the Family and Medical Leave Act, employer short-/long-term disability. **US-specific collisions to map:** "Medicare"/"Medicaid"/"Social Security disability" are US anchors (not leaks); the ADA/FMLA/COBRA initialisms flip to anchors; watch for the model relabelling another country's scheme or inventing a national patient-rights body. Map each country's OWN false-positive collisions before trusting the harness (the recurring trap).
2. **Then: audit the Not Redundant prompts for cross-country entity bleed** — same systematic harness approach as the Cut Adrift diagnosis hardening. (Do this once all six Cut Adrift diagnosis countries are complete.) **Use 20–24 run passes rather than 48 — the false-positive catalogue is now well-mapped and the full method is locked. 48-run confidence was needed while the approach was being established; lighter passes are sufficient for a simpler prompt structure.**
3. **Job-loss gallery card** — still a separate Not Redundant repo session, then slot into the card-4 stub.
4. **Incapacity family-message hallucinated-name check** ("Gavin") — fold into incapacity's next QA pass.

---

## Outstanding tasks

### ⚡ Priority
1. **Diagnosis — US hardening** (NZ/AU/UK/IE/CA done). See "Next session".
2. **Audit Not Redundant prompts for cross-country entity bleed** — same systematic harness approach. Do this once all six Cut Adrift diagnosis countries are complete. **Use 20–24 run passes (method now locked; 48 no longer needed).**
3. **Job-loss gallery card** — needs its own Not Redundant repo session, then the card-4 stub here.
4. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign).
5. *(Carried: DIWM Phase 3 cover-letter; GSC request-indexing for 8 pages.)*

### Consider / Ongoing
6. **Diagnosis non-leak residuals (correct, left as-is):** CA Employment Standards Act/ESA anchor 0× (model uses "employment standards legislation" generically) + the cosmetic "wait, strike that" PRSI self-correction; IE Carer's Allowance 2×/48 and UK Attendance/Carer's/DLA 5×/48 (carer/elderly benefits, rare in patient-focused scenarios); AU DDA anchor 0× (model uses Fair Work Act general protections); NZ Title-Case "Statutory Sick Pay" self-employed negation (~1–2/20).
7. **Incapacity family-message invents unsupplied names** ("Gavin") — no-invented-names guard on next incapacity pass.
8. Gallery renders **3 cards + bottom-right gap** until the job-loss card lands.
9. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known.
10. **Watch: "The Dinner Party" residual in US bereavement** — US-gated in-stream rewrite if it persists.
11. Mobile click-through still owed on the redesigned homepage. 12. Pin "Notifying their employer" heading in the bereavement prompt. 13. Tighten `verify_crisis.mjs` Path A assertion. 14. `wrangler.toml` missing `pages_build_output_dir` (non-fatal). 15. Confirm sage favicon at tab size. 16. **Outreach follow-up (5 bereavement orgs) was due week of 23 June 2026 — now imminent/overdue.** 17. OG image placeholder. 18. Feedback form → Google Sheet. 19. Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages.

---

## Country-hardening status (all three tools)
- **Incapacity:** all 5 non-NZ countries done (NZ original).
- **Bereavement:** all 6 done (US confirmed clean, H31).
- **Diagnosis:** NZ ✅, AU ✅, UK ✅, IE ✅, **CA ✅** — **only US remains.**

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
| 36 | **Diagnosis IE-hardened** (4th country) — heaviest harness-collision load (DSP/HSE/Disability Allowance/Illness Benefit/SSP all IE anchors). Harness `tests/diag_diagnosis_ie.mjs`; baseline 46/48 (real leaks = fabricated "Cancer Society of Ireland" + NZ "HDC equivalent in Ireland"); **Worker `16006a4b`**; re-test **48/48 clean**. Pruned all superseded handover files to that one. |
| 37 | **Diagnosis CA-hardened** (5th country) — model-strong jurisdiction, no US-bleed. Harness `tests/diag_diagnosis_ca.mjs`; baseline effectively 46/47 (1 real PRSI leak; 9 "Illness Benefit" flags were insurance-rider false positives → harness tightened to case-sensitive proper-noun + adjective exclusion); preventive/parity block (CPP-D/EI/Service Canada/Canadian Human Rights Act flip to anchors; ESA = Ontario Employment Standards Act not UK ESA; "Medicare" steered to provincial plans); **Worker `ec148b17`**; re-test effectively 47/47 clean (2 residual flags = a mid-stream PRSI self-correction + a correct generic "statutory sick pay" negation). Anchors lifted hugely (Canada Disability Benefit 0→30, provincial disability 23→46, Canada Health Act 0→10). **Only US remains, then the Not Redundant cross-country audit (lighter 20–24 run passes).** |
