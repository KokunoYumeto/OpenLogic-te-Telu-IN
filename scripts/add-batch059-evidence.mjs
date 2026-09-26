import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(line => JSON.parse(line));
const writeJsonl = (file, rows) => fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const ids = ['OLP-0386', 'OLP-0387', 'OLP-0388'];
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const units = new Map();
for (const [index, id] of ids.entries()) {
  const unit = manifest.find(row => row.unit_id === id);
  if (!unit || unit.order !== 386 + index) throw new Error('Unexpected manifest cursor ' + id);
  const source = read('upstream/' + unit.source_path);
  const target = read('translation/' + unit.source_path);
  if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256) {
    throw new Error('Frozen source mismatch ' + id);
  }
  units.set(id, { unit, source, target });
}
const audit = JSON.parse(read('evidence/source-audits/2026-09-26-many-valued-syntax-telugu/FINDINGS.json'));
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const correction = corrections.find(row => row.finding_id === 'OLTEMVLSYN-001');
if (corrections.length !== 356 || !correction || correction.audit_id !== audit.audit_id ||
    correction.audit_findings_sha256 !== sha(read('evidence/source-audits/2026-09-26-many-valued-syntax-telugu/FINDINGS.json')) ||
    correction.audit_review_sha256 !== sha(read('evidence/source-audits/2026-09-26-many-valued-syntax-telugu/REVIEW.md'))) {
  throw new Error('Batch 059 source audit mismatch');
}

const termFile = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termFile);
if (terms.length === 100 && terms.at(-1).term_id === 'TE-T100') {
  terms.push({
    term_id: 'TE-T101',
    source_term: 'propositional language / connective / arity / n-place / constant / unary / binary / product logic / determinateness operator / matrix / truth function',
    telugu: 'ప్రతిజ్ఞావాక్య భాష / సంయోజకం / స్థానసంఖ్య / n-స్థానికం / స్థిరాంకం / ఏకస్థానికం / ద్విస్థానికం / గుణిత తర్కం / నిర్ణీతత్వ సంచాలకం / మాత్రిక / సత్యమూల్య ప్రమేయం',
    status: 'propositional_logic_truth_table_set_and_function_register_attested_specialized_many_valued_matrix_and_operator_names_source_controlled_provisional',
    passages: ['TE-P008', 'TE-P011', 'TE-P018', 'TE-P019', 'TE-P020'],
    basis: 'TE-P018లో ప్రతిజ్ఞావాక్యాత్మక తర్కం, సంయోజకాల పరిచయం; TE-P019–P020లో సంయోజకం, వియోజకం, సత్యతావిలువ, సత్య పట్టికలు; TE-P008లో సమితి/ఉపసమితి; TE-P011లో ప్రమేయం, దాని సంయుక్తం ప్రత్యక్షంగా కనిపించాయి. ఆ పేజీలు n-స్థానిక సంయోజకం, గుణిత తర్కం, నిర్ణీతత్వ సంచాలకం, లేదా బహుమూల్య తర్కపు మాత్రికను ప్రత్యక్షంగా నిర్వచించవు. OLP-0386–0388 స్థిర మూల నిర్వచనాలు, పూర్వ TE-T050 స్థానసంఖ్య, TE-T100 సత్యమూల్య ప్రమేయం ఎంపికలు ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి. మాత్రిక అనేది భాష, ఖాళీ కాని V, V^+ ఉపసమితి, ప్రతి సంయోజకానికి సత్యమూల్య ప్రమేయం గల నిర్మాణం; అది కేవలం సంఖ్యల దీర్ఘచతురస్ర పట్టిక కాదు.',
    uncertainty: 'ప్రతిజ్ఞావాక్య తర్కం, సత్యతా పట్టిక, సమితి, ప్రమేయం రూపాలకు స్థానిక ఆధారం ఉంది. మాత్రిక, గుణిత తర్కం, నిర్ణీతత్వ సంచాలకం, స్థానసంఖ్య అనే ప్రత్యేక కూర్పులకు నామసాక్ష్యం పరిమితం; మూల నిర్వచనాలకు కట్టుబడిన తాత్కాలిక ఎంపికలు.',
    borrowing: 'L, L_0, V, V^+, star, triangle, truth-value and connective macros, and arity numerals are protected source notation. మాత్రిక is an explicit technical loan rendered in Telugu script; ordinary explanatory prose remains Telugu.'
  });
  writeJsonl(termFile, terms);
} else if (terms.length !== 101 || terms.at(-1).term_id !== 'TE-T101') {
  throw new Error('Unexpected terminology cursor');
}

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
if (previous.length !== 5919 && !process.argv.includes('--refresh')) throw new Error('Unexpected prior segment cursor');
const retained = previous.filter(row => !ids.includes(row.unit_id));
if (retained.length !== previous.length && !process.argv.includes('--refresh')) throw new Error('Use --refresh for existing Batch 059 rows');
const passageCatalog = new Map();
for (const row of previous) for (const passage of row.canon_passages ?? []) {
  if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
}
const passageMap = {
  'OLP-0386': { 5: ['TE-P018'], 6: ['TE-P018', 'TE-P019', 'TE-P020'],
    7: ['TE-P018', 'TE-P019'], 8: ['TE-P008', 'TE-P011', 'TE-P018'], 9: ['TE-P011', 'TE-P018', 'TE-P019'] },
  'OLP-0387': { 5: ['TE-P018'], 6: ['TE-P008', 'TE-P018'], 7: ['TE-P018'], 8: ['TE-P018', 'TE-P019'] },
  'OLP-0388': { 5: ['TE-P018'], 6: ['TE-P008', 'TE-P011', 'TE-P019'],
    7: ['TE-P008', 'TE-P011', 'TE-P019'], 8: ['TE-P019', 'TE-P020'] }
};
const expectedBlocks = { 'OLP-0386': 10, 'OLP-0387': 9, 'OLP-0388': 9 };
const rows = [];
for (const id of ids) {
  const { unit, source, target } = units.get(id);
  const sourceBlocks = blocksWithSpans(source), targetBlocks = blocksWithSpans(target);
  if (sourceBlocks.length !== expectedBlocks[id] || targetBlocks.length !== expectedBlocks[id]) throw new Error('Aligned block count changed ' + id);
  sourceBlocks.forEach((block, index) => {
    const number = index + 1, t = targetBlocks[index];
    const linguistic = Object.hasOwn(passageMap[id], number);
    if (linguistic !== (number >= 5 && number < expectedBlocks[id])) throw new Error('Unexpected linguistic block ' + id + '-' + number);
    if (!linguistic && /[\u0C00-\u0C7F]/u.test(t.block)) throw new Error('Telugu in structural block ' + id + '-' + number);
    if (linguistic && !/[\u0C00-\u0C7F]/u.test(t.block) && !(id === 'OLP-0387' && number === 5)) throw new Error('No Telugu in linguistic block ' + id + '-' + number);
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
      source_corrections: id === 'OLP-0386' && number === 6 ? ['OLTEMVLSYN-001'] : [],
      consultation_phase: linguistic
        ? `${id} అనువాదంలో ${id}-B${String(number).padStart(3, '0')} మూలం, లక్ష్యాన్ని ఎదురెదురుగా చదివి; TE-P008/011/018/019/020లలో ఈ ఖండానికి పేర్కొన్న స్థానిక పేజీలను ప్రత్యక్షంగా చూశాం. TE-T050, TE-T100, TE-T101తో పదవాడుకను పోల్చాం.`
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? 'స్థానిక పేజీలు సమితి, ప్రమేయం, ప్రతిజ్ఞావాక్య తర్కం, సంయోజకం, సత్యతావిలువ, సత్య పట్టికల సాధారణ వాడుకకు మాత్రమే ఆధారం. బహుమూల్య మాత్రిక, గుణిత తర్కం, నిర్ణీతత్వ సంచాలకం, n-స్థానిక సంయోజకం ప్రత్యేక నిర్వచనాలకు అవి ప్రత్యక్ష నామసాక్ష్యం కావు; స్థిర మూల నిర్వచనాలే ఆ అర్థాన్ని నియంత్రిస్తాయి. OLTEMVLSYN-001 కుండలీకరణ సవరణ మూల మాక్రో నిర్మాణం, పూర్వ OLP-0058 సమాంతర ఆడిట్ ఆధారంగా ఉంది.'
        : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, సంపాదక గద్యం ఇందులో దాచలేదు.'
    });
  });
}
writeJsonl(segmentFile, [...retained, ...rows]);
console.log(JSON.stringify({ terms: 101, segments: rows.length,
  linguistic: rows.filter(row => row.classification === 'translated_linguistic_segment').length,
  structural: rows.filter(row => row.classification === 'preserved_metadata_or_structural_segment').length,
  corrections: 1 }));
