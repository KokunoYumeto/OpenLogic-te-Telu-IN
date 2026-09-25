import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = 'content/lambda-calculus/church-rosser/definitions-and-properties.tex';
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-049-STRUCTURAL-QA.json'), 'utf8'))
  .units.find(unit => unit.unit_id === 'OLP-0368');
if (!qa) throw new Error('Batch 049 diagnostic has no OLP-0368 unit');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'upstream', sourcePath));
const target = fs.readFileSync(path.join(root, 'translation', sourcePath));
const sourceOnly = ['$P$', '$Q$'];
const targetOnly = ['$P_m$', '$Q_n$'];
if (qa.source_sha256 !== sha(source) || qa.translation_sha256 !== sha(target) ||
    !qa.paragraph_alignment || !qa.structure_match || !qa.token_parity ||
    !qa.protected_identifier_parity ||
    JSON.stringify(qa.math_delta_source_only) !== JSON.stringify(sourceOnly) ||
    JSON.stringify(qa.math_delta_target_only) !== JSON.stringify(targetOnly)) {
  throw new Error('Current Batch 049 math diagnostic differs from adjudicated endpoint repair');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
let found = 0, changed = 0;
const updated = lines.map(line => {
  const row = JSON.parse(line);
  if (row.audit_id !== 'OLTELAMCRDAP-20260925') return line;
  const first = row.finding_id === 'OLTELAMCRDAP-001';
  if (!first && row.finding_id !== 'OLTELAMCRDAP-002') throw new Error('Unexpected Batch 049 finding');
  found += 1;
  if (row.unit_id !== 'OLP-0368' || row.source_sha256 !== sha(source)) throw new Error('Correction identity mismatch');
  row.expected_core_math_delta = first
    ? {source_only: [], target_only: []}
    : {source_only: sourceOnly, target_only: targetOnly};
  row.status = 'applied_qa_pass';
  const next = JSON.stringify(row);
  if (next !== line) changed += 1;
  return next;
});
if (found !== 2) throw new Error('Expected exactly two Batch 049 corrections');
if (changed) fs.writeFileSync(ledgerPath, updated.join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({status: changed ? 'updated' : 'pass_idempotent', changed,
  source_sha256: sha(source), translation_sha256: sha(target)}) + '\n');
