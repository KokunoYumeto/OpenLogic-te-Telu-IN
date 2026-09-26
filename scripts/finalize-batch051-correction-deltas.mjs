import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = 'content/lambda-calculus/church-rosser/beta-reduction.tex';
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-051-STRUCTURAL-QA.json'), 'utf8'))
  .units.find(unit => unit.unit_id === 'OLP-0370');
if (!qa) throw new Error('Batch 051 diagnostic has no OLP-0370 unit');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'upstream', sourcePath));
const target = fs.readFileSync(path.join(root, 'translation', sourcePath));
const sourceOnly = ["$M'$"], targetOnly = ["$N'$"];
if (qa.source_sha256 !== sha(source) || qa.translation_sha256 !== sha(target) ||
    !qa.paragraph_alignment || !qa.structure_match || !qa.token_parity ||
    !qa.protected_identifier_parity ||
    JSON.stringify(qa.math_delta_source_only) !== JSON.stringify(sourceOnly) ||
    JSON.stringify(qa.math_delta_target_only) !== JSON.stringify(targetOnly)) {
  throw new Error('Current Batch 051 math diagnostic differs from adjudicated witness-list correction');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
let found = 0, changed = 0;
const updated = lines.map(line => {
  const row = JSON.parse(line);
  if (row.audit_id !== 'OLTELAMCRB-20260925') return line;
  found += 1;
  if (row.unit_id !== 'OLP-0370' || row.source_sha256 !== sha(source)) {
    throw new Error('Correction identity mismatch');
  }
  const index = Number(row.finding_id.slice(-3)) - 1;
  if (![0, 1, 2].includes(index)) throw new Error('Unexpected Batch 051 finding');
  row.expected_core_math_delta = index === 1
    ? {source_only: sourceOnly, target_only: targetOnly}
    : {source_only: [], target_only: []};
  row.status = index === 1 ? 'applied_qa_pass' : 'source_proof_gap_disclosed_structural_qa_pass';
  const next = JSON.stringify(row);
  if (next !== line) changed += 1;
  return next;
});
if (found !== 3) throw new Error('Expected three Batch 051 findings');
if (changed) fs.writeFileSync(ledgerPath, updated.join('\n') + '\n', 'utf8');
console.log(JSON.stringify({status: changed ? 'updated' : 'pass_idempotent', changed,
  source_sha256: sha(source), translation_sha256: sha(target)}));
