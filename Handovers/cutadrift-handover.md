# Cut Adrift — Handover Notes
*Session ended: Friday 5 June 2026*

---

## What was built today

Cut Adrift (cutadrift.org) is a free, AI-powered crisis navigation platform. Today we built the full foundation: the brand, the architecture, the Worker engine, and the bereavement tool frontend.

---

## The big picture

**cutadrift.org** is a parent brand housing multiple free life-crisis navigation tools:

| Tool | Path | Status |
|------|------|--------|
| When someone dies | /when-someone-dies/ | ✅ Built and deployed |
| Suddenly a carer | /becoming-a-carer/ | 🔲 Designed, not built |
| Lost your job | External → notredundant.com | 🔗 Linked from home |

The long-term vision: the go-to destination when life changes without warning. notredundant.com stays independent for now but will eventually fold under the Cut Adrift umbrella.

---

## Infrastructure

### Domain
- **cutadrift.org** — registered on Cloudflare, $8/year
- Currently live at: https://5574738c.cutadrift.pages.dev
- cutadrift.com is separately owned (parked/dormant, not a concern)
- cutadrift.nz and cutadrift.co.nz also available if needed later

### Cloudflare setup
- **Pages project**: `cutadrift` — hosts the frontend
- **Worker**: `cutadrift-engine` — the AI backend
- **KV namespace**: `RATE_LIMIT` — ID: `3a74818b39634ca494158c8dc55d8cd9`
- **Account ID**: `16d2f98512a9a9e553da03f7a45e6236`
- **Worker URL**: `https://cutadrift-engine.waynemstevens.workers.dev`

### Worker secrets
- `ANTHROPIC_API_KEY` — set (dedicated key named `cutadrift-engine` in Anthropic console)
- `ALLOWED_ORIGIN` — set to `https://cutadrift.org` in wrangler.toml

---

## File structure

```
~/Desktop/Cut Adrift/
├── wrangler.toml                    ← Worker config
├── worker.js                        ← The engine (deploy from Cut Adrift/ root)
└── Public/                          ← Deploy from here for Pages
    ├── index.html                   ← Cut Adrift home page
    ├── when-someone-dies/
    │   └── index.html               ← Bereavement intake (11-question flow)
    └── plan/
        └── index.html               ← Results page (shared across all tools)
```

> Note: when-someone-dies/index.html has a multi-step intake of up to 12 questions depending on path taken (fewer for the weeks_ago path which skips Layer 1 entirely).

```
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

## How the bereavement tool works

### The flow
1. User arrives at cutadrift.org → routed to /when-someone-dies/
2. Multi-step intake (up to 12 questions)
3. Answers stored in `sessionStorage` as JSON under key `cutadrift_intake`
4. Redirected to /plan/
5. Plan page reads intake from sessionStorage and POSTs to the Worker
6. Worker calls Claude API (streaming SSE)
7. Response streams back, renders as markdown
8. Completed plan is cached in `sessionStorage` under key `cutadrift_plan` — so if the user refreshes /plan/ they see the same plan without re-calling the Worker. Clear `sessionStorage` to force a fresh plan.

### The intake questions
**Layer 1 — Human situation** (shown for recent/week_ago):
1. Country (nz/au/uk/ie/other)
2. Timing (recent_sudden/recent_expected/week_ago/weeks_ago) ← router
3. Relationship (partner/parent/child/sibling/grandparent/other)
4. Emotional state (barely_functioning/holding_together/need_the_list/not_sure)
5. Support situation (has_support/some_support/mostly_alone/complicated)
6. Children affected (their_children_at_home/own_grieving_children/both/no/dont_know)
7. Notifications needed (most_told/havent_started/think_all_told/dont_know)
8. Dependants (yes_caring_for_someone/yes_pets/yes_other/no/not_sure)

**Bridge** (shown for recent/week_ago):
- practical_opted_in (yes/no) — whether to include estate/admin steps

**Layer 2 — Practical** (shown if opted_in = yes, OR if weeks_ago):
9. Funeral status (not_started/in_progress/done/someone_else)
10. Has will (yes_executor/yes_not_executor/no_will/dont_know)
11. Assets (yes/no/dont_know)
12. Free text (optional — specific worry)

**Routing logic:**
- weeks_ago → skip Layer 1 + bridge entirely, go straight to Layer 2, practical_opted_in auto = true
- bridge = no → skip Layer 2, go to free text
- dont_know answers → Claude produces "how to find out" steps inline

### Three output paths (determined by timing + emotional_state)
- **Path A** — barely_functioning + recent: 3-4 actions only, nothing else
- **Path B** — holding_together/need_the_list + recent/week: full plan with sections
- **Path C** — weeks_ago: practical-only plan with estate checklist

---

## The Worker (worker.js)

### Architecture
Multi-tool routing — designed to hold all future tools:

```javascript
const SYSTEM_PROMPTS = {
  bereavement: `...full prompt...`,
  carer: `...placeholder...`  // to be written
};

const INTAKE_FORMATTERS = {
  bereavement: formatBereavementIntake,
  carer: formatCarerIntake  // placeholder
};
```

The intake JSON must include `tool: "bereavement"` (or future tool name). The worker validates the tool field, selects the right prompt and formatter, calls Claude, and streams the response.

### Rate limiting
- 10 requests per IP per 24 hours
- KV key: `rl:{ip}` with 86400 second TTL
- On KV failure: allows request through (never block someone in crisis)
- Rate limit error message is human, not technical

### Model
Currently using `claude-sonnet-4-5` — update in worker.js if upgrading.

---

## The system prompt (embedded in worker.js)

Full bereavement system prompt is embedded as `SYSTEM_PROMPTS.bereavement`. Key instructions:

- **Tone**: warm, never clinical, one acknowledgement only
- **Sensitive cases**: child loss (extra gentleness), sudden death (acknowledge shock), complicated family (conflict guidance), alone (acknowledge load)
- **Don't know handling**: each dont_know field triggers "how to find out" steps
- **NZ-specific**: IRD, WINZ, Public Trust, KiwiSaver separate from will, coroner handled by funeral director, BDM certificates ~$33
- **Formatting**: markdown, numbered steps, contacts as bullet list at end
- **What not to do**: no disclaimers as substitute for guidance, no hallucinated phone numbers, don't begin with "I" or a heading

---

## Design system

### Palette (CSS variables)
```css
--bg:           #0c1520    /* deep navy */
--bg-card:      #111e2c    /* card background */
--bg-hover:     #162538    /* hover state */
--border:       rgba(255,255,255,0.07)
--border-hover: rgba(210,168,100,0.45)
--text:         #ede8df    /* warm off-white */
--text-muted:   rgba(237,232,223,0.5)
--text-dim:     rgba(237,232,223,0.22)
--amber:        #d2a864    /* primary accent */
```

### Typography
- Display/headings: **Cormorant Garamond** (Google Fonts)
- Body: **DM Sans** (Google Fonts)
- Both loaded from fonts.googleapis.com

### Design language
Dark nautical theme — calm, grounded, trustworthy. Not clinical. Not cheerful. The visual equivalent of a steady hand in a difficult moment.

---

## What needs doing next

### Immediate (before cutadrift.org goes live)
1. **Connect the domain** — point cutadrift.org DNS to Cloudflare Pages (add CNAME in Cloudflare DNS, add custom domain in Pages project settings)
2. **Update CORS** — once domain is live, confirm ALLOWED_ORIGIN = "https://cutadrift.org" is working. During development the worker only allows this origin — testing from pages.dev URL may hit CORS errors on the plan page
3. **Test the full flow end to end** — go through each path (Path A, B, C) with different intake combinations. Pay attention to the plan quality
4. **Privacy page** — /privacy/ is linked in the footer but doesn't exist yet. Copy the pattern from notredundant.com
5. **404 page** — create a simple Public/404.html

### CORS fix for testing (if plan page shows errors)
The worker currently only allows `https://cutadrift.org`. The plan page calls the worker directly — when testing from the pages.dev preview URL this will be blocked by CORS.

The current pages.dev URL is `https://5574738c.cutadrift.pages.dev` (note the full subdomain — not just cutadrift.pages.dev).

The worker only supports one allowed origin via env var. To support multiple origins during development, update the worker's CORS logic to check the request Origin header against a list:

```javascript
const ALLOWED_ORIGINS = [
  'https://cutadrift.org',
  'https://5574738c.cutadrift.pages.dev'
];

const origin = request.headers.get('Origin') || '';
const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
```

Replace the current `const allowedOrigin = env.ALLOWED_ORIGIN || 'https://cutadrift.org';` line with this. Redeploy the worker. Remove the pages.dev entry once cutadrift.org is live and confirmed working.

### Shortly after launch
6. **The carer tool** — intake design was sketched in session (sudden carer, what condition, relationship, living situation, legal steps like Enduring Power of Attorney, NASC assessment, Work and Income). Write the system prompt and intake page following the same pattern.
7. **Connect custom domain to worker** — set up a route so the Worker is accessible at api.cutadrift.org or cutadrift.org/api/ rather than the .workers.dev URL. The worker URL is currently hardcoded in `Public/plan/index.html` at line: `const WORKER_URL = 'https://cutadrift-engine.waynemstevens.workers.dev';` — update this once a custom route is set up.
8. **Google Search Console** — add cutadrift.org once DNS is live
9. **Press pitches** — same pattern as Not Redundant. The brand story is stronger now (umbrella platform, multiple tools, free public interest work)
10. **notredundant.com footer** — add a quiet "Also from Cut Adrift" link when ready to cross-link

### Future tools to build
- **Becoming a carer** (/becoming-a-carer/) — intake designed, system prompt not written
- **Debt crisis** — flagged as high-value, not designed yet
- Eventually fold notredundant.com into the Cut Adrift family

---

## Key decisions made this session

- **cutadrift.org not .com** — .com was registered (likely parked/film). .org is clean and actually better for public-benefit positioning (Wikipedia, Mozilla etc use .org)
- **One Worker, multiple tools** — `cutadrift-engine` handles all tools via `tool` field routing. Adding the carer tool is additive, not a rebuild.
- **Separate Anthropic API key** — `cutadrift-engine` key is separate from Not Redundant for clean cost tracking
- **Rate limit: 10/day not 3/day** — more generous than Not Redundant because bereavement users may legitimately need multiple sessions
- **Don't know = help to find out** — not a skip. Each dont_know answer generates "how to find out" steps inline in the plan
- **notredundant.com stays independent for now** — will fold under Cut Adrift umbrella later when the time is right

---

## Relationship to Not Redundant

| | Not Redundant | Cut Adrift |
|---|---|---|
| Domain | notredundant.com | cutadrift.org |
| Worker | firststeps-engine | cutadrift-engine |
| KV | separate namespace | separate namespace |
| API key | separate | separate |
| Model | claude-sonnet-4-5 | claude-sonnet-4-5 |
| Cloudflare account | same (waynemstevens@gmail.com) | same |
| Status | Live, indexed | Built today, deploying |

Not Redundant is linked from the Cut Adrift home page as the job loss tool. They are siblings, not parent/child — for now.

---

## To resume in a new session

Tell Claude:
> "I'm Wayne. I'm building Cut Adrift (cutadrift.org) — a free AI-powered crisis navigation platform. Today we built the bereavement tool (when-someone-dies). The Worker (cutadrift-engine) is live at cutadrift-engine.waynemstevens.workers.dev. Frontend deployed at 5574738c.cutadrift.pages.dev. I need to [test the flow / fix CORS / connect the domain / build the carer tool / etc.]"

All files are at `~/Desktop/Cut Adrift/`. The system prompt is embedded in `worker.js`. The handover notes are saved as a file.
