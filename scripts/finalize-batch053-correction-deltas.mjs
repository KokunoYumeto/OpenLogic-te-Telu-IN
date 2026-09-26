import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-053-STRUCTURAL-QA.json'), 'utf8'));
const byUnit = new Map(qa.units.map(unit => [unit.unit_id, unit]));
if (byUnit.size !== 3 || [...byUnit.keys()].join(',') !== 'OLP-0373,OLP-0374,OLP-0375') {
  throw new Error('Unexpected diagnostic scope');
}
const manifest = fs.readFileSync(path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl'), 'utf8')
  .trim().split(/\r?\n/u).map(JSON.parse);
for (const unit of qa.units) {
  const row = manifest.find(item => item.unit_id === unit.unit_id);
  if (!row || unit.source_sha256 !== sha(fs.readFileSync(path.join(root, 'upstream', row.source_path))) ||
      unit.translation_sha256 !== sha(fs.readFileSync(path.join(root, 'translation', row.source_path))) ||
      !unit.paragraph_alignment || !unit.structure_match || !unit.token_parity || !unit.protected_identifier_parity) {
    throw new Error('Current diagnostic identity or non-math QA failure: ' + unit.unit_id);
  }
}
const intro = byUnit.get('OLP-0374');
if (JSON.stringify(intro.math_delta_source_only) !== JSON.stringify(['$c(n)=k$']) ||
    JSON.stringify(intro.math_delta_target_only) !== JSON.stringify(['$c_k(n)=k$'])) {
  throw new Error('Constant-function math delta differs from the audited subscript repair');
}
const arithmetic = byUnit.get('OLP-0375');
if (arithmetic.math_delta_source_only.length !== 3 || arithmetic.math_delta_target_only.length !== 3) {
  throw new Error('Unexpected arithmetic math delta count');
}
const sourceInline = '$\\num{n}fx\\redonef^nx$';
const targetInline = '$\\num{n}fx\\redf^nx$';
const sourceMult = "\\[\\fn{Mult}'\\ident\\lambd[ab][a(\\fn{Add}\\,a)\\num{0}].\\]";
const targetMult = "\\[\\fn{Mult}'\\ident\\lambd[ab][a(\\fn{Add}\\,b)\\num{0}].\\]";
const sourceAdd = arithmetic.math_delta_source_only.find(atom => atom.startsWith('\\begin{align*}'));
const targetAdd = arithmetic.math_delta_target_only.find(atom => atom.startsWith('\\begin{align*}'));
if (!sourceAdd || !targetAdd ||
    sourceAdd.split('\\redone').length - 1 !== 4 ||
    sourceAdd.replaceAll('\\redone', '\\red') !== targetAdd ||
    !arithmetic.math_delta_source_only.includes(sourceInline) ||
    !arithmetic.math_delta_target_only.includes(targetInline) ||
    !arithmetic.math_delta_source_only.includes(sourceMult) ||
    !arithmetic.math_delta_target_only.includes(targetMult)) {
  throw new Error('Arithmetic math deltas differ from the audited arrow and multiplication repairs');
}
const deltas = new Map([
  ['OLTELAMLDFI-001', {source_only: ['$c(n)=k$'], target_only: ['$c_k(n)=k$']}],
  ['OLTELAMLDFARF-001', {source_only: [sourceInline], target_only: [targetInline]}],
  ['OLTELAMLDFARF-002', {source_only: [sourceAdd], target_only: [targetAdd]}],
  ['OLTELAMLDFARF-003', {source_only: [sourceMult], target_only: [targetMult]}],
]);
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split(/\r?\n/u);
let found = 0, changed = 0;
const updated = lines.map(line => {
  const row = JSON.parse(line);
  if (row.audit_id !== 'OLTELAMLDF-20260926') return line;
  found += 1;
  const unit = byUnit.get(row.unit_id);
  const delta = deltas.get(row.finding_id);
  if (!unit || !delta || row.source_sha256 !== unit.source_sha256) throw new Error('Correction identity mismatch');
  row.expected_core_math_delta = delta;
  row.status = 'applied_qa_pass';
  const next = JSON.stringify(row);
  if (next !== line) changed += 1;
  return next;
});
if (found !== 4) throw new Error('Expected four Batch 053 findings');
if (changed) fs.writeFileSync(ledgerPath, updated.join('\n') + '\n', 'utf8');
console.log(JSON.stringify({status: changed ? 'updated' : 'pass_idempotent', changed,
  qa_units: qa.units.map(unit => unit.unit_id)}));
