import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'SEGMENT_CANON_USE.jsonl');
const manifestPath = path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl');
const first = 280;
const last = 288;
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
if (existing.some(row => {
  const match = row.segment_id.match(/^OLP-(\d{4})-/u);
  return match && Number(match[1]) >= first && Number(match[1]) <= last;
})) throw new Error('Batch 032 segment rows already exist');

const manifest = jsonl(manifestPath).filter(row => row.order >= first && row.order <= last);
if (manifest.length !== last - first + 1) throw new Error('Manifest bounds are incomplete');

const passageCatalog = new Map();
for (const row of existing) {
  for (const passage of row.canon_passages ?? []) {
    if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
  }
}
const canonByUnit = {
  'OLP-0280': ['TE-P018', 'TE-P024', 'TE-P027', 'TE-P032'],
  'OLP-0281': ['TE-P003', 'TE-P005', 'TE-P008', 'TE-P010', 'TE-P011', 'TE-P018', 'TE-P024', 'TE-P027', 'TE-P028', 'TE-P032', 'TE-P034'],
  'OLP-0282': ['TE-P005', 'TE-P008', 'TE-P010', 'TE-P011', 'TE-P018', 'TE-P027', 'TE-P028', 'TE-P034'],
  'OLP-0283': ['TE-P003', 'TE-P005', 'TE-P008', 'TE-P010', 'TE-P011', 'TE-P018', 'TE-P024', 'TE-P027', 'TE-P028', 'TE-P032', 'TE-P034'],
  'OLP-0284': ['TE-P003', 'TE-P005', 'TE-P008', 'TE-P010', 'TE-P011', 'TE-P018', 'TE-P024', 'TE-P025', 'TE-P027', 'TE-P028', 'TE-P032', 'TE-P034'],
  'OLP-0285': ['TE-P003', 'TE-P005', 'TE-P010', 'TE-P011', 'TE-P018', 'TE-P024', 'TE-P027', 'TE-P028', 'TE-P032'],
  'OLP-0286': ['TE-P003', 'TE-P005', 'TE-P008', 'TE-P010', 'TE-P011', 'TE-P018', 'TE-P024', 'TE-P025', 'TE-P027', 'TE-P028', 'TE-P029', 'TE-P032', 'TE-P033', 'TE-P034'],
  'OLP-0287': ['TE-P003', 'TE-P005', 'TE-P008', 'TE-P010', 'TE-P011', 'TE-P018', 'TE-P024', 'TE-P025', 'TE-P027', 'TE-P028', 'TE-P029', 'TE-P032', 'TE-P033', 'TE-P034'],
  'OLP-0288': ['TE-P003', 'TE-P005', 'TE-P008', 'TE-P010', 'TE-P011', 'TE-P018', 'TE-P024', 'TE-P025', 'TE-P027', 'TE-P028', 'TE-P029', 'TE-P032', 'TE-P033', 'TE-P034'],
};

const rows = [];
for (const unit of manifest) {
  const sourceRaw = fs.readFileSync(path.join(root, 'upstream', unit.source_path), 'utf8');
  const targetRaw = fs.readFileSync(path.join(root, 'translation', unit.source_path), 'utf8');
  const sourceBlocks = blocksWithSpans(sourceRaw);
  const targetBlocks = blocksWithSpans(targetRaw);
  if (sourceBlocks.length !== targetBlocks.length) throw new Error(`${unit.unit_id}: block mismatch`);
  const passages = canonByUnit[unit.unit_id].map(id => {
    const passage = passageCatalog.get(id);
    if (!passage) throw new Error(`Missing canon passage ${id}`);
    return passage;
  });
  sourceBlocks.forEach((sourceBlock, index) => {
    const targetBlock = targetBlocks[index];
    const segmentId = `${unit.unit_id}-B${String(index + 1).padStart(3, '0')}`;
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
        : `Contemporaneous Batch 032 choice ${segmentId}; exact source and Telugu target were read in full and checked against the listed native passages and TE-T011, TE-T020, TE-T024, TE-T028, TE-T033, TE-T034, TE-T070 and TE-T071 as applicable.`,
      evidence_limit: structural
        ? 'TeX wrappers, comments with stable source identities, protected identifiers, import paths or end-document markers; no reader prose omitted.'
        : 'The cited native passages support Telugu number, sequence, ordered-tuple, set, relation, function, formal-logic, derivation, inference and proof register. They do not directly attest Gödel numbering, formation-sequence coding, arithmetized substitution, recursive proof verification or proof predicates. The frozen definitions, tuple layouts, recursions and verification formulas plus TE-T071 control those specialized senses. OLTEART-001--014 are source-audit decisions, not language-canon claims.',
    });
  });
}

const output = `${existingLines.join('\n')}\n${rows.map(JSON.stringify).join('\n')}\n`;
fs.writeFileSync(ledgerPath, output, 'utf8');
const translated = rows.filter(row => row.classification === 'translated_linguistic_segment').length;
const structural = rows.length - translated;
process.stdout.write(`${JSON.stringify({ units: manifest.length, rows: rows.length, translated, structural, first, last })}\n`);
