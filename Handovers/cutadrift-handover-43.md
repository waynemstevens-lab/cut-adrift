# Cut Adrift — Handover Document 43
**Updated:** 28 June 2026
**Session work:** UK diagnosis guide cluster (hub + Pages 1–5) and US diagnosis guide cluster (hub + Pages 1–5) built and deployed. Contamination scan pattern fixed (`myGov` → `my\.gov\.au`). GSC quota hit on US indexing — remaining pages need requesting tomorrow. Homepage diagnosis guides section added (NZ, AU, UK, US).
**Supersedes:** H42 (kept on disk; not pruned). Cumulative session-history table preserved below.

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

### UK diagnosis guide cluster — complete

Hub + 5 pages all live, fully interlinked, indexing requested for all pages. All pages passed contamination scan before deploy.

**Key commit:** UK hub `56b2cb6` (4 files — hub, sitemap, AU hub cross-link, NZ hub cross-link). UK Page 1 `9651527`. UK Page 2 `932fdb5`. Pages 3–5 committed and deployed in subsequent steps.

**Hub:** `Public/guides-diagnosis-uk/index.html` → `cutadrift.org/guides-diagnosis-uk/`

**Page 1 — live, indexing requested:**
`Public/what-to-do-after-a-serious-diagnosis-uk/index.html`
- Covers: NHS/GP referral pathways (2WW urgent referral), SSP (eligibility, LEL threshold, 4-day rule, 3 waiting days, 28-week limit, occupational sick pay, SSP1 form), fit notes, Universal Credit and New Style ESA with Work Capability Assessment, PIP (England/Wales/NI) and ADP (Scotland), State Pension NI credits and workplace pension ill-health provisions, insurance check with FOS details, LPA in England/Wales, Continuing/Welfare PoA in Scotland, EPA in NI, key contacts (Macmillan 0808 808 00 00, Citizens Advice, NHS 111, Turn2us, FOS, Acas).

**Page 2 — live, indexing requested:**
`Public/serious-illness-work-and-income-uk/index.html`
- Covers: disclosure obligations (EA2010 auto-disability for cancer/HIV/MS, licensed-role exceptions), SSP (employee eligibility, LEL threshold, 4-day rule, 3 waiting days, 28-week limit, occupational sick pay, SSP1 form), fit notes (7-day self-cert, "not fit" vs "may be fit for work"), reasonable adjustments (EA2010 disability definition, employer duty, examples, EHRC), unfair dismissal (2-year qualifying period, capability dismissal process, disability discrimination from day 1, Acas Early Conciliation, 3-month ET deadline), long-term absence and redundancy, self-employed gap, Universal Credit and New Style ESA (assessment phase, WCA, WRAG vs Support Group, LCWRA addition), Carer's Allowance (35 hours, qualifying benefits, earnings threshold), record-keeping.

**Page 3 — live, indexing requested:**
`Public/financial-help-serious-illness-uk/index.html`
- Covers: NHS prescription charges and exemptions (medical exemption certificate, Prescription Prepayment Certificate, Wales/Scotland/NI free prescriptions), PIP (daily living and mobility components, standard/enhanced rates, PIP2 form process, face-to-face vs paper-based, special rules/SR1 for terminal illness, mandatory reconsideration and tribunal rights, ADP in Scotland), Universal Credit and New Style ESA amounts (assessment rate, WRAG/Support Group, LCWRA element, LCW caveat for post-2017 claimants), pension (NI credits for State Pension, defined benefit ill-health early retirement tiers, defined contribution serious ill-health lump sum and normal minimum age rules with FCA adviser guidance), mortgage help (lender hardship conversation, SMI loan as loan vs grant, waiting period, repayment on sale), Housing Benefit/UC housing element and LHA for renters, Shelter contact, Council Tax reduction (local council, single-person discount, disabled band reduction, SMI disregard, discretionary hardship), charity grants (Macmillan 0808 808 00 00, Turn2us, local hospice funds, condition-specific charities, hospital welfare rights teams), debt help (StepChange 0800 138 1111, National Debtline 0808 808 4000, Citizens Advice, MoneyHelper 0800 138 7777), Breathing Space scheme.

**Page 4 — live, indexing requested:**
`Public/insurance-claims-after-diagnosis-uk/index.html`
- Covers: types of policy (life, trauma/critical illness, TPD, income protection, MPPI, PMI), group schemes through employer, finding forgotten policies (bank statements, old payslips, email files, Unclaimed Assets Register at unclaimedassets.co.uk, ABI tracing service, GOV.UK pension tracing service, previous advisers, mortgage documents), critical illness definition matching (cancer non-invasive exclusions, heart attack biomarker evidence, stroke 24-hour deficit requirement, survival period clause), income protection definitions (own occupation vs suited occupation vs any occupation, deferred period, benefit period, index-linking, proportionate benefit), claim process (notify promptly, claim form, specialist medical report with clinical criteria, supporting docs, signed authority, IME rights), FCA and PRA regulation (ICOBS, register.fca.org.uk), declined claims (FCA internal complaints process 8-week final response, FOS 0800 023 4567, 6-month deadline from final response, binding on insurer, conditional-fee solicitors), no no-fault scheme (employers' liability for work-caused conditions, Industrial Injuries Disablement Benefit IIDB), getting advice (Macmillan 0808 808 00 00, Citizens Advice, FCA-regulated adviser, specialist insurance solicitor).

**Page 5 — live, indexing requested:**
`Public/telling-people-about-your-diagnosis-uk/index.html`
- Covers: no legal obligation in most contexts, telling employer (EA2010 disability definition, only need to say enough for reasonable adjustments, "a medical condition" sufficient), medical confidentiality at work (employer cannot contact GP without written consent, Occupational Health confidentiality, Access to Medical Reports Act 1988 rights), safety-critical roles (CAA for aviation, ORR/Train Drivers Licensing Regulations for rail, MCA medical standards for seafarers, GMC/NMC/GPhC/HCPC fitness to practise obligations, DVLA notification requirements for Group 1 and Group 2 licence holders), telling DWP (required for benefit claims, DWP bound by UK GDPR, cannot share with employer), telling bank/lender (voluntary, unlocks hardship arrangements, health condition not recorded on credit file), telling insurer (prompt notification for claims, Insurance Act 2015 duty of fair presentation for new policies), work-caused illness (no ACC equivalent, employers' liability insurance, occupational disease solicitors, IIDB), telling family (NHS confidentiality/Caldicott Principles, practical considerations, right to wait), children (age-appropriate honesty, Macmillan Cancer Support 0808 808 00 00, YoungMinds, school awareness), care team support (CNS/key worker, hospital social worker, right not to additional cost), right not to tell anyone yet (Macmillan, Samaritans 116 123, Mind 0300 123 3393, GP and NHS Talking Therapies).

---

### US diagnosis guide cluster — complete (indexing partially done; quota hit)

Hub + 5 pages all live, fully interlinked. All pages passed contamination scan before deploy.

**Key commit:** US hub `1829c4c` (5 files — hub, sitemap, UK/AU/NZ hub cross-links). Pages 1–5 committed and deployed in subsequent steps.

**Hub:** `Public/guides-diagnosis-us/index.html` → `cutadrift.org/guides-diagnosis-us/`

**Page 1 — live, indexing requested:**
`Public/what-to-do-after-a-serious-diagnosis-us/index.html`
- Covers: FMLA (50+ employee threshold, 12 months tenure, 12 weeks unpaid protected leave), STD/LTD (employer-provided vs individual), SSDI (work credits, 5-month waiting period, SSA application), SSI (needs-based, no work history), Medicare (SSDI 24-month rule, ESRD pathway, ALS immediate eligibility, Parts A/B/C/D, Medigap, enrollment penalties, medicare.gov), Medicaid (138% FPL expansion, state variation, retroactive eligibility, dual eligible), COBRA (full premium + 2%, 60-day election, 18/36-month windows, retroactive coverage, comparison against ACA marketplace), HSA (triple tax advantage, rollover, Medicare contribution stop), FSA (use-it-or-lose-it, plan-year departure forfeiture), 401(k) early access (10% penalty, hardship distributions, SECURE 2.0 terminal illness exception up to 84 months, Rule of 55, loans up to $50,000), IRA exceptions (medical expenses >7.5% AGI, terminal illness, Roth contribution withdrawal, unemployed health insurance premiums), insurance check (accelerated death benefit/living benefit rider on life insurance, critical illness, individual disability, mortgage protection), legal paperwork (Healthcare Proxy/Medical POA, Living Will/Advance Directive, POLST/MOLST, Durable POA financial, Will — all state-specific, CaringInfo free forms), key contacts (SSA 1-800-772-1213, CancerCare 1-800-813-4673, Patient Advocate Foundation, Benefits.gov, Healthcare.gov, Medicare.gov, NeedyMeds).

**Page 2 — live, indexing NOT YET requested (quota hit on this page):**
`Public/serious-illness-work-and-income-us/index.html`
- Covers: disclosure obligations (ADA does not require naming diagnosis), FMLA (intermittent leave, reduced schedule leave, serious health condition definition, examples of accommodations including extended leave, interactive process requirement, undue hardship, EEOC 1-800-669-4000, 180/300-day filing deadline), wrongful termination (at-will exceptions, ADA, FMLA retaliation, qualified individual requirement, steps if terminated), self-employed gap (no FMLA/STD/LTD/COBRA; SSDI, SSI, individual policies, ACA marketplace, California SDI elective coverage), SSDI application (information needed, ssa.gov/disability, DDS review, Compassionate Allowances, 65–70% initial denial rate, four-level appeals — reconsideration, ALJ hearing, Appeals Council, federal court — 60-day deadlines, contingency attorney fee cap at 25%/set maximum, back pay on approval), SSI interaction (concurrent benefits, SSI as bridge, income exclusions, $2,000 resource limit, SSI-Medicaid automatic enrollment), state PFML programs (CA SDI, NY DBL, NJ TDI, WA PFML, MA PFML, CT Paid Leave, Oregon, Colorado, Delaware/Maryland/Minnesota), record-keeping (FMLA paperwork, written accommodation requests and confirmations, HR communications, pay stubs, SSA correspondence, performance review timing), key contacts (EEOC 1-800-669-4000, DOL WHD 1-866-487-9243, SSA 1-800-772-1213, state labor department, Patient Advocate Foundation).

**Page 3 — live, indexing NOT YET requested (quota hit):**
`Public/financial-help-serious-illness-us/index.html`
- Covers: Medicare Parts A/B/C/D, cost-sharing, out-of-pocket maximums, Medigap, changes to medical debt reporting, CFPB rules status, lawsuits still possible even off report; HSA spending (complete eligible expense list including COBRA premiums while unemployed, Medicare premiums, transport, OTC drugs, self-reimbursement from prior years, post-Medicare no-new-contributions rule); 401(k)/IRA early access (SECURE 2.0 terminal illness 84-month exception, 7.5% AGI medical expense exception, Rule of 55, 72(t)/SEPP structure, fee-only advisor via NAPFA); mortgage/rent (servicer contact before missing payment, CFPB loss mitigation rules, forbearance options by loan type, deferral for Fannie/Freddie, HUD counselors 1-800-569-4287, emergency rental assistance); LIHEAP (60% state median / 150% FPL eligibility, acf.hhs.gov, seasonal funding warning, utility company medical baseline rates, Lifeline FCC phone/internet discount); grants (CancerCare, PAF Co-Pay Relief, HealthWell Foundation, PAN Foundation, NeedyMeds, disease-specific foundations, ACS Hope Lodge, pharmaceutical PAPs via RxAssist, Extra Help, Benefits.gov); debt management (NFCC 1-800-388-2227, Legal Aid via lawhelp.org, FDCPA rights, CFPB complaint filing, bankruptcy Chapter 7/13 as last resort); key contacts (SSA, Medicare 1-800-633-4227, Healthcare.gov, PAF, HUD counselors, NFCC, NeedyMeds, CFPB, LIHEAP).

**Page 4 — live, indexing NOT YET requested (quota hit):**
`Public/insurance-claims-after-diagnosis-us/index.html`
- Covers: types of policy (life, critical illness/specified disease, individual disability, employer group LTD, mortgage protection, AD&D), employer group plans (HR/benefits portal, SPD, COBRA continuation), finding forgotten policies (bank statements, payroll deductions, unclaimed.org, NAIC Life Insurance Policy Locator), critical illness/specified disease (definition matching, elimination periods, lump sum vs reimbursement, pre-existing condition lookback), disability insurance (own/suited/modified own-occupation, elimination period, benefit period, residual/partial), claim process (notify promptly, attending physician statement APS, insurer IME rights), state insurance department regulation vs federal ERISA, state insurance department complaints, NAIC naic.org/state_contacts.htm, ERISA plans regulated by DOL EBSA 1-866-444-3272 not state departments, declined claims (ACA health plan internal appeal — 180 days, 30/60 day decision timeframes; ERISA 45-day appeal deadline; external review for ACA health plans via IRO, binding on insurer; non-ERISA individual policy litigation under state contract and bad faith law — punitive damages possible; ERISA litigation — arbitrary and capricious standard, limited to administrative record, no punitive damages; American Association for Justice referral); workers' compensation (state-administered, occupational disease coverage — mesothelioma/asbestos, chemical exposure; exclusive employer remedy; work-causation requirement strictly enforced; personal injury litigation for third-party fault — manufacturers, toxic tort, pharmaceutical liability, statutes of limitations warning); getting help (SHIP at shiphelp.org, PAF 1-800-532-5274, state insurance department, DOL EBSA, insurance attorneys on contingency, ERISA attorneys, NAIC Policy Locator).

**Page 5 — live, indexing NOT YET requested (quota hit):**
`Public/telling-people-about-your-diagnosis-us/index.html`
- Covers: no general legal obligation, telling employer (ADA no specific diagnosis required — "serious illness affecting income" sufficient), insurer claims (full disclosure required, material misrepresentation risks rescission), new coverage applications (duty to disclose material conditions), ACA marketplace exception (no health status underwriting), employer group HIPAA exception (no health status discrimination), workers' comp (work-caused illness, separate from employment disclosure), family (no legal obligation, HIPAA protects records from family without authorization except emergency, social work help for difficult conversations, advance directive/healthcare proxy importance), children (age-appropriate honesty rationale, detailed guidance by age group — under 5, school-age, teenagers; school counselor option with permission; American Cancer Society, CancerCare for Kids, KidsHealth, NCI), care team (oncology LCSW — clinical professional, not just crisis counselor; patient navigator; no additional cost), right not to disclose (HIPAA protection, managing leave without naming diagnosis, confidential support — CancerCare 1-800-813-4673, 988 Lifeline, Crisis Text Line HOME to 741741, Mental Health America, NAMI 1-800-950-6264).

---

### Homepage — diagnosis guides section added

`Public/index.html` — new `<section class="guides" id="guides-diagnosis">` inserted between the bereavement guides row and the mission statement. Matches the bereavement guides section style exactly (same heading style, same country-link row layout). Intro line: "A serious diagnosis brings immediate decisions about work, money, and who to tell. These guides walk you through the first steps — specific to where you live." Four links: New Zealand, Australia, United Kingdom, United States. Ireland and Canada omitted (not yet live). New `.guides-desc` CSS class added to style block. One file changed: `Public/index.html`. Deployed and confirmed live.

IE and CA links will be added to this section once their clusters are built.

---

### Contamination scan — updated this session

**False positive fixed:** `myGov` was matching `mygov.scot` (legitimate Scottish government URL). Pattern tightened to `my\.gov\.au`.

**Current scan for IE, CA pages** (blocks NZ + AU + UK + US entities — expand as each country is completed):

```
grep -in "kiwisaver\|jobseeker support\|supported living payment\|0800 559 009\|moneytalks\|holidays act\|human rights act 1993\|\bifso\b\|\bpharmac\b\|work and income new zealand\|\bwinz\b\|disability allowance\|centrelink\|services australia\|fair work\|superannuation\|moneysmart\|my\.gov\.au\|afca\|1800 931 678\|1800 007 007\|statutory sick pay\|\bssp\b\|\bpip\b\|universal credit\|\bdwp\b\|macmillan\|citizens advice\|\bacas\b\|moneyhelper\|medicare\|medicaid\|\bssdi\b\|\bssi\b\|\bfmla\b\|\bada\b\|\bcobra\b" <filepath> && echo "CONTAMINATION FOUND" || echo "CLEAN"
```

Notes:
- "disability" alone is not in the scan — too generic. `disability allowance` (as a phrase) is the blocked NZ form.
- **IE pages:** "Disability Allowance" IS a legitimate IE DSP payment — remove it from the scan for IE pages.
- **CA pages:** Canada colloquially calls its public health system "Medicare" — remove `medicare` from the scan for CA pages, or verify any hit is genuinely US-origin content.

---

## Next session — START HERE

1. **Request indexing for remaining US pages** (GSC quota reset overnight):
   - `cutadrift.org/serious-illness-work-and-income-us/`
   - `cutadrift.org/financial-help-serious-illness-us/`
   - `cutadrift.org/insurance-claims-after-diagnosis-us/`
   - `cutadrift.org/telling-people-about-your-diagnosis-us/`

2. **Build IE diagnosis guide cluster** — same 6-page structure (hub + 5 pages). IE entities: Department of Social Protection (DSP), Illness Benefit, Disability Allowance (IE version — different from NZ), Partial Capacity Benefit, Carer's Allowance (IE), HSE (Health Service Executive), Citizens Information, MABS (Money Advice and Budgeting Service), Revenue Commissioners, Financial Services and Pensions Ombudsman (FSPO), occupational pension. Page URLs: `guides-diagnosis-ie/`, `what-to-do-after-a-serious-diagnosis-ie/`, `serious-illness-work-and-income-ie/`, `financial-help-serious-illness-ie/`, `insurance-claims-after-diagnosis-ie/`, `telling-people-about-your-diagnosis-ie/`.

   **Note:** "Disability Allowance" IS a valid IE term (DSP payment) — remove it from the scan when building IE pages, or create an IE-specific scan that only catches the NZ form.

3. **Build CA diagnosis guide cluster** — after IE. CA entities: Service Canada, Employment Insurance (EI) Sickness Benefits, Canada Pension Plan Disability (CPP-D), provincial disability programs, provincial drug benefit programs, RRSP, provincial human rights legislation, Sun Life/Manulife (common group insurers), FSRA (Ontario), Financial Consumer Agency of Canada.

4. **Add IE and CA links to homepage diagnosis section** — once those clusters are built, add them to the `guides-diagnosis` section in `Public/index.html`.

5. **Not Redundant directory pass** — GSC redirect errors should have cleared; check and proceed with Hotfrog, Yellow NZ, etc.

**Deploy command:** `cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true`

**Order for each new page:** commit → contamination scan → deploy → request indexing → next brief.

---

## Outstanding tasks

### ⚡ Priority
1. **Request remaining US indexing** (quota reset — do at start of next session).
2. **Build IE diagnosis cluster** (hub + 5 pages).
3. **Build CA diagnosis cluster** (hub + 5 pages).
4. **Add IE/CA links to homepage diagnosis section** — once those clusters are built.
5. **Not Redundant directory pass** — check GSC redirect errors cleared first.

### Carried
6. **Short-diagnosis-response watch** (from H38) — confirm truncated vs brief.
7. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign).
8. **Incapacity family-message invents unsupplied names** ("Gavin") — no-invented-names guard on next incapacity pass.
9. *(Carried: DIWM Phase 3 cover-letter; GSC request-indexing for 8 pages.)*

### Consider / Ongoing
10. **Directory pass for Cut Adrift** (one afternoon, once): Hotfrog, Cylex, Brownbook (cross-country); Yellow NZ, Yell UK, Yellow Pages AU/CA, Yelp US, Golden Pages IE.
11. Diagnosis non-leak residuals (correct, left as-is) — see H38.
12. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known.
13. **Watch: "The Dinner Party" residual in US bereavement.**
14. Mobile click-through still owed on redesigned homepage.
15. Pin "Notifying their employer" heading in bereavement prompt.
16. Tighten `verify_crisis.mjs` Path A assertion.
17. `wrangler.toml` missing `pages_build_output_dir` (non-fatal).
18. Confirm sage favicon at tab size.
19. OG image placeholder.
20. Feedback form → Google Sheet.
21. GSC indexing queue; diagnosis guide pages (ongoing as built).
22. Not Redundant GSC: validate redirect errors have cleared.

---

## Country-hardening status (all three tools)
- **Incapacity:** all 5 non-NZ countries done (NZ original).
- **Bereavement:** all 6 done (US confirmed clean, H31).
- **Diagnosis:** NZ ✅, AU ✅, UK ✅, IE ✅, CA ✅, US ✅ — **COMPLETE across all six countries.**

**All three tools are now country-hardened across all six countries.**

## Cross-country contamination prevention — guide pages

Guide pages are static HTML. Risk is copy-paste contamination when adapting one country for another. Prevention:

1. **Research each country from official sources from scratch.** Structure and tone come from NZ; all entity content (agencies, payments, phone numbers, legislation) replaced entirely.
2. **Run contamination scan before each deploy.** Use the scan command in "Next session" above.
3. **Watch the tricky sections:** insurance, self-employed, and pension/super sections are highest-risk.
4. **IE/CA scan adjustments:** see notes under the scan command above.

---

## Diagnosis guide cluster status
- **NZ:** Hub ✅ | Pages 1–5 ✅ all live, indexing requested — **COMPLETE**
- **AU:** Hub ✅ | Pages 1–5 ✅ all live, indexing requested — **COMPLETE**
- **UK:** Hub ✅ | Pages 1–5 ✅ all live, indexing requested — **COMPLETE**
- **US:** Hub ✅ | Pages 1–5 ✅ all live, indexing requested for P1 only; P2–P5 need requesting (quota hit) — **COMPLETE**
- **IE:** ⏳ not started — next
- **CA:** ⏳ not started — after IE

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
| 43 | **UK diagnosis guide cluster complete** — hub + Pages 1–5. Commits `56b2cb6`, `9651527`, `932fdb5` + 3 more. **US diagnosis guide cluster complete** — hub + Pages 1–5. Commit `1829c4c` + 5 more. Contamination scan fixed (`myGov` → `my\.gov\.au`; UK entities added for US+ pages). **Homepage diagnosis guides section added** (NZ, AU, UK, US). GSC quota hit — US Pages 2–5 indexing deferred to next session. |
