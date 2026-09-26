import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) => fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const auditRoot = 'evidence/source-audits/2026-09-26-lambda-fixpoints-telugu/';
const findingsBytes = fs.readFileSync(path.join(root, auditRoot, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(root, auditRoot, 'REVIEW.md'));
const findingsHash = sha(findingsBytes), reviewHash = sha(reviewBytes);
if (findingsHash !== 'a657aebff2dda5be9934a564f10b5fd5c5976dace7759400fbecc189c862824b' ||
    reviewHash !== 'd2a63612cbe5130e8c09419d067917d0b1ca34bf7c43c1147c55caacb3f5e852') {
  throw new Error('Batch 056 source audit changed');
}
const audit = JSON.parse(findingsBytes);
const id = 'OLP-0379';
if (audit.audit_id !== 'OLTELAMLDFPIX-20260926' ||
    audit.scope.unit_ids.join(',') !== id || audit.findings.length !== 5) {
  throw new Error('Unexpected Batch 056 audit scope');
}
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const unit = manifest.find(row => row.unit_id === id);
const file = audit.source_files[0];
if (!unit || unit.order !== 379 || file.path !== unit.source_path || file.sha256 !== unit.source_sha256) {
  throw new Error('Frozen manifest mismatch');
}
const source = read('upstream/' + file.path), target = read('translation/' + file.path);
if (Buffer.byteLength(source) !== file.bytes || sha(source) !== file.sha256) throw new Error('Frozen source mismatch');
const targetLines = target.split(/\r?\n/u);

const termFile = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termFile);
if (terms.length === 96 && terms.at(-1).term_id === 'TE-T096') {
  terms.push({
    term_id: 'TE-T097',
    source_term: 'factorial / recursive self-reference / fixpoint / Y-combinator / beta-equivalence / normal form',
    telugu: 'క్రమగుణిత ప్రమేయం / పునరావృత్త స్వీయ-సూచన / స్థిరబిందువు / Y-సంయోజకం / బీటా-తుల్యత / నియత రూపం',
    status: 'arithmetic_function_and_proof_register_attested_specialist_lambda_fixpoint_and_combinator_source_controlled_provisional',
    passages: ['TE-P005', 'TE-P011', 'TE-P032'],
    basis: 'TE-P005లో సహజ సంఖ్యల అంకగణిత గద్యం, TE-P011లో ప్రమేయం/సంయుక్తం, TE-P032లో తర్క నిరూపణ గద్యాన్ని ప్రత్యక్షంగా చూశాం. ఇవి క్రమగుణితపు స్థానిక పదాన్ని గానీ లాంబ్డా స్థిరబిందు సంయోజకపు ప్రత్యేక సిద్ధాంతాన్ని గానీ నేరుగా స్థాపించవు. క్రమగుణిత ప్రమేయం OLP-0230 పూర్వ లక్ష్య వాడుక; స్థిరబిందువు, సంయోజకం, బీటా-తుల్యత TE-T067, TE-T074, TE-T079 మరియు OLP-0354 పదజాలం. OLP-0379 ట్యూరింగ్/చర్చ్ సూత్రాలు, OLTELAMLDFPIX-001–005 ప్రకటిత సవరణలే ప్రత్యేక భావాన్ని నియంత్రిస్తాయి.',
    uncertainty: 'సాధారణ ప్రమేయం, అంకగణిత/నిరూపణ శైలికి స్థానిక ఆధారం ఉంది. క్రమగుణిత, లాంబ్డా స్థిరబిందు నామకరణానికి ఈ పేజీల్లో ప్రత్యక్ష సాక్ష్యం లేదు; మూల నిర్వచనాలు, పూర్వ స్థిర తెలుగు వాడుక ఆధారంగా తాత్కాలిక ఎంపిక.',
    borrowing: 'లాంబ్డా, బీటా ప్రత్యేక గణిత బదిలీ; ట్యూరింగ్, చర్చ్ మూల వ్యక్తి పేర్లు; Y, Y_C, U, V, Fac, IsZero, Pred, Mult, Add గుర్తింపులుగా యథాతథం.'
  });
  writeJsonl(termFile, terms);
} else if (terms.length !== 97 || terms.at(-1).term_id !== 'TE-T097') {
  throw new Error('Unexpected terminology cursor');
}

const correctionFile = 'evidence/SOURCE_CORRECTIONS.jsonl';
const corrections = jsonl(correctionFile);
const own = corrections.filter(row => row.audit_id === audit.audit_id);
if (own.length && own.length !== 5) throw new Error('Partial Batch 056 correction ledger');
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
      throw new Error('Existing Batch 056 correction mismatch');
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
if (sourceBlocks.length !== 18 || targetBlocks.length !== 18) throw new Error('Expected 18 aligned blocks');
const segmentFile = 'evidence/SEGMENT_CANON_USE.jsonl';
const previous = jsonl(segmentFile);
const retained = previous.filter(row => row.unit_id !== id);
if (retained.length !== previous.length && !process.argv.includes('--refresh')) throw new Error('Use --refresh for existing Batch 056 rows');
const passageCatalog = new Map();
for (const row of previous) for (const passage of row.canon_passages ?? []) {
  if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
}
const passageMap = {
  5: ['TE-P032'], 6: ['TE-P005', 'TE-P011'], 7: ['TE-P011', 'TE-P032'],
  8: ['TE-P011', 'TE-P032'], 9: ['TE-P032'], 10: ['TE-P032'],
  11: ['TE-P032'], 12: ['TE-P032'], 13: ['TE-P032'],
  14: ['TE-P032'], 15: ['TE-P005', 'TE-P011'],
  16: ['TE-P011', 'TE-P032'], 17: ['TE-P011', 'TE-P032']
};
const rows = sourceBlocks.map((block, index) => {
  const number = index + 1, t = targetBlocks[index];
  const linguistic = /[\u0C00-\u0C7F]/u.test(t.block);
  if (linguistic !== (number >= 5 && number <= 17)) throw new Error('Linguistic block mismatch ' + number);
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
      ? `${id} అనువాద సమయంలో ${id}-B${String(number).padStart(3, '0')} మూలం, లక్ష్యాన్ని ఎదురెదురుగా చదివి; నమోదైన స్థానిక పేజీలను ప్రత్యక్షంగా చూసి TE-T067, TE-T074, TE-T079, TE-T096, TE-T097 నిర్ణయాలతో పోల్చాం.`
      : 'not_applicable_nonlinguistic',
    evidence_limit: linguistic
      ? 'స్థానిక పేజీలు అంకగణిత/ప్రమేయ/నిరూపణ గద్యానికి మాత్రమే ఆధారం; క్రమగుణిత ప్రత్యేక నామం లేదా లాంబ్డా స్థిరబిందు సంయోజకాన్ని నేరుగా బోధించవు. స్థిర మూల సూత్రాలు, ప్రకటిత ఐదు సవరణలు ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి.'
      : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, గద్యం ఇందులో దాచలేదు.'
  };
});
writeJsonl(segmentFile, [...retained, ...rows]);
console.log(JSON.stringify({terms: 97, corrections: 5, segments: rows.length,
  linguistic: rows.filter(row => row.classification === 'translated_linguistic_segment').length,
  findings_sha256: findingsHash, review_sha256: reviewHash}));
