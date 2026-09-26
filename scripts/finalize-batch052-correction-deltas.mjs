import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-052-STRUCTURAL-QA.json'), 'utf8'));
const expected = new Map([
  ['OLP-0371', {
    source_only: ["$N\\xrightarrow{\\beta}N'$"],
    target_only: ["$N\\beredparN'$"],
    finding: 'OLTELAMCRPBE-001',
  }],
  ['OLP-0372', {
    source_only: ["$M\\bredoneM'$"],
    target_only: ["$M\\eredoneM'$"],
    finding: 'OLTELAMCRBE-002',
  }],
]);
if (qa.units.length !== 2) throw new Error('Unexpected diagnostic scope');
for (const unit of qa.units) {
  const delta = expected.get(unit.unit_id);
  const manifest = fs.readFileSync(path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl'), 'utf8')
    .trim().split(/\r?\n/u).map(JSON.parse).find(row => row.unit_id === unit.unit_id);
  if (!delta || !manifest ||
      unit.source_sha256 !== sha(fs.readFileSync(path.join(root, 'upstream', manifest.source_path))) ||
      unit.translation_sha256 !== sha(fs.readFileSync(path.join(root, 'translation', manifest.source_path))) ||
      !unit.paragraph_alignment || !unit.structure_match || !unit.token_parity ||
      !unit.protected_identifier_parity ||
      JSON.stringify(unit.math_delta_source_only) !== JSON.stringify(delta.source_only) ||
      JSON.stringify(unit.math_delta_target_only) !== JSON.stringify(delta.target_only)) {
    throw new Error('Current math diagnostic differs from adjudicated Batch 052 changes: ' + unit.unit_id);
  }
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split(/\r?\n/u);
let found = 0, changed = 0;
const updated = lines.map(line => {
  const row = JSON.parse(line);
  if (row.audit_id !== 'OLTELAMCRBE-20260926') return line;
  found += 1;
  const unit = qa.units.find(item => item.unit_id === row.unit_id);
  if (!unit || row.source_sha256 !== unit.source_sha256) throw new Error('Correction identity mismatch');
  const delta = expected.get(row.unit_id);
  row.expected_core_math_delta = row.finding_id === delta.finding
    ? {source_only: delta.source_only, target_only: delta.target_only}
    : {source_only: [], target_only: []};
  row.status = row.finding_id === 'OLTELAMCRPBE-001'
    ? 'applied_qa_pass'
    : 'source_proof_gap_disclosed_structural_qa_pass';
  const next = JSON.stringify(row);
  if (next !== line) changed += 1;
  return next;
});
if (found !== 9) throw new Error('Expected nine Batch 052 findings');
if (changed) fs.writeFileSync(ledgerPath, updated.join('\n') + '\n', 'utf8');
console.log(JSON.stringify({status: changed ? 'updated' : 'pass_idempotent', changed,
  qa_units: qa.units.map(unit => unit.unit_id)}));
