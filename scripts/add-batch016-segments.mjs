import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'SEGMENT_CANON_USE.jsonl');
const ownerCanonPath = 'C:\\interlanguage-task-state\\openlogic-te-Telu-IN\\CANON_PASSAGES.jsonl';
const manifestPath = path.join(root, 'evidence', 'SOURCE_MANIFEST.jsonl');
const unitLo = Number(process.argv[2] ?? 149);
const unitHi = Number(process.argv[3] ?? 158);
if (!Number.isInteger(unitLo) || !Number.isInteger(unitHi) || unitLo < 149 || unitHi > 190 || unitLo > unitHi) {
  throw new Error('Usage: node scripts/add-batch016-segments.mjs FIRST LAST (supported 149--190)');
}
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const normalize = value => value.replace(/\r\n/gu, '\n');
const jsonl = file => fs.readFileSync(file, 'utf8').trim().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const blocksWithSpans = raw => {
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
};

const ledgerText = normalize(fs.readFileSync(ledgerPath, 'utf8')).replace(/\n$/u, '');
const existingLines = ledgerText.split('\n').filter(Boolean);
const existing = existingLines.map(JSON.parse);
if (existing.some(row => {
  const match = row.segment_id.match(/^OLP-(\d{4})-/u);
  if (!match) return false;
  const order = Number(match[1]);
  return order >= unitLo && order <= unitHi;
})) {
  throw new Error(`Rows for OLP-${String(unitLo).padStart(4, '0')}–OLP-${String(unitHi).padStart(4, '0')} already exist; refusing duplicate append`);
}
const manifest = jsonl(manifestPath).filter(row => row.order >= unitLo && row.order <= unitHi);
if (manifest.length !== unitHi - unitLo + 1) throw new Error('Manifest bounds are incomplete');
const manifestByUnit = new Map(manifest.map(row => [row.unit_id, row]));
const canon = new Map(jsonl(ownerCanonPath).map(row => [row.passage_id, row]));

const canonByUnit = {
  'OLP-0150': ['TE-P018', 'TE-P027', 'TE-P029', 'TE-P031'],
  'OLP-0151': ['TE-P018', 'TE-P019', 'TE-P020', 'TE-P021', 'TE-P027', 'TE-P029'],
  'OLP-0152': ['TE-P018', 'TE-P021', 'TE-P024', 'TE-P027', 'TE-P029', 'TE-P031'],
  'OLP-0153': ['TE-P018', 'TE-P024', 'TE-P027'],
  'OLP-0154': ['TE-P018', 'TE-P019', 'TE-P020', 'TE-P021'],
  'OLP-0155': ['TE-P024', 'TE-P027', 'TE-P029'],
  'OLP-0156': ['TE-P024', 'TE-P027', 'TE-P032'],
  'OLP-0157': ['TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0158': ['TE-P027', 'TE-P029', 'TE-P030', 'TE-P032'],
  'OLP-0159': ['TE-P027', 'TE-P029'],
  'OLP-0160': ['TE-P018', 'TE-P019', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0161': ['TE-P008', 'TE-P011', 'TE-P012', 'TE-P027', 'TE-P029', 'TE-P030'],
  'OLP-0162': ['TE-P008', 'TE-P011', 'TE-P012', 'TE-P027', 'TE-P030'],
  'OLP-0163': ['TE-P008', 'TE-P011', 'TE-P012', 'TE-P018', 'TE-P019', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0164': ['TE-P008', 'TE-P011', 'TE-P012', 'TE-P018', 'TE-P019', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0165': ['TE-P008', 'TE-P011', 'TE-P012', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030'],
  'OLP-0166': ['TE-P018', 'TE-P019', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0167': ['TE-P018', 'TE-P027', 'TE-P029'],
  'OLP-0168': ['TE-P003', 'TE-P004', 'TE-P018', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0169': ['TE-P008', 'TE-P010', 'TE-P011', 'TE-P012', 'TE-P018', 'TE-P019', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0170': ['TE-P003', 'TE-P004', 'TE-P008', 'TE-P010', 'TE-P011', 'TE-P012', 'TE-P018', 'TE-P019', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0171': ['TE-P008', 'TE-P010', 'TE-P011', 'TE-P012', 'TE-P018', 'TE-P019', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0172': ['TE-P002', 'TE-P003', 'TE-P004', 'TE-P008', 'TE-P010', 'TE-P011', 'TE-P012', 'TE-P018', 'TE-P019', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0173': ['TE-P008', 'TE-P018', 'TE-P019', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0174': ['TE-P018', 'TE-P027', 'TE-P029', 'TE-P031'],
  'OLP-0175': ['TE-P003', 'TE-P004', 'TE-P018', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P031'],
  'OLP-0176': ['TE-P008', 'TE-P010', 'TE-P011', 'TE-P012', 'TE-P018', 'TE-P027', 'TE-P029', 'TE-P030'],
  'OLP-0177': ['TE-P003', 'TE-P004', 'TE-P008', 'TE-P010', 'TE-P011', 'TE-P012', 'TE-P018', 'TE-P019', 'TE-P023', 'TE-P024', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031', 'TE-P032', 'TE-P033'],
  'OLP-0178': ['TE-P003', 'TE-P004', 'TE-P008', 'TE-P011', 'TE-P012', 'TE-P018', 'TE-P019', 'TE-P024', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P032'],
  'OLP-0179': ['TE-P003', 'TE-P004', 'TE-P018', 'TE-P019', 'TE-P023', 'TE-P024', 'TE-P025', 'TE-P026', 'TE-P027', 'TE-P029', 'TE-P031', 'TE-P032', 'TE-P033'],
  'OLP-0180': ['TE-P018', 'TE-P019', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P031'],
  'OLP-0181': ['TE-P018', 'TE-P023', 'TE-P024', 'TE-P027', 'TE-P029', 'TE-P031'],
  'OLP-0182': ['TE-P003', 'TE-P004', 'TE-P018', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0183': ['TE-P018', 'TE-P027', 'TE-P029', 'TE-P030'],
  'OLP-0184': ['TE-P008', 'TE-P011', 'TE-P012', 'TE-P018', 'TE-P023', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0185': ['TE-P008', 'TE-P011', 'TE-P012', 'TE-P015', 'TE-P018', 'TE-P027', 'TE-P029', 'TE-P030'],
  'OLP-0186': ['TE-P003', 'TE-P004', 'TE-P016', 'TE-P018', 'TE-P023', 'TE-P026', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0187': ['TE-P003', 'TE-P004', 'TE-P008', 'TE-P011', 'TE-P012', 'TE-P015', 'TE-P016', 'TE-P018', 'TE-P023', 'TE-P024', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0188': ['TE-P003', 'TE-P004', 'TE-P016', 'TE-P018', 'TE-P019', 'TE-P023', 'TE-P026', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
  'OLP-0189': ['TE-P003', 'TE-P004', 'TE-P008', 'TE-P011', 'TE-P012', 'TE-P015', 'TE-P016', 'TE-P018', 'TE-P019', 'TE-P023', 'TE-P024', 'TE-P026', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031', 'TE-P032', 'TE-P033'],
  'OLP-0190': ['TE-P003', 'TE-P004', 'TE-P008', 'TE-P011', 'TE-P012', 'TE-P015', 'TE-P016', 'TE-P018', 'TE-P023', 'TE-P024', 'TE-P027', 'TE-P029', 'TE-P030', 'TE-P031'],
};
const correctionIds = block => [...block.matchAll(/\\sourcecorrection\{([^{}]+)\}/gu)].map(match => match[1]);
const passageRows = ids => ids.map(id => {
  const row = canon.get(id);
  if (!row) throw new Error(`Missing owner canon passage ${id}`);
  return {
    passage_id: id,
    source_sha256: row.source_sha256,
    ...(row.pdf_page !== undefined ? { pdf_page: row.pdf_page } : { pdf_pages: row.pdf_pages }),
    role: row.role,
  };
});

const rows = [];
for (const unit of manifest) {
  const sourcePath = path.join(root, 'upstream', unit.source_path);
  const targetPath = path.join(root, 'translation', unit.source_path);
  const sourceRaw = fs.readFileSync(sourcePath, 'utf8');
  const targetRaw = fs.readFileSync(targetPath, 'utf8');
  const sourceBlocks = blocksWithSpans(sourceRaw);
  const targetBlocks = blocksWithSpans(targetRaw);
  if (sourceBlocks.length !== targetBlocks.length) throw new Error(`${unit.unit_id}: block mismatch`);
  const passages = passageRows(canonByUnit[unit.unit_id] ?? []);
  sourceBlocks.forEach((sourceBlock, index) => {
    const targetBlock = targetBlocks[index];
    const segmentId = `${unit.unit_id}-B${String(index + 1).padStart(3, '0')}`;
    const trimmed = targetBlock.block.trim();
    const structural = /^(?:%[^\n]*(?:\n%[^\n]*)*|\\documentclass[\s\S]*|\\begin\{document\}|\\olfileid[\s\S]*|\\olimport(?:\[[^\]]+\])?\{[^{}]+\}|\\OLEnd(?:Chapter|Part)Hook|\\end\{document\})$/u.test(trimmed);
    const corrections = correctionIds(targetBlock.block);
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
      source_corrections: corrections,
      consultation_phase: structural
        ? 'not_applicable_nonlinguistic'
        : unit.order >= 182
          ? `Contemporaneous Batch 021 choice ${segmentId}; exact source/target bytes were read in full and checked against the listed canon passages and TE-T031, TE-T041, TE-T047, TE-T055--TE-T057 as applicable.`
        : unit.order >= 174
          ? `Contemporaneous Batch 020 choice ${segmentId}; exact source/target bytes were read in full and checked against the listed canon passages and TE-T044, TE-T050--TE-T054 as applicable.`
          : unit.order >= 167
          ? `Contemporaneous Batch 019 choice ${segmentId}; exact source/target bytes were read in full and checked against the listed canon passages and TE-T044, TE-T047--TE-T049 as applicable.`
          : unit.order >= 159
            ? `Later-revalidation choice ${segmentId}; exact source/target bytes were rechecked against the first-order semantic register and ${unit.order >= 165 ? 'TE-T044--TE-T046' : unit.order >= 163 ? 'TE-T044--TE-T045' : 'TE-T044'} after direct source/target reading.`
            : `Later-revalidation choice ${segmentId}; exact source/target bytes were rechecked against the syntax-register canon and TE-T043 after the formal-logic syntax audit.`,
      evidence_limit: structural
        ? 'TeX wrappers, comments with stable source identities, import paths, formal notation or end-document markers; no reader prose omitted.'
        : unit.order >= 182
          ? 'The cited native passages support broad Telugu set, function, domain, first-order, sentence, proof, truth, equivalence and countability register. They do not directly attest every model-theoretic headword; the frozen reduct, substructure, isomorphism, finite-rank and dense-order definitions plus TE-T031, TE-T041, TE-T047 and TE-T055--TE-T057 control the exact senses.'
        : unit.order >= 174
          ? 'The cited native passages support the broad Telugu set, relation, function, proof, truth, consequence and first-order register. They do not directly attest every many-sorted, higher-order, intuitionistic, modal or nonclassical headword; the frozen definitions and formulas plus TE-T044 and TE-T050--TE-T054 control those exact senses.'
          : unit.order >= 167
          ? 'The cited native passages support the broad Telugu set, relation, function, proof, truth, consequence and first-order register. They do not directly attest every axiomatic, definability, set-foundational or mereological headword; the frozen definitions and formulas plus TE-T044 and TE-T047--TE-T049 control those exact senses.'
          : unit.order >= 159
            ? 'The cited native passages support the broad Telugu first-order, domain, element, function, truth and consequence register. They do not directly attest every model-theoretic headword; exact OpenLogic definitions, structures, assignment variants and satisfaction conditions remain controlled by the frozen source and TE-T044--TE-T045.'
            : 'TE-P018--TE-P033 support the broad Telugu formal-logic register and the recorded syntax constructions. Exact OpenLogic syntax compounds, definitions, formulas and proof claims remain controlled by the frozen source; source corrections are disclosed locally and in SOURCE_CORRECTIONS.jsonl.',
    });
  });
}

process.stdout.write('*** Begin Patch\n');
process.stdout.write(`*** Update File: ${ledgerPath}\n`);
process.stdout.write(` ${existingLines.at(-1)}\n`);
for (const row of rows) process.stdout.write(`+${JSON.stringify(row)}\n`);
process.stdout.write('*** End Patch\n');
