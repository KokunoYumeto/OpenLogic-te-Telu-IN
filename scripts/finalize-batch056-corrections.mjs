import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-056-STRUCTURAL-QA.json'), 'utf8'));
const record = qa.units.find(unit => unit.unit_id === 'OLP-0379');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const targetPath = path.join(root, 'translation', 'content', 'lambda-calculus',
  'lambda-definability', 'fixpoints.tex');
if (!record || record.source_blocks !== 18 || record.target_blocks !== 18 ||
    !record.structure_match || !record.token_parity || !record.protected_identifier_parity ||
    record.translation_sha256 !== sha(fs.readFileSync(targetPath))) {
  throw new Error('Batch 056 structural diagnostic missing or stale');
}
const source = record.math_delta_source_only, target = record.math_delta_target_only;
if (source.length !== 4 || target.length !== 4 ||
    !source.includes('$Yg\\bredg(Yg)$') || !source.includes('$Yg\\equal[\\beta]g(Yg)$') ||
    !target.includes('$Y_Cg\\bredg(Y_Cg)$') || !target.includes('$Y_Cg\\equal[\\beta]g(Y_Cg)$')) {
  throw new Error('Unexpected inline fixpoint comparison delta');
}
const pick = (arr, prefix) => {
  const matches = arr.filter(value => value.startsWith(prefix));
  if (matches.length !== 1) throw new Error('Unexpected formula delta ' + prefix);
  return matches[0];
};
const sourceMult = pick(source, '\\[\\fn{Mult}');
const targetMult = pick(target, '\\[\\fn{Mult}');
const sourceFac = pick(source, '\\begin{align*}\\fn{Fac}');
const targetFac = pick(target, '\\begin{align*}\\fn{Fac}');
if (!sourceMult.includes('(\\fn{Add}\\,a)0') || !targetMult.includes('(\\fn{Add}\\,b)\\num{0}') ||
    !sourceFac.includes('\\lambd[n][\\fn{IsZero}') || !targetFac.includes('\\lambd[n].\\fn{IsZero}')) {
  throw new Error('Formula changes are not the audited source repairs');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const rows = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split(/\r?\n/u).map(JSON.parse);
const own = rows.filter(row => row.audit_id === 'OLTELAMLDFPIX-20260926');
if (own.length !== 5) throw new Error('Unexpected correction row count');
const byId = new Map(own.map(row => [row.finding_id, row]));
const set = (suffix, sourceOnly, targetOnly) => {
  const row = byId.get('OLTELAMLDFPIX-' + suffix);
  if (!row) throw new Error('Missing correction ' + suffix);
  row.expected_core_math_delta = {source_only: sourceOnly, target_only: targetOnly};
  if (process.argv.includes('--confirm')) row.status = 'applied_qa_pass';
};
set('001', [sourceMult], [targetMult]);
set('002', [sourceFac], [targetFac]);
set('003', [], []);
set('004', [], []);
set('005', ['$Yg\\bredg(Yg)$', '$Yg\\equal[\\beta]g(Yg)$'],
  ['$Y_Cg\\bredg(Y_Cg)$', '$Y_Cg\\equal[\\beta]g(Y_Cg)$']);
if (process.argv.includes('--confirm') &&
    (!record.math_multiset_match || !record.math_declared_source_correction_match ||
     !record.paragraph_alignment || record.unicode_replacement_char || record.unpaired_surrogate)) {
  throw new Error('Cannot confirm unsuccessful structural QA');
}
fs.writeFileSync(ledgerPath, rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
console.log(JSON.stringify({status: process.argv.includes('--confirm') ? 'applied_qa_pass' : 'adjudicated_pending_qa',
  findings: own.length, source_only: source.length, target_only: target.length}));
