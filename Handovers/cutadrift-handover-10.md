# Cut Adrift — Handover Document 10
**Updated:** 10 June 2026  
**Session work:** Homepage row layout + 5 US bereavement guides

---

## Project overview

**URL:** https://cutadrift.org  
**Purpose:** Free crisis navigation tools for life's hardest moments. Three tools live, plus external link to Not Redundant for job loss.  
**Entity:** TNW Limited (NZ registered)  
**GitHub:** `waynemstevens-lab/cut-adrift` (private)  
**Cloudflare Pages project:** `cutadrift`  
**Worker:** `cutadrift-engine` (Claude Haiku, max_tokens 2000)  
**KV namespace ID:** `3a74818b39634ca494158c8dc55d8cd9`

---

## Local file structure

```
~/Desktop/Cut Adrift/
├── Public/                          ← deploy root
│   ├── index.html                   ← homepage
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── og-image.png
│   ├── privacy/index.html
│   ├── terms/index.html
│   │
│   ├── when-someone-dies/           ← bereavement tool
│   ├── when-someone-cant-manage/    ← incapacity tool
│   │
│   ├── NZ guides (5):
│   │   ├── what-to-do-when-someone-dies-nz/
│   │   ├── how-to-apply-funeral-grant-nz/
│   │   ├── nz-bereavement-leave-entitlements/
│   │   ├── nz-surviving-spouse-benefit/
│   │   └── mytrove-nz-guide/
│   │
│   ├── UK guides (5):
│   │   ├── what-to-do-when-someone-dies-uk/
│   │   ├── uk-bereavement-support-payment/
│   │   ├── uk-funeral-expenses-payment/
│   │   ├── uk-bereavement-leave/
│   │   └── tell-us-once-uk-guide/
│   │
│   └── US guides (5):               ← added this session
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

**Deploy (run from Public/):**
```bash
cd ~/Desktop/Cut\ Adrift/Public && npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true
```

**Commit (run from Cut Adrift/):**
```bash
cd ~/Desktop/Cut\ Adrift && git add -A && git commit -m "msg" && git push
```

---

## Homepage — current state

### Card layout (changed this session)
Cards now display in a **3-column CSS grid** rather than a vertical column. Each card is vertical: icon top → title/description → arrow bottom-right. Layout reverts to single column on mobile (≤600px).

Key CSS:
```css
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.card-arrow {
  align-self: flex-end;
  margin-top: auto;
}
```

### Three cards
1. 🕯️ **Someone I love has died** → `/when-someone-dies/`
2. 🤝 **When someone can no longer manage** → `/when-someone-cant-manage/` (teal variant)
3. 💼 **I've lost my job** → `https://notredundant.com` (external, opens new tab)

### Guides accordion — three countries
- **New Zealand** (5 guides)
- **United Kingdom** (5 guides)
- **United States** (5 guides) ← added this session

---

## US guide pages — added this session

All five pages share:
- Canonical tag pointing to `https://cutadrift.org/[slug]/`
- OG/Twitter card meta tags (og-image.png)
- Article JSON-LD schema
- Related guides section linking to the other four US pages
- Same CSS variables and fonts as the homepage

| Slug | Title |
|------|-------|
| `what-to-do-when-someone-dies-us` | What to Do When Someone Dies in the United States |
| `us-social-security-survivor-benefits` | Social Security Survivor Benefits: What You're Entitled To |
| `us-funeral-financial-assistance` | Help with Funeral Costs in the United States |
| `us-bereavement-leave` | Bereavement Leave in the United States |
| `us-notify-agencies-after-death` | Notifying Government Agencies After a Death in the United States |

---

## Tools — technical details

### Bereavement tool (`/when-someone-dies/`)
- Country selector with "Somewhere else" + free-text for full country-specific output
- Calls `cutadrift-engine` Worker → Claude Haiku

### Incapacity tool (`/when-someone-cant-manage/`)
- Country selector with "Somewhere else" + free-text
- Same Worker

### Carer tool
- Separate page, same Worker pattern

### Worker: `cutadrift-engine`
- Model: Claude Haiku
- `max_tokens`: 2000
- KV caching active (SHA-256 key, 30-day TTL)
- KV namespace ID: `3a74818b39634ca494158c8dc55d8cd9`

---

## SEO — current state

### Technical
- Canonical tags: all pages
- OG/Twitter card tags: all pages
- JSON-LD schema: homepage (WebSite), guide pages (Article)
- Google Fonts: async preload (`onload` pattern) + `<noscript>` fallback
- Cloudflare email obfuscation: disabled (was causing render-blocking script)
- `<main>` landmark tag: present on all pages

### Performance (as of last Lighthouse run)
- PageSpeed mobile: ~80, Lighthouse: 83 performance / 90 accessibility

### Guide pages indexed
- NZ guides: submitted to GSC, indexing in progress
- UK guides: submitted to GSC, indexing in progress
- US guides: newly created this session — submit to GSC next session

### Outreach sent (bereavement orgs)
Emails sent to: AtaLoss.org, MyGriefAssist.com.au, Hospice NZ, Grief Centre NZ, The Good Grief Trust. Follow-up on non-responses scheduled week of 23 June 2026.

---

## Revenue / monetisation

No monetisation on Cut Adrift currently. Free tool, no ads, no paywall. The footer notes "If this ever needs to cover server costs, we may show relevant ads or sponsorship." No plans to change this short-term.

---

## Outstanding tasks (next session priorities)

1. **Submit US guide URLs to Google Search Console** (all 5 new pages)
2. **Check homepage row layout renders correctly** in browser — verify cards look right at ~240px wide each, and mobile single-column fallback works
3. **Update sitemap.xml** — add 5 US guide URLs if a sitemap exists (check `Public/sitemap.xml`)
4. **Add Australia guides** — consider expanding accordion with AU bereavement content (mirrors NZ/UK/US pattern)
5. **OG image** — `og-image.png` is a placeholder (1200×630). A proper branded image would improve social share appearance.
6. **Feedback form** — feeds the Google Sheet with `[Cut Adrift]` prefix. Confirm still working after changes.

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
--teal-soft:   rgba(93,158,168,0.10)
--radius:      16px
```

Fonts: Cormorant Garamond (headings, wordmark), DM Sans 300/400/500 (body)

---

## Contacts / accounts

- **Primary email:** waynemstevens@gmail.com
- **Feedback form:** Google Sheet, shared with Not Redundant sheet (prefixed `[Cut Adrift]`)
- **Hello address:** hello@cutadrift.org
- **Cloudflare account:** Wayne's personal account
- **GitHub org:** waynemstevens-lab

---

## Session history summary

| Session | Key work |
|---------|----------|
| 1–6 | Initial build: bereavement tool, incapacity tool, carer tool, NZ SEO pages, privacy/terms |
| 7 | Performance: Lighthouse 73→80, removed render-blocking CF obfuscation, async Google Fonts, `<main>` landmark, DMARC sweep |
| 8 | Outreach emails to 5 bereavement organisations |
| 9 | 5 UK bereavement guides, homepage accordion updated, duplicate folder cleanup |
| 10 | Homepage cards → row layout (CSS grid), 5 US bereavement guides, US accordion entry |
