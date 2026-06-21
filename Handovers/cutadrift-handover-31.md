# Cut Adrift — Handover Document 31
**Updated:** 21 June 2026
**Session work:** Three things. (1) Added a **secret-gated internal test bypass** to the Worker rate limiter so capture/testing passes don't burn the public 10/IP/24h limit or skew the 200/day cost alert. (2) **Captured real DIWM panel outputs** to `tests/captures/` (via the bypass) for a homepage gallery decision. (3) Built, iterated, and **deployed a new homepage gallery section** — "A few more things we draft for you" — showing four real captured outputs in four formats. No country-hardening this session; the US bereavement **confirmation re-test is still owed** (carried from H30).
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

## Next session — START HERE

1. **US bereavement confirmation re-test** (carried from H30, still owed): `node tests/retest_bereavement_us.mjs` once the per-IP limit has reset — **OR just use the new bypass header now** (add `X-Internal-Test` to the retest script's fetch headers) and it won't be rate-limited at all. Target: 0 occurrences of the stale `$13.61M` estate-tax figure and "solicitor" across a 10+ run sample, on the strengthened build (`960fb7e0` was the strengthened US worker; current live worker is `91202a75` which includes it + the bypass). If either still leaks, suppress the exact estate-tax dollar figure entirely (qualitative only).
2. Then begin the **diagnosis tool** country-hardening — the only tool never hardened (no country blocks, no global guardrails). Watch: disability/discrimination statutes by name (ADA + FMLA US, Equality Act 2010 UK, etc.), statutory sick pay, benefit program names (SSDI, PIP, Illness Benefit). Use the bypass header for testing so it's free.

---

## Outstanding tasks

### ⚡ Priority
1. **US bereavement confirmation re-test**, then **diagnosis tool** country-hardening (see "Next session"). Use the bypass header for both — testing is now free of the rate limit.
2. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign). Carried.
3–6. *(Carried: DIWM Phase 3 #3 cover-letter; capture stubbed-test payloads — partially addressed now that `tests/captures/` exists; GSC request-indexing for 8 pages; apply homepage design system site-wide.)*

### Consider / Ongoing
7. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known (H29).
8. Pin "Notifying their employer" heading in the bereavement prompt. 9. Tighten `verify_crisis.mjs` Path A assertion. 10. `wrangler.toml` missing `pages_build_output_dir` (non-fatal; warns on every pages deploy). 11. Confirm sage favicon at tab size. 12. **Outreach follow-up (5 bereavement orgs) was due week of 23 June 2026 — now imminent.** 13. OG image placeholder. 14. Feedback form → Google Sheet. 15–18. *(Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages — see H25.)*

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
| 31 | **Secret-gated test bypass** added to the rate limiter (`X-Internal-Test`/`INTERNAL_TEST_KEY`; skips per-IP + global counter; commit `c0d67b7`, Worker `91202a75`). **Captured real DIWM outputs** to `tests/captures/` via the bypass. Built + deployed the **homepage gallery** "A few more things we draft for you" (4 real outputs: letter/script/message/list; commits `e6de0cc`→`ad6be9e`→`0643b14`). US confirmation re-test still owed. |
