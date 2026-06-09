# Cut Adrift — Handover Notes
*Session ended: Monday 8 June 2026*

---

## What was done this session

### Legal and organisational setup
Cut Adrift now has full legal coverage under TNW Limited. The following were completed:

**Terms of Use page** — created and deployed at `/terms/`. Covers: nature of the service (information only, not professional advice), no liability, data handling summary, acceptable use, TNW Limited IP ownership, sponsorship/advertising clause, NZ governing law.

**Privacy page updated** — TNW Limited added as the operating entity in two places: the intro paragraph and the contact/questions section. Previously the page had no company attribution.

**Plan output disclaimer** — a disclaimer is now appended to every generated plan via JavaScript, rendered below the plan content:
> *"This plan is a starting point, not legal, financial, or health advice. Always verify details with the relevant government agency or a qualified professional."*
Styled in muted small text with a subtle border-top separator.

**Terms link added to all footers** — added across all 10 static and SEO pages. The privacy page also received a proper footer (previously it had none). The intake tool pages (`/when-someone-dies/`, `/when-someone-cant-manage/`) and plan page have no footer by design — they are full-screen flows.

**Carer tool confirmed live** — Wayne confirmed the carer tool is deployed. Path not recorded in this session — confirm at next session.

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
10. **Confirm carer tool path** — Wayne confirmed it's live but path was not recorded this session.

---

## Current site status

| Item | Status |
|------|--------|
| cutadrift.org | ✅ Live |
| www.cutadrift.org | ✅ Active |
| Worker (cutadrift-engine) | ✅ Live — Haiku, max_tokens 2000 |
| Bereavement tool | ✅ Complete — country selector + Somewhere else text input |
| Incapacity tool | ✅ Complete — country selector + Somewhere else text input |
| Carer tool | ✅ Live — path to confirm |
| Terms of Use page | ✅ Live at /terms/ |
| Privacy page | ✅ Live — TNW Limited named, footer added |
| Plan output disclaimer | ✅ Live — appended to every generated plan |
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
| Google indexing | ⏳ Not yet indexed — expected 2–6 weeks from 6 June 2026 |

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
│   ├── cutadrift-handover-7.md
│   └── cutadrift-handover-8.md
└── Public/
    ├── index.html
    ├── favicon.svg
    ├── og-image.png
    ├── apple-touch-icon.png
    ├── sitemap.xml
    ├── 404.html
    ├── when-someone-dies/
    │   └── index.html    ← Bereavement tool — country selector + Somewhere else
    ├── when-someone-cant-manage/
    │   └── index.html    ← Incapacity tool — country selector + Somewhere else
    ├── [carer tool path — confirm]/
    │   └── index.html    ← Carer tool — live, path not recorded this session
    ├── plan/
    │   └── index.html    ← Disclaimer appended to plan output
    ├── privacy/
    │   └── index.html    ← TNW Limited added, footer added
    ├── terms/
    │   └── index.html    ← Terms of Use — new this session
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
| Legal entity | TNW Limited (NZ registered) |

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
> "I'm Wayne. I'm building Cut Adrift (cutadrift.org) — a free AI-powered crisis navigation platform operated by TNW Limited. Three tools are live: bereavement, incapacity, and carer. Both bereavement and incapacity tools have a country selector including a free-text 'Somewhere else' option. There are nine NZ SEO pages, a Terms of Use page, and a fully attributed privacy page. GitHub repo is waynemstevens-lab/cut-adrift. I need to [write press pitches / build NZ topic pages / etc.]"

All files are at `~/Desktop/Cut Adrift/`. Handover notes are in the `Handovers/` folder.
