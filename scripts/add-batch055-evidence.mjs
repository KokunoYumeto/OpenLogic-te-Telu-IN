import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) => fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const auditRoot = 'evidence/source-audits/2026-09-26-lambda-primitive-recursion-telugu/';
const auditBytes = fs.readFileSync(path.join(root, auditRoot, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(root, auditRoot, 'REVIEW.md'));
const findingsHash = sha(auditBytes), reviewHash = sha(reviewBytes);
if (findingsHash !== '6f4156b4b1e2a2fd778c23d1a3747fdf30e85daf203605f000373606f5862fc4' ||
    reviewHash !== 'bb0dae10365010a31c5889cfea6eccf76edd494e718863d6c7f1757ee0042db3') {
  throw new Error('Batch 055 source audit changed');
}
const audit = JSON.parse(auditBytes);
const id = 'OLP-0378';
if (audit.audit_id !== 'OLTELAMLDFPRF-20260926' ||
    audit.scope.unit_ids.join(',') !== id || audit.findings.length !== 2) {
  throw new Error('Unexpected Batch 055 audit scope');
}
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const unit = manifest.find(row => row.unit_id === id);
const file = audit.source_files[0];
if (!unit || unit.order !== 378 || file.path !== unit.source_path || file.sha256 !== unit.source_sha256) {
  throw new Error('Frozen manifest mismatch');
}
const source = read('upstream/' + file.path), target = read('translation/' + file.path);
if (Buffer.byteLength(source) !== file.bytes || sha(source) !== file.sha256) throw new Error('Frozen source mismatch');
const sourceLines = source.split(/\r?\n/u), targetLines = target.split(/\r?\n/u);

const termFile = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termFile);
if (terms.length === 95 && terms.at(-1).term_id === 'TE-T095') {
  terms.push({
    term_id: 'TE-T096',
    source_term: 'primitive recursive function / composition / projection / primitive recursion / lambda-definable closure',
    telugu: 'ఆదిమ పునరావృత్త ప్రమేయం / సంయుక్తం / ప్రక్షేప ప్రమేయం / ఆదిమ పునరావృత్తి / లాంబ్డాతో నిర్వచించదగిన ప్రమేయాల సంవృతత్వం',
    status: 'function_and_composition_register_attested_specialist_recursion_lambda_encoding_source_controlled_provisional',
    passages: ['TE-P011', 'TE-P032', 'TE-P034'],
    basis: 'TE-P011లో ప్రమేయం, సంయుక్త ప్రమేయం, TE-P032లో గణిత నిరూపణ/ఆగమన శైలి, TE-P034లో క్రమయుగ్మం ప్రత్యక్షంగా చూశాం. వాటిని గత TE-T064, TE-T079, TE-T093, TE-T094తో పోల్చి ఇదే రూపాలను కొనసాగించాం. ఈ పేజీలు చర్చ్ సంఖ్యాంకాల పునరావర్తనం లేదా ఆదిమ పునరావృత్త ప్రమేయాల లాంబ్డా సంకేతీకరణను నేరుగా స్థాపించవు; OLP-0378 నిర్మాణం, OLTELAMLDFPRF-001–002 ప్రకటిత సవరణలే ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి.',
    uncertainty: 'ప్రమేయం, సంయుక్తం, క్రమయుగ్మం సాధారణ రూపాలకు స్థానిక ఆధారం ఉంది; ఆదిమ పునరావృత్తి లాంబ్డా నిర్మాణానికి ప్రత్యక్ష స్థానిక సాక్ష్యం లేదు. n-స్థానిక, n+2-స్థానిక ప్రమేయాల వాదన మూల గణిత అర్థం ప్రకారం నిలిచింది.',
    borrowing: 'లాంబ్డా, చర్చ్ ప్రత్యేక గణిత బదిలీ; Zero, Succ, Proj, F, G, H, D, Fst, Snd, \\tuple, \\num గుర్తింపులుగా యథాతథం.'
  });
  writeJsonl(termFile, terms);
} else if (terms.length !== 96 || terms.at(-1).term_id !== 'TE-T096') {
  throw new Error('Unexpected terminology cursor');
}

const correctionFile = 'evidence/SOURCE_CORRECTIONS.jsonl';
const corrections = jsonl(correctionFile);
const own = corrections.filter(row => row.audit_id === audit.audit_id);
if (own.length && own.length !== 2) throw new Error('Partial Batch 055 correction ledger');
if (!own.length) {
  for (const finding of audit.findings) {
    const marker = `\\sourcecorrection{${finding.finding_id}}`;
    const targetLine = targetLines.findIndex(line => line.includes(marker)) + 1;
    if (targetLine < 1 || targetLines.filter(line => line.includes(marker)).length !== 1) {
      throw new Error('Missing or duplicated source correction ' + finding.finding_id);
    }
    corrections.push({
      finding_id: finding.finding_id,
      audit_id: audit.audit_id,
      audit_review_sha256: reviewHash,
      audit_findings_sha256: findingsHash,
      unit_id: id,
      source_path: file.path,
      source_sha256: file.sha256,
      source_locator: finding.source_locator,
      target_locator: `translation/${file.path}:${targetLine}`,
      classification: finding.classification,
      body_treatment: finding.required_translation_handling,
      expected_core_math_delta: {source_only: [], target_only: []},
      expected_protected_identifier_delta: {source_only: [], target_only: []},
      status: 'pending_math_adjudication'
    });
  }
  writeJsonl(correctionFile, corrections);
} else {
  for (const finding of audit.findings) {
    const row = own.find(item => item.finding_id === finding.finding_id);
    if (!row || row.source_sha256 !== file.sha256 ||
        !targetLines[Number(row.target_locator.split(':').at(-1)) - 1]?.includes(`\\sourcecorrection{${finding.finding_id}}`)) {
      throw new Error('Existing Batch 055 correction mismatch');
    }
  }
}

function blocksWithSpans(raw) {
  const normalized = raw.replace(/\r\n/gu, '\n');
  const blocks = normalized.trim().split(/\n\s*\n/u);
  let cursor = 0;
  return blocks.map(block => {
    const start = normalized.indexOf(block, cursor);
    if (start < 0) throw new Error('Could not locate aligned block');
    const startLine = normalized.slice(0, start).split('\n').length;
    cursor = start + block.length;
    return {block, startLine, endLine: startLine + block.split('\n').length - 1};
  });
}
const sourceBlocks = blocksWithSpans(source), targetBlocks = blocksWithSpans(target);
if (sourceBlocks.length !== 21 || targetBlocks.length !== 21) throw new Error('Expected 21 aligned blocks');
const segmentFile = 'evidence/SEGMENT_CANON_USE.jsonl';
const previous = jsonl(segmentFile);
const retained = previous.filter(row => row.unit_id !== id);
if (retained.length !== previous.length && !process.argv.includes('--refresh')) throw new Error('Use --refresh for existing Batch 055 rows');
const passageCatalog = new Map();
for (const row of previous) for (const passage of row.canon_passages ?? []) {
  if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
}
const passageMap = {
  4: ['TE-P011'], 5: ['TE-P011'], 6: ['TE-P011'], 7: ['TE-P011'],
  8: ['TE-P011'], 9: ['TE-P011', 'TE-P032'], 10: ['TE-P032'],
  11: ['TE-P011'], 12: ['TE-P011'], 13: ['TE-P011', 'TE-P032'],
  14: ['TE-P011', 'TE-P034'], 15: ['TE-P032', 'TE-P034'],
  16: ['TE-P032', 'TE-P034'], 17: ['TE-P032', 'TE-P034'],
  18: ['TE-P032'], 19: ['TE-P011'], 20: ['TE-P011', 'TE-P032']
};
const rows = sourceBlocks.map((block, index) => {
  const number = index + 1, t = targetBlocks[index];
  const linguistic = /[\u0C00-\u0C7F]/u.test(t.block);
  if (linguistic !== (number >= 4 && number <= 20)) throw new Error('Linguistic block mismatch ' + number);
  const passageIds = passageMap[number] ?? [];
  if (linguistic !== Boolean(passageIds.length)) throw new Error('Passage scope mismatch ' + number);
  const canonPassages = passageIds.map(passageId => {
    const passage = passageCatalog.get(passageId);
    if (!passage) throw new Error('Missing inspected passage ' + passageId);
    return passage;
  });
  return {
    segment_id: `${id}-B${String(number).padStart(3, '0')}`,
    unit_id: id,
    source_path: file.path,
    source_unit_sha256: sha(source),
    translation_unit_sha256: sha(target),
    source_start_line: block.startLine,
    source_end_line: block.endLine,
    target_start_line: t.startLine,
    target_end_line: t.endLine,
    source_segment_sha256: sha(block.block),
    translation_segment_sha256: sha(t.block),
    classification: linguistic ? 'translated_linguistic_segment' : 'preserved_metadata_or_structural_segment',
    canon_passages: canonPassages,
    source_corrections: [...t.block.matchAll(/\\sourcecorrection\{([^{}]+)\}/gu)].map(match => match[1]),
    consultation_phase: linguistic
      ? `${id} అనువాద సమయంలో ${id}-B${String(number).padStart(3, '0')} మూలం, లక్ష్యాన్ని ఎదురెదురుగా చదివి; ఈ ఖండానికి నమోదైన స్థానిక పేజీలను ప్రత్యక్షంగా చూసి TE-T064, TE-T079, TE-T093, TE-T094, TE-T096 నిర్ణయాలతో పోల్చాం.`
      : 'not_applicable_nonlinguistic',
    evidence_limit: linguistic
      ? 'స్థానిక పేజీలు ప్రమేయం/సంయుక్తం, క్రమయుగ్మం, నిరూపణ గద్యానికి ఆధారం; చర్చ్ పునరావర్తకం, దశ స్థితి సంకేతీకరణకు ప్రత్యక్ష సాక్ష్యం కాదు. స్థిర మూల సూత్రాలు, ప్రకటిత రెండు సవరణలు ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి.'
      : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, గద్యం ఇందులో దాచలేదు.'
  };
});
writeJsonl(segmentFile, [...retained, ...rows]);
console.log(JSON.stringify({terms: 96, corrections: 2, segments: rows.length,
  linguistic: rows.filter(row => row.classification === 'translated_linguistic_segment').length,
  findings_sha256: findingsHash, review_sha256: reviewHash}));
