import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = 'content/lambda-calculus/syntax/eta.tex';
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-048-STRUCTURAL-QA.json'), 'utf8'))
  .units.find(unit => unit.unit_id === 'OLP-0366');
if (!qa) throw new Error('Batch 048 diagnostic has no OLP-0366 unit');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'upstream', sourcePath));
const target = fs.readFileSync(path.join(root, 'translation', sourcePath));
const sourceOnly = ['$\\equal[ext]$', '$ext$'].sort();
const targetOnly = ['$\\equal[\\ext]$', '$\\ext$', '$f$', '$x$', '$x\\notinFV(f)$'].sort();
if (qa.source_sha256 !== sha(source) || qa.translation_sha256 !== sha(target) ||
    !qa.paragraph_alignment || !qa.structure_match || !qa.token_parity ||
    !qa.protected_identifier_parity ||
    JSON.stringify(qa.math_delta_source_only) !== JSON.stringify(sourceOnly) ||
    JSON.stringify(qa.math_delta_target_only) !== JSON.stringify(targetOnly)) {
  throw new Error('Current Batch 048 math diagnostic differs from two adjudicated source corrections');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
let found = 0, changed = 0;
const updated = lines.map(line => {
  const row = JSON.parse(line);
  if (row.audit_id !== 'OLTELAMETA-20260925') return line;
  const first = row.finding_id === 'OLTELAMETA-001';
  if (!first && row.finding_id !== 'OLTELAMETA-002') throw new Error('Unexpected Batch 048 finding');
  found += 1;
  if (row.unit_id !== 'OLP-0366' || row.source_sha256 !== sha(source)) throw new Error('Correction identity mismatch');
  row.target_locator = `translation/${sourcePath}:${first ? 48 : 79}`;
  row.expected_core_math_delta = first
    ? {source_only: [], target_only: ['$f$', '$x$', '$x\\notinFV(f)$']}
    : {source_only: sourceOnly, target_only: ['$\\equal[\\ext]$', '$\\ext$']};
  row.status = 'applied_qa_pass';
  const next = JSON.stringify(row);
  if (next !== line) changed += 1;
  return next;
});
if (found !== 2) throw new Error('Expected exactly two Batch 048 corrections');
if (changed) fs.writeFileSync(ledgerPath, updated.join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({status: changed ? 'updated' : 'pass_idempotent', changed,
  source_sha256: sha(source), translation_sha256: sha(target)}) + '\n');
