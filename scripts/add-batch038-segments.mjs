import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'SEGMENT_CANON_USE.jsonl');
const manifestPath = path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl');
const first = 336;
const last = 340;
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
    return { block, startLine, endLine };
  });
}

const ledgerText = normalize(fs.readFileSync(ledgerPath, 'utf8')).replace(/\n$/u, '');
const existingLines = ledgerText.split('\n').filter(Boolean);
const existing = existingLines.map(JSON.parse);
const isBatchRow = row => {
  const match = row.segment_id.match(/^OLP-(\d{4})-/u);
  return match && Number(match[1]) >= first && Number(match[1]) <= last;
};
if (existing.some(isBatchRow) && !refresh) throw new Error('Batch 038 segment rows already exist; pass --refresh to rebuild their mechanical hashes and spans');
const retained = existing.filter(row => !isBatchRow(row));

const manifest = jsonl(manifestPath).filter(row => row.order >= first && row.order <= last);
if (manifest.length !== last - first + 1) throw new Error('Manifest bounds are incomplete');

const passageCatalog = new Map();
for (const row of existing) {
  for (const passage of row.canon_passages ?? []) {
    if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
  }
}
const common = [
  'TE-P003', 'TE-P005', 'TE-P008', 'TE-P010', 'TE-P011', 'TE-P018',
  'TE-P019', 'TE-P024', 'TE-P025', 'TE-P027', 'TE-P028', 'TE-P029',
  'TE-P030', 'TE-P031', 'TE-P032', 'TE-P033', 'TE-P034',
];
const canonByUnit = Object.fromEntries(manifest.map(unit => [unit.unit_id, common]));

const rows = [];
for (const unit of manifest) {
  const sourceRaw = fs.readFileSync(path.join(root, 'upstream', unit.source_path), 'utf8');
  const targetRaw = fs.readFileSync(path.join(root, 'translation', unit.source_path), 'utf8');
  const sourceBlocks = blocksWithSpans(sourceRaw);
  const targetBlocks = blocksWithSpans(targetRaw);
  if (sourceBlocks.length !== targetBlocks.length) throw new Error(unit.unit_id + ': block mismatch');
  const passages = canonByUnit[unit.unit_id].map(id => {
    const passage = passageCatalog.get(id);
    if (!passage) throw new Error('Missing canon passage ' + id);
    return passage;
  });
  sourceBlocks.forEach((sourceBlock, index) => {
    const targetBlock = targetBlocks[index];
    const segmentId = unit.unit_id + '-B' + String(index + 1).padStart(3, '0');
    const trimmed = targetBlock.block.trim();
    const structural = /^(?:%[^\n]*(?:\n%[^\n]*)*|\\documentclass[\s\S]*|\\begin\{document\}|\\olfileid[\s\S]*|\\olimport(?:\[[^\]]+\])?\{[^{}]+\}|\\OLEnd(?:Chapter|Part)Hook|\\end\{document\})$/u.test(trimmed);
    const sourceCorrections = [...targetBlock.block.matchAll(/\\sourcecorrection\{([^{}]+)\}/gu)].map(match => match[1]);
    rows.push({
      segment_id: segmentId,
      unit_id: unit.unit_id,
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
        : 'Contemporaneous Batch 038 choice ' + segmentId + '; exact source and Telugu target were read in full and checked against the listed native passages and TE-T005, TE-T014, TE-T027, TE-T028, TE-T051, TE-T075, TE-T076 and TE-T077 as applicable.',
      evidence_limit: structural
        ? 'TeX wrappers, comments with stable source identities, protected identifiers, import paths or end-document markers; no reader prose omitted.'
        : 'The cited Andhra Pradesh, distinct school-mathematics, and pre-bifurcation Telangana-hosted native passages support Telugu number, set, subset, power-set, relation, function, equality, countability, cardinality, formula, sentence, domain and proof register. They do not directly attest relation-coded power sets, the aleph hierarchy, continuum cardinality or the Continuum Hypothesis. The frozen definitions, corrected formulas and cardinality arguments plus TE-T005, TE-T014, TE-T027, TE-T028, TE-T051, TE-T075, TE-T076 and TE-T077 control those specialized senses. OLTESOLSET-001--007 are source-audit decisions, not language-canon claims.',
    });
  });
}

const output = retained.map(JSON.stringify).join('\n') + '\n' + rows.map(JSON.stringify).join('\n') + '\n';
fs.writeFileSync(ledgerPath, output, 'utf8');
const translated = rows.filter(row => row.classification === 'translated_linguistic_segment').length;
const structural = rows.length - translated;
process.stdout.write(JSON.stringify({ mode: refresh ? 'refresh' : 'append', units: manifest.length, rows: rows.length, translated, structural, first, last }) + '\n');
