#!/usr/bin/env node
/**
 * Diagnostic: bereavement tool, country=AU. Live POST to the deployed Worker.
 * Reassembles the SSE stream and scans for hallucination surfaces:
 *  - phone numbers (review for fabrication / wrong-country format)
 *  - URLs / domains (flag non-gov, non-whitelisted)
 *  - wrong-country org leaks (NZ / UK / IE / US bleeding into AU)
 *  - estate / probate terminology (is AU vocabulary correct?)
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
const URL_RE = /\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+(?:gov\.au|com\.au|org\.au|net\.au|asn\.au|edu\.au|au|govt\.nz|co\.nz|org\.nz|nz|gov\.uk|org\.uk|co\.uk|uk|ie|gov|com|org|net|ca)\b(?:\/[^\s)]*)?/gi;

// orgs that must NOT appear in an AU plan (other-country leaks)
const LEAK_ORGS = [
  // NZ
  'Skylight', 'Public Trust', 'IRD', 'Inland Revenue', 'Work and Income', 'WINZ',
  'Community Law', 'Births, Deaths and Marriages', 'bdm.govt', 'Grief Centre',
  'Lifeline 0800', 'KiwiSaver', 'NZ Super', 'tangihanga', 'Holidays Act',
  // UK / IE
  'Tell Us Once', 'Cruse', 'GOV.UK', 'HMRC', 'DWP', 'Citizens Information',
  // US
  'GriefShare', 'Dinner Party', 'Eldercare', 'Social Security Administration',
  // Canada (just-added block)
  'Service Canada', 'Canada Revenue', 'Bereaved Families of Ontario', 'Steps to Justice',
  'estate trustee', 'Certificate of Appointment', 'Estate Administration Tax',
];

// AU-correct estate terms we WANT to see (presence is good)
const AU_GOOD_TERMS = [
  'grant of probate', 'letters of administration', 'executor', 'administrator',
  'deceased estate', 'Supreme Court', 'Centrelink', 'superannuation', 'super fund',
  'Services Australia', 'Australian Taxation Office', 'ATO',
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
  console.log(`\n  WRONG-COUNTRY / NON-AU ORG LEAKS (${leaks.length}):`);
  leaks.forEach((o) => console.log(`    ⚠ ${o}`));

  const good = AU_GOOD_TERMS.filter((o) => text.toLowerCase().includes(o.toLowerCase()));
  console.log(`\n  AU-CORRECT TERMS PRESENT (${good.length}/${AU_GOOD_TERMS.length}):`);
  good.forEach((o) => console.log(`    ✓ ${o}`));
}

// ── scenarios ─────────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    name: 'AU CHRONIC — Path C, weeks on, executor handling estate from another state',
    payload: {
      tool: 'bereavement', country: 'au',
      timing: 'weeks_ago', relationship: 'parent', emotional_state: 'need_the_list',
      support_situation: 'some_support', funeral_status: 'done',
      children_affected: 'no', notifications_needed: 'most_told', dependants: 'no',
      employment: 'employed', deceased_employment: 'not_working',
      has_will: 'yes_executor', assets: 'yes', practical_opted_in: true,
      free_text: 'Dad died of cancer after a long illness. I am his executor but I live interstate. I need to sort out probate, his super, the bank accounts and his tax. Who do I notify and how does probate actually work here?',
    },
  },
  {
    name: 'AU ACUTE — Path B, sudden unexpected death, next-24-hours questions',
    payload: {
      tool: 'bereavement', country: 'au',
      timing: 'recent_sudden', relationship: 'partner', emotional_state: 'holding_together',
      support_situation: 'mostly_alone', funeral_status: 'not_started',
      children_affected: 'their_children_at_home', notifications_needed: 'havent_started',
      dependants: 'yes_caring_for_someone',
      employment: 'employed', deceased_employment: 'employed',
      has_will: 'dont_know', assets: 'dont_know', practical_opted_in: true,
      free_text: 'My husband collapsed and died suddenly at home last night. The police and ambulance came. I do not know what happens next or who I am supposed to call today. Is there a coroner? What do I do in the next 24 hours?',
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
