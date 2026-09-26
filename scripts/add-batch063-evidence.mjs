import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) =>
  fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const ids = ['OLP-0398', 'OLP-0399', 'OLP-0400', 'OLP-0401'];
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const units = new Map();
for (const [index, id] of ids.entries()) {
  const unit = manifest.find(row => row.unit_id === id);
  if (!unit || unit.order !== 398 + index) throw new Error('Unexpected manifest cursor ' + id);
  const source = read('upstream/' + unit.source_path);
  const target = read('translation/' + unit.source_path);
  if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256)
    throw new Error('Frozen source mismatch ' + id);
  units.set(id, { unit, source, target });
}
const qa = JSON.parse(read('build/BATCH-063-STRUCTURAL-QA.json'));
if (qa.units.length !== 4 || qa.units.some(row =>
  !row.paragraph_alignment || !row.structure_match || !row.token_parity ||
  !row.protected_identifier_parity || !row.math_multiset_match))
  throw new Error('Batch structural QA has not passed');
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
if (corrections.length !== 374) throw new Error('Unexpected correction cursor');
const auditDir = 'evidence/source-audits/2026-09-26-infinite-valued-telugu';
const audit = JSON.parse(read(auditDir + '/FINDINGS.json'));
if (audit.findings.length !== 4) throw new Error('Unexpected audit count');
for (const id of Array.from({ length: 4 }, (_, i) => 'OLTEMVLINF-00' + (i + 1))) {
  const row = corrections.find(item => item.finding_id === id);
  if (!row || row.audit_id !== audit.audit_id ||
      row.audit_findings_sha256 !== sha(read(auditDir + '/FINDINGS.json')) ||
      row.audit_review_sha256 !== sha(read(auditDir + '/REVIEW.md')) ||
      row.status !== 'applied_qa_pass') throw new Error('Source audit mismatch ' + id);
}
const termsPath = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termsPath);
if (terms.length !== 104 || terms.at(-1).term_id !== 'TE-T104')
  throw new Error('Unexpected terminology cursor');
terms.push({
  term_id: 'TE-T105',
  source_term: 'infinite-valued logic / rational and real truth-value sets / finite m-valued approximation / fuzzy logic / Łukasiewicz implication / Gödel implication / Gödel-Dummett logic / linearity schema',
  telugu: 'అనంత-విలువల తర్కం / కరణీయ, వాస్తవ సంఖ్యల సత్యమూల్య సమితులు / పరిమిత m-విలువల సమీపనం / ఫజీ తర్కం / Łukasiewicz సోపాధికం / గోడెల్ సోపాధికం / గోడెల్--డమ్మెట్ తర్కం / రేఖీయత పథకం',
  status: 'native_rational_real_number_set_truth_value_function_and_consequence_register_attested_specialized_infinite_valued_fuzzy_and_goedel_dummett_senses_source_controlled_provisional',
  passages: ['TE-P006', 'TE-P007', 'TE-P008', 'TE-P011', 'TE-P018', 'TE-P019', 'TE-P020', 'TE-P023'],
  basis: 'TE-P006లో కరణీయ, అకరణీయ, వాస్తవ సంఖ్యల భేదం; TE-P007లో సహజ సంఖ్యల ఒక తెలంగాణ పాఠ్య సంప్రదాయం; TE-P008లో సమితి, ఉపసమితి; TE-P011లో ప్రమేయం; TE-P018–P020లో ప్రతిజ్ఞావాక్య తర్కం, సత్యతావిలువ, సంయోజక/వియోజక పట్టికలు; TE-P023లో ఫలిత సంబంధం ప్రత్యక్ష పేజీ చిత్రాల్లో చూశాం. TE-P007 సహజ సంఖ్యల సమితిని ఒకటితో మొదలుపెడుతుంది; స్థిర OpenLogic ముఖ్య సమితుల మూలం మాత్రం Natను సున్నాతో మొదలుపెడుతుంది, V_5 ఉదాహరణలోనూ సున్నా ఉంది. స్థానిక సంప్రదాయాన్ని మూల సంకేతంపై రుద్దలేదు. ఏ స్థానిక పేజీ అనంత-విలువల, ఫజీ, లూకాసియెవిచ్/గోడెల్ సోపాధికం, గోడెల్--డమ్మెట్ ప్రత్యేక భావాలను నేరుగా బోధించదు; OLP-0398–0401 స్థిర నిర్వచనాలు, పట్టికలే వాటిని నియంత్రిస్తాయి.',
  uncertainty: 'కరణీయ, వాస్తవ, సమితి, సత్యతావిలువ, సంయోజకం, ప్రమేయం, ఫలితం అనే సాధారణ పదజాలానికి ప్రత్యక్ష స్థానిక సాక్ష్యం ఉంది. ఫజీ అనే అరువు, అనంత-విలువల సోపాధిక ప్రమేయాలు, గోడెల్--డమ్మెట్ పథక నామాలు మూల నిర్వచన ఆధారిత తాత్కాలిక ఎంపికలు. ఆ పేజీలు OLTEMVLINF-001–004 గణిత సవరణలకు ఆధారం కావు; స్థిర మూల సమితి వివరణ, ఐదు-విలువల ఉదాహరణ, మాత్రిక పోలిక, TeX స్థితే ఆధారం.',
  borrowing: 'ఫజీ ఒక ప్రకటిత సాంకేతిక అరువు; Łukasiewicz, Gödel, Dummett వ్యక్తి/వ్యవస్థ పేర్లను గుర్తించదగిన రూపంలో నిలిపాం. V_infinity, V_m, Nat, Rat, L_0, min/max and logic macros are protected notation, not unexplained English prose.'
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
const segmentPath = 'evidence/SEGMENT_CANON_USE.jsonl';
const previous = jsonl(segmentPath);
if (previous.length !== 6080 || previous.some(row => ids.includes(row.unit_id)))
  throw new Error('Unexpected prior segment cursor');
const passageCatalog = new Map();
for (const row of previous) for (const passage of row.canon_passages ?? [])
  if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
const passageMap = {
  'OLP-0398': { 4: ['TE-P018', 'TE-P019'] },
  'OLP-0399': {
    5: ['TE-P018'], 6: ['TE-P006', 'TE-P007', 'TE-P008', 'TE-P019'],
    7: ['TE-P006', 'TE-P019']
  },
  'OLP-0400': {
    5: ['TE-P018'], 6: ['TE-P018'],
    7: ['TE-P011', 'TE-P018', 'TE-P019', 'TE-P020'],
    8: ['TE-P018', 'TE-P019'], 9: ['TE-P019', 'TE-P020'],
    10: ['TE-P019', 'TE-P023'], 11: ['TE-P018'],
    12: ['TE-P023'], 13: ['TE-P018'],
    14: ['TE-P018', 'TE-P019', 'TE-P020'],
    15: ['TE-P019']
  },
  'OLP-0401': {
    5: ['TE-P018'], 6: ['TE-P018'],
    7: ['TE-P011', 'TE-P018', 'TE-P019', 'TE-P020'],
    8: ['TE-P018', 'TE-P019'], 9: ['TE-P019', 'TE-P020'],
    10: ['TE-P019', 'TE-P023'], 11: ['TE-P018'],
    12: ['TE-P023'], 13: ['TE-P018'],
    14: ['TE-P018', 'TE-P019', 'TE-P020'],
    15: ['TE-P019'], 16: ['TE-P019']
  }
};
const expectedBlocks = {
  'OLP-0398': 9, 'OLP-0399': 8, 'OLP-0400': 16, 'OLP-0401': 17
};
const correctionBlocks = {
  'OLP-0398': {},
  'OLP-0399': { 6: ['OLTEMVLINF-001', 'OLTEMVLINF-002'] },
  'OLP-0400': { 7: ['OLTEMVLINF-003'] },
  'OLP-0401': { 7: ['OLTEMVLINF-004'] }
};
const rows = [];
for (const id of ids) {
  const { unit, source, target } = units.get(id);
  const sourceBlocks = blocksWithSpans(source), targetBlocks = blocksWithSpans(target);
  if (sourceBlocks.length !== expectedBlocks[id] ||
      targetBlocks.length !== expectedBlocks[id]) throw new Error('Aligned block count changed ' + id);
  sourceBlocks.forEach((block, index) => {
    const number = index + 1, t = targetBlocks[index];
    const linguistic = Object.hasOwn(passageMap[id], number);
    const expectedLinguistic = id === 'OLP-0398'
      ? number === 4 : number >= 5 && number < expectedBlocks[id];
    if (linguistic !== expectedLinguistic)
      throw new Error('Unexpected linguistic block ' + id + '-' + number);
    if (!linguistic && /[\u0C00-\u0C7F]/u.test(t.block))
      throw new Error('Telugu in structural block ' + id + '-' + number);
    if (linguistic && !/[\u0C00-\u0C7F]/u.test(t.block))
      throw new Error('No Telugu in linguistic block ' + id + '-' + number);
    const canonPassages = (passageMap[id][number] ?? []).map(passageId => {
      const passage = passageCatalog.get(passageId);
      if (!passage) throw new Error('Missing inspected passage ' + passageId);
      return passage;
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
          ' మూలం, లక్ష్యాన్ని ఎదురెదురుగా చదివి, చూపిన TE-P006/007/008/011/018/019/020/023 స్థానిక పేజీ చిత్రాలను ప్రత్యక్షంగా చూశాం; TE-T032/100/101/102/103/104/105తో వాడుకను పోల్చాం.'
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? 'స్థానిక పేజీలు కరణీయ/వాస్తవ సంఖ్య, సమితి, ప్రమేయం, ప్రతిజ్ఞావాక్య తర్కం, సత్యమూల్యం, సంయోజక పట్టిక, ఫలితం అనే సాధారణ వాడుకకు ఆధారం. అనంత-విలువల మాత్రిక, ఫజీ తర్కం, ప్రత్యేక లూకాసియెవిచ్/గోడెల్ సోపాధికం, డమ్మెట్ పథకం వాటిలో నేరుగా లేవు; స్థిర మూల నిర్వచనాలు, పట్టికలే వాటిని నియంత్రిస్తాయి. TE-P007 సహజ సంఖ్య సంప్రదాయం మూల Nat సంకేతాన్ని మార్చదు. OLTEMVLINF-001–004 గణిత సవరణలకు స్థిర మూల సమితి వివరణ, పట్టికలు, TeX స్థితి ఆధారం.'
        : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, సంపాదక గద్యం ఇందులో దాచలేదు.'
    });
  });
}
writeJsonl(segmentPath, [...previous, ...rows]);
console.log(JSON.stringify({
  terms: terms.length, segments: rows.length,
  linguistic: rows.filter(row => row.classification === 'translated_linguistic_segment').length,
  structural: rows.filter(row => row.classification === 'preserved_metadata_or_structural_segment').length,
  corrections: 4
}));
