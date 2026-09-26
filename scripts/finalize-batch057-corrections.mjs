import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-057-STRUCTURAL-QA.json'), 'utf8'));
const byUnit = new Map(qa.units.map(unit => [unit.unit_id, unit]));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
for (const id of ['OLP-0380', 'OLP-0381', 'OLP-0382']) {
  const unit = byUnit.get(id);
  const target = path.join(root, 'translation', unit?.source_path ?? 'missing');
  if (!unit || !unit.structure_match || !unit.token_parity ||
      !unit.paragraph_alignment || unit.translation_sha256 !== sha(fs.readFileSync(target))) {
    throw new Error('Batch 057 structural diagnostic missing or stale ' + id);
  }
}
const min = byUnit.get('OLP-0380'), par = byUnit.get('OLP-0381'), ldr = byUnit.get('OLP-0382');
if (min.math_delta_source_only.length !== 3 || min.math_delta_target_only.length !== 3 ||
    par.math_delta_source_only.length || par.math_delta_target_only.length ||
    ldr.math_delta_source_only.length || ldr.math_delta_target_only.length ||
    ldr.protected_identifier_delta_source_only.join() !== '\\olfileid{lam}{dfl}{ldr}' ||
    ldr.protected_identifier_delta_target_only.join() !== '\\olfileid{lam}{ldf}{ldr}') {
  throw new Error('Unexpected Batch 057 formula or identifier delta');
}
const pick = (array, prefix) => {
  const matches = array.filter(value => value.startsWith(prefix));
  if (matches.length !== 1) throw new Error('Unexpected formula delta ' + prefix);
  return matches[0];
};
const sourceResult = pick(min.math_delta_source_only, '\\begin{align*}(Y');
const targetResult = pick(min.math_delta_target_only, '\\begin{align*}(Y');
const sourceSearch = pick(min.math_delta_source_only, '\\begin{align*}\\fn{Search}');
const targetSearch = pick(min.math_delta_target_only, '\\begin{align*}\\fn{Search}');
if (!sourceResult.includes('\\num{h(n_1,\\dots,n_k)}') ||
    !targetResult.includes('\\num{g(n_1,\\dots,n_k)}') ||
    !sourceSearch.includes('(g\\,\\vec{x}(\\fn{Succ}\\,y)]]') ||
    !targetSearch.includes('(g\\,f\\,\\vec{x}(\\fn{Succ}\\,y))]]') ||
    !min.math_delta_source_only.includes('$h$') || !min.math_delta_target_only.includes('$g$')) {
  throw new Error('Formula changes are not the audited source repairs');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const rows = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split(/\r?\n/u).map(JSON.parse);
const own = rows.filter(row => row.audit_id === 'OLTELAMLDFEND-20260926');
if (own.length !== 4) throw new Error('Unexpected Batch 057 correction row count');
const byId = new Map(own.map(row => [row.finding_id, row]));
const set = (id, sourceOnly, targetOnly, protectedSource = [], protectedTarget = []) => {
  const row = byId.get(id);
  if (!row) throw new Error('Missing correction ' + id);
  row.expected_core_math_delta = {source_only: sourceOnly, target_only: targetOnly};
  row.expected_protected_identifier_delta = {source_only: protectedSource, target_only: protectedTarget};
  if (process.argv.includes('--confirm')) row.status = 'applied_qa_pass';
};
set('OLTELAMLDFMIN-001', ['$h$', sourceResult], ['$g$', targetResult]);
set('OLTELAMLDFMIN-002', [sourceSearch], [targetSearch]);
set('OLTELAMLDFMIN-003', [], []);
set('OLTELAMLDFLDR-001', [], [],
  ['\\olfileid{lam}{dfl}{ldr}'], ['\\olfileid{lam}{ldf}{ldr}']);
if (process.argv.includes('--confirm') &&
    qa.units.some(unit => !unit.math_multiset_match || !unit.math_declared_source_correction_match ||
      !unit.protected_identifier_parity || !unit.protected_identifier_declared_source_correction_match ||
      unit.unicode_replacement_char || unit.unpaired_surrogate)) {
  throw new Error('Cannot confirm unsuccessful structural QA');
}
fs.writeFileSync(ledgerPath, rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
console.log(JSON.stringify({status: process.argv.includes('--confirm') ? 'applied_qa_pass' : 'adjudicated_pending_qa',
  findings: own.length, source_only_math: min.math_delta_source_only.length,
  target_only_math: min.math_delta_target_only.length, protected_id_delta: 1}));
