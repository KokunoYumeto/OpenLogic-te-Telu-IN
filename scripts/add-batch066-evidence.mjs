import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) =>
  fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const ids = Array.from({ length: 4 }, (_, i) => 'OLP-' + String(411 + i).padStart(4, '0'));
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const units = new Map();
for (const [index, id] of ids.entries()) {
  const unit = manifest.find(row => row.unit_id === id);
  if (!unit || unit.order !== 411 + index) throw new Error('Unexpected manifest cursor ' + id);
  const source = read('upstream/' + unit.source_path);
  const target = read('translation/' + unit.source_path);
  if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256)
    throw new Error('Frozen source mismatch ' + id);
  units.set(id, { unit, source, target });
}
const qa = JSON.parse(read('build/BATCH-066-STRUCTURAL-QA.json'));
if (qa.units.length !== 4 || qa.units.some(row =>
  !row.paragraph_alignment || !row.structure_match || !row.token_parity ||
  !row.protected_identifier_parity || !row.math_multiset_match))
  throw new Error('Batch structural QA has not passed');
const semanticCheck = JSON.parse(read('evidence/BATCH-066-MODAL-SEMANTIC-CHECK.json'));
if (semanticCheck.status !== 'pass' ||
    semanticCheck.simple_model.nine_problem_cases.length !== 9 ||
    semanticCheck.duality.relation_truth_world_checks !== 12288)
  throw new Error('Bounded model check has not passed');
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
if (corrections.length !== 381) throw new Error('Unexpected correction cursor');
const auditDir = 'evidence/source-audits/2026-09-26-normal-modal-semantics-telugu';
const audit = JSON.parse(read(auditDir + '/FINDINGS.json'));
if (audit.findings.length !== 3) throw new Error('Unexpected audit count');
for (const id of Array.from({ length: 3 }, (_, i) => 'OLTENMLSYN-00' + (i + 1))) {
  const correction = corrections.find(row => row.finding_id === id);
  if (!correction || correction.audit_id !== audit.audit_id ||
      correction.audit_findings_sha256 !== sha(read(auditDir + '/FINDINGS.json')) ||
      correction.audit_review_sha256 !== sha(read(auditDir + '/REVIEW.md')) ||
      correction.status !== 'applied_qa_pass')
    throw new Error('Source audit mismatch ' + id);
}
const termsPath = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termsPath);
const existingTerm = terms.length === 108 && terms.at(-1).term_id === 'TE-T108';
if (!existingTerm && (terms.length !== 107 || terms.at(-1).term_id !== 'TE-T107'))
  throw new Error('Unexpected terminology cursor');
if (!existingTerm) terms.push({
  term_id: 'TE-T108',
  source_term: 'simultaneous substitution and substitution instance / relational model and accessibility relation / valuation V / truth at a world versus truth in a model / vacuous truth / box-diamond duality',
  telugu: 'ఏకకాల ప్రతిస్థాపన, ప్రతిస్థాపన నిదర్శనం / సంబంధాత్మక నమూనా, ప్రాప్యత సంబంధం / కేటాయింపు V / ఒక లోకంలో సత్యం, నమూనాలో సత్యం / శూన్యసందర్భ సత్యం / బాక్స్–డైమండ్ ద్వైతత్వం',
  status: 'native_relation_propositional_truth_conditional_and_derivation_register_attested_specialized_modal_substitution_and_kripke_semantics_source_controlled_provisional',
  passages: ['TE-P010', 'TE-P018', 'TE-P019', 'TE-P021', 'TE-P024'],
  basis: 'TE-P010 తెలంగాణ పాఠ్య పేజీలో ద్విస్థానిక సంబంధం, TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, TE-P019లో సత్యతావిలువ, TE-P021లో సోపాధికం, TE-P024లో నియమ-వ్యుత్పత్తి స్థానిక చిత్రాలను ప్రత్యక్షంగా చూశాం. ఈ సాధారణ పదజాలాన్ని OLP-0411–0414లో తగిన భాగాలకు మాత్రమే అన్వయించాం. ఏకకాల ప్రతిస్థాపన, క్రిప్కె ప్రాప్యత సంబంధం, లోకం/నమూనా సత్యభేదం, శూన్యసందర్భ సత్యం, బాక్స్–డైమండ్ ద్వైతత్వం ఈ పేజీలలో నేరుగా నిర్వచించబడలేదు; స్థిర OpenLogic మూల నిర్వచనాలు, TE-T053/103/107 సంప్రదాయమే ప్రత్యేక అర్థాన్ని నియంత్రిస్తున్నాయి.',
  uncertainty: 'ప్రతిస్థాపన నిదర్శనం, సంబంధాత్మక నమూనా, శూన్యసందర్భ సత్యం అనే సమాసాలు మూల నిర్వచనాధారిత తాత్కాలిక ఎంపికలు. తెలంగాణ సంబంధ పేజీ ప్రాప్యత అనే ప్రత్యేక మోడల్-అర్థాన్ని స్థాపించదు. బాక్స్/డైమండ్, లోకం, నమూనా వేరు స్థాయిలను మూల సూత్రాల ప్రకారం మాత్రమే చదవాలి; స్థానిక పేజీలను OLTENMLSYN-001–003 మూల సవరణలకు ప్రమాణంగా వాడలేదు.',
  borrowing: 'మోడల్, క్రిప్కె ముందరి గుర్తించదగిన అరువులు; W, R, V, M, Box/Diamond, p_i/D_i, source tags and satisfaction macros are protected mathematical or variant identifiers.'
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
  'OLP-0411': {
    5: ['TE-P018'], 6: ['TE-P018', 'TE-P024'],
    7: ['TE-P018', 'TE-P021', 'TE-P024'],
    8: ['TE-P018', 'TE-P021']
  },
  'OLP-0412': {
    5: ['TE-P010', 'TE-P018'], 6: ['TE-P010', 'TE-P018'],
    7: ['TE-P010', 'TE-P019'], 8: ['TE-P010', 'TE-P019'],
    9: ['TE-P010', 'TE-P019']
  },
  'OLP-0413': {
    5: ['TE-P019'], 6: ['TE-P018', 'TE-P019'],
    7: ['TE-P018', 'TE-P019', 'TE-P021'],
    8: ['TE-P019'], 9: ['TE-P019'],
    10: ['TE-P019'], 11: ['TE-P019', 'TE-P024'],
    12: ['TE-P024'], 13: ['TE-P018', 'TE-P019'],
    14: ['TE-P019']
  },
  'OLP-0414': {
    5: ['TE-P019'], 6: ['TE-P019'],
    7: ['TE-P019'], 8: ['TE-P019', 'TE-P021'],
    9: ['TE-P019', 'TE-P021'], 10: ['TE-P019'],
    11: ['TE-P019', 'TE-P021'], 12: ['TE-P018', 'TE-P019']
  }
};
const correctionBlocks = {
  'OLP-0411': { 7: ['OLTENMLSYN-001', 'OLTENMLSYN-002'] },
  'OLP-0412': {},
  'OLP-0413': { 11: ['OLTENMLSYN-003'] },
  'OLP-0414': {}
};
const expectedBlocks = { 'OLP-0411': 9, 'OLP-0412': 10, 'OLP-0413': 15, 'OLP-0414': 13 };
const canon = new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row => [row.passage_id, row]));
const segmentPath = 'evidence/SEGMENT_CANON_USE.jsonl';
const current = jsonl(segmentPath);
const previous = current.filter(row => !ids.includes(row.unit_id));
if (previous.length !== 6268 || ![0, 47].includes(current.length - previous.length))
  throw new Error('Unexpected prior segment cursor');
const rows = [];
for (const id of ids) {
  const { unit, source, target } = units.get(id);
  const sourceBlocks = blocksWithSpans(source), targetBlocks = blocksWithSpans(target);
  if (sourceBlocks.length !== expectedBlocks[id] || targetBlocks.length !== expectedBlocks[id])
    throw new Error('Aligned block count changed ' + id);
  sourceBlocks.forEach((block, index) => {
    const number = index + 1, t = targetBlocks[index];
    const linguistic = Object.hasOwn(passageMap[id], number);
    if (!linguistic && /[\u0C00-\u0C7F]/u.test(t.block))
      throw new Error('Telugu in structural block ' + id + '-' + number);
    if (linguistic && !/[\u0C00-\u0C7F]/u.test(t.block))
      throw new Error('No Telugu in linguistic block ' + id + '-' + number);
    const canonPassages = (passageMap[id][number] ?? []).map(passageId => {
      const passage = canon.get(passageId);
      if (!passage) throw new Error('Missing inspected passage ' + passageId);
      return {
        passage_id: passageId, source_sha256: passage.source_sha256,
        pdf_page: passage.pdf_page, role: passage.role
      };
    });
    rows.push({
      segment_id: id + '-B' + String(number).padStart(3, '0'), unit_id: id,
      source_path: unit.source_path, source_unit_sha256: sha(source),
      translation_unit_sha256: sha(target),
      source_start_line: block.startLine, source_end_line: block.endLine,
      target_start_line: t.startLine, target_end_line: t.endLine,
      source_segment_sha256: sha(block.block), translation_segment_sha256: sha(t.block),
      classification: linguistic ? 'translated_linguistic_segment' : 'preserved_metadata_or_structural_segment',
      canon_passages: canonPassages,
      source_corrections: correctionBlocks[id][number] ?? [],
      consultation_phase: linguistic
        ? id + '-B' + String(number).padStart(3, '0') +
          'లో స్థిర ఆంగ్ల మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా చదివి, నమోదైన TE-P010/018/019/021/024 చిత్రాల్లో సంబంధిత సాధారణ పదజాలాన్ని పోల్చాం; TE-T053/103/107/108 ప్రత్యేక మోడల్ పదాల పరిధితో సరిపోల్చాం.'
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? 'నమోదైన స్థానిక పేజీలు ద్విస్థానిక సంబంధం, ప్రతిజ్ఞావాక్య తర్కం, సత్యతావిలువ, సోపాధికం లేదా వ్యుత్పత్తి అనే సాధారణ రిజిస్టర్‌కు మాత్రమే సాక్ష్యం. ఏకకాల మోడల్ ప్రతిస్థాపన, ప్రాప్యత, లోకం/నమూనా సత్యభేదం, శూన్యసందర్భ సత్యం, ద్వైతత్వపు ప్రత్యేక అర్థం స్థిర మూల నిర్వచనాలదే; OLTENMLSYN-001–003 మూల సవరణలకు స్థానిక పేజీలు గణిత ఆధారం కావు.'
        : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, చిత్రం శీర్షిక లేదా సాధన గద్యం ఇందులో దాచలేదు.'
    });
  });
}
const linguisticCount = rows.filter(row =>
  row.classification === 'translated_linguistic_segment').length;
if (rows.length !== 47 || linguisticCount !== 27)
  throw new Error('Unexpected Batch 066 segment classification');
writeJsonl(segmentPath, [...previous, ...rows]);
console.log(JSON.stringify({
  terms: terms.length, segments: rows.length,
  linguistic: linguisticCount, structural: rows.length - linguisticCount,
  corrections: 3
}));
