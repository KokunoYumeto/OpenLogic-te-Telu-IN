import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-043-STRUCTURAL-QA.json'), 'utf8'))
  .units.find(unit => unit.unit_id === 'OLP-0362');
if (!qa) throw new Error('Batch 043 diagnostic has no OLP-0362 unit');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'upstream', qa.source_path));
const target = fs.readFileSync(path.join(root, 'translation', qa.source_path));
if (qa.source_sha256 !== sha(source) || qa.translation_sha256 !== sha(target) ||
    !qa.paragraph_alignment || !qa.structure_match || !qa.token_parity || !qa.protected_identifier_parity) {
  throw new Error('Current Batch 043 diagnostic does not match exact source and translation');
}
const sourceOnly = [...qa.math_delta_source_only];
const targetOnly = [...qa.math_delta_target_only];
if (sourceOnly.length !== 8 || targetOnly.length !== 11) throw new Error('Unexpected correction-aware math delta count');
const take = (items, predicate) => {
  const index = items.findIndex(predicate);
  if (index < 0) throw new Error('Missing expected math delta');
  return items.splice(index, 1)[0];
};
const sourceOne = value => take(sourceOnly, atom => atom === value);
const targetOne = value => take(targetOnly, atom => atom === value);
const allocation = {
  'OLTELAMALP-001': {
    source_only: [],
    target_only: [targetOne('$x\\neqy$')],
  },
  'OLTELAMALP-002': {source_only: [], target_only: []},
  'OLTELAMALP-003': {
    source_only: [
      sourceOne('$x\\inFV(N)$'), sourceOne('$x\\notinFV(N)$'),
      take(sourceOnly, atom => atom.startsWith('\\begin{align*}')),
    ],
    target_only: [
      targetOne('$x\\in\\FV{N}$'), targetOne('$x\\notin\\FV{N}$'),
      targetOne('$x\\notin\\FV{N}$'), targetOne('$y\\notin\\FV{N}$'),
      take(targetOnly, atom => atom.startsWith('\\begin{align*}')),
    ],
  },
  'OLTELAMALP-004': {
    source_only: [sourceOne('$y\\notin\\FV{\\Subst{N}{y}{x}}$')],
    target_only: [targetOne('$x\\notin\\FV{\\Subst{N}{y}{x}}$')],
  },
  'OLTELAMALP-005': {
    source_only: [sourceOne("$z\\notinFV(N')$"), sourceOne('$z\\notinFV(R)$')],
    target_only: [targetOne("$z\\notin\\FV{N'}$"), targetOne('$z\\notin\\FV{R}$')],
  },
  'OLTELAMALP-006': {source_only: [], target_only: []},
  'OLTELAMALP-007': {
    source_only: [sourceOne("$R''$"), sourceOne("$\\Subst{M'}{R'}{y}$")],
    target_only: [targetOne("$R''\\aeqR$"), targetOne("$\\Subst{M''}{R''}{y}$")],
  },
};
if (sourceOnly.length || targetOnly.length) throw new Error('Unallocated math deltas');
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
let changed = 0;
const updated = lines.map(line => {
  const row = JSON.parse(line);
  if (!Object.hasOwn(allocation, row.finding_id)) return line;
  if (row.audit_id !== 'OLTELAMALP-20260925' || row.unit_id !== 'OLP-0362') {
    throw new Error('Unexpected correction identity');
  }
  row.expected_core_math_delta = allocation[row.finding_id];
  row.status = 'applied_qa_pass';
  const next = JSON.stringify(row);
  if (next !== line) changed += 1;
  return next;
});
if (updated.filter(line => line.includes('"audit_id":"OLTELAMALP-20260925"')).length !== 7) {
  throw new Error('Expected seven Batch 043 corrections');
}
if (changed) fs.writeFileSync(ledgerPath, updated.join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({
  status: changed ? 'updated' : 'pass_idempotent', changed,
  source_only: qa.math_delta_source_only.length,
  target_only: qa.math_delta_target_only.length,
  source_sha256: sha(source), translation_sha256: sha(target),
}) + '\n');
