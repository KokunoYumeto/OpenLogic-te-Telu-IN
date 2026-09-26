import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) =>
  fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const units = manifest.filter(row => row.order >= 419 && row.order <= 420);
if (units.length !== 2 || units[0].unit_id !== 'OLP-0419' || units[1].unit_id !== 'OLP-0420')
  throw new Error('Unexpected manifest cursor');
const qa = JSON.parse(read('build/BATCH-071-STRUCTURAL-QA.json'));
if (qa.units.length !== 2) throw new Error('Missing bounded QA');
for (const [i, unit] of units.entries()) {
  const source = read('upstream/' + unit.source_path);
  const target = read('translation/' + unit.source_path);
  const q = qa.units[i];
  if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256 ||
      q.unit_id !== unit.unit_id || q.translation_sha256 !== sha(target) ||
      !q.paragraph_alignment || !q.structure_match || !q.token_parity ||
      !q.protected_identifier_parity || !q.math_multiset_match ||
      q.unicode_replacement_char || q.unpaired_surrogate)
    throw new Error('Frozen source or current bounded QA mismatch: ' + unit.unit_id);
}
const auditDir = 'evidence/source-audits/2026-09-27-modal-frames-introduction-telugu';
const audit = JSON.parse(read(auditDir + '/FINDINGS.json'));
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const correction = corrections.find(row => row.finding_id === 'OLTENMLFRDINT-001');
if (audit.audit_id !== 'OLTENMLFRDINT-20260927' || audit.findings.length !== 1 ||
    corrections.length !== 388 || !correction || correction.unit_id !== 'OLP-0420' ||
    correction.audit_id !== audit.audit_id ||
    correction.audit_findings_sha256 !== sha(read(auditDir + '/FINDINGS.json')) ||
    correction.audit_review_sha256 !== sha(read(auditDir + '/REVIEW.md')) ||
    correction.status !== 'applied_qa_pass')
  throw new Error('Source correction audit mismatch');
const termsPath = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termsPath);
const existingTerm = terms.length === 113 && terms.at(-1).term_id === 'TE-T113';
if (!existingTerm && (terms.length !== 112 || terms.at(-1).term_id !== 'TE-T112'))
  throw new Error('Unexpected terminology cursor');
if (!existingTerm) terms.push({
  term_id: 'TE-T113',
  source_term: 'frame / frame definability / model based on a frame / frame validity / formula-frame correspondence / reflexive accessibility relation',
  telugu: 'చట్రం / చట్రాల నిర్వచనీయత / చట్రంపై ఆధారపడే నమూనా / చట్రంలో చెల్లుబాటు / సూత్ర–చట్ర అనురూపత / స్వావర్తన ప్రాప్యత సంబంధం',
  status: 'native_set_relation_truth_conditional_consequence_register_attested_kripke_frame_senses_source_controlled_provisional',
  passages: ['TE-P008', 'TE-P010', 'TE-P019', 'TE-P021', 'TE-P023'],
  basis: 'TE-P008లో సమితి/జత, TE-P010లో సంబంధం, TE-P019లో సత్యతావిలువ, TE-P021లో సోపాధికం, TE-P023లో ఫలితాన్ని ప్రత్యక్షంగా చూశాం. అవి సాధారణ రిజిస్టర్‌కే సాక్ష్యం. OLP-0420లో చట్రం W,R జతగా, నమూనా దానిపై ఆధారపడడంగా, చట్ర చెల్లుబాటు అన్ని ఆధారిత నమూనాల్లో సత్యంగా నిర్వచించబడుతుంది; స్వావర్తన–బాక్స్ అనురూపత అదే నిర్వచనాధీనం. TE-T053/062/108/109/111/112 స్థిర వాడుకను కొనసాగించాం.',
  uncertainty: 'చట్రం అనే క్రిప్కె frame ప్రత్యేక పేరుకూ, చట్ర నిర్వచనీయతకూ ఈ స్థానిక పేజీల్లో ప్రత్యక్ష సాక్ష్యం లేదు; మూల నిర్వచనాధారిత తాత్కాలిక ఎంపికలు. స్థానిక సంబంధ పేజీ స్వావర్తనాన్ని లేదా OLTENMLFRDINT-001 సవరణను నిరూపించదు.',
  borrowing: 'మోడల్ ముందరి సాంకేతిక అరువు; F, M, W, R, V, Box, p and source macro identities protected notation.'
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
const passageMap = {
  'OLP-0419': {4: ['TE-P008', 'TE-P010']},
  'OLP-0420': {
    5: ['TE-P010'], 6: ['TE-P010', 'TE-P019', 'TE-P021'],
    7: ['TE-P010', 'TE-P019', 'TE-P021'],
    8: ['TE-P008', 'TE-P010', 'TE-P019'],
    9: ['TE-P008', 'TE-P010', 'TE-P023'],
    10: ['TE-P010', 'TE-P023']
  }
};
const canon = new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row => [row.passage_id, row]));
const segmentPath = 'evidence/SEGMENT_CANON_USE.jsonl';
const current = jsonl(segmentPath);
const previous = current.filter(row => !units.some(unit => unit.unit_id === row.unit_id));
if (previous.length !== 6378 || ![0, 18].includes(current.length - previous.length))
  throw new Error('Unexpected segment cursor');
const rows = [];
for (const unit of units) {
  const source = read('upstream/' + unit.source_path);
  const target = read('translation/' + unit.source_path);
  const sb = blocksWithSpans(source), tb = blocksWithSpans(target);
  const expected = unit.unit_id === 'OLP-0419' ? 7 : 11;
  if (sb.length !== expected || tb.length !== expected) throw new Error('Block count mismatch');
  for (const [index, block] of sb.entries()) {
    const number = index + 1, t = tb[index];
    const linguistic = Object.hasOwn(passageMap[unit.unit_id], number);
    if (linguistic !== /[\u0C00-\u0C7F]/u.test(t.block))
      throw new Error('Misclassified language block ' + unit.unit_id + '-' + number);
    const canonPassages = (passageMap[unit.unit_id][number] ?? []).map(passageId => {
      const passage = canon.get(passageId);
      if (!passage) throw new Error('Missing inspected passage ' + passageId);
      return { passage_id: passageId, source_sha256: passage.source_sha256,
        pdf_page: passage.pdf_page, role: passage.role };
    });
    rows.push({
      segment_id: unit.unit_id + '-B' + String(number).padStart(3, '0'),
      unit_id: unit.unit_id, source_path: unit.source_path,
      source_unit_sha256: sha(source), translation_unit_sha256: sha(target),
      source_start_line: block.startLine, source_end_line: block.endLine,
      target_start_line: t.startLine, target_end_line: t.endLine,
      source_segment_sha256: sha(block.block), translation_segment_sha256: sha(t.block),
      classification: linguistic ? 'translated_linguistic_segment' : 'preserved_metadata_or_structural_segment',
      canon_passages: canonPassages,
      source_corrections: unit.unit_id === 'OLP-0420' && number === 7 ? ['OLTENMLFRDINT-001'] : [],
      consultation_phase: linguistic
        ? unit.unit_id + '-B' + String(number).padStart(3, '0') +
          'లో స్థిర మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా చదివి, సూచించిన TE-P008/010/019/021/023 స్థానిక చిత్రాల్లో సాధారణ సమితి, సంబంధం, సత్యం, సోపాధికం, ఫలిత పదజాలాన్ని ప్రత్యక్షంగా పోల్చాం; క్రిప్కె చట్ర అర్థం స్థిర మూల నిర్వచనాధీనం.'
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? 'స్థానిక పేజీలు సాధారణ సమితి, సంబంధం, సత్యతావిలువ, సోపాధికం, ఫలిత రిజిస్టర్‌కు మాత్రమే సాక్ష్యం; చట్ర చెల్లుబాటు, స్వావర్తన అనురూపత లేదా OLTENMLFRDINT-001 గణిత పరిమితికి ప్రత్యక్ష ప్రమాణం కావు.'
        : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక లేదా గద్యం ఇందులో దాచలేదు.'
    });
  }
}
if (rows.length !== 18 || rows.filter(row => row.classification === 'translated_linguistic_segment').length !== 7)
  throw new Error('Unexpected new segment counts');
writeJsonl(segmentPath, [...previous, ...rows]);
console.log(JSON.stringify({terms: terms.length, segments: rows.length, linguistic: 7,
  structural: 11, corrections: 1, targets: units.map(u => [u.unit_id, sha(read('translation/' + u.source_path))])}));
