# Cut Adrift — Handover Document 35
**Updated:** 22 June 2026
**Session work:** **UK-hardened the diagnosis tool** (carried top priority from H34 — the third country after NZ and AU). Cloned the AU leak harness, measured a UK baseline via the test-bypass header, added a "United Kingdom plans — use only these" entity block to the diagnosis prompt, deployed, and re-tested. Headline finding: **the UK is a model-strong jurisdiction — the baseline was already 47/48** (the single flag was a benign generic-word usage, not a real leak), so this pass was preventive/parity: the block **locks the UK anchors and bans the other five countries** rather than fixing an active leak. Hardened re-test **48/48 clean**, anchor coverage up sharply.
**Supersedes:** Handover 34 (diagnosis-hardening thread / worker side).

---

## Project overview / Deploy commands

*(Unchanged — see Handover 24/25.) Two separate deploys, do not confuse them:*
- **Worker (the prompts + rate limiter):** `npx wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`. **Deployed this session** (version `7fd2f854`).
- **Static site:** from repo root, `npx wrangler pages deploy Public` (or from `Public/`, `npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true`) → serves `cutadrift.org`. **Re-deployed this session for parity** (preview `https://0ab453b1.cutadrift.pages.dev`); **Public/ was unchanged this session** — the deploy uploaded 0 new files (52 already uploaded). The `wrangler.toml` "missing `pages_build_output_dir`" warning is benign — Pages ignores the config and deploys the directory directly. *(Note: a prompt-only change like this one only requires the **worker** deploy; the Pages step was run purely for parity and is a no-op here.)*

**Test-bypass header (from H31):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04` — skips per-IP gate + global counter, so testing is free of the public rate limit. Hard-coded as a fallback in the diag harnesses.

---

## New this session

### 1. Diagnosis tool — United Kingdom hardening (DONE + DEPLOYED) — Worker `7fd2f854`

Same method as the NZ (H32) and AU (H34) passes. The diagnosis prompt (`SYSTEM_PROMPTS.diagnosis`) still inlines all six countries' benefit names + statutes into single sentences — that inline-all-countries phrasing is the cross-country leak surface. The global two-rule guardrail (H32) already applied to the UK, so the UK was *partly* shielded; this pass added the per-country anchor block.

**Harness (`tests/diag_diagnosis_uk.mjs`, new).** Clone of `diag_diagnosis_au.mjs` with the UK as home country: bypass header, the same 4 diagnosis scenarios, AbortController 90s timeout + ECONNRESET retry + retry-on-empty, fail-capture dir `tests/_uk_diag_fails/`. FAIL = a NON-UK country's named entity in a UK plan; PRESENCE = expected UK anchors. **UK-specific false-positive guards baked in:**
- UK has its OWN **Human Rights Act 1998** → flag only NZ's "Human Rights Act **1993**", never the generic phrase.
- UK "**HSE**" = **Health and Safety Executive** (a real UK body) ≠ Ireland's Health Service Executive → flag IE by **full name only**, never the bare initialism.
- **Equality Act 2010, NHS, Statutory Sick Pay/SSP, PIP, ESA, Universal Credit, Access to Work, Macmillan, Citizens Advice, Turn2us are UK ANCHORS, not fails.**
- "Disability Living Allowance"/DLA is UK — the `/disability allowance/i` flag won't match it ("Living" separates the words), so bare **"Disability Allowance" stays a clean NZ/IE leak**.
- "Jobseeker's Allowance"/JSA is UK — the AU `/jobseeker payment/i` and NZ `/jobseeker support/i` flags miss it.
- Flag only the AU year-specific "Disability Discrimination Act **1992**" — a bare DDA reference could legitimately be NI's still-in-force 1995 act.
- "superannuation" flagged but treated as a **WATCH** item (UK public-sector pensions occasionally use the word), read against the capture.

**Baseline (unhardened-for-UK, worker `84982b2b`, 48 runs): 47/48.** The single flag — `not_working`... actually `self_employed_ms`, run 9: *"Now check your **superannuation** — which for you means your pension."* The model used the generic word then **immediately glossed it to "pension"** for the UK reader — a benign generic-word usage, **not** an AU-scheme relabel. Per the **NZ counter-lesson** (confirm a flagged leak is REAL before acting), this is a non-leak, so the baseline was **effectively 48/48**. The UK is the model's strongest jurisdiction after the US — same pattern as US bereavement (H30/H31). Anchors were already strong but uneven: DWP 16×, Access to Work 5×, Turn2us 19×, Macmillan/Maggie's/Marie Curie 14×; PIP/NHS 48×.

**The hardening (prompt only).** Added a **"United Kingdom plans — use only these"** block right after the AU block (England & Wales primary, Scotland/NI caveated, **name-only — no £ figures, to avoid a fabrication surface**): DWP; Statutory Sick Pay (employer-paid); ESA or the limited-capability-for-work element of Universal Credit; PIP (**Adult Disability Payment in Scotland**); Attendance Allowance (over State Pension age), DLA (children), Carer's Allowance; Employment Rights Act 1996 + Access to Work + ACAS; **Equality Act 2010** (cancer/MS/HIV count as a disability from diagnosis; **NI has its own separate disability discrimination law — deliberately NOT naming the DDA 1995** to avoid colliding with the AU DDA); NHS + council means-tested adult social care (HSC trust in NI); NHS Constitution; workplace/private insurance (critical illness / income protection / death-in-service) + a **"pension"** (explicitly *"never 'superannuation' or 'KiwiSaver'"* — directly retires the baseline flag); Macmillan / Maggie's / Marie Curie / MS Society / Parkinson's UK / Citizens Advice / Turn2us. Plus a **"Never name in a United Kingdom plan"** ban list for the other five countries (incl. `superannuation` under Australia and the *"never relabel another country's scheme as 'the UK equivalent'"* rule). The IE ban names "the Health Service Executive" by **full name** (no "/ HSE") so it can't suppress the UK's own Health and Safety Executive.

**Re-test (hardened, worker `7fd2f854`, 48 runs): 48/48 clean.** superannuation flag → **0×**. Anchors jumped: DWP 16→37, Access to Work 5→27, Turn2us 19→48, Macmillan/Maggie's/Marie Curie 14→23, Equality Act 44→43 (noise), with **PIP / Universal Credit / NHS / Turn2us all 48/48**.

**Watch item (NOT a leak):** Attendance/Carer's/DLA anchor reads **5×/48** — correct and expected: Attendance Allowance is over-State-Pension-age, DLA is children-only, and Carer's Allowance is for a *carer*, none of which fit the four self-focused working-age scenarios. Not a gap.

**Lesson reconfirmed:** a model-strong English-speaking jurisdiction (US, UK) can baseline near-perfect — the per-country block is then **preventive/parity** (locks anchors, guards against future regression, retires benign generic-word usages) rather than fixing an active leak. Worth doing for consistency across all six countries and to harden the surface, but don't expect a dramatic clean-up delta the way NZ/AU showed.

---

## Next session — START HERE

1. **Diagnosis tool — IE / CA / US hardening.** NZ (H32) + AU (H34) + UK (this session) done; three countries remain, same inline-all-countries latent risk each. Same method: clone `tests/diag_diagnosis_uk.mjs` (or AU/NZ), swap home country + FAIL/PRESENCE checks, baseline via bypass header at 10–14+ runs, add a per-country "use only these" block after the UK one, deploy, re-test. Map each country's OWN false-positive collisions (the recurring trap): e.g. AU's *Social Security Act 1991*, QLD's *Human Rights Act 2019*, the UK's *Human Rights Act 1998* + *HSE = Health and Safety Executive*. **US is likely the cleanest baseline** (strongest jurisdiction — expect a UK-style preventive pass); **IE is worth the most scrutiny** (smaller jurisdiction, more cross-bleed risk — note IE's own "Illness Benefit" / "Citizens Information" / "Disability Allowance" overlaps with NZ).
2. **Job-loss gallery card** — still a separate Not Redundant repo session, then slot into the card-4 stub (H33).
3. **Incapacity family-message hallucinated-name check** ("Gavin", H33) — fold into incapacity's next QA pass.

---

## Outstanding tasks

### ⚡ Priority
1. **Diagnosis tool — IE/CA/US hardening** (NZ + AU + UK done). See "Next session".
2. **Job-loss gallery card** — needs its own Not Redundant repo session, then card-4 stub here.
3. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign). Carried.
4. *(Carried: DIWM Phase 3 cover-letter; GSC request-indexing for 8 pages.)*

### Consider / Ongoing
5. **Diagnosis UK residual (non-leak):** Attendance/Carer's/DLA anchor 5×/48 — situational benefits that don't fit working-age self-focused scenarios; correct, left as-is (this session).
6. **Diagnosis AU residual (non-leak):** DDA anchor 0× — model uses Fair Work Act general protections for discrimination; correct, left as-is (H34).
7. **Incapacity family-message invents unsupplied names** ("Gavin", H33) — no-invented-names guard on next incapacity pass.
8. Gallery renders **3 cards + bottom-right gap** until the job-loss card lands (H33).
9. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known (H29).
10. **Watch: "The Dinner Party" residual in US bereavement** (H31) — US-gated in-stream rewrite if it persists.
11. Diagnosis NZ residual: Title-Case "Statutory Sick Pay" in self-employed negation (~1–2/20) — non-leak, left as-is (H32).
12. Mobile click-through still owed on the redesigned homepage (H33). 13. Pin "Notifying their employer" heading in the bereavement prompt. 14. Tighten `verify_crisis.mjs` Path A assertion. 15. `wrangler.toml` missing `pages_build_output_dir` (non-fatal). 16. Confirm sage favicon at tab size. 17. **Outreach follow-up (5 bereavement orgs) was due week of 23 June 2026 — now imminent/overdue.** 18. OG image placeholder. 19. Feedback form → Google Sheet. 20–23. *(Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages — see H25.)*

---

## Session history summary
*(See Handover 25 for sessions 1–25.)*

| Session | Key work |
|---------|----------|
| 26 | Bereavement **Australia** hardened. Worker `05a653a4`. |
| 27 | Bereavement **United Kingdom** hardened. Worker `bd4e5ea5`. |
| 28 | Bereavement **Ireland** hardened. Worker `ebf1d4cd`. |
| 29 | Per-IP audit + **global daily counter + Resend alert**. Worker `8c7bbe00`. |
| 30 | Bereavement **United States** hardened — bereavement sweep complete. Worker `960fb7e0`. |
| 31 | **Test-bypass header** added; homepage **gallery** first built; **US bereavement re-test closed**. Worker `afac0f2e`. |
| 32 | **Diagnosis tool NZ-hardened** (first hardening of the only never-hardened tool). Harness `tests/diag_diagnosis_nz.mjs`; **Worker `a9cafbe7`**; 19/20 clean. Declined the in-stream rewrite — every "survivor" was a harness false positive. |
| 33 | **Homepage proof gallery remapped** to one card per intake situation. Commit `9ed430e`, Pages-deployed. No worker change. Flagged: incapacity family-message hallucinated "Gavin". |
| 34 | **Diagnosis tool AU-hardened** (2nd country). Harness `tests/diag_diagnosis_au.mjs`; baseline 11/12 (real leak = NZ/IE "Disability Allowance" mislocalised); **Worker `84982b2b`**; re-test **12/12 clean**. Commit `5f0da4d`. "Site broken" report → **non-bug** (`file://`). Removed redundant featured NZ link; commit `0703145`. |
| 35 | **Diagnosis tool UK-hardened** (3rd country). Harness `tests/diag_diagnosis_uk.mjs`; **the UK is model-strong — baseline already 47/48** (the one flag a benign "superannuation→pension" non-leak); added "United Kingdom plans — use only these" block (preventive/parity); **Worker `7fd2f854`**; re-test **48/48 clean**, anchors up (DWP 16→37, Access to Work 5→27, Turn2us 19→48). |
