#!/usr/bin/env node
/**
 * Diagnosis tool — country=ca cross-country leak audit.
 * Clone of diag_diagnosis_ie.mjs (handover 32 method) with Canada as the home country.
 * The diagnosis prompt inlines all six countries' benefit names and statutes into
 * single sentences, so a CA plan can pull in ADA / FMLA / SSDI / Centrelink / DSP /
 * Equality Act 2010 / NHS / PIP / Work and Income / KiwiSaver / Illness Benefit etc.
 * This harness fires CA diagnosis scenarios (employed / self-employed / not-working)
 * and flags any NON-CA country's named entity appearing in a CA plan, plus reports
 * which expected CA anchors showed up.
 *
 * Uses the X-Internal-Test bypass (handover 31) so it never burns the public rate
 * limit. Large sample on purpose (H27/H32 lesson: a small 3+3 misses the tail) —
 * run 10–14+. Costs real Sonnet tokens. Read-only.
 *
 * CA-specific false-positive notes (Canada's biggest risk is US-bleed by proximity;
 * the home anchors that were "CA leaks" in every other harness flip to anchors here):
 *  - **"EI" / "Employment Insurance" / "CPP" / "Canada Pension Plan" / "Service Canada"
 *    / "Canadian Human Rights Act"** are CA ANCHORS now (they were the CA-leak checks in
 *    the other harnesses) — never flagged here.
 *  - **"ESA" is NOT flagged.** In Canada "ESA" is the (Ontario) Employment Standards Act
 *    — a CA anchor. The UK's Employment and Support Allowance is flagged by its FULL
 *    phrase only (same pattern as IE's DSP / AU's Disability Support Pension).
 *  - **"Medicare" is genuine Canadian usage** (the colloquial name for the public health
 *    system) AS WELL AS a US/AU term. It is kept as a SOFT flag — on any survivor, read
 *    the text (NZ counter-lesson): "Canada's Medicare" / "our Medicare system" is CORRECT
 *    and not a leak; a bare US-style "Medicare card/Part B" is. The CA block steers the
 *    model to the provincial plan name (OHIP etc.) + the Canada Health Act to avoid it.
 *  - **"Canadian Cancer Society" contains "Cancer Society"** — a negative lookbehind keeps
 *    NZ's "Cancer Society" a flag while the CA anchor passes; AU's "Cancer Council" and
 *    the UK's "Macmillan" / "Cancer Research UK" stay flags.
 *  - **"Employment Equity Act"** is a real federal Canadian statute and is NOT the same as
 *    Ireland's "Employment Equality Acts" — the /employment equality act/i IE flag won't
 *    match "Equity", so no collision.
 *  - **Human rights:** Canada uses the "Canadian Human Rights Act" + provincial "Human
 *    Rights Code"s (CA anchors). Flag NZ's "Human Rights Act 1993" by year only; UK has
 *    its own 1998 act; don't flag the generic phrase.
 *  - **"Disability Allowance" is NOT a Canadian benefit** (it's NZ/IE) — it stays a leak.
 *    Canada's provincial disability income is ODSP / AISH / PWD etc. ("ODSP" does not
 *    match /\bDSP\b/ — the O is a word char — so the AU "DSP" check is safe to omit and
 *    AU is flagged by the full "Disability Support Pension" phrase instead.)
 *  - **"HSE"** = Ireland's Health Service Executive — no Canadian meaning, flagged as IE.
 *
 * Usage: INTERNAL_TEST_KEY=<secret> node tests/diag_diagnosis_ca.mjs [runsPerScenario]
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
const WORKER_URL = 'https://cutadrift-engine.waynemstevens.workers.dev/';
const RUNS_PER_SCENARIO = parseInt(process.argv[2], 10) || 5;
const PACE_MS = 800;
const FAIL_DIR = 'tests/_ca_diag_fails';
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

// ── FAIL: a non-CA country's named entity appearing in a CA plan. ──
const FAIL_CHECKS = [
  // United States (Canada's biggest bleed risk by proximity)
  { name: 'US: ADA',                       re: /\bADA\b|americans with disabilities act/i },
  { name: 'US: FMLA',                      re: /\bFMLA\b|family and medical leave act/i },
  { name: 'US: SSDI/SSI/Social Security',  re: /\bSSDI\b|\bSSI\b|social security disability/i },
  { name: 'US: COBRA',                     re: /\bCOBRA\b/ },
  { name: 'US: Medicaid',                  re: /medicaid/i },
  // SOFT flag — "Medicare" is also the colloquial Canadian name for public health.
  // On a survivor, READ the text: "Canada's Medicare" = correct; US-style "Medicare
  // Part B / Medicare card" = a leak.
  { name: 'US/AU/CA?: Medicare (read context)', re: /\bmedicare\b/i },
  // United Kingdom
  // Year-specific: Canada has provincial Human Rights Codes + the Canadian Human Rights
  // Act, not an "Equality Act". Flag the UK's 2010 act.
  { name: 'UK: Equality Act 2010',        re: /equality act 2010/i },
  { name: 'UK: NHS',                       re: /\bNHS\b/ },
  { name: 'UK: PIP',                       re: /\bPIP\b|personal independence payment/i },
  // FULL phrase only — bare "ESA" is Ontario's Employment Standards Act (a CA anchor).
  { name: 'UK: Employment and Support Allowance', re: /employment and support allowance/i },
  { name: 'UK: Universal Credit',          re: /universal credit/i },
  { name: 'UK: Access to Work',            re: /Access to Work\b/ },
  { name: 'UK: DWP',                       re: /\bDWP\b|department for work and pensions/i },
  { name: 'UK: SSP/Statutory Sick Pay',    re: /statutory sick pay|\bSSP\b/i },
  { name: 'UK: Macmillan',                 re: /macmillan/i },
  { name: 'UK: Cancer Research UK',        re: /cancer research uk/i },
  { name: 'UK/NZ: Citizens Advice',       re: /citizens advice/i },
  // Australia
  { name: 'AU: Centrelink',               re: /centrelink/i },
  { name: 'AU: Services Australia',       re: /services australia/i },
  { name: 'AU: Disability Support Pension', re: /disability support pension/i },
  { name: 'AU: JobSeeker Payment',        re: /jobseeker payment/i },
  { name: 'AU: Fair Work Act',            re: /fair work act/i },
  { name: 'AU: Disability Discrimination Act 1992', re: /disability discrimination act 1992/i },
  { name: 'AU: NDIS',                      re: /\bNDIS\b|national disability insurance/i },
  { name: 'AU: Cancer Council',           re: /cancer council/i },
  { name: 'AU: superannuation',           re: /superannuation/i },
  // New Zealand
  { name: 'NZ: ACC',                       re: /\bACC\b/ },
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
  // Exclude "Canadian Cancer Society" (a CA anchor) — flag only NZ's "Cancer Society".
  { name: 'NZ: Cancer Society',           re: /(?<!canadian )cancer society/i },
  // Ireland
  // Case-SENSITIVE proper noun + insurance-adjective exclusion: Ireland's scheme is
  // "Illness Benefit" (Title Case); a life policy's "serious/critical/terminal illness
  // benefit" rider is generic insurance text, NOT an IE leak (NZ counter-lesson).
  { name: 'IE: Illness Benefit',          re: /(?<!serious |critical |terminal |accelerated |chronic )Illness Benefit/ },
  { name: 'IE: Invalidity Pension',       re: /invalidity pension/i },
  { name: 'IE: Partial Capacity Benefit', re: /partial capacity benefit/i },
  { name: 'IE: Disability Allowance',     re: /disability allowance/i }, // NZ/IE benefit; CA uses ODSP/AISH/PWD
  { name: 'IE: Employment Equality Acts', re: /employment equality act/i }, // ≠ CA "Employment Equity Act"
  { name: 'IE: Citizens Information',     re: /citizens information/i },
  { name: 'IE: Intreo',                   re: /intreo/i },
  { name: 'IE: HSE/Health Service Executive', re: /\bHSE\b|health service executive/i },
  { name: 'IE: Department of Social Protection', re: /department of social protection/i },
  { name: 'IE: PRSI',                     re: /\bPRSI\b/ },
];

// ── PRESENCE: expected CA anchors (informational, not pass/fail). ──
const CA_ANCHORS = [
  { name: 'EI / Employment Insurance',          re: /employment insurance|\bEI\b/ },
  { name: 'EI sickness benefits',               re: /ei sickness|sickness benefit/i },
  { name: 'CPP / Canada Pension Plan',          re: /\bCPP\b|canada pension plan/i },
  { name: 'CPP Disability (CPP-D)',             re: /cpp[\s-]?d\b|cpp disability|canada pension plan disability/i },
  { name: 'Service Canada / ESDC',              re: /service canada|\bESDC\b|employment and social development/i },
  { name: 'Canada Disability Benefit',          re: /canada disability benefit/i },
  { name: 'Provincial disability (ODSP/AISH/PWD)', re: /\bODSP\b|ontario disability support|\bAISH\b|disability support program|\bPWD\b/i },
  { name: 'Provincial health plan (OHIP/RAMQ/MSP)', re: /\bOHIP\b|\bRAMQ\b|\bMSP\b|\bAHCIP\b|provincial health (plan|insurance|coverage)/i },
  { name: 'Canada Health Act',                  re: /canada health act/i },
  { name: 'Employment Standards Act / ESA',     re: /employment standards act|\bESA\b/ },
  { name: 'Canada Labour Code',                 re: /canada labour code/i },
  { name: 'Canadian Human Rights Act',          re: /canadian human rights act/i },
  { name: 'Human Rights Code/Tribunal (prov.)', re: /human rights code|human rights tribunal|human rights commission/i },
  { name: 'Duty to accommodate',                re: /duty to accommodate|undue hardship/i },
  { name: 'Long-term disability / LTD insurance', re: /long[\s-]?term disability|\bLTD\b/i },
  { name: 'Canadian Cancer Society',            re: /canadian cancer society/i },
  { name: 'MS Canada / Parkinson Canada',       re: /ms (society of )?canada|parkinson canada|parkinson society/i },
  { name: '211 (info line)',                    re: /\b211\b/ },
];

const COMMON = { tool: 'diagnosis', country: 'ca', who: 'me' };
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
    const anchors = CA_ANCHORS.filter((c) => c.re.test(r.text)).map((c) => c.name);
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
console.log(`\n${'='.repeat(72)}\nSUMMARY — ${results.length} real-content runs (country=ca)`);
const failedRuns = results.filter((r) => r.fails.length);
console.log(`Clean (no cross-country leak): ${results.length - failedRuns.length}/${results.length}`);
if (failedRuns.length) {
  console.log(`\nFAILURES (cross-country entity in a CA plan):`);
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
console.log(`\nCA anchor coverage (of ${results.length} runs):`);
CA_ANCHORS.forEach((a) => console.log(`  ${(anchorFreq[a.name] || 0).toString().padStart(2)}× ${a.name}`));
