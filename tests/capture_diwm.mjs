#!/usr/bin/env node
/**
 * Capture real DIWM panel outputs for the homepage gallery, using the internal
 * test-bypass header so it does not burn the public 10/IP/24h limit or the
 * 200/day global counter. Saves each output to tests/captures/<panel>.md.
 *
 * Usage: INTERNAL_TEST_KEY=<secret> node tests/capture_diwm.mjs
 * Read-only against the repo; makes real (bypassed) Claude calls.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WORKER_URL = 'https://cutadrift-engine.waynemstevens.workers.dev/';
const KEY = process.env.INTERNAL_TEST_KEY;
if (!KEY) { console.error('Set INTERNAL_TEST_KEY env var.'); process.exit(1); }
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

// Realistic personas — NZ (the tool's primary verified country).
const PANELS = [
  {
    file: 'incapacity-family-message',
    label: 'Incapacity — message to tell family & friends',
    payload: {
      tool: 'incapacity-family-message', country: 'nz',
      who: 'parent', what_happened: 'stroke',
      recipients: 'my brother and sister, and Mum\'s two closest friends',
      purpose: 'organise', tone: 'gentle',
      concern: 'I don\'t want to frighten her friends or make it sound hopeless',
      free_text: 'Mum had a stroke last week. She\'s out of immediate danger but she can\'t live on her own anymore and we need to work out care as a family.',
    },
  },
  {
    file: 'incapacity-gp-questions',
    label: 'Incapacity — questions for the medical team',
    payload: {
      tool: 'incapacity-gp-questions', country: 'nz',
      who: 'parent', what_happened: 'stroke',
      appt_with: 'discharge_planner',
      focus: 'whether she can safely go home or needs rest-home level care, and what support is funded',
      free_text: 'Mum is in hospital after a stroke and they\'re starting to talk about discharge. I don\'t know what I\'m supposed to ask before she comes out.',
    },
  },
  {
    file: 'diagnosis-employer-email',
    label: 'Diagnosis — email to your employer',
    payload: {
      tool: 'diagnosis-employer-email', country: 'nz',
      employment: 'employed', disclosure: 'condition_only',
      employer_name: 'Karen', job_title: 'Operations Coordinator',
      free_text: 'I\'ve just been diagnosed with something serious and will need time off for treatment and appointments. I\'m not ready to share the details.',
    },
  },
  {
    file: 'diagnosis-kiwisaver-call',
    label: 'Diagnosis — KiwiSaver / provider insurance call script',
    payload: {
      tool: 'diagnosis-kiwisaver-call', country: 'nz',
      provider: 'ANZ KiwiSaver',
      free_text: 'I\'ve just been diagnosed with a serious illness and want to find out if I have any insurance cover through my KiwiSaver that I didn\'t know about.',
    },
  },
  {
    file: 'diagnosis-insurance-call',
    label: 'Diagnosis — insurer claim call script',
    payload: {
      tool: 'diagnosis-insurance-call', country: 'nz',
      insurer: 'Partners Life', policy_type: 'income_protection', policy_number: '',
      free_text: 'I think I have income protection and possibly trauma cover. I\'ve been diagnosed and want to know if I can claim and how.',
    },
  },
  {
    file: 'diagnosis-family-message',
    label: 'Diagnosis — message to tell family & friends',
    payload: {
      tool: 'diagnosis-family-message', country: 'nz',
      employment: 'employed',
      recipients: 'my parents and my two adult children',
      tone: 'gentle', concern: 'I don\'t want them to panic or start treating me differently',
      free_text: 'I\'ve been diagnosed with breast cancer. I start treatment in a couple of weeks and the outlook is reasonable, but I need to tell the family.',
    },
  },
  {
    file: 'diagnosis-gp-questions',
    label: 'Diagnosis — questions for the appointment',
    payload: {
      tool: 'diagnosis-gp-questions', country: 'nz',
      employment: 'employed', appt_with: 'specialist',
      focus: 'treatment options, side effects, and how long I\'ll need off work',
      free_text: 'I was just diagnosed and I\'m seeing the oncologist next week. My head is spinning and I know I\'ll forget to ask things.',
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
