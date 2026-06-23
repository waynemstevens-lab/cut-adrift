# Cut Adrift — Handover Document 39
**Updated:** 23 June 2026
**Session work:** **Homepage gallery redesign** — all five output cards (the hero proof card + four gallery cards) replaced with visual layouts that render the actual format of each tool's output, rather than plain text on a white card. Committed to `main` (`3bdf9d5`). No worker changes this session — pages-only deploy.
**Supersedes:** H38 (kept on disk; not pruned). Cumulative session-history table preserved below.

---

## Project overview / Deploy commands

**Cut Adrift** — a free tool that helps people in the first days after a hard life event (a death, a serious diagnosis, losing capacity to manage affairs). Three tools (`bereavement`, `diagnosis`, `incapacity`/carer), each serving six countries (NZ, AU, UK, IE, CA, US). A Cloudflare Worker holds the system prompts + calls Claude and streams SSE; a static site (`Public/`) is the front end.

**Two separate deploys — do not confuse them:**
- **Worker (the prompts + rate limiter):** `npx wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`. **A prompt change requires THIS deploy.**
- **Static site:** `npx wrangler pages deploy Public` (from repo root) → serves `cutadrift.org`. The `wrangler.toml` "missing `pages_build_output_dir`" warning is benign. A pages-only deploy silently leaves the prompt stale; a worker-only deploy is correct for a prompt-only change.
- Per-tool model + token maps live in `worker.js` (`MODELS` / `MAX_TOKENS`). **Diagnosis runs on `claude-sonnet-4-6`, 4000 max_tokens.**

**Test-bypass header (from H31):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04` — skips the per-IP gate + global counter, so testing is free of the public rate limit. Hard-coded as a fallback in the diag harnesses.

**Current worker version:** `67c366a5` (unchanged this session — no worker deploy).

---

## The diagnosis country-hardening method (reference — now used all six times; LOCKED)

The diagnosis prompt (`SYSTEM_PROMPTS.diagnosis` in `worker.js`) is structurally different from bereavement/incapacity: it has **no per-country sections** — it inlines all six countries' benefit names + statutes into single sentences. That inline-all-countries phrasing IS the cross-country leak surface. A global two-rule guardrail (H32, after the `country` field) says "name only the user's own country's entities" + "no invented/mislocalized names or URLs"; each hardened country then gets a dedicated **"[Country] plans — use only these"** anchor-and-ban block (now six of them: NZ → AU → UK → IE → CA → US, in prompt order).

**Per country:** clone `tests/diag_diagnosis_<prev>.mjs` → swap the home country + FAIL/PRESENCE checks → **baseline via the bypass header** → read every flagged capture against the actual text → add the "use only these" block after the previous country's → `wrangler deploy` → **re-test**. False-positive catalogue fully mapped and lives in the `incapacity-country-hardening` memory.

---

## New this session

### Homepage gallery redesign — `Public/index.html` — commit `3bdf9d5`

All five output cards redesigned from plain text to visual layouts that show the actual format of each tool's output. **No CSS classes added** — all styling is inline on the cards themselves, so the rest of the stylesheet is untouched.

**Proof card (hero — "AN EXAMPLE OF WHAT WE DRAFT, AUTOMATICALLY"):**
Previously plain text with a `proof-meta` line. Now full-bleed with `padding: 0; overflow: visible`:
- Warm grey (`#f0ece3`) To/Re email header block with `TO` / `RE` labels in small-caps
- White body section with the bereavement leave email at reading size
- Tag still protrudes correctly (outer `overflow: visible` + inner wrapper `overflow: hidden; border-radius: 4px`)

**Gallery card 1 — Bereavement (sage tag):**
- Thin clay (`#c1734f`) 4px stripe at the top (letterhead signal)
- Slightly warm grey (`#f5f1e8`) To/Re header block
- Letter body below

**Gallery card 2 — Diagnosis (clay tag):**
- Full-width clay header bar: "PARTNERS LIFE · INCOME PROTECTION · CALL SCRIPT"
- Clay-labelled "WHAT TO SAY" section
- Sage-labelled "WHAT TO ASK" section

**Gallery card 3 — Incapacity (clay tag):**
- Warm grey To/Re email header ("TO: Liam, Gemma, and the family group" / "RE: Dad — and what we need to do differently")
- Message body below

**Gallery card 4 — Job loss (sage tag) — previously the empty stub:**
- Mini two-column CV layout rendered inside the card
- Slate-blue sidebar (`#8596A8`) with Fraunces serif name, subtitle, contact, skills pills, education
- White main area with PROFILE and EXPERIENCE sections at miniature scale
- Italic "…plus" footer strip
- Content sourced from a real Not Redundant CV builder output (Sarah Chendle, Operations Coordinator)

**Tag-clipping fix:** All four gallery cards and the proof card now use `overflow: visible` on the outer container + `overflow: hidden; border-radius: 4px` on an inner wrapper div. This lets the absolutely-positioned tags (`top: -13px`) show above the card while still clipping the inner content to the card's border radius. Earlier version used `overflow: hidden` on the outer card which clipped the tags.

---

## Next session — START HERE

1. **Investigate the short-diagnosis-response watch item** (from H38) — confirm whether the ~1300c responses are truncated or just brief; only a real concern if plans are being cut before the benefits section.
2. **Homepage design system not yet applied site-wide** — guides + tool pages still pre-redesign.
3. **Incapacity family-message hallucinated-name check** ("Gavin") — fold into incapacity's next QA pass.

---

## Outstanding tasks

### ⚡ Priority
1. **Short-diagnosis-response watch** — confirm truncated vs brief.
2. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign).
3. **Incapacity family-message invents unsupplied names** ("Gavin") — no-invented-names guard on next incapacity pass.
4. *(Carried: DIWM Phase 3 cover-letter; GSC request-indexing for 8 pages.)*

### Consider / Ongoing
5. **Diagnosis non-leak residuals (correct, left as-is):** US "EI sickness benefits do not apply in the US" negation + Medicare/workers'-comp low-anchor length-tail; CA Employment Standards Act/ESA anchor 0× + the cosmetic "wait, strike that" PRSI self-correction; IE Carer's Allowance 2×/48 and UK Attendance/Carer's/DLA 5×/48 (carer/elderly benefits, rare in patient-focused scenarios); AU DDA anchor 0×; NZ Title-Case "Statutory Sick Pay" self-employed negation (~1–2/20).
6. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known.
7. **Watch: "The Dinner Party" residual in US bereavement** — US-gated in-stream rewrite if it persists.
8. Mobile click-through still owed on the redesigned homepage. 9. Pin "Notifying their employer" heading in the bereavement prompt. 10. Tighten `verify_crisis.mjs` Path A assertion. 11. `wrangler.toml` missing `pages_build_output_dir` (non-fatal). 12. Confirm sage favicon at tab size. 13. **Outreach follow-up (5 bereavement orgs) — overdue.** 14. OG image placeholder. 15. Feedback form → Google Sheet. 16. Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages.

---

## Country-hardening status (all three tools)
- **Incapacity:** all 5 non-NZ countries done (NZ original).
- **Bereavement:** all 6 done (US confirmed clean, H31).
- **Diagnosis:** NZ ✅, AU ✅, UK ✅, IE ✅, CA ✅, US ✅ — **COMPLETE across all six countries.**

**All three tools are now country-hardened across all six countries.**

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
| 32 | **Diagnosis NZ-hardened** (first hardening of the only never-hardened tool). Harness `tests/diag_diagnosis_nz.mjs`; **Worker `a9cafbe7`**; 19/20 clean. |
| 33 | **Homepage proof gallery remapped** to one card per intake situation. Commit `9ed430e`. Flagged: incapacity family-message hallucinated "Gavin". |
| 34 | **Diagnosis AU-hardened**. Harness `tests/diag_diagnosis_au.mjs`; **Worker `84982b2b`**; re-test 12/12 clean. Commit `5f0da4d`. |
| 35 | **Diagnosis UK-hardened** (3rd country). Harness `tests/diag_diagnosis_uk.mjs`; **Worker `7fd2f854`**; re-test 48/48 clean. Commit `6520b3b`. |
| 36 | **Diagnosis IE-hardened** (4th country). Harness `tests/diag_diagnosis_ie.mjs`; **Worker `16006a4b`**; re-test **48/48 clean**. |
| 37 | **Diagnosis CA-hardened** (5th country). Harness `tests/diag_diagnosis_ca.mjs`; **Worker `ec148b17`**; re-test effectively 47/47. Commit `cec766e`. |
| 38 | **Diagnosis US-hardened** (6th and final). Harness `tests/diag_diagnosis_us.mjs`; **Worker `67c366a5`**; re-test 47/48 → effectively 48/48. **Diagnosis hardening COMPLETE across all six countries; all three tools now done.** |
| 39 | **Homepage gallery redesign** — all five output cards (proof card + 4 gallery cards) replaced with visual layouts showing actual tool output format. Job-loss card (card 4 stub) filled with mini Not Redundant CV builder output. Tag-clipping fix across all cards. Commit `3bdf9d5`. Pages-only deploy. |
