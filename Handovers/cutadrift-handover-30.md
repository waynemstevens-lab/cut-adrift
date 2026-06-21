# Cut Adrift — Handover Document 30
**Updated:** 21 June 2026
**Session work:** Hardened the **United States** block of the **bereavement** tool — the last bereavement country. This completes the per-country anti-hallucination sweep of the bereavement prompt (all six countries now done). Diagnosed live, web-verified every fact, wrote a dedicated US content block, deployed, and large-sample re-tested (14 runs). One follow-up: a **confirmation re-test of the strengthened build is owed next session** (the per-IP rate limit was exhausted before I could re-verify the two edge-leak fixes).
**Supersedes:** Handover 29

---

## Project overview / Deploy commands

*(Unchanged — see Handover 24/25. The **Worker** holds the prompts → any prompt change needs `wrangler deploy`. Worker URL: `https://cutadrift-engine.waynemstevens.workers.dev/`.)*

---

## Bereavement sweep status — NOW COMPLETE

Per-country anti-hallucination hardening of the **bereavement** tool:

| Country | Status |
|---|---|
| New Zealand | ✅ original detailed content |
| Canada | ✅ done + deployed (H25) |
| Australia | ✅ done + deployed (H26) |
| United Kingdom | ✅ done + deployed (H27) |
| Ireland | ✅ done + deployed (H28) |
| **United States** | ✅ **done + deployed (H30)** — confirmation re-test owed |

All six countries are also shielded by the global guardrails (no-URL whitelist + cross-country contact-reuse ban). **The bereavement sweep is finished.** The next *tool* to harden is the **diagnosis tool** (untouched, no country blocks/guardrails). **Incapacity** tool: all five non-NZ countries already done/tested (H25).

---

## New this session — United States bereavement block

**Context.** The US is the model's strongest jurisdiction, so the diagnostic (`tests/diag_bereavement_us.mjs`, chronic + acute) was already mostly clean — no fabricated phone storms, correct SSA/Medicare numbers, correct probate/estate terminology. The pass was therefore about three specific failure surfaces, all independently web-verified before baking in:

1. **Stale federal estate-tax exclusion.** The model kept emitting **"$13.61 million (2024)"** (a strong training-data prior). Correct figure for deaths in **2026 is $15 million per person** (OBBBA, the 2025 federal tax law; inflation-indexed). Forms locked: **706** (federal estate-tax return), **1041** (estate income), **1040** (deceased's final personal return).
2. **Defunct / fabricated grief orgs.** **"The Dinner Party" CLOSED in 2026** (now ban it as an active service). **"National Widows and Widowers Organization" is fabricated** (the real org is the National Widowers' Organization — website/groups only, no hotline). **GriefShare** is real but **faith-based (nondenominational Christian)** — only mention with that flag. **There is no single national US grief helpline** — route to **local hospice bereavement programs** or **988** if in crisis.
3. **"solicitor" terminology leak** — UK/Irish word; US is **"attorney"/"lawyer"**.

**Verified national contacts given directly in the block:**
- **SSA 1-800-772-1213** (TTY 1-800-325-0778). **The funeral director normally reports the death to SSA by default** (give them the deceased's SSN); family calls only if no funeral home. **$255** one-time lump-sum death payment to a surviving spouse who lived with the deceased (or an eligible child); apply within 2 years.
- **1-800-MEDICARE (1-800-633-4227)**, TTY 1-877-486-2048.
- **Eldercare Locator 1-800-677-1116** (federal ACL) — referral hub to find **local** services only, NOT a grief line.
- **988 Suicide and Crisis Lifeline** (call or text 988) — crisis/distress line, framed as "if in crisis", not general grief counselling.

**State-based framing (CA-style).** Probate, death registration, estate/inheritance tax, and bereavement leave are all **state-based** — no national probate office, no national death-registration service, no national bereavement-leave law. Terms locked: **letters testamentary** (executor, with will) / **letters of administration** (administrator, no will / intestacy); **probate court** or **surrogate's court**; search-pattern "[their state] probate court" (no court phone/URL). State estate/inheritance tax noted as a minority-of-states thing to check. Bereavement leave: not federally mandated → point to employer/HR, no stated day-count as a legal right.

**Code:** `worker.js` — country clause updated (line ~47 now lists the US "see the United States content section below"); the full **United States content** block sits right after the Ireland block, before `## Formatting rules`. Commits `03a41aa` (block + tests) then the strengthening edits in the same file.

**Deploys:** first build `59bc61a1`; **strengthened build `960fb7e0` is current/live.**

---

## Large-sample re-test (the H27 lesson, reconfirmed) — and what's OWED

`tests/retest_bereavement_us.mjs` runs chronic + acute alternately, paced ~8s, retry-on-empty, and checks each run against **specific known-bad values** (stale tax figures, "solicitor", The Dinner Party, fabricated widows org, every cross-country org, wrong SSA amount).

**Result: 14 real-content runs, 12/14 clean.** All major fixes held at **0 leaks** — no Cruse/HMRC/Citizens Information/Capital Acquisitions Tax/Services Australia/Centrelink/Service Canada/Skylight/Public Trust, no Dinner Party, no fabricated widows org; SSA number present in 13/14 (the one miss was a short acute response that didn't reach estate steps). **The ~7% tail = exactly 2 chronic-path edge-leaks** that a clean 3+3 would have missed:
- run 3: stale **$13.61M** estate-tax figure
- run 5: **"solicitor"**

**Both were strengthened after the run and redeployed (`960fb7e0`):**
- Estate-tax bullet now carries a meta-warning ("your training data likely suggests an older figure such as $13.61M/$13.99M — those are prior-year and WRONG for 2026; never write them"), a standing instruction to confirm the current figure on irs.gov, and a qualitative fallback ("very high — tens of millions, so most estates owe nothing") if unsure of the exact number.
- "solicitor" ban reinforced with the IE generic-word lesson (positive "attorney/lawyer" anchor + explicit "including phrases like 'consult a solicitor'").

**⚠️ OWED next session:** a **confirmation large-sample re-test of build `960fb7e0`** to verify those two edge-leaks are now at/near 0. **I could not run it this session — the per-IP rate limit (10/IP/day; KV eventual-consistency over-permits to ~14) was already exhausted by the diagnostic + the 14-run re-test.** Wait for the limit to reset (24h) or test from a different IP. Scanner false positives to ignore: **"Inheritance Tax"** (correct US usage for the minority of states with a state inheritance tax, ≠ UK national IHT) and **"Lifeline"** (matches the correct "988 Suicide and Crisis Lifeline").

---

## Next session — START HERE

1. **Confirmation re-test** of US build `960fb7e0`: `node tests/retest_bereavement_us.mjs` (once rate limit has reset). Target: 0 occurrences of the stale $13.61M figure and "solicitor" across a 10+ run sample. If either still leaks, the next lever is suppressing the exact estate-tax dollar figure entirely (qualitative only) and/or a hard post-generation note — but try the strengthened prompt first.
2. Then begin the **diagnosis tool** — the only tool never hardened (no country blocks, no global guardrails). Same method: diagnose chronic + acute per country, web-verify, add per-country blocks. Diagnosis-specific surfaces to watch (from the prompt): disability/discrimination statutes by name (ADA + FMLA in US, Equality Act 2010 UK, etc.), statutory sick pay, and benefit program names (SSDI, PIP, Illness Benefit, etc.) — all prime fabrication targets.

Carry-forward method reminders: project memory (`incapacity-country-hardening.md`) and H27/H28.

---

## Outstanding tasks

### ⚡ Priority
1. **US bereavement confirmation re-test** (build `960fb7e0`), then **diagnosis tool** hardening (see "Next session").
2. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign). Carried.
3–6. *(Carried: DIWM Phase 3 #3 cover-letter; capture stubbed-test payloads; GSC request-indexing for 8 pages; apply homepage design system site-wide.)*

### Consider / Ongoing
7. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known (H29).
8. Pin "Notifying their employer" heading in the bereavement prompt. 9. Tighten `verify_crisis.mjs` Path A assertion. 10. `wrangler.toml` missing `pages_build_output_dir` (non-fatal). 11. Confirm sage favicon at tab size. 12. **Outreach follow-up (5 bereavement orgs) was due week of 23 June 2026 — now imminent.** 13. OG image placeholder. 14. Feedback form → Google Sheet. 15–18. *(Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages — see H25.)*

---

## Session history summary
*(See Handover 25 for sessions 1–25.)*

| Session | Key work |
|---------|----------|
| 25 | Homepage redesign; per-country incapacity hardening (AU/CA/UK/IE/US); bereavement Canada + global guardrails. |
| 26 | Bereavement **Australia** hardened. Worker `05a653a4`. |
| 27 | Bereavement **United Kingdom** hardened (E&W/Scotland/NI split; Tell Us Once; large-sample testing lesson). Worker `bd4e5ea5`. |
| 28 | Bereavement **Ireland** hardened (CAT/SA.2/Probate Office; suppress Revenue & Probate phones; retired-prefix bans). Worker `ebf1d4cd`. |
| 29 | Audited per-IP rate limiting (10/IP/24h, KV, shared). Built **global daily request counter + once-per-day Resend email alert** (alert-only, threshold 200). Worker `8c7bbe00`, commit `44dd414`. |
| 30 | Bereavement **United States** hardened — **bereavement sweep COMPLETE**. Verified SSA/Medicare/Eldercare Locator/988; state-based probate (CA-style); estate-tax $13.61M→**$15M (2026)**; Forms 706/1041/1040; "attorney" not "solicitor"; killed defunct Dinner Party + fabricated widows org; GriefShare flagged faith-based. 14-run re-test 12/14 clean; 2 chronic edge-leaks strengthened. Worker `960fb7e0`, commit `03a41aa`. **Confirmation re-test owed (rate-limited).** |
