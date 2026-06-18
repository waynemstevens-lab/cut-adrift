# Cut Adrift — Handover Document 16
**Updated:** 14 June 2026  
**Session work:** Hero copy tweak; GSC analysis; full homepage notice board redesign; end-to-end URL test  
**Supersedes:** Handover 15

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
│   ├── index.html                       ← homepage (notice board redesign session 16)
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
# Commit (from Cut Adrift/)
cd ~/Desktop/Cut\ Adrift && git add -A && git commit -m "msg" && git push

# Deploy (from Public/)
cd ~/Desktop/Cut\ Adrift/Public && npx wrangler pages deploy . --project-name cutadrift --commit-dirty=true
```

---

## Homepage — current state (post session 16 redesign)

### Hero copy
```
When life changes
without warning.

Free, practical guides for life's hardest moments. Tell us what's
happened and we'll give you a clear, short-term plan.
```
Note: previously ended "we'll tell you what to do" — changed session 16.

### Design: Notice board aesthetic
The homepage uses a **CSS injection approach** — all original styles remain intact, with a large override block injected just before the first `</style>` tag. This means:
- The original dark navy CSS variables are still in the file but overridden
- Any future edit should be added to the override block, not the original CSS
- The override block is clearly marked `/* ===== NOTICE BOARD REDESIGN ===== */`

**Visual summary:**
- Body: cork board background `#B49A72` with subtle CSS grid texture
- Hero: cream card `#FEFAF2`, slight rotation `0.3deg`, two blue pins via `::before`/`::after`
- Cards: three paper colours (cream `#FBF6EC`, sage `#F2F6EE`, lavender `#F0EEF6`)
- Card pins: red (card 1), green (card 2), blue (card 3) via `::before` pseudo-element
- Card rotations: `-2.1deg`, `0.7deg`, `1.9deg`
- On hover: cards flatten to `rotate(0deg)` and lift
- Guides section: cream pinned card `#F7F2E6` with amber pin, country links as small paper tags with slight rotations
- Trust strip: semi-transparent `rgba(255,255,255,0.22)` on cork
- Footer/wordmark: warm dark brown tones
- Mobile (≤640px): all rotations flattened to 0, stacked single column — **mobile layout was deliberately preserved from pre-redesign and looks good**

### CSS structure in index.html
The override block is injected in this order (multiple `replace()` calls prepended it in reverse):
1. Guides country link tag styles
2. Spacing fixes (header padding, hero margin, card gap)
3. Desktop 3-column grid (`@media (min-width: 641px)`)
4. Core notice board styles (body, hero, cards, trust strip, guides, footer)

---

## Strapline, trust strip, mission, suggest form
(unchanged from session 15)

**Strapline:** `Free help for life's hardest moments. No sign-up, no catch.`

**Trust strip:** `✓ No account needed  ✓ No email address  ✓ No ads, ever  ✓ AI-assisted — guides reference official sources`

**Suggest form action:** `https://docs.google.com/forms/d/e/1FAIpQLSet7gXHb8wl5z-hov0SYAIIFaD4hmnyxc6mHsJ7CLqjXMQPyQ/formResponse`  
**Entry field:** `entry.373344413`

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
**UK and NZ pages** (10): use `.page-disclaimer` CSS class  
**All other pages** (16 confirmed): use inline `<div>` pattern:

```html
<div style="margin-top:48px; padding:14px 0; border-top:1px solid var(--border); font-size:0.8rem; line-height:1.6; color:var(--text-dim);">
  <p style="margin:0;">This guide provides general information only — not legal, financial, or benefits advice. Eligibility rules and payment amounts change regularly. Verify current details with official government sources before making decisions. Information current as of June 2026.</p>
</div>
```

**4 pages with unconfirmed disclaimer status** (excluded from batch grep):
- `what-to-do-when-someone-dies-au`
- `what-to-do-when-someone-dies-ireland`
- `what-to-do-when-someone-dies-canada`
- `what-to-do-when-someone-dies-us`

---

## GSC status (as of 14 June 2026)

- **10 pages indexed**, 3 not indexed
- **2 total clicks**, 58 queries in last 3 months
- Traffic spiked from 11 June — Google starting to serve pages more actively
- Top query: "federal bereavement leave" → `/us-bereavement-leave/` (1 click, 1 impression)
- High-impression zero-click queries: "funeral loan" cluster (54 impressions) — not relevant to Cut Adrift, no action needed
- "mytrove nz" — 13 impressions, 0 clicks; meta title is fine, just needs time
- Country split: NZ 50%, US 50%

---

## End-to-end URL test results (14 June 2026)

All pages tested with Python urllib. Results:

| URL | Status |
|-----|--------|
| / | 200 ✓ |
| /when-someone-dies/ | 200 ✓ |
| /when-someone-cant-manage/ | 200 ✓ |
| /terms/ | 200 ✓ |
| /sitemap.xml | 200 ✓ |
| /guides-nz/ | 200 ✓ |
| /guides-uk/ | 200 ✓ |
| /guides-au/ | 200 ✓ |
| /guides-canada/ | 200 ✓ |
| /guides-us/ | 200 ✓ |
| /nz-bereavement-leave-entitlements/ | 200 ✓ |
| /us-bereavement-leave/ | 200 ✓ |
| /mytrove-nz-guide/ | 200 ✓ |

Worker 403 from terminal = expected (origin check working correctly, not a bug).

---

## Sitemap

`Public/sitemap.xml` — 41 URLs. Submitted to GSC session 13.

All sitemap URLs confirmed matching actual folder names. Notable correct paths:
- `/guides-canada/` (not `/guides-ca/`)
- `/nz-bereavement-leave-entitlements/` (not `/nz-bereavement-leave/`)

---

## Design system (original — still in file, overridden on homepage)

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

Note: UK/NZ guide pages use Lora + Source Sans 3 (earlier build). AU/Ireland/Canada/US pages use Cormorant Garamond + DM Sans.

---

## NEXT SESSION: Apply notice board redesign to Best Man landing pages

### Context
Wayne wants the same notice board aesthetic applied to both Best Man sites:
- `bestmanspeechwriter.uk` (£29)
- `bestmanspeech.nz` (NZ$49)

Files: `~/Desktop/Best Man/public-uk/index.html` and `~/Desktop/Best Man/public-nz/index.html`

**IMPORTANT before any worker deploy:** Verify `ACTIVE_MARKET` flag in `worker.js` is set to `'nz'`.

### How the Cut Adrift notice board was built

The approach was a **pure CSS injection** — no HTML structure changes. A Python script found the first `</style>` tag and inserted a large override block before it. This is safe, reversible, and doesn't break any existing functionality.

**Step-by-step to replicate on Best Man sites:**

**Step 1:** Read the current index.html structure:
```bash
grep -n "class=\|<section\|<div id\|hero\|card\|btn\|heading" ~/Desktop/Best\ Man/public-uk/index.html | head -60 | pbcopy
```
Identify the class names for: hero section, main heading, subheading/body text, CTA button, any card/feature elements, footer.

**Step 2:** Write a Python patch script (same pattern as `noticeboard_patch.py`) that injects CSS before `</style>`. Adapt the following core styles to match the Best Man class names found in Step 1:

```css
/* Cork board body */
body {
  background-color: #B49A72 !important;
  background-image:
    repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 18px),
    repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 18px) !important;
}

/* Hero as pinned card */
.hero {                              /* ← swap class name to match Best Man */
  background: #FEFAF2 !important;
  border-radius: 3px !important;
  box-shadow: 3px 6px 20px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.1) !important;
  position: relative !important;
  transform: rotate(0.3deg) !important;
  max-width: 660px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
/* Two blue pins on hero card */
.hero::before {
  content: ''; width: 12px; height: 12px; border-radius: 50%;
  background: #4A6E8A; position: absolute; top: -6px;
  left: calc(30% - 6px); box-shadow: 0 2px 4px rgba(0,0,0,0.35); z-index: 2;
}
.hero::after {
  content: ''; width: 12px; height: 12px; border-radius: 50%;
  background: #4A6E8A; position: absolute; top: -6px;
  right: calc(30% - 6px); box-shadow: 0 2px 4px rgba(0,0,0,0.35); z-index: 2;
}

/* Feature/benefit cards as pinned notices */
.feature-card, .benefit, .card {    /* ← swap to match Best Man class names */
  background: #FBF6EC !important;
  border-radius: 3px !important;
  box-shadow: 2px 4px 14px rgba(0,0,0,0.2) !important;
  border: none !important;
  position: relative !important;
  animation: none !important;
  opacity: 1 !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}
/* Pin on each card */
.feature-card::before, .benefit::before {
  content: ''; width: 11px; height: 11px; border-radius: 50%;
  position: absolute; top: -6px; left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 2;
}
/* Alternate pin colours and rotations */
.feature-card:nth-child(1) { transform: rotate(-2deg) !important; }
.feature-card:nth-child(1)::before { background: #C44B3A; }
.feature-card:nth-child(2) { transform: rotate(0.7deg) !important; background: #F2F6EE !important; }
.feature-card:nth-child(2)::before { background: #5A8A4A; }
.feature-card:nth-child(3) { transform: rotate(1.8deg) !important; background: #F0EEF6 !important; }
.feature-card:nth-child(3)::before { background: #4A6E8A; }
/* Hover: flatten and lift */
.feature-card:hover {
  transform: rotate(0deg) translateY(-3px) !important;
  box-shadow: 4px 8px 24px rgba(0,0,0,0.28) !important;
}

/* Headings/text on cork */
h1, h2, .hero h1 { color: #1A1008 !important; text-shadow: none !important; }
p, .body-text { color: #4A3818 !important; }

/* CTA button: warm brown */
.cta-btn, .buy-btn, button[type="submit"] {
  background: #7A5020 !important;
  color: #FBF6EC !important;
  border: none !important;
  box-shadow: 1px 2px 6px rgba(0,0,0,0.2) !important;
}

/* Header/nav */
header, nav { background: transparent !important; border: none !important; }
.wordmark, .logo, .brand { color: #4A2E0A !important; }

/* Footer */
footer { color: #6A4E28 !important; }
footer a { color: #5A3E18 !important; }

/* Mobile: flatten all rotations */
@media (max-width: 640px) {
  .hero, .feature-card:nth-child(1),
  .feature-card:nth-child(2), .feature-card:nth-child(3) {
    transform: none !important;
  }
}
```

**Step 3:** Run locally and screenshot before deploying. Iterate CSS tweaks the same way as Cut Adrift session 16 — adjust class names, spacing, and card grid layout based on what the Best Man pages actually use.

**Step 4:** The Best Man sites have separate workers. Remember to check `ACTIVE_MARKET` before any worker deploy. Page deploy is safe without this check.

**Step 5:** Deploy each site separately. The UK and NZ sites are completely independent repos.

---

## Known upcoming changes to watch

| Country | Change | Expected |
|---------|--------|----------|
| UK | Broader statutory bereavement leave (1 week, any loved one, day-one, unpaid) — ERA 2025 | 2027 |
| UK | Statutory protection for pregnancy loss before 24 weeks | 2027 |
| NZ | Employment Leave Bill — bereavement as day-one right, 3 days for more family types | Select committee reports July 2026 |
| NZ | All benefit rates adjust again | 1 April 2027 |
| UK | Scottish FSP flat rate £1,327.75 — check annually | April each year |

---

## Outstanding tasks

### ⚡ PRIORITY

**1. GSC Request Indexing — all corrected pages**
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

**2. Check disclaimers on 4 remaining what-to-do pages**
```bash
grep -L "general information only\|page-disclaimer" \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-au/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-ireland/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-canada/index.html \
  ~/Desktop/Cut\ Adrift/Public/what-to-do-when-someone-dies-us/index.html
```

**3. GSC indexing queue — remaining pages (~10–15/day limit)**

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
/us-funeral-financial-issues/           /nz-bereavement-leave-entitlements/
/us-bereavement-leave/                  /nz-surviving-spouse-benefit/
/us-notify-agencies-after-death/        /mytrove-nz-guide/
```

---

### Ongoing

4. **Outreach follow-up** — 5 bereavement orgs contacted session 8; follow-up due week of 23 June 2026
5. **OG image** — placeholder 1200×630 PNG in place; real branded image outstanding
6. **Feedback form** — feeds Google Sheet with `[Cut Adrift]` prefix; confirm still working
7. **Best Man notice board redesign** — next session priority (see instructions above)
8. **Best Man placeholder testimonials** — James P., May 2026 on both sites; replace with real quotes

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
| 13 | Trust elements (strapline, trust strip, mission, suggest-a-tool); suggest form wired; Ireland/Canada 12 pages built and deployed; GSC sitemap submitted; accuracy audit |
| 14 | Full accuracy audit NZ/AU/UK/US guide pages; 5 corrections; disclaimers added to 16 guide pages; 51 files live |
| 15 | Second audit pass — all remaining pages checked; 4 corrections; all 30 guide pages verified except 4 disclaimer unknowns |
| 16 | Hero copy: "tell you what to do" → "give you a clear, short-term plan"; GSC analysis (10 indexed, 58 queries, 2 clicks); homepage redesigned as notice board aesthetic (cork board, pinned cards, paper tags); end-to-end URL test — all 13 pages 200 OK |
