# Cut Adrift — Handover Document 22
**Updated:** 19 June 2026
**Session work:** Refined homepage hero subhead and footer trust line copy (worked through Claude.ai for drafting/review, Claude Code for the file edits); verified the new copy across four real breakpoints (mobile, tablet portrait, tablet landscape, desktop) via Chrome DevTools Protocol — no overflow anywhere, both lines wrap cleanly on every size.
**Supersedes:** Handover 21

---

## Project overview

**URL:** https://cutadrift.org
**Purpose:** Free crisis navigation tools for life's hardest moments.
**Entity:** TNW Limited (NZ registered)
**GitHub:** `waynemstevens-lab/cut-adrift` (private)
**Cloudflare Pages project:** `cutadrift`
**Worker:** `cutadrift-engine`
**KV namespace ID:** `3a74818b39634ca494158c8dc55d8cd9`

*(Unchanged from Handover 21 — no structural, file-layout, or worker changes this session.)*

---

## Deploy commands

```bash
# Commit and push (from Cut Adrift/)
cd ~/Desktop/Cut\ Adrift && git add -A && git commit -m "msg" && git push

# Deploy pages
cd ~/Desktop/Cut\ Adrift && npx wrangler pages deploy Public --project-name cutadrift --branch=main --commit-dirty=true 2>&1

# Run the E2E test harness
cd ~/Desktop/Cut\ Adrift && node tests/test_suite.mjs
```

---

## New work this session — landing page copy refinement

The hero subhead and footer trust line on `Public/index.html` hadn't caught up to two things: the product now drafts real letters/calls/messages (not just "a plan"), and "built without fanfare" was a style flourish that didn't actually answer "what's the catch."

| Location | Before | After |
|---|---|---|
| Hero subhead | "Free, practical guides for life's hardest moments. Tell us what's happened — we'll build you a clear plan to follow." | "Free, step-by-step guidance for life's hardest moments — with the letters, calls, and messages already drafted for you." |
| Footer / mission line | "This site was built — without funding or fanfare — because it needed to exist. Free to use. No email, no account, no catch." | "This site was built by one person, not a company chasing growth — no ad revenue, no data resale, nothing to sell. Free to use. No email, no account, no catch." |

**Process note:** the first patch (`c619888`) swapped the hero cleanly, but on the footer it appended the new sentence after the old "without funding or fanfare" clause instead of replacing it — produced a clunky double-clause line. Caught on review and fixed in a follow-up commit (`e595f77`) that replaced the line cleanly.

**Cache note:** right after the first deploy, the custom domain (`cutadrift.org`) briefly served a stale cached copy of the footer while the `*.pages.dev` deployment URL already had the new content. Resolved itself after a cache-busting curl retry loop — CDN propagation lag, not a deploy failure. Worth remembering for future "live but not live" moments rather than assuming the deploy broke.

### Cross-device verification

Rendered the live site via Chrome DevTools Protocol at four real viewports (not just browser resize):

| Viewport | Width | Overflow | Layout |
|---|---|---|---|
| Mobile | 390px | None | Single column, card rotations flattened |
| Tablet portrait | 768px | None | 3-column grid |
| Tablet landscape | 1024px | None | 3-column grid |
| Desktop | 1440px | None | 3-column grid |

Both edited lines wrap legibly at every size, no clipping. One early false alarm: a first-pass headless screenshot looked clipped on the right edge, but that was a `--headless --screenshot` artifact (pins viewport to a 500px minimum regardless of requested size) — re-rendered through proper device-metrics emulation and it was clean. No actual mobile bug.

---

## Commits this session

| Commit | Message |
|---|---|
| `c619888` | Refresh hero subhead and footer trust line |
| `e595f77` | Tidy footer trust line wording |

Both pushed to `origin/main` and deployed to Cloudflare Pages.

---

## Outstanding tasks

*Unchanged from Handover 21 — nothing on this list was touched this session.*

### ⚡ Priority

1. **Capture payloads for the 6 stubbed test scenarios** — method documented inline in `tests/test_suite.mjs`.
2. **Build "Do it with me" — Phase 3** (carried from Handover 19/20) — incapacity/carer family-coordination message + GP/specialist question prep; Not Redundant cover-letter tool integration.
3. **GSC Request Indexing — corrected pages** (carried from session 16):
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

4. **Update meta description / og:description tags** — still say "clear, short-term plan," now also out of step with the hero copy refresh this session (which moved further from that wording). Worth doing both meta-tag catch-ups together next time.
5. **Pin "Notifying their employer" heading** to fixed wording in the bereavement system prompt (test-harness flakiness source, see Handover 21).

### Ongoing

6. **Outreach follow-up** — 5 bereavement orgs contacted session 8; follow-up due week of 23 June 2026 (imminent).
7. **OG image** — placeholder still in place; real branded image outstanding.
8. **Feedback form** — confirm still feeding Google Sheet with `[Cut Adrift]` prefix.
9. **Best Man notice board redesign** — see session 16 handover.
10. **Best Man placeholder testimonials** — James P., May 2026 on both sites; replace with real quotes.
11. **GSC indexing queue** — remaining ~24 guide pages (see session 16).
12. **Diagnosis tool guide pages** — 30 pages (5 per country) not yet built.
13. **Consider:** extending the bereavement "tell my family" panel to Path C (weeks_ago) if feedback indicates it's needed there.
14. **Consider:** applying the "Your first action" closing line to the carer tool once its real prompt is built.

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
| 20 | Deceased's employer letter (bereavement) + weeks_ago routing fix + mandatory "Notifying their employer" section + DIWM panel. "Tell my family" message DIWM panels for bereavement and diagnosis. Insurance call script DIWM panel for diagnosis. Sitemap/homepage NZ-link fix kicked off but not confirmed deployed. E2E scenario harness lost from `/tmp` again. |
| 21 | Confirmed and closed all 3 priority items from Handover 20 (sitemap/link, DIWM spot-checks, test harness rebuild — now committed to `tests/` so it persists). Found 4 guide pages (AU/IE/CA/US) had no disclaimer at all — fixed, deployed, verified live. Refreshed homepage copy across hero subhead, trust badge, and bereavement/diagnosis cards. Began using Claude Code directly for file-editing tasks. |
| 22 | Refined homepage hero subhead and footer trust line to better reflect the drafting capability and build trust (no ad revenue/no data resale framing replacing "without fanfare"). Verified live across mobile (390px), tablet portrait (768px), tablet landscape (1024px), and desktop (1440px) — no overflow, both lines wrap cleanly at every size. |

---

## Workflow note

This session's pattern: copy drafted and reviewed in Claude.ai chat (multiple options presented, picked and refined together), then handed to Claude Code for the actual file edit, commit, push, deploy, and cross-device verification. Matches the division of labour recommended in Handover 21 — chat for planning/review/synthesis, Claude Code for direct file edits and verification legwork.
