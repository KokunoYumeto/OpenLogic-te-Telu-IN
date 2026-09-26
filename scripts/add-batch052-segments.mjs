import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'SEGMENT_CANON_USE.jsonl');
const manifestPath = path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl');
const unitIds = ['OLP-0371', 'OLP-0372'];
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
if (existing.some(row => unitIds.includes(row.unit_id)) && !refresh) {
  throw new Error('Batch 052 segment rows already exist; use --refresh after target revision');
}
const retained = existing.filter(row => !unitIds.includes(row.unit_id));
const manifest = jsonl(manifestPath);
const passageCatalog = new Map();
for (const row of existing) for (const passage of row.canon_passages ?? []) {
  if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
}
const rows = [];
for (const id of unitIds) {
  const unit = manifest.find(row => row.unit_id === id);
  if (!unit || unit.order !== Number(id.slice(-4))) throw new Error('Manifest cursor mismatch: ' + id);
  const sourceRaw = fs.readFileSync(path.join(root, 'upstream', unit.source_path), 'utf8');
  const targetRaw = fs.readFileSync(path.join(root, 'translation', unit.source_path), 'utf8');
  if (sha(sourceRaw) !== unit.source_sha256) throw new Error('Frozen source hash mismatch: ' + id);
  const sourceBlocks = blocksWithSpans(sourceRaw), targetBlocks = blocksWithSpans(targetRaw);
  const expected = id === 'OLP-0371' ? 20 : 15;
  if (sourceBlocks.length !== expected || targetBlocks.length !== expected) {
    throw new Error('Unexpected source-target block alignment: ' + id);
  }
  sourceBlocks.forEach((sourceBlock, index) => {
    const targetBlock = targetBlocks[index];
    const segmentId = id + '-B' + String(index + 1).padStart(3, '0');
    const linguistic = /[\u0C00-\u0C7F]/u.test(targetBlock.block);
    const passageIds = linguistic ? ['TE-P024', 'TE-P027', 'TE-P032'] : [];
    const canonPassages = passageIds.map(passageId => {
      const passage = passageCatalog.get(passageId);
      if (!passage) throw new Error('Missing inspected canon passage ' + passageId);
      return passage;
    });
    if (!linguistic && index >= 4 &&
        !(id === 'OLP-0371' && [7, 19].includes(index))) {
      throw new Error('Reader-facing linguistic block classified structural: ' + segmentId);
    }
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
      classification: linguistic ? 'translated_linguistic_segment' : 'preserved_metadata_or_structural_segment',
      canon_passages: canonPassages,
      source_corrections: [...targetBlock.block.matchAll(/\\sourcecorrection\{([^{}]+)\}/gu)].map(match => match[1]),
      consultation_phase: linguistic
        ? `${id} అనువాద సమయంలో ${segmentId} మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా చదివి; సూచించిన స్థానిక పేజీలను ప్రత్యక్షంగా చూసి TE-T078, TE-T088, TE-T090, TE-T091, TE-T092తో పోల్చాం.`
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? 'స్థానిక పేజీలు చరాలు, వ్యుత్పత్తి, ఆగమన/నిరూపణ శైలికి మాత్రమే ఆధారం. బీటా-ఏటా సమాంతర తగ్గింపు, సంపూర్ణ వికాసం, చర్చ్--రోసర్ బదిలీకి ప్రత్యక్ష స్థానిక సాక్ష్యం కావు; ప్రత్యేక అర్థానికి స్థిర మూల నిర్వచనాలు, ప్రకటిత పరిమితులే ఆధారం.'
        : id === 'OLP-0371' && index === 7
        ? 'భాషా గద్యం లేని పాఠకుడికి కనిపించే గణిత సూత్రం; సంబంధ సంకేతాన్ని యథాతథంగా ఉంచాం.'
        : 'వాక్యేతర TeX నిర్మాణం మాత్రమే; పాఠక శీర్షిక, గద్యం ఇందులో దాచలేదు.',
    });
  });
}
fs.writeFileSync(ledgerPath, [...retained, ...rows].map(JSON.stringify).join('\n') + '\n', 'utf8');
const linguistic = rows.filter(row => row.classification === 'translated_linguistic_segment').length;
console.log(JSON.stringify({mode: refresh ? 'refresh' : 'append', units: unitIds,
  rows: rows.length, linguistic, structural: rows.length - linguistic}));
