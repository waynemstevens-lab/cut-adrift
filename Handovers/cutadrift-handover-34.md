# Cut Adrift — Handover Document 34
**Updated:** 21 June 2026
**Session work:** **AU-hardened the diagnosis tool** (carried top priority from H32/H33 — the second country after NZ). Cloned the NZ leak harness, measured an AU baseline via the test-bypass header, added an "Australian plans — use only these" entity block to the diagnosis prompt, deployed, and re-tested: the one real baseline leak (NZ/IE **Disability Allowance** mislocalised as "the Disability Allowance equivalent in Australia") went to **0×**, **12/12 clean**, AU anchor coverage up sharply. Then ran down a reported "site is broken" alarm — **confirmed a non-bug** (Wayne was viewing a local `file://` copy; live site + worker both fully healthy). Finally removed a redundant featured NZ link from the homepage Bereavement Guides section and redeployed Pages.
**Supersedes:** Handover 33 (worker side) / Handover 32 (diagnosis-hardening thread).

---

## Project overview / Deploy commands

*(Unchanged — see Handover 24/25.) Two separate deploys, do not confuse them:*
- **Worker (the prompts + rate limiter):** `wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`. **Deployed this session** (version `84982b2b`).
- **Static site:** from `Public/`, `npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true` → serves `cutadrift.org`. **Deployed this session** (preview `https://0ce265eb.cutadrift.pages.dev`, production alias updated). The `wrangler.toml` "missing `pages_build_output_dir`" warning is benign — Pages ignores the config and deploys `.` directly.

**Test-bypass header (from H31):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04` — skips per-IP gate + global counter, so testing is free of the public rate limit. Hard-coded as a fallback in the diag harnesses.

---

## New this session

### 1. Diagnosis tool — Australia hardening (DONE + DEPLOYED) — Worker `84982b2b`

Same method as the NZ pass (H32). The diagnosis prompt (`SYSTEM_PROMPTS.diagnosis`) still inlines all six countries' benefit names + statutes into single sentences — that inline-all-countries phrasing is the cross-country leak surface. The global two-rule guardrail (H32) already applied to AU, so AU was *partly* shielded; this pass added the per-country anchor block.

**Harness (`tests/diag_diagnosis_au.mjs`, new).** Clone of `diag_diagnosis_nz.mjs` with AU as home country: bypass header, 4 AU diagnosis scenarios (employed+cancer, self-employed+MS, not-working+chronic, employed+neuro), AbortController 90s timeout + ECONNRESET retry + retry-on-empty, fail-capture dir `tests/_au_diag_fails/` (gitignored). FAIL = a NON-AU country's named entity in an AU plan; PRESENCE = expected AU anchors. **AU-specific false-positive guards baked in** (the H32 lesson, re-applied): Medicare / Cancer Council / DSP / JobSeeker Payment / superannuation / NDIS are AU **anchors, not fails**; flag only US-specific "social security disability" (AU has its own *Social Security Act 1991*); flag NZ's "Human Rights Act **1993**" not the generic phrase (QLD has a real *Human Rights Act 2019*); kept case-sensitive `Statutory Sick Pay` / `Illness Benefit` with insurance-phrase exclusions; "Disability Allowance" IS a leak for AU (NZ/IE benefit — AU uses the DSP); NZ "Jobseeker Support" flagged but AU "JobSeeker Payment" is an anchor.

**Baseline (unhardened-for-AU, worker `a9cafbe7`, 12 runs): 11/12.** The one **real** leak: in `not_working_chronic`, *"The **Disability Allowance** equivalent in Australia is a range of supplementary payments…"* — the exact "relabel another country's scheme as the [X] equivalent" pattern. Anchor gaps: Medicare 1×, DDA 0×, Centrelink 8×, DSP 7×.

**The hardening (prompt only).** Added an **"Australian plans — use only these"** block right after the NZ block: Centrelink / Services Australia, Disability Support Pension (DSP), JobSeeker Payment (medical cert / partial capacity), Carer Payment/Allowance + Pensioner Concession/Health Care Card + Mobility Allowance; NES paid personal/carer's leave + Fair Work Act 2009 + Fair Work Commission/Ombudsman; Disability Discrimination Act 1992; Medicare + NDIS; Australian Charter of Healthcare Rights; superannuation (death/TPD/income protection); Cancer Council Australia. Plus a **"Never name in an Australian plan"** ban list for the other five countries, including an explicit **"never relabel another country's scheme as 'the Australian equivalent'"** rule that directly targets the baseline leak. (Note: AU keeps Medicare — the block says "Australia has no NHS and no ACC", *not* "no Medicare".)

**Re-test (hardened, worker `84982b2b`, 12 runs): 12/12 clean.** Disability Allowance leak → **0×**. Anchors jumped: Centrelink 8→12, Services Australia 12→12, DSP 7→12, JobSeeker Payment 12→12, Medicare 1→10, Fair Work Act 7→9, superannuation 12→12.

**Watch item (NOT a leak):** the **Disability Discrimination Act** anchor read **0× in both runs** — the model covers AU discrimination via the Fair Work Act general protections instead of naming the DDA. Substantively correct, left as-is (same philosophy as the NZ "Statutory Sick Pay negation" non-leak in H32). If a future pass wants DDA named explicitly, the prompt already lists it — would need a stronger nudge, not worth a rewrite.

Committed **`5f0da4d`** (worker.js + harness + .gitignore).

### 2. "Site is broken" alarm — investigated, NON-BUG (no change to site/worker)

Wayne reported all tools failing to load + homepage guide links opening as local files ("bare `/when-someone-dies/` with no domain"). **Confirmed not a real bug** before changing anything:
- Worker `cutadrift-engine`: `POST /` → 200 + valid SSE stream (AU prompt runs); `GET /` → 405 (correct by design, POST/OPTIONS only). Verified by direct live request, more conclusive than `wrangler tail`.
- Static site: homepage + every tool/guide route return **200** over HTTPS on the live site.
- `Public/index.html` hrefs: all correct **root-relative** paths (`/when-someone-dies/` etc.); no single-quoted / unquoted / missing-leading-slash variants. Live deployed HTML matches the repo.
- **Root cause:** Wayne was viewing a local `file://` copy of `index.html` (double-clicked), where root-relative `/path/` resolves to the OS filesystem root and the worker `fetch()` is CORS-blocked (worker only allows `origin: https://cutadrift.org`). **Confirmed by Wayne** — works on the live URL. **Lesson: a "no domain / opens as local file" symptom + tools not loading = the `file://` signature; check the address bar before touching hrefs.** The AU deploy only changed `worker.js`, so it could never have caused a static-href regression anyway. **Do NOT convert the root-relative hrefs to absolute URLs** — that would break Pages preview deploys + local dev.

### 3. Homepage — removed redundant featured NZ guide link (DONE + DEPLOYED)

Deleted the `→ What to do when someone dies in New Zealand` featured link (`/what-to-do-when-someone-dies-nz/`, `class="guides-featured"`) from the Bereavement Guides section of `Public/index.html` — it duplicated the "New Zealand →" link already in the six-country row below. Six-country row left as-is. (The `.guides-featured` CSS rule is now unused but harmless — left in place.) Committed **`0703145`**, Pages-deployed, verified gone from live.

---

## Next session — START HERE

1. **Diagnosis tool — UK / IE / CA / US hardening.** NZ (H32) + AU (this session) done; four countries remain, same inline-all-countries latent risk each. Same method: clone `tests/diag_diagnosis_au.mjs` (or the NZ one), swap home country + FAIL/PRESENCE checks, baseline via bypass header at 10–14+ runs, add a per-country "use only these" block after the AU one, deploy, re-test. Watch the H32 false-positive classes (generic insurance "illness benefit", lowercase "statutory sick pay", a country's own benefit colloquialised) — and note each country has its OWN false-positive collisions to map (e.g. AU's "Social Security Act 1991", QLD's "Human Rights Act 2019"). **US is the model's strongest jurisdiction** (likely cleanest baseline); UK/IE worth the most scrutiny.
2. **Job-loss gallery card** — still a separate Not Redundant repo session, then slot into the card-4 stub (H33).
3. **Incapacity family-message hallucinated-name check** ("Gavin", H33) — fold into incapacity's next QA pass.

---

## Outstanding tasks

### ⚡ Priority
1. **Diagnosis tool — UK/IE/CA/US hardening** (NZ + AU done). See "Next session".
2. **Job-loss gallery card** — needs its own Not Redundant repo session, then card-4 stub here.
3. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign). Carried.
4. *(Carried: DIWM Phase 3 cover-letter; GSC request-indexing for 8 pages.)*

### Consider / Ongoing
5. **Diagnosis AU residual (non-leak):** DDA anchor 0× — model uses Fair Work Act general protections for discrimination; correct, left as-is (this session).
6. **Incapacity family-message invents unsupplied names** ("Gavin", H33) — no-invented-names guard on next incapacity pass.
7. Gallery renders **3 cards + bottom-right gap** until the job-loss card lands (H33).
8. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known (H29).
9. **Watch: "The Dinner Party" residual in US bereavement** (H31) — US-gated in-stream rewrite if it persists.
10. Diagnosis NZ residual: Title-Case "Statutory Sick Pay" in self-employed negation (~1–2/20) — non-leak, left as-is (H32).
11. Mobile click-through still owed on the redesigned homepage (H33). 12. Pin "Notifying their employer" heading in the bereavement prompt. 13. Tighten `verify_crisis.mjs` Path A assertion. 14. `wrangler.toml` missing `pages_build_output_dir` (non-fatal). 15. Confirm sage favicon at tab size. 16. **Outreach follow-up (5 bereavement orgs) was due week of 23 June 2026 — now imminent/overdue.** 17. OG image placeholder. 18. Feedback form → Google Sheet. 19–22. *(Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages — see H25.)*

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
| 32 | **Diagnosis tool NZ-hardened** (first hardening of the only never-hardened tool). Harness `tests/diag_diagnosis_nz.mjs`; **Worker `a9cafbe7`**; 19/20 clean, Equality Act 2× → 0×. Declined the in-stream rewrite — every "survivor" was a harness false positive. |
| 33 | **Homepage proof gallery remapped** to one card per intake situation. Capture script `tests/capture_gallery_v2.mjs` + 7 captures. Commit `9ed430e`, Pages-deployed. No worker change. Flagged: incapacity family-message hallucinated "Gavin". |
| 34 | **Diagnosis tool AU-hardened** (2nd country). Harness `tests/diag_diagnosis_au.mjs`; baseline 11/12 (real leak = NZ/IE "Disability Allowance" mislocalised); added "Australian plans — use only these" block; **Worker `84982b2b`**; re-test **12/12 clean**, leak → 0×, anchors up (Medicare 1→10, DSP 7→12). Commit `5f0da4d`. Investigated a "site broken" report → **non-bug** (Wayne on `file://`; live site + worker healthy). Removed redundant featured NZ link from homepage Bereavement Guides; commit `0703145`, Pages-deployed. |
