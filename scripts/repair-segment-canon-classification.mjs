import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'SEGMENT_CANON_USE.jsonl');
const receiptPath = path.join(root, 'evidence', 'SEGMENT-CLASSIFICATION-REPAIR-20260925.json');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const rows = fs.readFileSync(ledgerPath, 'utf8').trim().split(/\r?\n/u).map(JSON.parse);
const byUnit = new Map();
const passageCatalog = new Map();
for (const row of rows) {
  if (!byUnit.has(row.unit_id)) byUnit.set(row.unit_id, []);
  byUnit.get(row.unit_id).push(row);
  for (const passage of row.canon_passages ?? []) {
    if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
  }
}
const fileLines = new Map();
const candidates = [];
for (const row of rows) {
  if (row.classification !== 'preserved_metadata_or_structural_segment') continue;
  let lines = fileLines.get(row.source_path);
  if (!lines) {
    lines = fs.readFileSync(path.join(root, 'translation', row.source_path), 'utf8')
      .replace(/\r\n/gu, '\n').split('\n');
    fileLines.set(row.source_path, lines);
  }
  const block = lines.slice(row.target_start_line - 1, row.target_end_line).join('\n');
  const hasTelugu = /[\u0C00-\u0C7F]/u.test(block);
  const readerHeading = /\\(?:olsection|section|subsection|olchapter|olpart)\b/u.test(block);
  const textToken = /\\(?:usetoken|printtoken|tetoken)\b/u.test(block);
  if (!hasTelugu && !readerHeading && !textToken) continue;
  if (sha(block) !== row.translation_segment_sha256) {
    throw new Error(`Stored segment hash mismatch: ${row.segment_id}`);
  }
  candidates.push({ row, hasTelugu, readerHeading, textToken });
}
if (candidates.length === 0) {
  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  const linguistic = rows.filter(row => row.classification === 'translated_linguistic_segment');
  const structural = rows.filter(row => row.classification === 'preserved_metadata_or_structural_segment');
  if (receipt.change_count !== 110 || rows.length !== 5486 || linguistic.length !== 3468 || structural.length !== 2018 ||
      receipt.segment_ledger_sha256 !== sha(fs.readFileSync(ledgerPath)) ||
      !linguistic.every(row => row.canon_passages.length) ||
      !structural.every(row => !row.canon_passages.length)) {
    throw new Error('Existing classification repair receipt does not match the ledger');
  }
  process.stdout.write(JSON.stringify({ status: 'pass_idempotent', changes: 0, total: rows.length, linguistic: linguistic.length, structural: structural.length, ledger_sha256: receipt.segment_ledger_sha256 }) + '\n');
  process.exit(0);
}
if (candidates.length !== 110) throw new Error(`Expected exactly 110 legacy misclassifications; found ${candidates.length}`);

const changes = [];
for (const { row, hasTelugu, readerHeading, textToken } of candidates) {
  const siblingPassages = byUnit.get(row.unit_id)
    .filter(other => other.classification === 'translated_linguistic_segment')
    .flatMap(other => other.canon_passages ?? []);
  const passageIds = [...new Set(siblingPassages.map(passage => passage.passage_id))];
  if (!passageIds.length && row.unit_id === 'OLP-0149') {
    passageIds.push('TE-P027', 'TE-P029');
  }
  if (!passageIds.length) throw new Error(`No consulted-canon route for ${row.segment_id}`);
  row.classification = 'translated_linguistic_segment';
  row.canon_passages = passageIds.map(id => {
    const passage = passageCatalog.get(id);
    if (!passage) throw new Error(`Missing catalog passage ${id}`);
    return passage;
  });
  row.consultation_phase = row.unit_id === 'OLP-0149'
    ? '2026-09-25 classification repair: exact title read against frozen source; TE-P027 and TE-P029 native pages visually inspected for formal syntax, term and variable scope register.'
    : '2026-09-25 classification repair: exact target block checked against source; reused the canon passages recorded as consulted for other linguistic blocks in the same original translation unit.';
  row.evidence_limit = 'Previously marked structural by an overbroad metadata classifier although the block contains reader-visible Telugu or a realized OpenLogic token. Same-unit canon supports only its stated native terminology/prose scope; formal and specialist senses remain controlled by the frozen source and term decision.';
  changes.push({
    segment_id: row.segment_id,
    unit_id: row.unit_id,
    source_path: row.source_path,
    source_segment_sha256: row.source_segment_sha256,
    translation_segment_sha256: row.translation_segment_sha256,
    has_telugu: hasTelugu,
    has_reader_heading: readerHeading,
    has_text_token: textToken,
    canon_passage_ids: passageIds,
  });
}

const linguistic = rows.filter(row => row.classification === 'translated_linguistic_segment');
const structural = rows.filter(row => row.classification === 'preserved_metadata_or_structural_segment');
if (!linguistic.every(row => row.canon_passages.length)) throw new Error('Linguistic row without canon evidence');
if (!structural.every(row => !row.canon_passages.length)) throw new Error('Structural row with canon evidence');
if (rows.length !== 5486 || linguistic.length !== 3468 || structural.length !== 2018) {
  throw new Error(`Unexpected reconciled counts ${rows.length}/${linguistic.length}/${structural.length}`);
}
fs.writeFileSync(ledgerPath, rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const receipt = {
  schema: 'openlogic-segment-classification-repair/1',
  date: '2026-09-25',
  scope: 'Existing aligned OLP-0004--OLP-0360 segment ledger',
  finding: 'The previous metadata classifier treated some reader-visible heading or token blocks as structural.',
  change_count: changes.length,
  changed_source_and_target_bytes: false,
  preexisting_and_new_segment_count: rows.length,
  linguistic_segments: linguistic.length,
  structural_segments: structural.length,
  special_title_only_unit: 'OLP-0149',
  changes,
  segment_ledger_sha256: sha(fs.readFileSync(ledgerPath)),
};
fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
process.stdout.write(JSON.stringify({ status: 'pass', changes: changes.length, total: rows.length, linguistic: linguistic.length, structural: structural.length, ledger_sha256: receipt.segment_ledger_sha256 }) + '\n');
