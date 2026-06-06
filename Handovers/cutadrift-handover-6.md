# Cut Adrift — Handover Notes
*Session ended: Sunday 7 June 2026*

---

## What was done this session

### Fact-checking — all pages verified against current sources

**`/nz-bereavement-leave-entitlements/`**
- Employment Leave Bill status updated: was "consulted Sept 2024 — not yet passed". Now correctly states the bill was introduced to Parliament March 2026, passed first reading, is before the Education and Workforce Committee, and the committee is due to report back by 13 July 2026. Six-month threshold still current law.
- Proof of bereavement wording corrected: "cannot require proof" → "cannot require proof as a condition of granting leave — employer can ask but cannot withhold leave for lack of documentation."

**`/nz-surviving-spouse-benefit/`**
- Meta date corrected: "Work and Income NZ (2024–25 rates)" → "rates from 1 April 2026"
- NZ Super rates updated with actual April 2026 figures: coupled rate $854.08/fortnight → single living alone $1,110.30/fortnight. Note added that surviving partner's NZ Super actually increases.

**`/mytrove-nz-guide/`**
- Westpac-specific callout removed from banks bullet point
- Partner list expanded to reflect current coverage: multiple banks, fire and general insurers, loyalty programmes (Fly Buys, Airpoints, AA), NZTA, Computershare

**`/how-to-apply-funeral-grant-nz/`**
- $2,697.43 confirmed correct against WINZ (last modified 31 March 2026). No changes needed.

**All other SEO pages** — ACC phone 0800 101 996 confirmed, bereavement leave entitlements confirmed, ACC funeral grant $7,990.30 confirmed. No changes needed.

### Disclaimers added to all nine SEO pages
None of the SEO pages had disclaimers. Added `.page-disclaimer` CSS class and a consistent disclaimer block to all nine pages:
- `/nz-bereavement-leave-entitlements/`
- `/nz-surviving-spouse-benefit/`
- `/mytrove-nz-guide/`
- `/how-to-apply-funeral-grant-nz/`
- `/kiwisaver-death-claim-nz/`
- `/how-to-register-a-death-nz/`
- `/nz-probate-guide/`
- `/acc-death-benefit-nz/`
- `/what-to-do-when-someone-dies-nz/`

Disclaimer text: *"This guide provides general information only — not legal, financial, or tax advice. Entitlements, rates, and processes are subject to change. Verify current figures with the relevant agency before making decisions. For advice specific to your situation, contact a lawyer, financial adviser, or Citizens Advice Bureau. Information current as of June 2026."*

### Google Fonts converted to async preload — all pages
Cloudflare Web Analytics showed Not Redundant with 50% Poor LCP score. Root cause: Google Fonts stylesheet was render-blocking. Fixed on all 15 Cut Adrift HTML pages by converting:
```html
<link href="https://fonts.googleapis.com/..." rel="stylesheet">
```
To async preload pattern:
```html
<link rel="preload" href="..." as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="..." rel="stylesheet"></noscript>
```
Cut Adrift was already scoring 93% Good LCP (370ms median). Fix applies same optimisation consistently.

### Text contrast raised site-wide
Plan page output and other pages had `--text-muted` at 0.5 opacity (too dim) and `--text-dim` at 0.22 (nearly invisible). Raised across 6 files — when-someone-dies, when-someone-cant-manage, plan, privacy, 404, index:
- `--text-muted`: 0.5 → 0.75
- `--text-dim`: 0.22 / 0.25 → 0.5

Homepage had already been fixed to 0.75 in a previous session. All pages now consistent.

### Cloudflare Web Analytics — Cut Adrift added
Cut Adrift was missing from the Web Analytics dashboard. Confirmed it was already set to "Enable" (automatic injection) on the cutadrift.org domain — no beacon needed. Site now appears in dashboard. 24-hour stats: 53 page views, 34 visits. Top pages: homepage (~11), `/when-someone-dies/` (~9), `/when-someone-cant-manage/` (~5), `/plan/` (~3). Country breakdown: NZ dominant, US and Canada also present.

### Feedback form added to plan page
Added feedback form to `/plan/index.html`, appearing after plan generation. Uses same Google Apps Script endpoint as Not Redundant. Responses prefixed `[Cut Adrift]` in the Suggestion column for easy filtering. Form shows: helpful Yes/No buttons, free-text suggestion box, thank-you message on submit.

---

## Still to do

1. **Press pitches for Cut Adrift** — not yet written
2. **Send press pitch to Stuff** — contact already identified (Not Redundant)
3. **Sign up for Indeed Publisher Program** — `indeed.com/publisher`
4. **Build specific NZ topic pages for Not Redundant** — `/how-to-claim-jobseeker-nz/`, `/redundancy-pay-calculator-nz/`, `/free-redundancy-checklist-nz/`, `/nz-redundancy-rights/`
5. **OG meta tags on Not Redundant country guide pages** — only `index.html` updated; six country guides still need meta tags
6. **Cut Adrift response caching** — streaming architecture makes this non-trivial. Deferred until traffic grows.
7. **Not Redundant cover letter tool** — built but held pending confirmed revenue. When deployed: `cover_letter_mode` flag, `cl:` KV prefix, ~5/IP/day rate limit (86,400s TTL).
8. **Continue LinkedIn outreach** — HR managers at companies with active redundancies. Wayne has limited monthly connection slots.
9. **Monitor LCP scores** — font async fix deployed; allow a few days of traffic to see improvement in Cloudflare analytics.

---

## Current site status

| Item | Status |
|------|--------|
| cutadrift.org | ✅ Live |
| www.cutadrift.org | ✅ Active |
| Worker (cutadrift-engine) | ✅ Live — Haiku, max_tokens 2000 |
| Bereavement tool | ✅ Complete |
| Incapacity tool | ✅ Live |
| Privacy page | ✅ Live |
| 404 page | ✅ Live |
| Favicon | ✅ Deployed |
| OG image | ✅ Deployed |
| Apple touch icon | ✅ Deployed |
| Google Search Console | ✅ Verified — all pages submitted |
| Feedback form | ✅ Live on plan page — feeds same sheet as Not Redundant |
| Cloudflare Web Analytics | ✅ Active — automatic injection |
| Text contrast | ✅ Raised site-wide — --text-muted 0.75, --text-dim 0.5 |
| Google Fonts async | ✅ All pages |
| NZ bereavement guide | ✅ Live |
| Funeral grant page | ✅ Live — $2,697.43 confirmed correct |
| KiwiSaver death claim page | ✅ Live |
| Register a death page | ✅ Live |
| Probate guide | ✅ Live |
| ACC death benefit page | ✅ Live |
| Bereavement leave page | ✅ Live — Employment Leave Bill status updated |
| Surviving spouse benefit page | ✅ Live — NZ Super April 2026 rates added |
| myTrove guide page | ✅ Live — partner list expanded |
| Disclaimers on SEO pages | ✅ All 9 pages |
| Email routing | ✅ privacy@cutadrift.org active |
| Google indexing | ⏳ Not yet indexed — ~8 days old, expected 2–6 weeks |

---

## Key verified figures (as of June 2026)

All figures below confirmed against primary sources this session.

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
├── wrangler.toml
├── worker.js
└── Public/
    ├── index.html
    ├── favicon.svg
    ├── og-image.png
    ├── apple-touch-icon.png
    ├── sitemap.xml                             ← 13 URLs total
    ├── 404.html
    ├── when-someone-dies/
    │   └── index.html                         ← Bereavement tool
    ├── when-someone-cant-manage/
    │   └── index.html                         ← Incapacity tool
    ├── plan/
    │   └── index.html                         ← Feedback form added this session
    ├── privacy/
    │   └── index.html
    ├── what-to-do-when-someone-dies-nz/
    │   └── index.html                         ← Disclaimer added
    ├── how-to-apply-funeral-grant-nz/
    │   └── index.html                         ← $2,697.43 confirmed
    ├── kiwisaver-death-claim-nz/
    │   └── index.html                         ← Disclaimer added
    ├── how-to-register-a-death-nz/
    │   └── index.html                         ← Disclaimer added
    ├── nz-probate-guide/
    │   └── index.html                         ← Disclaimer added
    ├── acc-death-benefit-nz/
    │   └── index.html                         ← Disclaimer added
    ├── nz-bereavement-leave-entitlements/
    │   └── index.html                         ← Bill status updated, proof wording corrected
    ├── nz-surviving-spouse-benefit/
    │   └── index.html                         ← NZ Super April 2026 rates added
    └── mytrove-nz-guide/
        └── index.html                         ← Partner list expanded
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

**Note:** Cut Adrift has no git repo. Deploys go directly via Wrangler.

---

## To resume in a new session

Tell Claude:
> "I'm Wayne. I'm building Cut Adrift (cutadrift.org) — a free AI-powered crisis navigation platform. The bereavement tool, incapacity tool, and nine NZ SEO pages are all live. All pages are fact-checked, disclaimed, have async Google Fonts, and consistent text contrast. I need to [write press pitches / build Not Redundant NZ topic pages / etc.]"

All files are at `~/Desktop/Cut Adrift/`. Handover notes are saved.
