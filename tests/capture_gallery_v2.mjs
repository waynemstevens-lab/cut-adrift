#!/usr/bin/env node
/**
 * Capture fresh DIWM panel outputs for the homepage proof-gallery remap
 * (one card per situation: bereavement / diagnosis / incapacity / job-loss).
 *
 * Generates the panels NOT already in tests/captures/:
 *   - bereavement: bank-letter, employer-notify, family-message (pick one)
 *   - incapacity:  family-message × 3 detailed scenarios, plus a fresh
 *                  gp-questions run, for comparison.
 * Diagnosis reuses the three existing captures (no re-run needed).
 *
 * Uses the internal test-bypass header so it does not burn the public
 * 10/IP/24h limit or the 200/day global counter. Saves to tests/captures/.
 *
 * Usage: INTERNAL_TEST_KEY=<secret> node tests/capture_gallery_v2.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WORKER_URL = 'https://cutadrift-engine.waynemstevens.workers.dev/';
const KEY = process.env.INTERNAL_TEST_KEY
  || '498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04';
const OUT_DIR = fileURLToPath(new URL('./captures/', import.meta.url));
fs.mkdirSync(OUT_DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(payload) {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://cutadrift.org',
      'X-Internal-Test': KEY,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return { ok: false, status: res.status, text: await res.text() };
  const raw = await res.text();
  let text = '';
  for (const block of raw.split('\n\n')) {
    const dl = block.split('\n').find((l) => l.startsWith('data:'));
    if (!dl) continue;
    let j; try { j = JSON.parse(dl.slice(5).trim()); } catch { continue; }
    if (j.type === 'content_block_delta' && j.delta?.type === 'text_delta') text += j.delta.text;
  }
  return { ok: true, status: res.status, text };
}

// Realistic NZ personas (the tool's primary verified country).
const PANELS = [
  // ── Bereavement candidates (pick the most compelling) ──────────────────────
  {
    file: 'bereavement-bank-letter',
    label: 'Bereavement — bank / institution notification letter',
    payload: {
      tool: 'bereavement-bank-letter', country: 'nz',
      institution_name: 'ANZ Bank New Zealand',
      deceased_name: 'Robert James Whitford',
      relationship_to_deceased: 'his son, and the executor named in his will',
      reference: '',
    },
  },
  {
    file: 'bereavement-employer-notify',
    label: "Bereavement — notify the late person's employer",
    payload: {
      tool: 'bereavement-employer-notify', country: 'nz',
      employer_name: 'Fletcher Construction',
      job_title: 'site foreman',
      relationship_to_deceased: 'his wife',
      hr_contact: '',
    },
  },
  {
    file: 'bereavement-family-message',
    label: 'Bereavement — message to tell family & friends',
    payload: {
      tool: 'bereavement-family-message', country: 'nz',
      relationship: 'parent',
      timing: 'week_ago',
      recipients: "Dad's brothers and sisters and a few of his old workmates, some of them overseas",
      tone: 'gentle',
      concern: 'a couple of them are elderly and I don’t want them to hear it bluntly, and his brother in Perth will want to know about coming over',
    },
  },

  // ── Incapacity: family-message × 3 detailed scenarios ──────────────────────
  {
    file: 'incapacity-family-message-A-dementia',
    label: 'Incapacity (A) — dementia progressing, asking siblings for help',
    payload: {
      tool: 'incapacity-family-message', country: 'nz',
      who: 'parent', what_happened: 'dementia',
      recipients: 'my two brothers who both live in Australia, and Dad’s sister Margaret here in Hamilton',
      purpose: 'ask_help', tone: 'gentle',
      concern: 'my brothers already feel guilty they’re not here, and one of them tends to panic and want to fly over for everything',
      free_text: 'Dad’s dementia has got a lot worse over the last few months. He left the element on twice and got lost walking home from the dairy last week. I’ve been quietly managing it on my own but I can’t keep doing this alone — I need my brothers to actually share some of it, even from over there.',
    },
  },
  {
    file: 'incapacity-family-message-B-fall',
    label: 'Incapacity (B) — partner’s fall, organising the family to plan',
    payload: {
      tool: 'incapacity-family-message', country: 'nz',
      who: 'partner', what_happened: 'fall_accident',
      recipients: 'our three adult kids and my husband’s two sisters',
      purpose: 'organise', tone: 'matter_of_fact',
      concern: 'one of his sisters tends to take over and override what he actually wants, and I want him kept at the centre of it',
      free_text: 'My husband had a bad fall and broke his hip. He’s through the surgery but he’s going to need a lot of help when he comes home and probably can’t go back to managing the way he did. I want us all to sit down properly and plan together rather than everyone deciding things separately.',
    },
  },
  {
    file: 'incapacity-family-message-C-decline',
    label: 'Incapacity (C) — mother moving in, informing the wider family',
    payload: {
      tool: 'incapacity-family-message', country: 'nz',
      who: 'parent', what_happened: 'other_health_event',
      recipients: 'my sister in London, Mum’s younger brother, and a couple of her close friends from church',
      purpose: 'inform', tone: 'gentle',
      concern: 'I don’t want it to sound like I’m asking anyone for anything — I just want them to know what’s happening so no one is blindsided',
      free_text: 'Mum’s heart and her breathing have been going downhill for a while, and after this last hospital stay the doctors have said she can’t live on her own any more. She’s going to move in with us next month. It’s the right thing but it’s a big change and I want the family to hear it from me.',
    },
  },

  // ── Incapacity: a fresh, detailed gp-questions run (second panel) ───────────
  {
    file: 'incapacity-gp-questions-v2',
    label: 'Incapacity — questions for the medical team (fresh detailed run)',
    payload: {
      tool: 'incapacity-gp-questions', country: 'nz',
      who: 'parent', what_happened: 'dementia',
      appt_with: 'gp',
      focus: 'whether it is still safe for Dad to live alone, whether he can still drive, and what support and assessments we can get funded',
      free_text: 'Dad has dementia that’s clearly getting worse — he’s leaving the stove on and getting lost. I’ve booked a longer GP appointment and I want to walk out of it knowing what to actually do next, not just reassurance.',
    },
  },
];

const summary = [];
for (const p of PANELS) {
  process.stdout.write(`\n=== ${p.label} (${p.payload.tool}) ===\n`);
  let r = await call(p.payload);
  if (r.ok && r.text.length < 80) { await sleep(3000); r = await call(p.payload); } // retry-on-empty
  if (!r.ok) { console.log(`  HTTP ${r.status}: ${r.text?.slice(0, 160)}`); summary.push(`${p.file}: HTTP ${r.status}`); await sleep(2000); continue; }
  const outPath = path.join(OUT_DIR, `${p.file}.md`);
  fs.writeFileSync(outPath, `# ${p.label}\n\nPanel: \`${p.payload.tool}\`  ·  Country: NZ\n\n---\n\n${r.text}\n`);
  console.log(`  ${r.text.length} chars → tests/captures/${p.file}.md`);
  console.log('  ----- OUTPUT -----');
  console.log(r.text.split('\n').map((l) => '  ' + l).join('\n'));
  console.log('  ----- END -----');
  summary.push(`${p.file}: ${r.text.length}c OK`);
  await sleep(2000);
}

console.log(`\n${'='.repeat(60)}\nCAPTURE SUMMARY`);
summary.forEach((s) => console.log('  ' + s));
