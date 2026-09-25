import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const qa = JSON.parse(fs.readFileSync(path.join(root, 'build', 'BATCH-042-STRUCTURAL-QA.json'), 'utf8'))
  .units.find(unit => unit.unit_id === 'OLP-0361');
if (!qa) throw new Error('Batch 042 diagnostic has no OLP-0361 unit');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'upstream', qa.source_path));
const target = fs.readFileSync(path.join(root, 'translation', qa.source_path));
if (qa.unit_id !== 'OLP-0361' || qa.source_sha256 !== sha(source) ||
    qa.translation_sha256 !== sha(target) ||
    !qa.paragraph_alignment || !qa.structure_match || !qa.token_parity || !qa.protected_identifier_parity) {
  throw new Error('Current Batch 042 diagnostic does not match the exact source and translation');
}
const sourceOnly = qa.math_delta_source_only;
const targetOnly = qa.math_delta_target_only;
if (sourceOnly.length !== 6 || targetOnly.length !== 8) throw new Error('Unexpected correction-aware math delta count');
const one = (items, predicate) => {
  const matches = items.filter(predicate);
  if (matches.length !== 1) throw new Error('Expected exactly one matching math atom');
  return matches[0];
};
const allocation = {
  'OLTELAMSUB-001': { source_only: [], target_only: [] },
  'OLTELAMSUB-002': { source_only: [], target_only: [] },
  'OLTELAMSUB-003': {
    source_only: [one(sourceOnly, value => value === '$x\\notin\\FV{Q}$')],
    target_only: [
      one(targetOnly, value => value === '$x\\notin\\FV{P}$'),
      one(targetOnly, value => value === '$x\\notin\\FV{\\lambd[y][P]}$'),
    ],
  },
  'OLTELAMSUB-004': {
    source_only: [one(sourceOnly, value => value === '$x\\in\\FV{M})$')],
    target_only: [one(targetOnly, value => value === '$x\\in\\FV{M}$')],
  },
  'OLTELAMSUB-005': {
    source_only: [one(sourceOnly, value => value === '$\\Subst{(PQ)}{N}{y}$')],
    target_only: [one(targetOnly, value => value === '$\\Subst{(PQ)}{N}{x}$')],
  },
  'OLTELAMSUB-006': {
    source_only: [
      one(sourceOnly, value => value === '$y\\in\\FV{P}$'),
      one(sourceOnly, value => value === '$y\\in\\FV{\\lambd[x][P]}$'),
    ],
    target_only: [
      one(targetOnly, value => value === '$x\\in\\FV{P}$'),
      one(targetOnly, value => value === '$x\\in\\FV{\\lambd[y][P]}$'),
    ],
  },
  'OLTELAMSUB-007': {
    source_only: [one(sourceOnly, value => value.startsWith('\\begin{multline*}'))],
    target_only: [
      one(targetOnly, value => value === '$y\\notin\\FV{N}$'),
      one(targetOnly, value => value.startsWith('\\begin{multline*}')),
    ],
  },
};
const sorted = items => [...items].sort();
const allSource = Object.values(allocation).flatMap(value => value.source_only);
const allTarget = Object.values(allocation).flatMap(value => value.target_only);
if (JSON.stringify(sorted(allSource)) !== JSON.stringify(sorted(sourceOnly)) ||
    JSON.stringify(sorted(allTarget)) !== JSON.stringify(sorted(targetOnly))) {
  throw new Error('Not every math delta was allocated exactly once');
}

const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
let changed = 0;
const updated = lines.map(line => {
  const row = JSON.parse(line);
  if (!Object.hasOwn(allocation, row.finding_id)) return line;
  if (row.audit_id !== 'OLTELAMSUB-20260925' || row.unit_id !== 'OLP-0361') {
    throw new Error('Unexpected correction identity');
  }
  row.expected_core_math_delta = allocation[row.finding_id];
  row.status = 'applied_qa_pass';
  const next = JSON.stringify(row);
  if (next !== line) changed += 1;
  return next;
});
if (updated.filter(line => line.includes('"audit_id":"OLTELAMSUB-20260925"')).length !== 7) {
  throw new Error('Expected all seven Batch 042 corrections');
}
if (changed) fs.writeFileSync(ledgerPath, updated.join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({
  status: changed ? 'updated' : 'pass_idempotent',
  changed,
  source_only: sourceOnly.length,
  target_only: targetOnly.length,
  source_sha256: sha(source),
  translation_sha256: sha(target),
}) + '\n');
