# Cut Adrift — Handover Document 44
**Updated:** 29 June 2026
**Session work:** **Ireland (IE) diagnosis guide cluster built and deployed in full** — hub + Pages 1–5, each researched from official IE sources, contamination-scanned clean, committed, and deployed. Homepage diagnosis row updated with a Republic of Ireland link. Contamination scan adapted for IE (three IE-legitimate terms removed). `\bpip\b` collision with "Personal Insolvency Practitioner" found and resolved. GSC indexing for all six IE pages deferred (quota not yet reset).
**Supersedes:** H43 (kept on disk; not pruned). Cumulative session-history table preserved below.

---

## Project overview / Deploy commands

**Cut Adrift** — a free tool that helps people in the first days after a hard life event (a death, a serious diagnosis, losing capacity to manage affairs). Three tools (`bereavement`, `diagnosis`, `incapacity`/carer), each serving six countries (NZ, AU, UK, IE, CA, US). A Cloudflare Worker holds the system prompts + calls Claude and streams SSE; a static site (`Public/`) is the front end.

**Two separate deploys — do not confuse them:**
- **Worker (the prompts + rate limiter):** `npx wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`. **A prompt change requires THIS deploy.**
- **Static site:** `cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true` → serves `cutadrift.org`. The `wrangler.toml` "missing `pages_build_output_dir`" warning is benign. A pages-only deploy silently leaves the prompt stale; a worker-only deploy is correct for a prompt-only change.
- Per-tool model + token maps live in `worker.js` (`MODELS` / `MAX_TOKENS`). **Diagnosis runs on `claude-sonnet-4-6`, 4000 max_tokens.**

**Current worker version:** `67c366a5` (unchanged this session — all work was static pages, no worker deploy).

**Test-bypass header (from H31):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04` — skips the per-IP gate + global counter.

**Diagnosis tool URL:** `/when-you-get-a-diagnosis/` (not `/diagnosis/`).

**Working cadence (per page):** Claude Code builds the page → run contamination scan → Wayne deploys → request indexing (or defer) → next brief. Claude Code is told explicitly: commit and stop — no post-commit curl checks, liveness verification, or polling loops. Wayne runs deploy/scan commands and pastes results back. Prefers single copyable lines, plain language, no padding.

---

## New this session — IE diagnosis guide cluster (COMPLETE)

Hub + 5 pages all live, fully interlinked, contamination-scanned clean, deployed. Homepage link added. **Indexing deferred for all six (GSC quota).**

**Commits:**
- IE hub `bd4e923`
- IE Page 1 `334a26b`
- IE Page 2 `8dcaae7`
- IE Page 3 `3966c81`
- IE Page 4 `98d2ed3`
- IE Page 5 `47f5f1f`
- Homepage IE diagnosis link `e0faa42`

**Hub:** `Public/guides-diagnosis-ie/index.html` → `cutadrift.org/guides-diagnosis-ie/`
Cross-linked to the NZ/AU/UK/US diagnosis hubs, with reciprocal links added back from each.

**Page 1 — `Public/what-to-do-after-a-serious-diagnosis-ie/index.html`**
Covers: GP/HSE referral pathways, public vs private; Medical Card and GP Visit Card (means test + discretionary card on serious-illness grounds); Long-Term Illness (LTI) Scheme; Drugs Payment Scheme; Statutory Sick Pay (Sick Leave Act 2022); Illness Benefit; Invalidity Pension; Disability Allowance; Partial Capacity Benefit; Carer's Allowance/Benefit/Support Grant; occupational pension ill-health provisions; income protection / specified illness cover / mortgage protection check; Enduring Power of Attorney (EPA) and Advance Healthcare Directive (AHD) under the Assisted Decision-Making (Capacity) Act 2015 with the Decision Support Service; key contacts (Citizens Information 0818 07 4000, MABS, Irish Cancer Society 1800 200 700, HSE, DSP, DSS, FSPO).

**Page 2 — `Public/serious-illness-work-and-income-ie/index.html`**
Covers: disclosure (no general duty; Employment Equality Acts 1998–2015); Statutory Sick Pay + WRC complaint route; reasonable accommodation (Employment Equality Acts, WRC, IHREC); unfair dismissal (Unfair Dismissals Acts 1977–2015, 12 months' service; discriminatory dismissal has no service threshold; 6-month WRC time limit); long-term absence, phased return, Partial Capacity Benefit; Carer's Leave Act 2001 + Carer's Benefit/Allowance/Support Grant; redundancy rights (Redundancy Payments Acts); **self-employed gap (Class S PRSI = no SSP, no Illness Benefit, but Invalidity Pension / Disability Allowance / Partial Capacity Benefit / LTI available)**; DSP income supports; record-keeping; key contacts (WRC 0818 80 80 90, Citizens Information, IHREC, DSP, MABS).

**Page 3 — `Public/financial-help-serious-illness-ie/index.html`**
Covers: LTI Scheme (16 listed conditions; **cancer explicitly noted as NOT covered**); Drugs Payment Scheme (€80/family/month cap, no means test); Medical Card prescription charge (€1.50/item, €15/month cap, €10 for over-70s); discretionary and emergency (terminal-illness) Medical Cards; Additional Needs Payment via Community Welfare Service; Supplementary Welfare Allowance; Fuel Allowance / Household Benefits Package; MARP + Abhaile for mortgage arrears; Rent Supplement / HAP; MABS + ISI debt options (DSA, PIA, bankruptcy — **"Personal Insolvency Practitioner" spelled out, never abbreviated to PIP**); Irish Cancer Society financial support + Travel2Care; SVP; hospital medical social worker; key contacts (MABS 0818 07 2000, Citizens Information, HSE LTI line 0818 22 44 78, Irish Cancer Society).

**Page 4 — `Public/insurance-claims-after-diagnosis-ie/index.html`**
Covers: policy types (life, Specified/Serious Illness Cover, Income Protection/PHI, Mortgage Protection, private health via VHI/Laya/Irish Life Health); employer group schemes; finding forgotten cover; specified-illness definition matching; income protection terms (deferred period, ~75% benefit offset by Illness Benefit/Invalidity Pension, own-occupation, index-linking); **Consumer Insurance Contracts Act 2019** (abolished "utmost good faith"; innocent misrepresentation can't void a claim; proportionate remedies); Central Bank of Ireland + Consumer Protection Code; Health Insurance Authority; FSPO two-step escalation (internal complaint → FSPO, binding awards); **Occupational Injuries Benefit Scheme** (Injury Benefit, Disablement Benefit) + Injuries Resolution Board for work-caused illness; getting help (Irish Cancer Society, Citizens Information, FSPO, regulated adviser, Law Society).

**Page 5 — `Public/telling-people-about-your-diagnosis-ie/index.html`**
Covers: no general disclosure obligation; health data as special-category under GDPR + Data Protection Act 2018 (Data Protection Commission); telling employer (Employment Equality Acts; cert need not name diagnosis); medical confidentiality at work (no employer–GP contact without written consent; occupational health scope); **driving — NDLS declaration against the RSA's Sláinte agus Tiomáint standards**; regulated professions (Medical Council, NMBI, CORU, Irish Aviation Authority — research correct body; NOT UK regulators or DVLA); telling DSP; telling bank (MARP; health condition not on the Central Credit Register); telling insurer (Consumer Insurance Contracts Act 2019); work-caused illness via Occupational Injuries Benefit Scheme; family/children (Irish Cancer Society, Barnardos, school); care team (clinical nurse specialist, hospital medical social worker); not ready to tell anyone yet (Irish Cancer Society 1800 200 700, Samaritans 116 123, Aware 1800 80 48 48, GP/HSE).

**Homepage:** `Public/index.html` diagnosis row (`id="guides-diagnosis"`) now reads **New Zealand · Australia · United Kingdom · Republic of Ireland · United States**. (CA still to be added — see below.) Sitemap (`Public/sitemap.xml`) contains all six IE URLs under an "Ireland diagnosis guides" block.

---

## IE facts locked this session (reuse for verification / future edits)

- **Statutory Sick Pay** (Sick Leave Act 2022, in force since 1 Jan 2023): 5 days in 2026 (the planned 7/10-day increases were paused), 70% of pay, €110/day cap, 13 weeks' continuous service, medical cert required, WRC enforces.
- **Self-employed (Class S PRSI):** NO Statutory Sick Pay, NO Illness Benefit (Class S doesn't cover short-term illness). CAN get Invalidity Pension (Class S covered), means-tested Disability Allowance, Partial Capacity Benefit, and the LTI Scheme. → income protection insurance matters more.
- **Medicine costs:** Drugs Payment Scheme cap €80/family/month (since March 2022, not means-tested); LTI Scheme = 16 specified conditions free (**cancer is NOT on the list**); Medical Card prescription charge €1.50/item, €15/month cap (€10 for over-70s).
- **Capacity/future planning:** Assisted Decision-Making (Capacity) Act 2015 (full effect 26 Apr 2023). Enduring Power of Attorney (EPA) registered with the **Decision Support Service**; separate **Advance Healthcare Directive** for medical wishes. NOT the UK "LPA" / "Office of the Public Guardian".
- **Insurance:** Consumer Insurance Contracts Act 2019 replaced "utmost good faith" — consumer's only pre-contract duty is to answer questions honestly and with reasonable care; innocent misrepresentation can't void a claim. Central Bank of Ireland regulates; Health Insurance Authority for private health insurers; declined claims → insurer internal process → **FSPO** (free, binding).
- **Work-caused illness:** Occupational Injuries Benefit Scheme (Injury Benefit, Disablement Benefit); personal-injury route via the Injuries Resolution Board. No ACC-style scheme.
- **Disclosure/driving:** NDLS + RSA's *Sláinte agus Tiomáint*; professional regulators Medical Council / NMBI / CORU; health data under GDPR + Data Protection Act 2018 (Data Protection Commission).

---

## Contamination scan — IE adaptation (and a new collision)

The scan blocks entities from **every other already-built country** (NZ + AU + UK + US for IE pages). For IE, three terms were **removed** because they are legitimate Irish terms:
- `disability allowance` — a real IE DSP payment (flagged in H43).
- `statutory sick pay` and `\bssp\b` — **NEW this session.** Ireland has its own SSP under the Sick Leave Act 2022, so both appear legitimately (mainly on Page 2).

**IE scan used this session (swap the filepath per page):**
```
grep -in "kiwisaver\|jobseeker support\|supported living payment\|0800 559 009\|moneytalks\|holidays act\|human rights act 1993\|\bifso\b\|\bpharmac\b\|work and income new zealand\|\bwinz\b\|centrelink\|services australia\|fair work\|superannuation\|moneysmart\|my\.gov\.au\|afca\|1800 931 678\|1800 007 007\|\bpip\b\|universal credit\|\bdwp\b\|macmillan\|citizens advice\|\bacas\b\|moneyhelper\|medicare\|medicaid\|\bssdi\b\|\bssi\b\|\bfmla\b\|\bada\b\|\bcobra\b" <filepath> && echo "CONTAMINATION FOUND" || echo "CLEAN"
```

**`\bpip\b` collision (resolved, not removed):** "Personal Insolvency **P**ractitioner" (a legitimate IE insolvency role) shares the abbreviation with the UK's Personal Independence Payment. Rather than weaken the scan, the **full term is spelled out** in the page and `\bpip\b` stays in the scan to keep guarding against genuine UK PIP contamination. Brief instruction to repeat on any page that mentions ISI/insolvency: *spell out "Personal Insolvency Practitioner", never abbreviate to PIP.*

---

## Diagnosis guide cluster status
- **NZ:** Hub ✅ | Pages 1–5 ✅ — COMPLETE
- **AU:** Hub ✅ | Pages 1–5 ✅ — COMPLETE
- **UK:** Hub ✅ | Pages 1–5 ✅ — COMPLETE
- **US:** Hub ✅ | Pages 1–5 ✅ — COMPLETE (P2–P5 indexing may still be pending from H43 quota hit)
- **IE:** Hub ✅ | Pages 1–5 ✅ — **COMPLETE this session; indexing deferred (quota)**
- **CA:** ⏳ not started — **last remaining country**

---

## Outstanding GSC indexing requests (deferred — quota not reset)
All six IE URLs, plus the carried US pages:
- `cutadrift.org/guides-diagnosis-ie/`
- `cutadrift.org/what-to-do-after-a-serious-diagnosis-ie/`
- `cutadrift.org/serious-illness-work-and-income-ie/`
- `cutadrift.org/financial-help-serious-illness-ie/`
- `cutadrift.org/insurance-claims-after-diagnosis-ie/`
- `cutadrift.org/telling-people-about-your-diagnosis-ie/`
- US Pages 2–5 (from H43): `serious-illness-work-and-income-us`, `financial-help-serious-illness-us`, `insurance-claims-after-diagnosis-us`, `telling-people-about-your-diagnosis-us` — **confirm whether these were ever cleared.**

---

## Next session — START HERE

1. **Request indexing** for all six IE URLs (and any still-pending US pages) once the GSC quota resets.

2. **Build the CA diagnosis guide cluster** — same 6-page structure (hub + 5 pages), same cadence. CA entities: Service Canada, Employment Insurance (EI) Sickness Benefits, Canada Pension Plan Disability (CPP-D), provincial disability programs (e.g. ODSP in Ontario), provincial drug benefit programs, RRSP, provincial human-rights legislation + tribunals, common group insurers (Sun Life, Manulife, Canada Life), provincial insurance regulators + the Financial Consumer Agency of Canada / OmbudService for Life & Health Insurance (OLHI), RDSP, Disability Tax Credit. Page URLs: `guides-diagnosis-ca/`, `what-to-do-after-a-serious-diagnosis-ca/`, `serious-illness-work-and-income-ca/`, `financial-help-serious-illness-ca/`, `insurance-claims-after-diagnosis-ca/`, `telling-people-about-your-diagnosis-ca/`.

   **CA scan adjustments:** (a) **remove `medicare`** — Canada colloquially calls its public health system "Medicare", so it's legitimate on CA pages; (b) **add distinctive IE terms** now that IE is built, so IE content can't leak into CA — candidates: `illness benefit`, `invalidity pension`, `partial capacity benefit`, `department of social protection`, `\bdsp\b`, `citizens information`, `\bmabs\b`, `\bfspo\b`, `\bprsi\b`, `intreo`, `drugs payment scheme`, `long-term illness`, `decision support service`, `sláinte agus tiomáint`. (Tune to avoid false positives — e.g. `\bdsp\b` could be noisy; verify before relying.)

3. **Add a Canada link to the homepage diagnosis row** (`Public/index.html`, `id="guides-diagnosis"`) — position it **after Republic of Ireland and before United States**, to match the bereavement row order (NZ, AU, UK, IE, CA, US). Run as the final step after Page 5 deploys so the hub's links to unbuilt CA pages aren't reachable from the homepage early. After this, the diagnosis cluster is complete across all six countries.

4. **Not Redundant directory pass** — GSC redirect errors should have cleared; check, then proceed with Hotfrog, Yellow NZ, etc.

**Deploy command:** `cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true`
**Order per page:** build (commit + stop) → contamination scan → deploy → request indexing (or defer) → next brief.

---

## Cross-country contamination prevention — guide pages
1. **Research each country from official sources from scratch.** Structure/tone come from the UK page being mirrored; all entity content (agencies, payments, phone numbers, legislation) replaced entirely.
2. **Run the contamination scan before each deploy.** The scan grows as each country is completed (add the new country's distinctive entities to the block list for all subsequent countries).
3. **Watch the tricky sections:** insurance, self-employed, and pension sections are highest-risk.
4. **Per-country scan carve-outs:** IE → remove `disability allowance`, `statutory sick pay`, `\bssp\b`; spell out "Personal Insolvency Practitioner". CA → remove `medicare`; add IE entities.

---

## Outstanding tasks

### ⚡ Priority
1. Request IE (and any pending US) indexing once quota resets.
2. Build CA diagnosis cluster (hub + 5 pages) — last remaining country.
3. Add CA link to homepage diagnosis row (after IE, before US).
4. Not Redundant directory pass — check GSC redirect errors cleared first.

### Carried
5. **Short-diagnosis-response watch** (from H38) — confirm truncated vs brief.
6. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign).
7. **Incapacity family-message invents unsupplied names** ("Gavin") — no-invented-names guard on next incapacity pass.
8. *(Carried: DIWM Phase 3 cover-letter.)*

### Consider / Ongoing
9. **Directory pass for Cut Adrift** (one afternoon, once): Hotfrog, Cylex, Brownbook (cross-country); Yellow NZ, Yell UK, Yellow Pages AU/CA, Yelp US, Golden Pages IE.
10. Diagnosis non-leak residuals (correct, left as-is) — see H38.
11. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known.
12. **Watch: "The Dinner Party" residual in US bereavement.**
13. Mobile click-through still owed on redesigned homepage.
14. Pin "Notifying their employer" heading in bereavement prompt.
15. Tighten `verify_crisis.mjs` Path A assertion.
16. `wrangler.toml` missing `pages_build_output_dir` (non-fatal).
17. Confirm sage favicon at tab size.
18. OG image placeholder.
19. Feedback form → Google Sheet.
20. Not Redundant GSC: validate redirect errors have cleared.

---

## Country-hardening status (all three tools)
- **Incapacity:** all 5 non-NZ countries done (NZ original).
- **Bereavement:** all 6 done (US confirmed clean, H31).
- **Diagnosis:** all 6 done (NZ/AU/UK/IE/CA/US prompt-hardened, H32–H38).

*(Hardening = the tool prompts. The diagnosis **guide pages** are a separate static-content build: NZ/AU/UK/US/IE complete, CA outstanding.)*

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
| 25 | Full homepage visual redesign (clay/sage palette, one clean stylesheet replacing three `!important` layers); site-wide trust-copy fix across 26 pages; incapacity tool per-country hardening (AU/CA/UK/IE/US); bereavement-CA hardened + global no-URL/cross-country guardrails for all six |
| 26 | Bereavement **Australia** hardened. Worker `05a653a4`. |
| 27 | Bereavement **United Kingdom** hardened. Worker `bd4e5ea5`. |
| 28 | Bereavement **Ireland** hardened. Worker `ebf1d4cd`. |
| 29 | Per-IP audit + **global daily counter + Resend alert**. Worker `8c7bbe00`. |
| 30 | Bereavement **United States** hardened — bereavement sweep complete. Worker `960fb7e0`. |
| 31 | **Test-bypass header** added; homepage **gallery** first built; **US bereavement re-test closed**. Worker `afac0f2e`. |
| 32 | **Diagnosis NZ-hardened**. Harness `tests/diag_diagnosis_nz.mjs`; **Worker `a9cafbe7`**; 19/20 clean. |
| 33 | **Homepage proof gallery remapped** to one card per intake situation. Commit `9ed430e`. Flagged: incapacity family-message hallucinated "Gavin". |
| 34 | **Diagnosis AU-hardened**. Harness `tests/diag_diagnosis_au.mjs`; **Worker `84982b2b`**; re-test 12/12 clean. Commit `5f0da4d`. |
| 35 | **Diagnosis UK-hardened**. Harness `tests/diag_diagnosis_uk.mjs`; **Worker `7fd2f854`**; re-test 48/48 clean. Commit `6520b3b`. |
| 36 | **Diagnosis IE-hardened**. Harness `tests/diag_diagnosis_ie.mjs`; **Worker `16006a4b`**; re-test 48/48 clean. |
| 37 | **Diagnosis CA-hardened**. Harness `tests/diag_diagnosis_ca.mjs`; **Worker `ec148b17`**; re-test effectively 47/47. Commit `cec766e`. |
| 38 | **Diagnosis US-hardened** (final). Harness `tests/diag_diagnosis_us.mjs`; **Worker `67c366a5`**; re-test 47/48 → effectively 48/48. **Diagnosis prompt-hardening COMPLETE across all six.** |
| 39 | Homepage gallery redesign. Commit `3bdf9d5`. |
| 40 | SEO/backlink strategy; content gap analysis; NZ diagnosis cluster hub + Pages 1–2. Commits `08e1d10`, `1a203f7`. |
| 41 | Not Redundant GSC redirect errors fixed (`_redirects`, 301s); NZ diagnosis Pages 3–5. Commits `4c9ebec`, `a340aba`, `a5e9fad`. |
| 42 | AU diagnosis cluster complete (hub + Pages 1–5); scan refined (word-boundary; AU entities added). Commits `dc8f132`, `d22adc7`, `d5ccacb`, `f059721`, `c6010a6`. |
| 43 | UK + US diagnosis clusters complete; scan fixed (`myGov`→`my\.gov\.au`); homepage diagnosis section added (NZ/AU/UK/US). US P2–P5 indexing deferred (quota). Commits `56b2cb6`+, `1829c4c`+. |
| 44 | **IE diagnosis cluster complete** — hub + Pages 1–5, all clean, deployed; homepage IE link added. IE scan carve-outs (`disability allowance`, `statutory sick pay`, `\bssp\b`); `\bpip\b`/"Personal Insolvency Practitioner" collision resolved by spelling out. Indexing deferred (quota). Commits `bd4e923`, `334a26b`, `8dcaae7`, `3966c81`, `98d2ed3`, `47f5f1f`, `e0faa42`. **CA is the only country left.** |
