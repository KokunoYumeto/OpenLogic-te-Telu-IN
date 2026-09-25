import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'SEGMENT_CANON_USE.jsonl');
const manifestPath = path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl');
const unitId = 'OLP-0365';
const refresh = process.argv.includes('--refresh');
if (process.argv.slice(2).some(argument => argument !== '--refresh')) throw new Error('Unknown option');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const normalize = value => value.replace(/\r\n/gu, '\n');
const jsonl = file => fs.readFileSync(file, 'utf8').trim().split(/\r?\n/u).filter(Boolean).map(JSON.parse);

function blocksWithSpans(raw) {
  const text = normalize(raw);
  const blocks = text.trim().split(/\n\s*\n/u);
  let cursor = 0;
  return blocks.map(block => {
    const start = text.indexOf(block, cursor);
    if (start < 0) throw new Error('Could not locate aligned block');
    const startLine = 1 + text.slice(0, start).split('\n').length - 1;
    const endLine = startLine + block.split('\n').length - 1;
    cursor = start + block.length;
    return {block, startLine, endLine};
  });
}

const existing = jsonl(ledgerPath);
if (existing.some(row => row.unit_id === unitId) && !refresh) {
  throw new Error('Batch 047 segment rows already exist; use --refresh after target revision');
}
const retained = existing.filter(row => row.unit_id !== unitId);
const unit = jsonl(manifestPath).find(row => row.unit_id === unitId);
if (!unit || unit.order !== 365) throw new Error('Manifest cursor mismatch');
const sourceRaw = fs.readFileSync(path.join(root, 'upstream', unit.source_path), 'utf8');
const targetRaw = fs.readFileSync(path.join(root, 'translation', unit.source_path), 'utf8');
if (sha(sourceRaw) !== unit.source_sha256) throw new Error('Frozen source hash mismatch');
const sourceBlocks = blocksWithSpans(sourceRaw);
const targetBlocks = blocksWithSpans(targetRaw);
if (sourceBlocks.length !== 20 || targetBlocks.length !== sourceBlocks.length) {
  throw new Error('Source and target block count mismatch');
}
const passageCatalog = new Map();
for (const row of existing) {
  for (const passage of row.canon_passages ?? []) {
    if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
  }
}
const passageIds = ['TE-P003', 'TE-P027', 'TE-P029', 'TE-P032'];
const passages = passageIds.map(id => {
  const passage = passageCatalog.get(id);
  if (!passage) throw new Error('Missing inspected canon passage ' + id);
  return passage;
});
const rows = sourceBlocks.map((sourceBlock, index) => {
  const targetBlock = targetBlocks[index];
  const segmentId = unitId + '-B' + String(index + 1).padStart(3, '0');
  const structural = index < 3 || index === 19;
  const sourceCorrections = [...targetBlock.block.matchAll(/\\sourcecorrection\{([^{}]+)\}/gu)].map(match => match[1]);
  return {
    segment_id: segmentId,
    unit_id: unitId,
    source_path: unit.source_path,
    source_unit_sha256: sha(Buffer.from(sourceRaw)),
    translation_unit_sha256: sha(Buffer.from(targetRaw)),
    source_start_line: sourceBlock.startLine,
    source_end_line: sourceBlock.endLine,
    target_start_line: targetBlock.startLine,
    target_end_line: targetBlock.endLine,
    source_segment_sha256: sha(sourceBlock.block),
    translation_segment_sha256: sha(targetBlock.block),
    classification: structural ? 'preserved_metadata_or_structural_segment' : 'translated_linguistic_segment',
    canon_passages: structural ? [] : passages,
    source_corrections: sourceCorrections,
    consultation_phase: structural
      ? 'not_applicable_nonlinguistic'
      : 'OLP-0365 అనువాద సమయంలో ' + segmentId + ' మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా చదివి; సూచించిన స్థానిక పేజీలను ప్రత్యక్షంగా చూసి TE-T078, TE-T082, TE-T087తో పోల్చాం.',
    evidence_limit: structural
      ? 'వాక్యేతర TeX నిర్మాణం లేదా మూల గుర్తింపు వ్యాఖ్య; పాఠక గద్యం మానలేదు.'
      : 'పేజీలు పదం, చరం, పరిధి, నిర్వచన/నిరూపణ శైలికి మాత్రమే ఆధారం. బీటా-సంకోచనం, రెడెక్స్, సహజ వ్యూహం, చర్చ్--రోసర్ లక్షణం, నియతీకరణ వాదనలకు ప్రత్యక్ష సాక్ష్యం కావు; ప్రత్యేక అర్థానికి మూల నియమాలు, ఉదాహరణలే ఆధారం. పూర్వ ఆల్ఫా-ప్రతిస్థాపన నిరూపణ ఖాళీలు ఇంకా తెరిచి ఉన్నాయి.',
  };
});
fs.writeFileSync(ledgerPath, [...retained, ...rows].map(JSON.stringify).join('\n') + '\n', 'utf8');
const linguistic = rows.filter(row => row.classification === 'translated_linguistic_segment').length;
process.stdout.write(JSON.stringify({mode: refresh ? 'refresh' : 'append', unit: unitId, rows: rows.length,
  linguistic, structural: rows.length - linguistic}) + '\n');
