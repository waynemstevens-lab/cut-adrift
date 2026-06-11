# Cut Adrift — Handover Document 11
**Updated:** 11 June 2026  
**Session work:** Guides section redesign + 6-country guide expansion

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
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── og-image.png
│   ├── privacy/index.html
│   ├── terms/index.html
│   │
│   ├── when-someone-dies/               ← bereavement tool
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

### Tool cards (3 stacked horizontal cards — original layout)
```
[🕯️] Someone I love has died          →
[🤝] When someone can no longer manage →
[💼] I've lost my job                  →  (links to notredundant.com, new tab)
```

### Guides section
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

1. **Submit all new guide URLs to Google Search Console** — 6 index pages + 25 guide pages (AU, IE, CA, US) not yet submitted
2. **Update sitemap.xml** — check if `Public/sitemap.xml` exists; add all new URLs if so
3. **Outreach follow-up** — 5 bereavement orgs contacted, follow-up due week of 23 June 2026
4. **OG image** — placeholder 1200×630 PNG; a real branded image would help social shares
5. **Feedback form** — feeds Google Sheet with `[Cut Adrift]` prefix; confirm still working

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
