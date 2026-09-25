import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'SEGMENT_CANON_USE.jsonl');
const manifestPath = path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl');
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
const ids = new Set(['OLP-0001', 'OLP-0002', 'OLP-0003']);
if (existing.some(row => ids.has(row.unit_id)) && !refresh) {
  throw new Error('Batch 045 segment rows already exist; use --refresh after target revision');
}
const retained = existing.filter(row => !ids.has(row.unit_id));
const manifest = jsonl(manifestPath);
const passageCatalog = new Map();
for (const row of existing) {
  for (const passage of row.canon_passages ?? []) {
    if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
  }
}
const specs = [
  {order: 1, count: 4, structural: [], passages: ['TE-P003', 'TE-P027', 'TE-P032'], limit: 'స్థానిక పేజీలు తర్క/గణిత గద్య శైలికే ఆధారం; Open Logic Project వివరణ, సహకార విధానం, హక్కుల అనుమతి, అధితర్కం ప్రత్యేక నామానికి కాదు. ఆ అంశాలకు మూల ముందుమాటే ఆధారం.'},
  {order: 2, count: 26, structural: [1, 2, 3, 4, ...Array.from({length: 19}, (_, i) => i + 8)], passages: ['TE-P003', 'TE-P027', 'TE-P032'], limit: 'స్థానిక పేజీలు పాఠ్య/తర్క/నిరూపణ గద్య శైలికే ఆధారం; ప్రాజెక్ట్ సంపాదకీయ విధానం, PDF హెచ్చరిక, నిర్దిష్ట దిగుమతి వృక్షం మూల ఫైలు ఆధారంగా మాత్రమే నిలిచాయి.'},
  {order: 3, count: 12, structural: [1, 2, 3, 6, 7, 8, 9, 10, 11, 12], passages: ['TE-P003', 'TE-P008', 'TE-P032'], limit: 'స్థానిక పేజీలు సమితి భావన, పరిచయ గద్య శైలికే ఆధారం; naive set theory ప్రత్యేక నామం, Tim Button పుస్తక పరిధి, ఈ భాగపు దిగుమతి అమరికకు మూల ఫైలే ఆధారం.'},
];
const added = [];
for (const spec of specs) {
  const unit = manifest[spec.order - 1];
  const unitId = 'OLP-' + String(spec.order).padStart(4, '0');
  if (!unit || unit.unit_id !== unitId || unit.order !== spec.order) throw new Error('Manifest cursor mismatch');
  const sourceRaw = fs.readFileSync(path.join(root, 'upstream', unit.source_path), 'utf8');
  const targetRaw = fs.readFileSync(path.join(root, 'translation', unit.source_path), 'utf8');
  if (sha(sourceRaw) !== unit.source_sha256) throw new Error('Frozen source hash mismatch for ' + unitId);
  const sourceBlocks = blocksWithSpans(sourceRaw);
  const targetBlocks = blocksWithSpans(targetRaw);
  if (sourceBlocks.length !== spec.count || targetBlocks.length !== sourceBlocks.length) {
    throw new Error('Source/target block count mismatch for ' + unitId);
  }
  const passages = spec.passages.map(id => {
    const passage = passageCatalog.get(id);
    if (!passage) throw new Error('Missing inspected canon passage ' + id);
    return passage;
  });
  const structural = new Set(spec.structural);
  for (let index = 0; index < sourceBlocks.length; index++) {
    const number = index + 1;
    const sourceBlock = sourceBlocks[index];
    const targetBlock = targetBlocks[index];
    const segmentId = unitId + '-B' + String(number).padStart(3, '0');
    const sourceCorrections = [...targetBlock.block.matchAll(/\\sourcecorrection\{([^{}]+)\}/gu)].map(match => match[1]);
    if (sourceCorrections.length) throw new Error('Unexpected source correction in ' + segmentId);
    added.push({
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
      classification: structural.has(number) ? 'preserved_metadata_or_structural_segment' : 'translated_linguistic_segment',
      canon_passages: structural.has(number) ? [] : passages,
      source_corrections: [],
      consultation_phase: structural.has(number)
        ? 'not_applicable_nonlinguistic'
        : 'Batch 045లో ' + segmentId + ' మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా చదివి; సూచించిన స్థానిక పేజీలను ప్రత్యక్షంగా చూసి TE-T084/085 నిర్ణయాల పరిమితితో పోల్చాం.',
      evidence_limit: structural.has(number)
        ? 'వాక్యేతర TeX నిర్మాణం, మూల-గుర్తింపు వ్యాఖ్య లేదా దిగుమతి మార్గం; పాఠక గద్యం మానలేదు.'
        : spec.limit,
    });
  }
}
fs.writeFileSync(ledgerPath, [...added, ...retained].map(JSON.stringify).join('\n') + '\n', 'utf8');
const linguistic = added.filter(row => row.classification === 'translated_linguistic_segment').length;
process.stdout.write(JSON.stringify({mode: refresh ? 'refresh' : 'append', units: [...ids], rows: added.length, linguistic, structural: added.length - linguistic}) + '\n');
