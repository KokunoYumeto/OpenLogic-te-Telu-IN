import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-047-STRUCTURAL-QA.json'), 'utf8'))
  .units.find(unit => unit.unit_id === 'OLP-0365');
if (!qa) throw new Error('Batch 047 diagnostic has no OLP-0365 unit');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'upstream', qa.source_path));
const target = fs.readFileSync(path.join(root, 'translation', qa.source_path));
if (qa.source_sha256 !== sha(source) || qa.translation_sha256 !== sha(target) ||
    !qa.paragraph_alignment || !qa.structure_match || !qa.token_parity ||
    !qa.protected_identifier_parity || !qa.math_multiset_match || !qa.math_exact_multiset_match ||
    JSON.stringify(qa.protected_identifier_delta_source_only) !== '["\\\\olfileid{lam}{int}{bet}"]' ||
    JSON.stringify(qa.protected_identifier_delta_target_only) !== '["\\\\olfileid{lam}{syn}{bet}"]') {
  throw new Error('Current Batch 047 diagnostic does not match the declared single identifier repair');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
let changed = 0;
let found = 0;
const updated = lines.map(line => {
  const row = JSON.parse(line);
  if (row.finding_id !== 'OLTELAMBETA-001') return line;
  found += 1;
  if (row.audit_id !== 'OLTELAMBETA-20260925' || row.unit_id !== 'OLP-0365' ||
      JSON.stringify(row.expected_core_math_delta) !== '{"source_only":[],"target_only":[]}' ||
      JSON.stringify(row.expected_protected_identifier_delta.source_only) !== JSON.stringify(qa.protected_identifier_delta_source_only) ||
      JSON.stringify(row.expected_protected_identifier_delta.target_only) !== JSON.stringify(qa.protected_identifier_delta_target_only)) {
    throw new Error('Unexpected correction identity or allocation');
  }
  row.status = 'applied_qa_pass';
  const next = JSON.stringify(row);
  if (next !== line) changed += 1;
  return next;
});
if (found !== 1) throw new Error('Expected exactly one Batch 047 correction');
if (changed) fs.writeFileSync(ledgerPath, updated.join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({status: changed ? 'updated' : 'pass_idempotent', changed,
  source_sha256: sha(source), translation_sha256: sha(target)}) + '\n');
