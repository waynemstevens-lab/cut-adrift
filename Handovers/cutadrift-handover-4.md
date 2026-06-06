# Cut Adrift — Handover Notes
*Session ended: Saturday 6 June 2026*

---

## What was done this session

### Bug fix
- **Privacy page 404 resolved** — `Public/Privacy/Index.html` had a capital I and capital P causing Cloudflare to return 404. Fixed by deleting the directory, deploying without it (to flush Cloudflare's cache), recreating as `Public/privacy/index.html` (all lowercase), and redeploying. Confirmed 200 via curl.

### Not Redundant — maintenance
- **OG meta tags completed** — `og:image:width`, `og:image:height`, `twitter:card`, and `twitter:image` added to `~/Desktop/First Steps/Public/index.html`. The `og-image.png` file was already present (previous handover was incorrect in flagging it as missing).
- **Worker switched to Haiku** — `firststeps-engine` updated: model `claude-sonnet-4-6` → `claude-haiku-4-5-20251001`, max_tokens 1024 → 900. Approximately 6-7× cheaper per request with no quality impact for this use case.
- **KV response caching added** — Plan and retraining responses are now hashed (SHA-256) and cached in KV for 30 days. Cache key prefix: `rcache:p:` (plan) and `rcache:r:` (retraining). CV mode excluded — every CV is unique. Identical intake combinations now served from KV for free after the first hit.

### Cut Adrift — worker
- **Worker switched to Haiku** — `cutadrift-engine` updated: model `claude-sonnet-4-5` → `claude-haiku-4-5-20251001`, max_tokens 4096 → 2000. Covers all paths (Path A: ~200 tokens, Path B: ~800–1200, Path C: ~1000–1800).
- **`ctx` added to fetch handler** — ready for `waitUntil()` when streaming response caching is added later.
- **`www.cutadrift.org` added to CORS allowed origins** — was previously missing.
- **New executor option added to bereavement tool** — `yes_unknown_executor` added to `has_will` question: "Yes — but I don't know who the executor is." Worker label: `"Yes — a will exists but they don't know who the executor is — needs to be found"`.

### Cut Adrift — new tool: When someone can no longer manage
Full tool built and deployed. Covers stroke, falls, dementia, and other sudden incapacity events.

**Intake page:** `Public/when-someone-cant-manage/index.html`
**URL:** `cutadrift.org/when-someone-cant-manage/`
**Tool identifier:** `incapacity`

**8 intake questions:**
1. `what_happened` — stroke / fall_accident / dementia / other_health_event / not_sure
2. `who` — parent / partner / family_member / close_friend
3. `location` — in_hospital / discharged_home / discharged_no_home / at_home_struggling
4. `capacity` — yes_clearly / possibly_unclear / varies_day_to_day / no_longer
5. `epa_in_place` — yes / no / dont_know
6. `assets` — yes / no / not_sure
7. `carer_situation` — **multi-select**: able_willing_main / want_but_limits / not_primary / not_able / other_family_involved
8. `free_text` — optional, textarea

The carer_situation question uses toggle buttons with a "Continue →" button that appears once at least one option is selected. Results stored as an array in `answers.carer_situation`.

**System prompt:** Full prompt embedded in `cutadrift-engine` worker as `SYSTEM_PROMPTS.incapacity`. Three paths:
- **Path A** — EPA emergency: fires when capacity is `possibly_unclear` or `varies_day_to_day` AND EPA is `no` or `dont_know`. Opens by naming the urgency, gives 3 numbered steps, then continues with Path B/C.
- **Path B** — In hospital or just discharged
- **Path C** — At home but struggling

Key NZ content in prompt: NASC (Needs Assessment and Service Coordination), Enduring Power of Attorney (Property and Personal Care & Welfare), Residential Care Subsidy, Carer Support Subsidy, home & community support services, hospital discharge rights, Family Court welfare guardian/property manager orders if capacity already lost.

**All phone numbers verified:**
- Public Trust: 0800 371 471 ✓
- Age Concern NZ: 0800 65 2105 ✓
- Alzheimers NZ: 0800 004 001 ✓
- Stroke Aotearoa NZ: 0800 787 653 ✓
- Work and Income: 0800 552 002 ✓
- Carers NZ: 0800 777 797 ✓

**Output quality confirmed** — test run (stroke / parent / discharged home / capacity unclear / no EPA / assets yes / want but limits + other family) produced excellent output: correct EPA urgency, clear NASC explanation, accurate financial content, appropriate handling of carer limits.

**Homepage updated** — coming-soon card converted to live link. All `.card.coming-soon` CSS removed. Card title changed to "When someone can no longer manage".

**Sitemap updated** — `/when-someone-cant-manage/` added at priority 0.9.

---

## Still to do after this session

1. **Google Search Console** — submit `https://cutadrift.org/when-someone-cant-manage/` for indexing. Resubmit sitemap.
2. **Build 2–3 more NZ-specific pages for Cut Adrift** — identified as quick SEO wins:
   - `/nz-surviving-spouse-benefit/` — Work and Income payment for bereaved partners
   - `/mytrove-nz-guide/` — how to notify multiple agencies at once
   - `/nz-bereavement-leave-entitlements/` — employer obligations, 3 days paid leave
3. **Build equivalent specific pages for Not Redundant** — `/how-to-claim-jobseeker-nz/`, `/redundancy-pay-calculator-nz/`, `/free-redundancy-checklist-nz/`
4. **Cut Adrift response caching** — streaming architecture makes this non-trivial (would require tee() + waitUntil() to buffer stream while forwarding to client, then save text to KV). Deferred. Should be done once traffic grows.
5. **Press pitches for Cut Adrift** — not yet written.
6. **Not Redundant cover letter tool** — built but held pending confirmed revenue. When deployed: separate `cover_letter_mode` flag, `cl:` KV prefix, ~5/IP/day rate limit (86,400s TTL).

---

## Current site status

| Item | Status |
|------|--------|
| cutadrift.org | ✅ Live |
| www.cutadrift.org | ✅ Active |
| Worker (cutadrift-engine) | ✅ Live — Haiku, max_tokens 2000 |
| Bereavement tool | ✅ Complete |
| Incapacity tool | ✅ Live — new this session |
| Privacy page | ✅ Fixed this session |
| 404 page | ✅ Live |
| Favicon | ✅ Deployed |
| OG image | ✅ Deployed |
| Apple touch icon | ✅ Deployed |
| Google Search Console | ✅ Verified — new page not yet submitted |
| NZ bereavement guide | ✅ Live |
| Funeral grant page | ✅ Live |
| KiwiSaver death claim page | ✅ Live |
| Register a death page | ✅ Live |
| Probate guide | ✅ Live |
| ACC death benefit page | ✅ Live |
| Email routing | ✅ privacy@cutadrift.org active |
| End-to-end test script | ✅ ~/Desktop/test-cutadrift.sh (29/30 — privacy now fixed, rerun to confirm 30/30) |

---

## File structure

```
~/Desktop/Cut Adrift/
├── wrangler.toml
├── worker.js                                   ← Updated this session (Haiku, incapacity prompt)
└── Public/
    ├── index.html                              ← Homepage (incapacity card now live)
    ├── favicon.svg
    ├── og-image.png
    ├── apple-touch-icon.png
    ├── sitemap.xml                             ← 10 URLs total
    ├── 404.html
    ├── when-someone-dies/
    │   └── index.html                         ← Bereavement tool (new executor option added)
    ├── plan/
    │   └── index.html
    ├── privacy/
    │   └── index.html                         ← Fixed this session (was returning 404)
    ├── when-someone-cant-manage/
    │   └── index.html                         ← New this session
    ├── what-to-do-when-someone-dies-nz/
    │   └── index.html
    ├── how-to-apply-funeral-grant-nz/
    │   └── index.html
    ├── kiwisaver-death-claim-nz/
    │   └── index.html
    ├── how-to-register-a-death-nz/
    │   └── index.html
    ├── nz-probate-guide/
    │   └── index.html
    └── acc-death-benefit-nz/
        └── index.html
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
| Model | `claude-haiku-4-5-20251001` (updated this session) |
| Max tokens | 2000 (updated this session) |
| Rate limit | 10 requests per IP per 24 hours |

**Not Redundant infrastructure (updated this session):**

| Item | Detail |
|------|--------|
| Pages project | `firststeps` |
| Worker | `firststeps-engine` — `https://firststeps-engine.waynemstevens.workers.dev` |
| KV namespace | `FIRSTSTEPS_KV` — ID: `40e96f815f9346d99f46e2e5fd5cacbc` |
| Model | `claude-haiku-4-5-20251001` (updated this session) |
| Max tokens | 900 (updated this session) |
| Response cache TTL | 30 days (new this session) |

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

**End-to-end test:**
```bash
bash ~/Desktop/test-cutadrift.sh
```

**Note:** Cut Adrift has no git repo. Deploys go directly via Wrangler.

---

## To resume in a new session

Tell Claude:
> "I'm Wayne. I'm building Cut Adrift (cutadrift.org) — a free AI-powered crisis navigation platform. The bereavement tool and the new incapacity tool (when-someone-cant-manage) are live. Last session we built the incapacity tool and switched both workers to Haiku. I need to [submit the new page to Search Console / build more NZ SEO pages / write press pitches / etc.]"

All files are at `~/Desktop/Cut Adrift/`. Handover notes are saved.
