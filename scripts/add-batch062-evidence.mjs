import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) =>
  fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const ids = ['OLP-0395', 'OLP-0396', 'OLP-0397'];
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const units = new Map();
for (const [index, id] of ids.entries()) {
  const unit = manifest.find(row => row.unit_id === id);
  if (!unit || unit.order !== 395 + index) throw new Error('Unexpected manifest cursor ' + id);
  const source = read('upstream/' + unit.source_path);
  const target = read('translation/' + unit.source_path);
  if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256)
    throw new Error('Frozen source mismatch ' + id);
  units.set(id, { unit, source, target });
}
const qa = JSON.parse(read('build/BATCH-062-STRUCTURAL-QA.json'));
if (qa.units.length !== 3 || qa.units.some(row =>
  !row.paragraph_alignment || !row.structure_match || !row.token_parity ||
  !row.protected_identifier_parity || !row.math_multiset_match))
  throw new Error('Batch structural QA has not passed');
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
if (corrections.length !== 370) throw new Error('Unexpected correction cursor');
for (const [auditDir, findingIds] of [
  ['evidence/source-audits/2026-09-26-kleene-three-valued-telugu',
    ['OLTEMVLKLE-001', 'OLTEMVLKLE-002']],
  ['evidence/source-audits/2026-09-26-multiple-designation-telugu',
    Array.from({ length: 6 }, (_, i) => 'OLTEMVLMUL-00' + (i + 1))]
]) {
  const findings = JSON.parse(read(auditDir + '/FINDINGS.json'));
  if (findings.findings.length !== findingIds.length) throw new Error('Audit count mismatch');
  for (const id of findingIds) {
    const row = corrections.find(item => item.finding_id === id);
    if (!row || row.audit_id !== findings.audit_id ||
        row.audit_findings_sha256 !== sha(read(auditDir + '/FINDINGS.json')) ||
        row.audit_review_sha256 !== sha(read(auditDir + '/REVIEW.md')) ||
        row.status !== 'applied_qa_pass') throw new Error('Source audit mismatch ' + id);
  }
}

const termsPath = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termsPath);
if (terms.length !== 103 || terms.at(-1).term_id !== 'TE-T103')
  throw new Error('Unexpected terminology cursor');
terms.push({
  term_id: 'TE-T104',
  source_term: 'strong/weak Kleene logic / undefined or unknown truth value / parallel evaluation / Gödel logic / intuitionistic logic / logic of paradox / logic of nonsense / paraconsistent / explosion / 3-valued R-Mingle / common connective fragment',
  telugu: 'బలమైన/బలహీనమైన క్లీని తర్కం / నిర్వచితం కాని లేదా తెలియని సత్యమూల్యం / సమాంతర గణన / గోడెల్ తర్కం / అంతర్బోధవాద తర్కం / వైరుధ్యాభాస తర్కం / అర్థరహిత తర్కం / విస్ఫోటనరహిత / విస్ఫోటన సూత్రం / మూడు-విలువల ఆర్-మింగిల్ / సాధారణ సంయోజక భాగం',
  status: 'native_propositional_truth_table_and_consequence_register_attested_specialized_three_valued_system_names_and_paraconsistency_definition_controlled_provisional',
  passages: ['TE-P011', 'TE-P018', 'TE-P019', 'TE-P020', 'TE-P023'],
  basis: 'TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, సంయోజకాల పరిధి; TE-P019లో సత్యతావిలువ, నిషేధం, సంయోగ పట్టిక; TE-P020లో వియోజక పట్టిక; TE-P023లో ఫలిత సంబంధం, సత్య పట్టిక; TE-P011లో ప్రమేయం అనే గణిత వాడుక పేజీ చిత్రాల్లో ప్రత్యక్షంగా చూశాం. ఈ పేజీలు Kleene, Gödel, LP, Hallden, R-Mingle లేదా పరవైరుధ్య తర్కాల ప్రత్యేక నిర్వచనాలను ఇవ్వవు. OLP-0395–0397 స్థిర మూల మాత్రికలు, నిరూపణలు, TE-T032/100/101/102/103 పూర్వ స్థిర పదజాలం ఆ ప్రత్యేక అర్థాలను నియంత్రిస్తాయి. ఎనిమిది ప్రకటిత సవరణలకు స్థానిక పదజాలం కాదు, మూల భాష నిర్వచనాలు, సత్య పట్టికలు, నిరూపణలే ఆధారం.',
  uncertainty: 'సాధారణ ప్రతిజ్ఞావాక్య తర్కం, సత్యమూల్యం, నిషేధం, సంయోగం, వికల్పం, సత్య పట్టిక, ఫలిత భావనకు ప్రత్యక్ష స్థానిక ఆధారం ఉంది. బలమైన/బలహీనమైన క్లీని, గోడెల్, అంతర్బోధవాద, వైరుధ్యాభాస, అర్థరహిత, విస్ఫోటనరహిత, ఆర్-మింగిల్ అనే ప్రత్యేక నామాలు ఈ స్థానిక పేజీల్లో నేరుగా లేవు; మూల నిర్వచనాలకు కట్టుబడి తాత్కాలికంగా వాడుతున్నాం. LP, Hallden భాషా పరిధి సంపాదకీయంగా స్పష్టం చేయబడింది; మూడు నిరూపణ సవరణలు మూల గణితానికి కట్టుబడి ఉన్నాయి.',
  borrowing: 'క్లీని, గోడెల్, హాల్డెన్, ఆర్-మింగిల్ పేర్లు గుర్తించదగిన శాస్త్రీయ నామాలుగా తెలుగు లిపిలో ఉన్నాయి. True, False, Undef, L_0, V, V^+, LP and logic macros protected notation; ordinary explanatory prose is Telugu.'
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
if (previous.length !== 6021 || previous.some(row => ids.includes(row.unit_id)))
  throw new Error('Unexpected prior segment cursor');
const passageCatalog = new Map();
for (const row of previous) for (const passage of row.canon_passages ?? [])
  if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
const passageMap = {
  'OLP-0395': {
    5: ['TE-P018'], 6: ['TE-P018', 'TE-P019'], 7: ['TE-P019'],
    8: ['TE-P019', 'TE-P020'], 9: ['TE-P019', 'TE-P020'],
    10: ['TE-P019', 'TE-P020'], 11: ['TE-P011', 'TE-P018', 'TE-P019', 'TE-P020'],
    12: ['TE-P011', 'TE-P018', 'TE-P019', 'TE-P020'],
    13: ['TE-P019'], 14: ['TE-P019', 'TE-P023'],
    15: ['TE-P023'], 16: ['TE-P023'],
    17: ['TE-P018', 'TE-P019', 'TE-P020'], 18: ['TE-P018', 'TE-P019']
  },
  'OLP-0396': {
    5: ['TE-P018'], 6: ['TE-P018', 'TE-P019'],
    7: ['TE-P011', 'TE-P018', 'TE-P019', 'TE-P020'],
    8: ['TE-P019', 'TE-P020'], 9: ['TE-P018', 'TE-P019', 'TE-P020'],
    10: ['TE-P019', 'TE-P020'], 11: ['TE-P019', 'TE-P020'],
    12: ['TE-P023']
  },
  'OLP-0397': {
    5: ['TE-P019'], 6: ['TE-P019'],
    7: ['TE-P018', 'TE-P019', 'TE-P020'],
    8: ['TE-P018', 'TE-P019', 'TE-P020'],
    9: ['TE-P019', 'TE-P020'], 10: ['TE-P019', 'TE-P020'],
    11: ['TE-P018', 'TE-P019', 'TE-P023'],
    12: ['TE-P019'], 13: ['TE-P019'], 14: ['TE-P019'],
    15: ['TE-P019', 'TE-P020'], 16: ['TE-P019', 'TE-P020'],
    17: ['TE-P019', 'TE-P020'], 18: ['TE-P019', 'TE-P023'],
    19: ['TE-P019', 'TE-P020', 'TE-P023'],
    20: ['TE-P019'], 21: ['TE-P018', 'TE-P019', 'TE-P020'],
    22: ['TE-P023'], 23: ['TE-P019', 'TE-P023'],
    24: ['TE-P011', 'TE-P019', 'TE-P020'],
    25: ['TE-P018'], 26: ['TE-P019', 'TE-P023']
  }
};
const expectedBlocks = { 'OLP-0395': 19, 'OLP-0396': 13, 'OLP-0397': 27 };
const correctionBlocks = {
  'OLP-0395': { 11: ['OLTEMVLKLE-001'], 12: ['OLTEMVLKLE-002'] },
  'OLP-0396': {},
  'OLP-0397': {
    7: ['OLTEMVLMUL-001'], 8: ['OLTEMVLMUL-002'],
    10: ['OLTEMVLMUL-003'], 12: ['OLTEMVLMUL-004'],
    14: ['OLTEMVLMUL-005'], 18: ['OLTEMVLMUL-006']
  }
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
    if (linguistic !== (number >= 5 && number < expectedBlocks[id]))
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
          ' మూలం, లక్ష్యాన్ని ఎదురెదురుగా చదివి, చూపిన TE-P011/018/019/020/023 స్థానిక పేజీ చిత్రాలను ప్రత్యక్షంగా చూశాం; TE-T032/100/101/102/103/104 పదజాలంతో వాడుకను పోల్చాం.'
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? 'స్థానిక పేజీలు సాధారణ ప్రతిజ్ఞావాక్య తర్కం, సత్యమూల్యం, నిషేధం/సంయోగం/వికల్పం పట్టికలు, ఫలిత భావన, ప్రమేయం అనే పదాలకు ఆధారం. క్లీని/గోడెల్/LP/హాల్డెన్/ఆర్-మింగిల్ ప్రత్యేక తర్కాలు, సమాంతర గణన, అంతర్బోధవాద సర్వసత్యాలు, విస్ఫోటనరహితత, నిర్దేశిత విలువల ఎంపిక ఆ పేజీల్లో నేరుగా లేవు; స్థిర మూల మాత్రికలు, నిరూపణలు వాటిని నియంత్రిస్తాయి. OLTEMVLKLE, OLTEMVLMUL గణిత సవరణలకు మూల భాష/పట్టికలే ఆధారం.'
        : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, సంపాదక గద్యం ఇందులో దాచలేదు.'
    });
  });
}
writeJsonl(segmentPath, [...previous, ...rows]);
console.log(JSON.stringify({
  terms: terms.length, segments: rows.length,
  linguistic: rows.filter(row => row.classification === 'translated_linguistic_segment').length,
  structural: rows.filter(row => row.classification === 'preserved_metadata_or_structural_segment').length,
  corrections: 8
}));
