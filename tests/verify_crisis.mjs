#!/usr/bin/env node
/**
 * Deterministic verification for the bereavement distress short-circuit (no API).
 * Checks: trigger fires only on the two specified Q4 answers; the real getNext
 * routing is exercised; the formatter renders the four fields cleanly from a
 * spread payload without leaking other intake fields; the existing bereavement
 * tool is untouched.
 */
import fs from 'node:fs';

let pass = 0, fail = 0;
const ok = (n, c, d='') => { (c ? pass++ : fail++); console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? `  (${d})` : ''}`); };

// ---- Load real worker internals ------------------------------------------
const workerSrc = fs.readFileSync(new URL('../worker.js', import.meta.url), 'utf8')
  .replace('export default {', 'const __workerDefault = {');
const { SYSTEM_PROMPTS, INTAKE_FORMATTERS } = new Function(
  workerSrc + ';return { SYSTEM_PROMPTS, INTAKE_FORMATTERS };')();

// ---- Load the REAL getNext routing from the intake page ------------------
const html = fs.readFileSync(new URL('../Public/when-someone-dies/index.html', import.meta.url), 'utf8');
const grab = (re, label) => { const m = html.match(re); if (!m) throw new Error('could not extract ' + label); return m[0]; };
const layer1   = grab(/const LAYER1\s*=\s*\[[^\]]*\];/, 'LAYER1');
const layer2   = grab(/const LAYER2\s*=\s*\[[^\]]*\];/, 'LAYER2');
const fullSeq  = grab(/const FULL_SEQ\s*=[\s\S]*?\];/, 'FULL_SEQ');
const getNextS = grab(/function getNext\(step, ans\) \{[\s\S]*?\n  \}/, 'getNext');
// getNext mutates a global `answers`; provide one via the function param.
const getNext = new Function('answers',
  `${layer1}\n${layer2}\n${fullSeq}\n${getNextS}\n;return getNext;`)({});

// ---- Trigger tests (real routing) ----------------------------------------
ok('Q4 "barely_functioning" → crisis branch',
  getNext('emotional_state', { emotional_state: 'barely_functioning' }) === 'crisis');
ok('Q4 "holding_together" → crisis branch',
  getNext('emotional_state', { emotional_state: 'holding_together' }) === 'crisis');
ok('Q4 "need_the_list" → does NOT branch (continues to support_situation)',
  getNext('emotional_state', { emotional_state: 'need_the_list' }) === 'support_situation');
ok('Q4 "not_sure" → does NOT branch (continues to support_situation)',
  getNext('emotional_state', { emotional_state: 'not_sure' }) === 'support_situation');
// the crisis rule must not hijack any other step
ok('crisis branch never fires from a non-Q4 step',
  getNext('relationship', { emotional_state: 'barely_functioning', timing: 'recent_sudden' }) !== 'crisis');

// ---- Routing registration ------------------------------------------------
ok('SYSTEM_PROMPTS has bereavement-crisis', !!SYSTEM_PROMPTS['bereavement-crisis']);
ok('INTAKE_FORMATTERS has bereavement-crisis', typeof INTAKE_FORMATTERS['bereavement-crisis'] === 'function');
const cp = SYSTEM_PROMPTS['bereavement-crisis'] || '';
ok('crisis prompt excludes legal content', /No legal content/i.test(cp));
ok('crisis prompt excludes financial content', /No financial content/i.test(cp));
ok('crisis prompt excludes employment content', /No employment content/i.test(cp));
ok('crisis prompt scopes to the next few hours', /next few hours/i.test(cp));
ok('crisis prompt ends with an offer to continue (not a dead end)', /fuller, step-by-step plan/i.test(cp));

// ---- Formatter field plumbing (spread payload) ---------------------------
// Simulate the payload the frontend sends — only the 4 fields — plus a stray
// field to prove the formatter ignores anything it isn't meant to use.
const payload = { tool: 'bereavement-crisis', country: 'nz', timing: 'recent_sudden',
  relationship: 'partner', emotional_state: 'barely_functioning',
  support_situation: 'mostly_alone' /* stray — must NOT appear */ };
const out = INTAKE_FORMATTERS['bereavement-crisis'](payload);
ok('formatter renders country label', out.includes('New Zealand'));
ok('formatter renders timing label', out.includes('sudden or unexpected'));
ok('formatter renders relationship label', out.includes('Partner or spouse'));
ok('formatter renders coping label', out.includes('Barely functioning'));
ok('formatter does NOT leak unrelated intake fields', !out.includes('mostly_alone'));
ok('formatter does NOT leak raw field keys', !/emotional_state:|support_situation:/.test(out));

// missing fields must not throw or print "undefined"
const sparse = INTAKE_FORMATTERS['bereavement-crisis']({ tool: 'bereavement-crisis', country: 'uk' });
ok('formatter handles missing fields without leaking "undefined"', !/undefined/.test(sparse));

// ---- Existing bereavement tool untouched ---------------------------------
ok('existing bereavement prompt still present', /You are the guide at Cut Adrift/.test(SYSTEM_PROMPTS.bereavement || ''));
ok('existing bereavement formatter still present', typeof INTAKE_FORMATTERS.bereavement === 'function');

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
