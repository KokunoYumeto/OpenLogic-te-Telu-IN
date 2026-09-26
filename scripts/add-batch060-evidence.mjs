import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(line => JSON.parse(line));
const writeJsonl = (file, rows) => fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const ids = ['OLP-0389', 'OLP-0390', 'OLP-0391'];
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const units = new Map();
for (const [index, id] of ids.entries()) {
  const unit = manifest.find(row => row.unit_id === id);
  if (!unit || unit.order !== 389 + index) throw new Error('Unexpected manifest cursor ' + id);
  const source = read('upstream/' + unit.source_path);
  const target = read('translation/' + unit.source_path);
  if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256) throw new Error('Frozen source mismatch ' + id);
  units.set(id, { unit, source, target });
}
const auditDir = 'evidence/source-audits/2026-09-26-many-valued-sublogics-telugu';
const audit = JSON.parse(read(auditDir + '/FINDINGS.json'));
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
if (corrections.length !== 358 || audit.findings.length !== 2) throw new Error('Unexpected source-audit cursor');
for (const id of ['OLTEMVLSUB-001', 'OLTEMVLSUB-002']) {
  const record = corrections.find(row => row.finding_id === id);
  if (!record || record.audit_id !== audit.audit_id ||
      record.audit_findings_sha256 !== sha(read(auditDir + '/FINDINGS.json')) ||
      record.audit_review_sha256 !== sha(read(auditDir + '/REVIEW.md')) ||
      record.status !== 'applied_qa_pass') throw new Error('Source audit mismatch ' + id);
}
const termFile = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termFile);
if (terms.length === 101 && terms.at(-1).term_id === 'TE-T101') {
  terms.push({
    term_id: 'TE-T102',
    source_term: 'valuation / evaluation / satisfaction / satisfiable / tautology / entailment / semantic notions / monotonicity / transitivity / modus ponens / semantic deduction theorem / sublogic / common fragment',
    telugu: 'సత్యమూల్య కేటాయింపు / మూల్యాంకనం / సంతృప్తి / సంతృప్తిపరచదగినది / సర్వసత్యం / అర్థపర అనుగమనం / అర్థపర భావనలు / ఏకదిశత / సంక్రమణశీలత / మోడస్ పోనెన్స్ / అర్థపర నిగమన సిద్ధాంతం / ఉపతర్కం / సాధారణ భాగం',
    status: 'native_truth_value_consequence_and_function_register_attested_specialized_many_valued_semantics_and_sublogic_fragment_definition_controlled_provisional',
    passages: ['TE-P008', 'TE-P011', 'TE-P018', 'TE-P019', 'TE-P020', 'TE-P023'],
    basis: 'TE-P018లో ప్రతిజ్ఞావాక్యాత్మక తర్కపు నేపథ్యం; TE-P019–P020లో సత్యతావిలువ, సంయోజకం, సత్య పట్టికలు; TE-P023లో పూర్వపక్షాల నుంచి ఫలితంగా సత్యం నిలిచే భావన; TE-P008లో సమితి/ఉపసమితి; TE-P011లో ప్రమేయం ప్రత్యక్షంగా కనిపించాయి. ఈ పేజీలు బహుమూల్య సంతృప్తి, నిర్దేశిత విలువలు, ఉపతర్కపు సాధారణ భాగం, లేదా అర్థపర నిగమన సిద్ధాంతం ప్రత్యేక నిర్వచనాలను నేరుగా ఇవ్వవు. OLP-0389–0391లోని కేటాయింపు–మూల్యాంకనం–సంతృప్తి నిర్వచనాలు, నాలుగు సంయోజకాల Boolean పరిమితి, TE-T033/035/037/100 పూర్వ స్థిర వాడుక ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి. OLTEMVLSUB-001లో మూల సిద్ధాంతాన్ని చరాల నుంచి నాలుగు పేర్కొన్న సంయోజకాలతో ఏర్పడిన భాగానికి పరిమితం చేయడం స్థానిక పదజాల ఎంపిక కాదు, గణిత ప్రతిదృష్టాంతం వల్ల అవసరమైన మూల సవరణ.',
    uncertainty: 'సత్యతావిలువ, ఫలితం, సమితి, ప్రమేయం సాధారణ పదజాలానికి స్థానిక ఆధారం ఉంది. బహుమూల్య సంతృప్తి, ఉపతర్కం, సాధారణ భాగం, అర్థపర నిగమన సిద్ధాంతం అనే ప్రత్యేక కూర్పులకు ప్రత్యక్ష నామసాక్ష్యం లేదు; వాటిని మూల నిర్వచనాలకే కట్టుబడి తాత్కాలికంగా వాడుతున్నాం.',
    borrowing: 'మోడస్ పోనెన్స్ పూర్వ TE-T035/040లో ఇప్పటికే వివరణతో కూడిన సాంకేతిక తర్జుమా. L, V, V^+, valuation/satisfaction/entailment macros, Gamma and formula metavariables protected notation; no unexplained English technical headword remains in ordinary prose.'
  });
  writeJsonl(termFile, terms);
} else if (terms.length !== 102 || terms.at(-1).term_id !== 'TE-T102') throw new Error('Unexpected terminology cursor');

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
if (previous.length !== 5947 && !process.argv.includes('--refresh')) throw new Error('Unexpected prior segment cursor');
const retained = previous.filter(row => !ids.includes(row.unit_id));
if (retained.length !== previous.length && !process.argv.includes('--refresh')) throw new Error('Use --refresh for existing Batch 060 rows');
const passageCatalog = new Map();
for (const row of previous) for (const passage of row.canon_passages ?? []) {
  if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
}
const passageMap = {
  'OLP-0389': { 5: ['TE-P018', 'TE-P019'], 6: ['TE-P008', 'TE-P011', 'TE-P019'],
    7: ['TE-P011', 'TE-P019'], 8: ['TE-P019', 'TE-P023'], 9: ['TE-P019', 'TE-P023'] },
  'OLP-0390': { 5: ['TE-P018', 'TE-P023'], 6: ['TE-P011', 'TE-P018', 'TE-P019'],
    7: ['TE-P008', 'TE-P019', 'TE-P023'], 8: ['TE-P018', 'TE-P023'],
    9: ['TE-P019', 'TE-P023'], 10: ['TE-P018'], 11: ['TE-P018'],
    12: ['TE-P019', 'TE-P023'] },
  'OLP-0391': { 5: ['TE-P018', 'TE-P023'], 6: ['TE-P018', 'TE-P019', 'TE-P020'],
    7: ['TE-P018', 'TE-P019', 'TE-P023'], 8: ['TE-P011', 'TE-P018', 'TE-P019'],
    9: ['TE-P018', 'TE-P019', 'TE-P023'], 10: ['TE-P018', 'TE-P019', 'TE-P023'] }
};
const expectedBlocks = { 'OLP-0389': 10, 'OLP-0390': 13, 'OLP-0391': 10 };
const rows = [];
for (const id of ids) {
  const { unit, source, target } = units.get(id);
  const sourceBlocks = blocksWithSpans(source), targetBlocks = blocksWithSpans(target);
  if (sourceBlocks.length !== expectedBlocks[id] || targetBlocks.length !== expectedBlocks[id]) throw new Error('Aligned block count changed ' + id);
  sourceBlocks.forEach((block, index) => {
    const number = index + 1, t = targetBlocks[index];
    const linguistic = Object.hasOwn(passageMap[id], number);
    if (linguistic !== (number >= 5 && (id === 'OLP-0391' || number < expectedBlocks[id]))) throw new Error('Unexpected linguistic block ' + id + '-' + number);
    if (!linguistic && /[\u0C00-\u0C7F]/u.test(t.block)) throw new Error('Telugu in structural block ' + id + '-' + number);
    if (linguistic && !/[\u0C00-\u0C7F]/u.test(t.block)) throw new Error('No Telugu in linguistic block ' + id + '-' + number);
    const canonPassages = (passageMap[id][number] ?? []).map(passageId => {
      const passage = passageCatalog.get(passageId);
      if (!passage) throw new Error('Missing inspected passage ' + passageId);
      return passage;
    });
    rows.push({
      segment_id: `${id}-B${String(number).padStart(3, '0')}`, unit_id: id,
      source_path: unit.source_path, source_unit_sha256: sha(source), translation_unit_sha256: sha(target),
      source_start_line: block.startLine, source_end_line: block.endLine,
      target_start_line: t.startLine, target_end_line: t.endLine,
      source_segment_sha256: sha(block.block), translation_segment_sha256: sha(t.block),
      classification: linguistic ? 'translated_linguistic_segment' : 'preserved_metadata_or_structural_segment',
      canon_passages: canonPassages,
      source_corrections: id === 'OLP-0391' && [7, 9].includes(number) ? ['OLTEMVLSUB-001']
        : id === 'OLP-0391' && number === 10 ? ['OLTEMVLSUB-002'] : [],
      consultation_phase: linguistic
        ? `${id} అనువాదంలో ${id}-B${String(number).padStart(3, '0')} మూలం, లక్ష్యాన్ని ఎదురెదురుగా చదివి; TE-P008/011/018/019/020/023లలో ఈ ఖండానికి పేర్కొన్న స్థానిక పేజీలను ప్రత్యక్షంగా చూశాం. TE-T033, TE-T035, TE-T037, TE-T100, TE-T102తో పదవాడుకను పోల్చాం.`
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? 'స్థానిక పేజీలు సమితి, ప్రమేయం, ప్రతిజ్ఞావాక్య తర్కం, సత్యతావిలువ, సత్య పట్టిక, సత్యాన్ని నిలిపే ఫలితం అనే సాధారణ వాడుకకు మాత్రమే ఆధారం. బహుమూల్య మాత్రిక, సంతృప్తి, ఉపతర్కపు సాధారణ భాగం, అర్థపర నిగమన సిద్ధాంతానికి అవి ప్రత్యక్ష నామసాక్ష్యం కావు; స్థిర మూల నిర్వచనాలే అర్థాన్ని నియంత్రిస్తాయి. OLTEMVLSUB-001/002 గణిత సవరణలు మూల పరికల్పనలు, ముందరి నిర్వచనాలు, స్పష్టమైన ప్రతిదృష్టాంతంపై ఆధారపడతాయి; స్థానిక పదజాల పేజీలపై కాదు.'
        : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, సంపాదక గద్యం ఇందులో దాచలేదు.'
    });
  });
}
writeJsonl(segmentFile, [...retained, ...rows]);
console.log(JSON.stringify({ terms: 102, segments: rows.length,
  linguistic: rows.filter(row => row.classification === 'translated_linguistic_segment').length,
  structural: rows.filter(row => row.classification === 'preserved_metadata_or_structural_segment').length,
  corrections: 2 }));
