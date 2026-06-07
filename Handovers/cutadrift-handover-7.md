# Cut Adrift — Handover Notes
*Session ended: Sunday 7 June 2026*

---

## What was done this session

### GitHub repository set up
Cut Adrift now has a private GitHub repo: `waynemstevens-lab/cut-adrift`. Initial commit of 29 files (all Public files, Handovers folder, worker.js, wrangler.toml). Deploy workflow going forward:
```bash
git add -A && git commit -m "message" && git push
```
Then run Wrangler deploy commands as before.

Also cleaned up: `test-cutadrift.sh` moved from `Public/` to project root (it was being deployed to the web).

### Country selector added to incapacity tool
`/when-someone-cant-manage/` now opens on a country question identical to the bereavement tool. Countries: New Zealand, Australia, United Kingdom, Ireland, Somewhere else.

Changes made:
- `when-someone-cant-manage/index.html` — country step added as Q1, SEQ updated to `['country','what_happened',...]`, initial step changed to `country`
- `worker.js` — `country` field added to `formatIncapacityIntake`; `**country**` instruction added to incapacity system prompt with AU/UK/IE/CA equivalents; contacts section heading made country-neutral

### "Somewhere else" country input added to both tools
Previously "Somewhere else" just sent `country: "other"` with no further information. Now clicking it reveals a text input field where the user types their country. Claude then produces fully country-specific output for any country in the world.

Tested with:
- **US bereavement**: correct output — funeral home, Social Security 1-800-772-1213, IRS, state probate thresholds, GriefShare, Crisis Text Line
- **Canada incapacity (stroke)**: correct output — Power of Attorney with province variations, Representation Agreement, RRSP/TFSA, CPP, Local Health Integration Network, Stroke Recovery Canada 1-888-STROKE-1, Canadian Caregiver Coalition

Changes made to both:
- `when-someone-dies/index.html`
- `when-someone-cant-manage/index.html`

### Cloudflare deployment issue identified and resolved
After adding git, Wrangler was deploying to Preview instead of Production. Fixed by:
1. Going to Cloudflare → Pages → cutadrift → Settings → Builds & deployments → Production branch → set to `main`
2. Running Wrangler deploy from terminal as normal — this always goes to Production regardless of branch setting

---

## Still to do

1. **Press pitches for Cut Adrift** — not yet written
2. **Send press pitch to Stuff** — contact already identified
3. **Sign up for Indeed Publisher Program** — `indeed.com/publisher`
4. **Build specific NZ topic pages for Not Redundant** — `/how-to-claim-jobseeker-nz/`, `/redundancy-pay-calculator-nz/`, `/free-redundancy-checklist-nz/`, `/nz-redundancy-rights/`
5. **OG meta tags on Not Redundant country guide pages** — only `index.html` updated; six country guides still need meta tags
6. **Cut Adrift response caching** — streaming architecture makes this non-trivial. Deferred until traffic grows.
7. **Not Redundant cover letter tool** — built but held pending confirmed revenue. When deployed: `cover_letter_mode` flag, `cl:` KV prefix, ~5/IP/day rate limit (86,400s TTL).
8. **Continue LinkedIn outreach** — HR managers at companies with active redundancies.
9. **Monitor LCP scores** — font async fix deployed; allow a few days of traffic to see improvement in Cloudflare analytics.

---

## Current site status

| Item | Status |
|------|--------|
| cutadrift.org | ✅ Live |
| www.cutadrift.org | ✅ Active |
| Worker (cutadrift-engine) | ✅ Live — Haiku, max_tokens 2000 |
| Bereavement tool | ✅ Complete — country selector + Somewhere else text input |
| Incapacity tool | ✅ Complete — country selector added this session |
| Privacy page | ✅ Live |
| 404 page | ✅ Live |
| Favicon | ✅ Deployed |
| OG image | ✅ Deployed |
| Apple touch icon | ✅ Deployed |
| Google Search Console | ✅ Verified — all pages submitted |
| Feedback form | ✅ Live on plan page |
| Cloudflare Web Analytics | ✅ Active |
| Text contrast | ✅ Raised site-wide |
| Google Fonts async | ✅ All pages |
| GitHub repo | ✅ waynemstevens-lab/cut-adrift (private) |
| NZ bereavement guide | ✅ Live |
| Funeral grant page | ✅ Live — $2,697.43 confirmed correct |
| KiwiSaver death claim page | ✅ Live |
| Register a death page | ✅ Live |
| Probate guide | ✅ Live |
| ACC death benefit page | ✅ Live |
| Bereavement leave page | ✅ Live |
| Surviving spouse benefit page | ✅ Live — NZ Super April 2026 rates |
| myTrove guide page | ✅ Live |
| Disclaimers on SEO pages | ✅ All 9 pages |
| Email routing | ✅ privacy@cutadrift.org active |
| Google indexing | ⏳ Not yet indexed — expected 2–6 weeks |

---

## Key verified figures (as of June 2026)

| Item | Figure | Source |
|------|--------|--------|
| WINZ Funeral Grant max | $2,697.43 | WINZ (updated 31 March 2026) |
| ACC Funeral Grant (accidental death) | $7,990.30 | ACC (4 July 2025) |
| ACC Survivor's Grant (partner) | $8,566.62 | ACC (4 July 2025) |
| ACC Survivor's Grant (per child) | $4,283.32 | ACC (4 July 2025) |
| NZ Super coupled (each) | $854.08/fortnight | WINZ (1 April 2026) |
| NZ Super single living alone | $1,110.30/fortnight | WINZ (1 April 2026) |
| NZ Super single sharing | $1,024.90/fortnight | WINZ (1 April 2026) |
| WINZ asset exclusion threshold | $2,351.46 | WINZ (2026) |
| Bereavement leave — 6-month threshold | Still current law | Employment NZ (25 June 2025) |
| Employment Leave Bill — committee report-back | 13 July 2026 | MBIE (March 2026) |
| ACC phone | 0800 101 996 | ACC (confirmed) |

---

## File structure

```
~/Desktop/Cut Adrift/
├── .gitignore
├── wrangler.toml
├── worker.js
├── test-cutadrift.sh
├── Handovers/
│   ├── cutadrift-handover-6.md
│   └── cutadrift-handover-7.md
└── Public/
    ├── index.html
    ├── favicon.svg
    ├── og-image.png
    ├── apple-touch-icon.png
    ├── sitemap.xml
    ├── 404.html
    ├── when-someone-dies/
    │   └── index.html    ← Country selector + Somewhere else text input
    ├── when-someone-cant-manage/
    │   └── index.html    ← Country selector added this session
    ├── plan/
    │   └── index.html
    ├── privacy/
    │   └── index.html
    ├── what-to-do-when-someone-dies-nz/
    ├── how-to-apply-funeral-grant-nz/
    ├── kiwisaver-death-claim-nz/
    ├── how-to-register-a-death-nz/
    ├── nz-probate-guide/
    ├── acc-death-benefit-nz/
    ├── nz-bereavement-leave-entitlements/
    ├── nz-surviving-spouse-benefit/
    └── mytrove-nz-guide/
```

---

## Infrastructure

| Item | Detail |
|------|--------|
| Pages project | `cutadrift` |
| Worker | `cutadrift-engine` — `https://cutadrift-engine.waynemstevens.workers.dev` |
| KV namespace | `RATE_LIMIT` — ID: `3a74818b39634ca494158c8dc55d8cd9` |
| Account ID | `16d2f98512a9a9e553da03f7a45e6236` |
| Anthropic key | `cutadrift-engine` (separate from Not Redundant) |
| Model | `claude-haiku-4-5-20251001` |
| Max tokens | 2000 |
| Rate limit | 10 requests per IP per 24 hours |
| Feedback sheet | Same Google Sheet as Not Redundant — [Cut Adrift] prefix in Suggestion column |
| GitHub | `waynemstevens-lab/cut-adrift` (private) |

---

## Deploy commands

**Worker** (from `~/Desktop/Cut Adrift/`):
```bash
npx wrangler deploy
```

**Frontend** (from `~/Desktop/Cut Adrift/Public/`):
```bash
npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true
```

**Git** (from `~/Desktop/Cut Adrift/`):
```bash
git add -A && git commit -m "message" && git push
```

**Note:** Production branch is set to `main` in Cloudflare. Wrangler direct deploys always go to Production regardless.

---

## To resume in a new session

Tell Claude:
> "I'm Wayne. I'm building Cut Adrift (cutadrift.org) — a free AI-powered crisis navigation platform. The bereavement tool, incapacity tool, and nine NZ SEO pages are all live. Both tools have a country selector including a free-text 'Somewhere else' option. GitHub repo is waynemstevens-lab/cut-adrift. I need to [write press pitches / build Not Redundant NZ topic pages / etc.]"

All files are at `~/Desktop/Cut Adrift/`. Handover notes are in the `Handovers/` folder.
