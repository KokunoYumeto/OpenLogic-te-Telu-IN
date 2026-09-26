import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const qaPath = path.join(root, 'build', 'BATCH-055-STRUCTURAL-QA.json');
const qa = JSON.parse(fs.readFileSync(qaPath, 'utf8'));
const record = qa.units.find(unit => unit.unit_id === 'OLP-0378');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const targetPath = path.join(root, 'translation', 'content', 'lambda-calculus',
  'lambda-definability', 'primitive-recursive-functions.tex');
if (!record || record.source_blocks !== 21 || record.target_blocks !== 21 ||
    !record.structure_match || !record.token_parity || !record.protected_identifier_parity) {
  throw new Error('Batch 055 structural diagnostic incomplete');
}
if (record.translation_sha256 !== sha(fs.readFileSync(targetPath))) throw new Error('Stale structural QA');
const before = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split(/\r?\n/u);
const rows = before.map(JSON.parse);
const own = rows.filter(row => row.audit_id === 'OLTELAMLDFPRF-20260926');
if (own.length !== 2) throw new Error('Unexpected correction rows');
const first = own.find(row => row.finding_id === 'OLTELAMLDFPRF-001');
const second = own.find(row => row.finding_id === 'OLTELAMLDFPRF-002');
if (!first || !second) throw new Error('Missing correction finding');
const sourceDisplay = '\\begin{align*}h(x_1,\\dots,x_n,0)&=f(x_1,\\dots,x_n)\\\\h(x_1,\\dots,x_n,y+1)&=h(x_1,\\dots,x_n,y,h(x_1,\\dots,x_n,y)).\\end{align*}';
const targetDisplay = '\\begin{align*}h(x_1,\\dots,x_n,0)&=f(x_1,\\dots,x_n)\\\\h(x_1,\\dots,x_n,y+1)&=g(x_1,\\dots,x_n,y,h(x_1,\\dots,x_n,y)).\\end{align*}';
const expectedSource = ['$G_k$', '$H$', sourceDisplay];
const expectedTarget = ['$G_{k-1}$', '$g$', targetDisplay];
if (JSON.stringify(record.math_delta_source_only) !== JSON.stringify(expectedSource) ||
    JSON.stringify(record.math_delta_target_only) !== JSON.stringify(expectedTarget)) {
  throw new Error('Unexpected math delta; inspect source and translation before adjudicating');
}
first.expected_core_math_delta = {source_only: ['$G_k$', '$H$'], target_only: ['$G_{k-1}$']};
first.math_delta_accounting = 'The target $h$ in this lemma and the source $h$ in the corrected informal recurrence prose cancel in the unit-wide multiset; the remaining $g$ is assigned to finding 002.';
second.expected_core_math_delta = {source_only: [sourceDisplay], target_only: ['$g$', targetDisplay]};
second.math_delta_accounting = 'The source $h$ from informal prose and target $h$ in the composition lemma cancel in the unit-wide multiset; the stage-function $g$ remains a target-only prose atom.';
if (process.argv.includes('--confirm')) {
  if (!record.math_multiset_match || !record.math_declared_source_correction_match ||
      !record.paragraph_alignment || record.unicode_replacement_char || record.unpaired_surrogate) {
    throw new Error('Cannot confirm unsuccessful structural QA');
  }
  first.status = 'applied_qa_pass';
  second.status = 'applied_qa_pass';
}
fs.writeFileSync(ledgerPath, rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
console.log(JSON.stringify({status: process.argv.includes('--confirm') ? 'applied_qa_pass' : 'adjudicated_pending_qa', source_only: expectedSource.length,
  target_only: expectedTarget.length}));
