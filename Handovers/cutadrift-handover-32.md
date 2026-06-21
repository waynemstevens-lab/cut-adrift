# Cut Adrift — Handover Document 32
**Updated:** 21 June 2026
**Session work:** **NZ-hardened the diagnosis tool** — the only tool that had never been country-hardened (no country blocks, no cross-country guardrails). Built a leak-detection harness, measured a baseline via the test-bypass header, added a global no-cross-country guardrail + an NZ-locked entity block to the diagnosis system prompt, deployed, and re-tested. Result: the one unambiguous real leak (UK **Equality Act 2010**, 2×/20 at baseline) went to **0×**, and NZ anchor coverage climbed sharply. **Crucially: declined to add an in-stream rewrite** — investigation showed every apparent "survivor" was a *harness false positive*, not a real leak, and a rewrite would have corrupted correct NZ text. **Decided (with user): prompt-only, no rewrite.**
**Supersedes:** Handover 31

---

## Project overview / Deploy commands

*(Unchanged — see Handover 24/25.) Two separate deploys, do not confuse them:*
- **Worker (the prompts + rate limiter):** `wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`.
- **Static site:** `wrangler pages deploy Public` → serves `cutadrift.org`.

**Test-bypass header (from H31, used throughout this session):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04` — skips per-IP gate + global counter, so testing is free of the public rate limit. Secret `INTERNAL_TEST_KEY` on `cutadrift-engine`.

---

## New this session — diagnosis tool NZ-hardening (DONE + DEPLOYED)

**Why it was different from the bereavement sweep.** The diagnosis prompt (`worker.js`, `SYSTEM_PROMPTS.diagnosis`) had **no per-country sections at all** — unlike bereavement/incapacity, it **inlined all six countries' benefit names and statutes into single sentences** (e.g. "...the Human Rights Act in NZ, the Fair Work Act + Disability Discrimination Act in AU, the Equality Act 2010 in UK, ... the ADA + FMLA in the US"). That inline-all-countries phrasing is the cross-country leak surface: it primes the model to drop another country's scheme into an NZ plan.

**The harness (`tests/diag_diagnosis_nz.mjs`, new).** Mirrors `retest_bereavement_us.mjs`: bypass header, 4 NZ diagnosis scenarios (employed+cancer, self-employed+MS, not-working+chronic, employed+neuro), 5 runs each = 20. FAIL checks = a non-NZ country's named entity appearing in an NZ plan (ADA/FMLA/SSDI, Equality Act/NHS/SSP/ESA/PIP, Illness Benefit, Centrelink/DSP/Fair Work Act, CPP/EI, etc.). PRESENCE checks = expected NZ anchors (ACC, Work and Income/MSD, Te Whatu Ora, NASC, Supported Living Payment, Human Rights Act, KiwiSaver, Holidays Act, HDC Code, Cancer Society). Resilience added after two false starts: **AbortController request timeout (90s)** — a Sonnet stream hung indefinitely once with no reset — plus **catch+retry on ECONNRESET/terminated**, and a fail-text capture dir (`tests/_nz_diag_fails/`, gitignored).

**Baseline (unhardened, live worker, 20 runs):** 5/20 flagged. After verifying context, the **only unambiguous real leak was UK Equality Act 2010 (2×)**; the Illness Benefit / SSP hits were already mostly generic-phrase false positives. NZ anchors weak in spots: NASC 1/20, Te Whatu Ora 6/20, MSD 6/20.

**The hardening (prompt only).** Added to `SYSTEM_PROMPTS.diagnosis`, right after the `**country**` field:
1. A **two-rule global guardrail** ("Name only the user's own country's entities" + "No invented or mislocalized names or URLs"), overriding every country example later in the prompt.
2. A **"New Zealand plans — use only these" block** naming the correct NZ entities (Work and Income/MSD, Supported Living Payment, Jobseeker Support, Disability Allowance [a real NZ Work-and-Income benefit], ACC, Te Whatu Ora, NASC, Holidays Act 2003, Employment Relations Act 2000, Human Rights Act 1993, the HDC Code, KiwiSaver, Cancer Society NZ, Citizens Advice Bureau) and an explicit **"Never name in a New Zealand plan"** ban list (ADA/FMLA/SSDI/COBRA/Medicaid; Equality Act/NHS/SSP/ESA/PIP/Universal Credit/Macmillan/UK "Citizens Advice"; Illness Benefit/Citizens Information; Centrelink/Services Australia/DSP/Fair Work Act/DDA/Cancer Council; CPP/EI/Service Canada) + "NZ has no NHS, no Medicare, no Social Security".
3. Light "name ONLY the user's country" reminders appended to the three remaining inline multi-country lists (employment statutes, benefits, patient-rights instruments).

Deployed: **Worker `a9cafbe7`** (current live).

**Re-test (hardened, 20 runs, corrected harness): 19/20 clean.** Equality Act 2010 → **0×**. Anchor coverage jumped: Te Whatu Ora 6→19, NASC 1→8, MSD 6→16, Supported Living Payment 18→19, Human Rights Act 16→19. The single residual flag is a **non-leak**: in the self-employed scenario the plan says *"As a self-employed person, you do not receive Statutory Sick Pay"* — Title-Cased UK term, but in a **negative, factually-correct** sentence (NZ self-employed genuinely get no statutory sick pay).

## ⭐ The key lesson this session — verify a "leak" is real before reaching for the worker rewrite

The H31 lesson ("for a sticky terminology leak, use a country-gated in-stream rewrite, not more prompt wording") is right — **but only once the leak is confirmed real.** This session every apparent survivor in the hardened run was a **harness false positive**, confirmed by reading the actual generated text:
- "Illness Benefit" (4×) = "a serious illness advance or **terminal illness benefit**" / "**critical illness benefit**" — generic *insurance* terms, lowercase.
- "Access to Work" (2×) = "your access to **Work and Income** support" (the NZ agency) / "discrimination ... and **access to work**" under the HRA 1993 (generic concept).
- "JobSeeker Payment" (1×) = "the standard **Jobseeker payment**" = NZ's own Jobseeker Support.
- "Statutory Sick Pay" (generic) = "**There is no statutory sick pay** for self-employed people in NZ" — correct NZ guidance.

**A rewrite here would have corrupted correct output** — `Access to Work`→`Workbridge` turns "access to **Work and Income**" into "access to **Workbridge** and Income"; `Illness Benefit`→`Jobseeker Support` mangles "terminal illness benefit". The solicitor rewrite was safe only because `solicitor→attorney` is a *context-free* valid swap in a US plan; the NZ diagnosis "survivors" have no such clean swap because the trigger strings also occur in correct NZ text. **Counter-rule: an in-stream rewrite is only safe for a term whose every occurrence in-country is wrong. If the term also appears in legitimate same-country usage, harden the prompt and leave it.**

Harness checks were tightened to kill these false positives (case-sensitive `Statutory Sick Pay`/`Illness Benefit`/`Access to Work`, exclude "...and Income" and insurance phrasings, drop the NZ-colliding "jobseeker payment" check) — see the comments in `tests/diag_diagnosis_nz.mjs`.

## Next session — START HERE

1. **Diagnosis tool — other 5 countries.** NZ is done; AU/UK/IE/CA/US diagnosis are still unhardened (the inline-all-countries phrasing is the same latent risk for each). Same method: harness (clone `diag_diagnosis_nz.mjs`, swap country + FAIL/PRESENCE checks), baseline via bypass header, add a per-country "use only these" block mirroring the NZ one, deploy, re-test. Watch the same false-positive classes (generic insurance "illness benefit", "access to Work and Income", lowercase "statutory sick pay", a country's own benefit colloquialised).
2. Optional, low-value: the SSP Title-Case-negation edge (1–2/20, self-employed scenario). Only a cosmetic de-capitalisation rewrite would address it, and the sentence is already factually correct — not worth a worker rewrite. Left as-is.

---

## Outstanding tasks

### ⚡ Priority
1. **Diagnosis tool — AU/UK/IE/CA/US hardening** (NZ done this session). See "Next session" above.
2. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign). Carried.
3–6. *(Carried from H31: DIWM Phase 3 cover-letter; GSC request-indexing for 8 pages; apply homepage design system site-wide.)*

### Consider / Ongoing
7. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known (H29).
8. **Watch: "The Dinner Party" residual in US bereavement** (H31) — ~7% flicker in a 20-run sample, 0 in the final clean sample; US-gated in-stream rewrite if it persists.
9. Diagnosis NZ residual: Title-Case "Statutory Sick Pay" in self-employed negation (~1–2/20) — non-leak, factually correct, left as-is.
10. Pin "Notifying their employer" heading in the bereavement prompt. 11. Tighten `verify_crisis.mjs` Path A assertion. 12. `wrangler.toml` missing `pages_build_output_dir` (non-fatal). 13. Confirm sage favicon at tab size. 14. **Outreach follow-up (5 bereavement orgs) was due week of 23 June 2026 — imminent.** 15. OG image placeholder. 16. Feedback form → Google Sheet. 17–20. *(Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages — see H25.)*

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
| 31 | **Test-bypass header** added; captured DIWM outputs; homepage **gallery** built+deployed; **US bereavement re-test closed** (estate-tax qualitative-only + `makeSolicitorRewriteStream`; 10/10). Worker `afac0f2e`. |
| 32 | **Diagnosis tool NZ-hardened** (first country-hardening of the only never-hardened tool). New leak harness `tests/diag_diagnosis_nz.mjs`; baseline 20-run via bypass; added global no-cross-country guardrail + NZ-locked entity block to the diagnosis prompt; **Worker `a9cafbe7`**. Re-test **19/20 clean**, Equality Act 2010 2×→0×, NZ anchors up (Te Whatu Ora 6→19, NASC 1→8). **Declined the in-stream rewrite** — every "survivor" was a harness false positive; a rewrite would corrupt correct NZ text. Counter-lesson logged: confirm a leak is real (and context-free) before reaching for the worker rewrite. |
