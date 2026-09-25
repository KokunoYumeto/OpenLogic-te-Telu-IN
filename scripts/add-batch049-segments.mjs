import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'SEGMENT_CANON_USE.jsonl');
const manifestPath = path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl');
const ids = ['OLP-0367', 'OLP-0368'];
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
if (existing.some(row => ids.includes(row.unit_id)) && !refresh) {
  throw new Error('Batch 049 segment rows already exist; use --refresh after target revision');
}
const retained = existing.filter(row => !ids.includes(row.unit_id));
const manifest = jsonl(manifestPath);
const passageCatalog = new Map();
for (const row of existing) {
  for (const passage of row.canon_passages ?? []) {
    if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
  }
}
const passageIds = {
  'OLP-0367': [[], [], [], ['TE-P003', 'TE-P032'], [], [], []],
  'OLP-0368': [
    [], [], [], [], ['TE-P003', 'TE-P032'],
    ['TE-P027', 'TE-P032'],
    ['TE-P027', 'TE-P032'],
    ['TE-P008', 'TE-P027', 'TE-P032'],
    ['TE-P008', 'TE-P032'],
    ['TE-P027', 'TE-P032'],
    ['TE-P008', 'TE-P032'],
    ['TE-P003', 'TE-P032'],
    ['TE-P003', 'TE-P032'],
    ['TE-P003', 'TE-P032'],
    ['TE-P003', 'TE-P032'],
    [],
  ],
};
const rows = [];
for (const id of ids) {
  const unit = manifest.find(row => row.unit_id === id);
  if (!unit || unit.order !== Number(id.slice(-4))) throw new Error('Manifest cursor mismatch ' + id);
  const sourceRaw = fs.readFileSync(path.join(root, 'upstream', unit.source_path), 'utf8');
  const targetRaw = fs.readFileSync(path.join(root, 'translation', unit.source_path), 'utf8');
  if (sha(sourceRaw) !== unit.source_sha256) throw new Error('Frozen source hash mismatch ' + id);
  const sourceBlocks = blocksWithSpans(sourceRaw), targetBlocks = blocksWithSpans(targetRaw);
  if (sourceBlocks.length !== passageIds[id].length || targetBlocks.length !== sourceBlocks.length) {
    throw new Error('Source and target block count mismatch ' + id);
  }
  sourceBlocks.forEach((sourceBlock, index) => {
    const targetBlock = targetBlocks[index];
    const segmentId = id + '-B' + String(index + 1).padStart(3, '0');
    const canonPassages = passageIds[id][index].map(passageId => {
      const passage = passageCatalog.get(passageId);
      if (!passage) throw new Error('Missing inspected canon passage ' + passageId);
      return passage;
    });
    const structural = canonPassages.length === 0;
    const sourceCorrections = [...targetBlock.block.matchAll(/\\sourcecorrection\{([^{}]+)\}/gu)].map(match => match[1]);
    rows.push({
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
      source_corrections: sourceCorrections,
      consultation_phase: structural
        ? 'not_applicable_nonlinguistic'
        : `${id} అనువాద సమయంలో ${segmentId} మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా చదివి; సూచించిన స్థానిక పేజీలను ప్రత్యక్షంగా చూసి TE-T078, TE-T087, TE-T089తో పోల్చాం.`,
      evidence_limit: structural
        ? 'వాక్యేతర TeX నిర్మాణం లేదా దిగుమతి/ముగింపు మాత్రమే; పాఠక శీర్షిక, గద్యం ఇందులో దాచలేదు.'
        : 'పేజీలు పదం, ప్రమేయం, కారణం, సిద్ధాంత-నిరూపణ శైలికి మాత్రమే ఆధారం. చర్చ్--రోసర్ లక్షణం, నియత రూపపు అనన్యత, తగ్గింపు మార్గాల జాలకానికి ప్రత్యక్ష స్థానిక సాక్ష్యం కావు; ప్రత్యేక అర్థానికి స్థిర మూల నిర్వచనం, ప్రకటిత సవరణలే ఆధారం.',
    });
  });
}
fs.writeFileSync(ledgerPath, [...retained, ...rows].map(JSON.stringify).join('\n') + '\n', 'utf8');
const linguistic = rows.filter(row => row.classification === 'translated_linguistic_segment').length;
process.stdout.write(JSON.stringify({mode: refresh ? 'refresh' : 'append', units: ids, rows: rows.length,
  linguistic, structural: rows.length - linguistic}) + '\n');
