import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) => fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const ids = ['OLP-0392', 'OLP-0393', 'OLP-0394'];
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const units = new Map();
for (const [index, id] of ids.entries()) {
  const unit = manifest.find(row => row.unit_id === id);
  if (!unit || unit.order !== 392 + index) throw new Error('Unexpected manifest cursor ' + id);
  const source = read('upstream/' + unit.source_path);
  const target = read('translation/' + unit.source_path);
  if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256) throw new Error('Frozen source mismatch ' + id);
  units.set(id, { unit, source, target });
}
const auditDir = 'evidence/source-audits/2026-09-26-lukasiewicz-three-valued-telugu';
const audit = JSON.parse(read(auditDir + '/FINDINGS.json'));
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
if (corrections.length !== 362 || audit.findings.length !== 4) throw new Error('Unexpected source-audit cursor');
for (const id of ['OLTEMVLLUK-001', 'OLTEMVLLUK-002', 'OLTEMVLLUK-003', 'OLTEMVLLUK-004']) {
  const row = corrections.find(item => item.finding_id === id);
  if (!row || row.audit_id !== audit.audit_id ||
      row.audit_findings_sha256 !== sha(read(auditDir + '/FINDINGS.json')) ||
      row.audit_review_sha256 !== sha(read(auditDir + '/REVIEW.md')) ||
      row.status !== 'applied_qa_pass') throw new Error('Source audit mismatch ' + id);
}
const termFile = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termFile);
if (terms.length === 102 && terms.at(-1).term_id === 'TE-T102') {
  terms.push({
    term_id: 'TE-T103',
    source_term: 'three-valued logic / undetermined / future contingent / Łukasiewicz logic / truth function / designated value / tautology / possible / necessary / modal logic',
    telugu: 'మూడు-విలువల తర్కం / అనిర్ణీతం / భవిష్యత్తుపై ఆధారపడిన వాక్యం / Łukasiewicz తర్కం / సత్యమూల్య ప్రమేయం / నిర్దేశిత విలువ / సర్వసత్యం / సాధ్యం / తప్పనిసరి / మోడల్ తర్కం',
    status: 'native_truth_value_connective_function_and_consequence_register_attested_specialized_three_valued_future_contingent_and_modal_senses_definition_controlled_provisional',
    passages: ['TE-P011', 'TE-P018', 'TE-P019', 'TE-P020', 'TE-P023'],
    basis: 'TE-P018లో ప్రతిజ్ఞావాక్య తర్కపు పరిచయం, TE-P019లో సత్యతావిలువ, నిషేధం, సంయోగ సత్య పట్టిక, TE-P020లో వికల్ప సత్య పట్టిక, TE-P023లో ఫలితానికి సత్య పట్టిక పరీక్ష, TE-P011లో ప్రమేయం అనే గణిత పదాన్ని పేజీ చిత్రాల్లో ప్రత్యక్షంగా చూశాం. మూడు-విలువల/అనిర్ణీత విలువ, Łukasiewicz చారిత్రక ప్రేరణ, భవిష్యత్ ఆధారిత వాక్యం, నిర్దేశిత విలువ, సంభావ్యత/అనివార్యతల ప్రత్యేక మోడల్ అర్థం ఆ పేజీల్లో నేరుగా లేవు. OLP-0393–0394 స్థిర మూల నిర్వచనాలు, పట్టికలు, TE-T053 మోడల్ తర్కం, TE-T100/102 సత్యమూల్యం/మాత్రిక అర్థాలు ఈ ప్రత్యేక వాడుకను నియంత్రిస్తాయి. నాలుగు OLTEMVLLUK ఆడిట్ సవరణలకు స్థానిక పదజాలం కాదు, స్థిర మూల పట్టికలు, ముందరి భాష/మాత్రిక నిర్వచనాలే గణిత ఆధారం.',
    uncertainty: 'సత్యతావిలువ, ప్రతిజ్ఞావాక్య సంయోజకం, పట్టిక, ప్రమేయం, ఫలితం అనే సాధారణ పదజాలానికి ప్రత్యక్ష సాక్ష్యం ఉంది. మూడు-విలువల అనిర్ణీత స్థితి, చారిత్రక భావంలో సాధ్యమే కాని తప్పనిసరి కాని భవిష్యత్తు వాక్యం, మోడల్ సాధ్యత/అనివార్యత నామాలకు ఇక్కడ ప్రత్యక్ష స్థానిక సాక్ష్యం లేదు; మూల వ్యాఖ్యానం, పట్టికలకే వాటిని కట్టుబడి తాత్కాలికంగా వాడుతున్నాం. మూలంలో మిగిలిన అసత్య స్థిరాంక విలువను Falseగా చేర్చడం ఒక స్పష్టమైన సంపాదకీయ ఎంపిక; నాలుగు ముద్రిత పట్టికల నుంచి అది తప్పనిసరిగా రాదు.',
    borrowing: 'మోడల్ తర్కం TE-T053లో ప్రకటించిన సాంకేతిక అరువు; Łukasiewicz, Aristotle, Warsaw వ్యక్తి/స్థల నామాలు మూలంతో గుర్తించదగినట్లు ఉంచాం. True, False, Undef, L_0, Diamond, Box, formula and valuation macros protected notation, not unexplained English headwords in prose.'
  });
  writeJsonl(termFile, terms);
} else if (terms.length === 103 && terms.at(-1).term_id === 'TE-T103' && process.argv.includes('--refresh')) {
  terms.at(-1).telugu = 'మూడు-విలువల తర్కం / అనిర్ణీతం / భవిష్యత్తుపై ఆధారపడిన వాక్యం / Łukasiewicz తర్కం / సత్యమూల్య ప్రమేయం / నిర్దేశిత విలువ / సర్వసత్యం / సాధ్యం / తప్పనిసరి / మోడల్ తర్కం';
  writeJsonl(termFile, terms);
} else if (terms.length !== 103 || terms.at(-1).term_id !== 'TE-T103') throw new Error('Unexpected terminology cursor');

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
const segmentFile = 'evidence/SEGMENT_CANON_USE.jsonl';
const previous = jsonl(segmentFile);
if (previous.length !== 5980 && !process.argv.includes('--refresh')) throw new Error('Unexpected prior segment cursor');
const retained = previous.filter(row => !ids.includes(row.unit_id));
if (retained.length !== previous.length && !process.argv.includes('--refresh')) throw new Error('Use --refresh for existing Batch 061 rows');
const passageCatalog = new Map();
for (const row of previous) for (const passage of row.canon_passages ?? []) {
  if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
}
const passageMap = {
  'OLP-0392': { 4: ['TE-P018', 'TE-P019'] },
  'OLP-0393': { 5: ['TE-P018'], 6: ['TE-P018', 'TE-P019', 'TE-P020'], 7: ['TE-P018', 'TE-P019'] },
  'OLP-0394': {
    5: ['TE-P018', 'TE-P019'], 6: ['TE-P018', 'TE-P019'],
    7: ['TE-P019', 'TE-P020'], 8: ['TE-P018', 'TE-P019', 'TE-P020'],
    9: ['TE-P011', 'TE-P019', 'TE-P020'], 10: ['TE-P018', 'TE-P019', 'TE-P020'],
    11: ['TE-P019'], 12: ['TE-P018', 'TE-P019', 'TE-P020'],
    13: ['TE-P019', 'TE-P020'], 14: ['TE-P019', 'TE-P020'],
    15: ['TE-P018', 'TE-P019', 'TE-P020'], 16: ['TE-P018', 'TE-P019', 'TE-P020'],
    17: ['TE-P019', 'TE-P020'], 18: ['TE-P018', 'TE-P023'],
    19: ['TE-P018', 'TE-P019'], 20: ['TE-P018', 'TE-P019'],
    21: ['TE-P018', 'TE-P019', 'TE-P020']
  }
};
const expectedBlocks = { 'OLP-0392': 11, 'OLP-0393': 8, 'OLP-0394': 22 };
const correctionBlocks = { 7: ['OLTEMVLLUK-001'], 9: ['OLTEMVLLUK-002'],
  16: ['OLTEMVLLUK-003'], 21: ['OLTEMVLLUK-004'] };
const rows = [];
for (const id of ids) {
  const { unit, source, target } = units.get(id);
  const sourceBlocks = blocksWithSpans(source), targetBlocks = blocksWithSpans(target);
  if (sourceBlocks.length !== expectedBlocks[id] || targetBlocks.length !== expectedBlocks[id]) throw new Error('Aligned block count changed ' + id);
  sourceBlocks.forEach((block, index) => {
    const number = index + 1, t = targetBlocks[index];
    const linguistic = Object.hasOwn(passageMap[id], number);
    if (linguistic !== (id === 'OLP-0392' ? number === 4 : number >= 5 && (id === 'OLP-0393' ? number <= 7 : number <= 21))) throw new Error('Unexpected linguistic block ' + id + '-' + number);
    if (!linguistic && /[\u0C00-\u0C7F]/u.test(t.block)) throw new Error('Telugu in structural block ' + id + '-' + number);
    if (linguistic && !/[\u0C00-\u0C7F]/u.test(t.block)) throw new Error('No Telugu in linguistic block ' + id + '-' + number);
    const canonPassages = (passageMap[id][number] ?? []).map(passageId => {
      const passage = passageCatalog.get(passageId);
      if (!passage) throw new Error('Missing inspected passage ' + passageId);
      return passage;
    });
    rows.push({
      segment_id: id + '-B' + String(number).padStart(3, '0'), unit_id: id,
      source_path: unit.source_path, source_unit_sha256: sha(source), translation_unit_sha256: sha(target),
      source_start_line: block.startLine, source_end_line: block.endLine,
      target_start_line: t.startLine, target_end_line: t.endLine,
      source_segment_sha256: sha(block.block), translation_segment_sha256: sha(t.block),
      classification: linguistic ? 'translated_linguistic_segment' : 'preserved_metadata_or_structural_segment',
      canon_passages: canonPassages,
      source_corrections: id === 'OLP-0394' ? (correctionBlocks[number] ?? []) : [],
      consultation_phase: linguistic
        ? id + '-B' + String(number).padStart(3, '0') + ' మూలం, లక్ష్యాన్ని ఎదురెదురుగా చదివి, ఈ ఖండానికి చూపిన TE-P011/018/019/020/023 స్థానిక పేజీ చిత్రాలను ప్రత్యక్షంగా చూశాం; TE-T053/100/102/103తో వాడుకను పోల్చాం.'
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? 'స్థానిక పేజీలు ప్రమేయం, ప్రతిజ్ఞావాక్య తర్కం, సత్యతావిలువ, నిషేధం/సంయోగం/వికల్పం పట్టికలు, ఫలిత భావన అనే సాధారణ వాడుకకు ఆధారం. చారిత్రక Łukasiewicz వ్యాఖ్య, మూడవ విలువ, భవిష్యత్ ఆధారిత వాక్యం, నిర్దేశిత విలువ, సాధ్యత/అనివార్యత ప్రత్యేక సాంకేతిక అర్థం వాటిలో నేరుగా లేదు; స్థిర మూల వ్యాఖ్యానం, పట్టికలే నియంత్రిస్తాయి. OLTEMVLLUK-001–004 గణిత సవరణలకు మూల నిర్వచనాలు/పట్టికలే ఆధారం, స్థానిక పదజాల పేజీలు కాదు.'
        : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, సంపాదక గద్యం ఇందులో దాచలేదు.'
    });
  });
}
writeJsonl(segmentFile, [...retained, ...rows]);
console.log(JSON.stringify({ terms: 103, segments: rows.length,
  linguistic: rows.filter(row => row.classification === 'translated_linguistic_segment').length,
  structural: rows.filter(row => row.classification === 'preserved_metadata_or_structural_segment').length,
  corrections: 4 }));
