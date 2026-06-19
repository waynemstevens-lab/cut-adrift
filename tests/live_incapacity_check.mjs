#!/usr/bin/env node
/**
 * Live check: confirm the deployed worker's incapacity tool emits the two
 * mandated DIWM-anchor headings across different paths. Costs real tokens.
 */
const WORKER_URL = 'https://cutadrift-engine.waynemstevens.workers.dev/';

async function callWorker(payload) {
  const res = await fetch(WORKER_URL, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return { ok: false, status: res.status };
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

const SCENARIOS = [
  {
    name: 'Incapacity — Path A (EPA emergency: capacity unclear, no EPA)',
    payload: { tool: 'incapacity', country: 'nz', what_happened: 'stroke', who: 'parent',
      location: 'in_hospital', capacity: 'possibly_unclear', epa_in_place: 'no', assets: 'yes',
      carer_situation: ['want_but_limits'], free_text: 'I live three hours away and work full time.' },
  },
  {
    name: 'Incapacity — non-A path (capacity clear, EPA in place, at home)',
    payload: { tool: 'incapacity', country: 'nz', what_happened: 'dementia', who: 'partner',
      location: 'at_home_struggling', capacity: 'yes_clearly', epa_in_place: 'yes', assets: 'no',
      carer_situation: ['able_willing_main'], free_text: 'She is getting confused and I am exhausted.' },
  },
];

let fail = 0;
for (const s of SCENARIOS) {
  process.stdout.write(`RUN  ${s.name} ... `);
  const r = await callWorker(s.payload);
  if (!r.ok) { console.log(`HTTP ${r.status}`); fail++; continue; }
  const checks = {
    'stop_reason end_turn': r.stopReason === 'end_turn',
    '## The people around you': r.text.includes('## The people around you'),
    '## Questions for the medical team': r.text.includes('## Questions for the medical team'),
    'closing line': r.text.includes('The single most useful thing you can do today'),
  };
  const failed = Object.entries(checks).filter(([, v]) => !v);
  if (!failed.length) console.log('PASS');
  else { console.log('FAIL'); failed.forEach(([k]) => console.log(`      ✗ ${k}`)); fail++; }
}
console.log(fail ? `\n${fail} scenario(s) failed` : '\nAll live incapacity checks passed');
process.exitCode = fail ? 1 : 0;
