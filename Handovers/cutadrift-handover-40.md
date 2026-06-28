# Cut Adrift — Handover Document 40
**Updated:** 28 June 2026
**Session work:** SEO/backlink strategy research; first two pages of the NZ diagnosis guide cluster built and deployed; NZ diagnosis hub created. Commit `08e1d10`. Pages-only deploy.
**Supersedes:** H39 (kept on disk; not pruned). Cumulative session-history table preserved below.

---

## Project overview / Deploy commands

**Cut Adrift** — a free tool that helps people in the first days after a hard life event (a death, a serious diagnosis, losing capacity to manage affairs). Three tools (`bereavement`, `diagnosis`, `incapacity`/carer), each serving six countries (NZ, AU, UK, IE, CA, US). A Cloudflare Worker holds the system prompts + calls Claude and streams SSE; a static site (`Public/`) is the front end.

**Two separate deploys — do not confuse them:**
- **Worker (the prompts + rate limiter):** `npx wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`. **A prompt change requires THIS deploy.**
- **Static site:** `npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true` (from repo root) → serves `cutadrift.org`. The `wrangler.toml` "missing `pages_build_output_dir`" warning is benign. A pages-only deploy silently leaves the prompt stale; a worker-only deploy is correct for a prompt-only change.
- Per-tool model + token maps live in `worker.js` (`MODELS` / `MAX_TOKENS`). **Diagnosis runs on `claude-sonnet-4-6`, 4000 max_tokens.**

**Test-bypass header (from H31):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04` — skips the per-IP gate + global counter, so testing is free of the public rate limit.

**Current worker version:** `67c366a5` (unchanged this session — no worker deploy).

**Key URL confirmed this session:** the diagnosis tool URL is `/when-you-get-a-diagnosis/` (not `/diagnosis/` — I had this wrong previously; Claude Code corrected it from the real sitemap).

---

## New this session

### SEO / backlink strategy (researched and resolved)

Investigated listing Cut Adrift on Dang.ai and Trustpilot. Conclusion: not worth it. Dang.ai is an AI-gadget directory (wrong audience). Trustpilot links are nofollow and require reviews — not viable for a crisis tool.

**Actual strategy settled on:**
- **Journalist-source platforms** (SourceBottle, HARO revived, Source of Sources) were researched and set up — then ruled out. Wayne doesn't want to be named in media. All journalist-source platforms require a named human source; there's no anonymous version. Channel abandoned.
- **Directories:** one-afternoon job, once. Cross-country ones (Hotfrog, Cylex, Brownbook) plus 2–3 reputable per-country ones (Yellow NZ, Yell UK, Yellow Pages AU/CA, Yelp US, Golden Pages IE). Low priority, do when convenient.
- **Real lever confirmed:** high-intent guide content that ranks for crisis searches. This is what the session pivoted to.

Reference docs saved (not in repo):
- `cutadrift-backlink-shortlist.md` — full directory list per country + journalist platform notes.
- `sourcebottle-pitch-templates.md` — pitch templates (drafted but not needed given decision above; kept for reference).

### Content gap analysis

Key finding: the diagnosis tool and incapacity/carer tool have **no guide content** — only the interactive tools. Zero SEO feeders for two of three tools. Not Redundant is also barely indexed (site: search returns nothing). Full gap map saved as `content-gap-map.md`.

### NZ diagnosis guide cluster — first two pages built

**Pattern:** mirrors the bereavement guide structure exactly (5 pages per country + a hub page). NZ first; clone to other countries once NZ is confirmed ranking.

**Hub:** `Public/guides-diagnosis-nz/index.html` → `cutadrift.org/guides-diagnosis-nz/`
- Title: "New Zealand Diagnosis Guides | Cut Adrift"
- Currently lists one guide; will grow as pages are added.

**Page 1 — live and indexed:**
`Public/what-to-do-after-a-serious-diagnosis-nz/index.html` → `cutadrift.org/what-to-do-after-a-serious-diagnosis-nz/`
- Anchor page for the NZ diagnosis cluster.
- Covers: disclosure obligations, sick leave, Work and Income (Jobseeker Support / Supported Living Payment, 0800 559 009), KiwiSaver serious illness withdrawal, insurance check, Disability Allowance, National Travel Assistance, prescriptions, EPA and will, support contacts.
- Requested indexing in Google Search Console ✅

**Page 2 — drafted, NOT YET DEPLOYED:**
File: `~/Downloads/serious-illness-work-and-income-nz.md` (or saved in outputs from this session)
Target URL: `/serious-illness-work-and-income-nz/`
- Covers: what you must/needn't tell your employer, sick leave (10 days/yr, 20 day max), medical certificate rules, reasonable adjustments (Human Rights Act 1993), Work and Income support, job security rights, self-employed gap, record-keeping.
- **START NEXT SESSION HERE — add this page using the same Claude Code handoff pattern.**

**Sitemap:** updated with both new URLs (`what-to-do-after-a-serious-diagnosis-nz` and `guides-diagnosis-nz`). Page 2 URL not yet in sitemap.

**Commit:** `08e1d10` — "Add NZ diagnosis guide page and hub" — 3 files, 398 insertions.

---

## Next session — START HERE

1. **Deploy page 2** — `serious-illness-work-and-income-nz.md` is ready. Use this Claude Code instruction:

> I have a second NZ diagnosis guide page at `~/Downloads/serious-illness-work-and-income-nz.md`. Add it to the site the same way you added the first diagnosis page — same format, same HTML conversion. Target URL: `/serious-illness-work-and-income-nz/`. Add it to the sitemap, add it to the `/guides-diagnosis-nz/` hub as the second entry, and update the first page (`/what-to-do-after-a-serious-diagnosis-nz/`) to link to it in the "More guides" section at the bottom. Don't deploy — commit and tell me what changed.

Then deploy with: `cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --commit-dirty=true`

Then request indexing in Search Console for: `https://cutadrift.org/serious-illness-work-and-income-nz/`

2. **Build remaining 3 NZ diagnosis pages** (same write-verify-deploy-index pattern):
   - Financial help and benefits during serious illness (NZ)
   - Insurance claims after a diagnosis (NZ)
   - Telling family, work and others about a diagnosis

3. **Once all 5 NZ diagnosis pages are live**, clone the cluster to AU, UK, IE, CA, US (same one-country-at-a-time approach as bereavement hardening).

4. **Add diagnosis section to homepage** — hold until at least 3 countries are built (NZ alone looks sparse).

5. **Check Not Redundant indexing in Search Console** — `site:notredundant.com` returns nothing. Check Pages/Coverage for crawl errors or noindex tags before writing any new content there.

---

## Outstanding tasks

### ⚡ Priority
1. **Deploy diagnosis page 2** (work and income NZ) — see above.
2. **Build remaining NZ diagnosis pages** (3 more).
3. **Short-diagnosis-response watch** (from H38) — confirm truncated vs brief.
4. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign).
5. **Incapacity family-message invents unsupplied names** ("Gavin") — no-invented-names guard on next incapacity pass.
6. *(Carried: DIWM Phase 3 cover-letter; GSC request-indexing for 8 pages.)*

### Consider / Ongoing
7. **Not Redundant indexing** — check GSC before writing content.
8. **Directory pass** (one afternoon, once): Hotfrog, Cylex, Brownbook (cross-country); Yellow NZ, Yell UK, Yellow Pages AU/CA, Yelp US, Golden Pages IE.
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

---

## Country-hardening status (all three tools)
- **Incapacity:** all 5 non-NZ countries done (NZ original).
- **Bereavement:** all 6 done (US confirmed clean, H31).
- **Diagnosis:** NZ ✅, AU ✅, UK ✅, IE ✅, CA ✅, US ✅ — **COMPLETE across all six countries.**

**All three tools are now country-hardened across all six countries.**

## Cross-country contamination prevention — guide pages

Guide pages are static HTML (not AI-generated on the fly), so the risk is copy-paste contamination when adapting one country's page for another — not prompt contamination like the tool hardening. Prevention approach agreed this session:

1. **Research each country from official sources, not by editing another country's page.** The NZ page gives the structure (headings, sections, tone) — all entity content (agency names, payment names, phone numbers, legislation) is replaced from scratch, not carried over.
2. **Quick scan before each country goes live.** Before handing any country's pages to Claude Code, check for NZ-specific entities that shouldn't appear in other countries: "Work and Income," "Jobseeker Support," "KiwiSaver," "Disability Allowance," "0800 559 009," "Holidays Act," "Human Rights Act 1993." Two-minute read, not a test harness.
3. **Watch the tricky sections:** self-employed and insurance sections are highest-risk because some NZ-specific names sound generic. KiwiSaver is the main one — AU has superannuation, UK has pension, CA has RRSP, US has 401(k). Flag these explicitly during research for each country.

This approach means no big post-hoc audit — contamination is caught at the draft stage before publishing.

---

## Diagnosis guide cluster status
- **NZ:** Hub ✅ live | Page 1 (what to do) ✅ live + indexed | Page 2 (work & income) ⏳ drafted, not deployed | Pages 3–5 ⏳ not started
- **AU/UK/IE/CA/US:** ⏳ not started — wait for NZ cluster complete

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
| 40 | **SEO/backlink strategy** researched and resolved (journalist platforms ruled out — Wayne doesn't want named attribution; directory shortlist created). **Content gap analysis** completed — diagnosis and incapacity tools have no guide content; Not Redundant barely indexed. **NZ diagnosis guide cluster started:** hub (`/guides-diagnosis-nz/`) + Page 1 (`/what-to-do-after-a-serious-diagnosis-nz/`) live and indexed. Page 2 (`/serious-illness-work-and-income-nz/`) drafted, not yet deployed. Commit `08e1d10`. |
