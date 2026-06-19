# Cut Adrift — Handover Document 21
**Updated:** 19 June 2026
**Session work:** Verified and closed out all three priority items from Handover 20 (sitemap/homepage link, manual DIWM panel spot-checks, E2E test harness rebuild); found and fixed a real gap — 4 guide pages (AU/IE/Ireland/Canada/US) had zero disclaimer despite being listed as needing one; refreshed homepage copy to reflect that the tool now drafts real letters/messages, not just plans; began using Claude Code directly for file-editing tasks mid-session
**Supersedes:** Handover 20

---

## Project overview

**URL:** https://cutadrift.org
**Purpose:** Free crisis navigation tools for life's hardest moments.
**Entity:** TNW Limited (NZ registered)
**GitHub:** `waynemstevens-lab/cut-adrift` (private)
**Cloudflare Pages project:** `cutadrift`
**Worker:** `cutadrift-engine`
**KV namespace ID:** `3a74818b39634ca494158c8dc55d8cd9`

---

## Local file structure

```
~/Desktop/Cut Adrift/
├── Public/                              ← deploy root
│   ├── index.html                       ← homepage (4 tool cards, copy refreshed this session)
│   ├── sitemap.xml                      ← 42 URLs, all confirmed present and live
│   ├── when-someone-dies/               ← bereavement tool
│   ├── when-someone-cant-manage/        ← incapacity/carer tool
│   ├── when-you-get-a-diagnosis/        ← diagnosis tool
│   ├── plan/                            ← shared plan renderer + all "Do it with me" panels
│   ├── what-to-do-when-someone-dies-au/ ← disclaimer added this session
│   ├── what-to-do-when-someone-dies-ireland/  ← disclaimer added this session
│   ├── what-to-do-when-someone-dies-canada/   ← disclaimer added this session
│   ├── what-to-do-when-someone-dies-us/       ← disclaimer added this session
│   └── [other guides + country index pages]
├── tests/
│   └── test_suite.mjs                   ← NEW — E2E scenario harness, rebuilt this session
└── Handovers/
```

---

## Deploy commands

```bash
# Commit and push (from Cut Adrift/)
cd ~/Desktop/Cut\ Adrift && git add -A && git commit -m "msg" && git push

# Deploy pages
cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --branch=main --commit-dirty=true 2>&1

# Deploy worker (not needed this session — no worker changes)
cd ~/Desktop/Cut\ Adrift && npx wrangler deploy 2>&1

# Run the E2E test harness
cd ~/Desktop/Cut\ Adrift && node tests/test_suite.mjs
```

No worker deploys this session — all changes were static HTML (`Public/`) and a new test file. Four git pushes went out, but only two required an actual Cloudflare Pages deploy — the other two touched `Handovers/` and `tests/`, neither of which is inside the `Public/` deploy root:

1. `85cc6ba`→`75a85cf` — push only, no deploy needed (session 20's handover doc — committed *in* session 20, but never pushed until this session)
2. `0980256` — push only, no deploy needed (E2E test harness, lives in `tests/`)
3. `bd21fec` — pushed **and deployed** (disclaimer blocks added to AU/Ireland/Canada/US bereavement guides)
4. `9d50a9f` — pushed **and deployed** (homepage copy refresh)

Latest commit: `9d50a9f`. All pushed to `origin/main`.

---

## Priority items from Handover 20 — all closed out

### 1. Sitemap + homepage NZ guide link — CONFIRMED LIVE
Both verified directly against production:
```bash
curl -s https://cutadrift.org/sitemap.xml | grep -c "kiwisaver-death-claim-nz\|how-to-register-a-death-nz\|nz-probate-guide\|acc-death-benefit-nz"
# → 4
curl -s https://cutadrift.org/ | grep -c "what-to-do-when-someone-dies-nz"
# → 1
```
The session 20 handover commit itself (`75a85cf`) had also never been pushed — caught and pushed this session.

### 2. Manual spot-check of the three new DIWM panels — ALL PASS
Walked both tools live in browser, checked anchoring and output quality:

**Bereavement, Path B, employed:**
- "Notifying their employer" — correct heading, correct conditional content (final pay, death-in-service, KiwiSaver, equipment return), DIWM button drafts a clean, well-formed letter referencing relationship/job title/employer name. No anchor collision.
- "The people around you" — correct heading, dependant-care subsection (child/disability/pet) sits correctly inside it, DIWM button drafts a warm, appropriately-paced family message.

**Diagnosis, employed + work_impact yes/unsure:**
- "The people in your life" — always-included as designed, correctly cross-references the employment section rather than duplicating it. DIWM message-draft correctly used the condition name (MS) since the user had already named it themselves in the free-text intake — confirms the "never name a condition the user hasn't named" system-prompt rule is working as intended, in both directions.
- "Your insurance" — distinct section from "Your income"/KiwiSaver, no anchor collision (matches what Handover 20 claimed was verified). Covers trauma/critical illness, income protection, life cover, TPD. DIWM "Script for my insurance call" produces a thorough, well-structured call script.

### 3. E2E test harness rebuilt — DONE, committed
`tests/test_suite.mjs` now exists in the repo (not `/tmp`), so it can't be lost between sessions again. Built from two **real captured payloads** (via Chrome DevTools → Copy as cURL), not guessed field names:

- `Bereavement — Path B, employed, full plan` — PASS
- `Bereavement — employer-notify DIWM panel` — PASS

Confirmed the worker contract: single POST to `https://cutadrift-engine.waynemstevens.workers.dev/`, routed by a flat `tool` field in the JSON body, streaming back **Anthropic Messages API SSE events** (not plain JSON) — `content_block_delta` for text, `message_delta.delta.stop_reason` for completion status. The harness parses this properly.

**6 scenarios are stubbed as `needsPayload: true`** (not yet captured): bereavement Path C/weeks_ago, bereavement family-message DIWM, diagnosis full plan, diagnosis family-message DIWM, diagnosis insurance-call DIWM, incapacity/carer full plan. Capture method is documented inline in the file's comments — open the tool in browser, DevTools → Network → walk to the relevant screen → right-click the worker POST → Copy as cURL → pull the `--data-raw` JSON → paste into the scenario, remove the `needsPayload: true` flag.

**One non-determinism note:** on first run, "Bereavement — Path B" failed because the live plan didn't contain the literal string `## Notifying their employer`. Re-ran immediately — passed clean. This confirms it's LLM wording variance, not a structural bug — but unlike "The people around you" (deliberately pinned to fixed wording in session 20 specifically for DIWM anchor reliability), "Notifying their employer" was never given the same treatment. **Low-priority follow-up:** consider pinning that heading to fixed text next time the bereavement prompt is touched.

---

## New work this session — disclaimer gap found and fixed

Item #6 from Handover 20's outstanding list ("Check disclaimers on 4 remaining what-to-do pages") was assumed to be a confirmation check. It wasn't — **none of the four pages had a disclaimer at all**, not even the CSS class:

```bash
grep -L "general information only\|page-disclaimer" \
  Public/what-to-do-when-someone-dies-au/index.html \
  Public/what-to-do-when-someone-dies-ireland/index.html \
  Public/what-to-do-when-someone-dies-canada/index.html \
  Public/what-to-do-when-someone-dies-us/index.html
# → all four printed (i.e. all four were missing it)
```

Fixed via Claude Code (first task handed to it this session — see workflow note below). Used the NZ page's `.page-disclaimer` CSS as a verbatim template, inserted before `</style>` in all four files. These four pages lack an `<article>` tag (unlike NZ), so the disclaimer div was correctly placed right before `</main>` instead of "after `</article>`" — Claude Code caught this structural difference itself rather than blindly copying NZ's exact anchor point.

Country-specific legal-aid references chosen per page (no single national CAB-equivalent exists in AU/Canada/US, so a substitute was used):
- **AU** → National Legal Aid (nationallegalaid.org)
- **Ireland** → Citizens Information (citizensinformation.ie) — genuine 1:1 CAB equivalent, wording uses "solicitor" to match local usage
- **Canada** → Dept. of Justice legal aid program (justice.gc.ca)
- **US** → LawHelp.org

Committed as `bd21fec` (4 files, 52 insertions), pushed, deployed, verified live — all four return `2` for `page-disclaimer` (CSS class + div) on production:
```bash
for c in au ireland canada us; do
  echo "$c: $(curl -s https://cutadrift.org/what-to-do-when-someone-dies-$c/ | grep -c 'page-disclaimer')"
done
# au: 2 / ireland: 2 / canada: 2 / us: 2
```

---

## New work this session — homepage copy refresh

The product has outgrown its own homepage copy. Cut Adrift now drafts real letters, messages, and call scripts for bereavement and diagnosis users (DIWM panels), but the homepage still framed the whole product as "we'll give you a clear, short-term plan" — informational only, no mention of the drafting capability.

Four targeted text-only changes made (structure/styling untouched, carer and redundancy cards deliberately left alone since those tools don't have DIWM panels yet):

| Location | Before | After |
|---|---|---|
| Hero subhead | "...we'll give you a clear, short-term plan." | "...we'll build you a clear plan to follow." |
| Trust badge | "AI-assisted — guides reference official sources" | "AI-assisted plans — verified against official sources" |
| Bereavement card | "...from the practical to the people." | "...including letters to their employer and messages to family, already drafted for you." |
| Diagnosis card | "...income protection cover you may not realise you have." | "...income protection cover you may not realise you have, with the calls already drafted to claim it." |

**Note:** the `<meta name="description">` and `<meta property="og:description">` tags still contain the old "clear, short-term plan" wording (lines 7 and 9) — deliberately scoped out of this patch since it specified the visible H1 paragraph only. **Follow-up to consider:** update these meta tags too if SEO/social-share descriptions should reflect the new positioning.

Committed as `9d50a9f` (1 file, 4 insertions/4 deletions), pushed, deployed, verified live — all four phrases confirmed present on production via grep. Regression-checked afterward that the disclaimer work from earlier in the session wasn't disturbed (still `2` on all four guide pages).

---

## Workflow note: Claude Code now in active use

Partway through this session, file-editing tasks (the disclaimer patch and the homepage copy patch) were handed to **Claude Code** running in Terminal (`cd ~/Desktop/Cut Adrift && claude`) instead of the screenshot-paste-grep loop used earlier in the session. This worked well — Claude Code read files directly, proposed diffs for review before writing, ran its own verification greps, and handled commit/push/deploy in the same session.

**Recommended going forward:** route direct file edits (HTML patches, copy changes, multi-file refactors) through Claude Code from the project folder. Reserve this Claude.ai chat for planning, review, QA verification, and synthesis work like this handover doc — less back-and-forth, faster turnaround, no risk of terminal-screenshot transcription errors.

One early hiccup worth remembering: Claude Code defaults to launching in the home directory if you just type `claude` from `~`. Always `cd` into the project folder *first*, then launch — the welcome banner will confirm the working directory.

---

## Outstanding tasks

### ⚡ Priority

**1. Capture payloads for the 6 stubbed test scenarios**
`tests/test_suite.mjs` has the method documented inline. Not urgent, but each capture takes a few minutes and meaningfully increases regression coverage.

**2. Build "Do it with me" — Phase 3** (carried from Handover 19/20, unchanged)
- Incapacity/Carer: family-coordination message + GP/specialist question prep
- Not Redundant: integrate same pattern into cover-letter tool
- Once built, the carer card on the homepage can get the same "already drafted for you" copy treatment given to bereavement/diagnosis this session.

**3. GSC Request Indexing — corrected pages** (carried from session 16, unchanged)
```
https://cutadrift.org/uk-bereavement-support-payment/
https://cutadrift.org/uk-bereavement-leave/
https://cutadrift.org/us-social-security-survivor-benefits/
https://cutadrift.org/us-funeral-financial-assistance/
https://cutadrift.org/us-bereavement-leave/
https://cutadrift.org/what-to-do-when-someone-dies-nz/
https://cutadrift.org/uk-funeral-expenses-payment/
https://cutadrift.org/what-to-do-when-someone-dies-uk/
```

### Consider

**4. Update meta description / og:description tags** to match the refreshed hero copy (currently still say "clear, short-term plan" — see homepage copy section above).

**5. Pin "Notifying their employer" heading** to fixed wording in the bereavement system prompt, same treatment "The people around you" got in session 20 — would remove the one source of test-harness flakiness found this session.

### Ongoing (unchanged from Handover 20)
6. **Outreach follow-up** — 5 bereavement orgs contacted session 8; follow-up due week of 23 June 2026 (now imminent)
7. **OG image** — placeholder still in place; real branded image outstanding
8. **Feedback form** — confirm still feeding Google Sheet with `[Cut Adrift]` prefix
9. **Best Man notice board redesign** — see session 16 handover
10. **Best Man placeholder testimonials** — James P., May 2026 on both sites; replace with real quotes
11. **GSC indexing queue** — remaining ~24 guide pages (see session 16)
12. **Diagnosis tool guide pages** — 30 pages (5 per country) not yet built
13. **Consider:** extending the bereavement "tell my family" panel to Path C (weeks_ago) if feedback indicates it's needed there
14. **Consider:** applying the "Your first action" closing line to the carer tool once its real prompt is built

---

## Commits this session

| Commit | Message |
|---|---|
| `0980256` | Add E2E test harness (rebuilt after /tmp loss in session 19/20) |
| `bd21fec` | Add page-disclaimer block to AU, Ireland, Canada, US bereavement guides |
| `9d50a9f` | Refresh homepage copy to highlight drafted letters/calls |

Note: `75a85cf` (session 20's handover doc) was **committed in session 20**, not this one — this session only pushed it, since it had been sitting unpushed locally since last session. Not included in the table above, as it isn't a session 21 commit, just a session 21 push.

All commits/pushes above went to `origin/main`.

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
| 19 | "Do it with me" Phase 2 (bereavement leave email + bank letter); bereavement employment question added to intake; mandatory "Your work and leave" plan section; leave-email matcher fixed; "first action" closing line added; bereavement+incapacity max_tokens 2000→3000; 6-scenario E2E suite passed (later lost from `/tmp`) |
| 20 | Deceased's employer letter (bereavement): `deceased_employment` intake question + weeks_ago routing fix + mandatory "Notifying their employer" section + DIWM panel. "Tell my family" message DIWM panels for bereavement and diagnosis. Insurance call script DIWM panel for diagnosis. Sitemap/homepage NZ-link fix kicked off but not confirmed deployed. `test-cutadrift.sh` run live: 23/30 passed, 5 pre-existing findings unrelated to session, 2 false alarms. E2E scenario harness lost from `/tmp` again, needs rebuilding. |
| 21 | Confirmed and closed all 3 priority items from Handover 20 (sitemap/link, DIWM spot-checks, test harness rebuild — this time committed to `tests/` so it persists). Found 4 guide pages (AU/IE/CA/US) had **no** disclaimer at all, not just unconfirmed — fixed, deployed, verified live. Refreshed homepage copy across hero subhead, trust badge, and bereavement/diagnosis cards to reflect the product's actual drafting capability. Began using Claude Code directly for file-editing tasks mid-session — recommended as the default going forward for this kind of work. |
