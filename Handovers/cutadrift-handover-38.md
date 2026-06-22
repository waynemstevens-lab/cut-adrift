# Cut Adrift — Handover Document 38
**Updated:** 23 June 2026
**Session work:** **Hardened the diagnosis tool for the United States** — the **sixth and final** diagnosis country. **Diagnosis country-hardening is now COMPLETE across all six countries (NZ, AU, UK, IE, CA, US).** Same locked method: clone the leak harness, baseline via the test-bypass header, read every flagged capture against the actual text, add a per-country "use only these" entity block to the diagnosis prompt after the CA block, deploy, re-test. US baselined as the model's strongest jurisdiction (UK/CA pattern — preventive/parity pass): **0 real cross-country leaks across 96 pre-block runs** (every flag a harness false positive). Block added for parity + anchor-locking; post-block re-test **47/48 raw → effectively 48/48** (the one flag is a CA-scheme *negation*, not a recommendation).
**Supersedes:** H37 (kept on disk; not pruned). Cumulative session-history table preserved below.

---

## Project overview / Deploy commands

**Cut Adrift** — a free tool that helps people in the first days after a hard life event (a death, a serious diagnosis, losing capacity to manage affairs). Three tools (`bereavement`, `diagnosis`, `incapacity`/carer), each serving six countries (NZ, AU, UK, IE, CA, US). A Cloudflare Worker holds the system prompts + calls Claude and streams SSE; a static site (`Public/`) is the front end.

**Two separate deploys — do not confuse them:**
- **Worker (the prompts + rate limiter):** `npx wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`. **A prompt change requires THIS deploy.**
- **Static site:** `npx wrangler pages deploy Public` (from repo root) → serves `cutadrift.org`. The `wrangler.toml` "missing `pages_build_output_dir`" warning is benign. A pages-only deploy silently leaves the prompt stale; a worker-only deploy is correct for a prompt-only change.
- Per-tool model + token maps live in `worker.js` (`MODELS` / `MAX_TOKENS`). **Diagnosis runs on `claude-sonnet-4-6`, 4000 max_tokens.**

**Test-bypass header (from H31):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04` — skips the per-IP gate + global counter, so testing is free of the public rate limit. Hard-coded as a fallback in the diag harnesses.

**This session's worker version:** US block → `67c366a5` (current; full ID `67c366a5-8c84-46a6-9872-c05ae84fb143`).

---

## The diagnosis country-hardening method (reference — now used all six times; LOCKED)

The diagnosis prompt (`SYSTEM_PROMPTS.diagnosis` in `worker.js`) is structurally different from bereavement/incapacity: it has **no per-country sections** — it inlines all six countries' benefit names + statutes into single sentences. That inline-all-countries phrasing IS the cross-country leak surface. A global two-rule guardrail (H32, after the `country` field) says "name only the user's own country's entities" + "no invented/mislocalized names or URLs"; each hardened country then gets a dedicated **"[Country] plans — use only these"** anchor-and-ban block (now six of them: NZ → AU → UK → IE → CA → US, in prompt order).

**Per country:** clone `tests/diag_diagnosis_<prev>.mjs` → swap the home country + FAIL/PRESENCE checks → **baseline via the bypass header** → read every flagged capture against the actual text (the NZ counter-lesson: confirm a "leak" is REAL before acting — most are harness false positives) → add the "use only these" block after the previous country's → `wrangler deploy` → **re-test**. Each country has its OWN false-positive collisions to map — this was the recurring trap; **that catalogue is now fully mapped and lives in the `incapacity-country-hardening` memory.**

---

## New this session

### Diagnosis — United States hardening (DONE) — Worker `67c366a5`

**Harness `tests/diag_diagnosis_us.mjs`** (clone of the CA one). **US-specific false-positive guards (the home anchors that were the *US-leak* checks in every prior harness flip to anchors here):**
- **ADA / FMLA / SSDI / SSI / COBRA / Medicare / Medicaid / Social Security** are now US **anchors** — never flagged. Canada is the biggest bleed-by-proximity risk, so the harness flags CA entities (EI/CPP/Service Canada/Canada Health Act/ODSP/AISH/Canadian Cancer Society etc.) alongside the UK/AU/NZ/IE bans.
- **"ESA" is NOT flagged** — in the US it most commonly means an **Emotional Support Animal**; Canada's (Ontario) Employment Standards Act and the UK's Employment and Support Allowance are each flagged by their **full phrase only**.
- **"MSP" is NOT flagged** — in the US it's the **Medicare Savings Program**; Canada's BC Medical Services Plan would collide, so CA provincial health is flagged by OHIP/RAMQ/AHCIP + "provincial health plan/insurance/coverage" instead.
- **"PWD" is NOT flagged** — in the US it's a generic abbreviation for "persons with disabilities"; CA's BC program is caught via ODSP/AISH/"Ontario disability support" instead.
- **"American Cancer Society" contains "Cancer Society"** → negative-lookbehind `/(?<!american |canadian )cancer society/i` keeps NZ's "Cancer Society" a flag while the US anchor passes and CA's "Canadian Cancer Society" (its own CA flag) isn't double-labelled.
- **SSP fix (the one real harness change this session):** the baseline's only flags were 4× **"statutory sick pay"** — all the model **correctly** stating *"the US has no federal statutory sick pay"* (generic lowercase English, NOT the UK scheme). Tightened the UK SSP check to **case-sensitive proper-noun** `/Statutory Sick Pay|\bSSP\b/` (same NZ/IE counter-lesson as Illness Benefit); took those 4 false positives to 0×.

**Baseline (pre-block): 0 real cross-country leaks across 96 runs.** Run 1 (48, original `/statutory sick pay/i`): 44/48 — all 4 flags the generic-phrase SSP false positive (fixed as above). Run 2 (48, post-SSP-fix): 48/48 raw clean. **US is the model's strongest jurisdiction — no foreign-scheme recommendation surfaced at all** (UK/CA pattern), so the block is **preventive/parity** (locks anchors, guards regression), not fixing an active leak. Baseline saved to `/tmp/us_baseline.txt`.

**Block added** ("United States (US) plans — use only these", after the CA block): SSA / **SSDI** (work-credits, waiting period — name only, no day-count) / **SSI** (limited income & resources) + state supplements; **Medicare** (post-SSDI-qualifying / 65+), **Medicaid** (state-varying), **COBRA** (continue employer plan), the **ACA Health Insurance Marketplace** (healthcare.gov, special enrollment); **FMLA** (12 weeks job-protected, usually unpaid) + employer paid sick leave / short-term disability + state **SDI/PFL** ("check your state") + an explicit *"there is NO federal statutory sick pay"*; the **ADA** enforced by the **EEOC** + **reasonable accommodation** unless undue hardship; "no national health service" (employer / Medicare / Medicaid / ACA); **HIPAA** + ACA patient protections; employer group **STD/LTD** + critical-illness + private income-protection + **401(k)/IRA**; the **American Cancer Society** / National MS Society / Parkinson's Foundation / **211** (2-1-1, 211.org); ban list naming the other five (incl. CPP-D / EI / Service Canada / Canada Health Act / Canadian Cancer Society explicitly) + a "never name a foreign body then tell them to find the US version" rule.

**Re-test (hardened, 48 runs): 47/48 raw → effectively 48/48 clean** (`/tmp/us_retest.txt`). The one flag is a **non-leak**: `r6-self_employed_ms` — *"**EI sickness benefits do not apply in the US.** The FMLA and federal paid sick leave programs apply to employees, not self-employed contractors."* — the model names a Canadian scheme only to **dismiss** it, not to recommend it. Same residual class as CA's mid-stream PRSI self-correction and the generic "no statutory sick pay" negation; not a wrong-country recommendation, left as-is. The 4 SSP false positives → 0×. **Anchors healthy:** SSDI 24, ADA 25, FMLA 24, 211 24, ACA 22, STD/LTD 24, SSI 21, SSA 17, SDI/PFL 16, MS/Parkinson 15, COBRA 13, EEOC 12 / reasonable-accommodation 13, Medicaid 9, American Cancer Society 7.

***Watch (non-leak): response-length variance depresses the benefits-cluster anchors.*** **Medicare 2×, workers'-compensation 0×** in the re-test — NOT a localization failure. The benefits/healthcare section appears *late* in a full plan; when the worker returns a short (~1300c) response it only covers the early "right now / what not to do" + employment sections and never reaches it. **Verified via a live probe**: a full-length 3656c response contained SSDI, SSI, Medicare, Medicaid and 211 all PRESENT (and correctly, no ADA/FMLA in a not-working scenario). So the prompt steers to US entities correctly; the low counts are a length-tail artifact, same class as CA's Employment-Standards-Act-0× and AU's DDA-0× anchor watches.

***Watch (separate, possibly user-facing — LOGGED for follow-up): the worker sometimes returns short/brief diagnosis plans* (~1300c median in two of three 48-run passes vs ~3650c on a fresh live probe).** This is NOT part of country-hardening and was deliberately not investigated this session (per direction). Open question: are the short responses genuinely truncated mid-stream, or just brief complete plans? Worth a look — if plans are being cut off before the benefits section, users on those runs get an incomplete plan. (Streaming/`max_tokens`/load are the suspects; `REQ_TIMEOUT_MS` aborts return an error, not partial text, so that's not it.)

---

## Next session — START HERE

1. **Audit the Not Redundant prompts for cross-country entity bleed** — same systematic harness approach as the Cut Adrift diagnosis hardening, now that all six Cut Adrift diagnosis countries are complete. **Use 20–24 run passes rather than 48 — the false-positive catalogue is now well-mapped and the full method is locked.** (48-run confidence was needed only while the approach was being established; lighter passes are sufficient for a simpler prompt structure.)
2. **Investigate the short-diagnosis-response watch item** (above) — confirm whether the ~1300c responses are truncated or just brief; only a real concern if plans are being cut before the benefits section.
3. **Job-loss gallery card** — still a separate Not Redundant repo session, then slot into the card-4 stub.
4. **Incapacity family-message hallucinated-name check** ("Gavin") — fold into incapacity's next QA pass.

---

## Outstanding tasks

### ⚡ Priority
1. **Audit Not Redundant prompts for cross-country entity bleed** — same systematic harness approach. **Use 20–24 run passes (method now locked; 48 no longer needed).**
2. **Short-diagnosis-response watch** — confirm truncated vs brief (see watch item above).
3. **Job-loss gallery card** — needs its own Not Redundant repo session, then the card-4 stub here.
4. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign).
5. *(Carried: DIWM Phase 3 cover-letter; GSC request-indexing for 8 pages.)*

### Consider / Ongoing
6. **Diagnosis non-leak residuals (correct, left as-is):** US "EI sickness benefits do not apply in the US" negation + Medicare/workers'-comp low-anchor length-tail; CA Employment Standards Act/ESA anchor 0× + the cosmetic "wait, strike that" PRSI self-correction; IE Carer's Allowance 2×/48 and UK Attendance/Carer's/DLA 5×/48 (carer/elderly benefits, rare in patient-focused scenarios); AU DDA anchor 0×; NZ Title-Case "Statutory Sick Pay" self-employed negation (~1–2/20).
7. **Incapacity family-message invents unsupplied names** ("Gavin") — no-invented-names guard on next incapacity pass.
8. Gallery renders **3 cards + bottom-right gap** until the job-loss card lands.
9. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known.
10. **Watch: "The Dinner Party" residual in US bereavement** — US-gated in-stream rewrite if it persists.
11. Mobile click-through still owed on the redesigned homepage. 12. Pin "Notifying their employer" heading in the bereavement prompt. 13. Tighten `verify_crisis.mjs` Path A assertion. 14. `wrangler.toml` missing `pages_build_output_dir` (non-fatal). 15. Confirm sage favicon at tab size. 16. **Outreach follow-up (5 bereavement orgs) was due week of 23 June 2026 — now imminent/overdue.** 17. OG image placeholder. 18. Feedback form → Google Sheet. 19. Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages.

---

## Country-hardening status (all three tools)
- **Incapacity:** all 5 non-NZ countries done (NZ original).
- **Bereavement:** all 6 done (US confirmed clean, H31).
- **Diagnosis:** NZ ✅, AU ✅, UK ✅, IE ✅, CA ✅, **US ✅** — **COMPLETE across all six countries.**

**All three tools are now country-hardened across all six countries.** Method, per-country verified-contact details, and the full false-positive catalogue live in the `incapacity-country-hardening` memory.

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
| 34 | **Diagnosis AU-hardened**. Harness `tests/diag_diagnosis_au.mjs`; baseline 11/12; **Worker `84982b2b`**; re-test 12/12 clean. Commit `5f0da4d`. |
| 35 | **Diagnosis UK-hardened** (3rd country). Harness `tests/diag_diagnosis_uk.mjs`; baseline already 47/48 (benign superannuation→pension non-leak); preventive/parity block; **Worker `7fd2f854`**; re-test 48/48 clean. Commit `6520b3b`. |
| 36 | **Diagnosis IE-hardened** (4th country) — heaviest harness-collision load. Harness `tests/diag_diagnosis_ie.mjs`; baseline 46/48 (real leaks = fabricated "Cancer Society of Ireland" + NZ "HDC equivalent in Ireland"); **Worker `16006a4b`**; re-test **48/48 clean**. |
| 37 | **Diagnosis CA-hardened** (5th country) — model-strong, no US-bleed. Harness `tests/diag_diagnosis_ca.mjs`; baseline effectively 46/47 (1 real PRSI leak; 9 Illness-Benefit insurance-rider false positives → harness tightened); preventive/parity block; **Worker `ec148b17`**; re-test effectively 47/47. Commit `cec766e`. |
| 38 | **Diagnosis US-hardened** (6th and final) — strongest jurisdiction, no foreign-scheme recommendation across 96 pre-block runs (only harness false positives; tightened the UK SSP check to case-sensitive proper-noun). Harness `tests/diag_diagnosis_us.mjs`; preventive/parity block after CA (SSDI/SSI/Medicare/Medicaid/COBRA/ADA/FMLA flip to anchors; ESA=Emotional Support Animal and MSP=Medicare Savings Program and PWD=persons-with-disabilities all guarded from CA collisions); **Worker `67c366a5`**; re-test 47/48 → effectively 48/48 (the 1 flag = a "EI sickness benefits do not apply in the US" negation, not a recommendation). **Diagnosis hardening COMPLETE across all six countries; all three tools now done.** Logged a separate short-/truncated-response watch item. Next: Not Redundant cross-country audit (lighter 20–24 run passes). |
