# Cut Adrift — Handover Document 33
**Updated:** 21 June 2026
**Session work:** **Rebuilt the homepage proof gallery** from a lopsided 3×diagnosis / 1×incapacity set to **one card per intake situation** (bereavement / diagnosis / incapacity / job-loss), so the gallery mirrors the four "what best describes your situation" intake cards. Sourced fresh DIWM captures via the test-bypass header, curated the strongest excerpt per situation, wrote new italic "…plus" closing lines, fixed a missing `.gallery-tag.clay` CSS rule, then committed (`9ed430e`), pushed, and deployed to `cutadrift.org`.
**Supersedes:** Handover 32 (ran in parallel with the diagnosis NZ-hardening session — that work is in H32 and is unaffected).

---

## Project overview / Deploy commands

*(Unchanged — see Handover 24/25.) Two separate deploys, do not confuse them:*
- **Worker (the prompts + rate limiter):** `wrangler deploy` → `cutadrift-engine`. URL `https://cutadrift-engine.waynemstevens.workers.dev/`. **Not touched this session.**
- **Static site:** from `Public/`, `npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true` → serves `cutadrift.org`. **Deployed this session** (preview `https://c4699a8c.cutadrift.pages.dev`, production alias updated). The `wrangler.toml` "missing `pages_build_output_dir`" warning is benign — Pages ignores the config and deploys `.` directly, as in prior sessions.

**Test-bypass header (from H31):** `X-Internal-Test: 498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04` — skips per-IP gate + global counter, so capturing real outputs is free of the public rate limit. Hard-coded as a fallback in the capture/test scripts.

---

## New this session — homepage proof gallery remap (DONE + DEPLOYED)

**The problem.** The gallery (`Public/index.html`, `<section class="gallery">`) showed **4 cards but only 2 situations**: 3× diagnosis + 1× incapacity. Bereavement and job-loss weren't represented, and the one bereavement DIWM output already on the page (the **leave-email**) is the standalone proof card near step III — reusing it in the gallery would have duplicated content.

**The remap — one card per intake situation**, in intake order, preserving the deliberate rust/sage diagonal (sage·clay / clay·sage — *not* semantic colour-coding):

| Pos | Situation | Panel chosen | Tag |
|-----|-----------|--------------|-----|
| 1 (top-left)  | **Bereavement** | `bereavement-bank-letter` | sage |
| 2 (top-right) | **Diagnosis**   | `diagnosis-insurance-call` | clay |
| 3 (bot-left)  | **Incapacity**  | `incapacity-family-message` (dementia / ask-help) | clay |
| 4 (bot-right) | **Job loss**    | **reserved slot — commented stub** | sage |

**Why each pick (curation rationale, in case a future pass revisits):**
- **Bereavement → bank-notification-letter.** Switched off the leave-email (already the step-III proof card). Of the three unused bereavement DIWM panels (bank-letter / employer-notify / family-message), the bank letter is the most *dreaded* bureaucratic task and the output is strikingly complete (executor capacity, "locate the accounts from these details", documents required, **stop-all-mail/marketing request**, direct debits). Also maximally distinct in format from the leave-email card. Employer-notify was the strong runner-up (surfaces final pay / holiday owed / death-in-service / KiwiSaver). Family-message was weakest — closest in shape to the existing proof card.
- **Diagnosis → insurer-call-script.** Reduced the three diagnosis panels to one. The call script is the strongest "knows things you wouldn't" proof — its "What to listen for" names Partners Life stand-downs (4/8/13 wk), benefit periods, and hidden trauma cover. Employer-email was too generic (any assistant writes a decent leave email); gp-questions was a long list.
- **Incapacity → family-message (dementia / ask-help).** Ran the family-message panel across **3 detailed scenarios** (dementia/ask-help, partner-fall/organise, decline/inform) plus a fresh detailed gp-questions run, and picked the dementia/ask-help message: richest output, turns vague offers into concrete low-guilt asks ("regular phone or video calls… phone-based admin"), directly defuses overseas-sibling guilt. **Deliberately chose the message over the (more knowledge-dense) gp-questions** to keep the four cards format-distinct — gp-questions is a question-list, same shape as the diagnosis card, and two list-cards side by side read as repetitive. Excerpt trimmed to start at "Hi everyone," to skip a hallucinated name (see Known issue).
- **Job loss → reserved slot.** Left as a **commented-out card stub** in the markup (sage tag, restore instructions inline) — *not rendered*, so no empty/placeholder card ships before a real capture exists. The job-loss/CV tool lives in the **separate Not Redundant repo**, out of scope for Cut Adrift sessions. **Visual consequence:** the grid currently renders **3 cards with a bottom-right gap**; the rust/sage diagonal only *completes* when card 4 lands.

**Fresh "…plus" closing lines** (italic, low-key, gesture at what's *not* in the excerpt) written for all three live cards — see the markup.

**The `.gallery-tag.clay` fix.** The Diagnosis tag was reported rendering as bare text (no pill). Investigation showed the markup was byte-identical to the working Incapacity tag and the base `.gallery-tag` rule already defaulted to `background: var(--clay)` — i.e. **no actual code bug; it was a stale browser render** (confirmed: a hard-refresh showed clay correctly). Even so, added an explicit `.gallery-tag.clay { background: var(--clay); }` rule and put `clay` on both previously-bare tags, so the diagonal is now **self-documenting in both CSS and markup** (sage/clay are all explicit) and nobody misreads the bare default again.

**Capture infrastructure (new).** `tests/capture_gallery_v2.mjs` — clones `capture_diwm.mjs`: bypass header, SSE parse, retry-on-empty, saves to `tests/captures/`. Generated 7 NZ captures (3 bereavement panels, 3 incapacity family-message scenarios, 1 fresh incapacity gp-questions). All committed, so the **runner-up captures are on disk** if a future pass wants to swap a card (e.g. `bereavement-employer-notify.md`, `incapacity-family-message-B-fall.md`, `incapacity-gp-questions-v2.md`).

Committed **`9ed430e`** (9 files, +349/−24), pushed to `main` (`waynemstevens-lab/cut-adrift`), deployed.

## ⚠️ Known issue to flag for next incapacity pass (NOT fixed this session)

The `incapacity-family-message` capture **invented a sibling's name — "Gavin" — that was never in the intake scenario** (the persona said only "my two brothers", unnamed). The raw output opened *"Hi everyone — this includes you, Gavin and [brother's name]…"*. This is a **model hallucination, not a curation issue** — the gallery excerpt was trimmed past it so the live card is clean, but the underlying panel will do this for real users. **Worth checking during incapacity's next hardening/QA pass** (does the family-message prompt need a "do not invent names not supplied" guard?).

## Next session — START HERE

1. **Diagnosis tool — AU/UK/IE/CA/US hardening.** Carried from H32, still the top priority. NZ is done; the other five are unhardened (inline-all-countries phrasing is the same latent leak risk each). Same method: clone `tests/diag_diagnosis_nz.mjs`, swap country + FAIL/PRESENCE checks, baseline via bypass header, add a per-country "use only these" entity block, deploy, re-test. Watch the false-positive classes documented in H32 (generic insurance "illness benefit", "access to Work and Income", lowercase "statutory sick pay", a country's own benefit colloquialised).
2. **Job-loss gallery card — separate Not Redundant repo session.** Capture the strongest CV / job-loss tool output there, then drop it into the reserved card-4 stub here (uncomment, `gallery-tag sage`, add a fresh "…plus" line) to complete the 2×2 diagonal.
3. **Incapacity family-message hallucinated-name check** (see Known issue above) — fold into the incapacity tool's next QA pass.

---

## Outstanding tasks

### ⚡ Priority
1. **Diagnosis tool — AU/UK/IE/CA/US hardening** (NZ done H32). See "Next session".
2. **Job-loss gallery card** — needs its own Not Redundant repo session, then slot into card-4 stub here.
3. Homepage design system not yet applied site-wide (guides + tool pages still pre-redesign). Carried.
4. *(Carried from H31/H32: DIWM Phase 3 cover-letter; GSC request-indexing for 8 pages.)*

### Consider / Ongoing
5. **Incapacity family-message invents unsupplied names** (this session) — "Gavin" hallucination; add a no-invented-names guard during incapacity's next hardening pass.
6. Gallery renders **3 cards + bottom-right gap** until the job-loss card lands — fine if homepage won't redeploy meaningfully before then; revisit if it ships long-term.
7. `GLOBAL_ALERT_THRESHOLD = 200` — revisit once real traffic is known (H29).
8. **Watch: "The Dinner Party" residual in US bereavement** (H31) — US-gated in-stream rewrite if it persists.
9. Diagnosis NZ residual: Title-Case "Statutory Sick Pay" in self-employed negation (~1–2/20) — non-leak, factually correct, left as-is (H32).
10. Mobile click-through still owed on the redesigned homepage — the hairline-grid gallery cards + floating proof card are the two narrow-width risk spots (spec note). 11. Pin "Notifying their employer" heading in the bereavement prompt. 12. Tighten `verify_crisis.mjs` Path A assertion. 13. `wrangler.toml` missing `pages_build_output_dir` (non-fatal). 14. Confirm sage favicon at tab size. 15. **Outreach follow-up (5 bereavement orgs) due week of 23 June 2026 — imminent.** 16. OG image placeholder. 17. Feedback form → Google Sheet. 18–21. *(Best Man notice board / testimonials; GSC indexing queue; diagnosis guide pages — see H25.)*

---

## Session history summary
*(See Handover 25 for sessions 1–25.)*

| Session | Key work |
|---------|----------|
| 26 | Bereavement **Australia** hardened. Worker `05a653a4`. |
| 27 | Bereavement **United Kingdom** hardened. Worker `bd4e5ea5`. |
| 28 | Bereavement **Ireland** hardened. Worker `ebf1d4cd`. |
| 29 | Per-IP audit + **global daily counter + Resend alert**. Worker `8c7bbe00`. |
| 30 | Bereavement **United States** hardened — bereavement sweep complete. Worker `960fb7e0`. |
| 31 | **Test-bypass header** added; captured DIWM outputs; homepage **gallery** first built+deployed; **US bereavement re-test closed**. Worker `afac0f2e`. |
| 32 | **Diagnosis tool NZ-hardened** (first hardening of the only never-hardened tool). New harness `tests/diag_diagnosis_nz.mjs`; **Worker `a9cafbe7`**; 19/20 clean, Equality Act 2× → 0×. Declined the in-stream rewrite — every "survivor" was a harness false positive. |
| 33 | **Homepage proof gallery remapped** to one card per intake situation (bereavement bank-letter / diagnosis insurer-call / incapacity family-message / job-loss reserved stub). New capture script `tests/capture_gallery_v2.mjs` + 7 NZ captures. Fixed `.gallery-tag.clay` (stale-render, not a real bug; made colours explicit). Commit **`9ed430e`**, pushed + Pages-deployed. No worker change. Flagged: incapacity family-message hallucinated an unsupplied name ("Gavin"). |
