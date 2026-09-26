import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) =>
  fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const unit = jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row => row.unit_id === 'OLP-0421');
if (!unit || unit.order !== 421 || unit.source_path !==
    'content/normal-modal-logic/frame-definability/properties-accessibility.tex')
  throw new Error('Unexpected manifest cursor');
const source = read('upstream/' + unit.source_path);
const target = read('translation/' + unit.source_path);
const qa = JSON.parse(read('build/BATCH-072-STRUCTURAL-QA.json')).units;
if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256 ||
    qa.length !== 1 || qa[0].unit_id !== unit.unit_id ||
    qa[0].translation_sha256 !== sha(target) ||
    !qa[0].paragraph_alignment || !qa[0].structure_match || !qa[0].token_parity ||
    !qa[0].protected_identifier_parity || !qa[0].math_multiset_match ||
    qa[0].unicode_replacement_char || qa[0].unpaired_surrogate)
  throw new Error('Frozen source or bounded QA mismatch');

const auditDir = 'evidence/source-audits/2026-09-27-modal-accessibility-properties-telugu';
const audit = JSON.parse(read(auditDir + '/FINDINGS.json'));
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const ids = ['OLTENMLFRDACC-001', 'OLTENMLFRDACC-002'];
if (audit.audit_id !== 'OLTENMLFRDACC-20260927' || audit.findings.length !== 2 ||
    corrections.length !== 390 || ids.some(id => {
      const row = corrections.find(c => c.finding_id === id);
      return !row || row.unit_id !== unit.unit_id || row.audit_id !== audit.audit_id ||
        row.audit_findings_sha256 !== sha(read(auditDir + '/FINDINGS.json')) ||
        row.audit_review_sha256 !== sha(read(auditDir + '/REVIEW.md')) ||
        row.status !== 'applied_qa_pass';
    })) throw new Error('Source correction audit mismatch');

const termsPath = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termsPath);
const existingTerm = terms.length === 114 && terms.at(-1).term_id === 'TE-T114';
if (!existingTerm && (terms.length !== 113 || terms.at(-1).term_id !== 'TE-T113'))
  throw new Error('Unexpected terminology cursor');
if (!existingTerm) terms.push({
  term_id: 'TE-T114',
  source_term: 'serial / reflexive / symmetric / transitive / euclidean accessibility; partially functional / functional / weakly dense / weakly connected / weakly directed; diamond property / confluence',
  telugu: 'సీరియల్ / స్వావర్తన / సౌష్ఠవ / సంక్రామక / యూక్లిడియన్ ప్రాప్యత; పాక్షిక ప్రమేయాత్మక / ప్రమేయాత్మక / బలహీన సాంద్ర / బలహీన సంయుక్త / బలహీన సహగమ్య; వజ్ర ధర్మం / సంగమం',
  status: 'native_relation_function_conditional_proof_register_attested_modal_correspondence_taxonomy_source_controlled_provisional',
  passages: ['TE-P008', 'TE-P010', 'TE-P011', 'TE-P012', 'TE-P021', 'TE-P024'],
  basis: 'TE-P008లో సమితి/ప్రమేయం, TE-P010లో ద్విస్థానిక సంబంధం, TE-P011/012లో ప్రమేయ ఏకైకత మరియు సర్వత్ర నిర్వచితత్వం, TE-P021లో సోపాధికం, TE-P024లో నిరూపణ గద్యాన్ని స్థానిక చిత్రాల్లో చూశాం. ఈ సాక్ష్యాలు ప్రత్యేక క్రిప్కె ప్రాప్యత-ధర్మాలకు ప్రత్యక్ష పేర్లు ఇవ్వవు. OLP-0421లోని పరిమాణక నిర్వచనాలు, పట్టిక సూత్రాలు, సౌష్ఠవ నిరూపణ, ముందరి TE-T016/024/113 స్థిర వాడుక ఖచ్చిత అర్థాన్ని నియంత్రిస్తాయి.',
  uncertainty: 'యూక్లిడియన్, బలహీన సాంద్ర, బలహీన సంయుక్త, బలహీన సహగమ్య, వజ్ర ధర్మం, సంగమం పేర్లు మూల నిర్వచనాధీన తాత్కాలిక ఎంపికలు; స్థానిక సాక్ష్యాలు ఈ modal correspondence వాదాలను లేదా OLTENMLFRDACC-001/002 సవరణలను నిరూపించవు.',
  borrowing: 'సీరియల్ మునుపటి బహిరంగ సాంకేతిక అరువు; యూక్లిడియన్ మూలంలోని Euclidean పేరుకు గుర్తించదగిన అరువు. D,T,B,4,5,L,G, Box, Diamond మరియు చరాలు రక్షిత గణిత సంకేతాలు.'
});
writeJsonl(termsPath, terms);

function blocksWithSpans(raw) {
  const normalized = raw.replace(/\r\n/gu, '\n');
  const blocks = normalized.trim().split(/\n\s*\n/u);
  let cursor = 0;
  return blocks.map(block => {
    const start = normalized.indexOf(block, cursor);
    if (start < 0) throw new Error('Could not locate aligned block');
    const startLine = normalized.slice(0, start).split('\n').length;
    cursor = start + block.length;
    return { block, startLine, endLine: startLine + block.split('\n').length - 1 };
  });
}
const sb = blocksWithSpans(source), tb = blocksWithSpans(target);
if (sb.length !== 19 || tb.length !== 19) throw new Error('Block count mismatch');
const passageMap = {
  5: ['TE-P010'], 6: ['TE-P010', 'TE-P021'],
  7: ['TE-P010', 'TE-P021'], 8: ['TE-P010', 'TE-P021'],
  9: ['TE-P010', 'TE-P021', 'TE-P024'], 10: ['TE-P024'],
  11: ['TE-P024'], 12: ['TE-P010', 'TE-P024'],
  13: ['TE-P010', 'TE-P021', 'TE-P024'],
  14: ['TE-P010', 'TE-P011', 'TE-P021', 'TE-P024'],
  15: ['TE-P024'], 16: ['TE-P010', 'TE-P011', 'TE-P012'],
  17: ['TE-P010', 'TE-P011', 'TE-P021'], 18: ['TE-P021', 'TE-P024']
};
const correctionMap = {
  13: ['OLTENMLFRDACC-001'], 14: ['OLTENMLFRDACC-002']
};
const canon = new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row => [row.passage_id, row]));
const segmentPath = 'evidence/SEGMENT_CANON_USE.jsonl';
const current = jsonl(segmentPath);
const previous = current.filter(row => row.unit_id !== unit.unit_id);
if (previous.length !== 6396 || ![0, 19].includes(current.length - previous.length))
  throw new Error('Unexpected segment cursor');
const rows = sb.map((block, index) => {
  const number = index + 1, t = tb[index];
  const linguistic = Object.hasOwn(passageMap, number);
  if (linguistic !== /[\u0C00-\u0C7F]/u.test(t.block))
    throw new Error('Misclassified language block ' + number);
  const canonPassages = (passageMap[number] ?? []).map(passageId => {
    const passage = canon.get(passageId);
    if (!passage) throw new Error('Missing consulted passage ' + passageId);
    return { passage_id: passageId, source_sha256: passage.source_sha256,
      ...(passage.pdf_page ? {pdf_page: passage.pdf_page} : {}), role: passage.role };
  });
  return {
    segment_id: unit.unit_id + '-B' + String(number).padStart(3, '0'),
    unit_id: unit.unit_id, source_path: unit.source_path,
    source_unit_sha256: sha(source), translation_unit_sha256: sha(target),
    source_start_line: block.startLine, source_end_line: block.endLine,
    target_start_line: t.startLine, target_end_line: t.endLine,
    source_segment_sha256: sha(block.block), translation_segment_sha256: sha(t.block),
    classification: linguistic ? 'translated_linguistic_segment' : 'preserved_metadata_or_structural_segment',
    canon_passages: canonPassages, source_corrections: correctionMap[number] ?? [],
    consultation_phase: linguistic ?
      `OLP-0421-B${String(number).padStart(3, '0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక చిత్రాలను పోల్చాం; ప్రత్యేక మోడల్ ధర్మాల అర్థం మూల నిర్వచనాధీనం.` :
      'not_applicable_nonlinguistic',
    evidence_limit: linguistic ?
      'స్థానిక పేజీలు సాధారణ సమితి, సంబంధం, ప్రమేయం, సోపాధికం, నిరూపణ పదజాలానికే ఆధారం; క్రిప్కె ధర్మనామాలు, పట్టికల సార్వత్రిక సత్యం, మూల సవరణలకు ప్రత్యక్ష ప్రమాణం కావు.' :
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక లేదా గద్యం ఇందులో దాచలేదు.'
  };
});
if (rows.filter(row => row.classification === 'translated_linguistic_segment').length !== 14 ||
    rows.filter(row => row.classification === 'preserved_metadata_or_structural_segment').length !== 5)
  throw new Error('Unexpected linguistic/structural count');
writeJsonl(segmentPath, [...previous, ...rows]);
console.log(JSON.stringify({ unit: unit.unit_id, target_sha256: sha(target),
  segments: rows.length, linguistic: 14, structural: 5,
  terms: terms.length, corrections: corrections.length }));
