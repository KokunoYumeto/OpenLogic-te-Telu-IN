import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) =>
  fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const id = 'OLP-0417';
const unit = jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row => row.unit_id === id);
if (!unit || unit.order !== 417) throw new Error('Unexpected manifest cursor');
const source = read('upstream/' + unit.source_path);
const target = read('translation/' + unit.source_path);
if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256)
  throw new Error('Frozen source mismatch');
const qa = JSON.parse(read('build/BATCH-069-STRUCTURAL-QA.json'));
const q = qa.units[0];
if (qa.units.length !== 1 || q.unit_id !== id || !q.paragraph_alignment ||
    !q.structure_match || !q.token_parity || !q.protected_identifier_parity ||
    !q.math_multiset_match || q.unicode_replacement_char || q.unpaired_surrogate)
  throw new Error('Bounded structural QA has not passed');
const auditDir = 'evidence/source-audits/2026-09-26-modal-schemas-telugu';
const audit = JSON.parse(read(auditDir + '/FINDINGS.json'));
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const correction = corrections.find(row => row.finding_id === 'OLTENMLSCH-001');
if (audit.audit_id !== 'OLTENMLSCH-20260926' || audit.findings.length !== 1 ||
    corrections.length !== 385 || !correction || correction.unit_id !== id ||
    correction.audit_id !== audit.audit_id ||
    correction.audit_findings_sha256 !== sha(read(auditDir + '/FINDINGS.json')) ||
    correction.audit_review_sha256 !== sha(read(auditDir + '/REVIEW.md')) ||
    correction.status !== 'applied_qa_pass')
  throw new Error('Source correction audit mismatch');
const termsPath = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termsPath);
const existingTerm = terms.length === 111 && terms.at(-1).term_id === 'TE-T111';
if (!existingTerm && (terms.length !== 110 || terms.at(-1).term_id !== 'TE-T110'))
  throw new Error('Unexpected terminology cursor');
if (!existingTerm) terms.push({
  term_id: 'TE-T111',
  source_term: 'modal schema as substitution-instance set / characteristic formula / truth in a model versus validity / normal modal K and Dual schemas / modus ponens closure',
  telugu: 'ప్రతిస్థాపన నిదర్శనాల సమితిగా మోడల్ పథకం / లక్షణ సూత్రం / నమూనాలో సత్యం, సర్వనమూనా చెల్లుబాటు / నార్మల్ మోడల్ K, Dual పథకాలు / మోడస్ పోనెన్స్ సంవృతం',
  status: 'native_set_propositional_truth_conditional_consequence_and_derivation_register_attested_specialized_modal_schema_source_controlled_provisional',
  passages: ['TE-P008', 'TE-P010', 'TE-P018', 'TE-P019', 'TE-P021', 'TE-P023', 'TE-P024'],
  basis: 'TE-P008లో సమితి/ఉపసమితి, TE-P010లో ద్విస్థానిక సంబంధం, TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, TE-P019లో సత్యతావిలువ, TE-P021లో సోపాధికం, TE-P023లో ఫలితం, TE-P024లో నియమ-వ్యుత్పత్తి చిత్రాలను ప్రత్యక్షంగా చూశాం. ఈ పేజీలు సాధారణ రిజిస్టర్‌కే సాక్ష్యం; పథకం ఒక ప్రతిస్థాపన నిదర్శనాల సమితి కావడం, లక్షణ సూత్రం, K/Dual చెల్లుబాటు, మోడస్ పోనెన్స్ సంవృతం OLP-0417 స్థిర నిర్వచనాలు, నిరూపణల ఆధారితాలు. TE-T035/103/108/109/110 వాడుకను కొనసాగించాం.',
  uncertainty: 'పథకం, లక్షణ సూత్రం ప్రత్యేక మోడల్ నామాలకు స్థానిక పేజీలలో ప్రత్యక్ష సాక్ష్యం లేదు; నిర్వచనాధారిత తాత్కాలిక ఎంపికలు. పథకం అనే సమితిని నమూనా అనే క్రిప్కె మోడల్‌తో కలపరాదు. మూలంలోని V-prime పాక్షిక నిర్దేశ సవరణకు స్థానిక పదజాల పేజీలు గణిత ఆధారం కావు.',
  borrowing: 'మోడల్, మోడస్ పోనెన్స్ గుర్తించదగిన సాంకేతిక అరువులు; K, Dual, D/T/B/4/5, W, R, V, p_i, formula/entailment/satisfaction macros protected notation.'
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
const sourceBlocks = blocksWithSpans(source), targetBlocks = blocksWithSpans(target);
if (sourceBlocks.length !== 25 || targetBlocks.length !== 25)
  throw new Error('Unexpected block count');
const passageMap = {
  5: ['TE-P018'],
  6: ['TE-P008', 'TE-P018'],
  7: ['TE-P018'],
  8: ['TE-P019'],
  9: ['TE-P018', 'TE-P021'],
  10: ['TE-P019', 'TE-P021', 'TE-P024'],
  11: ['TE-P018', 'TE-P019'],
  12: ['TE-P024'],
  13: ['TE-P024'],
  14: ['TE-P021', 'TE-P023', 'TE-P024'],
  15: ['TE-P018', 'TE-P019'],
  16: ['TE-P024'],
  17: ['TE-P008', 'TE-P010', 'TE-P019', 'TE-P024'],
  18: ['TE-P024'],
  19: ['TE-P008', 'TE-P019'],
  20: ['TE-P018', 'TE-P019'],
  21: ['TE-P019', 'TE-P021'],
  22: ['TE-P024'],
  23: ['TE-P019', 'TE-P021'],
  24: ['TE-P010', 'TE-P019']
};
const canon = new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row => [row.passage_id, row]));
const segmentPath = 'evidence/SEGMENT_CANON_USE.jsonl';
const current = jsonl(segmentPath);
const previous = current.filter(row => row.unit_id !== id);
if (previous.length !== 6340 || ![0, 25].includes(current.length - previous.length))
  throw new Error('Unexpected segment cursor');
const rows = sourceBlocks.map((block, index) => {
  const number = index + 1, t = targetBlocks[index];
  const linguistic = Object.hasOwn(passageMap, number);
  if (linguistic !== /[\u0C00-\u0C7F]/u.test(t.block))
    throw new Error('Misclassified language block ' + number);
  const canonPassages = (passageMap[number] ?? []).map(passageId => {
    const passage = canon.get(passageId);
    if (!passage) throw new Error('Missing inspected passage ' + passageId);
    return { passage_id: passageId, source_sha256: passage.source_sha256,
      pdf_page: passage.pdf_page, role: passage.role };
  });
  return {
    segment_id: id + '-B' + String(number).padStart(3, '0'), unit_id: id,
    source_path: unit.source_path, source_unit_sha256: sha(source),
    translation_unit_sha256: sha(target),
    source_start_line: block.startLine, source_end_line: block.endLine,
    target_start_line: t.startLine, target_end_line: t.endLine,
    source_segment_sha256: sha(block.block), translation_segment_sha256: sha(t.block),
    classification: linguistic ? 'translated_linguistic_segment' : 'preserved_metadata_or_structural_segment',
    canon_passages: canonPassages,
    source_corrections: number === 17 ? ['OLTENMLSCH-001'] : [],
    consultation_phase: linguistic
      ? id + '-B' + String(number).padStart(3, '0') +
        'లో స్థిర మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా చదివి, సూచించిన TE-P008/010/018/019/021/023/024 స్థానిక చిత్రాల్లో సంబంధిత సాధారణ పదజాలాన్ని ప్రత్యక్షంగా పోల్చాం; ప్రత్యేక పథక అర్థం స్థిర మూల నిర్వచనాధీనం.'
      : 'not_applicable_nonlinguistic',
    evidence_limit: linguistic
      ? 'స్థానిక పేజీలు సమితి, సంబంధం, ప్రతిజ్ఞావాక్య తర్కం, సత్యతావిలువ, సోపాధికం, ఫలితం, నియమ-వ్యుత్పత్తి సాధారణ రిజిస్టర్‌కు మాత్రమే సాక్ష్యం; మోడల్ పథకాల చెల్లుబాటు, లక్షణ సూత్రం లేదా OLTENMLSCH-001 గణిత సవరణకు ప్రత్యక్ష ప్రమాణం కావు.'
      : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, పట్టిక శీర్షిక లేదా సాధన గద్యం ఇందులో దాచలేదు.'
  };
});
if (rows.filter(row => row.classification === 'translated_linguistic_segment').length !== 20)
  throw new Error('Unexpected linguistic block count');
writeJsonl(segmentPath, [...previous, ...rows]);
console.log(JSON.stringify({ terms: terms.length, segments: rows.length, linguistic: 20,
  structural: 5, corrections: 1, target_sha256: sha(target) }));
