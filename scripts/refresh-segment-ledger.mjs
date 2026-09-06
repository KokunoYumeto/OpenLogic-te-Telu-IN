import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const first = Number(process.argv[2] ?? 11);
const last = Number(process.argv[3] ?? 137);
const ledgerPath = path.resolve(process.argv[4] ?? path.join(root, 'evidence', 'SEGMENT_CANON_USE.jsonl'));

if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last > 722 || first > last) {
  throw new Error('Usage: node scripts/refresh-segment-ledger.mjs FIRST LAST [LEDGER_PATH]');
}

const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const normalize = value => value.replace(/\r\n/g, '\n');
const manifest = fs.readFileSync(path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl'), 'utf8')
  .trim().split(/\r?\n/).map(JSON.parse);
const manifestByUnit = new Map(manifest.map(unit => [unit.unit_id, unit]));
const originalLines = fs.readFileSync(ledgerPath, 'utf8').trim().split(/\r?\n/);
const records = originalLines.map(JSON.parse);

function blocksWithSpans(raw) {
  const normalized = normalize(raw);
  const blocks = normalized.trim().split(/\n\s*\n/);
  let cursor = 0;
  return blocks.map(block => {
    const start = normalized.indexOf(block, cursor);
    if (start < 0) throw new Error('Could not locate aligned block');
    const startLine = 1 + normalized.slice(0, start).split('\n').length - 1;
    const endLine = startLine + block.split('\n').length - 1;
    cursor = start + block.length;
    return { block, startLine, endLine };
  });
}

const changed = [];
const unitSummaries = [];
for (let order = first; order <= last; order += 1) {
  const unitId = `OLP-${String(order).padStart(4, '0')}`;
  const unit = manifestByUnit.get(unitId);
  if (!unit) throw new Error(`Missing manifest unit ${unitId}`);
  const indexes = records.map((record, index) => record.unit_id === unitId ? index : -1).filter(index => index >= 0);
  if (!indexes.length) throw new Error(`No segment records for ${unitId}`);
  const sourceRaw = fs.readFileSync(path.join(root, 'upstream', unit.source_path), 'utf8');
  const targetRaw = fs.readFileSync(path.join(root, 'translation', unit.source_path), 'utf8');
  const sourceBlocks = blocksWithSpans(sourceRaw);
  const targetBlocks = blocksWithSpans(targetRaw);
  if (sourceBlocks.length !== indexes.length || targetBlocks.length !== indexes.length) {
    throw new Error(`${unitId}: ledger/source/target block counts ${indexes.length}/${sourceBlocks.length}/${targetBlocks.length}`);
  }
  indexes.forEach((recordIndex, i) => {
    const record = records[recordIndex];
    const expectedId = `${unitId}-B${String(i + 1).padStart(3, '0')}`;
    if (record.segment_id !== expectedId) throw new Error(`${unitId}: expected ${expectedId}, got ${record.segment_id}`);
    const refreshed = {
      ...record,
      source_unit_sha256: sha(Buffer.from(sourceRaw)),
      translation_unit_sha256: sha(Buffer.from(targetRaw)),
      source_start_line: sourceBlocks[i].startLine,
      source_end_line: sourceBlocks[i].endLine,
      target_start_line: targetBlocks[i].startLine,
      target_end_line: targetBlocks[i].endLine,
      source_segment_sha256: sha(sourceBlocks[i].block),
      translation_segment_sha256: sha(targetBlocks[i].block),
    };
    const nextLine = JSON.stringify(refreshed);
    if (nextLine !== originalLines[recordIndex]) changed.push({ oldLine: originalLines[recordIndex], nextLine });
  });
  unitSummaries.push({ unit_id: unitId, segments: indexes.length, source_blocks: sourceBlocks.length, target_blocks: targetBlocks.length });
}

process.stderr.write(JSON.stringify({ ledger: ledgerPath, first, last, units: unitSummaries.length, records: unitSummaries.reduce((n, unit) => n + unit.segments, 0), changed_records: changed.length }) + '\n');
if (!changed.length) process.exit(0);
process.stdout.write('*** Begin Patch\n');
process.stdout.write(`*** Update File: ${ledgerPath}\n`);
for (const item of changed) {
  process.stdout.write('@@\n');
  process.stdout.write(`-${item.oldLine}\n`);
  process.stdout.write(`+${item.nextLine}\n`);
}
process.stdout.write('*** End Patch\n');
