# Cut Adrift — Handover Notes
*Session ended: Friday 5 June 2026*

---

## What was done this session

Full launch preparation and deployment of cutadrift.org:

1. **Domain connected** — cutadrift.org is live and Active in Cloudflare Pages. www.cutadrift.org was added but remains in "Verifying" state — still needs the CNAME record added in DNS.
2. **CORS fix** — was already completed at end of previous session. Worker accepts both cutadrift.org and the pages.dev preview URL.
3. **Loading state fixed** — plan/index.html updated to stream silently in background. Loading spinner stays visible the entire time with cycling messages (5s interval). Plan appears all at once with fade-in animation. Raw markdown is never shown.
4. **Privacy page** — /privacy/ created and deployed. Covers sessionStorage, IP rate limiting, Claude/Anthropic processing, no cookies/tracking.
5. **Privacy email** — privacy@cutadrift.org set up via Cloudflare Email Routing, forwarding to waynemstevens@gmail.com. Status: Active.
6. **404 page** — Public/404.html created and deployed. Cloudflare Pages serves it automatically for unmatched routes.
7. **Google Search Console** — cutadrift.org verified and added. Sitemap (sitemap.xml) submitted — 3 pages discovered successfully. URL inspection: homepage already indexed, /when-someone-dies/ and /privacy/ indexing requested.
8. **"Also from Cut Adrift" footer link** — added to notredundant.com (First Steps/Public/index.html) via sed. Small muted link above the badge row. Deployed.
9. **Favicon** — favicon.svg created (4-pointed compass star, amber #d2a864 on navy #0c1520, with center void detail). Deployed to Public/.
10. **OG image** — og-image.html template created. Screenshot taken at 2400×1260 (retina 2x of 1200×630). Deployed as og-image.png to Public/. Note: og-image.html was removed from Public/ after use.
11. **Meta tags** — OG and Twitter card tags added to Public/index.html and Public/when-someone-dies/index.html. Includes og:title, og:description, og:url, og:type, og:image (with width/height), twitter:card, twitter:image, and favicon link rel.
12. **Apple touch icons** — apple-touch-icon.png created for both Cut Adrift (compass star on navy) and Not Redundant (NR in Fraunces on dark green #2d5a3d). Both deployed to respective Public/ folders.

---

## Current site status

| Item | Status |
|------|--------|
| cutadrift.org | ✅ Live |
| www.cutadrift.org | ⚠️ Verifying (needs CNAME) |
| Worker (cutadrift-engine) | ✅ Live |
| Bereavement tool | ✅ Complete |
| Privacy page | ✅ Live |
| 404 page | ✅ Live |
| Favicon | ✅ Deployed |
| OG image | ✅ Deployed |
| Apple touch icon | ✅ File deployed, link tag not yet added to HTML |
| Google Search Console | ✅ Verified, sitemap submitted |
| Homepage indexed | ✅ Already indexed |
| Email routing | ✅ privacy@cutadrift.org active |

---

## Infrastructure

*(Unchanged from previous handover)*

- **Pages project**: `cutadrift`
- **Worker**: `cutadrift-engine` — `https://cutadrift-engine.waynemstevens.workers.dev`
- **KV namespace**: `RATE_LIMIT` — ID: `3a74818b39634ca494158c8dc55d8cd9`
- **Account ID**: `16d2f98512a9a9e553da03f7a45e6236`
- **Anthropic key**: `cutadrift-engine` (separate from Not Redundant)
- **Model**: `claude-sonnet-4-5`
- **Rate limit**: 10 requests per IP per 24 hours

---

## File structure

```
~/Desktop/Cut Adrift/
├── wrangler.toml
├── worker.js
└── Public/
    ├── index.html                   ← Home (has OG/meta tags)
    ├── favicon.svg                  ← Compass star favicon
    ├── og-image.png                 ← 2400×1260 OG image (social share)
    ├── apple-touch-icon.png         ← 180×180 compass star (iPhone)
    ├── sitemap.xml
    ├── 404.html
    ├── when-someone-dies/
    │   └── index.html               ← Bereavement intake (has OG/meta tags)
    ├── plan/
    │   └── index.html               ← Results page (silent streaming)
    └── privacy/
        └── index.html               ← Privacy page
```

### Deploy commands
**Worker** (from `~/Desktop/Cut Adrift/`):
```bash
npx wrangler deploy
```

**Frontend** (from `~/Desktop/Cut Adrift/Public/`):
```bash
npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true
```

---

## What needs doing next

### Immediate
1. **Add apple-touch-icon link tag** — not yet added to HTML. Add to `<head>` of index.html and when-someone-dies/index.html:
   ```html
   <link rel="apple-touch-icon" href="/apple-touch-icon.png">
   ```
   Same needs doing for Not Redundant (First Steps/Public/index.html).

2. **www.cutadrift.org** — still Verifying. Go to Cloudflare DNS for cutadrift.org, add CNAME record: Name = `www`, Target = `cutadrift.pages.dev`. Then click Check DNS Records in Pages custom domain settings.

### Shortly after
3. **Press pitches** — same pattern as Not Redundant. Brand story is stronger (umbrella platform, multiple tools). Target: RNZ, NZ Herald, The Spinoff, Stuff. Press pitch not yet written for Cut Adrift.
4. **The carer tool** — intake flow was designed in Session 1. System prompt not written. Build follows same pattern as bereavement tool: new intake page at /becoming-a-carer/, shared /plan/ page, add `carer` case to worker.js SYSTEM_PROMPTS and INTAKE_FORMATTERS.
5. **Directory listings** — lower value for Cut Adrift than Not Redundant (wrong audience). Worth doing eventually for domain authority/backlinks, but not a priority.
6. **Not Redundant OG image and meta tags** — Not Redundant has no OG image or social meta tags. Same process needed there when ready.

---

## Not Redundant changes made this session

- Added quiet "Also from Cut Adrift" footer link (above badge row) → deployed
- Added apple-touch-icon.png (NR monogram, dark green) → deployed
- apple-touch-icon link tag NOT yet added to HTML

---

## Key decisions made this session

- **OG image is 2400×1260** — retina screenshot at 2× of 1200×630. Social platforms handle this correctly.
- **Favicon uses 4-pointed compass star** — same mark used for apple-touch-icon. Consistent brand mark across all surfaces.
- **Silent streaming** — no raw markdown ever shown to user. Loading spinner stays up the full duration.
- **privacy@cutadrift.org** is live and forwarding to waynemstevens@gmail.com via Cloudflare Email Routing.

---

## To resume in a new session

Tell Claude:
> "I'm Wayne. I'm building Cut Adrift (cutadrift.org) — a free AI-powered crisis navigation platform. The bereavement tool is live and indexed. I need to [add apple-touch-icon link tags / build the carer tool / write press pitches / etc.]"

All files are at `~/Desktop/Cut Adrift/`. Handover notes are saved.

---

## Addendum — same session, later

### LinkedIn updated
- **Banner** — new Cut Adrift banner created (1584×396px). Dark navy, compass mark, "When life changes / without warning." centered with "CUT ADRIFT" wordmark and "cutadrift.org" URL. Content positioned right of profile photo zone. Deployed to LinkedIn profile.
- **Headline** — updated to: `Building free AI tools for our hour of need — bereavement, job loss, and more | cutadrift.org`

### Next tool — decision pending
Two candidates discussed:

**Becoming a carer** (/becoming-a-carer/)
- Intake already sketched: sudden carer, what condition, relationship, living situation, EPA, NASC assessment, Work and Income
- System prompt not written, no code built
- Closer to done, fits platform cleanly

**Relationship breakdown / separation**
- Strongest opportunity by search volume and complexity
- High intake complexity: married vs de facto, children, property, who's leaving the home, country-specific law
- More design work needed before building
- Same six countries as Not Redundant (NZ, AU, UK, IE, CA, US)

**Decision filter agreed:** New tools are only worth building if the intake variables create real routing forks that change the output — not just "ask Claude." Both pass this test. Relationship breakdown passes it more strongly.

**Status:** Wayne sleeping on it. Decision next session.

---

## Addendum 2 — SEO priority

### The problem
Google can't index the tool — intake and plan are all JavaScript/sessionStorage. The homepage and /when-someone-dies/ have almost no indexable text content. Cut Adrift is currently invisible to search beyond the brand name.

### Competitors ranking for "what to do when someone dies NZ"
- govt.nz — unbeatable, always #1
- Henderson Reeves Lawyers (law firm checklist)
- Hospice NZ
- FDANZ (Funeral Directors Association)
- Local funeral homes

All are static information pages. None offer a personalised plan.

### The fix — static guide pages (HIGH PRIORITY)
Same pattern as Not Redundant's /job-loss-nz/, /job-loss-uk/ etc.

Build country-specific long-form guide pages that:
- Are fully indexable static HTML
- Rank for tail queries ("what to do when someone dies NZ", "bereavement checklist NZ" etc.)
- Provide genuine useful content
- Funnel readers into the tool at the bottom

**Pages to build (in priority order):**
1. `/what-to-do-when-someone-dies-nz/`
2. `/what-to-do-when-someone-dies-uk/`
3. `/what-to-do-when-someone-dies-au/`
4. `/what-to-do-when-someone-dies-ireland/`
5. `/what-to-do-when-someone-dies-canada/`
6. `/what-to-do-when-someone-dies-us/`

Each page: country-specific, practical, authoritative. Ends with CTA to the personalised plan tool.

Once built, add these URLs to sitemap.xml and submit via Search Console.
