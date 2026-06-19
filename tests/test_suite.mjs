#!/usr/bin/env node
/**
 * Cut Adrift — E2E scenario test harness
 * Tests the cutadrift-engine worker against real Anthropic streaming responses.
 *
 * USAGE: node tests/test_suite.mjs
 *
 * WHY THIS EXISTS:
 * The worker streams Anthropic Messages API SSE events, not plain JSON.
 * A naive fetch().json() test fails silently against this endpoint.
 * This harness parses the actual SSE stream and checks:
 *   - stop_reason === "end_turn" (response wasn't cut off)
 *   - expected section headings are present (DIWM panels anchor to these)
 *   - the "first action" closing line is present (full plans only)
 *   - response text isn't empty / suspiciously short
 *
 * ADDING SCENARIOS:
 * Capture a real payload via Chrome DevTools (Network tab → right-click
 * the request → Copy as cURL), pull the --data-raw JSON out, and add it
 * to SCENARIOS below. Scenarios marked needsPayload: true are skipped
 * until a real payload is captured — never guess field names, always
 * capture from a live browser session. This matters because each call
 * hits the real Anthropic API and costs real tokens — don't run this
 * suite on a tight loop, and don't add scenarios you haven't verified
 * the field names for.
 */

const WORKER_URL = 'https://cutadrift-engine.waynemstevens.workers.dev/';

// ---- SSE parsing ---------------------------------------------------------

async function callWorker(payload) {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return { ok: false, status: res.status, text: '', stopReason: null };
  }

  const raw = await res.text();
  let text = '';
  let stopReason = null;

  for (const block of raw.split('\n\n')) {
    const dataLine = block.split('\n').find((l) => l.startsWith('data:'));
    if (!dataLine) continue;
    let json;
    try {
      json = JSON.parse(dataLine.slice(5).trim());
    } catch {
      continue;
    }
    if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
      text += json.delta.text;
    }
    if (json.type === 'message_delta' && json.delta?.stop_reason) {
      stopReason = json.delta.stop_reason;
    }
  }

  return { ok: true, status: res.status, text, stopReason, raw };
}

// ---- Assertions -----------------------------------------------------------

function checkScenario(result, scenario) {
  const checks = [];

  checks.push({
    name: 'stop_reason is end_turn',
    pass: result.stopReason === 'end_turn',
    detail: `got: ${result.stopReason}`,
  });

  checks.push({
    name: 'response text is non-trivial',
    pass: result.text.length > 100,
    detail: `length: ${result.text.length}`,
  });

  for (const heading of scenario.expectHeadings || []) {
    checks.push({
      name: `heading present: "${heading}"`,
      pass: result.text.includes(heading),
    });
  }

  if (scenario.expectClosingLinePhrase) {
    checks.push({
      name: 'closing line present',
      pass: result.text.includes(scenario.expectClosingLinePhrase),
    });
  }

  for (const phrase of scenario.expectNotContains || []) {
    checks.push({
      name: `does NOT contain: "${phrase}"`,
      pass: !result.text.includes(phrase),
    });
  }

  return checks;
}

// ---- Scenarios --------------------------------------------------------------
// Verified payloads (captured live via DevTools, 19 June 2026 follow-up to
// Handover 20). Each one was confirmed working in the browser before being
// added here.

const SCENARIOS = [
  {
    name: 'Bereavement — Path B, employed, full plan',
    payload: {
      country: 'nz',
      timing: 'recent_expected',
      relationship: 'parent',
      emotional_state: 'need_the_list',
      support_situation: 'some_support',
      children_affected: 'no',
      notifications_needed: 'think_all_told',
      employment: 'employed',
      dependants: 'yes_other',
      deceased_employment: 'employed',
      practical_opted_in: 'no',
      tool: 'bereavement',
    },
    expectHeadings: [
      '## Right now',
      '## The people around you',
      '## Your work and leave',
      '## Notifying their employer',
    ],
    expectClosingLinePhrase: 'The single most useful thing you can do today',
  },
  {
    name: 'Bereavement — employer-notify DIWM panel',
    payload: {
      tool: 'bereavement-employer-notify',
      country: 'nz',
      employment: 'employed',
      relationship: 'parent',
      employer_name: 'Rolls Royce',
      job_title: 'Foreman',
      relationship_to_deceased: 'son',
      hr_contact: '',
    },
    expectHeadings: [],
    expectNotContains: ['## Right now'], // sanity check: not a full plan
  },

  // --- NEEDS PAYLOAD: capture via DevTools before enabling ---
  // Method: open the tool in browser → DevTools → Network tab → walk the
  // intake to the relevant screen → right-click the worker POST request →
  // Copy → Copy as cURL → pull the --data-raw JSON out → paste below and
  // remove needsPayload: true.

  {
    name: 'Bereavement — Path C (weeks_ago), employed',
    needsPayload: true,
    expectHeadings: ['## Notifying their employer'], // Section 2b per handover 20
  },
  {
    name: 'Bereavement — family-message DIWM panel',
    needsPayload: true,
    expectNotContains: ['## Right now'],
  },
  {
    name: 'Diagnosis — full plan, employed + work_impact yes',
    needsPayload: true,
    expectHeadings: ['## The people in your life', '## Your insurance'],
  },
  {
    name: 'Diagnosis — family-message DIWM panel',
    needsPayload: true,
    expectNotContains: ['## Right now'],
  },
  {
    name: 'Diagnosis — insurance-call DIWM panel',
    needsPayload: true,
    expectNotContains: ['## Right now'],
  },
  {
    name: 'Incapacity/Carer — full plan',
    needsPayload: true,
    expectHeadings: [],
  },
];

// ---- Runner -----------------------------------------------------------------

async function main() {
  console.log(`Cut Adrift E2E test suite — ${new Date().toISOString()}\n`);

  let totalPass = 0;
  let totalFail = 0;
  let skipped = 0;

  for (const scenario of SCENARIOS) {
    if (scenario.needsPayload) {
      console.log(`SKIP  ${scenario.name}  (no captured payload yet)`);
      skipped++;
      continue;
    }

    process.stdout.write(`RUN   ${scenario.name} ... `);
    let result;
    try {
      result = await callWorker(scenario.payload);
    } catch (err) {
      console.log(`ERROR (${err.message})`);
      totalFail++;
      continue;
    }

    if (!result.ok) {
      console.log(`HTTP ${result.status}`);
      totalFail++;
      continue;
    }

    const checks = checkScenario(result, scenario);
    const failed = checks.filter((c) => !c.pass);

    if (failed.length === 0) {
      console.log('PASS');
      totalPass++;
    } else {
      console.log('FAIL');
      for (const f of failed) {
        console.log(`      \u2717 ${f.name}${f.detail ? ` (${f.detail})` : ''}`);
      }
      totalFail++;
    }
  }

  console.log(
    `\n${totalPass} passed, ${totalFail} failed, ${skipped} skipped (need payload capture)`
  );
  process.exitCode = totalFail > 0 ? 1 : 0;
}

main();
