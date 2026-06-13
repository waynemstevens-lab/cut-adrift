# Cut Adrift — Handover Document 15
**Updated:** 11 June 2026  
**Session work:** Second accuracy audit pass — all 30 guide pages now verified; 4 further corrections deployed; handover 14 superseded

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
├── Public/                              ← deploy root (51 files live)
│   ├── index.html                       ← homepage
│   ├── sitemap.xml                      ← 41 URLs
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── og-image.png                     ← placeholder; real image still outstanding
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
│   │   ├── what-to-do-when-someone-dies-nz/   ← corrected session 15
│   │   ├── how-to-apply-funeral-grant-nz/
│   │   ├── nz-bereavement-leave-entitlements/
│   │   ├── nz-surviving-spouse-benefit/       ← HTML bug fixed session 14
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
│   │   ├── what-to-do-when-someone-dies-uk/   ← corrected session 15
│   │   ├── uk-bereavement-support-payment/    ← corrected session 14
│   │   ├── uk-funeral-expenses-payment/       ← corrected session 15
│   │   ├── uk-bereavement-leave/              ← corrected session 14
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
│       ├── us-social-security-survivor-benefits/ ← corrected session 14
│       ├── us-funeral-financial-assistance/      ← corrected session 14
│       ├── us-bereavement-leave/                 ← corrected session 14
│       └── us-notify-agencies-after-death/
│
└── Handovers/
```

---

## Deploy commands

```bash
# Commit (from Cut Adrift/)
cd ~/Desktop/Cut\ Adrift && git add -A && git commit -m "msg" && git push

# Deploy (from Public/)
cd ~/Desktop/Cut\ Adrift/Public && npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true
```

---

## Homepage — current state

**Strapline** (under wordmark): `Free help for life's hardest moments. No sign-up, no catch.` — `.strapline`, 0.75rem, DM Sans 300, `var(--text-dim)`

**Trust strip** (below tool cards): `✓ No account needed  ✓ No email address  ✓ No ads, ever  ✓ AI-assisted — guides reference official sources` — `.trust-strip` / `.trust-item` / `.trust-check`

**Mission statement** (below guides row): amber left-border italic quote in Cormorant Garamond — `.mission`

**Suggest a tool** (above footer): textarea + "Send suggestion" button wired to Google Form — `.suggest` / `.suggest-textarea` / `.suggest-btn` / `.suggest-thanks`

### Suggest form
**Form action URL:** `https://docs.google.com/forms/d/e/1FAIpQLSet7gXHb8wl5z-hov0SYAIIFaD4hmnyxc6mHsJ7CLqjXMQPyQ/formResponse`  
**Entry field:** `entry.373344413`  
**Sheet prefix:** `[Suggest]`  
**Status:** Live and tested.

---

## Bereavement tool — country picker

`when-someone-dies/index.html` — custom card/button components (not a `<select>`).

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

Each country has a guide index page at `/guides-{slug}/` and 5 article pages. All article pages share: canonical tag, OG/Twitter card tags, Article JSON-LD schema, breadcrumb, related guides section, shared CSS variables and fonts.

| Country | Index | Guides |
|---------|-------|--------|
| New Zealand | /guides-nz/ | `*-nz/`, `nz-*`, `mytrove-nz-guide/` |
| Australia | /guides-au/ | `*-au/`, `au-*` |
| United Kingdom | /guides-uk/ | `*-uk/`, `uk-*`, `tell-us-once-uk-guide/` |
| Republic of Ireland | /guides-ireland/ | `*-ireland/`, `ireland-*` |
| Canada | /guides-canada/ | `*-canada/`, `canada-*` |
| United States | /guides-us/ | `*-us/`, `us-*` |

### Disclaimer status
All 30 guide pages confirmed carrying a disclaimer except **4 pages whose status was not verified**:
- `what-to-do-when-someone-dies-au`
- `what-to-do-when-someone-dies-ireland`
- `what-to-do-when-someone-dies-canada`
- `what-to-do-when-someone-dies-us`

These were excluded from the disclaimer grep by the `when-someone` filter. Check and add if missing — use the inline `<div>` pattern below.

**UK and NZ pages** (10): use `.page-disclaimer` CSS class (styled in page `<style>` block)  
**All other pages** (16 confirmed): use inline `<div>` pattern:

```html
<div style="margin-top:48px; padding:14px 0; border-top:1px solid var(--border); font-size:0.8rem; line-height:1.6; color:var(--text-dim);">
  <p style="margin:0;">This guide provides general information only — not legal, financial, or benefits advice. Eligibility rules and payment amounts change regularly. Verify current details with official government sources before making decisions. Information current as of June 2026.</p>
</div>
```

---

## Sitemap

`Public/sitemap.xml` — 41 URLs. Submitted to GSC in session 13.

---

## Complete accuracy audit record

### Session 13 corrections (Ireland and Canada)

| Page | Issue | Fix |
|------|-------|-----|
| `ireland-bereavement-payments` | Pension renamed July 2025 to "Bereaved Partner's (Contributory/Non-Contributory) Pension"; extended to cohabitants | Updated throughout; note old name still in common use |
| `ireland-funeral-financial-assistance` | Occupational Injuries funeral grant deadline wrong (12 months → should be 3 months) | Fixed to "within 3 months" with warning |
| `ireland-funeral-financial-assistance` | "Exceptional Needs Payment" → now "Additional Needs Payment (ANP)" | Updated; note ENP still a sub-category |
| `ireland-bereavement-payments` | Same ENP → ANP issue | Fixed |
| `what-to-do-when-someone-dies-ireland` | Reference to "Widow's/Widower's Contributory Pension" | Updated to "Bereaved Partner's (Contributory) Pension" |
| `canada-survivor-benefits` | CPP Death Benefit stated as "$2,500" (changed Jan 2025 to up to $5,000) | Updated with two-tier explanation |

### Session 14 corrections (NZ, AU, UK, US guide pages)

| Page | Issue | Fix |
|------|-------|-----|
| `uk-bereavement-support-payment` | Cohabitant extension overstated — higher rate only, dependent children required; cohabitants without children cannot claim | Rewrote section with eligibility list, "higher rate only" qualifier, backdating note |
| `uk-bereavement-leave` | Statutory pay rate £184.03 (2025); Bereaved Partner's Paternity Leave (6 April 2026) missing | Fixed to £194.32; added full new section on new right (52 weeks, day-one); added 2027 ERA preview |
| `us-social-security-survivor-benefits` | No mention of SSFA (GPO/WEP repealed Jan 2025); no COLA note; no disclaimer | Added SSFA/GPO repeal section; COLA note (2.8% 2026); added disclaimer |
| `us-funeral-financial-assistance` | FEMA COVID programme listed as active — closed 30 September 2025; no disclaimer | Updated to note closure; preserved non-COVID FEMA note; added disclaimer |
| `us-bereavement-leave` | Five states listed (Vermont added July 2025, now six); no disclaimer | Updated count to six; added Vermont detail; added disclaimer |

### Session 15 corrections (what-to-do and FEP pages)

| Page | Issue | Fix |
|------|-------|-----|
| `what-to-do-when-someone-dies-nz` | Funeral Grant cited as "$2,408.74 (2024–25 rates)" — stale figure | Updated to $2,697.43 (rates from 1 April 2026) |
| `uk-funeral-expenses-payment` | Line citing "£1,327.75 towards other funeral costs (as of May 2026)" — this is the Scottish FSP figure, not the England/Wales cap | Removed the line entirely; England/Wales cap remains £1,000 as stated correctly elsewhere in same page |
| `what-to-do-when-someone-dies-uk` | Average UK funeral cost cited as £4,141 — SunLife Cost of Dying Report 2026 gives £3,828 for a simple attended funeral | Updated to £3,828 |
| `uk-funeral-expenses-payment` | Same £4,141 figure present in intro paragraph | Updated to £3,828 for a simple attended funeral |

### Confirmed correct — full verification record

| Page | Key figures verified | Source |
|------|---------------------|--------|
| `how-to-apply-funeral-grant-nz` | $2,697.43 | workandincome.govt.nz |
| `nz-surviving-spouse-benefit` | $2,697.43 grant; NZ Super couple $854.08/fn, single $1,110.30/fn | workandincome.govt.nz April 2026 rates |
| `nz-bereavement-leave-entitlements` | 3 days / 1 day; Employment Leave Bill in Parliament not yet law | employment.govt.nz |
| `au-bereavement-payment` | Variable: 14 weeks × (couple rate − new single rate) | servicesaustralia.gov.au |
| `au-bereavement-leave` | 2 days paid per occasion | fairwork.gov.au May 2026 |
| `uk-bereavement-support-payment` | £3,500/£350 higher; £2,500/£100 standard; cohabitants with dependent children only | gov.uk |
| `uk-bereavement-leave` | £194.32 statutory pay; Bereaved Partner's Paternity Leave 6 April 2026 | legislation.gov.uk |
| `uk-funeral-expenses-payment` | £1,000 other costs cap; £120 pre-paid plan cap; 6-month deadline; £3,828 avg funeral cost | gov.uk May 2026 |
| `us-social-security-survivor-benefits` | $255 lump sum; GPO repealed Jan 2025; 2.8% COLA 2026 | ssa.gov |
| `us-funeral-financial-assistance` | FEMA COVID closed 30 Sept 2025; VA benefits correct | fema.gov |
| `us-bereavement-leave` | No federal law; 6 states (CA, IL, MD, OR, VT from July 2025, WA) | Multiple state sources |
| `tell-us-once-uk-guide` | 28-day reference number validity | Multiple council sources |
| `mytrove-nz-guide` | 10-week IRD processing (general estimate) | Stable |
| `what-to-do-when-someone-dies-nz` | $2,697.43 grant; 3-working-day registration | workandincome.govt.nz |
| `what-to-do-when-someone-dies-uk` | £3,828 avg funeral; £11 death cert; £273 probate; £322k intestacy; £325k/£175k IHT thresholds; 40% IHT; 5/8/5-day registration | gov.uk/hmrc |
| `what-to-do-when-someone-dies-us` | SSA 1-800-772-1213; 10–12 cert copies | ssa.gov |
| `what-to-do-when-someone-dies-canada` | CRA 1-800-959-8281; T1 terminal return deadline correct | cra-arc.gc.ca |
| `what-to-do-when-someone-dies-ireland` | Life Events service; Civil Registration Office process | hse.ie |
| `what-to-do-when-someone-dies-au` | 132 300 Centrelink; Medicare auto-cancelled on BDM registration | servicesaustralia.gov.au |
| All `*-notify-agencies-after-death` | No specific figures; process descriptions stable | Verified by content grep |

### Not yet audited at content level

- 6× `guides-*/index.html` — navigation index pages only, low risk

---

## Known upcoming changes to watch

| Country | Change | Expected |
|---------|--------|----------|
| UK | Broader statutory bereavement leave (1 week, any loved one, day-one, unpaid) — ERA 2025 secondary legislation | 2027 |
| UK | Statutory protection for pregnancy loss before 24 weeks | 2027 |
| NZ | Employment Leave Bill — bereavement as day-one right, 3 days for more family types | Select committee reports July 2026 |
| NZ | All benefit rates adjust again | 1 April 2027 |
| UK | Scottish FSP flat rate £1,327.75 — check annually for uprating | April each year |

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

Note: UK/NZ pages use Lora + Source Sans 3 (earlier build). AU/Ireland/Canada/US pages use Cormorant Garamond + DM Sans. Functionally identical colour system.

---

## Technical infrastructure

- **Cloudflare Pages** — static hosting, deploy from `Public/`
- **Cloudflare Worker** `cutadrift-engine` — proxies AI requests, KV caching
- **Anthropic API** — Claude Haiku, max_tokens 2000
- **KV namespace ID:** `3a74818b39634ca494158c8dc55d8cd9`
- **GitHub:** `waynemstevens-lab/cut-adrift` (private)
- **Live file count:** 51 files on Cloudflare Pages

---

## Outstanding tasks

### ⚡ PRIORITY

**1. GSC Request Indexing — all corrected pages**  
8 pages changed across sessions 14–15, submit for reindexing:
```
https://cutadrift.org/uk-bereavement-support-payment/
https://cutadrift.org/uk-bereavement-leave/
https://cutadrift.org/us-social-security-survivor-benefits/
https://cutadrift.org/us-funeral-financial-assistance/
https://cutadrift.org/us-bereavement-leave/
https://cutadrift.org/what-to-do-when-someone-dies-nz/
https://cutadrift.org/uk-funeral-expenses-payment/
https://cutadrift.org/what-to-do-when-someone-dies-uk/
```

**2. ProductHunt promo code — expires 19 June 2026**  
Decision outstanding on renewal.

**3. Check disclaimers on 4 remaining what-to-do pages**  
These were excluded from the disclaimer batch check. Verify and add if missing:
```bash
grep -L "general information only\|page-disclaimer" \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-au/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-ireland/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-canada/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-us/index.html
```

**4. GSC Request Indexing — remaining queue from session 13**  
(~10–15/day limit; work through over following days)

*Country index pages (6):*
```
https://cutadrift.org/guides-ireland/
https://cutadrift.org/guides-canada/
https://cutadrift.org/guides-au/
https://cutadrift.org/guides-uk/
https://cutadrift.org/guides-us/
https://cutadrift.org/guides-nz/
```

*Remaining 24 guide pages:*
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

---

### Ongoing

5. **Outreach follow-up** — 5 bereavement orgs contacted session 8; follow-up due week of 23 June 2026
6. **OG image** — placeholder 1200×630 PNG in place; real branded image would improve social shares
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
| 13 | Trust elements (strapline, trust strip, mission, suggest-a-tool); suggest form wired; Ireland/Canada 12 pages built and deployed; GSC sitemap submitted; accuracy audit — 6 Ireland/Canada corrections |
| 14 | Full accuracy audit NZ/AU/UK/US guide pages; 5 corrections (UK BSP cohabitants, UK bereaved partner leave new right Apr 2026, US SSFA/GPO repeal, US FEMA closure, US bereavement leave 6 states); disclaimers added to 16 guide pages; NZ surviving spouse rates verified; duplicate `<main>` tag fixed; uk-guides.zip removed; 51 files live |
| 15 | Second audit pass — all remaining pages checked (what-to-do, notify agencies, FEP, Tell Us Once, myTrove); 4 corrections (NZ funeral grant stale figure, UK FEP Scottish £1,327.75 figure removed, UK avg funeral cost £4,141→£3,828 on two pages); all 30 guide pages now verified except 6 guides-* index pages and 4 what-to-do disclaimer status unknown |
