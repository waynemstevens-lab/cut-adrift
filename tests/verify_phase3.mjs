#!/usr/bin/env node
/**
 * Deterministic verification for DIWM Phase 3 (no API calls).
 * Checks the two session-19-class risks directly against the REAL code:
 *   1. Panel matchers fire on the mandated headings and pick the right section.
 *   2. Worker formatters read incapacity's actual field names from a spread payload.
 */
import fs from 'node:fs';
import vm from 'node:vm';

let pass = 0, fail = 0;
const ok  = (n, c, d='') => { (c ? pass++ : fail++); console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? `  (${d})` : ''}`); };

// ---- 1. Load the real worker internals -----------------------------------
const workerSrc = fs.readFileSync(new URL('../worker.js', import.meta.url), 'utf8')
  // neutralise the ESM `export default { ... }` so it parses inside new Function()
  .replace('export default {', 'const __workerDefault = {');
const getInternals = new Function(workerSrc + `
  ;return { SYSTEM_PROMPTS, INTAKE_FORMATTERS };`);
const { SYSTEM_PROMPTS, INTAKE_FORMATTERS } = getInternals();

// ---- 2. Load the real DIWM_TASKS from the plan page ----------------------
const planSrc = fs.readFileSync(new URL('../Public/plan/index.html', import.meta.url), 'utf8');
const tasksMatch = planSrc.match(/const DIWM_TASKS = (\{[\s\S]*?\n  \};)/);
const DIWM_TASKS = vm.runInNewContext('(' + tasksMatch[1].replace(/;$/, '') + ')');

// ---- Matcher tests -------------------------------------------------------
// A realistic set of h2 headings a generated incapacity plan might contain.
const incapacityHeadings = [
  'Right now', 'Getting authority to act', 'The care assessment',
  'Paying for care', 'The people around you', 'Questions for the medical team',
];
const diagnosisHeadings = [
  'Right now', 'Your employment rights', 'Your income', 'Your insurance',
  'Your treatment journey', 'The people in your life', 'Support',
];

function firstMatch(tasks, headings) {
  return tasks.map(t => {
    const h = headings.find(x => t.match(x.toLowerCase()));
    return { tool: t.tool, matched: h || null };
  });
}

const incResults = firstMatch(DIWM_TASKS.incapacity, incapacityHeadings);
ok('incapacity DIWM_TASKS array exists', !!DIWM_TASKS.incapacity);
ok('incapacity-family-message anchors to "The people around you"',
  incResults.find(r => r.tool === 'incapacity-family-message')?.matched === 'The people around you',
  JSON.stringify(incResults.find(r => r.tool === 'incapacity-family-message')));
ok('incapacity-gp-questions anchors to "Questions for the medical team"',
  incResults.find(r => r.tool === 'incapacity-gp-questions')?.matched === 'Questions for the medical team');

const diaResults = firstMatch(DIWM_TASKS.diagnosis, diagnosisHeadings);
ok('diagnosis-gp-questions anchors to "Your treatment journey"',
  diaResults.find(r => r.tool === 'diagnosis-gp-questions')?.matched === 'Your treatment journey');
// regression: existing diagnosis panels still anchor correctly, no mis-fire onto treatment journey
ok('diagnosis-family-message still anchors to "The people in your life"',
  diaResults.find(r => r.tool === 'diagnosis-family-message')?.matched === 'The people in your life');

// negative: family-message matcher must NOT fire when its section is absent
ok('incapacity-family-message does NOT fire without its heading',
  !DIWM_TASKS.incapacity.find(t => t.tool === 'incapacity-family-message')
     .match('the care assessment'));

// ---- Mandated-heading presence in the prompt -----------------------------
ok('incapacity prompt mandates exact "## The people around you"',
  SYSTEM_PROMPTS.incapacity.includes('exactly "## The people around you"'));
ok('incapacity prompt mandates exact "## Questions for the medical team"',
  SYSTEM_PROMPTS.incapacity.includes('exactly "## Questions for the medical team"'));

// ---- Formatter field-plumbing tests --------------------------------------
// Simulate the spread payload the frontend now builds: full intake + tool + fields.
const incapacityIntake = {
  tool: 'incapacity', country: 'nz', who: 'parent', what_happened: 'stroke',
  capacity: 'possibly_unclear', location: 'in_hospital', free_text: 'I live three hours away',
};

// Family message
const famPayload = { ...incapacityIntake, tool: 'incapacity-family-message',
  recipients: 'my brother and sister', purpose: 'ask_help', tone: 'gentle', concern: 'my brother overseas' };
const famOut = INTAKE_FORMATTERS['incapacity-family-message'](famPayload);
ok('family-message formatter renders relationship from "who"', famOut.includes('their parent'), 'who=parent → "their parent"');
ok('family-message formatter renders "what_happened"', famOut.includes('they had a stroke'));
ok('family-message formatter renders chosen purpose', famOut.includes('ask for specific help'));
ok('family-message formatter renders recipients + concern', famOut.includes('my brother and sister') && famOut.includes('overseas'));
ok('family-message formatter carries free_text', famOut.includes('three hours away'));
ok('family-message does NOT leak raw field key "who:"', !/\bwho:/i.test(famOut));

// GP questions (incapacity)
const gpPayload = { ...incapacityIntake, tool: 'incapacity-gp-questions',
  appt_with: 'discharge_planner', focus: 'getting them home safely' };
const gpOut = INTAKE_FORMATTERS['incapacity-gp-questions'](gpPayload);
ok('incapacity gp-questions renders relationship + event', gpOut.includes('their parent') && gpOut.includes('they had a stroke'));
ok('incapacity gp-questions renders appointment + focus',
  gpOut.includes('discharge planner') && gpOut.includes('getting them home safely'));

// GP questions (diagnosis) — uses diwmContextLines (country/employment/free_text)
const diaPayload = { tool: 'diagnosis-gp-questions', country: 'nz', employment: 'employed',
  free_text: 'recently diagnosed', appt_with: 'specialist', focus: 'side effects' };
const diaOut = INTAKE_FORMATTERS['diagnosis-gp-questions'](diaPayload);
ok('diagnosis gp-questions renders appointment + focus', diaOut.includes('A specialist') && diaOut.includes('side effects'));

// ---- carer scaffolding removed -------------------------------------------
ok('dead "carer" key removed from SYSTEM_PROMPTS', !('carer' in SYSTEM_PROMPTS));
ok('dead "carer" key removed from INTAKE_FORMATTERS', !('carer' in INTAKE_FORMATTERS));

// ---- Path C tell-my-family extension --------------------------------------
ok('bereavement prompt mandates "The people around you" in Path C',
  SYSTEM_PROMPTS.bereavement.includes('Always include this section in Path C'));
ok('bereavement-family-message prompt handles belated (weeks-on) news',
  SYSTEM_PROMPTS['bereavement-family-message'].includes('belated'));
// Path C plan headings still trigger the existing bereavement family-message matcher.
const pathCHeadings = ['Where things typically stand now', 'The people around you',
  'The estate and admin checklist', 'Notifying their employer', 'Things people commonly miss'];
ok('bereavement-family-message matcher fires on a Path C plan',
  DIWM_TASKS.bereavement.find(t => t.tool === 'bereavement-family-message')
    .match('the people around you'));
// Formatter now forwards timing so the model can adapt belated framing.
const bfmPayload = { tool: 'bereavement-family-message', country: 'nz', relationship: 'parent',
  timing: 'weeks_ago', recipients: 'my overseas cousins', tone: 'matter_of_fact', concern: '' };
const bfmOut = INTAKE_FORMATTERS['bereavement-family-message'](bfmPayload);
ok('family-message formatter forwards timing label', bfmOut.includes('A few weeks ago or more'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
