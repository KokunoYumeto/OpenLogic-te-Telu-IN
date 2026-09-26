import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) =>
  fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const ids = Array.from({ length: 4 }, (_, i) => 'OLP-' + String(407 + i).padStart(4, '0'));
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const units = new Map();
for (const [index, id] of ids.entries()) {
  const unit = manifest.find(row => row.unit_id === id);
  if (!unit || unit.order !== 407 + index) throw new Error('Unexpected manifest cursor ' + id);
  const source = read('upstream/' + unit.source_path);
  const target = read('translation/' + unit.source_path);
  if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256)
    throw new Error('Frozen source mismatch ' + id);
  units.set(id, { unit, source, target });
}
const qa = JSON.parse(read('build/BATCH-065-STRUCTURAL-QA.json'));
if (qa.units.length !== 4 || qa.units.some(row =>
  !row.paragraph_alignment || !row.structure_match || !row.token_parity ||
  !row.protected_identifier_parity || !row.math_multiset_match))
  throw new Error('Batch structural QA has not passed');
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
if (corrections.length !== 378) throw new Error('Unexpected correction cursor');
const auditDir = 'evidence/source-audits/2026-09-26-normal-modal-language-telugu';
const audit = JSON.parse(read(auditDir + '/FINDINGS.json'));
const correction = corrections.find(row => row.finding_id === 'OLTENMLLAN-001');
if (audit.findings.length !== 1 || !correction ||
    correction.audit_id !== audit.audit_id ||
    correction.audit_findings_sha256 !== sha(read(auditDir + '/FINDINGS.json')) ||
    correction.audit_review_sha256 !== sha(read(auditDir + '/REVIEW.md')) ||
    correction.status !== 'applied_qa_pass')
  throw new Error('Source audit mismatch OLTENMLLAN-001');

const termsPath = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termsPath);
if (terms.length !== 106 || terms.at(-1).term_id !== 'TE-T106')
  throw new Error('Unexpected terminology cursor');
terms.push({
  term_id: 'TE-T107',
  source_term: 'normal modal logic / modal proposition / possibility and necessity / alethic modality / Kripke semantics and accessibility relation / correspondence theory / modal-free formula / box and diamond operators',
  telugu: 'నార్మల్ మోడల్ తర్కం / మోడల్ ప్రతిజ్ఞావాక్యం / సాధ్యత, అవశ్యకత / అలెథిక్ (సత్య-అవశ్యకత) మోడాలిటీ / క్రిప్కె అర్థవిచారం, ప్రాప్యత సంబంధం / అనురూపతా సిద్ధాంతం / మోడల్-రహిత సూత్రం / బాక్స్, డైమండ్ మోడల్ సంచాలకాలు',
  status: 'native_propositional_truth_value_consequence_and_derivation_register_attested_specialized_modal_semantics_source_controlled_provisional',
  passages: ['TE-P018', 'TE-P019', 'TE-P023', 'TE-P024'],
  basis: 'TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, TE-P019లో సత్యతావిలువ మరియు సంయోజకం, TE-P023లో ఫలితం, TE-P024లో నియమ-ఆధార వ్యుత్పత్తి పేజీలను స్థానిక చిత్రాల్లో చూశాం. ఈ సాధారణ పదజాలాన్ని OLP-0407–0410 భాగ, అధ్యాయ, పరిచయ, భాషా నిర్వచనాల గద్యానికి అన్వయించాం. నార్మల్ మోడల్ తర్కం, క్రిప్కె ప్రాప్యత సంబంధం, అనురూపతా సిద్ధాంతం, అలెథిక్ మోడాలిటీ, బాక్స్/డైమండ్ నిర్దిష్ట అర్థాలను ఈ స్థానిక పేజీలు నేరుగా బోధించవు; స్థిర OpenLogic మూల నిర్వచనాలు, ముందరి TE-T053/103 నిర్ణయాలే వాటిని నియంత్రిస్తాయి.',
  uncertainty: 'నార్మల్, మోడల్, అలెథిక్, క్రిప్కె వంటి గుర్తించదగిన అరువులు లేదా లిప్యంతరీకరణలు తాత్కాలిక ఎంపికలు. నార్మల్ అనేది సాంకేతిక తర్క-వర్గం; రోజువారీ సాధారణ అనే అర్థం కాదు. స్థానిక ద్విమూల్య తర్క పేజీలు సాధ్య లోకాల అర్థవిచారానికిగాని OLTENMLLAN-001 కుండలీకరణ సవరణకుగాని గణిత ప్రమాణం కావు.',
  borrowing: 'నార్మల్, మోడల్, అలెథిక్, క్రిప్కె, లూయిస్, లాంగ్‌ఫర్డ్, కార్నాప్ గుర్తించదగిన సాంకేతిక/వ్యక్తి నామ రూపాలు; Box, Diamond, S1–S5, D/T/B/4/5 and tag/logic macros protected mathematical notation.'
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
  'OLP-0407': { 4: ['TE-P018'], 5: ['TE-P018', 'TE-P024'] },
  'OLP-0408': { 4: ['TE-P018'] },
  'OLP-0409': {
    5: ['TE-P018'], 6: ['TE-P018', 'TE-P023'],
    7: ['TE-P018'], 8: ['TE-P018', 'TE-P023'],
    9: ['TE-P024'], 10: ['TE-P018', 'TE-P019'],
    11: ['TE-P018'], 12: ['TE-P018', 'TE-P023']
  },
  'OLP-0410': {
    5: ['TE-P018'], 6: ['TE-P018', 'TE-P019'],
    7: ['TE-P018', 'TE-P019'], 8: ['TE-P019'],
    9: ['TE-P018'], 10: ['TE-P018', 'TE-P019'],
    11: ['TE-P019'], 12: ['TE-P019'],
    13: ['TE-P018', 'TE-P019'], 14: ['TE-P018', 'TE-P019'],
    15: ['TE-P018'], 16: ['TE-P018'],
    17: ['TE-P018'], 18: ['TE-P018'],
    20: ['TE-P019'], 21: ['TE-P019'],
    22: ['TE-P018', 'TE-P019'], 23: ['TE-P019'],
    24: ['TE-P019'], 25: ['TE-P019'],
    26: ['TE-P018', 'TE-P019'], 27: ['TE-P018'],
    28: ['TE-P018'], 29: ['TE-P018']
  }
};
const expectedBlocks = { 'OLP-0407': 14, 'OLP-0408': 7, 'OLP-0409': 13, 'OLP-0410': 30 };
const canon = new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row => [row.passage_id, row]));
const segmentPath = 'evidence/SEGMENT_CANON_USE.jsonl';
const previous = jsonl(segmentPath);
if (previous.length !== 6204 || previous.some(row => ids.includes(row.unit_id)))
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
      source_corrections: id === 'OLP-0410' && number === 25 ? ['OLTENMLLAN-001'] : [],
      consultation_phase: linguistic
        ? id + '-B' + String(number).padStart(3, '0') +
          'లో స్థిర ఆంగ్ల మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా పోల్చి, నమోదైన స్థానిక పేజీల సాధారణ తర్క పదజాలాన్ని సందర్భానికి అన్వయించాం; TE-T053/103/107తో ప్రత్యేక మోడల్ ప్రయోగాన్ని సరిపోల్చాం.'
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? 'నమోదైన స్థానిక పేజీలు ప్రతిజ్ఞావాక్య తర్కం, సత్యతావిలువ, ఫలితం లేదా నియమ-వ్యుత్పత్తి అనే సాధారణ పదజాలానికి మాత్రమే సాక్ష్యం. చారిత్రక వ్యక్తి/గ్రంథ సమాచారం, నార్మల్ మోడల్ వర్గం, సాధ్య లోకాలు, ప్రాప్యత, అనురూపతా సిద్ధాంతం, మోడల్ సంచాలకాల ప్రత్యేక అర్థాలు స్థిర మూలం ద్వారా నియంత్రించబడ్డాయి; స్థానిక పేజీలకు అవి నేరుగా ఆపాదించలేదు.'
        : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, సంపాదక గద్యం ఇందులో దాచలేదు.'
    });
  });
}
const linguisticCount = rows.filter(row =>
  row.classification === 'translated_linguistic_segment').length;
if (rows.length !== 64 || linguisticCount !== 35)
  throw new Error('Unexpected Batch 065 segment classification');
writeJsonl(segmentPath, [...previous, ...rows]);
console.log(JSON.stringify({
  terms: terms.length, segments: rows.length,
  linguistic: linguisticCount, structural: rows.length - linguisticCount,
  corrections: 1
}));
