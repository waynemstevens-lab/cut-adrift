# Cut Adrift — Handover Document 29
**Updated:** 21 June 2026
**Session work:** Two things. (1) Audited the Worker's existing rate limiting across all three tools and reported it in full (per-IP 10/day via KV, shared across tools, clear 429 message on the main path). (2) Built a new **cost-safety feature**: a global daily request counter that sends one heads-up email per day (via Resend) when traffic crosses a threshold — alert-only, never blocks, fails silently if the email send itself fails. Verified end-to-end (email confirmed in inbox). No country-hardening this session.
**Supersedes:** Handover 28

---

## Project overview / Deploy commands

*(Unchanged — see Handover 24/25. The **Worker** holds the prompts → any prompt change needs `wrangler deploy`. Worker URL: `https://cutadrift-engine.waynemstevens.workers.dev/`.)*

---

## Bereavement sweep status

Per-country anti-hallucination hardening of the **bereavement** tool:

| Country | Status |
|---|---|
| New Zealand | ✅ original detailed content |
| Canada | ✅ done + deployed (H25) |
| Australia | ✅ done + deployed (H26) |
| United Kingdom | ✅ done + deployed (H27) |
| Ireland | ✅ done + deployed (H28) |
| **United States** | ⏳ **the only country remaining** |

All six countries are also shielded by the global guardrails (no-URL whitelist + cross-country contact-reuse ban). **United States is the last bereavement country**, after which the **diagnosis tool** (untouched, no country blocks/guardrails) is the next *tool* to harden.

**Incapacity** tool: all five non-NZ countries already done/tested (H25).

---

## New this session — existing rate limiting (audited, unchanged)

Full findings were reported to Wayne; key facts (all in `worker.js`):
- **Per-IP limit: 10 requests / IP / 24h**, KV-backed (`RATE_LIMIT_MAX = 10`, `RATE_LIMIT_TTL = 86400`, `worker.js:1665–1666`). Key `rl:<CF-Connecting-IP>` (`:1747–1748` region). Enforced in Worker code + Workers KV (binding `RATE_LIMIT`), **not** Cloudflare dashboard rules.
- **Shared across all tools** (bereavement/incapacity/carer + DIWM panels) — the check runs before tool dispatch and the key has no tool in it.
- **On hit:** HTTP 429 + JSON. Frontend `Public/plan/index.html:601–603` shows a clear "come back tomorrow" message; the bereavement crisis short-circuit (`Public/when-someone-dies/index.html:734,761–763`) degrades to a calm fallback.
- **Fail-open:** if KV errors, the request is allowed through (never block someone in crisis).
- **KV caveat:** KV reads are edge-cached / eventually consistent, so under a burst the per-IP count lags and over-permits, then hard-blocks once consistent. (This is what caused the "empty responses after ~30 calls" during the IE hardening pass — those were 429s whose JSON body the test scripts parsed as an empty SSE stream.)
- **Gap it left:** no global/total counter — a spike from many different IPs would pass straight through to paid Claude calls (each IP under its own 10). That gap is what the new feature below closes (alert-only).

---

## New this session — global daily request counter + email alert (cost-safety)

**What it does.** A global daily counter independent of the per-IP limit. It increments on every request that **passes the per-IP gate** (i.e. requests that will actually call Claude and cost money). When a day crosses the threshold, it sends **one** heads-up email and then stays quiet for the rest of the day.

**Key properties (all by design):**
- **Threshold: 200 Claude-bound requests/day** (`GLOBAL_ALERT_THRESHOLD = 200`, `worker.js` rate-limit config block). One constant — change it if normal traffic grows.
- **Alert-only — never blocks.** Wrapped in its own try/catch; the per-IP logic and the bereavement crisis path are completely untouched. A many-IP spike is now *visible* even though no single IP is blocked.
- **One email per day.** Counter key `global:<UTC-date>` (48h TTL, self-expiring); dedupe flag `global-alerted:<UTC-date>` is written *before* the send so subsequent requests that day don't re-trigger it. (Minor: under a burst at the exact crossing moment a duplicate is theoretically possible — acceptable for a heads-up.)
- **Email body:** date (UTC), requests-so-far, threshold, and a note that nothing was blocked. Goes to **waynemstevens@gmail.com**.
- **Fail-safe — the email can never affect a user.** Sent fire-and-forget via `ctx.waitUntil(...)` (runs after the response); `sendThresholdAlert()` swallows all its own errors and no-ops with a log line if the key is missing. A failed/slow/missing-key email is invisible to the user — their plan still streams normally.

**Code:** `worker.js` — config + `sendThresholdAlert()` helper in the rate-limit config block (~`:1668–1717`); the counter/alert block sits right after the per-IP block, before intake parse (~`:1770–1792`). Single commit `44dd414`.

**Verification (done this session):**
- Deployed a temp `threshold=1` / high-per-IP-max build, fired one request → counter crossed, request returned HTTP 200 unaffected, Resend accepted the send (no error logged), **email confirmed in Wayne's inbox**.
- Fail-safe also proven: the first test run (before the secret was set) logged `RESEND_API_KEY is not set — no email sent` and the request still returned 200.
- Restored production values (`threshold=200`, `RATE_LIMIT_MAX=10`), redeployed (**Worker `8c7bbe00`**, == committed code), and deleted the test KV keys (`global:2026-06-21`, `global-alerted:2026-06-21`).

---

## Resend setup (operational — important constraints)

- **API key lives as a Worker secret:** `RESEND_API_KEY` on `cutadrift-engine` (set via `wrangler secret put RESEND_API_KEY` — **not in source/git**, never committed). Confirmed present via `wrangler secret list` alongside `ANTHROPIC_API_KEY`. Setting a secret takes effect immediately — no redeploy needed.
- **Free tier:** 100 emails/day, 3,000/month — vastly more than a once-daily alert needs.
- **⚠️ Sandbox-sender constraint (the load-bearing one):** the sender is the shared `onboarding@resend.dev` (`ALERT_EMAIL_FROM`), which Resend only delivers to the **account-owner's own email address**. This works **only as long as the Resend account stays tied to `waynemstevens@gmail.com`**. If the alert recipient ever needs to change, or you want a `@cutadrift.org` sender, you must **verify the cutadrift.org domain in Resend** (add the DNS records it provides) and update `ALERT_EMAIL_FROM` — otherwise sends to any non-owner address are rejected.
- **Gotcha that bit us once:** `wrangler secret put` must be run from the project dir (`~/Desktop/Cut Adrift`) so it targets `cutadrift-engine`; the first attempt didn't take (the Worker logged "not set") — re-running it from the right place in a normal terminal fixed it.

---

## Next session — START HERE

**US bereavement hardening pass** — the last bereavement country. Same method as AU/UK/IE:
1. **Diagnostic first:** live `curl` chronic + acute against the Worker for `country=us` (template: `tests/diag_bereavement_ie.mjs` — swap `country`, scenarios, LEAK/GOOD term lists). Scan for fabricated phones, invented/mangled URLs, wrong-country org leaks (watch for UK/IE bleed now that those are detailed — HMRC, Tell Us Once, CAT, "inheritance tax"), outdated terminology.
2. **Independently web-verify** every contact/figure before baking it in.
3. **Fix** with a verified-contacts US block (probate is **state-based** → likely suppress + search-pattern like the CA approach, no national probate office/fee; Social Security Administration death notification — often done by the funeral director, SSA `1-800-772-1213`, verify; grief lines verify before baking; estate vs inheritance tax varies by state).
4. **Large-sample re-test** — the H27 (UK) lesson: a clean 3+3 is *not* sufficient; the ~7% intermittent tail (cross-country leaks, digit-mangles, defunct names) only shows at 10+ runs per scenario. Pace calls (~8s) and retry on empty — the Worker rate-limits hard after many test calls in a session (and now also increments the global counter, though that's alert-only at 200 and won't interfere).
5. Then the **diagnosis tool** (untouched across all six countries) is the next tool.

Carry-forward method reminders are in project memory (`incapacity-country-hardening.md`) and H27/H28.

---

## Outstanding tasks

### ⚡ Priority
1. **US bereavement hardening** (see "Next session" above), then **diagnosis tool**.
2. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign). Carried.
3–6. *(Carried: DIWM Phase 3 #3 cover-letter; capture stubbed-test payloads; GSC request-indexing for 8 pages; apply homepage design system site-wide.)*

### Consider / Ongoing
7. Consider whether `GLOBAL_ALERT_THRESHOLD = 200` is the right line once real traffic is known (currently a sensible guess; one constant to tune).
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
| 29 | Audited existing per-IP rate limiting (10/IP/24h, KV, shared, clear 429). Built **global daily request counter + once-per-day Resend email alert** (alert-only, never blocks, fail-silent; threshold 200; to waynemstevens@gmail.com). Verified end-to-end incl. inbox receipt + fail-safe. Resend key set as Worker secret `RESEND_API_KEY`. Worker `8c7bbe00`, commit `44dd414`. |
