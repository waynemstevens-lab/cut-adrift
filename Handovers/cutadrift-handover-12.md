# Cut Adrift — Handover Document 12
**Updated:** 11 June 2026  
**Session work:** Sitemap deployment, "Bereavement Guides" label fix, CA/US added to bereavement tool

---

## Project overview

**URL:** https://cutadrift.org  
**Purpose:** Free crisis navigation tools for life's hardest moments.  
**Entity:** TNW Limited (NZ registered)  
**GitHub:** `waynemstevens-lab/cut-adrift` (private)  
**Cloudflare Pages project:** `cutadrift`  
**Worker:** `cutadrift-engine` (Claude Haiku, max_tokens 2000)  
**KV namespace ID:** `3a74818b39634ca494158c8dc55d8cd9`

---

## Local file structure

```
~/Desktop/Cut Adrift/
├── Public/                              ← deploy root
│   ├── index.html                       ← homepage
│   ├── sitemap.xml                      ← 41 URLs, deployed 11 June 2026
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── og-image.png
│   ├── privacy/index.html
│   ├── terms/index.html
│   │
│   ├── when-someone-dies/               ← bereavement tool (6-country picker)
│   ├── when-someone-cant-manage/        ← incapacity tool
│   │
│   ├── Country guide index pages (6):
│   │   ├── guides-nz/
│   │   ├── guides-au/
│   │   ├── guides-uk/
│   │   ├── guides-ireland/
│   │   ├── guides-canada/
│   │   └── guides-us/
│   │
│   ├── NZ guides (5):
│   │   ├── what-to-do-when-someone-dies-nz/
│   │   ├── how-to-apply-funeral-grant-nz/
│   │   ├── nz-bereavement-leave-entitlements/
│   │   ├── nz-surviving-spouse-benefit/
│   │   └── mytrove-nz-guide/
│   │
│   ├── AU guides (5):
│   │   ├── what-to-do-when-someone-dies-au/
│   │   ├── au-bereavement-payment/
│   │   ├── au-funeral-financial-assistance/
│   │   ├── au-bereavement-leave/
│   │   └── au-notify-agencies-after-death/
│   │
│   ├── UK guides (5):
│   │   ├── what-to-do-when-someone-dies-uk/
│   │   ├── uk-bereavement-support-payment/
│   │   ├── uk-funeral-expenses-payment/
│   │   ├── uk-bereavement-leave/
│   │   └── tell-us-once-uk-guide/
│   │
│   ├── Ireland guides (5):
│   │   ├── what-to-do-when-someone-dies-ireland/
│   │   ├── ireland-bereavement-payments/
│   │   ├── ireland-funeral-financial-assistance/
│   │   ├── ireland-bereavement-leave/
│   │   └── ireland-notify-agencies-after-death/
│   │
│   ├── Canada guides (5):
│   │   ├── what-to-do-when-someone-dies-canada/
│   │   ├── canada-survivor-benefits/
│   │   ├── canada-funeral-financial-assistance/
│   │   ├── canada-bereavement-leave/
│   │   └── canada-notify-agencies-after-death/
│   │
│   └── US guides (5):
│       ├── what-to-do-when-someone-dies-us/
│       ├── us-social-security-survivor-benefits/
│       ├── us-funeral-financial-assistance/
│       ├── us-bereavement-leave/
│       └── us-notify-agencies-after-death/
│
└── Handovers/
```

---

## Deploy commands

```bash
# Deploy (from Public/)
cd ~/Desktop/Cut\ Adrift/Public && npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true

# Commit (from Cut Adrift/)
cd ~/Desktop/Cut\ Adrift && git add -A && git commit -m "msg" && git push
```

---

## Homepage — current state

### Tool cards (3 stacked horizontal cards)
```
[🕯️] Someone I love has died          →
[🤝] When someone can no longer manage →
[💼] I've lost my job                  →  (links to notredundant.com, new tab)
```

### Guides section
Section label in HTML: `<p class="guides-label">Bereavement Guides</p>`  
(CSS `text-transform: uppercase` renders it as "BEREAVEMENT GUIDES")

Single line of 6 country links, all open in new tab:
```
New Zealand →  Australia →  United Kingdom →  Republic of Ireland →  Canada →  United States →
```

CSS:
```css
.guides-row  { display: flex; gap: 14px; flex-wrap: nowrap; }
.guides-country-link { font-size: 0.78rem; }
```

Each country link → `/guides-{slug}/` index page (new tab)

---

## Bereavement tool — country picker

`when-someone-dies/index.html` — custom card/button components (not a `<select>`).  
Country values passed to worker via `answer('country', code)`:

| Button label | Code |
|---|---|
| New Zealand | `'nz'` |
| Australia | `'au'` |
| United Kingdom | `'uk'` |
| Republic of Ireland | `'ie'` |
| Canada | `'ca'` |
| United States | `'us'` |
| Somewhere else | free-text input → `selectOther()` |

NZ uses a different question branch (estate/funeral/assets flow). All other countries use the generic relationship/emotional_state/support_situation flow. The worker handles all 6 country codes natively — no hardcoded country logic in worker.js beyond the NZ branch.

---

## Guide structure — all 6 countries

Each country has:
- A **guide index page** at `/guides-{slug}/` listing 5 guides
- **5 guide pages** covering: what to do, financial support, funeral costs, leave entitlements, notifying agencies

| Country | Index | Guide slug prefix |
|---------|-------|-------------------|
| New Zealand | /guides-nz/ | `*-nz/`, `nz-*`, `mytrove-nz-guide/` |
| Australia | /guides-au/ | `*-au/`, `au-*` |
| United Kingdom | /guides-uk/ | `*-uk/`, `uk-*`, `tell-us-once-uk-guide/` |
| Republic of Ireland | /guides-ireland/ | `*-ireland/`, `ireland-*` |
| Canada | /guides-canada/ | `*-canada/`, `canada-*` |
| United States | /guides-us/ | `*-us/`, `us-*` |

All guide pages share:
- Canonical tag, OG/Twitter card tags, Article JSON-LD schema
- Breadcrumb back to country index (not homepage)
- Related guides section linking to other 4 guides in same country
- Same CSS variables and fonts as homepage

---

## Sitemap

`Public/sitemap.xml` — deployed 11 June 2026. Contains 41 URLs:
- 5 core pages (homepage, 2 tools, privacy, terms)
- 6 country guide index pages
- 30 guide pages (5 × 6 countries)

Uses `<lastmod>` only — `<changefreq>` and `<priority>` omitted (Google ignores them).

**GSC status:** Sitemap deployed but submission to GSC not yet confirmed — see Outstanding Tasks.

---

## Design system

```css
--bg:          #0c1520
--bg-card:     #111e2c
--bg-hover:    #162538
--border:      rgba(255,255,255,0.07)
--border-hover:rgba(210,168,100,0.45)
--text:        #ede8df
--text-muted:  rgba(237,232,223,0.75)
--text-dim:    rgba(237,232,223,0.5)
--amber:       #d2a864
--amber-soft:  rgba(210,168,100,0.12)
--teal:        #5d9ea8
--radius:      16px
```
Fonts: Cormorant Garamond (headings), DM Sans 300/400/500 (body)

---

## Technical infrastructure

- **Cloudflare Pages** — static hosting, deploy from `Public/`
- **Cloudflare Worker** `cutadrift-engine` — proxies AI requests, KV caching
- **Anthropic API** — Claude Haiku, max_tokens 2000
- **KV namespace ID:** `3a74818b39634ca494158c8dc55d8cd9`
- **GitHub:** `waynemstevens-lab/cut-adrift` (private)

---

## Outstanding tasks

### ⚡ PRIORITY — Next session

**GSC sitemap submission + URL inspection**
1. Go to [search.google.com/search-console](https://search.google.com/search-console) → cutadrift.org → Indexing → Sitemaps
2. If `sitemap.xml` already listed → three-dot menu → **Resubmit**; if not listed → type `sitemap.xml` → **Submit**
3. For faster indexing of the 12 most important new pages, use URL Inspection (search bar at top of GSC) → paste URL → **Request Indexing** for each:
   - `/guides-au/`, `/guides-ireland/`, `/guides-canada/`, `/guides-us/`, `/guides-nz/`, `/guides-uk/`
   - `/what-to-do-when-someone-dies-au/`, `/what-to-do-when-someone-dies-ireland/`, `/what-to-do-when-someone-dies-canada/`, `/what-to-do-when-someone-dies-us/`, `/what-to-do-when-someone-dies-uk/`, `/what-to-do-when-someone-dies-nz/`

**Smoke test CA/US in bereavement tool**  
Open https://cutadrift.org/when-someone-dies/, select Canada then United States and run each through to the plan output. Confirm the question flow and AI response handle both countries correctly.

---

### Ongoing

4. **Outreach follow-up** — 5 bereavement orgs contacted, follow-up due week of 23 June 2026
5. **OG image** — placeholder 1200×630 PNG in place; a real branded image would improve social shares
6. **Feedback form** — feeds Google Sheet with `[Cut Adrift]` prefix; confirm still working

---

## Session history summary

| Session | Key work |
|---------|----------|
| 1–6 | Initial build: bereavement, incapacity, carer tools; NZ SEO pages |
| 7 | Performance improvements (Lighthouse 80, async fonts, accessibility) |
| 8 | Outreach emails to 5 bereavement organisations |
| 9 | 5 UK bereavement guides, homepage accordion |
| 10 | Homepage cards → row layout (later reverted), 5 US guides |
| 11 | Guides section redesign (3-col → simple row links, new-tab index pages); AU, IE, CA guides added; 6-country homepage row |
| 12 | Complete sitemap.xml deployed (41 URLs); homepage label → "Bereavement Guides"; CA + US added to bereavement country picker |
