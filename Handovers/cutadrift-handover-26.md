# Cut Adrift — Handover Document 26
**Updated:** 21 June 2026
**Session work:** Per-country anti-hallucination hardening of the **bereavement tool for Australia** — the next country in the sweep started in session 25 (incapacity AU/CA/UK/IE/US done; bereavement Canada done + global guardrails on all six). Same method: live `curl` diagnostic (chronic + acute) against the deployed Worker, independent web-verification of every contact/figure before baking it in, then a verified-contacts AU block, deploy, and re-test until both scans come back clean over multiple runs.
**Supersedes:** Handover 25

---

## Project overview / Deploy commands

*(Unchanged — see Handover 24/25. Reminder: the **Worker** holds the prompt, so any prompt change needs `wrangler deploy`, NOT just a Pages deploy. Worker URL: `https://cutadrift-engine.waynemstevens.workers.dev/`.)*

---

## Work this session — bereavement AU hardened

### Diagnostic (live chronic + acute, country=au)

Built `tests/diag_bereavement_au.mjs` (reusable; modelled on `tests/live_incapacity_check.mjs`) — POSTs a **chronic** scenario (Path C: executor, weeks on, sorting probate/super/tax from interstate) and an **acute** scenario (Path B: sudden unexpected death, next-24-hours), reassembles the SSE stream, and scans for fabricated phones, invented/mislocalized URLs, cross-country org leaks, and estate-term correctness.

**Findings (raw):**
- **Fabricated, inconsistent agency phone numbers** (the main issue): ATO given **three** different numbers across/within runs — `1800 806 218` and `1300 829 009` (both wrong, same response) plus `13 28 61` (correct). Centrelink/Services Australia given `1300 132 468` and `13 10 02` — **both wrong**. (Lifeline `13 11 14` and Beyond Blue `1300 224 636` were correct and consistent.)
- **Fabricated URL:** `griefaustralia.org.au` (does not exist; the real org is at grief.org.au).
- **Wrong legal figure:** acute asserted **"3 days paid"** Fair Work compassionate leave — that's the NZ Holidays Act figure leaking in; **AU is 2 days** (paid for full/part-time, unpaid for casuals).
- **Cross-country leak (intermittent):** "**Steps to Justice** (stepstojustice.ca)" — an Ontario legal-info service — recommended to an AU user with "search for the Australian equivalent." Same distinctive-proper-noun leak that the generic Canada ban misses (cf. the "Community Law, the Irish equivalent" pattern from session 25). Also one-off invented grief numbers (`1800 509 540`, `03 9679 3800`) and a wrong "casuals get paid compassionate leave" parenthetical.
- **Solid (left intact):** grant of probate / executor / administrator / Letters of Administration, state Supreme Court probate registry, deceased estate, superannuation/death benefit, Registry of BDM per state, coroner auto-notified via funeral director. **Scanner false positives:** "Public Trustee" (genuine AU institution, ≠ NZ's "Public Trust"), "Births, Deaths and Marriages" (genuine AU registry name), "IRD" (substring of "third").

### Verified contacts (independently web-confirmed this session, per the carry-forward rule)
- **Services Australia — report a death:** `132 300` (Older Australians line; say "bereavement")
- **ATO — deceased estates:** `13 28 61`
- **Australian Death Notification Service:** `deathnotification.gov.au` (free national single-notification gov.au service — a genuine clean national entry point; the only AU URL the prompt allows)
- **Grief/crisis:** Lifeline `13 11 14`, Beyond Blue `1300 22 4636`, Griefline `1300 845 745`
- **Fair Work compassionate leave:** 2 days per occasion (NES); paid for full/part-time, unpaid for casuals

### Fix — new "Australia content" block in the bereavement prompt (`worker.js`)
Mirrors the Canada block:
- Verified national contacts given directly; **explicit bans** on the four fabricated ATO/Centrelink numbers; grief numbers **locked to the three verified lines only** (no Grief Australia office number).
- Estate terminology locked: Grant of Probate (with will) / Letters of Administration (no will) via the **state** Supreme Court probate registry; forbid Ontario "Certificate of Appointment"/"estate trustee" and NZ terms.
- Fair Work leave corrected to 2 days (+ "do not say 3 days", + casuals unpaid).
- **Steps to Justice / stepstojustice.ca** banned by name, plus a blanket rule: *never name a foreign service and tell the AU user to find the Australian equivalent* — name the AU org type (state law society / community legal centre) and tell them to search instead.
- `griefaustralia.org.au` banned (use grief.org.au only if a URL is needed; phones preferred).
- The intake-data country clause now names Australia as "supported in detail".

### Verification
Took **four deploy-and-retest iterations** to converge (numbers → leave figure → Steps to Justice leak → intermittent grief numbers + casual wording). Final state: **3 chronic + 3 acute live runs all CLEAN** (no fabricated phones, no non-whitelisted URLs, no cross-country leaks, correct 2-day leave figure, correct estate terms). Final **Worker version `05a653a4`**.

---

## Commits this session

| Commit | Message |
|---|---|
| `7cdcf7c` | Harden bereavement prompt: Australia verified-contacts block + estate/leave corrections (adds `tests/diag_bereavement_au.mjs`) |

Committed to `main` locally; **production Worker already deployed** via `wrangler deploy`. **`git push` not yet run** — push to sync `origin/main` when ready.

---

## Outstanding tasks

### ⚡ Priority
1. **Finish the per-country hardening sweep.** Status: incapacity = all 5 non-NZ done; bereavement = **Canada + Australia done**, all six shielded by the global no-URL + cross-country guardrails.
   - **Bereavement UK / IE / US** still each need the full chronic + acute test-and-harden pass (verified-contact blocks + correct local terminology + leave figures). Use `tests/diag_bereavement_au.mjs` as the template — change `country` and the scenario free_text, adjust the LEAK/GOOD term lists per country.
   - **Diagnosis tool — untouched.** Serves all six countries, no country blocks, no URL/cross-country guardrails. Next *tool* once bereavement is closed.
2. **Homepage design system not yet applied site-wide** (guide + tool pages still pre-redesign). Carried from H25.
3–6. *(Carried from H25: DIWM Phase 3 #3 cover-letter; capture stubbed-test payloads; GSC request-indexing for 8 pages; apply homepage design system site-wide.)*

### Consider / Ongoing
7. Pin "Notifying their employer" heading in the bereavement prompt. 8. Tighten `verify_crisis.mjs` Path A assertion. 9. `wrangler.toml` missing `pages_build_output_dir` (non-fatal). 10. Confirm sage favicon at tab size. 11. Outreach follow-up (5 bereavement orgs — was due week of 23 June 2026, now imminent). 12. OG image placeholder. 13. Feedback form → Google Sheet. 14–17. *(Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages — see H25.)*

---

## Method reminders (carry forward to bereavement UK/IE/US + diagnosis)
- **Verify every "this is correct" claim independently before baking it in** (this session: ATO 13 28 61, Services Australia 132 300, Fair Work = 2 days not 3 — all confirmed; griefaustralia.org.au exposed as fabricated).
- **Test a chronic AND an acute scenario**, and run each **several times** — the worst leaks (Steps to Justice, the extra grief numbers) were **intermittent** and only showed on repeat runs. A single clean run is not enough.
- **Prefer phones over URLs.** Lock grief/crisis numbers to a named verified set, or the model invents office numbers.
- **Distinctive foreign proper nouns leak as "the local equivalent"** — they need explicit by-name bans plus the blanket "never name a foreign service then say find the local equivalent" rule; the generic cross-country ban alone misses them.
- **Watch scanner false positives:** AU has genuine "Public Trustee" and "Births, Deaths and Marriages"; substring matches ("ird" in "third") are noise.
- **Deploy = `wrangler deploy`** (Worker holds the prompt). A Pages-only deploy silently leaves the prompt stale.

---

## Session history summary
*(See Handover 25 for sessions 1–25.)*

| Session | Key work |
|---------|----------|
| 25 | Homepage visual redesign; per-country incapacity hardening (AU/CA/UK/IE/US); bereavement Canada hardened + global no-URL/cross-country guardrails on all six. |
| 26 | **Bereavement AU hardened** — verified national contacts (Services Australia 132 300, ATO 13 28 61, ADNS deathnotification.gov.au, Lifeline/Beyond Blue/Griefline), banned fabricated ATO/Centrelink numbers + griefaustralia.org.au + Steps to Justice (Ontario) leak, corrected Fair Work compassionate leave to 2 days, locked Grant of Probate/Letters of Administration terminology. 4 deploy-iterations; 3 chronic + 3 acute runs clean. Worker `05a653a4`. Added reusable `tests/diag_bereavement_au.mjs`. |
