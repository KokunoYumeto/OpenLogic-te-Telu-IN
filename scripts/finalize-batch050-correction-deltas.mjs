import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = 'content/lambda-calculus/church-rosser/parallel-beta-reduction.tex';
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-050-STRUCTURAL-QA.json'), 'utf8'))
  .units.find(unit => unit.unit_id === 'OLP-0369');
if (!qa) throw new Error('Batch 050 diagnostic has no OLP-0369 unit');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'upstream', sourcePath));
const target = fs.readFileSync(path.join(root, 'translation', sourcePath));
const sourceOnly = [
  "$N\\xrightarrow{\\beta}N'$",
  "$\\lambd[x][\\Subst{N}{R}{y}]\\bredpar\\lambd[x][\\Subst{N'}{R}{y}]$",
];
const targetOnly = [
  "$N\\bredparN'$",
  "$\\lambd[x][\\Subst{N}{R}{y}]\\bredpar\\lambd[x][\\Subst{N'}{R'}{y}]$",
];
if (qa.source_sha256 !== sha(source) || qa.translation_sha256 !== sha(target) ||
    !qa.paragraph_alignment || !qa.structure_match || !qa.token_parity ||
    !qa.protected_identifier_parity ||
    JSON.stringify(qa.math_delta_source_only) !== JSON.stringify(sourceOnly) ||
    JSON.stringify(qa.math_delta_target_only) !== JSON.stringify(targetOnly)) {
  throw new Error('Current Batch 050 math diagnostic differs from adjudicated corrections');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
let found = 0, changed = 0;
const updated = lines.map(line => {
  const row = JSON.parse(line);
  if (row.audit_id !== 'OLTELAMCRPB-20260925') return line;
  found += 1;
  if (row.unit_id !== 'OLP-0369' || row.source_sha256 !== sha(source)) {
    throw new Error('Correction identity mismatch');
  }
  const index = Number(row.finding_id.slice(-3)) - 1;
  if (![0, 1, 2].includes(index)) throw new Error('Unexpected Batch 050 finding');
  row.expected_core_math_delta = index < 2
    ? {source_only: [sourceOnly[index]], target_only: [targetOnly[index]]}
    : {source_only: [], target_only: []};
  row.status = index === 2 ? 'source_proof_gap_disclosed_structural_qa_pass' : 'applied_qa_pass';
  const next = JSON.stringify(row);
  if (next !== line) changed += 1;
  return next;
});
if (found !== 3) throw new Error('Expected three Batch 050 corrections');
if (changed) fs.writeFileSync(ledgerPath, updated.join('\n') + '\n', 'utf8');
console.log(JSON.stringify({status: changed ? 'updated' : 'pass_idempotent', changed,
  source_sha256: sha(source), translation_sha256: sha(target)}));
