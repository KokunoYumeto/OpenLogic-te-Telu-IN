import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) =>
  fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const id = 'OLP-0416';
const unit = jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row => row.unit_id === id);
if (!unit || unit.order !== 416) throw new Error('Unexpected manifest cursor');
const source = read('upstream/' + unit.source_path);
const target = read('translation/' + unit.source_path);
if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256)
  throw new Error('Frozen source mismatch');
const qa = JSON.parse(read('build/BATCH-068-STRUCTURAL-QA.json'));
const q = qa.units[0];
if (qa.units.length !== 1 || q.unit_id !== id || !q.paragraph_alignment ||
    !q.structure_match || !q.token_parity || !q.protected_identifier_parity ||
    !q.math_multiset_match || q.unicode_replacement_char || q.unpaired_surrogate)
  throw new Error('Bounded structural QA has not passed');
const auditDir = 'evidence/source-audits/2026-09-26-modal-tautology-telugu';
const audit = JSON.parse(read(auditDir + '/FINDINGS.json'));
if (audit.audit_id !== 'OLTENMLTAU-20260926' || audit.findings.length !== 3)
  throw new Error('Unexpected source audit');
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
if (corrections.length !== 384) throw new Error('Unexpected correction cursor');
for (const finding of audit.findings) {
  const row = corrections.find(value => value.finding_id === finding.finding_id);
  if (!row || row.audit_id !== audit.audit_id ||
      row.audit_findings_sha256 !== sha(read(auditDir + '/FINDINGS.json')) ||
      row.audit_review_sha256 !== sha(read(auditDir + '/REVIEW.md')) ||
      row.status !== 'applied_qa_pass' || row.unit_id !== id)
    throw new Error('Source correction audit mismatch ' + finding.finding_id);
}
const termsPath = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termsPath);
const existingTerm = terms.length === 110 && terms.at(-1).term_id === 'TE-T110';
if (!existingTerm && (terms.length !== 109 || terms.at(-1).term_id !== 'TE-T109'))
  throw new Error('Unexpected terminology cursor');
if (!existingTerm) terms.push({
  term_id: 'TE-T110',
  source_term: 'modal-free tautology / tautological substitution instance / propositional assignment matching modal formula truth at a world / structural induction',
  telugu: 'మోడల్-రహిత సర్వసత్యం / సర్వసత్య ప్రతిస్థాపన నిదర్శనం / లోకంలో మోడల్ సూత్రాల సత్యానికి సరిపడే ప్రతిజ్ఞావాక్య కేటాయింపు / నిర్మాణాత్మక ఆగమనం',
  status: 'native_propositional_truth_value_conditional_and_derivation_register_attested_specialized_modal_tautological_instance_source_controlled_provisional',
  passages: ['TE-P018', 'TE-P019', 'TE-P021', 'TE-P024'],
  basis: 'TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, సంయోజకాల జాబితా; TE-P019లో సత్యతావిలువ, నిషేధం, సంయోజక పట్టిక; TE-P021లో సోపాధిక పట్టిక; TE-P024లో నియమ-వ్యుత్పత్తి స్థానిక పేజీలను OLP-0416 మూలం/లక్ష్యం పక్కపక్కన ఉంచి ప్రత్యక్షంగా పునఃపరిశీలించాం. ఈ పేజీలు సాధారణ ద్విమూల్య పదజాలానికే సాక్ష్యం. మోడల్-రహిత సర్వసత్య ప్రతిస్థాపన నిదర్శనానికి ప్రత్యేక అర్థం OLP-0416 స్థిర నిర్వచనం, ఆగమన ఉపసిద్ధాంతం, ప్రతిపాదన ఆధారితం; TE-T103/107/108/109 పూర్వ పదజాలం కొనసాగించాం.',
  uncertainty: 'సర్వసత్యం స్థానిక సత్య పట్టికతో సారూప్యమైనా దాని సాంకేతిక సర్వకేటాయింపు భావం స్థిర మూలం, TE-T103 ద్వారా నియంత్రితం. మోడల్ ప్రతిస్థాపన నిదర్శనం, ప్రపంచ-సత్యానికి సరిపడే కేటాయింపు అనే పూర్తి ప్రత్యేక భావానికి స్థానిక పేజీల్లో ప్రత్యక్ష సాక్ష్యం లేదు; తాత్కాలిక రూపం. OLTENMLTAU-001–003 సవరణలకు స్థానిక పేజీలు గణిత ఆధారం కావు.',
  borrowing: 'మోడల్ గుర్తించదగిన సాంకేతిక అరువు; Box, Diamond, p_i, D_i, assignments, satisfaction and substitution macros protected mathematical notation.'
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
if (sourceBlocks.length !== 12 || targetBlocks.length !== 12)
  throw new Error('Unexpected block count');
const passageMap = {
  5: ['TE-P018', 'TE-P019'],
  6: ['TE-P018', 'TE-P019', 'TE-P021'],
  7: ['TE-P018', 'TE-P019'],
  8: ['TE-P018', 'TE-P019'],
  9: ['TE-P018', 'TE-P019', 'TE-P021', 'TE-P024'],
  10: ['TE-P018', 'TE-P019'],
  11: ['TE-P019', 'TE-P024']
};
const canon = new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row => [row.passage_id, row]));
const segmentPath = 'evidence/SEGMENT_CANON_USE.jsonl';
const current = jsonl(segmentPath);
const previous = current.filter(row => row.unit_id !== id);
if (previous.length !== 6328 || ![0, 12].includes(current.length - previous.length))
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
    source_corrections: number === 9 ? audit.findings.map(row => row.finding_id) : [],
    consultation_phase: linguistic
      ? id + '-B' + String(number).padStart(3, '0') +
        'లో స్థిర ఆంగ్ల మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా చదివి, సూచించిన TE-P018/019/021/024 స్థానిక చిత్రాల సాధారణ తర్క పదజాలాన్ని ప్రత్యక్షంగా పునఃపరిశీలించాం; ప్రత్యేక మోడల్ అర్థాన్ని మూల నిర్వచనం, ఆగమన నిరూపణ నియంత్రిస్తాయి.'
      : 'not_applicable_nonlinguistic',
    evidence_limit: linguistic
      ? 'స్థానిక పేజీలు ద్విమూల్య ప్రతిజ్ఞావాక్య తర్కం, సత్యతావిలువ, సోపాధికం, నియమ-వ్యుత్పత్తి సాధారణ రిజిస్టర్‌కు మాత్రమే సాక్ష్యం; మోడల్ సర్వసత్య ప్రతిస్థాపన నిదర్శనానికి లేదా OLTENMLTAU-001–003 నిరూపణ సవరణలకు గణిత ప్రమాణం కావు.'
      : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక లేదా నిరూపణ గద్యం ఇందులో దాచలేదు.'
  };
});
if (rows.filter(row => row.classification === 'translated_linguistic_segment').length !== 7)
  throw new Error('Unexpected linguistic block count');
writeJsonl(segmentPath, [...previous, ...rows]);
console.log(JSON.stringify({ terms: terms.length, segments: rows.length, linguistic: 7,
  structural: 5, corrections: 3, target_sha256: sha(target) }));
