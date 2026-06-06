# Cut Adrift — Handover Notes
*Session ended: Saturday 6 June 2026*

---

## What was done this session

### Infrastructure
1. **Apple-touch-icon link tags** — added to `<head>` of:
   - `~/Desktop/Cut Adrift/Public/index.html`
   - `~/Desktop/Cut Adrift/Public/when-someone-dies/index.html`
   - `~/Desktop/First Steps/Public/index.html` (Not Redundant)
2. **www.cutadrift.org** — CNAME record already existed in DNS pointing to `cutadrift.pages.dev`. Both `cutadrift.org` and `www.cutadrift.org` now Active in Cloudflare Pages with SSL enabled.

### SEO — strategy pivot
Decided to build specific NZ topic pages instead of country guide pages (UK, AU, etc.). Reasoning: country guides face the same strong competition as the NZ guide but worse. Specific topic pages (e.g. "how to apply funeral grant NZ") have weak competition, faster to rank, higher intent, and build internal authority that helps the hub guide rank too.

### Pages built and deployed this session

**Hub guide:**
- `/what-to-do-when-someone-dies-nz/` — comprehensive 8-section NZ bereavement guide. Updated with internal links to all 5 specific pages. CTA added inline in hero (not just bottom of page).

**Specific topic pages (all deployed and indexing requested):**
- `/how-to-apply-funeral-grant-nz/` — Work and Income funeral grant, up to $2,408.74, steps to apply
- `/kiwisaver-death-claim-nz/` — KiwiSaver goes to estate not direct to family, how to find provider and claim
- `/how-to-register-a-death-nz/` — BDM registration within 3 working days, death certificate ordering, myTrove
- `/nz-probate-guide/` — when probate is required, Grant of Probate vs Letters of Administration, steps
- `/acc-death-benefit-nz/` — ACC funeral cover (~$6,837), Survivor's Grant, weekly compensation, how to claim

**Homepage update:**
- Added "Bereavement guides" section below the cards with link to NZ guide. CSS class `.guides` / `.guide-link` added. Ready to add more links as more guide pages are built.

### Google Search Console
- All 6 NZ pages submitted for indexing
- Sitemap resubmitted with all new URLs

### End-to-end test
- Test script created: `~/Desktop/test-cutadrift.sh`
- Run with: `bash ~/Desktop/test-cutadrift.sh`
- Result: **29/30 passing**

---

## Known issue — PRIORITY for next session

### Privacy page returning 404
**Problem:** `Public/privacy/Index.html` was created with a capital I. Cloudflare Pages is case-sensitive and expects `index.html`. Renaming on macOS fails silently (case-insensitive filesystem). Delete/recreate approach also didn't resolve it — Cloudflare appears to be caching the old filename even after redeploy.

**Fix to attempt next session:**
1. Delete the privacy directory entirely and redeploy without it first (to flush Cloudflare's cache of the old filename)
2. Then recreate with correct lowercase name and redeploy again

```bash
# Step 1 — remove and deploy without it
rm -rf ~/Desktop/Cut\ Adrift/Public/privacy/
cd ~/Desktop/Cut\ Adrift/Public && npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true

# Step 2 — recreate with correct name
mkdir ~/Desktop/Cut\ Adrift/Public/privacy/
cp /tmp/privacy-backup.html ~/Desktop/Cut\ Adrift/Public/privacy/index.html
cd ~/Desktop/Cut\ Adrift/Public && npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true
```

Note: `/tmp/privacy-backup.html` was created this session. Verify it still exists with `ls /tmp/privacy-backup.html` before running step 2. If not, the content can be recovered from the live site or the previous handover.

---

## Current site status

| Item | Status |
|------|--------|
| cutadrift.org | ✅ Live |
| www.cutadrift.org | ✅ Active |
| Worker (cutadrift-engine) | ✅ Live |
| Bereavement tool | ✅ Complete |
| Privacy page | ⚠️ File exists, returning 404 (case issue) |
| 404 page | ✅ Live |
| Favicon | ✅ Deployed |
| OG image | ✅ Deployed |
| Apple touch icon | ✅ Deployed + link tag added |
| Google Search Console | ✅ Verified, sitemap submitted |
| NZ guide | ✅ Live, indexed |
| Funeral grant page | ✅ Live, indexing requested |
| KiwiSaver page | ✅ Live, indexing requested |
| Register a death page | ✅ Live, indexing requested |
| Probate guide | ✅ Live, indexing requested |
| ACC death benefit page | ✅ Live, indexing requested |
| Email routing | ✅ privacy@cutadrift.org active |
| End-to-end test script | ✅ ~/Desktop/test-cutadrift.sh |

---

## File structure

```
~/Desktop/Cut Adrift/
├── wrangler.toml
├── worker.js
└── Public/
    ├── index.html                              ← Home (guides section added)
    ├── favicon.svg
    ├── og-image.png
    ├── apple-touch-icon.png
    ├── sitemap.xml                             ← 9 URLs total
    ├── 404.html
    ├── when-someone-dies/
    │   └── index.html
    ├── plan/
    │   └── index.html
    ├── privacy/
    │   └── index.html                         ← ⚠️ Filename case issue, returns 404
    ├── what-to-do-when-someone-dies-nz/
    │   └── index.html                         ← Hub guide (has internal links)
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

*(Unchanged)*

- **Pages project**: `cutadrift`
- **Worker**: `cutadrift-engine` — `https://cutadrift-engine.waynemstevens.workers.dev`
- **KV namespace**: `RATE_LIMIT` — ID: `3a74818b39634ca494158c8dc55d8cd9`
- **Account ID**: `16d2f98512a9a9e553da03f7a45e6236`
- **Anthropic key**: `cutadrift-engine` (separate from Not Redundant)
- **Model**: `claude-sonnet-4-5`
- **Rate limit**: 10 requests per IP per 24 hours

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

**Note:** Cut Adrift has no git repo set up. Deploys go directly via Wrangler. Worth setting up at some point but not urgent.

---

## SEO — what's been built and what's next

### Built (NZ bereavement)
- Hub guide: `/what-to-do-when-someone-dies-nz/`
- 5 specific pages covering funeral grant, KiwiSaver, death registration, probate, ACC

### Next specific pages to build (NZ bereavement)
These were identified as having low competition and high intent:
- `/nz-surviving-spouse-benefit/` — Work and Income payment for bereaved partners
- `/mytrove-nz-guide/` — how to notify multiple agencies at once
- `/nz-bereavement-leave-entitlements/` — employer obligations, 3 days etc.

### Not Redundant equivalent
Similar specific pages would work well for Not Redundant:
- `/how-to-claim-jobseeker-nz/`
- `/redundancy-pay-calculator-nz/`
- `/free-redundancy-checklist-nz/`

---

## What needs doing next

### Immediate
1. **Fix privacy page 404** — see Known Issue above. Priority.
2. **Decide next tool** — still undecided between Becoming a Carer and Relationship Breakdown. Relationship breakdown has stronger search volume; carer is closer to done (intake already sketched).

### Shortly after
3. **Build 2–3 more NZ specific pages** for Cut Adrift (see list above)
4. **Build equivalent specific pages for Not Redundant**
5. **Press pitches** for Cut Adrift — not yet written
6. **Not Redundant OG/meta tags** — still no social share image

---

## To resume in a new session

Tell Claude:
> "I'm Wayne. I'm building Cut Adrift (cutadrift.org) — a free AI-powered crisis navigation platform. The bereavement tool is live. Last session we built the NZ SEO pages. I need to [fix the privacy page / decide the next tool / build more specific pages / etc.]"

All files are at `~/Desktop/Cut Adrift/`. Test script is at `~/Desktop/test-cutadrift.sh`. Handover notes are saved.
