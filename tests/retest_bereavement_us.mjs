#!/usr/bin/env node
/**
 * Regression re-test: bereavement tool, country=us, AFTER the US hardening block.
 * Runs chronic + acute alternately, paced, retry-on-empty, and checks each run
 * against SPECIFIC known-bad values (the H27 large-sample lesson: a clean 3+3
 * misses the ~7% tail). Stops early and reports if the Worker starts 429-ing
 * (per-IP limit 10/day). Costs real tokens. Read-only.
 */
const WORKER_URL = 'https://cutadrift-engine.waynemstevens.workers.dev/';
const RUNS_PER_SCENARIO = 7;   // 14 total — limiter will likely cut us off sooner
const PACE_MS = 8000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callWorker(payload) {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://cutadrift.org' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return { ok: false, status: res.status };
  const raw = await res.text();
  let text = '';
  for (const block of raw.split('\n\n')) {
    const dataLine = block.split('\n').find((l) => l.startsWith('data:'));
    if (!dataLine) continue;
    let j; try { j = JSON.parse(dataLine.slice(5).trim()); } catch { continue; }
    if (j.type === 'content_block_delta' && j.delta?.type === 'text_delta') text += j.delta.text;
  }
  return { ok: true, status: res.status, text };
}

// ── specific FAIL checks (substring or regex). Each is a real regression. ──
const FAIL_CHECKS = [
  { name: 'stale estate-tax $13.61M', re: /13\.61\s*million/i },
  { name: 'stale estate-tax $13.99M', re: /13\.99\s*million/i },
  { name: '"solicitor" (UK/IE term)', re: /\bsolicitor/i },
  { name: 'The Dinner Party (defunct)', re: /dinner party/i },
  { name: 'fabricated Widows/Widowers org', re: /widows? and widowers? organization/i },
  { name: 'cross-country: Cruse', re: /\bcruse\b/i },
  { name: 'cross-country: HMRC', re: /\bhmrc\b/i },
  { name: 'cross-country: Tell Us Once', re: /tell us once/i },
  { name: 'cross-country: Citizens Information', re: /citizens information/i },
  { name: 'cross-country: Capital Acquisitions Tax', re: /capital acquisitions tax/i },
  { name: 'cross-country: Services Australia', re: /services australia/i },
  { name: 'cross-country: Centrelink', re: /centrelink/i },
  { name: 'cross-country: Service Canada', re: /service canada/i },
  { name: 'cross-country: Skylight/Public Trust/IRD', re: /\bskylight\b|public trust\b|\bIRD\b/i },
  { name: 'wrong SSA death amount (not $255)', re: /death (?:benefit|payment)[^.]{0,40}\$(?!255)\d/i },
];

// ── presence WARN checks (want at least one verified contact when relevant) ──
const SSA_NUM = /1-?800-?772-?1213/;

const SCENARIOS = {
  chronic: {
    tool: 'bereavement', country: 'us',
    timing: 'weeks_ago', relationship: 'parent', emotional_state: 'need_the_list',
    support_situation: 'some_support', funeral_status: 'done',
    children_affected: 'no', notifications_needed: 'most_told', dependants: 'no',
    employment: 'employed', deceased_employment: 'not_working',
    has_will: 'yes_executor', assets: 'yes', practical_opted_in: true,
    free_text: 'My mother died of cancer after a long illness. I am the executor named in her will but I live in another state and am back only briefly. I need to sort out probate, her bank accounts, her Social Security, her pension and any estate taxes. Who do I notify and how does probate actually work here?',
  },
  acute: {
    tool: 'bereavement', country: 'us',
    timing: 'recent_sudden', relationship: 'partner', emotional_state: 'holding_together',
    support_situation: 'mostly_alone', funeral_status: 'not_started',
    children_affected: 'their_children_at_home', notifications_needed: 'havent_started',
    dependants: 'yes_caring_for_someone',
    employment: 'employed', deceased_employment: 'employed',
    has_will: 'dont_know', assets: 'dont_know', practical_opted_in: true,
    free_text: 'My husband collapsed and died suddenly at home last night. The paramedics and police came. I do not know what happens next or who to call today. Will there be a medical examiner or an autopsy? How do I register the death and get death certificates? What do I do in the next 24 hours? Where can the children get grief support?',
  },
};

const results = [];
let blocked = 0;
outer:
for (let i = 0; i < RUNS_PER_SCENARIO; i++) {
  for (const [name, payload] of Object.entries(SCENARIOS)) {
    let r = await callWorker(payload);
    if (r.ok && r.text.length < 200) { await sleep(PACE_MS); r = await callWorker(payload); } // retry-on-empty
    if (!r.ok) {
      blocked++;
      console.log(`run ${i + 1} ${name}: HTTP ${r.status} (rate-limited) — stopping`);
      if (blocked >= 2) break outer;
      await sleep(PACE_MS); continue;
    }
    if (r.text.length < 200) { console.log(`run ${i + 1} ${name}: empty/short, skipped`); await sleep(PACE_MS); continue; }
    const fails = FAIL_CHECKS.filter((c) => c.re.test(r.text)).map((c) => c.name);
    const hasSSA = SSA_NUM.test(r.text);
    results.push({ run: i + 1, scenario: name, len: r.text.length, fails, hasSSA });
    const tag = fails.length ? `❌ ${fails.join('; ')}` : '✅ clean';
    console.log(`run ${i + 1} ${name}: ${r.text.length}c  SSA#:${hasSSA ? 'y' : 'n'}  ${tag}`);
    await sleep(PACE_MS);
  }
}

// ── summary ──
console.log(`\n${'='.repeat(70)}\nSUMMARY — ${results.length} real-content runs`);
const failedRuns = results.filter((r) => r.fails.length);
console.log(`Clean: ${results.length - failedRuns.length}/${results.length}`);
if (failedRuns.length) {
  console.log(`\nFAILURES:`);
  failedRuns.forEach((r) => console.log(`  run ${r.run} ${r.scenario}: ${r.fails.join('; ')}`));
} else {
  console.log(`No regressions detected on the specific FAIL checks.`);
}
const chronicNoSSA = results.filter((r) => r.scenario === 'chronic' && !r.hasSSA);
if (chronicNoSSA.length) console.log(`\n⚠ chronic runs missing SSA number: ${chronicNoSSA.length} (review — SSA expected for executor estate scenario)`);
