# Cut Adrift — Handover Notes
*Session ended: Sunday 7 June 2026*

---

## What was done this session

### Three new NZ SEO pages built and deployed

**`/nz-bereavement-leave-entitlements/`**
Full guide to NZ bereavement leave under the Holidays Act 2003. Content covers: 3 days paid for close relatives, 1 day discretionary for others, 3 days for miscarriage/stillbirth (2021 amendment), 6-month service eligibility requirement, relevant daily pay / average daily pay calculation, employer obligations (cannot refuse, cannot require proof, cannot force annual leave), what to do if employer refuses. Note on pending Holidays Act reform (Employment Leave Bill consulted Sept 2024 — not yet passed, 6-month threshold still current law). CTA to bereavement tool.

**`/nz-surviving-spouse-benefit/`**
Guide to financial support for bereaved partners in NZ. Note: there is no benefit by this exact name — the old Widow's Benefit was restructured in 2013. Page covers: Funeral Grant (up to $2,697.43, means tested), WINZ travel assistance, Sole Parent Support (if dependent children), Jobseeker Support (if no children), NZ Super rate adjustment (married → single rate after partner's death), ACC if death from accident (0800 101 996), and other financial matters (KiwiSaver, insurance, myTrove for IRD). CTA to bereavement tool.

**`/mytrove-nz-guide/`**
Full guide to using myTrove (mytrove.co.nz) — free NZ service to notify agencies after a death. Content covers: what it is, who it notifies (IRD, DIA passports, Westpac and other banks, insurers, WINZ), what you need (will/probate/letters of administration/IR625 for small refunds), step-by-step process, what it doesn't cover (council, utilities, phone, NZTA, KiwiSaver provider, employer, social media), whether a solicitor can use it on your behalf. Note: mytrove.co.nz is a private service (not govt), free to use, saves ~52 hours of admin. CTA to bereavement tool.

### Funeral grant amount corrected
`how-to-apply-funeral-grant-nz/index.html` updated: $2,408.74 → **$2,697.43** (current WINZ rate). Both instances updated (quick-facts box and body paragraph).

### Sitemap updated
`sitemap.xml` now has **13 URLs** (was 10). Three new entries added at priority 0.9.

### Homepage improvements
- **`--text-muted` opacity raised**: 0.45 → 0.75 — fixes `.hero p` and `.card-desc` readability throughout
- **`.question p`** ("WHAT BEST DESCRIBES YOUR SITUATION?"): `--text-dim` → `rgba(237,232,223,0.6)`
- **`.guides-label`** ("BEREAVEMENT GUIDES"): `--text-dim` → `rgba(237,232,223,0.6)`
- **`.guide-link`**: `--text-muted` → `var(--text)` — full brightness
- **`footer p` and `footer a`**: `--text-muted` → `var(--text)` — full brightness
- **Four new guide links added** to bereavement guides section:
  - How to apply for a Funeral Grant in New Zealand →
  - Bereavement leave entitlements in New Zealand →
  - Financial support for bereaved partners in New Zealand →
  - Using myTrove to notify agencies after a death →

### Google Search Console
Four URLs submitted for indexing, sitemap resubmitted:
- `https://cutadrift.org/nz-bereavement-leave-entitlements/`
- `https://cutadrift.org/nz-surviving-spouse-benefit/`
- `https://cutadrift.org/mytrove-nz-guide/`
- `https://cutadrift.org/how-to-apply-funeral-grant-nz/` (amount corrected)

### SEO ranking check
`site:cutadrift.org` returned zero results — Google has not yet indexed the domain. Expected at ~8 days old. No action needed; indexing typically takes 2–6 weeks for a new domain.

---

## Still to do

1. **Build equivalent specific pages for Not Redundant** — `/how-to-claim-jobseeker-nz/`, `/redundancy-pay-calculator-nz/`, `/free-redundancy-checklist-nz/`, `/nz-redundancy-rights/`
2. **Press pitches for Cut Adrift** — not yet written
3. **Send press pitch to Stuff** — contact already identified (Not Redundant)
4. **Sign up for Indeed Publisher Program** — `indeed.com/publisher`
5. **OG image and social meta tags for Not Redundant** — not yet done for country guide pages (index.html was updated in session 4)
6. **Cut Adrift response caching** — streaming architecture makes this non-trivial (tee() + waitUntil() to buffer stream while forwarding, then save to KV). Deferred until traffic grows.
7. **Not Redundant cover letter tool** — built but held pending confirmed revenue. When deployed: `cover_letter_mode` flag, `cl:` KV prefix, ~5/IP/day rate limit (86,400s TTL).
8. **Continue LinkedIn outreach** — HR managers at companies with active redundancies. Wayne has limited monthly connection slots.

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
| NZ bereavement guide | ✅ Live |
| Funeral grant page | ✅ Live — amount corrected to $2,697.43 this session |
| KiwiSaver death claim page | ✅ Live |
| Register a death page | ✅ Live |
| Probate guide | ✅ Live |
| ACC death benefit page | ✅ Live |
| Bereavement leave page | ✅ Live — new this session |
| Surviving spouse benefit page | ✅ Live — new this session |
| myTrove guide page | ✅ Live — new this session |
| Email routing | ✅ privacy@cutadrift.org active |
| Google indexing | ⏳ Not yet indexed — ~8 days old, expected 2–6 weeks |

---

## File structure

```
~/Desktop/Cut Adrift/
├── wrangler.toml
├── worker.js
└── Public/
    ├── index.html                              ← Homepage (text contrast + 4 new guide links)
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
    │   └── index.html
    ├── privacy/
    │   └── index.html
    ├── what-to-do-when-someone-dies-nz/
    │   └── index.html
    ├── how-to-apply-funeral-grant-nz/
    │   └── index.html                         ← Amount corrected to $2,697.43 this session
    ├── kiwisaver-death-claim-nz/
    │   └── index.html
    ├── how-to-register-a-death-nz/
    │   └── index.html
    ├── nz-probate-guide/
    │   └── index.html
    ├── acc-death-benefit-nz/
    │   └── index.html
    ├── nz-bereavement-leave-entitlements/
    │   └── index.html                         ← New this session
    ├── nz-surviving-spouse-benefit/
    │   └── index.html                         ← New this session
    └── mytrove-nz-guide/
        └── index.html                         ← New this session
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
> "I'm Wayne. I'm building Cut Adrift (cutadrift.org) — a free AI-powered crisis navigation platform. The bereavement tool, incapacity tool, and nine NZ SEO pages are all live. Last session we built three more SEO pages, fixed the funeral grant amount, and improved homepage text contrast. I need to [build Not Redundant SEO pages / write press pitches / etc.]"

All files are at `~/Desktop/Cut Adrift/`. Handover notes are saved.
