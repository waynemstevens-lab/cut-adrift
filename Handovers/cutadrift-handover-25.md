# Cut Adrift — Handover Document 25
**Updated:** 20 June 2026
**Session work:** Full visual redesign of the homepage — new palette, logo, headline, and a "proof card" device showing actual drafted output. Deleted three stacked `!important` design systems from `index.html` (original dark editorial → desktop-grid patch → session 16's cork-board "NOTICE BOARD REDESIGN") and replaced with one clean stylesheet. Updated trust-strip/footer wording site-wide ("No ads, ever" → "We don't sell your data") across all 26 affected pages. Confirmed GSC indexing is healthy (42/8, no real problem — earlier concern was a false alarm). Deployed and verified live on cutadrift.org.
**Supersedes:** Handover 24

---

## Project overview

*(Unchanged from Handover 24 — see that doc for URL, entity, GitHub, Cloudflare project/worker/KV details.)*

---

## Deploy commands

*(Unchanged from Handover 24.)*

---

## New work this session

### 1. GSC indexing review — false alarm, closed

Investigated a search-tool concern (Claude's web search couldn't surface cutadrift.org at all, even for exact branded queries and specific guide-page slugs). Direct GSC inspection showed **42 pages indexed, 8 not** — a healthy ratio with indexed count trending up. The 8 not-indexed broke down as: `/terms/` correctly excluded by noindex tag (intentional, not a bug), 2 "discovered — not yet indexed" (normal lag), 1 "crawled — not indexed," and the rest redirect/duplicate-canonical related. Conclusion: no real indexing problem — the earlier search-tool result was a coverage gap on Claude's end, not a site issue. No action taken; not worth revisiting unless indexed count drops.

### 2. Homepage redesign — full rewrite

**Background:** Wayne flagged the homepage "look" as unconvincing and the "No ads, ever" trust-strip line as a risky absolute claim. Investigation of the live `index.html` found three competing design systems layered via `!important` overrides fighting each other — a dark editorial original, a desktop-grid patch, and session 16's cork-board "pinned notice" redesign (the one actually rendering, since it's last in the cascade). Two real bugs fell out of the layering: pale text on the cork-board's tan background (mission statement, suggestion box) was close to unreadable, and several elements referenced a `Source Sans 3` font that was never loaded.

**Design exploration (Claude.ai chat, iterative):** Several directions were mocked up and rejected before landing on the final one:
- A "compromise" dark-but-restrained direction (warm near-black, clay/sage palette, Fraunces/Inter typography, custom line icons replacing the emoji icons) — rejected as "too severe" / too flat (lost the atmospheric depth the original had).
- An ivory/fine-stationery direction (warm bone background, hairline-divided flat cards, brass accent) — built and discussed but ultimately not the chosen direction once "expensive" was clarified as the actual goal, not specifically "light."
- A reference to a SaaS dark-mode design (Fluent) prompted reconsidering dark-with-atmosphere rather than dark-and-flat — the useful takeaway adopted was showing actual product output (a real drafted letter) rather than just describing capability in words; the glowing/energetic SaaS styling itself was deliberately not carried over, since it doesn't fit the emotional register of the audience.

**Final locked decisions:**
- **Palette:** warm near-black background (`#15120e`) with two soft atmospheric radial gradients (clay top-left, sage bottom-right) rather than flat color. Clay (`#c1734f`) as primary accent throughout the page; sage (`#7c8d76`) used specifically on the logo mark only (Option B in the final side-by-side comparison — sage stayed isolated to the logo rather than being promoted to primary).
- **Typography:** Fraunces (serif, headlines/accents) + Inter (body/UI), replacing Cormorant Garamond + DM Sans.
- **Logo:** the existing `favicon.svg` compass/diamond mark (previously browser-tab-only) recolored to sage and brought into the page as an in-line logo next to the wordmark. Filled version chosen over an outline — holds up better at small sizes. Several from-scratch logo concepts (a "broken ring," frayed-rope lines) were explored and discarded once the existing favicon was found and judged stronger — a more resolved single gesture than anything built from scratch.
- **Header/nav:** restructured from a stacked wordmark+strapline into a proper horizontal bar — logo + wordmark left, "Guides" / "Why it's free" anchor links right, hairline border-bottom. Strapline removed from header (messaging preserved via the trust strip lower on the page, not lost).
- **Headline:** changed from "When you don't know where to start." to **"When you don't know where to start — or what to say."** — additive fix keeping the persona-broad opener from session 24 while adding the second clause that signals the actual differentiator (drafting, not just planning).
- **New "how it works" element:** a 3-step strip (Roman numerals I/II/III in italic Fraunces, hairline-divided columns) explaining the ask → plan → draft mechanism, which was previously only implied in the subhead and never shown.
- **New "proof card" element:** a floating, realistically-styled drafted letter (a short bereavement-leave email excerpt, tagged "Drafted for you") sitting below the how-it-works strip — the single highest-impact new element, showing actual output instead of describing it.
- **Situation cards:** restyled from individual rounded/shadowed boxes into a flat hairline-grid (2×2 desktop), no rotation/shadow. Emoji icons replaced with custom-drawn line SVGs (flame, pulse line, two overlapping circles, briefcase).
- **Trust strip / footer:** "No ads, ever" → "We don't sell your data" — a durable, falsifiable claim instead of an absolute promise about a business model that could change.

**Spec document:** `cutadrift-homepage-redesign-spec.md` written and handed to Claude Code as an implementation-ready brief (saved to the project root, **not** `Public/`, since it's an internal working doc, not a deployable asset).

**Implementation (Claude Code):** Full rewrite of `Public/index.html` per spec — confirmed zero `!important` in the new stylesheet (one clean system, not a fourth patch layer). Footer line ("No ads. Built to help." → "We don't sell your data. Built to help.") updated site-wide across all 26 affected guide/tool pages, chosen over a homepage-only update for consistency. Privacy page already used the correct durable framing and needed no change. Added a `prefers-reduced-motion` guard (Claude Code's own addition, not in the original spec).

**Verification:** Local `file://` preview confirmed both desktop and mobile (Chrome DevTools device toolbar, iPhone XR dimensions) — proof card and hairline cards (the two elements flagged as highest mobile risk) held up cleanly with no overflow, cards correctly stacked to one column, and the clay/sage icon color split rendered as specified. One mockup-tool-only bug (a heading-color override blanking out part of the headline) was caught and fixed during the Claude.ai design phase — confirmed not present in the actual Claude Code build.

**Deployed and verified live:** commit `10b6096`, pushed to `main`, deployed via `wrangler pages deploy`. Confirmed live on cutadrift.org via incognito window (bypassing cache) — matches local preview.

---

## Commits this session

| Commit | Message |
|---|---|
| `10b6096` | Homepage redesign — new palette, logo, headline, proof card (29 files changed, 757 insertions, 751 deletions — covers the `index.html` rewrite, the site-wide footer wording update, and adds `cutadrift-homepage-redesign-spec.md` to the repo) |

Pushed to `origin/main`. Worker unchanged this session — no `wrangler deploy` needed.

**Deploy:** Pages only — preview `https://dbbba8e5.cutadrift.pages.dev`, production propagated to `https://cutadrift.org`.

---

## Closed without action

- **"GSC can't find the site" concern** — investigated and found to be a false alarm (search-tool coverage gap, not a real indexing problem). See item 1 above. Noted here so it isn't re-investigated.

---

## Outstanding tasks

### ⚡ Priority

1. **NEW — Country consistency review (flagged this session, not yet scoped).** Wayne flagged "some inconsistency" across countries to fix next session, without specifying exactly what. Two known candidates to check first:
   - The pre-existing gap from Handover 24: the incapacity tool only offers NZ/AU/UK/Ireland while bereavement and diagnosis offer all six countries (NZ/AU/UK/Ireland/Canada/US) — still unconfirmed whether deliberate or an oversight (H24's first step was read-only: check `SYSTEM_PROMPTS.incapacity` in `worker.js` for CA/US content before touching the frontend dropdown).
   - This session's homepage redesign was explicitly scoped to `index.html` only — the guide pages and tool pages still use the pre-redesign styling, so there's now a visual inconsistency between the homepage and every other page (this may or may not be what Wayne meant — confirm before starting work).
2. **Carried — incapacity tool's missing Canada/US options** (same item as above, listed separately per H24's original framing).
3. **Carried — DIWM Phase 3 item #3**, Not Redundant cover-letter integration. Still parked, cover-letter tool not live.
4. **Carried — capture payloads for stubbed test scenarios** in `tests/test_suite.mjs`.
5. **Carried — GSC Request Indexing** for the 8 corrected pages listed in Handover 24 (not yet resubmitted as far as known).
6. **NEW — apply the new homepage design system** (clay/sage palette, Fraunces/Inter, hairline aesthetic, custom icons) to guide pages and tool pages for site-wide visual consistency. Likely overlaps with item 1 — possibly the same task once scoped.

### Consider

7. **Carried** — pin "Notifying their employer" heading in the bereavement prompt.
8. **Carried** — tighten the `verify_crisis.mjs` Path A assertion.
9. **NEW — `wrangler.toml` missing `pages_build_output_dir`.** Claude Code flagged this as a non-fatal warning on every Pages deploy (the CLI flag overrides it correctly, so deploys aren't affected). Optional one-line fix: add `pages_build_output_dir = "Public"` if the repeated warning becomes annoying.
10. **NEW — confirm sage favicon recolor is live at actual tab size.** `file://` previews don't reliably resolve root-relative asset paths, so this couldn't be confirmed locally; worth a glance on the real domain. Low priority — the in-page logo (which matters more) is confirmed working.

### Ongoing

11. **Outreach follow-up** — 5 bereavement orgs contacted session 8; follow-up was due week of 23 June 2026 — now imminent.
12. **OG image** — still flagged as placeholder.
13. **Feedback form** — confirm still feeding Google Sheet with `[Cut Adrift]` prefix.
14. **Best Man notice board redesign** — see session 16 handover.
15. **Best Man placeholder testimonials** — James P., May 2026 on both sites; replace with real quotes.
16. **GSC indexing queue** — remaining ~24 guide pages (see session 16).
17. **Diagnosis tool guide pages** — 30 pages (5 per country) not yet built.

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
| 19 | "Do it with me" Phase 2 (bereavement leave email + bank letter); bereavement employment question; mandatory "Your work and leave" section; leave-email matcher fixed; "first action" closing line; bereavement+incapacity max_tokens → 3000; 6-scenario E2E suite (later lost) |
| 20 | Deceased's employer letter (bereavement) + weeks_ago routing fix + "Notifying their employer" section + DIWM panel. "Tell my family" DIWM panels (bereavement + diagnosis). Insurance call script DIWM panel (diagnosis). |
| 21 | Closed 3 priority items from Handover 20 (sitemap/link, DIWM spot-checks, test harness rebuilt into `tests/`). Found 4 guide pages with no disclaimer — fixed/deployed/verified. Refreshed homepage copy. Began direct Claude Code file editing. |
| 22 | Refined homepage hero subhead and footer trust line; verified live across mobile/tablet/desktop breakpoints. |
| 23 | DIWM Phase 3: incapacity family-coordination message + GP/appointment question-prep panels (incapacity + diagnosis), scoped to questions only. Added mandated headings to the incapacity prompt as stable panel anchors. Fixed DIWM payload field forwarding. Discovered incapacity tool IS the carer tool, deleted dead scaffolding. Cover-letter (#3) parked. |
| 24 | Homepage hero/title/meta refresh ("without warning" → "where to start," fitting all three personas). Built distress-adaptive bereavement intake — short-circuit on high-distress answers, abbreviated output, opt-in continue to full plan. Fixed continue-to-full routing asymmetry. Cleaned up superseded handovers 17–19. |
| 25 | Full homepage visual redesign — new palette (clay/sage), logo brought in from favicon, restructured nav, new two-clause headline, Roman-numeral how-it-works strip, "proof card" showing real drafted output, custom line icons, flat hairline card grid. Deleted three stacked `!important` design systems, replaced with one clean stylesheet. Site-wide trust-copy fix ("No ads, ever" → "We don't sell your data") across 26 pages. GSC indexing concern investigated and closed as a false alarm. Deployed and verified live. |

---

## Workflow note

This session leaned heavily on Claude.ai chat for the design exploration phase — multiple full visual mockups built and rejected in sequence (severe flat-dark, jaunty cork-board, ivory/stationery) before converging on the final direction, with a side-by-side comparison used to make the last palette-scoping decision (sage as primary vs. sage on the logo only). Once locked, everything was consolidated into a single implementation-ready spec and handed to Claude Code as one clean rewrite — explicitly instructed not to add a fourth `!important` layer on top of the existing three. Claude Code's build matched the spec closely on first pass, including the two judgment calls it surfaced proactively (footer-wording scope, confirming the privacy page needed no change) rather than guessing.

One process note worth keeping: mid-session, Claude.ai asserted a previous design decision was "already working" with no actual basis beyond documented design rationale (not real usage data) — caught and corrected when challenged directly. Worth treating "this was a considered decision" and "this is validated" as different claims going forward, on this project and others.
