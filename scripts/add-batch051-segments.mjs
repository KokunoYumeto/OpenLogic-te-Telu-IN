import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'SEGMENT_CANON_USE.jsonl');
const manifestPath = path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl');
const id = 'OLP-0370';
const refresh = process.argv.includes('--refresh');
if (process.argv.slice(2).some(argument => argument !== '--refresh')) throw new Error('Unknown option');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => fs.readFileSync(file, 'utf8').trim().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
function blocksWithSpans(raw) {
  const file = raw.replace(/\r\n/gu, '\n');
  const blocks = file.trim().split(/\n\s*\n/u);
  let cursor = 0;
  return blocks.map(block => {
    const start = file.indexOf(block, cursor);
    if (start < 0) throw new Error('Could not locate aligned block');
    const startLine = file.slice(0, start).split('\n').length;
    const endLine = startLine + block.split('\n').length - 1;
    cursor = start + block.length;
    return {block, startLine, endLine};
  });
}

const existing = jsonl(ledgerPath);
if (existing.some(row => row.unit_id === id) && !refresh) {
  throw new Error('Batch 051 segment rows already exist; use --refresh after target revision');
}
const retained = existing.filter(row => row.unit_id !== id);
const unit = jsonl(manifestPath).find(row => row.unit_id === id);
if (!unit || unit.order !== 370) throw new Error('Manifest cursor mismatch');
const sourceRaw = fs.readFileSync(path.join(root, 'upstream', unit.source_path), 'utf8');
const targetRaw = fs.readFileSync(path.join(root, 'translation', unit.source_path), 'utf8');
if (sha(sourceRaw) !== unit.source_sha256) throw new Error('Frozen source hash mismatch');
const sourceBlocks = blocksWithSpans(sourceRaw), targetBlocks = blocksWithSpans(targetRaw);
const passageIds = [
  [], [], [], [], ['TE-P032'],
  ['TE-P024', 'TE-P029', 'TE-P032'], ['TE-P024', 'TE-P032'],
  ['TE-P024', 'TE-P029', 'TE-P032'], ['TE-P024', 'TE-P032'],
  ['TE-P024', 'TE-P032'], ['TE-P024', 'TE-P032'],
  ['TE-P024', 'TE-P032'], ['TE-P024', 'TE-P032'],
  ['TE-P024', 'TE-P032'], [],
];
if (sourceBlocks.length !== 15 || targetBlocks.length !== 15 || passageIds.length !== 15) {
  throw new Error('Unexpected source-target block alignment');
}
const passageCatalog = new Map();
for (const row of existing) for (const passage of row.canon_passages ?? []) {
  if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
}
const rows = sourceBlocks.map((sourceBlock, index) => {
  const targetBlock = targetBlocks[index];
  const segmentId = id + '-B' + String(index + 1).padStart(3, '0');
  const canonPassages = passageIds[index].map(passageId => {
    const passage = passageCatalog.get(passageId);
    if (!passage) throw new Error('Missing inspected canon passage ' + passageId);
    return passage;
  });
  const structural = canonPassages.length === 0;
  if (structural === /[\u0C00-\u0C7F]/u.test(targetBlock.block)) {
    throw new Error('Linguistic classification mismatch ' + segmentId);
  }
  return {
    segment_id: segmentId,
    unit_id: id,
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
    canon_passages: canonPassages,
    source_corrections: [...targetBlock.block.matchAll(/\\sourcecorrection\{([^{}]+)\}/gu)].map(match => match[1]),
    consultation_phase: structural ? 'not_applicable_nonlinguistic'
      : `${id} అనువాద సమయంలో ${segmentId} మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా చదివి; సూచించిన స్థానిక పేజీలను ప్రత్యక్షంగా చూసి TE-T078, TE-T089, TE-T090, TE-T091తో పోల్చాం.`,
    evidence_limit: structural
      ? 'వాక్యేతర TeX నిర్మాణం మాత్రమే; పాఠక శీర్షిక, గద్యం ఇందులో దాచలేదు.'
      : 'స్థానిక పేజీలు చర-పరిధి, వ్యుత్పత్తి, ఆగమన/నిరూపణ శైలికి మాత్రమే ఆధారం. బీటా-సంకోచనం, సమాంతర తగ్గింపు, చర్చ్--రోసర్ బదిలీకి ప్రత్యక్ష స్థానిక సాక్ష్యం కావు; ప్రత్యేక అర్థానికి స్థిర మూల నిర్వచనాలు, ప్రకటిత పరిమితులే ఆధారం.',
  };
});
fs.writeFileSync(ledgerPath, [...retained, ...rows].map(JSON.stringify).join('\n') + '\n', 'utf8');
const linguistic = rows.filter(row => row.classification === 'translated_linguistic_segment').length;
console.log(JSON.stringify({mode: refresh ? 'refresh' : 'append', units: [id], rows: rows.length,
  linguistic, structural: rows.length - linguistic}));
