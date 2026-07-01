# Cut Adrift — Handover Document 45
**Updated:** 29 June 2026
**Session work:** **Canada (CA) diagnosis guide cluster built and deployed in full** — hub + Pages 1–5, each researched from official Canadian sources, contamination-scanned, committed, and deployed. Homepage diagnosis row updated with a Canada link. **This completes the diagnosis guide cluster across all six countries (NZ, AU, UK, US, IE, CA).** Per-page fact verification caught and fixed a real error on CA Page 1 (see below).
**Supersedes:** H44 (IE cluster) and H43, both kept on disk. Cumulative session-history table preserved below.

---

## Project overview / Deploy commands

**Cut Adrift** — a free tool that helps people in the first days after a hard life event (a death, a serious diagnosis, losing capacity to manage affairs). Three tools (`bereavement`, `diagnosis`, `incapacity`/carer), each serving six countries (NZ, AU, UK, IE, CA, US). A Cloudflare Worker holds the system prompts + calls Claude and streams SSE; a static site (`Public/`) is the front end.

**Two separate deploys — do not confuse them:**
- **Worker (the prompts + rate limiter):** `npx wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`. **A prompt change requires THIS deploy.**
- **Static site:** `cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true` → serves `cutadrift.org`. The `wrangler.toml` "missing `pages_build_output_dir`" warning is benign. A pages deploy uploads the whole `Public/` tree, so a later page's deploy also pushes any earlier un-deployed pages.
- Per-tool model + token maps live in `worker.js` (`MODELS` / `MAX_TOKENS`). **Diagnosis runs on `claude-sonnet-4-6`, 4000 max_tokens.**

**Current worker version:** `67c366a5` (unchanged in H44 and H45 — all guide-cluster work is static pages, no worker deploy).

**Test-bypass header (from H31):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04`.

**Diagnosis tool URL:** `/when-you-get-a-diagnosis/` (not `/diagnosis/`).

**Working cadence (per page):** Claude (chat) researches the country's facts and produces a copyable build brief + contamination-scan command → Wayne pastes the brief into Claude Code → Claude Code builds the page and STOPS (commit only; no deploy/curl/polling) → Wayne runs the scan and the deploy and pastes results back → next brief. Wayne prefers single copyable lines, plain language, no padding.

---

## New this session — CA diagnosis guide cluster (COMPLETE)

Hub + 5 pages all live, fully interlinked, contamination-scanned clean, deployed. Homepage link added. **Indexing deferred for all six (GSC quota).**

**Commits:**
- CA hub `abc1648`
- CA Page 1 `33a21d4`; **Page 1 correction** `3d1b78b` (sick-leave rewrite — see verification note)
- CA Page 2 `d4f3bcf`
- CA Page 3 `4ac5f7f`
- CA Page 4 `69c7479`
- CA Page 5 `044b848` (commit *message* mis-says "US"; the files are correct CA — cosmetic, left as-is)
- Homepage CA diagnosis link `d9ad029`

**Files:** `Public/guides-diagnosis-ca/index.html` + the five page files (`what-to-do-after-a-serious-diagnosis-ca`, `serious-illness-work-and-income-ca`, `financial-help-serious-illness-ca`, `insurance-claims-after-diagnosis-ca`, `telling-people-about-your-diagnosis-ca`), `Public/sitemap.xml`, and `Public/index.html` (homepage diagnosis row + the CA hub cross-linked reciprocally from the NZ/AU/UK/US/IE hubs).

**Page coverage (Canada-specific, federal/provincial split kept explicit throughout):**
- **Hub** — intro framing the federal/provincial split; links to all five CA pages; cross-linked to the other five country hubs.
- **Page 1 (first steps)** — provincial/territorial health insurance ("Medicare": OHIP, RAMQ, MSP, AHCIP) + new-resident waiting periods + 811 nurse line; provincial drug coverage; sick leave/long-term illness leave (see correction); EI sickness benefits; CPP Disability; provincial disability assistance (ODSP/PWD/AISH as examples); DTC → Canada Disability Benefit + RDSP; workers' comp (WSIB/WorkSafeBC); insurance check; powers of attorney are provincial (Ontario POA for property/personal care, BC representation agreement, Quebec protection mandate — no single national instrument); key contacts.
- **Page 2 (work and income)** — no duty to name diagnosis; job-protected long-term illness leave (corrected framing carried from Page 1); duty to accommodate to undue hardship (Canadian Human Rights Act + CHRC federally; provincial human-rights codes/commissions provincially); dismissal protections (discrimination prohibited; frustration-of-contract is a high bar; common-law reasonable notice up to ~24 months; enforceable-termination-clause caveat; unionized employees go through their union/grievance); EI sickness recap; CPP Disability; **self-employed EI gap**; record-keeping; key contacts.
- **Page 3 (financial help)** — provincial drug plans as the MAIN mechanism (Ontario Trillium, BC Fair PharmaCare, Quebec RAMQ) + high-cost/catastrophic programs + manufacturer patient-support; **national pharmacare scoped accurately** (first phase = diabetes + contraception, +menopause HT in BC, only BC/Manitoba/PEI/Yukon, does NOT cover most serious-illness drugs, expansion uncertain); provincial disability assistance (varies — not stated as national); DTC/CDB/RDSP; GST/HST credit; emergency/hardship help + 211; mortgage difficulty + FCAC; debt (non-profit credit counselling; consumer proposal/bankruptcy via a Licensed Insolvency Trustee under the Bankruptcy and Insolvency Act; OSB; FCAC); Medical Expense Tax Credit; Canadian Cancer Society + Road to Recovery; key contacts.
- **Page 4 (insurance claims)** — group vs individual policies; OLHI lost-policy search; **LTD own-occupation vs any-occupation** (own-occ ~first 24 months then any-occ; CPP-D offset; taxability depends on who paid premiums; elimination period); critical illness lump sum + survival period; claim process; **disclosure / material misrepresentation + two-year contestability** (most life/health policies incontestable after 2 years except fraud — verified correct and hedged on the live page); denied-claim route (internal complaint → written **Final Position Letter** → **OLHI** for life/health/disability, non-binding rec; provincial regulator e.g. **FSRA**/Ontario, **AMF**/Quebec for Insurance Act breaches; **GIO** for property/casualty; legal action / disability lawyer); workers' comp cross-ref; key contacts.
- **Page 5 (telling people)** — no general disclosure duty; employer disclosure + human-rights protection; medical privacy at work (no employer access to records / doctor without consent; PIPEDA + provincial health-privacy laws like Ontario's PHIPA; privacy commissioners); **driving framed the Canadian way** (it's the PHYSICIAN's legal duty to report a potentially unfit driver to the provincial licensing authority — mandatory in most provinces, e.g. Ontario s.203 Highway Traffic Act; bodies like RoadSafetyBC / Ontario MTO; the licensing authority decides — NOT a self-reporting duty, NOT DVLA/NDLS); telling Service Canada/CRA; bank/lender (not on credit report); insurer (material facts); family/children (Canadian Cancer Society, Kids Help Phone 1-800-668-6868); care team; right not to tell yet (Canadian Cancer Society 1-888-939-3333, 988 Suicide Crisis Helpline call/text 988, provincial crisis lines, GP).

**Homepage** diagnosis row (`id="guides-diagnosis"`) now reads **New Zealand · Australia · United Kingdom · Republic of Ireland · Canada · United States** — matching the bereavement row. Sitemap has all six CA URLs under a "Canada diagnosis guides" block.

---

## Also this session — tool-link CTA workstream (diagnosis + bereavement guide pages)

[PROBLEM] Wayne spotted that guide pages (SEO entry points) had **no link to the relevant Cut Adrift tool** — traffic dead-ended on static content. Fixed across both clusters; both now funnel to their tool. All deployed.

**Pattern used (mirrors the two already-correct NZ/UK bereavement pages):** each page gets (a) a header "Get your personalised plan →" link (`class="nav-cta"`) and (b) an inline contextual link in the intro ("…answer a few questions and we'll …→"). Country-neutral, contamination-safe. Diagnosis tool href **`/when-you-get-a-diagnosis/`**; bereavement tool href **`/when-someone-dies/`**.

**Commits:**
- `6561ebf` — **36 diagnosis guide pages** (6 hubs `guides-diagnosis-{nz,au,uk,us,ie,ca}` + 30 content pages) got header + inline links to the diagnosis tool. Built via a Python patch script. CA hub already had an intro (link appended); the other 5 hubs had h1 `margin-bottom` normalised 48px→20px and a new intro inserted.
- `9030182` — **diagnosis hub gold-link fix.** The 6 hub inline links rendered in default browser blue/purple because hubs lacked the global `a` colour rule the content pages had. Fix: added `.intro a { color: var(--amber); text-decoration: none; }` (+ hover underline) to each hub — scoped to intro links only, leaving guide-items/breadcrumb/footer/nav-cta untouched.
- `8ab7d38` — **38 bereavement guide pages**, three groups: **Group A (26)** = 6 hubs (`guides-{nz,au,uk,us,ireland,canada}` — note **spelled-out** country names, NOT codes) + 20 new-template content pages → both links added + `.intro a` gold rule; **Group B (12)** = old "Lora" template pages with a `.hero-intro` paragraph and an existing global `a { color: var(--amber) }` rule → inline link appended to `.hero-intro` only, no extra CSS; **Group C (2)** = `what-to-do-when-someone-dies-{nz,uk}` already complete → untouched.

[KEY SLUG GOTCHA] **Bereavement hubs use spelled-out country names** — the actual directories are `guides-au, guides-canada, guides-ireland, guides-nz, guides-uk, guides-us` (note `canada`/`ireland` spelled out, but `au`/`nz`/`uk`/`us` abbreviated) — and bereavement *topic* pages also spell countries out (`ireland-bereavement-leave`, `canada-survivor-benefits`). **Diagnosis** hubs use ISO codes (`guides-diagnosis-{ie,ca,…}`). A verify step here mistakenly checked `guides-ie`/`guides-ca` (codes) for bereavement and hit a (correct) 404 — those bereavement slugs don't exist; the real ones are `guides-ireland`/`guides-canada`. No orphan files were ever created; the patch script had used the spelled-out names correctly. **Lesson: bereavement = spelled-out country, diagnosis = ISO code.**

[VERIFIED LIVE] `guides-ireland/`, `guides-canada/` (Group A hubs, were bare → now both links, gold), `uk-bereavement-leave/` (Group B `.hero-intro`, inline link gold), `what-to-do-when-someone-dies-nz/` (Group C, untouched). Diagnosis hubs (nz/ca + content pages) confirmed gold earlier. Two template families in bereavement (`.intro` vs `.hero-intro`) were handled correctly per-page.

**Both clusters now link to their tool. No outstanding CTA work.** (Deployed across `4035c6fe`, `c03fa3db`, and the gold-fix deploy.)

---

## CA facts locked this session (reuse for verification / future edits)

- **EI sickness benefits:** 55% of earnings, max **$729/week (2026)**, up to **26 weeks** (extended from 15 in Dec 2022), 600 insured hours, medical certificate, ~1-week waiting period; employer issues a Record of Employment (ROE). Administered by Service Canada.
- **CPP Disability:** "severe and prolonged" disability + sufficient contributions; months-long assessment; pays less than maxed EI; converts to retirement pension at 65; appeal route is the Social Security Tribunal.
- **Disability Tax Credit (DTC, Form T2201):** 2026 amount $10,341 (~$1,448 federal reduction); gateway to the Canada Disability Benefit, RDSP (+ Canada Disability Savings Grant/Bond), and Child Disability Benefit.
- **Canada Disability Benefit (CDB):** Service Canada; ages 18–64; requires a valid DTC; **max $200/month, rising to $204 from July 2026**; income-tested; payments began July 2025.
- **Self-employed EI gap:** self-employed get EI sickness ONLY if they registered for EI special benefits with Service Canada and the agreement has been active **≥12 months** (premiums $1.63/$100 to max **$1,123.07** in 2026; Quebec $1.30/$100, max $895.70). If never opted in, no EI sickness — fall back on CPP-D, provincial disability assistance, DTC/CDB, private cover. Special benefits only (no regular EI).
- **Job-protected long-term illness leave (2026):** most provinces now align to EI's 26 weeks — **Ontario 27 weeks** (since June 2025), **BC 27** (Bill 30, in force), **Alberta 27** (from 1 Jan 2026, up from 16), **Saskatchewan 27** (from 1 Jan 2026), **Quebec 26**; federally regulated employees get **10 paid sick days + up to 27 weeks unpaid** under the Canada Labour Code. Short paid/unpaid sick *days* are secondary and vary (BC 5 paid, Quebec 2, several provinces only short unpaid days).
- **Duty to accommodate / dismissal:** to undue hardship under human-rights law (Canadian Human Rights Act + CHRC federally; provincial codes + commissions/tribunals like HRTO provincially); common-law reasonable notice can reach ~24 months; frustration of contract is a high bar.
- **National pharmacare:** Pharmacare Act (Bill C-64) in force Oct 2024; first phase = diabetes meds + contraception (+menopause HT in BC) only; only **BC, Manitoba, PEI, Yukon** signed; **does NOT cover most serious-illness drugs**; Spring 2026 update signals no new funding — expansion uncertain. Drug-cost help runs mainly through **provincial drug plans** (Ontario Trillium, BC Fair PharmaCare, Quebec RAMQ) + private insurance + high-cost programs.
- **Debt/insolvency:** non-profit credit counselling; consumer proposal or bankruptcy via a **Licensed Insolvency Trustee (LIT)** under the Bankruptcy and Insolvency Act; **OSB** regulates LITs; **FCAC** for guidance.
- **Insurance disputes:** internal complaint → written **Final Position Letter** → **OLHI** (OmbudService for Life and Health Insurance — life/health/disability, free, non-binding rec); provincial regulators (**FSRA** Ontario, **AMF** Quebec) for Insurance Act breaches; **GIO** (General Insurance OmbudService) for home/auto/property. LTD own-occ vs any-occ; CPP-D offsets; 2-year incontestability except fraud.
- **Driving:** physician's statutory duty to report potentially unfit drivers to the provincial licensing authority (mandatory in most provinces; Ontario s.203 HTA; RoadSafetyBC, Ontario MTO); licensing authority decides — NOT self-reporting.
- **Privacy & crisis:** health info under PIPEDA + provincial health-privacy (e.g. Ontario PHIPA); 988 Suicide Crisis Helpline (call/text 988); Kids Help Phone 1-800-668-6868; Canadian Cancer Society 1-888-939-3333.

---

## Process lesson reinforced this session

**A CLEAN contamination scan only proves no *other country's* entities leaked in — it says nothing about whether the Canadian facts are correct or current.** Canada was the most error-prone country in the set (federal/provincial split + several 1 Jan 2026 changes). Per-page fact verification (chat-side web searches against official sources, checked against Claude Code's build summary before deploy) caught a real error on **Page 1**: the build led with short sick-*day* counts and stated "Alberta 5 unpaid", missing the ~26–27-week job-protected long-term illness leave that actually matters after a serious diagnosis. Corrected in commit `3d1b78b` before going live. Lesson for any future country edits: keep verifying the specifics, don't trust the scan or the build summary as an accuracy gate.

---

## Contamination scan — CA adaptation

The scan blocks entities from every other built country. For CA: **removed `medicare`** (Canada colloquially calls its public health system "Medicare", so it's legitimate) and **added 11 distinctive IE terms** now that Ireland is built. `\bada\b`, `\bssp\b`-style boundaries kept so "Canada"/legitimate words don't false-match; `\bpharmac\b` is word-bounded so "pharmacare"/"PharmaCare" pass.

**CA scan used this session (swap the filepath per page):**
```
grep -in "kiwisaver\|jobseeker support\|supported living payment\|0800 559 009\|moneytalks\|holidays act\|human rights act 1993\|\bifso\b\|\bpharmac\b\|work and income new zealand\|\bwinz\b\|centrelink\|services australia\|fair work\|superannuation\|moneysmart\|my\.gov\.au\|afca\|1800 931 678\|1800 007 007\|\bpip\b\|universal credit\|\bdwp\b\|macmillan\|citizens advice\|\bacas\b\|moneyhelper\|medicaid\|\bssdi\b\|\bssi\b\|\bfmla\b\|\bada\b\|\bcobra\b\|invalidity pension\|partial capacity benefit\|department of social protection\|citizens information\|\bprsi\b\|intreo\|\bmabs\b\|\bfspo\b\|drugs payment scheme\|long-term illness scheme\|decision support service" <filepath> && echo "CONTAMINATION FOUND" || echo "CLEAN"
```

(IE scan carve-outs from H44 still apply when editing IE pages: remove `disability allowance`, `statutory sick pay`, `\bssp\b`; spell out "Personal Insolvency Practitioner", never "PIP".)

---

## Diagnosis guide cluster status — COMPLETE
- **NZ / AU / UK / US / IE / CA:** Hub ✅ + Pages 1–5 ✅ each. Homepage diagnosis row links all six.
- **The six-country diagnosis guide cluster is finished.** No further diagnosis-cluster build work remains.

---

## Outstanding GSC indexing requests (deferred — quota)
All six CA URLs, all six IE URLs, plus the carried US pages:
- CA: `guides-diagnosis-ca/`, `what-to-do-after-a-serious-diagnosis-ca/`, `serious-illness-work-and-income-ca/`, `financial-help-serious-illness-ca/`, `insurance-claims-after-diagnosis-ca/`, `telling-people-about-your-diagnosis-ca/`
- IE: the six IE URLs (from H44)
- US Pages 2–5 (from H43): `serious-illness-work-and-income-us`, `financial-help-serious-illness-us`, `insurance-claims-after-diagnosis-us`, `telling-people-about-your-diagnosis-us` — **still unconfirmed whether ever cleared.**

---

## Next session — START HERE

1. **GSC indexing backlog.** Once quota resets, request indexing for all six CA URLs, all six IE URLs, and any still-pending US pages. This is the main outstanding operational task now that the build is done.
2. **Not Redundant directory pass** — GSC redirect errors should have cleared; verify, then proceed (Hotfrog, Yellow NZ, etc.).
3. **Cut Adrift directory shortlist** (one afternoon, once): cross-country (Hotfrog, Cylex, Brownbook) + per-country directories.
4. Carried product/QA items below.

**Deploy command:** `cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true`

---

## Cross-country contamination prevention — guide pages
1. **Research each country from official sources from scratch.** Structure/tone come from the UK page being mirrored; all entity content replaced entirely.
2. **Run the contamination scan before each deploy.** The scan grows as each country is completed.
3. **Watch the tricky sections:** insurance, self-employed, pension, and (for federal countries) anything that's actually provincial/state-level.
4. **A clean scan is NOT an accuracy check** — verify the specifics from official sources (see this session's Page 1 catch).
5. **Per-country scan carve-outs:** IE → remove `disability allowance`, `statutory sick pay`, `\bssp\b`; spell out "Personal Insolvency Practitioner". CA → remove `medicare`; IE entities added.

---

## Outstanding tasks

### ⚡ Priority
1. GSC indexing backlog: all CA + all IE + any pending US pages, once quota resets.
2. Not Redundant directory pass (check GSC redirect errors cleared first).
3. Cut Adrift directory shortlist.

### Carried
4. **Short-diagnosis-response watch** (from H38) — confirm truncated vs brief.
5. Homepage design system not yet applied site-wide (guide + tool pages still pre-redesign).
6. **Incapacity family-message invents unsupplied names** ("Gavin") — no-invented-names guard on next incapacity pass.
7. *(Carried: DIWM Phase 3 cover-letter.)*

### Consider / Ongoing
8. Diagnosis non-leak residuals (correct, left as-is) — see H38.
9. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known.
10. **Watch: "The Dinner Party" residual in US bereavement.**
11. Mobile click-through owed on redesigned homepage.
12. Pin "Notifying their employer" heading in bereavement prompt.
13. Tighten `verify_crisis.mjs` Path A assertion.
14. `wrangler.toml` missing `pages_build_output_dir` (non-fatal).
15. Confirm sage favicon at tab size.
16. OG image placeholder.
17. Feedback form → Google Sheet.
18. Homepage LCP: optional polish (hero-image preload + `font-display: swap`) — Core Web Vitals currently 86% good / 0% poor, only the homepage shows ~14% "needs improvement". Not urgent.

---

## Country-hardening status (all three tools)
- **Incapacity:** all 5 non-NZ countries done (NZ original).
- **Bereavement:** all 6 done (US confirmed clean, H31).
- **Diagnosis:** all 6 prompt-hardened (H32–H38).

*(Prompt-hardening = the tool prompts. The diagnosis **guide pages** are a separate static-content build — now COMPLETE for all six countries as of this session.)*

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
| 18 | DIWM Phase 1 (diagnosis employer email + KiwiSaver script); sitemap → 42 URLs; GSC indexing requested for diagnosis tool |
| 19 | DIWM Phase 2 (bereavement leave email + bank letter); bereavement employment question; mandatory "Your work and leave" section; max_tokens → 3000; 6-scenario E2E suite (later lost) |
| 20 | Deceased's employer letter (bereavement) + weeks_ago routing fix + "Notifying their employer" section + DIWM panels |
| 21 | Closed 3 H20 priorities; fixed 4 guide pages missing disclaimers; refreshed homepage copy; began direct Claude Code file editing |
| 22 | Refined homepage hero subhead + footer trust line; verified across breakpoints |
| 23 | DIWM Phase 3: incapacity family-coordination message + question-prep panels; discovered incapacity tool IS the carer tool |
| 24 | Homepage hero/title/meta refresh; distress-adaptive bereavement intake; cleaned up superseded handovers 17–19 |
| 25 | Full homepage visual redesign (clay/sage); site-wide trust-copy fix across 26 pages; incapacity per-country hardening (AU/CA/UK/IE/US); bereavement-CA hardened + global guardrails |
| 26 | Bereavement Australia hardened. Worker `05a653a4`. |
| 27 | Bereavement United Kingdom hardened. Worker `bd4e5ea5`. |
| 28 | Bereavement Ireland hardened. Worker `ebf1d4cd`. |
| 29 | Per-IP audit + global daily counter + Resend alert. Worker `8c7bbe00`. |
| 30 | Bereavement United States hardened — bereavement sweep complete. Worker `960fb7e0`. |
| 31 | Test-bypass header added; homepage gallery first built; US bereavement re-test closed. Worker `afac0f2e`. |
| 32 | Diagnosis NZ-hardened. Worker `a9cafbe7`; 19/20 clean. |
| 33 | Homepage proof gallery remapped. Commit `9ed430e`. Flagged "Gavin" hallucination. |
| 34 | Diagnosis AU-hardened. Worker `84982b2b`; 12/12 clean. Commit `5f0da4d`. |
| 35 | Diagnosis UK-hardened. Worker `7fd2f854`; 48/48 clean. Commit `6520b3b`. |
| 36 | Diagnosis IE-hardened. Worker `16006a4b`; 48/48 clean. |
| 37 | Diagnosis CA-hardened. Worker `ec148b17`; ~47/47. Commit `cec766e`. |
| 38 | Diagnosis US-hardened (final). Worker `67c366a5`; ~48/48. Diagnosis prompt-hardening COMPLETE across all six. |
| 39 | Homepage gallery redesign. Commit `3bdf9d5`. |
| 40 | SEO/backlink strategy; content gap analysis; NZ diagnosis hub + Pages 1–2. Commits `08e1d10`, `1a203f7`. |
| 41 | Not Redundant GSC redirect errors fixed; NZ diagnosis Pages 3–5. Commits `4c9ebec`, `a340aba`, `a5e9fad`. |
| 42 | AU diagnosis cluster complete; scan refined (word-boundary; AU entities added). Commits `dc8f132`, `d22adc7`, `d5ccacb`, `f059721`, `c6010a6`. |
| 43 | UK + US diagnosis clusters complete; scan fixed (`myGov`→`my\.gov\.au`); homepage diagnosis section (NZ/AU/UK/US). US P2–P5 indexing deferred (quota). Commits `56b2cb6`+, `1829c4c`+. |
| 44 | **IE diagnosis cluster complete** — hub + Pages 1–5; homepage IE link. IE scan carve-outs (`disability allowance`, `statutory sick pay`, `\bssp\b`); `\bpip\b`/"Personal Insolvency Practitioner" collision resolved by spelling out. Commits `bd4e923`, `334a26b`, `8dcaae7`, `3966c81`, `98d2ed3`, `47f5f1f`, `e0faa42`. |
| 45 | **CA diagnosis cluster complete — SIX-COUNTRY CLUSTER FINISHED.** Hub + Pages 1–5 + homepage CA link. CA scan: removed `medicare`, added IE entities. **Per-page verification caught & fixed a Page 1 sick-leave error** (`3d1b78b`): led with the ~26–27-week job-protected long-term illness leave instead of short sick-day counts. Verified pharmacare scope, self-employed-EI gap, OLHI/incontestability, physician-duty driving rules. Commits `abc1648`, `33a21d4`, `3d1b78b`, `d4f3bcf`, `4ac5f7f`, `69c7479`, `044b848`, `d9ad029`. **Then: tool-link CTA workstream** — added "Get your personalised plan" header + inline tool links to all 36 diagnosis guide pages (`6561ebf`) + gold-link hub fix (`9030182`), and 38 bereavement guide pages in 3 groups (`8ab7d38`). Both clusters now funnel to their tool. Slug gotcha logged: bereavement hubs = spelled-out country, diagnosis hubs = ISO code. |
