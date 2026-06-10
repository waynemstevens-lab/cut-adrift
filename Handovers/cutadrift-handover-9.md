# Cut Adrift — Handover Notes
*Session ended: Tuesday 9 June 2026*

---

## What was done this session

### Performance improvements
- **Cloudflare Email Address Obfuscation disabled** for cutadrift.org — was injecting a render-blocking `email-decode.min.js` script into every page load
- **Unused font weight 600 removed** from Google Fonts URL across all 13 HTML files (`ital,wght@0,400;0,500;0,600;1,400` → `ital,wght@0,400;0,500;1,400`) — weight 600 was loaded but never referenced in any CSS
- **PageSpeed Insights mobile score: 73 → 80** — confirmed via pagespeed.web.dev after deploy
- **Lighthouse performance score: 83, accessibility: 90** — confirmed on final Lighthouse run at end of session

### Accessibility fix
- **`<main>` landmark tag added to all 13 HTML pages** — wraps content between `</header>` and `<footer>` on every page. Fixes Lighthouse accessibility flag "Document does not have a main landmark". Terms page already had it; 12 others fixed via Python script.
- Accessibility score confirmed improved from 85 → 90 on Lighthouse run at end of session.

### Cloudflare security sweep (all domains)
Reviewed security insights across all 8 domains in Cloudflare account:

| Domain | Action taken |
|--------|-------------|
| cutadrift.org | Email obfuscation disabled ✅ |
| notredundant.com | Clean — no action needed ✅ |
| recpokercoach.com | Clean — no action needed ✅ |
| bestmanspeech.nz | Email obfuscation disabled ✅, DMARC confirmed present |
| bestmanspeechwriter.uk | DMARC confirmed present — email obfuscation status not verified this session |
| sellersbrief.co.nz | DMARC confirmed present with rua forwarding to Gmail ✅ |
| sellersbrief.com | Clean — no action needed ✅ |

Remaining "moderate" alerts (Bot Fight Mode, AI Labyrinth, Security.txt) are configuration suggestions — deliberately left off across all domains.

### Sector-specific outreach — Cut Adrift
Outreach email sent to five organisations requesting resource page listing. Email signed as Wayne Stevens / Cut Adrift. Subject: "A free resource for people navigating life after a death."

| Organisation | Contact | Country | Sent |
|-------------|---------|---------|------|
| AtaLoss.org | office@ataloss.org | UK | ✅ |
| MyGriefAssist.com.au | Contact form on homepage | AU | ✅ |
| Hospice NZ | Contact form at hospice.org.nz/contact | NZ | ✅ |
| Grief Centre NZ | admin@griefcentre.org.nz | NZ | ✅ |
| The Good Grief Trust | hello@thegoodgrieftrust.org | UK | ✅ |

**Follow up on non-responses: week of 23 June 2026**

Email pitch angle: "I've been learning to build AI tools and was looking for areas where the need is high but the help available is pretty thin on the ground. I'm not doing this commercially — there's no business model behind it. I just wanted it to exist."

---

## Still to do

1. **Follow up on outreach emails** — week of 23 June if no response
2. **Citizens Advice Bureau NZ outreach** — incapacity and carer tools specifically
3. **Dang.ai and Toolpilot.ai directory submissions** — free listings, good for SEO backlinks
4. **Press pitch to Stuff** — contact already identified, not yet sent
5. **Build NZ topic pages for Not Redundant** — `/how-to-claim-jobseeker-nz/`, `/redundancy-pay-calculator-nz/`, `/free-redundancy-checklist-nz/`, `/nz-redundancy-rights/`
6. **OG meta tags on Not Redundant country guide pages** — six country guides still need meta tags
7. **Cut Adrift response caching** — deferred until traffic grows
8. **Not Redundant cover letter tool** — built but held pending confirmed revenue
9. **Continue LinkedIn outreach** — HR managers at companies with active redundancies
10. **Confirm carer tool path** — live but path not recorded

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
| Email obfuscation | ✅ Disabled in Cloudflare |
| Font weight 600 | ✅ Removed from all 13 pages |
| `<main>` landmark | ✅ Added to all 13 pages |
| PageSpeed mobile score | ✅ 83 Lighthouse / 80 PageSpeed Insights (was 73) |
| Accessibility score | ✅ 90 (was 85) |
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
│   ├── cutadrift-handover-8.md
│   └── cutadrift-handover-9.md
└── Public/
    ├── index.html               ← <main> landmark added
    ├── favicon.svg
    ├── og-image.png
    ├── apple-touch-icon.png
    ├── sitemap.xml
    ├── 404.html                 ← <main> landmark added
    ├── when-someone-dies/
    │   └── index.html           ← Bereavement tool
    ├── when-someone-cant-manage/
    │   └── index.html           ← Incapacity tool
    ├── [carer tool path — confirm]/
    │   └── index.html           ← Carer tool
    ├── plan/
    │   └── index.html
    ├── privacy/
    │   └── index.html
    ├── terms/
    │   └── index.html           ← Already had <main>
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
