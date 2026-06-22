#!/usr/bin/env node
/**
 * Diagnosis tool — country=ie cross-country leak audit.
 * Clone of diag_diagnosis_uk.mjs (handover 32 method) with Ireland as the home country.
 * The diagnosis prompt inlines all six countries' benefit names and statutes into
 * single sentences, so an IE plan can pull in ADA / FMLA / SSDI / Centrelink / DSP /
 * Equality Act 2010 / NHS / PIP / Work and Income / KiwiSaver / CPP etc. This harness
 * fires IE diagnosis scenarios (employed / self-employed / not-working) and flags any
 * NON-IE country's named entity appearing in an IE plan, plus reports which expected
 * IE anchors showed up.
 *
 * Uses the X-Internal-Test bypass (handover 31) so it never burns the public rate
 * limit. Large sample on purpose (H27/H32 lesson: a small 3+3 misses the tail) —
 * run 10–14+. Costs real Sonnet tokens. Read-only.
 *
 * IE-specific false-positive notes (the collisions are heavier than any prior country):
 *  - **"DSP" is Ireland's Department of Social Protection** — an IE ANCHOR. Do NOT flag
 *    the bare initialism: AU's "Disability Support Pension" is flagged by its FULL
 *    phrase only.
 *  - **"HSE" is Ireland's Health Service Executive** — an IE ANCHOR (the reverse of the
 *    UK harness, where HSE = the Health and Safety Executive). No HSE fail check here.
 *  - **"Disability Allowance" is a real IE benefit** — an IE ANCHOR, NOT a leak (unlike
 *    the UK/AU harnesses where it was the NZ/IE leak).
 *  - **"Illness Benefit" is Ireland's OWN scheme** — an IE ANCHOR. No insurance-phrase
 *    exclusion here; it's the home benefit.
 *  - **Ireland has its OWN Statutory Sick Pay scheme** (Sick Leave Act 2022, from 2023)
 *    — so SSP is an IE ANCHOR, never flagged as a UK leak.
 *  - **"Citizens Information" is Ireland's service** — an IE ANCHOR. The UK "Citizens
 *    Advice" and NZ "Citizens Advice Bureau" are the leaks we flag instead.
 *  - **"Irish Cancer Society" contains "Cancer Society"** — a negative lookbehind keeps
 *    NZ's "Cancer Society" a flag while the IE anchor passes; AU's "Cancer Council" and
 *    the UK's "Cancer Research UK" stay flags.
 *  - **Equality law:** Ireland uses the "Employment Equality Acts" / "Equal Status Acts"
 *    (IE anchors). Flag the UK's "Equality Act **2010**" by year — a generic /equality
 *    act/i would false-positive on Ireland's "Employment Equality Act".
 *  - **Human rights:** Ireland's body is IHREC — don't flag the generic phrase; flag
 *    only NZ's "Human Rights Act 1993" and the Canadian Human Rights Act.
 *  - Generic lowercase "social welfare" is correct IE usage, not the US "social security".
 *
 * Usage: INTERNAL_TEST_KEY=<secret> node tests/diag_diagnosis_ie.mjs [runsPerScenario]
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
const WORKER_URL = 'https://cutadrift-engine.waynemstevens.workers.dev/';
const RUNS_PER_SCENARIO = parseInt(process.argv[2], 10) || 5;
const PACE_MS = 800;
const FAIL_DIR = 'tests/_ie_diag_fails';
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

// ── FAIL: a non-IE country's named entity appearing in an IE plan. ──
const FAIL_CHECKS = [
  // United States
  { name: 'US: ADA',                       re: /\bADA\b|americans with disabilities act/i },
  { name: 'US: FMLA',                      re: /\bFMLA\b|family and medical leave act/i },
  { name: 'US: SSDI/SSI/Social Security',  re: /\bSSDI\b|\bSSI\b|social security disability/i },
  { name: 'US: COBRA',                     re: /\bCOBRA\b/ },
  { name: 'US: Medicaid',                  re: /medicaid/i },
  { name: 'US/AU: Medicare',              re: /\bmedicare\b/i },
  // United Kingdom
  // Year-specific: Ireland's own laws are the "Employment Equality Acts" / "Equal
  // Status Acts", which contain the words "Equality Act" — flag only the UK's 2010 act.
  { name: 'UK: Equality Act 2010',        re: /equality act 2010/i },
  { name: 'UK: NHS',                       re: /\bNHS\b/ },
  { name: 'UK: PIP',                       re: /\bPIP\b|personal independence payment/i },
  { name: 'UK: ESA',                       re: /\bESA\b|employment and support allowance/i },
  { name: 'UK: Universal Credit',          re: /universal credit/i },
  { name: 'UK: Access to Work',            re: /Access to Work\b/ },
  { name: 'UK: DWP',                       re: /\bDWP\b|department for work and pensions/i },
  { name: 'UK: Macmillan',                 re: /macmillan/i },
  { name: 'UK: Cancer Research UK',        re: /cancer research uk/i },
  // UK/NZ: Ireland's service is "Citizens Information"; flag the UK/NZ variants.
  { name: 'UK/NZ: Citizens Advice',       re: /citizens advice/i },
  // NOTE: "Statutory Sick Pay" / "SSP" is NOT flagged — Ireland has its OWN statutory
  // sick pay scheme since 2023. It is an IE anchor (see below).
  // Australia
  { name: 'AU: Centrelink',               re: /centrelink/i },
  { name: 'AU: Services Australia',       re: /services australia/i },
  // FULL phrase only — bare "DSP" is Ireland's Department of Social Protection (anchor).
  { name: 'AU: Disability Support Pension', re: /disability support pension/i },
  { name: 'AU: JobSeeker Payment',        re: /jobseeker payment/i },
  { name: 'AU: Fair Work Act',            re: /fair work act/i },
  { name: 'AU: Disability Discrimination Act 1992', re: /disability discrimination act 1992/i },
  { name: 'AU: NDIS',                      re: /\bNDIS\b|national disability insurance/i },
  { name: 'AU: Cancer Council',           re: /cancer council/i },
  { name: 'AU: superannuation',           re: /superannuation/i },
  // New Zealand
  { name: 'NZ: ACC',                       re: /\bACC\b/ },
  // Case-SENSITIVE: the NZ agency is "Work and Income" (capitalised); generic lowercase
  // "work and income" is a plain phrase ("questions about work and income") — not a leak.
  { name: 'NZ: Work and Income/WINZ',     re: /Work and Income|\bWINZ\b/ },
  { name: 'NZ: MSD',                       re: /\bMSD\b|ministry of social development/i },
  { name: 'NZ: Te Whatu Ora',             re: /te whatu ora/i },
  { name: 'NZ: NASC',                      re: /\bNASC\b|needs assessment and service coordination/i },
  { name: 'NZ: Supported Living Payment', re: /supported living payment/i },
  { name: 'NZ: Jobseeker Support',        re: /jobseeker support/i },
  { name: 'NZ: KiwiSaver',                 re: /kiwisaver/i },
  { name: 'NZ: Holidays Act',             re: /holidays act/i },
  { name: 'NZ: Employment Relations Act', re: /employment relations act/i },
  { name: 'NZ: Human Rights Act 1993',    re: /human rights act 1993/i },
  { name: 'NZ: HDC Code/Commissioner',    re: /code of health and disability|health and disability commissioner/i },
  // Exclude "Irish Cancer Society" (an IE anchor) — flag only NZ's "Cancer Society".
  { name: 'NZ: Cancer Society',           re: /(?<!irish )cancer society/i },
  // Canada
  { name: 'CA: CPP/Canada Pension Plan',   re: /\bCPP\b|canada pension plan/i },
  { name: 'CA: EI/Employment Insurance',   re: /employment insurance\b|\bEI sickness\b/i },
  { name: 'CA: Service Canada',            re: /service canada/i },
  { name: 'CA: Canadian Human Rights Act', re: /canadian human rights act/i },
];

// ── PRESENCE: expected IE anchors (informational, not pass/fail). ──
const IE_ANCHORS = [
  { name: 'Illness Benefit',           re: /illness benefit/i },
  { name: 'Disability Allowance',      re: /disability allowance/i },
  { name: 'Invalidity Pension',        re: /invalidity pension/i },
  { name: 'Partial Capacity Benefit',  re: /partial capacity benefit/i },
  { name: 'Carer\'s Allowance/Benefit', re: /carer'?s (allowance|benefit|support grant)/i },
  { name: 'DSP/Dept of Social Protection', re: /\bDSP\b|department of social protection/i },
  { name: 'Intreo',                    re: /intreo/i },
  { name: 'Medical Card/GP Visit Card', re: /medical card|gp visit card/i },
  { name: 'HSE (Health Service Executive)', re: /\bHSE\b|health service executive/i },
  { name: 'Employment Equality/Equal Status Acts', re: /employment equality act|equal status act/i },
  { name: 'WRC/IHREC',                 re: /workplace relations commission|\bWRC\b|irish human rights|\bIHREC\b/i },
  { name: 'Citizens Information',      re: /citizens information/i },
  { name: 'MABS',                      re: /\bMABS\b|money advice and budgeting/i },
  { name: 'Irish Cancer Society/MS Ireland', re: /irish cancer society|\bMS Ireland\b/i },
  { name: 'Statutory Sick Pay (IE)',  re: /statutory sick pay|\bSSP\b/i },
  { name: 'PRSI',                      re: /\bPRSI\b/ },
];

const COMMON = { tool: 'diagnosis', country: 'ie', who: 'me' };
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
    const anchors = IE_ANCHORS.filter((c) => c.re.test(r.text)).map((c) => c.name);
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
console.log(`\n${'='.repeat(72)}\nSUMMARY — ${results.length} real-content runs (country=ie)`);
const failedRuns = results.filter((r) => r.fails.length);
console.log(`Clean (no cross-country leak): ${results.length - failedRuns.length}/${results.length}`);
if (failedRuns.length) {
  console.log(`\nFAILURES (cross-country entity in an IE plan):`);
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
console.log(`\nIE anchor coverage (of ${results.length} runs):`);
IE_ANCHORS.forEach((a) => console.log(`  ${(anchorFreq[a.name] || 0).toString().padStart(2)}× ${a.name}`));
