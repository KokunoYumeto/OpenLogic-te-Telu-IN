import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-044-STRUCTURAL-QA.json'), 'utf8'))
  .units.find(unit => unit.unit_id === 'OLP-0363');
if (!qa) throw new Error('Batch 044 diagnostic has no OLP-0363 unit');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'upstream', qa.source_path));
const target = fs.readFileSync(path.join(root, 'translation', qa.source_path));
if (qa.source_sha256 !== sha(source) || qa.translation_sha256 !== sha(target) ||
    !qa.paragraph_alignment || !qa.structure_match || !qa.token_parity || !qa.protected_identifier_parity) {
  throw new Error('Current Batch 044 diagnostic does not match exact source and translation');
}
const sourceOnly = qa.math_delta_source_only;
const targetOnly = qa.math_delta_target_only;
const allocation = {
  'OLTELAMDEB-001': {
    source_only: ['$\\lambd[][\\lambd[][01]]$'],
    target_only: ['$\\lambd[][\\lambd[][0\\,1]]$'],
  },
  'OLTELAMDEB-002': {source_only: [], target_only: []},
  'OLTELAMDEB-003': {
    source_only: [],
    target_only: ['$G_\\Gamma(n)$', '$n$'],
  },
};
const sorted = atoms => [...atoms].sort();
if (JSON.stringify(sorted(Object.values(allocation).flatMap(row => row.source_only))) !== JSON.stringify(sorted(sourceOnly)) ||
    JSON.stringify(sorted(Object.values(allocation).flatMap(row => row.target_only))) !== JSON.stringify(sorted(targetOnly))) {
  throw new Error('Unexpected or unallocated math delta');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
let changed = 0;
const updated = lines.map(line => {
  const row = JSON.parse(line);
  if (!Object.hasOwn(allocation, row.finding_id)) return line;
  if (row.audit_id !== 'OLTELAMDEB-20260925' || row.unit_id !== 'OLP-0363') {
    throw new Error('Unexpected correction identity');
  }
  row.expected_core_math_delta = allocation[row.finding_id];
  row.status = 'applied_qa_pass';
  const next = JSON.stringify(row);
  if (next !== line) changed += 1;
  return next;
});
if (updated.filter(line => line.includes('"audit_id":"OLTELAMDEB-20260925"')).length !== 3) {
  throw new Error('Expected three Batch 044 corrections');
}
if (changed) fs.writeFileSync(ledgerPath, updated.join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({
  status: changed ? 'updated' : 'pass_idempotent', changed,
  source_only: sourceOnly.length, target_only: targetOnly.length,
  source_sha256: sha(source), translation_sha256: sha(target),
}) + '\n');
