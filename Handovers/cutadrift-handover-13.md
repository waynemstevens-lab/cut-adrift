# Cut Adrift — Handover Document 13
**Updated:** 11 June 2026  
**Session work:** Trust elements (homepage), suggest form wired, 12 missing guide pages built and corrected, GSC sitemap submitted, accuracy audit

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
│   ├── index.html                       ← homepage (updated this session)
│   ├── sitemap.xml                      ← 41 URLs
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
│   │   ├── guides-ireland/              ← NEW this session
│   │   ├── guides-canada/               ← NEW this session
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
│   ├── Ireland guides (5):             ← NEW this session
│   │   ├── what-to-do-when-someone-dies-ireland/
│   │   ├── ireland-bereavement-payments/
│   │   ├── ireland-funeral-financial-assistance/
│   │   ├── ireland-bereavement-leave/
│   │   └── ireland-notify-agencies-after-death/
│   │
│   ├── Canada guides (5):              ← NEW this session
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

### Trust elements added this session

**Strapline** — under the CUT ADRIFT wordmark in the header:
```
Free help for life's hardest moments. No sign-up, no catch.
```
CSS class: `.strapline` — 0.75rem, DM Sans 300, `var(--text-dim)` colour.

**Trust strip** — appears below the 3 tool cards, before the guides section:
```
✓ No account needed  ✓ No email address  ✓ No ads, ever  ✓ AI-assisted — guides reference official sources
```
CSS class: `.trust-strip` / `.trust-item` / `.trust-check`

**Mission statement** — below the Bereavement Guides row, amber left-border quote in Cormorant Garamond italic:
> *This site was built — without funding or fanfare — because it needed to exist. Free to use. No email, no account, no catch.*

CSS class: `.mission`

**Suggest a tool** — below the mission, before the footer:
- Label: "MISSING SOMETHING?"
- Desc: "Is there a situation we haven't covered yet? Let us know and we'll consider it for a future tool."
- Textarea + "Send suggestion" button
- CSS classes: `.suggest`, `.suggest-textarea`, `.suggest-btn`, `.suggest-thanks`

### Suggest form — Google Form connection

**Form:** Cut Adrift Suggestions (Google Forms)  
**Sheet:** Cut Adrift Suggestions (Google Sheets) — Timestamp + Suggestion columns  
**Form action URL:** `https://docs.google.com/forms/d/e/1FAIpQLSet7gXHb8wl5z-hov0SYAIIFaD4hmnyxc6mHsJ7CLqjXMQPyQ/formResponse`  
**Entry field:** `entry.373344413`  
**Prefix in sheet:** `[Suggest]` (prepended in JS before posting)  
**Status:** Live and tested — submissions confirmed appearing in sheet.

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

---

## Guide structure — all 6 countries

Each country has a guide index page at `/guides-{slug}/` and 5 article pages. All article pages share: canonical tag, OG/Twitter card tags, Article JSON-LD schema, breadcrumb back to country index, related guides section, same CSS variables and fonts as homepage.

| Country | Index | Guides |
|---------|-------|--------|
| New Zealand | /guides-nz/ | `*-nz/`, `nz-*`, `mytrove-nz-guide/` |
| Australia | /guides-au/ | `*-au/`, `au-*` |
| United Kingdom | /guides-uk/ | `*-uk/`, `uk-*`, `tell-us-once-uk-guide/` |
| Republic of Ireland | /guides-ireland/ | `*-ireland/`, `ireland-*` |
| Canada | /guides-canada/ | `*-canada/`, `canada-*` |
| United States | /guides-us/ | `*-us/`, `us-*` |

---

## Sitemap

`Public/sitemap.xml` — 41 URLs. Submitted to GSC this session. Contains:
- 5 core pages (homepage, 2 tools, privacy, terms)
- 6 country guide index pages
- 30 guide pages (5 × 6 countries)

**GSC status:** Sitemap submitted this session. URL inspection requests for priority pages sent but some were rejected (404) before the Ireland/Canada pages were deployed. Resubmit those after the corrected zip is deployed (see Outstanding Tasks).

---

## Accuracy audit — session 13 findings

An accuracy check was run this session. Corrections applied to Ireland and Canada pages (which were built this session). Pages built in prior sessions (NZ, AU, UK, US) were not fully checked.

### Corrections applied (Ireland and Canada pages)

| Page | Issue | Fix |
|------|-------|-----|
| `ireland-bereavement-payments` | Pension renamed in July 2025: "Widow's, Widower's or Surviving Civil Partner's Pension" → **"Bereaved Partner's (Contributory/Non-Contributory) Pension"**; extended to cohabitants | Updated heading, body, and meta description; added note that old name still in common use |
| `ireland-funeral-financial-assistance` | Occupational Injuries funeral grant claim deadline was wrong: said 12 months, should be **3 months** (risk of losing benefit after 3 months) | Fixed to "within 3 months" with clear warning |
| `ireland-funeral-financial-assistance` | "Exceptional Needs Payment" is now called **"Additional Needs Payment (ANP)"** | Updated heading and body; note that ENP is still a sub-category |
| `ireland-bereavement-payments` | Same ENP → ANP issue | Fixed |
| `what-to-do-when-someone-dies-ireland` | Reference to "Widow's/Widower's Contributory Pension" | Updated to "Bereaved Partner's (Contributory) Pension" |
| `canada-survivor-benefits` | CPP Death Benefit stated as "$2,500" — changed in January 2025 to up to **$5,000**: base $2,500 + $2,500 top-up for estates where deceased never drew retirement/disability benefits and no survivor eligible | Updated with full two-tier explanation |

### Pages not yet audited (prior sessions)

These need checking in a future session:

| Country | Key risk |
|---------|----------|
| **NZ** | WINZ Funeral Grant maximum is currently **$2,697.43** — verify `how-to-apply-funeral-grant-nz` shows correct figure |
| **UK** | Bereavement Support Payment now covers **cohabitants** (extended Feb 2023) — check if `uk-bereavement-support-payment` mentions this. Rates (£3,500/£350 higher, £2,500/£100 standard) are correct and unchanged for 2025/26 |
| **AU** | Centrelink bereavement payment is **variable** (equivalent to 14 weeks of combined couple payment minus new single rate) — check `au-bereavement-payment` describes it as variable, not a fixed sum |
| **US** | Not checked at all this session |

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

**1. Deploy corrected Ireland/Canada pages**
The accuracy-corrected zip needs to be applied and redeployed:
```bash
cd ~/Desktop/Cut\ Adrift/Public && unzip -o ~/Downloads/ireland-canada-pages.zip
cd ~/Desktop/Cut\ Adrift && git add -A && git commit -m "Fix Ireland and Canada accuracy corrections" && git push
cd ~/Desktop/Cut\ Adrift/Public && npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true
```

**2. Complete GSC URL inspection requests**
36 guide pages need Request Indexing. Priority order:

*Country index pages (6):*
```
https://cutadrift.org/guides-ireland/
https://cutadrift.org/guides-canada/
https://cutadrift.org/guides-au/
https://cutadrift.org/guides-uk/
https://cutadrift.org/guides-us/
https://cutadrift.org/guides-nz/
```

*"What to do" pages (6):*
```
https://cutadrift.org/what-to-do-when-someone-dies-ireland/
https://cutadrift.org/what-to-do-when-someone-dies-canada/
https://cutadrift.org/what-to-do-when-someone-dies-au/
https://cutadrift.org/what-to-do-when-someone-dies-uk/
https://cutadrift.org/what-to-do-when-someone-dies-us/
https://cutadrift.org/what-to-do-when-someone-dies-nz/
```

*Remaining 24 guide pages (do over following days — GSC limit ~10–15/day):*
```
/ireland-bereavement-payments/          /canada-survivor-benefits/
/ireland-funeral-financial-assistance/  /canada-funeral-financial-assistance/
/ireland-bereavement-leave/             /canada-bereavement-leave/
/ireland-notify-agencies-after-death/   /canada-notify-agencies-after-death/
/au-bereavement-payment/                /uk-bereavement-support-payment/
/au-funeral-financial-assistance/       /uk-funeral-expenses-payment/
/au-bereavement-leave/                  /uk-bereavement-leave/
/au-notify-agencies-after-death/        /tell-us-once-uk-guide/
/us-social-security-survivor-benefits/  /how-to-apply-funeral-grant-nz/
/us-funeral-financial-assistance/       /nz-bereavement-leave-entitlements/
/us-bereavement-leave/                  /nz-surviving-spouse-benefit/
/us-notify-agencies-after-death/        /mytrove-nz-guide/
```

**3. Audit NZ, AU, UK, US pages for accuracy**
See table in Accuracy Audit section above. Key risks: NZ funeral grant amount, UK BSP cohabitant eligibility, AU bereavement payment description, US pages unchecked.

---

### Ongoing

4. **Outreach follow-up** — 5 bereavement orgs contacted, follow-up due week of 23 June 2026
5. **uk-guides.zip** — stray file sitting in `Public/` — delete it
6. **OG image** — placeholder 1200×630 PNG in place; a real branded image would improve social shares
7. **Feedback form** — feeds Google Sheet with `[Cut Adrift]` prefix; confirm still working

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
| 13 | Trust elements added to homepage (strapline, trust strip, mission statement, suggest-a-tool); suggest form wired to Google Form (Cut Adrift Suggestions sheet); discovered Ireland and Canada guide pages missing — all 12 built and deployed; GSC sitemap submitted; accuracy audit run — 6 corrections applied to Ireland/Canada pages; NZ/AU/UK/US pages flagged for audit next session |
