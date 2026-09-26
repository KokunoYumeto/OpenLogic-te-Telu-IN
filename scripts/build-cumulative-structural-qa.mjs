import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const previousNumber = Number(process.argv[2]);
const currentNumber = Number(process.argv[3]);
const batch = process.argv[4];
if (!Number.isInteger(previousNumber) || !Number.isInteger(currentNumber) ||
    previousNumber < 1 || currentNumber <= previousNumber ||
    !/^\d{3}$/u.test(batch ?? '')) throw new Error('Expected prior unit, final unit and batch ID');
const padded = n => String(n).padStart(4, '0');
const priorPath = path.join(root, 'evidence', 'CUMULATIVE-OLP' + padded(previousNumber) + '-STRUCTURAL-QA.json');
const batchPath = path.join(root, 'build', 'BATCH-' + batch + '-STRUCTURAL-QA.json');
const prior = JSON.parse(fs.readFileSync(priorPath, 'utf8'));
const next = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
if (prior.units.length !== previousNumber ||
    prior.units.at(-1)?.unit_id !== 'OLP-' + padded(previousNumber) ||
    next.units.length !== currentNumber - previousNumber)
  throw new Error('Unexpected cumulative or batch unit cursor');
const units = [...prior.units, ...next.units];
const flags = ['paragraph_alignment', 'structure_match', 'token_parity',
  'math_multiset_match', 'protected_identifier_parity'];
for (const [index, row] of units.entries()) {
  if (row.unit_id !== 'OLP-' + padded(index + 1) ||
      flags.some(key => row[key] !== true) || row.unicode_replacement_char ||
      row.unpaired_surrogate) throw new Error('Cumulative QA failed at ' + row.unit_id);
}
const output = {
  schema: prior.schema,
  generated_utc: new Date().toISOString(),
  note: 'Cumulative diagnostic assembled from the prior passing unit QA and the passing bounded batch. This does not prove semantic equivalence or full-reader completion.',
  units
};
const outputPath = path.join(root, 'evidence',
  'CUMULATIVE-OLP' + padded(currentNumber) + '-STRUCTURAL-QA.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ units: units.length,
  blocks: units.reduce((sum, row) => sum + row.source_blocks, 0),
  output: path.relative(root, outputPath) }));
