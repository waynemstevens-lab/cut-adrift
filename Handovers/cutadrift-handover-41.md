# Cut Adrift — Handover Document 41
**Updated:** 28 June 2026
**Session work:** Not Redundant GSC redirect errors diagnosed and fixed. NZ diagnosis guide cluster completed — Pages 3, 4, and 5 built and deployed. Commits `4c9ebec`, `a340aba`, `a5e9fad`. Pages-only deploys.
**Supersedes:** H40 (kept on disk; not pruned). Cumulative session-history table preserved below.

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

### Not Redundant — GSC redirect errors diagnosed and fixed

**Investigation:** `site:notredundant.com` returns nothing — not a zero-indexing problem. GSC shows 12 pages indexed and 11 not indexed (3 reasons). The real problem was 8 "Redirect error" URLs.

**Root cause:** Google had crawled `.html` extension variants of all the country pages (e.g. `/job-loss-nz.html`, `/job-loss-au.html`, `/cv.html`, `/budget.html` etc.) — probably from old internal links. These had no clean redirect target, causing crawl errors for 8 URLs.

**Fix:** `_redirects` file added to `Public/` with 301s for all 8 URLs:
```
/job-loss-nz.html /job-loss-nz 301
/job-loss-au.html /job-loss-au 301
/job-loss-uk.html /job-loss-uk 301
/job-loss-us.html /job-loss-us 301
/job-loss-canada.html /job-loss-canada 301
/job-loss-ireland.html /job-loss-ireland 301
/cv.html /cv 301
/budget.html /budget 301
```
Deployed to `firststeps` project. Verified `HTTP/2 301` working on `/job-loss-nz.html`. GSC "Validate Fix" button hit on the redirect error row — errors should clear within a week or two.

**Other findings from the diagnostic:**
- No `noindex` header, no `noindex` meta tag, robots.txt fully open (`Allow: /`), sitemap returns 200 with 11 correct URLs.
- Homepage title is in static HTML but H1 is JS-rendered (React). Google can render JS but deprioritises sites with no inbound links.
- Canonical tag is correct (`https://notredundant.com/`).
- **Root cause of low indexing:** no backlinks → Google deprioritises JS rendering. Directory pass (Yellow NZ, Hotfrog etc.) is the fix.
- Note: "No referring sitemaps detected" showing in GSC for new Cut Adrift pages — this is a known lag after fresh deploy, not an error. Resolves within a day or two.

### NZ diagnosis guide cluster — completed

All 5 pages now live. The cluster is fully interlinked: hub lists all 5, each page has a "More guides" related-links section pointing forward and back.

**Page 3 — live, indexing requested:**
`Public/financial-help-serious-illness-nz/index.html` → `cutadrift.org/financial-help-serious-illness-nz/`
- Covers: insurance policies to check (income protection, trauma/critical illness, TPD, mortgage protection, group schemes), KiwiSaver serious illness and hardship withdrawals, Disability Allowance, Community Services Card, prescription costs (PHARMAC co-payment, High Use Health Card), National Travel Assistance, bank/lender hardship provisions, IRD mid-year income drop and student loan relief, condition-specific charity grants (Cancer Society, Heart Foundation), MoneyTalks 0800 345 123, Citizens Advice Bureau, Sorted.org.nz.
- Commit `4c9ebec` (4 files, 287 insertions).

**Page 4 — live, indexing requested:**
`Public/insurance-claims-after-diagnosis-nz/index.html` → `cutadrift.org/insurance-claims-after-diagnosis-nz/`
- Covers: types of policy (life, trauma/critical illness, TPD, income protection, mortgage protection, group schemes), finding forgotten policies (payslips, KiwiSaver provider, mortgage lender), what "trauma" triggers mean (definition must match policy wording), how to make a claim, what insurers can/can't do (FMA oversight), declined claims (IFSO ombudsman, free, 0800 888 202), ACC clarification (injury not illness), no-fault ACC context, getting help from a financial adviser.
- Commit `a340aba` (4 files, 295 insertions).

**Page 5 — live, indexing requested:**
`Public/telling-people-about-your-diagnosis-nz/index.html` → `cutadrift.org/telling-people-about-your-diagnosis-nz/`
- Covers: no legal obligation to disclose in most contexts, telling your employer (only if affects safe work performance; "a medical condition" is sufficient), Privacy Act 2020 at work, safety-sensitive role exceptions, telling Work and Income (required for benefits, they're Privacy Act bound), telling bank (voluntary, may unlock hardship earlier), ACC (injury not illness), telling insurers when claiming, telling family (personal not legal), children and young people, support for difficult conversations (GP, specialist, Te Whatu Ora social workers), right not to tell anyone yet.
- Commit `a5e9fad` (4 files, 302 insertions).

---

## Next session — START HERE

1. **Clone NZ diagnosis cluster to AU** — same 5-page structure, all entity content replaced with AU-specific sources from scratch (do not edit NZ pages; research AU independently). AU entities to use: Centrelink, Services Australia, Fair Work Ombudsman, superannuation (not KiwiSaver), National Disability Insurance Scheme (NDIS), Medicare, myGov, Cancer Council Australia, Australian Financial Complaints Authority (AFCA). Page URLs: `guides-diagnosis-au/`, `what-to-do-after-a-serious-diagnosis-au/`, `serious-illness-work-and-income-au/`, `financial-help-serious-illness-au/`, `insurance-claims-after-diagnosis-au/`, `telling-people-about-your-diagnosis-au/`.

   **Contamination watch for AU:** before each page goes live, scan for NZ-specific entities that must not appear: "Work and Income", "Jobseeker Support", "Supported Living Payment", "KiwiSaver", "Disability Allowance", "0800 559 009", "Holidays Act", "Human Rights Act 1993", "PHARMAC", "MoneyTalks", "IFSO". Quick two-minute read per page before handing to Claude Code.

2. **After AU is live:** continue UK, IE, CA, US in the same order.

3. **Add diagnosis section to homepage** — hold until at least 3 countries are built (NZ alone looks sparse).

4. **Not Redundant directory pass** — once GSC redirect errors clear, add notredundant.com to Hotfrog, Yellow NZ, and other directory shortlist entries (same list as Cut Adrift). This is the main lever for getting Google to prioritise JS rendering of the site.

**Claude Code instruction template for each new page:**
> Add the page the same way you added previous diagnosis pages — same format, same HTML structure. Research all entity content from official AU sources from scratch — do not copy NZ content. Add it to the sitemap, the hub, and link it from the previous page. Then STOP: commit and tell me exactly which files changed. Do NOT deploy, do NOT curl or verify whether anything is live, and do NOT start any background polling loops. Deployment and verification are my manual steps.

Deploy command: `cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true`

---

## Outstanding tasks

### ⚡ Priority
1. **Clone NZ diagnosis cluster to AU** (5 pages + hub).
2. **Not Redundant directory pass** — Hotfrog, Yellow NZ etc. to build backlinks and prompt Google to index the JS-rendered content.
3. **Short-diagnosis-response watch** (from H38) — confirm truncated vs brief.
4. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign).
5. **Incapacity family-message invents unsupplied names** ("Gavin") — no-invented-names guard on next incapacity pass.
6. *(Carried: DIWM Phase 3 cover-letter; GSC request-indexing for 8 pages.)*

### Consider / Ongoing
7. **Add diagnosis section to homepage** — hold until 3 countries have guide clusters live.
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
20. Not Redundant GSC: validate fix on redirect error row (hit already; check next session that errors have cleared).

---

## Country-hardening status (all three tools)
- **Incapacity:** all 5 non-NZ countries done (NZ original).
- **Bereavement:** all 6 done (US confirmed clean, H31).
- **Diagnosis:** NZ ✅, AU ✅, UK ✅, IE ✅, CA ✅, US ✅ — **COMPLETE across all six countries.**

**All three tools are now country-hardened across all six countries.**

## Cross-country contamination prevention — guide pages

Guide pages are static HTML (not AI-generated on the fly), so the risk is copy-paste contamination when adapting one country's page for another. Prevention approach:

1. **Research each country from official sources, not by editing another country's page.** The NZ page gives the structure (headings, sections, tone) — all entity content (agency names, payment names, phone numbers, legislation) is replaced from scratch, not carried over.
2. **Quick scan before each country goes live.** Check for NZ-specific entities: "Work and Income," "Jobseeker Support," "KiwiSaver," "Disability Allowance," "0800 559 009," "Holidays Act," "Human Rights Act 1993," "PHARMAC," "MoneyTalks," "IFSO." Two-minute read, not a test harness.
3. **Watch the tricky sections:** self-employed and insurance sections are highest-risk. KiwiSaver is the main contamination risk — AU has superannuation, UK has pension, CA has RRSP, US has 401(k).

---

## Diagnosis guide cluster status
- **NZ:** Hub ✅ | Page 1 (what to do) ✅ indexed (confirmed H40) | Page 2 (work & income) ✅ live, indexing requested this session | Page 3 (financial help) ✅ live, indexing requested | Page 4 (insurance claims) ✅ live, indexing requested | Page 5 (telling people) ✅ live, indexing requested — **NZ COMPLETE**
- **AU:** ⏳ not started — next
- **UK/IE/CA/US:** ⏳ not started — after AU

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
| 40 | **SEO/backlink strategy** researched and resolved (journalist platforms ruled out; directory shortlist created). **Content gap analysis** completed. **NZ diagnosis guide cluster:** hub + Page 1 + Page 2 built and deployed. Commits `08e1d10`, `1a203f7`. |
| 41 | **Not Redundant GSC redirect errors** diagnosed (8 `.html` extension URLs) and fixed (`_redirects` file, 301s, deployed, validate fix submitted). **Page 2 GSC indexing requested** (carried from H40). **NZ diagnosis cluster completed:** Pages 3 (financial help), 4 (insurance claims), 5 (telling people) built, deployed, indexing requested. Commits `4c9ebec`, `a340aba`, `a5e9fad`. NZ cluster fully interlinked. |
