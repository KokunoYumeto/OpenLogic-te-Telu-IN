import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) => fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const auditRoot = 'evidence/source-audits/2026-09-26-lambda-definability-completion-telugu/';
const findingsBytes = fs.readFileSync(path.join(root, auditRoot, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(root, auditRoot, 'REVIEW.md'));
const findingsHash = sha(findingsBytes), reviewHash = sha(reviewBytes);
if (findingsHash !== '6b8c399e701c59b69eb2e4ed404e79682cb2f1bf4e5b5e2897cff0ccb9507003' ||
    reviewHash !== '13ee21fc7096be7cab2fc9a37f46adabf402667ef16aa7424c48b48b62a6a871') {
  throw new Error('Batch 057 source audit changed');
}
const audit = JSON.parse(findingsBytes);
const ids = ['OLP-0380', 'OLP-0381', 'OLP-0382'];
if (audit.audit_id !== 'OLTELAMLDFEND-20260926' ||
    audit.scope.unit_ids.join(',') !== ids.join(',') || audit.findings.length !== 4) {
  throw new Error('Unexpected Batch 057 audit scope');
}
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const sourceAndTarget = new Map();
for (const [index, id] of ids.entries()) {
  const unit = manifest.find(row => row.unit_id === id);
  const file = audit.source_files.find(row => row.unit_id === id);
  if (!unit || unit.order !== 380 + index || !file || file.path !== unit.source_path ||
      file.sha256 !== unit.source_sha256 || file.bytes !== unit.source_bytes) {
    throw new Error('Frozen manifest mismatch ' + id);
  }
  const source = read('upstream/' + file.path);
  const target = read('translation/' + file.path);
  if (Buffer.byteLength(source) !== file.bytes || sha(source) !== file.sha256) {
    throw new Error('Frozen source mismatch ' + id);
  }
  sourceAndTarget.set(id, {file, source, target});
}

const termFile = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termFile);
if (terms.length === 97 && terms.at(-1).term_id === 'TE-T097') {
  terms.push({
    term_id: 'TE-T098',
    source_term: 'regular minimization / general recursive function / partial recursive function / unbounded search / undefined value / normal form',
    telugu: 'సక్రమ కనిష్ఠీకరణ / సామాన్య పునరావృత్త ప్రమేయం / పాక్షిక పునరావృత్త ప్రమేయం / అపరిమిత అన్వేషణ / నిర్వచితం కాని విలువ / నియత రూపం',
    status: 'function_composition_arithmetic_and_proof_register_attested_specialist_recursion_and_lambda_partiality_source_controlled_provisional',
    passages: ['TE-P005', 'TE-P011', 'TE-P027', 'TE-P032'],
    basis: 'TE-P005లో సహజ సంఖ్యలు, ప్రధాన సంఖ్యల గద్యం; TE-P011లో ప్రమేయం, సంయుక్తం; TE-P027లో పదాల తర్క శైలి; TE-P032లో నిరూపణ గద్యం ప్రత్యక్షంగా చూశాం. ఇవి సక్రమ కనిష్ఠీకరణ, పాక్షిక పునరావృత్తి లేదా లాంబ్డా నియత రూపాన్ని నేరుగా స్థాపించవు. TE-T065, TE-T078, TE-T079, TE-T097 పూర్వ నిర్ణయాలు, OLP-0380–0381 స్థిర మూల నిర్వచనాలు, OLTELAMLDFMIN-001–003 ప్రకటిత సవరణలు ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి.',
    uncertainty: 'సాధారణ ప్రమేయం, సంఖ్యల, నిరూపణ శైలికి స్థానిక ఆధారం ఉంది; సక్రమత, పాక్షికత, నియత రూపం పేర్లు ఈ పేజీలలో ప్రత్యక్షంగా లేవు. నిర్వచిత/అనిర్వచిత భేదం మూల ప్రతిదృష్టాంతం, పూర్వ తెలుగు వాడుకతో నియంత్రితమైన తాత్కాలిక ఎంపిక.',
    borrowing: 'లాంబ్డా ప్రత్యేక గణిత బదిలీ; F, G, H, Y, Search, IsZero, Succ మరియు TeX గణిత సూచనలు గుర్తింపులుగా యథాతథం.'
  }, {
    term_id: 'TE-T099',
    source_term: 'arithmetization / Gödel number / power-of-primes sequence coding / normalization / Church numeral / converse theorem',
    telugu: 'అంకీకరణ / గోడెల్ సంఖ్య / ప్రధాన సంఖ్యల ఘాతాల ద్వారా శ్రేణి సంకేతీకరణ / నియత రూపం పొందడం / చర్చ్ సంఖ్యాంకం / విలోమ సిద్ధాంతం',
    status: 'prime_number_function_and_proof_register_attested_specialist_godel_coding_and_lambda_normalization_source_controlled_provisional',
    passages: ['TE-P005', 'TE-P011', 'TE-P027', 'TE-P032'],
    basis: 'TE-P005 ప్రధాన సంఖ్య, సంఖ్యా అంకగణిత గద్యానికి; TE-P011 ప్రమేయానికి; TE-P027 పదాల తర్క శైలికి; TE-P032 సిద్ధాంత/నిరూపణ గద్యానికి ప్రత్యక్ష ఆధారం. ఇవి గోడెల్ అంకీకరణను లేదా చర్చ్ సంఖ్యాంకాల నియత రూపాన్ని నేరుగా బోధించవు. TE-T065, TE-T078, TE-T079 పూర్వ నిర్ణయాలు, OLP-0382 మూలంలోని toChurch–normalize–fromChurch క్రమం, OLTELAMLDFLDR-001 ప్రకటిత గుర్తింపు సవరణ ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి.',
    uncertainty: 'సాధారణ అంకగణిత/ప్రమేయ/నిరూపణ నమోదు స్థానికంగా కనిపిస్తుంది. అంకీకరణ, గోడెల్ సంఖ్య, సామాన్యీకరణ ప్రత్యేక నామకరణం మూల గణిత నిర్మాణం మరియు పూర్వ వాడుక ఆధారంగా తాత్కాలికం; మూలం నిరూపణ రూపురేఖలనే ఇస్తుంది.',
    borrowing: 'గోడెల్, చర్చ్ మూల వ్యక్తి పేర్ల ధ్వన్యనుకరణ; normalize, toChurch, fromChurch, Gn, F, n_i రక్షిత గణిత/కోడ్ గుర్తింపులుగా యథాతథం.'
  });
  writeJsonl(termFile, terms);
} else if (terms.length !== 99 || terms.at(-1).term_id !== 'TE-T099') {
  throw new Error('Unexpected terminology cursor');
}

const correctionFile = 'evidence/SOURCE_CORRECTIONS.jsonl';
const corrections = jsonl(correctionFile);
const own = corrections.filter(row => row.audit_id === audit.audit_id);
if (own.length && own.length !== 4) throw new Error('Partial Batch 057 correction ledger');
if (!own.length) {
  for (const finding of audit.findings) {
    const {file, target} = sourceAndTarget.get(finding.unit_id);
    const marker = `\\sourcecorrection{${finding.finding_id}}`;
    const targetLines = target.split(/\r?\n/u);
    const targetLine = targetLines.findIndex(line => line.includes(marker)) + 1;
    if (targetLine < 1 || targetLines.filter(line => line.includes(marker)).length !== 1) {
      throw new Error('Missing or duplicated source correction ' + finding.finding_id);
    }
    corrections.push({
      finding_id: finding.finding_id,
      audit_id: audit.audit_id,
      audit_review_sha256: reviewHash,
      audit_findings_sha256: findingsHash,
      unit_id: finding.unit_id,
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
    const {file, target} = sourceAndTarget.get(finding.unit_id);
    if (!row || row.source_sha256 !== file.sha256 ||
        !target.split(/\r?\n/u)[Number(row.target_locator.split(':').at(-1)) - 1]?.includes(`\\sourcecorrection{${finding.finding_id}}`)) {
      throw new Error('Existing Batch 057 correction mismatch');
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
const segmentFile = 'evidence/SEGMENT_CANON_USE.jsonl';
const previous = jsonl(segmentFile);
const retained = previous.filter(row => !ids.includes(row.unit_id));
if (retained.length !== previous.length && !process.argv.includes('--refresh')) {
  throw new Error('Use --refresh for existing Batch 057 rows');
}
const passageCatalog = new Map();
for (const row of previous) for (const passage of row.canon_passages ?? []) {
  if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
}
const passageMap = {
  'OLP-0380': {4: ['TE-P011'], 5: ['TE-P005', 'TE-P011'], 6: ['TE-P011', 'TE-P032'], 7: ['TE-P011', 'TE-P032'], 8: ['TE-P011', 'TE-P032'], 9: ['TE-P011', 'TE-P032'], 10: ['TE-P011', 'TE-P032']},
  'OLP-0381': {4: ['TE-P011'], 5: ['TE-P011', 'TE-P032'], 6: ['TE-P011', 'TE-P032'], 7: ['TE-P027', 'TE-P032'], 8: ['TE-P011', 'TE-P032']},
  'OLP-0382': {4: ['TE-P011', 'TE-P032'], 5: ['TE-P011', 'TE-P032'], 6: ['TE-P011', 'TE-P032'], 7: ['TE-P005', 'TE-P027', 'TE-P032'], 8: ['TE-P005', 'TE-P011', 'TE-P032']}
};
const rows = [];
for (const id of ids) {
  const {file, source, target} = sourceAndTarget.get(id);
  const sourceBlocks = blocksWithSpans(source), targetBlocks = blocksWithSpans(target);
  const expectedBlocks = id === 'OLP-0380' ? 11 : 9;
  if (sourceBlocks.length !== expectedBlocks || targetBlocks.length !== expectedBlocks) {
    throw new Error('Aligned block count changed ' + id);
  }
  sourceBlocks.forEach((block, index) => {
    const number = index + 1, t = targetBlocks[index];
    const linguistic = /[\u0C00-\u0C7F]/u.test(t.block);
    const expectedLinguistic = number >= 4 && number < expectedBlocks;
    if (linguistic !== expectedLinguistic) throw new Error('Linguistic block mismatch ' + id + '-' + number);
    const passageIds = passageMap[id][number] ?? [];
    if (linguistic !== Boolean(passageIds.length)) throw new Error('Passage scope mismatch ' + id + '-' + number);
    const canonPassages = passageIds.map(passageId => {
      const passage = passageCatalog.get(passageId);
      if (!passage) throw new Error('Missing inspected passage ' + passageId);
      return passage;
    });
    rows.push({
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
        ? `${id} అనువాద సమయంలో ${id}-B${String(number).padStart(3, '0')} మూలం, లక్ష్యాన్ని ఎదురెదురుగా చదివి; నమోదైన స్థానిక పేజీలను ప్రత్యక్షంగా చూసి TE-T065, TE-T078, TE-T079, TE-T097–TE-T099 నిర్ణయాలతో పోల్చాం.`
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? 'స్థానిక పేజీలు సాధారణ సంఖ్యా/ప్రమేయ/నిరూపణ/పద గద్యానికి మాత్రమే ఆధారం; లాంబ్డా కనిష్ఠీకరణ, పాక్షిక ప్రమేయాల నియత రూపం, గోడెల్ అంకీకరణ ప్రత్యేక సిద్ధాంతాలను నేరుగా బోధించవు. స్థిర మూలం, ప్రకటిత సవరణలే ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి.'
        : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, గద్యం ఇందులో దాచలేదు.'
    });
  });
}
writeJsonl(segmentFile, [...retained, ...rows]);
console.log(JSON.stringify({terms: 99, corrections: 4, segments: rows.length,
  linguistic: rows.filter(row => row.classification === 'translated_linguistic_segment').length,
  findings_sha256: findingsHash, review_sha256: reviewHash}));
