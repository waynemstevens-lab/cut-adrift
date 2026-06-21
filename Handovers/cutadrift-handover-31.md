# Cut Adrift — Handover Document 31
**Updated:** 21 June 2026
**Session work:** Four things. (1) Added a **secret-gated internal test bypass** to the Worker rate limiter so capture/testing passes don't burn the public 10/IP/24h limit or skew the 200/day cost alert. (2) **Captured real DIWM panel outputs** to `tests/captures/` (via the bypass) for a homepage gallery decision. (3) Built, iterated, and **deployed a new homepage gallery section** — "A few more things we draft for you" — showing four real captured outputs in four formats. (4) **Closed out the owed US bereavement confirmation re-test** (carried from H30): ran large samples via the bypass, then fixed the two residual edge-leaks structurally — estate-tax figure suppressed to qualitative-only, and a worker-level in-stream "solicitor"→"attorney" rewrite. US bereavement now confirmed **10/10 clean**.
**Supersedes:** Handover 30

---

## Project overview / Deploy commands

*(Unchanged — see Handover 24/25.) Two separate deploys, do not confuse them:*
- **Worker (the prompts + rate limiter):** `wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`.
- **Static site (homepage, guides, tool pages):** `wrangler pages deploy Public` → serves `cutadrift.org`. (Logs a harmless warning that `wrangler.toml` lacks `pages_build_output_dir` — outstanding item #10, non-fatal; Pages ignores the toml and deploys anyway.)

---

## New this session — internal test bypass (rate limiter)

**What it is.** A request carrying header **`X-Internal-Test: <secret>`** matching the new Worker secret **`INTERNAL_TEST_KEY`** is treated as our own test/capture traffic: it **skips BOTH** the per-IP gate AND the session-29 global daily counter. So testing/capture passes never burn the public 10/IP/24h limit or skew the 200/day cost-safety alert.

**Key properties (all by design):**
- Both gates are wrapped in `if (!isInternalTest)` (`worker.js`, rate-limit block ~`:1772`). The non-test path is **byte-identical** to before — fail-open-on-KV-error, the 429 message, the Resend alert, and the bereavement crisis short-circuit are all untouched.
- **Fail-closed:** `isInternalTest = !!env.INTERNAL_TEST_KEY && header === env.INTERNAL_TEST_KEY`. If the secret is unset or the header missing/wrong → normal gating. Strict equality, so only the exact value bypasses.
- Secret set via `wrangler secret put INTERNAL_TEST_KEY` **from the project dir** (same gotcha as `RESEND_API_KEY` — must target `cutadrift-engine`). Live immediately, no redeploy needed.

**The secret value (for reuse in testing):** `498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04` (256-bit random hex; rotate by re-running `wrangler secret put` from the project dir).

**curl usage:**
```bash
curl -X POST https://cutadrift-engine.waynemstevens.workers.dev/ \
  -H 'content-type: application/json' \
  -H 'X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04' \
  -d '{"tool":"...","country":"nz", ...}'
```

**Code/deploy:** commit `c0d67b7`, **Worker `91202a75`**.

**Verification (deterministic, IP-independent):** proved via the global counter — 4 valid-header calls did **not** increment it; 2 no-header calls incremented it by **exactly +2** (G0 18 → G1 20). Confirms header traffic skips the whole block and normal traffic still runs it.

**Two operational gotchas learned this session (both bit me, both worth remembering):**
1. **My egress IPv6 rotates per-connection** (`2a09:bac1:…`, `2a09:bac5:…` — different each call). That's why the per-IP limit rarely triggers for me, and why I couldn't capture a live self-inflicted 429. The per-IP gate is intact; it just can't be demonstrated by hammering from this machine.
2. **`wrangler kv key get/list/put` default to LOCAL KV.** Must pass **`--remote`** to read/write the real namespace (`RATE_LIMIT`, id `3a74818b39634ca494158c8dc55d8cd9`). My first "namespace is empty" reads were local; the real namespace had the live keys (`global:<date>`, `rl:<ip>`).

---

## New this session — captured DIWM outputs (`tests/captures/`)

Ran `tests/capture_diwm.mjs` (uses the bypass header; `INTERNAL_TEST_KEY=<secret> node tests/capture_diwm.mjs`) to generate real outputs for all DIWM panels of the incapacity and diagnosis tools, plus the bereavement leave email saved verbatim. Files in `tests/captures/` (commits `e7dc203`, `12a138c`):
- `incapacity-family-message.md`, `incapacity-gp-questions.md`
- `diagnosis-employer-email.md`, `diagnosis-kiwisaver-call.md`, `diagnosis-insurance-call.md`, `diagnosis-family-message.md`, `diagnosis-gp-questions.md`
- `bereavement-leave-email.md` (the existing homepage proof-card copy, verbatim — curated, not a live generation)

All correctly NZ-localized (ACC, Needs Assessment and Service Coordination, Te Whatu Ora, Work and Income, Cancer Society). These were generated **via the bypass**, so they did not count against the public limit.

**DIWM inventory facts established this session (worth keeping):**
- There is **NO separate "carer" tool** — the `incapacity` key powers the carer-branded tool (the `carer` key is long-dead). So "incapacity" and "carer" are the same tool.
- **Bereavement has exactly ONE DIWM panel** (`bereavement-leave-email`) — there is no second bereavement drafted-output to show. (This drove the gallery card-1 swap below.)
- DIWM panels total: bereavement ×1, incapacity ×2, diagnosis ×5 (and there are other bereavement DIWM formatters — bank-letter, employer-notify, family-message — but only leave-email is wired as the proof example).
- The **"Not Redundant" CV builder** lives at `~/Desktop/First Steps/` (worker.js `cv_mode` → JSON schema → `Public/cv.html` `renderCV()`). No captured sample CV exists there — only input placeholders.

---

## New this session — homepage gallery section (BUILT + DEPLOYED)

A new section, **"A few more things we draft for you"**, added to `Public/index.html` directly **below the situation (intake-trigger) cards**, above the trust strip. The **existing single proof card near step III is untouched.**

- 2×2 card grid (stacks to 1 col on mobile), **same card chrome/shadow as the proof card** (`#FBF8F2`, radius 4px, drop shadow), with a subtle alternating tilt (reset flat on mobile to avoid overflow). New CSS classes `.gallery*`; eyebrow uses the same small-caps style as `.proof-label`.
- Each card has a tool **tag pill**; tag colors end at **sage / clay / clay / sage** (diagonal symmetry — clay on the TR↔BL diagonal, sage on TL↔BR).
- **Final card lineup** (all copy verbatim from `tests/captures/`; the "…plus" continuation lines are the gallery's own connective device, same as cards already had):
  1. **Diagnosis — employer email** (letter; sage tag) — `diagnosis-employer-email.md`, excerpted + "…plus" line.
  2. **Diagnosis — insurance call script** (script; clay tag) — `diagnosis-insurance-call.md`, excerpted.
  3. **Incapacity — family message** (message; clay tag) — `incapacity-family-message.md`, full text.
  4. **Diagnosis — questions list** (list; sage tag) — `diagnosis-gp-questions.md`, excerpted.

**Iteration history this session (all deployed via `wrangler pages deploy Public`, verified live on cutadrift.org each time):**
- `e6de0cc` — initial build. **Card 1 was originally the bereavement-leave-email** (verbatim proof-card copy).
- `ad6be9e` — **swapped card 1 → diagnosis-employer-email.** Reason: the standalone proof card near step III already shows the bereavement email, so it appeared twice on scroll; bereavement has no second DIWM panel to use instead, so card 1 became a diagnosis letter.
- `0643b14` — recolored card 2 tag sage→clay for the diagonal 2×2 balance.

Result: three diagnosis cards + one incapacity — accepted as fine because the **formats differ** (letter / script / message / list). Preview each render with headless Chrome: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --screenshot=...` (note: headless render comes out dark due to no color profile — brighten the crop ~2.4× to read it; the cards are actually cream).

---

## New this session — US bereavement re-test + final hardening (the owed H30 item, now closed)

Ran the confirmation re-test that H30 left owed, now rate-limit-free via the bypass header (`tests/retest_bereavement_us.mjs` sends `X-Internal-Test`). The larger sample (the H27 large-sample lesson again) exposed two residual edge-leaks that prompt wording alone could not kill, so both were fixed **structurally, not by re-patching the prompt**:

**Final measured leak rates (across a 20-run + two 10-run samples):**
- **`$13.61M` stale estate-tax figure** — **0** everywhere. The H30 meta-warning held; it was never actually re-leaking.
- **Estate-tax exclusion figure (any `$N million`)** — was `$15M` in the prompt; now **suppressed to qualitative-only**. Block states only that the exclusion is "very high — in the tens of millions, so most estates owe no federal estate tax" and routes to **irs.gov** / an attorney or CPA. Forms 706/1041/1040 and the stable $600 1041 threshold retained. Confirmed **0/10** for any `$N million`. (Preventive: removes the fabrication surface for an annually-changing number permanently.) Commit `9f3ae70`, Worker `00c35dc9`.
- **"solicitor" (British term; US is "attorney")** — leaked **~10% (3/30)** despite the prompt ban; a sticky generic-word leak, same class as IE "Community Law". Fixed with a **worker-level in-stream rewrite**, `makeSolicitorRewriteStream()` in `worker.js`: a `TransformStream` on the SSE response that rewrites `solicitor→attorney`, **gated on `intake.country === 'us'`** so UK/IE/AU legitimate usage is untouched. Case-preserving, plural-aware, excludes "Solicitor General". **Cross-chunk-safe** (the part you'd expect to break): incomplete SSE framing is buffered so only complete events are processed, and a word split across two `text_delta` deltas is handled by holding back the trailing letter-run each flush (replacement only runs on text ending at a non-letter boundary; carry flushed before the stop events). Unit-tested with 7-byte chunking (splits both the word and the data lines) + verified live. Commit `03eef86`, **Worker `afac0f2e` (current live)**.

**Result:** final live 10-run sample **10/10 clean** — 0 solicitor, 0 estate-tax `$ figure`, 0 cross-country, 0 Dinner Party.

**⚠️ Residual to watch (NOT fixed today, different leak from the two above):** **"The Dinner Party"** (the defunct US grief org — closed 2026, banned in the prompt) flickered at **~7% (2/30)** in the 20-run sample, though it was **0** in the final clean sample. Not blocking and low-harm (a grief-org name, not a contact/figure), but it's a prompt-suppression leak of the same family as solicitor was — if it proves persistent on a future large sample, the same fix applies: a US-gated in-stream rewrite (drop/replace the "The Dinner Party" sentence) rather than more prompt wording. Logged in Outstanding tasks.

**Reinforced lesson:** for sticky generic-word / named-entity terminology leaks, a **narrow country-gated post-generation string rewrite in the worker is more reliable than any amount of prompt banning.** Prefer it once a leak proves it survives the prompt.

## Next session — START HERE

1. ✅ **US bereavement confirmation re-test — DONE this session** (see "US bereavement re-test + final hardening" above). Closed: estate-tax suppressed to qualitative-only, "solicitor" fixed via worker rewrite, final 10/10 clean. **Current live worker is `afac0f2e`.** Only residual is the Dinner Party ~7% flicker (watch item #8 below).
2. Begin the **diagnosis tool** country-hardening — the only tool never hardened (no country blocks, no global guardrails). Watch: disability/discrimination statutes by name (ADA + FMLA US, Equality Act 2010 UK, etc.), statutory sick pay, benefit program names (SSDI, PIP, Illness Benefit). Use the bypass header for testing so it's free. **Apply the lesson reinforced this session:** when a named-entity/terminology leak survives the prompt ban on a large sample, reach for a country-gated in-stream rewrite in the worker (pattern: `makeSolicitorRewriteStream`) rather than re-tweaking wording.

---

## Outstanding tasks

### ⚡ Priority
1. ✅ US bereavement confirmation re-test **done** (estate-tax qualitative-only + worker-level solicitor rewrite; 10/10 clean; live worker `afac0f2e`). Next priority is **diagnosis tool** country-hardening (see "Next session"). Use the bypass header — testing is free of the rate limit.
2. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign). Carried.
3–6. *(Carried: DIWM Phase 3 #3 cover-letter; capture stubbed-test payloads — partially addressed now that `tests/captures/` exists; GSC request-indexing for 8 pages; apply homepage design system site-wide.)*

### Consider / Ongoing
7. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known (H29).
8. **Watch: "The Dinner Party" residual leak in US bereavement** — the defunct US grief org (banned in the prompt) flickered at **~7% (2/30)** in this session's 20-run sample, though 0 in the final clean sample. Different leak from the two fixed today; not blocking, low-harm. If a future large sample shows it persists, fix with a US-gated in-stream rewrite (same `makeSolicitorRewriteStream` pattern — drop/replace the offending sentence), not more prompt wording.
9. Pin "Notifying their employer" heading in the bereavement prompt. 10. Tighten `verify_crisis.mjs` Path A assertion. 11. `wrangler.toml` missing `pages_build_output_dir` (non-fatal; warns on every pages deploy). 12. Confirm sage favicon at tab size. 13. **Outreach follow-up (5 bereavement orgs) was due week of 23 June 2026 — now imminent.** 14. OG image placeholder. 15. Feedback form → Google Sheet. 16–19. *(Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages — see H25.)*

---

## Session history summary
*(See Handover 25 for sessions 1–25.)*

| Session | Key work |
|---------|----------|
| 26 | Bereavement **Australia** hardened. Worker `05a653a4`. |
| 27 | Bereavement **United Kingdom** hardened. Worker `bd4e5ea5`. |
| 28 | Bereavement **Ireland** hardened. Worker `ebf1d4cd`. |
| 29 | Per-IP rate-limit audit + **global daily counter + Resend email alert** (alert-only, threshold 200). Worker `8c7bbe00`, commit `44dd414`. |
| 30 | Bereavement **United States** hardened — bereavement sweep complete. Estate-tax $13.61M→**$15M (2026)**; "attorney" not "solicitor"; killed defunct Dinner Party + fabricated widows org. Worker `960fb7e0`, commit `03a41aa`. Confirmation re-test left owed. |
| 31 | **Secret-gated test bypass** added to the rate limiter (`X-Internal-Test`/`INTERNAL_TEST_KEY`; skips per-IP + global counter; commit `c0d67b7`, Worker `91202a75`). **Captured real DIWM outputs** to `tests/captures/` via the bypass. Built + deployed the **homepage gallery** "A few more things we draft for you" (4 real outputs: letter/script/message/list; commits `e6de0cc`→`ad6be9e`→`0643b14`). **Closed the owed US bereavement re-test:** estate-tax figure suppressed to qualitative-only (`9f3ae70`) + worker-level US-gated `solicitor→attorney` in-stream rewrite (`03eef86`); final **10/10 clean**, live Worker **`afac0f2e`**. Residual to watch: Dinner Party ~7% flicker. |
