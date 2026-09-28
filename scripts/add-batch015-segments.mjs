import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.resolve(process.argv[2] ?? path.join(root, 'evidence', 'SEGMENT_CANON_USE.jsonl'));
const laneRoot = 'C:\\interlanguage-task-state\\openlogic-internationalization\\canon-revalidation\\lanes\\te-Telu-IN';
const ownerCanonPath = 'C:\\interlanguage-task-state\\openlogic-te-Telu-IN\\CANON_PASSAGES.jsonl';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => fs.readFileSync(file, 'utf8').trim().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const normalizeBlock = text => text.replace(/\r\n/gu, '\n').replace(/\n$/u, '');

const ledgerText = fs.readFileSync(ledgerPath, 'utf8').replace(/\r\n/gu, '\n').replace(/\n$/u, '');
const existing = ledgerText.split('\n').filter(Boolean).map(JSON.parse);
if (existing.some(row => /^OLP-01(?:3[8-9]|4[0-8])-/u.test(row.segment_id))) {
  throw new Error('Batch 015 segment rows already exist; refusing to append duplicates');
}
const choices = jsonl(path.join(laneRoot, 'CHOICES.jsonl')).filter(row => {
  const order = Number(row.unit_id.slice(4));
  return order >= 138 && order <= 148;
});
const ownerCanon = new Map(jsonl(ownerCanonPath).map(row => [row.passage_id, row]));
if (choices.length !== 125) throw new Error(`Expected 125 manager choices for OLP-0138--0148, got ${choices.length}`);

const rows = choices.map(choice => {
  const sourcePath = choice.source.path.replace(`${root}\\upstream\\`, '').replace(/\\/gu, '/');
  const canonPassages = choice.canon_consulted.map(use => {
    const passage = ownerCanon.get(use.passage_id);
    if (!passage) throw new Error(`Unresolved owner canon passage ${use.passage_id}`);
    return {
      passage_id: use.passage_id,
      source_sha256: passage.source_sha256,
      ...(passage.pdf_page !== undefined ? { pdf_page: passage.pdf_page } : { pdf_pages: passage.pdf_pages }),
      role: passage.role,
    };
  });
  return {
    segment_id: choice.segment_id,
    unit_id: choice.unit_id,
    source_path: sourcePath,
    source_unit_sha256: choice.source.sha256,
    translation_unit_sha256: choice.target.sha256,
    source_start_line: choice.source.line_start,
    source_end_line: choice.source.line_end,
    target_start_line: choice.target.line_start,
    target_end_line: choice.target.line_end,
    source_segment_sha256: sha(normalizeBlock(choice.source.text)),
    translation_segment_sha256: sha(normalizeBlock(choice.target.text)),
    classification: choice.status === 'formal-invariant' ? 'preserved_metadata_or_structural_segment' : 'translated_linguistic_segment',
    canon_passages: choice.status === 'formal-invariant' ? [] : canonPassages,
    source_corrections: choice.source_correction_ids,
    consultation_phase: choice.status === 'formal-invariant'
      ? 'not_applicable_nonlinguistic'
      : `Later-revalidation choice ${choice.choice_id}; exact source/target bytes rechecked against ${choice.direct_canon_passage_ids.join(', ')} after the formal-logic canon and Telugu token repairs.`,
    evidence_limit: choice.status === 'formal-invariant'
      ? 'TeX wrappers, comments with stable source identities, import paths, formal notation or end-document markers; no reader prose omitted.'
      : `${choice.status} at confidence ${choice.confidence.toFixed(2)}. ${choice.justification} Optional expert review remains explicit where required; it is not a translation hold.`,
  };
});

const ids = rows.map(row => row.segment_id);
if (new Set(ids).size !== rows.length) throw new Error('Duplicate generated segment ID');
for (let order = 138; order <= 148; order += 1) {
  const unit = `OLP-${String(order).padStart(4, '0')}`;
  const unitRows = rows.filter(row => row.unit_id === unit);
  unitRows.forEach((row, index) => {
    const expected = `${unit}-B${String(index + 1).padStart(3, '0')}`;
    if (row.segment_id !== expected) throw new Error(`Expected ${expected}, got ${row.segment_id}`);
  });
}

const lastLine = ledgerText.split('\n').at(-1);
process.stderr.write(`${JSON.stringify({ ledger: ledgerPath, existing: existing.length, append: rows.length, final: existing.length + rows.length })}\n`);
process.stdout.write('*** Begin Patch\n');
process.stdout.write(`*** Update File: ${ledgerPath}\n`);
process.stdout.write('@@\n');
process.stdout.write(` ${lastLine}\n`);
for (const row of rows) process.stdout.write(`+${JSON.stringify(row)}\n`);
process.stdout.write('*** End Patch\n');
