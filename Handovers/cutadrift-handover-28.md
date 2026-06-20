# Cut Adrift — Handover Document 28
**Updated:** 21 June 2026
**Session work:** Per-country anti-hallucination hardening of the **bereavement tool for Ireland** — continuing the sweep (incapacity all done; bereavement now Canada + Australia + UK + **Ireland**). Same method as the UK pass (Handover 27): live `curl` diagnostic (chronic + acute), independent web-verification of every contact/figure, a verified-contacts Ireland block, deploy, and re-test at scale.
**Supersedes:** Handover 27

---

## Project overview / Deploy commands

*(Unchanged — see Handover 24/25. The **Worker** holds the prompt → any prompt change needs `wrangler deploy`. Worker URL: `https://cutadrift-engine.waynemstevens.workers.dev/`.)*

---

## Work this session — bereavement Ireland hardened

### Diagnostic (live chronic + acute, country=ie)

Built `tests/diag_bereavement_ie.mjs` (reusable; same shape as the AU/UK ones). Chronic = Path C executor handling an estate from abroad; acute = Path B sudden death, next-24-hours. Ireland had **more fabrication than the UK**.

**Findings (raw), all web-verified before acting:**
- **Fabricated / retired-prefix phone numbers** (Ireland decommissioned the 1890/1850/076/0761 ranges): Revenue given `1890 475 475` + `01 738 4300`; Dept of Social Protection given `0761 07 6000`; Samaritans given `1800 304 304` (it's **116 123**); Rainbows Ireland given a mobile `085 873 0101` (it's **01 473 4175**); and (post-first-deploy) the Probate Office given `01 888 6100`.
- **Fabricated domain:** `probateonline.ie`.
- **Stale / wrong tax facts:** CAT threshold "≈€16,000" (current **€400k / €40k / €20k** Group A/B/C, 33%); CAT deadline "within 4 months of death" (it's **pay-and-file by 31 Oct in the year after the valuation date**, **Form IT38**); fabricated form **"IT6"** (the probate tax form is **SA.2 Statement of Affairs (Probate)**).
- **Wrong registration window:** "within 3 days" (Ireland is **3 months** — the model used the UK figure).
- **Overstated leave:** "entitled to bereavement leave under Irish law" — Ireland has **no statutory bereavement-leave entitlement** (~3 days is employer custom; the only statutory-adjacent is force majeure leave).
- **Missing best national line:** the **Irish Hospice Foundation Bereavement Support Line `1800 80 70 77`** (HSE partnership) was never offered; children's bereavement was misrouted to the "Irish Association for Palliative Care" instead of **Barnardos `01 473 2110`**.
- **No cross-country contact leaks** — the global bans held.

### Fix — new "Ireland content" block (`worker.js`)
- **Verified contacts, phone-first:** Citizens Information `0818 07 4000` (route DSP/social-welfare here — gov.ie's own bereavement guide does; name the **Widowed/Surviving Civil Partner Grant** but send them to CI for the amount); Irish Hospice Foundation Bereavement Support Line `1800 80 70 77`; Samaritans `116 123`; Pieta `1800 247 247` (suicide-specific); children → Barnardos `01 473 2110` / Rainbows `01 473 4175`.
- **Suppress the numbers the model invents:** no Revenue phone (→ MyEnquiries on revenue.ie), no Probate Office phone (→ courts.ie / Citizens Information); ban any 1890/1850/076/0761 number.
- **Correct terminology/figures:** Grant of Probate / Letters of Administration via the Probate Office / District Probate Registry (High Court); **SA.2** (not "IT6"); **CAT** (not "Inheritance Tax") @ 33%, Group A €400k / B €40k / C €20k, **IT38**, deadline 31 Oct after valuation date; registration **3 months**; PPS not NI number; property via landdirect.ie.
- **Bereavement leave:** no statutory entitlement (~3 days employer custom).
- **Bans:** fabricated/retired numbers, `probateonline.ie`, and any UK/NZ/AU/CA service relabelled as "the Irish equivalent".
- Country clause now names Ireland as supported in detail.

### Verification — and the rate-limit caveat
Two deploy iterations (the first surfaced the Probate Office phone + `probateonline.ie`, which the second suppressed). Across **~11 real content-producing runs against the final deploy**, every run was clean once **scanner false positives** were excluded — and those are worth recording for the US/diagnosis passes:
- **"District Probate Registry"** — a genuine Irish term (≠ a UK "Probate Registry" leak).
- **"CAT — Ireland's inheritance tax"** — a correct plain-language gloss, not a wrong-country term.
- **"€16,500"** — correct CAT *math* (33% of a €50k excess over the €400k threshold), not the stale threshold.
- **"around 3 days"** — the *allowed* compassionate-leave custom, correctly framed with "no statutory bereavement leave".

**Heavy Worker rate-limiting** set in after ~30+ test calls this session — most large-batch runs returned empty, and one crashed on ECONNRESET. Paced calls (7–9s apart) + retry-on-empty were needed; even so, sampling was limited. The clean real runs plus context-verified resolution of every flag are the basis for closing. Final **Worker version `ebf1d4cd`**.

---

## Commits this session

| Commit | Message |
|---|---|
| `e577caa` | Harden bereavement prompt: Ireland block (verified contacts + CAT/probate terminology) (adds `tests/diag_bereavement_ie.mjs`) |

Committed to `main` locally; **production Worker already deployed**. **`git push` not yet run** — push to sync `origin/main` when ready.

---

## Outstanding tasks

### ⚡ Priority
1. **Finish the bereavement sweep, then the diagnosis tool.** Status: incapacity = all 5 non-NZ done; bereavement = **Canada + Australia + UK + Ireland done**; all six shielded by the global guardrails.
   - **Bereavement United States — the last country.** Needs the full chronic + acute pass. Use `tests/diag_bereavement_ie.mjs` as the template (swap `country`, scenarios, LEAK/GOOD lists). US specifics to verify: probate is **state-based** (no national probate office/fee — likely suppress + search-pattern like CA incapacity); Social Security Administration death notification (often done by the funeral director; SSA 1-800-772-1213 — verify); no national death-notification service; grief lines need verification before baking in; "executor"/"administrator" + state probate court; estate vs inheritance tax varies by state. Watch for UK leaks now that UK/IE are detailed (HMRC, Tell Us Once, CAT, "inheritance tax").
   - **Diagnosis tool — untouched.** No country blocks, no URL/cross-country guardrails. Next *tool* once bereavement is closed.
2. **Homepage design system not yet applied site-wide** (guides + tool pages still pre-redesign). Carried.
3–6. *(Carried: DIWM Phase 3 #3 cover-letter; capture stubbed-test payloads; GSC request-indexing for 8 pages; apply homepage design system site-wide.)*

### Consider / Ongoing
7. Pin "Notifying their employer" heading in the bereavement prompt. 8. Tighten `verify_crisis.mjs` Path A assertion. 9. `wrangler.toml` missing `pages_build_output_dir` (non-fatal). 10. Confirm sage favicon at tab size. 11. **Outreach follow-up (5 bereavement orgs) was due week of 23 June 2026 — now ~2 days out.** 12. OG image placeholder. 13. Feedback form → Google Sheet. 14–17. *(Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages — see H25.)*

---

## Method reminders (carry forward to bereavement US + diagnosis)
- **Verify every "correct" claim independently** (this session: Revenue has no public CAT phone; CAT €400k/IT38/31-Oct; SA.2 not "IT6"; registration 3 months; no statutory IE bereavement leave; 1890/076 prefixes retired).
- **Suppress where the model invents** (Revenue/Probate Office phones, retired prefixes) — give a verified national signposting line instead (Citizens Information for IE).
- **Sample large but mind the rate limit.** The Worker throttles hard after a lot of calls in one session; pace calls (~8s) and retry on empty. Budget testing across time if needed.
- **Tune the scanner per country to avoid false positives** — each country has legitimate terms that look like leaks (IE "District Probate Registry"; "CAT — Ireland's inheritance tax"; correct tax *calculations* that contain euro figures; the allowed "~3 days" leave custom).
- **Explicit wrong-value bans beat positive guidance** for sticky errors (name the exact bad number/form/domain).
- **Deploy = `wrangler deploy`** (Worker holds the prompt).

---

## Session history summary
*(See Handover 25 for sessions 1–25.)*

| Session | Key work |
|---------|----------|
| 25 | Homepage redesign; per-country incapacity hardening (AU/CA/UK/IE/US); bereavement Canada + global guardrails. |
| 26 | Bereavement **Australia** hardened. Worker `05a653a4`. |
| 27 | Bereavement **United Kingdom** hardened (E&W/Scotland/NI probate split; Tell Us Once; IHT205-abolished/£300/£16/£12.50; large-sample testing lesson). Worker `bd4e5ea5`. |
| 28 | Bereavement **Ireland** hardened — verified contacts (Citizens Information 0818 07 4000, Irish Hospice Foundation 1800 80 70 77, Samaritans 116 123, Pieta, Barnardos/Rainbows for children); suppressed Revenue & Probate Office phones; corrected CAT (€400k/€40k/€20k @33%, IT38, 31-Oct deadline), SA.2 form (not "IT6"), 3-month registration, no-statutory-leave; banned retired 1890/076 prefixes + probateonline.ie. **Lesson: tune the scanner per country to avoid false positives; Worker rate-limits hard after many test calls.** Worker `ebf1d4cd`. Added `tests/diag_bereavement_ie.mjs`. |
