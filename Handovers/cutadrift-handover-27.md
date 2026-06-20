# Cut Adrift — Handover Document 27
**Updated:** 21 June 2026
**Session work:** Per-country anti-hallucination hardening of the **bereavement tool for the United Kingdom** — the next country in the sweep (incapacity AU/CA/UK/IE/US done; bereavement Canada + Australia done). Same method as the AU pass (Handover 26): live `curl` diagnostic (chronic + acute), independent web-verification of every contact/figure, a verified-contacts UK block with the **E&W / Scotland / NI probate split**, deploy, and re-test until clean over large samples.
**Supersedes:** Handover 26

---

## Project overview / Deploy commands

*(Unchanged — see Handover 24/25. Reminder: the **Worker** holds the prompt, so any prompt change needs `wrangler deploy`. Worker URL: `https://cutadrift-engine.waynemstevens.workers.dev/`.)*

---

## Work this session — bereavement UK hardened

### Diagnostic (live chronic + acute, country=uk)

Built `tests/diag_bereavement_uk.mjs` (reusable; same shape as `diag_bereavement_au.mjs`). Chronic = Path C executor handling an estate from a distance; acute = Path B sudden death, next-24-hours.

**Findings (raw), all web-verified before acting:**
- **Contacts:** HMRC's IHT number (`0300 123 1072`) **reused for the Probate Service** — the probate line is **`0300 303 0648`**. Cruse number inconsistent and mangled: `0808 196 5555` (acute) and `0800 808 1677` (0808→0800 autocorrect) both wrong; correct is **`0808 808 1677`**.
- **Fabricated/mangled domains:** `dvlaonline.org.uk`, `probateservice.gov.uk`, `land-registry.gov.uk`, `willregister.org.uk` (the model invents GOV.UK subdomains and commercial will-register domains).
- **Outdated legal facts:** referenced the **IHT205** form (abolished for deaths on/after 1 Jan 2022); probate fee **£155** (now **£300**); death certificate **£11** (now **£12.50**); invented coroner form **"Form EL4"**; defunct **"Community Legal Service"** (replaced by Civil Legal Advice); bereavement leave stated as "3–5 days" (UK has **no general statutory entitlement** — only Parental Bereavement Leave = 2 weeks for the death of a child).
- **Structural gap:** **no England&Wales / Scotland / NI split** — both runs assumed E&W throughout. Scotland uses **confirmation** via the **Sheriff Court** (executor-nominate/dative, register 8 days); NI uses the **Probate Office at the Royal Courts of Justice, Belfast** (register 5 days, **Tell Us Once not available**).
- **Missing clean national entry point:** **Tell Us Once** (free GOV.UK/DWP single-notification service) was never mentioned; nor DWP Bereavement Service / Bereavement Support Payment.
- **Long-tail NZ/AU fallback leaks** (intermittent, only visible on large samples): Skylight, KiwiSaver, What's Up (whatisup.co.uk), Centrelink. *(IHT bands £325k/£175k were already correct. ACC/ATO/"public trust" scan flags were false positives — "account", "administrator", and England's legitimate statutory "Public Trustee".)*

### Fix — new "United Kingdom content" block (`worker.js`)
- **Verified national contacts, phone-first:** Tell Us Once `0800 085 7308` (primary government-notification route; covers HMRC/DWP/DVLA/Passport/council — removes the fabricated separate DVLA/passport contacts; **not available NI/abroad**); DWP Bereavement Service `0800 731 0469` + Bereavement Support Payment (claim within 21 months); HMRC IHT `0300 123 1072` (the **only** HMRC number — the model otherwise grabs the real Income Tax line `0300 200 3300`); HMCTS Probate `0300 303 0648`; Cruse `0808 808 1677`; Samaritans `116 123`.
- **E&W / Scotland / NI probate split** (the key structural addition).
- **Corrected figures:** no IHT205/IHT217 (figures go in the probate application; IHT400 only if tax due); probate fee £300; **sealed grant copies £16 each** (raised from £1.50 on 17 Nov 2025 — added per Wayne's request, since executors need several); death cert £12.50; IHT bands £325k/£175k; bereavement-leave reality.
- **Bans:** fabricated/mangled domains; both wrong Cruse numbers (explicit "begins 0808, never 0800"); "Form EL4"; "Community Legal Service"; invented GOV.UK subdomains; commercial will-registers (→ probatesearch.service.gov.uk). Grief lines locked to Cruse + Samaritans.
- **Global NZ-reuse ban (rule #2, all six countries) strengthened** with KiwiSaver, What's Up, Skylight, Lifeline, Grief Centre, and a note that England's "Public Trustee" is fine (≠ NZ "Public Trust").
- Country clause now names the UK as supported in detail.

### Verification — and a methodology lesson
Took ~8 deploy-and-retest iterations. **A 3+3 sample looked clean early, but scaling to 14-run samples (weighted to acute) exposed a ~7% intermittent tail** the small sample missed: IHT205, KiwiSaver, What's Up, Centrelink, the Cruse 0808→0800 digit-mangle, and stray HMRC/will-register numbers. Each was driven to zero with explicit **wrong-value bans** (naming the exact bad number/term) plus positive UK replacements. Final state: **11 consecutive real-content runs clean** (3 chronic + 8 acute; a few burst calls returned empty from transient rate-limiting and were ignored). **Lesson for IE/US and the diagnosis tool: sample large (10+ per scenario) — the long tail is invisible at 3+3, and digit-mangles/defunct-form names need explicit bad-value bans, not just positive guidance.** Final **Worker version `bd4e5ea5`**.

---

## Commits this session

| Commit | Message |
|---|---|
| `ec6bca5` | Harden bereavement prompt: United Kingdom block (E&W/Scotland/NI split) + verified contacts (adds `tests/diag_bereavement_uk.mjs`) |

Committed to `main` locally; **production Worker already deployed** via `wrangler deploy`. **`git push` not yet run** unless done after this doc — push to sync `origin/main` when ready.

---

## Outstanding tasks

### ⚡ Priority
1. **Finish the per-country bereavement sweep, then the diagnosis tool.** Status: incapacity = all 5 non-NZ done; bereavement = **Canada + Australia + UK done**; all six shielded by the global no-URL + cross-country guardrails.
   - **Bereavement Ireland & United States** still need the full chronic + acute test-and-harden pass. Use `tests/diag_bereavement_uk.mjs` as the template (swap `country`, scenarios, LEAK/GOOD lists). For IE: verify probate (Probate Office / District Probate Registries), the RIP.ie / Citizens Information landscape, bereavement grant status, and Irish-specific terms. For US: state-based probate, Social Security death notification, no national grief line baked in without verification.
   - **Diagnosis tool — untouched.** No country blocks, no URL/cross-country guardrails. Next *tool* once bereavement is closed.
2. **Homepage design system not yet applied site-wide** (guides + tool pages still pre-redesign). Carried.
3–6. *(Carried: DIWM Phase 3 #3 cover-letter; capture stubbed-test payloads; GSC request-indexing for 8 pages; apply homepage design system site-wide.)*

### Consider / Ongoing
7. Pin "Notifying their employer" heading in the bereavement prompt. 8. Tighten `verify_crisis.mjs` Path A assertion. 9. `wrangler.toml` missing `pages_build_output_dir` (non-fatal). 10. Confirm sage favicon at tab size. 11. **Outreach follow-up (5 bereavement orgs) was due week of 23 June 2026 — now imminent (2 days out).** 12. OG image placeholder. 13. Feedback form → Google Sheet. 14–17. *(Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages — see H25.)*

---

## Method reminders (carry forward to bereavement IE/US + diagnosis)
- **Verify every "this is correct" claim independently** (this session caught: probate line ≠ IHT line; IHT205 abolished; £155→£300; £11→£12.50; "Form EL4" invented; "Community Legal Service" defunct).
- **Sample LARGE.** Run 10+ per scenario, weighted to acute. The major leaks die fast; the dangerous tail (cross-country grief lines, digit-mangled numbers, defunct forms) only shows at scale. A clean 3+3 is necessary but not sufficient.
- **Explicit wrong-value bans beat positive guidance** for sticky errors — name the exact bad number/domain/form ("0800 808 1677 is wrong"; "never write IHT205"; "Form EL4 is invented").
- **Split jurisdictions where the law isn't unified** (UK probate: E&W/Scotland/NI — Scotland is "confirmation", not "probate").
- **Prefer phones over URLs**; lock grief/crisis lines to a named verified set or the model invents/borrows from NZ.
- **Watch scanner false positives:** England's "Public Trustee" (≠ NZ "Public Trust"), substring hits (ACC→account, ATO→administrator, advice.org.uk⊂citizensadvice.org.uk), and the generic phrase "death notification".
- **Deploy = `wrangler deploy`** (Worker holds the prompt). A Pages-only deploy silently leaves the prompt stale.

---

## Session history summary
*(See Handover 25 for sessions 1–25.)*

| Session | Key work |
|---------|----------|
| 25 | Homepage redesign; per-country incapacity hardening (AU/CA/UK/IE/US); bereavement Canada + global guardrails. |
| 26 | Bereavement **Australia** hardened — verified contacts, banned fabricated ATO/Centrelink numbers + griefaustralia.org.au + Steps to Justice leak, corrected Fair Work leave to 2 days, locked Grant of Probate/Letters of Administration. Worker `05a653a4`. |
| 27 | Bereavement **United Kingdom** hardened — verified contacts (Tell Us Once, DWP Bereavement Service, HMRC IHT, HMCTS Probate, Cruse, Samaritans), **E&W/Scotland/NI probate split** (confirmation via Sheriff Court for Scotland), corrected IHT205-abolished / probate fee £300 / £16 sealed copies / death cert £12.50, banned fabricated domains + "Form EL4" + "Community Legal Service" + the Cruse digit-mangle, strengthened global NZ-reuse ban. **Methodology lesson: large-sample testing exposes a ~7% tail invisible at 3+3.** Worker `bd4e5ea5`. Added `tests/diag_bereavement_uk.mjs`. |
