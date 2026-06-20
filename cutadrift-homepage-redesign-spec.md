# Cut Adrift homepage redesign — spec for Claude Code

**What this is:** a full visual redesign of the homepage, decided in a Claude.ai strategy session. Direction, palette, copy, and layout are all locked. This doc is implementation-ready — work through it top to bottom.

**Important — do this as a clean rewrite, not another patch.** The current `index.html` has three stacked design systems layered with `!important` overrides on top of each other (an original dark editorial theme → a "desktop grid" patch → a "NOTICE BOARD REDESIGN" cork-board theme, added in session 16). Delete all of it — the entire `<style>` block — and write one clean stylesheet using the spec below. Do not add a fourth override layer on top of the existing mess.

---

## Colors

```css
--bg:          #15120e;   /* warm near-black, not cool navy */
--border:      rgba(255,255,255,0.07);
--text:        #e9e2d3;
--text-muted:  rgba(233,226,211,0.70);
--text-dim:    rgba(233,226,211,0.46);

--clay:        #c1734f;   /* primary accent */
--clay-soft:   rgba(193,115,79,0.13);
--sage:        #7c8d76;   /* secondary accent — also the logo color */
--sage-soft:   rgba(124,141,118,0.12);
```

Background gets two soft radial gradients for atmospheric depth — flat solid color reads "severe," this fixes that:

```css
background-color: var(--bg);
background-image:
  radial-gradient(ellipse 75% 55% at 12% -8%, rgba(193,115,79,0.10) 0%, transparent 58%),
  radial-gradient(ellipse 65% 50% at 92% 105%, rgba(124,141,118,0.07) 0%, transparent 58%);
```

Proof card (see Hero section below) is the one light element on the page: background `#FBF8F2`, text `#211d17`.

## Typography

- Headlines / display / accent words: **Fraunces** (Google Fonts), italic for accent text
- Body / UI / nav: **Inter** (Google Fonts), weight 300 for body copy, 400–500 for labels

Replace the current Cormorant Garamond + DM Sans pairing entirely.

## Logo

Reuse the existing favicon shape (`/favicon.svg`) — a four-point compass/diamond — but recolor it to sage and use it as an in-page logo mark next to the wordmark, not just a browser-tab icon.

```svg
<svg viewBox="0 0 100 100">
  <path d="M50,8 L61,38 L92,50 L61,62 L50,92 L39,62 L8,50 L39,38 Z" fill="#7c8d76"/>
  <circle cx="50" cy="50" r="5" fill="#15120e"/>
  <circle cx="50" cy="50" r="2" fill="#7c8d76"/>
</svg>
```

Use the **filled** version (not an outline) — it holds up better at small/favicon sizes. Pair at ~20–24px next to the wordmark.

---

## Header / nav

Replace the current stacked wordmark+strapline with a proper horizontal bar:

- Left: logo mark + "CUT ADRIFT" wordmark (Fraunces, uppercase, letter-spacing ~0.14em)
- Right: two minimal nav links — "Guides" (anchors to the guides section) and "Why it's free" (anchors to the mission statement)
- Hairline border-bottom (`var(--border)`) separating the bar from the hero
- No login/pricing — this is a free tool, don't add nav items that imply otherwise
- The strapline ("Free help for life's hardest moments. No sign-up, no catch.") is removed from the header — that messaging now lives in the trust strip lower on the page, so it isn't lost, just not duplicated

## Hero

**Headline (h1):**
```
When you don't know where to start
— or what to say.
```
Second clause ("or what to say.") in italic Fraunces, color `var(--clay)`. First line stays default text color — **do not let any color override blank out the plain text**, both lines must be clearly legible.

**Subhead (unchanged):**
> Free, step-by-step guidance for life's hardest moments — with the letters, calls, and messages already drafted for you.

## How it works — 3-step strip with Roman numerals

Sits below the hero, above the proof card. Three columns (stack on mobile), separated by thin vertical hairlines, Roman numerals in italic Fraunces, `var(--clay)`:

| | Copy |
|---|---|
| **I.** | Answer a few quiet questions about your situation — nothing clinical, no jargon. |
| **II.** | We build your plan — what to do first, what can wait, specific to your country. |
| **III.** | We draft what you actually need to send — ready to use. *(include a small abstracted document icon here — a tiny rectangle with 2–3 thin horizontal lines inside, representing a letter)* |

## Proof card

This is the single most important new element — it shows actual output instead of just describing it. A small floating "letter," styled like a real drafted document, not a chat bubble or UI panel:

- Light card (`#FBF8F2` bg, `#211d17` text), slight rotation (~-0.6deg), real drop shadow for a "floating" feel
- Small clay-colored tag reading "Drafted for you" overlapping the top edge
- Label above the card: "An example of what we draft, automatically"
- Content — a realistic, short bereavement-leave email excerpt:

```
To: HR Team · Subject: Bereavement leave — Sarah Mitchell

Hi Janet,

I'm writing to let you know my father passed away yesterday.
I'll need to take bereavement leave starting today.

I'll confirm my return date once I have more clarity.
Thank you for your understanding.

Sarah
```

## Situation cards

Four cards, hairline-grid layout (2×2 on desktop, stacked on mobile) — thin 1px dividers between cards rather than individual rounded boxes with shadows. No card background color difference from the page; this is deliberately flat/print-like, not SaaS-card styling.

Replace the emoji icons with custom line-drawn SVG icons (stroke-width ~1.3, stroke-linecap round, no fill):

**Card 1 — Someone I love has died** (icon color: clay)
```svg
<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 21c-3 0-5-1.8-5-4.6 0-2.4 1.8-4 3-6.4 0 1.6 1 2 1 2 .3-2.6-1-4-1-7 3 1.6 5.5 5 5.5 8.6 0 1.2-.4 2-.4 2s1-.4 1.5-1.6c.6 1 .9 2 .9 2.8 0 2.8-2 4.2-4.5 4.2z"/>
</svg>
```
Keep existing copy: "What to do in the hours, days, and weeks after losing someone — including letters to their employer and messages to family, already drafted for you."

**Card 2 — I've had a serious diagnosis** (icon color: sage)
```svg
<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
<path d="M3 12h4l2 6 3-12 2 6h7"/>
</svg>
```
Keep existing copy: "The first week's plan — what to sort, what NOT to do yet, and the income protection cover you may not realise you have, with the calls already drafted to claim it."

**Card 3 — Someone can no longer manage** (icon color: sage)
```svg
<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
<circle cx="9" cy="12" r="5.5"/><circle cx="15" cy="12" r="5.5"/>
</svg>
```
Keep existing copy: "When a parent, partner, or someone close can no longer manage on their own — and you're the one who has to figure it out."

**Card 4 — I've lost my job** (icon color: clay, external link to notredundant.com)
```svg
<svg viewBox="0 0 24 24" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
<rect x="3.5" y="8" width="17" height="11" rx="1.5"/><path d="M8.5 8V6a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 6v2"/>
</svg>
```
Keep existing copy and external link.

## Trust strip

Replace **"No ads, ever"** with **"We don't sell your data"** — a durable, falsifiable promise instead of an absolute claim about a business model that could change. Full set:

> ✓ No account needed &nbsp; ✓ No email address &nbsp; ✓ We don't sell your data &nbsp; ✓ AI-assisted, verified against official sources

Check the privacy page and anywhere else "no ads, ever" appears on the site and update for consistency.

## Guides section

Keep the existing content and links (NZ/AU/UK/Ireland/Canada/US, featured NZ guide link) — just restyle to match the new flat/hairline aesthetic instead of the cork-board "pinned tag" treatment. No rotation, no pin dots, no drop shadows.

## Mission statement

Keep close to existing copy but align with the trust-strip change — drop "no ad revenue, no data resale" phrasing in favor of consistent language:

> Built by one person, not a company chasing growth. Free to use. No account, no catch.

Style: centered, italic Fraunces, `var(--text-muted)`.

## Footer

Update "No ads." to match the new trust messaging (drop the absolute "ads, ever" framing, same as the trust strip).

---

## Notes / things to flag back

- This spec covers the **homepage only**. The tool pages (`/when-someone-dies/`, etc.) and guide pages still use the old styling — worth a follow-up pass once this is live, for consistency, but out of scope for this task.
- Three reasons in GSC's "why pages aren't indexed" report (page-with-redirect ×2, redirect-error ×1, duplicate-without-canonical ×1) are still unreviewed from the earlier indexing check — unrelated to this redesign, just don't lose track of it.
- Once this is deployed, it's worth a real browser click-through on mobile specifically — the hairline-grid cards and the floating proof card are the two elements most likely to need adjustment at narrow widths.
