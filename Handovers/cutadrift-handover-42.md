# Cut Adrift — Handover Document 42
**Updated:** 28 June 2026
**Session work:** AU diagnosis guide cluster built and deployed — hub + Pages 1–5. Commits `dc8f132`, `d22adc7`, `d5ccacb`, `f059721`, `c6010a6`. Pages-only deploys.
**Supersedes:** H41 (kept on disk; not pruned). Cumulative session-history table preserved below.

---

## Project overview / Deploy commands

**Cut Adrift** — a free tool that helps people in the first days after a hard life event (a death, a serious diagnosis, losing capacity to manage affairs). Three tools (`bereavement`, `diagnosis`, `incapacity`/carer), each serving six countries (NZ, AU, UK, IE, CA, US). A Cloudflare Worker holds the system prompts + calls Claude and streams SSE; a static site (`Public/`) is the front end.

**Two separate deploys — do not confuse them:**
- **Worker (the prompts + rate limiter):** `npx wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`. **A prompt change requires THIS deploy.**
- **Static site:** `npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true` (from repo root) → serves `cutadrift.org`. The `wrangler.toml` "missing `pages_build_output_dir`" warning is benign. A pages-only deploy silently leaves the prompt stale; a worker-only deploy is correct for a prompt-only change.
- Per-tool model + token maps live in `worker.js` (`MODELS` / `MAX_TOKENS`). **Diagnosis runs on `claude-sonnet-4-6`, 4000 max_tokens.**

**Test-bypass header (from H31):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04` — skips the per-IP gate + global counter, so testing is free of the public rate limit.

**Current worker version:** `67c366a5` (unchanged this session — no worker deploy).

**Key URL confirmed in H40:** the diagnosis tool URL is `/when-you-get-a-diagnosis/` (not `/diagnosis/`).

---

## New this session

### AU diagnosis guide cluster — complete

Hub + 5 pages all live, fully interlinked, indexing requested for all pages. All pages passed contamination scan before deploy.

**Contamination scan command (use for all future country pages):**
```
grep -in "kiwisaver\|jobseeker support\|supported living payment\|0800 559 009\|moneytalks\|holidays act\|human rights act 1993\|\bifso\b\|\bpharmac\b\|work and income new zealand\|\bwinz\b\|disability allowance" <filepath> && echo "CONTAMINATION FOUND" || echo "CLEAN"
```
Note: "work and income" as a generic phrase is NOT in the scan — it's legitimate English. "Work and Income New Zealand" and "WINZ" are the NZ-specific forms to catch. "Pharmaceutical" is also fine — only `\bpharmac\b` (the agency name) is blocked.

**Hub:** `Public/guides-diagnosis-au/index.html` → `cutadrift.org/guides-diagnosis-au/`
- Commit `dc8f132` (4 files, 429 insertions). Also added "Guides for other countries" section to NZ hub linking to AU hub.

**Page 1 — live, indexing requested:**
`Public/what-to-do-after-a-serious-diagnosis-au/index.html` → `cutadrift.org/what-to-do-after-a-serious-diagnosis-au/`
- Covers: Fair Work Act sick leave (10 days/year, accumulates), Services Australia/Centrelink (JobSeeker, DSP), superannuation early release (compassionate grounds via ATO, severe hardship via fund), Medicare, PBS and PBS Safety Net, NDIS eligibility, insurance check (including default super fund cover), legal paperwork (state-based EPA/guardianship), Cancer Council 13 11 20, National Debt Helpline 1800 007 007, MoneySmart.
- Commit `dc8f132`.

**Page 2 — live, indexing requested:**
`Public/serious-illness-work-and-income-au/index.html` → `cutadrift.org/serious-illness-work-and-income-au/`
- Covers: disclosure obligations (Fair Work Act), sick/personal leave (10 days/year, accrues; casuals no paid leave), medical certificate rules, reasonable adjustments (Disability Discrimination Act 1992), unfair dismissal protections (Fair Work Commission), long-term incapacity/redundancy process, self-employed gap, Centrelink JobSeeker and DSP (myGov), Carer Payment/Allowance, record-keeping.
- Commit `d22adc7` (4 files, 324 insertions).

**Page 3 — live, indexing requested:**
`Public/financial-help-serious-illness-au/index.html` → `cutadrift.org/financial-help-serious-illness-au/`
- Covers: default super fund insurance (life/TPD), super early release (compassionate grounds ATO, severe hardship via fund), Medicare bulk billing and gap, PBS co-payments and Safety Net, NDIS, Centrelink advance payment and crisis payment, bank/lender hardship (Australian Banking Association), ATO PAYG withholding variation and study loan pause, charity grants (Cancer Council, Heart Foundation, MND), National Debt Helpline 1800 007 007, Financial Counselling Australia, MoneySmart.
- Commit `d5ccacb` (4 files, 313 insertions).

**Page 4 — live, indexing requested:**
`Public/insurance-claims-after-diagnosis-au/index.html` → `cutadrift.org/insurance-claims-after-diagnosis-au/`
- Covers: types of policy (life, trauma/critical illness, TPD, income protection, mortgage protection), default super fund insurance (check PDS, call fund), finding forgotten policies (ATO myGov for lost super, old payslips, mortgage docs), trauma policy definition matching, claim process, APRA and ASIC oversight, declined claims (AFCA, free, 1800 931 678), super fund trustee dispute resolution, no ACC equivalent in AU (state workers comp for work injuries only), financial adviser help.
- Commit `f059721` (4 files, 314 insertions).

**Page 5 — live, indexing requested:**
`Public/telling-people-about-your-diagnosis-au/index.html` → `cutadrift.org/telling-people-about-your-diagnosis-au/`
- Covers: no legal obligation in most contexts, telling employer (only if affects safe work; "a medical condition" sufficient), Privacy Act 1988 (Cth) at work, safety-sensitive role exceptions (aviation, rail, maritime, mining, healthcare, heavy vehicles — Fair Work Ombudsman for advice), telling Centrelink (required for payments, Privacy Act bound), telling bank (voluntary, unlocks hardship), workers comp (work-caused injury/illness only, state-based), telling insurer when claiming, telling family (personal not legal), children/young people (Cancer Council resources), hospital social workers, right not to tell anyone yet.
- Commit `c6010a6` (4 files, 305 insertions).

---

## Next session — START HERE

1. **Build UK diagnosis guide cluster** — same 6-page structure (hub + 5 pages), all entity content from UK official sources from scratch. UK entities to use: DWP, Employment and Support Allowance (ESA), Universal Credit, Statutory Sick Pay (SSP), Personal Independence Payment (PIP), NHS, Macmillan Cancer Support, Citizens Advice, Pension (not super/KiwiSaver), Financial Ombudsman Service (FOS). Page URLs: `guides-diagnosis-uk/`, `what-to-do-after-a-serious-diagnosis-uk/`, `serious-illness-work-and-income-uk/`, `financial-help-serious-illness-uk/`, `insurance-claims-after-diagnosis-uk/`, `telling-people-about-your-diagnosis-uk/`.

   **Contamination scan for UK pages** — run before each deploy:
   ```
   grep -in "kiwisaver\|jobseeker support\|supported living payment\|0800 559 009\|moneytalks\|holidays act\|human rights act 1993\|\bifso\b\|\bpharmac\b\|work and income new zealand\|\bwinz\b\|disability allowance\|centrelink\|services australia\|fair work\|superannuation\|moneysmart\|myGov\|afca\|1800 931 678\|1800 007 007" <filepath> && echo "CONTAMINATION FOUND" || echo "CLEAN"
   ```
   (Expanded scan now also blocks AU-specific entities for UK and later countries.)

2. **After UK:** continue IE, CA, US in the same order.

3. **Add diagnosis section to homepage** — NZ and AU are both live; this threshold (2 countries) is close to the 3-country trigger. Consider adding after UK is done.

4. **Not Redundant directory pass** — GSC redirect errors should be clearing; check next session. Then add notredundant.com to Hotfrog, Yellow NZ, and directory shortlist.

**Claude Code instruction template for each new page:**
> Research all content from official [country] sources. Do NOT copy or adapt any NZ or AU content. Add it to the sitemap, the hub, and link it from the previous page. Then STOP: commit and tell me exactly which files changed. Do NOT deploy, do NOT curl or verify anything, do NOT start background polling loops.

Deploy command: `cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true`

---

## Outstanding tasks

### ⚡ Priority
1. **Build UK diagnosis cluster** (hub + 5 pages).
2. **Not Redundant directory pass** — check GSC redirect errors cleared first.
3. **Short-diagnosis-response watch** (from H38) — confirm truncated vs brief.
4. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign).
5. **Incapacity family-message invents unsupplied names** ("Gavin") — no-invented-names guard on next incapacity pass.
6. *(Carried: DIWM Phase 3 cover-letter; GSC request-indexing for 8 pages.)*

### Consider / Ongoing
7. **Add diagnosis section to homepage** — consider after UK cluster live (3 countries).
8. **Directory pass for Cut Adrift** (one afternoon, once): Hotfrog, Cylex, Brownbook (cross-country); Yellow NZ, Yell UK, Yellow Pages AU/CA, Yelp US, Golden Pages IE.
9. Diagnosis non-leak residuals (correct, left as-is) — see H38.
10. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known.
11. **Watch: "The Dinner Party" residual in US bereavement.**
12. Mobile click-through still owed on redesigned homepage.
13. Pin "Notifying their employer" heading in bereavement prompt.
14. Tighten `verify_crisis.mjs` Path A assertion.
15. `wrangler.toml` missing `pages_build_output_dir` (non-fatal).
16. Confirm sage favicon at tab size.
17. OG image placeholder.
18. Feedback form → Google Sheet.
19. GSC indexing queue; diagnosis guide pages (ongoing as built).
20. Not Redundant GSC: validate fix hit in H41 — check next session that redirect errors have cleared.

---

## Country-hardening status (all three tools)
- **Incapacity:** all 5 non-NZ countries done (NZ original).
- **Bereavement:** all 6 done (US confirmed clean, H31).
- **Diagnosis:** NZ ✅, AU ✅, UK ✅, IE ✅, CA ✅, US ✅ — **COMPLETE across all six countries.**

**All three tools are now country-hardened across all six countries.**

## Cross-country contamination prevention — guide pages

Guide pages are static HTML. Risk is copy-paste contamination when adapting one country for another. Prevention:

1. **Research each country from official sources from scratch.** Structure and tone come from NZ; all entity content (agencies, payments, phone numbers, legislation) replaced entirely.
2. **Run contamination scan before each deploy.** Use the scan command in "Next session" above — it now blocks both NZ and AU entities for UK+ pages.
3. **Watch the tricky sections:** insurance, self-employed, and pension/super sections are highest-risk. Key substitutions: KiwiSaver (NZ) → superannuation (AU) → pension (UK) → RRSP (CA) → 401(k) (US).

---

## Diagnosis guide cluster status
- **NZ:** Hub ✅ | Pages 1–5 ✅ all live, indexing requested — **COMPLETE**
- **AU:** Hub ✅ | Pages 1–5 ✅ all live, indexing requested — **COMPLETE**
- **UK:** ⏳ not started — next
- **IE/CA/US:** ⏳ not started — after UK

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
| 39 | **Homepage gallery redesign** — all five output cards replaced with visual layouts showing actual tool output format. Commit `3bdf9d5`. Pages-only deploy. |
| 40 | **SEO/backlink strategy** researched and resolved. **Content gap analysis** completed. **NZ diagnosis guide cluster:** hub + Page 1 + Page 2 built and deployed. Commits `08e1d10`, `1a203f7`. |
| 41 | **Not Redundant GSC redirect errors** diagnosed and fixed (`_redirects`, 301s). **NZ diagnosis cluster completed:** Pages 3–5 built, deployed, indexing requested. Commits `4c9ebec`, `a340aba`, `a5e9fad`. |
| 42 | **AU diagnosis guide cluster complete** — hub + Pages 1–5 built, contamination-scanned, deployed, indexing requested. Contamination scan command refined (word-boundary matching; AU entities added to scan for UK+). Commits `dc8f132`, `d22adc7`, `d5ccacb`, `f059721`, `c6010a6`. |
