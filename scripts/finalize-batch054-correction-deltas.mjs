import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-054-STRUCTURAL-QA.json'), 'utf8'));
const byUnit = new Map(qa.units.map(unit => [unit.unit_id, unit]));
if (byUnit.size !== 2 || [...byUnit.keys()].join(',') !== 'OLP-0376,OLP-0377') {
  throw new Error('Unexpected Batch 054 diagnostic scope');
}
const manifest = fs.readFileSync(path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl'), 'utf8')
  .trim().split(/\r?\n/u).map(JSON.parse);
for (const unit of qa.units) {
  const row = manifest.find(item => item.unit_id === unit.unit_id);
  if (!row || unit.source_sha256 !== sha(fs.readFileSync(path.join(root, 'upstream', row.source_path))) ||
      unit.translation_sha256 !== sha(fs.readFileSync(path.join(root, 'translation', row.source_path))) ||
      !unit.paragraph_alignment || !unit.structure_match || !unit.token_parity ||
      !unit.protected_identifier_parity || unit.unicode_replacement_char || unit.unpaired_surrogate) {
    throw new Error('Current diagnostic identity or non-math QA failure: ' + unit.unit_id);
  }
}
const pairs = byUnit.get('OLP-0376');
if (pairs.math_delta_source_only.length || pairs.math_delta_target_only.length) {
  throw new Error('Pairs math changed unexpectedly');
}
const truth = byUnit.get('OLP-0377');
const sourceOnly = ['$R\\subseteq\\Nat^n$'];
const targetOnly = ['$R\\subseteq\\Nat^k$'];
if (JSON.stringify(truth.math_delta_source_only) !== JSON.stringify(sourceOnly) ||
    JSON.stringify(truth.math_delta_target_only) !== JSON.stringify(targetOnly)) {
  throw new Error('Truth-value math delta differs from audited arity repair');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split(/\r?\n/u);
let found = 0, changed = 0;
const updated = lines.map(line => {
  const row = JSON.parse(line);
  if (row.audit_id !== 'OLTELAMLDFPAIRTRUTH-20260926') return line;
  found += 1;
  if (row.finding_id !== 'OLTELAMLDFTVR-001' || row.unit_id !== 'OLP-0377' ||
      row.source_sha256 !== truth.source_sha256) throw new Error('Correction identity mismatch');
  row.expected_core_math_delta = {source_only: sourceOnly, target_only: targetOnly};
  row.status = 'applied_qa_pass';
  const next = JSON.stringify(row);
  if (next !== line) changed += 1;
  return next;
});
if (found !== 1) throw new Error('Expected one Batch 054 finding');
if (changed) fs.writeFileSync(ledgerPath, updated.join('\n') + '\n', 'utf8');
console.log(JSON.stringify({status: changed ? 'updated' : 'pass_idempotent', changed,
  qa_units: qa.units.map(unit => unit.unit_id)}));
