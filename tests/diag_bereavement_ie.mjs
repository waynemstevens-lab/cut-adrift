#!/usr/bin/env node
/**
 * Diagnostic: bereavement tool, country=IE (Ireland). Live POST to the Worker.
 * Reassembles the SSE stream and scans for hallucination surfaces:
 *  - phone numbers (review for fabrication / wrong-country format)
 *  - URLs / domains (flag non-gov, non-whitelisted)
 *  - wrong-country org leaks (NZ / AU / CA / UK / US bleeding into IE)
 *  - probate / estate / tax / social-welfare terminology (Irish-specific)
 * Costs real tokens. Read-only — changes nothing.
 */
const WORKER_URL = 'https://cutadrift-engine.waynemstevens.workers.dev/';

async function callWorker(payload) {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://cutadrift.org' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return { ok: false, status: res.status, text: await res.text() };
  const raw = await res.text();
  let text = '', stopReason = null;
  for (const block of raw.split('\n\n')) {
    const dataLine = block.split('\n').find((l) => l.startsWith('data:'));
    if (!dataLine) continue;
    let j; try { j = JSON.parse(dataLine.slice(5).trim()); } catch { continue; }
    if (j.type === 'content_block_delta' && j.delta?.type === 'text_delta') text += j.delta.text;
    if (j.type === 'message_delta' && j.delta?.stop_reason) stopReason = j.delta.stop_reason;
  }
  return { ok: true, status: res.status, text, stopReason };
}

// ── scan helpers ──────────────────────────────────────────────────────────
const PHONE_RE = /(?:\+?\d[\d ().-]{6,}\d)/g;
const URL_RE = /\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+(?:gov\.ie|ie|gov\.uk|nhs\.uk|org\.uk|co\.uk|uk|govt\.nz|nz|gov\.au|au|ca|gov|com|org|net)\b(?:\/[^\s)]*)?/gi;

// orgs / terms that must NOT appear in an Irish plan (other-country leaks)
const LEAK_ORGS = [
  // UK (now detailed in the prompt — high leak risk)
  'HMRC', 'Tell Us Once', 'Cruse', 'DWP', 'HMCTS', 'Bereavement Support Payment',
  'nil-rate band', 'Inheritance Tax', 'National Insurance', 'GOV.UK',
  // NZ
  'Skylight', 'Public Trust', 'IRD', 'Work and Income', 'WINZ', 'KiwiSaver',
  'What\'s Up', 'whatisup', 'tangihanga', 'Community Law', 'bdm.govt',
  // AU
  'Services Australia', 'Centrelink', 'Australian Taxation Office', 'Griefline',
  'Beyond Blue', 'superannuation',
  // CA
  'Service Canada', 'Canada Revenue', 'estate trustee', 'Steps to Justice',
  // US
  'GriefShare', 'Dinner Party', 'Social Security Administration',
];

// Irish-correct terms we WANT to see (presence is good)
const IE_GOOD_TERMS = [
  'grant of probate', 'letters of administration', 'executor', 'administrator',
  'Probate Office', 'Citizens Information', 'Revenue', 'Capital Acquisitions Tax',
  'CAT', 'Department of Social Protection', 'register the death', 'RIP.ie',
  'Samaritans', 'intestacy', 'coroner', 'Widow', 'PPS',
];

function scan(label, text) {
  console.log(`\n${'='.repeat(78)}\n  SCAN: ${label}\n${'='.repeat(78)}`);

  const phones = [...new Set((text.match(PHONE_RE) || []).map((s) => s.trim()))];
  console.log(`\n  PHONE-LIKE TOKENS (${phones.length}) — review each for fabrication:`);
  phones.forEach((p) => console.log(`    • ${p}`));

  const urls = [...new Set((text.match(URL_RE) || []).map((s) => s.trim()))];
  console.log(`\n  URLS / DOMAINS (${urls.length}) — flag any non-gov / non-whitelisted:`);
  urls.forEach((u) => console.log(`    • ${u}`));

  const leaks = LEAK_ORGS.filter((o) => text.toLowerCase().includes(o.toLowerCase()));
  console.log(`\n  WRONG-COUNTRY / NON-IE ORG LEAKS (${leaks.length}):`);
  leaks.forEach((o) => console.log(`    ⚠ ${o}`));

  const good = IE_GOOD_TERMS.filter((o) => text.toLowerCase().includes(o.toLowerCase()));
  console.log(`\n  IE-CORRECT TERMS PRESENT (${good.length}/${IE_GOOD_TERMS.length}):`);
  good.forEach((o) => console.log(`    ✓ ${o}`));
}

// ── scenarios ─────────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    name: 'IE CHRONIC — Path C, weeks on, executor handling estate from a distance',
    payload: {
      tool: 'bereavement', country: 'ie',
      timing: 'weeks_ago', relationship: 'parent', emotional_state: 'need_the_list',
      support_situation: 'some_support', funeral_status: 'done',
      children_affected: 'no', notifications_needed: 'most_told', dependants: 'no',
      employment: 'employed', deceased_employment: 'not_working',
      has_will: 'yes_executor', assets: 'yes', practical_opted_in: true,
      free_text: 'Mam died of cancer after a long illness. I am the executor named in her will but I live abroad and am back only briefly. I need to sort out probate, her bank accounts, her pension and any inheritance tax. Who do I notify and how does probate actually work here?',
    },
  },
  {
    name: 'IE ACUTE — Path B, sudden unexpected death, next-24-hours questions',
    payload: {
      tool: 'bereavement', country: 'ie',
      timing: 'recent_sudden', relationship: 'partner', emotional_state: 'holding_together',
      support_situation: 'mostly_alone', funeral_status: 'not_started',
      children_affected: 'their_children_at_home', notifications_needed: 'havent_started',
      dependants: 'yes_caring_for_someone',
      employment: 'employed', deceased_employment: 'employed',
      has_will: 'dont_know', assets: 'dont_know', practical_opted_in: true,
      free_text: 'My husband collapsed and died suddenly at home last night. The Gardai and ambulance came. I do not know what happens next or who I am supposed to call today. Will there be a coroner or an inquest? How do I register the death? What do I do in the next 24 hours? Where can the children get grief support?',
    },
  },
];

for (const s of SCENARIOS) {
  console.log(`\n\n${'#'.repeat(78)}\n# RUN: ${s.name}\n${'#'.repeat(78)}`);
  const r = await callWorker(s.payload);
  if (!r.ok) { console.log(`HTTP ${r.status}\n${r.text}`); continue; }
  console.log(`stop_reason: ${r.stopReason}  |  length: ${r.text.length} chars`);
  console.log(`\n----- FULL OUTPUT -----\n${r.text}\n----- END OUTPUT -----`);
  scan(s.name, r.text);
}
