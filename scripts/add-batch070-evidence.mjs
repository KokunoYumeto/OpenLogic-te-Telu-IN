import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) =>
  fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const id = 'OLP-0418';
const unit = jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row => row.unit_id === id);
if (!unit || unit.order !== 418) throw new Error('Unexpected manifest cursor');
const source = read('upstream/' + unit.source_path);
const target = read('translation/' + unit.source_path);
if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256)
  throw new Error('Frozen source mismatch');
const qa = JSON.parse(read('build/BATCH-070-STRUCTURAL-QA.json'));
const q = qa.units[0];
if (qa.units.length !== 1 || q.unit_id !== id || q.translation_sha256 !== sha(target) ||
    !q.paragraph_alignment || !q.structure_match || !q.token_parity ||
    !q.protected_identifier_parity || !q.math_multiset_match ||
    q.unicode_replacement_char || q.unpaired_surrogate)
  throw new Error('Current bounded structural QA has not passed');
const auditDir = 'evidence/source-audits/2026-09-27-modal-entailment-telugu';
const audit = JSON.parse(read(auditDir + '/FINDINGS.json'));
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const currentCorrections = corrections.filter(row => row.unit_id === id);
if (audit.audit_id !== 'OLTENMLENT-20260927' || audit.findings.length !== 2 ||
    corrections.length !== 387 || currentCorrections.length !== 2 ||
    currentCorrections.some(row => row.audit_id !== audit.audit_id ||
      row.audit_findings_sha256 !== sha(read(auditDir + '/FINDINGS.json')) ||
      row.audit_review_sha256 !== sha(read(auditDir + '/REVIEW.md')) ||
      row.status !== 'applied_qa_pass'))
  throw new Error('Source correction audit mismatch');
const termsPath = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termsPath);
const existingTerm = terms.length === 112 && terms.at(-1).term_id === 'TE-T112';
if (!existingTerm && (terms.length !== 111 || terms.at(-1).term_id !== 'TE-T111'))
  throw new Error('Unexpected terminology cursor');
if (!existingTerm) terms.push({
  term_id: 'TE-T112',
  source_term: 'modal semantic entailment across all models and worlds / countermodel at one world / vacuous box truth',
  telugu: 'అన్ని నమూనాల, లోకాలలో అర్థపర అనుగమనం / ఒక లోకంలో ప్రతిదృష్టాంతం / ప్రాప్య లోకాలు లేనప్పుడు బాక్స్ శూన్యసందర్భ సత్యం',
  status: 'native_truth_conditional_consequence_register_attested_modal_model_semantics_source_controlled_provisional',
  passages: ['TE-P019', 'TE-P021', 'TE-P023'],
  basis: 'TE-P019లో సత్యతావిలువ, TE-P021లో సోపాధికం, TE-P023లో పూర్వ వాక్యాల సత్యాన్ని నిలిపే ఫలితం నిర్వచనాన్ని ప్రత్యక్షంగా చూశాం. అవి సాధారణ ద్విమూల్య పదజాలానికి సాక్ష్యం; OLP-0418లో ప్రతి క్రిప్కె నమూనాలో ప్రతి లోకం మీద అనుగమనం, ఒక్క లోక ప్రతిదృష్టాంతం, ప్రాప్య లోకాలు లేనప్పుడు బాక్స్ సత్యం స్థిర మూల నిర్వచనాలు, నిరూపణల ఆధారితాలు. TE-T033/044/103/108/109 వాడుకను కొనసాగించాం.',
  uncertainty: 'అర్థపర అనుగమనం ముందరి సంచిక స్థిర పదం; స్థానిక పేజీ ప్రత్యక్షంగా ప్రామాణిక ప్రతిజ్ఞావాక్య ఫలితాన్ని చూపుతుంది, మోడల్-లోక అర్థవిచారాన్ని కాదు. ప్రతిదృష్టాంతం, శూన్యసందర్భ బాక్స్ సత్యం మూల నియమాల ప్రకారం తాత్కాలిక ప్రత్యేక కూర్పులు. OLTENMLENT-001/002 గణిత సవరణలకు స్థానిక పదజాల పేజీలు ప్రమాణం కావు.',
  borrowing: 'మోడల్ సాంకేతిక అరువు; M, W, R, V, p, q, satisfaction/entailment macros and protected mathematical notation remain unchanged.'
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
if (sourceBlocks.length !== 13 || targetBlocks.length !== 13)
  throw new Error('Unexpected block count');
const passageMap = {
  5: ['TE-P023'],
  6: ['TE-P019', 'TE-P023'],
  7: ['TE-P019', 'TE-P023'],
  8: ['TE-P019', 'TE-P021', 'TE-P023'],
  9: ['TE-P019', 'TE-P021', 'TE-P023'],
  10: ['TE-P019', 'TE-P021', 'TE-P023'],
  11: ['TE-P019', 'TE-P021', 'TE-P023'],
  12: ['TE-P019', 'TE-P021', 'TE-P023']
};
const canon = new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row => [row.passage_id, row]));
const segmentPath = 'evidence/SEGMENT_CANON_USE.jsonl';
const current = jsonl(segmentPath);
const previous = current.filter(row => row.unit_id !== id);
if (previous.length !== 6365 || ![0, 13].includes(current.length - previous.length))
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
    source_corrections: number === 10 ? ['OLTENMLENT-001', 'OLTENMLENT-002'] : [],
    consultation_phase: linguistic
      ? id + '-B' + String(number).padStart(3, '0') +
        'లో స్థిర మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా చదివి, సూచించిన TE-P019/021/023 స్థానిక చిత్రాల్లో సత్యతావిలువ, సోపాధికం, ఫలితం పదజాలాన్ని ప్రత్యక్షంగా పోల్చాం; ప్రత్యేక నమూనా-లోక అర్థం స్థిర మూల నిర్వచనాధీనం.'
      : 'not_applicable_nonlinguistic',
    evidence_limit: linguistic
      ? 'స్థానిక పేజీలు సాధారణ సత్యతావిలువ, సోపాధికం, ఫలిత రిజిస్టర్‌కు మాత్రమే సాక్ష్యం; క్రిప్కె అనుగమనం, ప్రతిదృష్టాంతం లేదా OLTENMLENT-001/002 గణిత సవరణలకు ప్రత్యక్ష ప్రమాణం కావు.'
      : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, చిత్రం శీర్షిక లేదా సాధన గద్యం ఇందులో దాచలేదు.'
  };
});
if (rows.filter(row => row.classification === 'translated_linguistic_segment').length !== 8)
  throw new Error('Unexpected linguistic block count');
writeJsonl(segmentPath, [...previous, ...rows]);
console.log(JSON.stringify({ terms: terms.length, segments: rows.length, linguistic: 8,
  structural: 5, corrections: 2, target_sha256: sha(target) }));
