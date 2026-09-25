import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-046-STRUCTURAL-QA.json'), 'utf8'))
  .units.find(unit => unit.unit_id === 'OLP-0364');
if (!qa) throw new Error('Batch 046 diagnostic has no OLP-0364 unit');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'upstream', qa.source_path));
const target = fs.readFileSync(path.join(root, 'translation', qa.source_path));
if (qa.source_sha256 !== sha(source) || qa.translation_sha256 !== sha(target) ||
    !qa.paragraph_alignment || !qa.structure_match || !qa.token_parity ||
    !qa.protected_identifier_parity || !qa.math_multiset_match ||
    qa.math_delta_source_only.length || qa.math_delta_target_only.length) {
  throw new Error('Current Batch 046 diagnostic or math parity does not match exact source and translation');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
const ids = new Set(['OLTELAMTR-001', 'OLTELAMTR-002']);
let changed = 0;
let found = 0;
const updated = lines.map(line => {
  const row = JSON.parse(line);
  if (!ids.has(row.finding_id)) return line;
  found += 1;
  if (row.audit_id !== 'OLTELAMTR-20260925' || row.unit_id !== 'OLP-0364' ||
      JSON.stringify(row.expected_core_math_delta) !== '{"source_only":[],"target_only":[]}') {
    throw new Error('Unexpected correction identity or allocation');
  }
  row.status = 'applied_qa_pass';
  const next = JSON.stringify(row);
  if (next !== line) changed += 1;
  return next;
});
if (found !== 2) throw new Error('Expected both Batch 046 corrections');
if (changed) fs.writeFileSync(ledgerPath, updated.join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({status: changed ? 'updated' : 'pass_idempotent', changed,
  source_only: 0, target_only: 0, source_sha256: sha(source), translation_sha256: sha(target)}) + '\n');
