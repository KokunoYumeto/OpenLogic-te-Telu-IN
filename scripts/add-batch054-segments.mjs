import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'SEGMENT_CANON_USE.jsonl');
const manifestPath = path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl');
const unitIds = ['OLP-0376', 'OLP-0377'];
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
  throw new Error('Batch 054 segment rows already exist; use --refresh after target revision');
}
const retained = existing.filter(row => !unitIds.includes(row.unit_id));
const manifest = jsonl(manifestPath);
const passageCatalog = new Map();
for (const row of existing) for (const passage of row.canon_passages ?? []) {
  if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
}
const expectedBlocks = new Map([['OLP-0376', 10], ['OLP-0377', 12]]);
const passageIdsBySegment = new Map([
  ['OLP-0376-B004', ['TE-P005', 'TE-P034']],
  ['OLP-0376-B005', ['TE-P011', 'TE-P034']],
  ['OLP-0376-B006', ['TE-P011', 'TE-P034']],
  ['OLP-0376-B007', ['TE-P032', 'TE-P034']],
  ['OLP-0376-B008', ['TE-P005', 'TE-P011', 'TE-P034']],
  ['OLP-0376-B009', ['TE-P005', 'TE-P011']],
  ['OLP-0377-B004', ['TE-P010', 'TE-P018', 'TE-P019']],
  ['OLP-0377-B005', ['TE-P019']],
  ['OLP-0377-B006', ['TE-P011', 'TE-P019']],
  ['OLP-0377-B007', ['TE-P010', 'TE-P019']],
  ['OLP-0377-B008', ['TE-P005', 'TE-P011', 'TE-P019']],
  ['OLP-0377-B009', ['TE-P018', 'TE-P019', 'TE-P020']],
  ['OLP-0377-B010', ['TE-P019']],
  ['OLP-0377-B011', ['TE-P019', 'TE-P020', 'TE-P032']],
]);
const rows = [];
for (const id of unitIds) {
  const unit = manifest.find(row => row.unit_id === id);
  if (!unit || unit.order !== Number(id.slice(-4))) throw new Error('Manifest cursor mismatch: ' + id);
  const sourceRaw = fs.readFileSync(path.join(root, 'upstream', unit.source_path), 'utf8');
  const targetRaw = fs.readFileSync(path.join(root, 'translation', unit.source_path), 'utf8');
  if (sha(sourceRaw) !== unit.source_sha256) throw new Error('Frozen source hash mismatch: ' + id);
  const sourceBlocks = blocksWithSpans(sourceRaw), targetBlocks = blocksWithSpans(targetRaw);
  if (sourceBlocks.length !== expectedBlocks.get(id) || targetBlocks.length !== expectedBlocks.get(id)) {
    throw new Error('Unexpected source-target block alignment: ' + id);
  }
  sourceBlocks.forEach((sourceBlock, index) => {
    const targetBlock = targetBlocks[index];
    const segmentId = id + '-B' + String(index + 1).padStart(3, '0');
    const linguistic = /[\u0C00-\u0C7F]/u.test(targetBlock.block);
    const shouldBeLinguistic = index >= 3 && index < expectedBlocks.get(id) - 1;
    if (linguistic !== shouldBeLinguistic) throw new Error('Linguistic classification mismatch ' + segmentId);
    const passageIds = passageIdsBySegment.get(segmentId) ?? [];
    if (linguistic !== Boolean(passageIds.length)) throw new Error('Missing or unexpected passage scope ' + segmentId);
    const canonPassages = passageIds.map(passageId => {
      const passage = passageCatalog.get(passageId);
      if (!passage) throw new Error('Missing inspected canon passage ' + passageId);
      return passage;
    });
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
        ? `${id} అనువాద సమయంలో ${segmentId} ఆంగ్ల మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా చదివి; ఈ ఖండం కోసం నమోదైన స్థానిక పేజీలను ప్రత్యక్షంగా పరిశీలించి TE-T012, TE-T032, TE-T033, TE-T079, TE-T093–TE-T095 నిర్ణయాలతో పోల్చాం.`
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? id === 'OLP-0376'
          ? 'స్థానిక పేజీలు క్రమయుగ్మం, ప్రమేయం, సహజ సంఖ్య, నిరూపణ గద్యానికి మాత్రమే ఆధారం. లాంబ్డా క్రమయుగ్మ సంకేతీకరణ, Pred స్థితి పునరావర్తనానికి ప్రత్యక్ష స్థానిక సాక్ష్యం లేదు; స్థిర మూల సూత్రాలే ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి.'
          : 'స్థానిక పేజీలు సంబంధం, సత్యమూల్యం, నిషేధం, సంయోగం, వికల్పం, ప్రమేయానికి ఆధారం. చర్చ్ ఎంపిక ప్రమేయాలు, IsZero లాంబ్డా పరీక్షకు ప్రత్యక్ష స్థానిక సాక్ష్యం లేదు; స్థిర మూల సూత్రం, ప్రకటిత స్థాన సవరణ ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి.'
        : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, గద్యం ఇందులో దాచలేదు.',
    });
  });
}
fs.writeFileSync(ledgerPath, [...retained, ...rows].map(JSON.stringify).join('\n') + '\n', 'utf8');
const linguistic = rows.filter(row => row.classification === 'translated_linguistic_segment').length;
console.log(JSON.stringify({mode: refresh ? 'refresh' : 'append', units: unitIds,
  rows: rows.length, linguistic, structural: rows.length - linguistic}));
