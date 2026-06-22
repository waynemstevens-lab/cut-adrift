#!/usr/bin/env node
/**
 * Diagnosis tool — country=us cross-country leak audit.
 * Clone of diag_diagnosis_ca.mjs (handover 32 method) with the United States as the
 * home country. The diagnosis prompt inlines all six countries' benefit names and
 * statutes into single sentences, so a US plan can pull in EI / CPP / Service Canada /
 * Centrelink / DSP / Equality Act 2010 / NHS / PIP / Work and Income / KiwiSaver /
 * Illness Benefit etc. This harness fires US diagnosis scenarios (employed /
 * self-employed / not-working) and flags any NON-US country's named entity appearing
 * in a US plan, plus reports which expected US anchors showed up.
 *
 * Uses the X-Internal-Test bypass (handover 31) so it never burns the public rate
 * limit. Large sample on purpose (H27/H32 lesson: a small 3+3 misses the tail) —
 * run 10–14+. Costs real Sonnet tokens. Read-only.
 *
 * US-specific false-positive notes (the US's biggest risk is Canada-bleed by proximity;
 * the US home anchors that were the "US leaks" in every other harness flip to anchors here):
 *  - **"ADA" / "Americans with Disabilities Act" / "FMLA" / "SSDI" / "SSI" / "COBRA" /
 *    "Medicare" / "Medicaid" / "Social Security"** are US ANCHORS now (they were the
 *    US-leak checks in the other harnesses) — never flagged here.
 *  - **Canada is the biggest bleed risk.** "EI" / "Employment Insurance" / "CPP" /
 *    "Canada Pension Plan" / "Service Canada" / "Canada Health Act" / "Canadian Human
 *    Rights Act" / "ODSP" / "AISH" / "Canadian Cancer Society" are all flagged as CA leaks.
 *  - **"ESA" is NOT flagged.** In the US "ESA" most commonly means an Emotional Support
 *    Animal — flagging the bare token would mis-fire. Canada's (Ontario) Employment
 *    Standards Act is flagged by its FULL phrase only; the UK's Employment and Support
 *    Allowance is flagged by its full phrase only (same pattern as IE's DSP / AU's DSP).
 *  - **"MSP" is NOT flagged.** In the US "MSP" is the Medicare Savings Program (a real US
 *    thing); Canada's BC Medical Services Plan would collide. Canada's provincial health
 *    is flagged by OHIP / RAMQ / AHCIP + "provincial health plan/insurance/coverage" instead.
 *  - **"PWD" is NOT flagged.** In the US "PWD" is a generic abbreviation for "persons with
 *    disabilities". Canada's BC disability program is caught via ODSP / AISH / "Ontario
 *    disability support" instead.
 *  - **"American Cancer Society" contains "Cancer Society"** — a negative lookbehind keeps
 *    NZ's "Cancer Society" a flag while the US anchor passes; Canada's "Canadian Cancer
 *    Society" is its own CA flag (also excluded from the NZ pattern so it isn't double-
 *    labelled); AU's "Cancer Council" and the UK's "Macmillan" / "Cancer Research UK"
 *    stay flags.
 *  - **Human rights:** the US uses the ADA / EEOC, not a "Human Rights Act". Flag NZ's
 *    "Human Rights Act 1993" by year only; the UK has its own 1998 act; Canada has the
 *    "Canadian Human Rights Act"; don't flag the generic phrase.
 *  - **"Disability Allowance" is NOT a US benefit** (it's NZ/IE) — it stays a leak.
 *  - **"HSE"** = Ireland's Health Service Executive — no US meaning, flagged as IE.
 *
 * Usage: INTERNAL_TEST_KEY=<secret> node tests/diag_diagnosis_us.mjs [runsPerScenario]
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
const WORKER_URL = 'https://cutadrift-engine.waynemstevens.workers.dev/';
const RUNS_PER_SCENARIO = parseInt(process.argv[2], 10) || 5;
const PACE_MS = 800;
const FAIL_DIR = 'tests/_us_diag_fails';
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

// ── FAIL: a non-US country's named entity appearing in a US plan. ──
const FAIL_CHECKS = [
  // Canada (the US's biggest bleed risk by proximity)
  { name: 'CA: EI / Employment Insurance',  re: /employment insurance|\bEI\b/ },
  { name: 'CA: CPP / Canada Pension Plan',  re: /\bCPP\b|canada pension plan/i },
  { name: 'CA: Service Canada / ESDC',      re: /service canada|\bESDC\b|employment and social development/i },
  { name: 'CA: Canada Disability Benefit',  re: /canada disability benefit/i },
  // BC/ON disability programs by name (NOT bare "PWD" — generic "persons with disabilities" in the US).
  { name: 'CA: ODSP/AISH (prov. disability)', re: /\bODSP\b|ontario disability support|\bAISH\b/i },
  // Provincial health by name (NOT bare "MSP" — that's the US Medicare Savings Program).
  { name: 'CA: OHIP/RAMQ/AHCIP (prov. health)', re: /\bOHIP\b|\bRAMQ\b|\bAHCIP\b|provincial health (plan|insurance|coverage)/i },
  { name: 'CA: Canada Health Act',          re: /canada health act/i },
  { name: 'CA: Canada Labour Code',         re: /canada labour code/i },
  { name: 'CA: Canadian Human Rights Act',  re: /canadian human rights act/i },
  // FULL phrase only — bare "ESA" is an Emotional Support Animal in the US.
  { name: 'CA: Employment Standards Act',   re: /employment standards act/i },
  { name: 'CA: Canadian Cancer Society',    re: /canadian cancer society/i },
  // United Kingdom
  { name: 'UK: Equality Act 2010',          re: /equality act 2010/i },
  { name: 'UK: NHS',                        re: /\bNHS\b/ },
  { name: 'UK: PIP',                        re: /\bPIP\b|personal independence payment/i },
  // FULL phrase only — bare "ESA" is an Emotional Support Animal in the US.
  { name: 'UK: Employment and Support Allowance', re: /employment and support allowance/i },
  { name: 'UK: Universal Credit',           re: /universal credit/i },
  { name: 'UK: Access to Work',             re: /Access to Work\b/ },
  { name: 'UK: DWP',                        re: /\bDWP\b|department for work and pensions/i },
  // Case-SENSITIVE proper noun: the UK scheme is "Statutory Sick Pay (SSP)" (Title Case);
  // lowercase "statutory sick pay" is generic English the model uses to correctly state
  // the US has NO federal statutory sick pay — NOT a UK leak (same lesson as IE Illness Benefit).
  { name: 'UK: SSP/Statutory Sick Pay',     re: /Statutory Sick Pay|\bSSP\b/ },
  { name: 'UK: Macmillan',                  re: /macmillan/i },
  { name: 'UK: Cancer Research UK',         re: /cancer research uk/i },
  { name: 'UK/NZ: Citizens Advice',         re: /citizens advice/i },
  // Australia
  { name: 'AU: Centrelink',                 re: /centrelink/i },
  { name: 'AU: Services Australia',         re: /services australia/i },
  { name: 'AU: Disability Support Pension', re: /disability support pension/i },
  { name: 'AU: JobSeeker Payment',          re: /jobseeker payment/i },
  { name: 'AU: Fair Work Act',              re: /fair work act/i },
  { name: 'AU: Disability Discrimination Act 1992', re: /disability discrimination act 1992/i },
  { name: 'AU: NDIS',                       re: /\bNDIS\b|national disability insurance/i },
  { name: 'AU: Cancer Council',             re: /cancer council/i },
  { name: 'AU: superannuation',             re: /superannuation/i },
  // New Zealand
  { name: 'NZ: ACC',                        re: /\bACC\b/ },
  { name: 'NZ: Work and Income/WINZ',       re: /Work and Income|\bWINZ\b/ },
  { name: 'NZ: MSD',                        re: /\bMSD\b|ministry of social development/i },
  { name: 'NZ: Te Whatu Ora',               re: /te whatu ora/i },
  { name: 'NZ: NASC',                       re: /\bNASC\b|needs assessment and service coordination/i },
  { name: 'NZ: Supported Living Payment',   re: /supported living payment/i },
  { name: 'NZ: Jobseeker Support',          re: /jobseeker support/i },
  { name: 'NZ: KiwiSaver',                  re: /kiwisaver/i },
  { name: 'NZ: Holidays Act',               re: /holidays act/i },
  { name: 'NZ: Employment Relations Act',   re: /employment relations act/i },
  { name: 'NZ: Human Rights Act 1993',      re: /human rights act 1993/i },
  { name: 'NZ: HDC Code/Commissioner',      re: /code of health and disability|health and disability commissioner/i },
  // Exclude "American Cancer Society" (a US anchor) and "Canadian Cancer Society" (its own
  // CA flag) — flag only NZ's bare "Cancer Society".
  { name: 'NZ: Cancer Society',             re: /(?<!american |canadian )cancer society/i },
  // Ireland
  // Case-SENSITIVE proper noun + insurance-adjective exclusion: Ireland's scheme is
  // "Illness Benefit" (Title Case); a life policy's "serious/critical/terminal illness
  // benefit" rider is generic insurance text, NOT an IE leak (NZ counter-lesson).
  { name: 'IE: Illness Benefit',            re: /(?<!serious |critical |terminal |accelerated |chronic )Illness Benefit/ },
  { name: 'IE: Invalidity Pension',         re: /invalidity pension/i },
  { name: 'IE: Partial Capacity Benefit',   re: /partial capacity benefit/i },
  { name: 'IE: Disability Allowance',       re: /disability allowance/i }, // NZ/IE benefit; not a US benefit
  { name: 'IE: Employment Equality Acts',   re: /employment equality act/i },
  { name: 'IE: Citizens Information',       re: /citizens information/i },
  { name: 'IE: Intreo',                     re: /intreo/i },
  { name: 'IE: HSE/Health Service Executive', re: /\bHSE\b|health service executive/i },
  { name: 'IE: Department of Social Protection', re: /department of social protection/i },
  { name: 'IE: PRSI',                       re: /\bPRSI\b/ },
];

// ── PRESENCE: expected US anchors (informational, not pass/fail). ──
const US_ANCHORS = [
  { name: 'SSDI / Social Security Disability',  re: /\bSSDI\b|social security disability/i },
  { name: 'SSI / Supplemental Security Income', re: /\bSSI\b|supplemental security income/i },
  { name: 'Social Security Administration (SSA)', re: /social security administration|\bSSA\b/ },
  { name: 'Medicare',                           re: /\bmedicare\b/i },
  { name: 'Medicaid',                           re: /\bmedicaid\b/i },
  { name: 'COBRA',                              re: /\bCOBRA\b/ },
  { name: 'ACA / Marketplace / Affordable Care Act', re: /affordable care act|\bACA\b|health insurance marketplace|healthcare\.gov/i },
  { name: 'ADA / Americans with Disabilities Act', re: /\bADA\b|americans with disabilities act/i },
  { name: 'FMLA / Family and Medical Leave Act',  re: /\bFMLA\b|family and medical leave act/i },
  { name: 'EEOC',                               re: /\bEEOC\b|equal employment opportunity commission/i },
  { name: 'Reasonable accommodation',           re: /reasonable accommodation/i },
  { name: 'Short-term / Long-term disability insurance', re: /short[\s-]?term disability|long[\s-]?term disability|\bSTD\b|\bLTD\b/i },
  { name: 'State disability insurance (SDI)',   re: /state disability insurance|\bSDI\b|paid family leave|\bPFL\b/i },
  { name: 'Workers’ compensation',         re: /workers'? compensation|workers'? comp/i },
  { name: 'American Cancer Society',            re: /american cancer society/i },
  { name: 'National MS Society / Parkinson’s Foundation', re: /national ms society|multiple sclerosis (society|association)|parkinson'?s? foundation/i },
  { name: '211 (info line)',                    re: /\b211\b/ },
];

const COMMON = { tool: 'diagnosis', country: 'us', who: 'me' };
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
    const anchors = US_ANCHORS.filter((c) => c.re.test(r.text)).map((c) => c.name);
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
console.log(`\n${'='.repeat(72)}\nSUMMARY — ${results.length} real-content runs (country=us)`);
const failedRuns = results.filter((r) => r.fails.length);
console.log(`Clean (no cross-country leak): ${results.length - failedRuns.length}/${results.length}`);
if (failedRuns.length) {
  console.log(`\nFAILURES (cross-country entity in a US plan):`);
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
console.log(`\nUS anchor coverage (of ${results.length} runs):`);
US_ANCHORS.forEach((a) => console.log(`  ${(anchorFreq[a.name] || 0).toString().padStart(2)}× ${a.name}`));
