#!/usr/bin/env node
/**
 * Diagnosis tool — country=nz cross-country leak audit.
 * The diagnosis prompt was never country-hardened: it inlines all six countries'
 * benefit names and statutes into single sentences, so NZ plans can pull in ADA /
 * FMLA / Equality Act / NHS / SSDI / PIP / Centrelink etc. This harness fires NZ
 * diagnosis scenarios (employed / self-employed / not-working) and flags any
 * OTHER country's named entity appearing in an NZ plan, plus reports which of the
 * expected NZ anchors showed up.
 *
 * Uses the X-Internal-Test bypass (handover 31) so it never burns the public
 * rate limit. Large sample on purpose (H27 lesson: a clean 3+3 misses the ~7%
 * tail). Costs real Sonnet tokens. Read-only.
 *
 * Usage: INTERNAL_TEST_KEY=<secret> node tests/diag_diagnosis_nz.mjs [runsPerScenario]
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
const WORKER_URL = 'https://cutadrift-engine.waynemstevens.workers.dev/';
const RUNS_PER_SCENARIO = parseInt(process.argv[2], 10) || 5;
const PACE_MS = 800;
const FAIL_DIR = 'tests/_nz_diag_fails';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Clear stale fail captures so each pass starts clean (same filenames are reused).
try { rmSync(FAIL_DIR, { recursive: true, force: true }); } catch (_) {}
try { mkdirSync(FAIL_DIR, { recursive: true }); } catch (_) {}

const INTERNAL_TEST_KEY = process.env.INTERNAL_TEST_KEY
  || '498ba6d2a2777d0b23d71705b3e4fab67e69ec2a16ab8f322b065227bde46c04';

const REQ_TIMEOUT_MS = 90000;  // abort a stalled stream rather than hang forever
async function callWorkerOnce(payload) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), REQ_TIMEOUT_MS);
  let res, raw;
  try {
    res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://cutadrift.org',
        'X-Internal-Test': INTERNAL_TEST_KEY,
      },
      body: JSON.stringify(payload),
      signal: ac.signal,
    });
    if (!res.ok) { clearTimeout(timer); return { ok: false, status: res.status }; }
    raw = await res.text();
  } finally {
    clearTimeout(timer);
  }
  let text = '';
  for (const block of raw.split('\n\n')) {
    const dataLine = block.split('\n').find((l) => l.startsWith('data:'));
    if (!dataLine) continue;
    let j; try { j = JSON.parse(dataLine.slice(5).trim()); } catch { continue; }
    if (j.type === 'content_block_delta' && j.delta?.type === 'text_delta') text += j.delta.text;
  }
  return { ok: true, status: res.status, text };
}

// Network resets (ECONNRESET / terminated) happen on long Sonnet streams — never
// let one crash the whole pass. Catch and retry once with a short backoff.
async function callWorker(payload) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await callWorkerOnce(payload);
    } catch (e) {
      if (attempt === 0) { await sleep(2000); continue; }
      return { ok: false, status: 0, error: String(e?.message || e) };
    }
  }
}

// ── FAIL: a non-NZ country's named entity appearing in an NZ plan. ──
const FAIL_CHECKS = [
  // United States
  { name: 'US: ADA',                       re: /\bADA\b|americans with disabilities act/i },
  { name: 'US: FMLA',                      re: /\bFMLA\b|family and medical leave act/i },
  { name: 'US: SSDI/SSI/Social Security',  re: /\bSSDI\b|\bSSI\b|social security disability/i },
  { name: 'US: COBRA',                     re: /\bCOBRA\b/i },
  { name: 'US: Medicaid',                  re: /medicaid/i },
  // United Kingdom
  { name: 'UK: Equality Act 2010',         re: /equality act/i },
  { name: 'UK: NHS',                        re: /\bNHS\b/i },
  // Case-SENSITIVE: the UK scheme is "Statutory Sick Pay" / "SSP". Generic lowercase
  // "statutory sick pay" (e.g. "there is no statutory sick pay in NZ") is correct
  // descriptive guidance, not a leak — don't flag it.
  { name: 'UK: Statutory Sick Pay/SSP',    re: /Statutory Sick Pay|\bSSP\b/ },
  { name: 'UK: ESA',                        re: /\bESA\b|employment and support allowance/i },
  { name: 'UK: PIP',                        re: /\bPIP\b|personal independence payment/i },
  { name: 'UK: Universal Credit',          re: /universal credit/i },
  // Case-SENSITIVE + exclude "Access to Work and Income": the UK scheme is "Access to
  // Work"; "access to Work and Income" (lowercase a) is the NZ agency, correctly used.
  { name: 'UK: Access to Work',            re: /Access to Work\b(?! and Income)/ },
  { name: 'UK: Macmillan',                 re: /macmillan/i },
  { name: 'UK: Cancer Research UK',        re: /cancer research uk/i },
  // NB: "Citizens Advice Bureau" is a legitimate NZ org — only flag UK "Citizens Advice" NOT followed by Bureau.
  { name: 'UK: Citizens Advice (not CAB)', re: /citizens advice(?!\s+bureau)/i },
  // Ireland
  // Case-SENSITIVE + exclude insurance phrasing: the IE scheme is "Illness Benefit";
  // "terminal/critical/serious illness benefit" are generic insurance terms, not a leak.
  { name: 'IE: Illness Benefit',           re: /(?<!terminal )(?<!critical )(?<!serious )Illness Benefit\b/ },
  // NB: "Disability Allowance" is ALSO a real NZ Work and Income benefit — NOT a leak. (Dropped.)
  { name: 'IE: Employment Equality Act',   re: /employment equality act/i },
  { name: 'IE: Citizens Information',      re: /citizens information/i },
  { name: 'IE/AU: HSE',                     re: /\bHSE\b/i },
  // Australia
  { name: 'AU: Centrelink',                re: /centrelink/i },
  { name: 'AU: Services Australia',        re: /services australia/i },
  { name: 'AU: Disability Support Pension', re: /disability support pension/i },
  // NB: dropped "jobseeker payment" — NZ's own benefit is colloquially "the Jobseeker
  // payment" (formally Jobseeker Support), so it collides. AU tells = Centrelink / DSP.
  { name: 'AU: Fair Work Act',             re: /fair work act/i },
  { name: 'AU: Disability Discrimination Act', re: /disability discrimination act/i },
  { name: 'AU: Cancer Council',            re: /cancer council/i },
  { name: 'AU: Australian Charter',        re: /australian charter/i },
  { name: 'AU/US: Medicare',               re: /\bmedicare\b/i },
  // Canada
  { name: 'CA: CPP/Canada Pension Plan',   re: /\bCPP\b|canada pension plan/i },
  { name: 'CA: EI/Employment Insurance',   re: /employment insurance\b|\bEI sickness\b/i },
  { name: 'CA: Service Canada',            re: /service canada/i },
  { name: 'CA: Canadian Human Rights Act', re: /canadian human rights act/i },
];

// ── PRESENCE: expected NZ anchors (informational, not pass/fail). ──
const NZ_ANCHORS = [
  { name: 'ACC',                       re: /\bACC\b/ },
  { name: 'Work and Income/WINZ',     re: /work and income|\bWINZ\b/i },
  { name: 'MSD',                       re: /\bMSD\b|ministry of social development/i },
  { name: 'Te Whatu Ora',             re: /te whatu ora/i },
  { name: 'NASC',                      re: /\bNASC\b|needs assessment and service coordination/i },
  { name: 'Supported Living Payment', re: /supported living payment/i },
  { name: 'Jobseeker Support',        re: /jobseeker support/i },
  { name: 'NZ Human Rights Act',      re: /human rights act/i },
  { name: 'KiwiSaver',                 re: /kiwisaver/i },
  { name: 'Holidays Act',             re: /holidays act/i },
  { name: 'HDC Code/Consumers Rights', re: /code of health and disability|health and disability commissioner/i },
  { name: 'Cancer Society',           re: /cancer society/i },
];

const COMMON = { tool: 'diagnosis', country: 'nz', who: 'me' };
const SCENARIOS = {
  employed_cancer: {
    ...COMMON, employment: 'employed', work_impact: 'yes',
    free_text: 'I was just diagnosed with breast cancer. I work full time for an employer and I am worried about my job, my sick leave, and money while I have treatment. I do not know what I am entitled to or who to tell at work.',
  },
  self_employed_ms: {
    ...COMMON, employment: 'self_employed', work_impact: 'unsure',
    free_text: 'I run my own contracting business and was just told I have multiple sclerosis. I have no idea what support exists for self-employed people who get sick, or what happens to my income if I cannot work.',
  },
  not_working_chronic: {
    ...COMMON, employment: 'not_working', work_impact: 'no',
    free_text: 'I am not working at the moment and I have just been diagnosed with a serious chronic illness. I want to know what benefits or financial help I might qualify for and what my rights are.',
  },
  employed_neuro: {
    ...COMMON, employment: 'employed', work_impact: 'unsure',
    free_text: 'Just had a diagnosis of early-onset Parkinson\'s. I am employed. Not sure yet how it affects work. What protections do I have at work and what disability or income support could I look into?',
  },
};

const results = [];
let blocked = 0;
outer:
for (let i = 0; i < RUNS_PER_SCENARIO; i++) {
  for (const [name, payload] of Object.entries(SCENARIOS)) {
    let r = await callWorker(payload);
    if (r.ok && r.text.length < 300) { await sleep(PACE_MS); r = await callWorker(payload); } // retry-on-empty
    if (!r.ok) {
      if (r.status === 429) {
        blocked++;
        console.log(`run ${i + 1} ${name}: HTTP 429 (rate-limited) — stopping after ${blocked}`);
        if (blocked >= 2) break outer;
      } else {
        console.log(`run ${i + 1} ${name}: network error (${r.status}${r.error ? ' ' + r.error : ''}) — skipped`);
      }
      await sleep(PACE_MS); continue;
    }
    if (r.text.length < 300) { console.log(`run ${i + 1} ${name}: empty/short, skipped`); await sleep(PACE_MS); continue; }
    const fails = FAIL_CHECKS.filter((c) => c.re.test(r.text)).map((c) => c.name);
    const anchors = NZ_ANCHORS.filter((c) => c.re.test(r.text)).map((c) => c.name);
    results.push({ run: i + 1, scenario: name, len: r.text.length, fails, anchors });
    if (fails.length) {
      try { writeFileSync(`${FAIL_DIR}/r${i + 1}-${name}.md`, r.text); } catch (_) {}
    }
    const tag = fails.length ? `❌ ${fails.join('; ')}` : '✅ clean';
    console.log(`run ${i + 1} ${name}: ${r.text.length}c  anchors:${anchors.length}  ${tag}`);
    await sleep(PACE_MS);
  }
}

// ── summary ──
console.log(`\n${'='.repeat(72)}\nSUMMARY — ${results.length} real-content runs (country=nz)`);
const failedRuns = results.filter((r) => r.fails.length);
console.log(`Clean (no cross-country leak): ${results.length - failedRuns.length}/${results.length}`);
if (failedRuns.length) {
  console.log(`\nFAILURES (cross-country entity in an NZ plan):`);
  failedRuns.forEach((r) => console.log(`  run ${r.run} ${r.scenario}: ${r.fails.join('; ')}`));
  // leak frequency by entity
  const freq = {};
  failedRuns.forEach((r) => r.fails.forEach((f) => { freq[f] = (freq[f] || 0) + 1; }));
  console.log(`\nLeak frequency by entity:`);
  Object.entries(freq).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${v}× ${k}`));
} else {
  console.log(`No cross-country leaks detected.`);
}
// anchor coverage
const anchorFreq = {};
results.forEach((r) => r.anchors.forEach((a) => { anchorFreq[a] = (anchorFreq[a] || 0) + 1; }));
console.log(`\nNZ anchor coverage (of ${results.length} runs):`);
NZ_ANCHORS.forEach((a) => console.log(`  ${(anchorFreq[a.name] || 0).toString().padStart(2)}× ${a.name}`));
