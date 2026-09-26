import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) => fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const ids = ['OLP-0383', 'OLP-0384', 'OLP-0385'];
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const units = new Map();
for (const [index, id] of ids.entries()) {
  const unit = manifest.find(row => row.unit_id === id);
  if (!unit || unit.order !== 383 + index) throw new Error('Unexpected manifest cursor ' + id);
  const source = read('upstream/' + unit.source_path);
  const target = read('translation/' + unit.source_path);
  if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256) {
    throw new Error('Frozen source mismatch ' + id);
  }
  units.set(id, {unit, source, target});
}

const termFile = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termFile);
if (terms.length === 99 && terms.at(-1).term_id === 'TE-T099') {
  terms.push({
    term_id: 'TE-T100',
    source_term: 'many-valued logic / two-valued logic / truth value / valuation / truth function / truth-functional / designated value / tautology / entailment / rational number',
    telugu: 'బహుమూల్య తర్కం / ద్విమూల్య తర్కం / సత్యమూల్యం / సత్యమూల్య కేటాయింపు / సత్యమూల్య ప్రమేయం / సత్యమూల్య-ప్రమేయాత్మకం / నిర్దేశిత సత్యమూల్యం / సర్వసత్యం / అర్థపర అనుగమనం / కరణీయ సంఖ్య',
    status: 'formal_propositional_truth_value_consequence_and_rational_number_register_attested_many_valued_designation_source_controlled_provisional',
    passages: ['TE-P006', 'TE-P011', 'TE-P018', 'TE-P019', 'TE-P020', 'TE-P023'],
    basis: 'TE-P018లో సాంకేతిక, ప్రతిజ్ఞావాక్యాత్మక తర్క పరిధి; TE-P019లో సత్యతావిలువ, True/False, సంయోజకం; TE-P020లో వియోజకం, సత్య పట్టిక; TE-P023లో ఫలితం/అనుగమన గద్యం; TE-P006లో కరణీయ–అకరణీయ సంఖ్యల భేదం; పూర్వం ప్రత్యక్షంగా చదివిన TE-P011లో ప్రమేయం కనిపించాయి. ఈ పేజీలు బహుమూల్య తర్కం, నిర్దేశిత విలువల సమితి V^+, లేదా బహుమూల్య సత్యమూల్య ప్రమేయాలను నేరుగా నిర్వచించవు. OLP-0383–0385 స్థిర మూలం, TE-T033, TE-T095 పూర్వ తెలుగు వాడుక ఆ ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి. TE-P019 సత్యతావిలువ రూపాన్ని నేరుగా చూపినా, ఈ సంచికలో స్థిరమైన సత్యమూల్యం రూపాన్ని సందర్భానికి అనుగుణంగా కొనసాగించాం.',
    uncertainty: 'సాంప్రదాయిక ప్రతిజ్ఞావాక్య తర్కం, సత్యతావిలువ, సంయోజకం, కరణీయ సంఖ్యలకు స్థానిక ఆధారం ఉంది. బహుమూల్య, నిర్దేశిత విలువ, సత్యమూల్య-ప్రమేయాత్మకము అనే ప్రత్యేక కూర్పులు మూల నిర్వచనాలు, పూర్వ స్థిర వాడుక ఆధారంగా తాత్కాలికం. సత్యతావిలువ ప్రత్యక్ష సాక్ష్యమైనా సత్యమూల్యం ఎంపిక సందర్భానుసారమైన సంచిక స్థిరీకరణ.',
    borrowing: 'True, False, V, V^+, L, valuation/value/satisfaction macros and propositional metavariables are protected source notation; ordinary reader prose uses Telugu rather than unexplained English technical headwords.'
  });
  writeJsonl(termFile, terms);
} else if (terms.length !== 100 || terms.at(-1).term_id !== 'TE-T100') {
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
    return {block, startLine, endLine: startLine + block.split('\n').length - 1};
  });
}
const segmentFile = 'evidence/SEGMENT_CANON_USE.jsonl';
const previous = jsonl(segmentFile);
if (previous.length !== 5885 && !process.argv.includes('--refresh')) throw new Error('Unexpected prior segment cursor');
const retained = previous.filter(row => !ids.includes(row.unit_id));
if (retained.length !== previous.length && !process.argv.includes('--refresh')) {
  throw new Error('Use --refresh for existing Batch 058 rows');
}
const passageCatalog = new Map();
for (const row of previous) for (const passage of row.canon_passages ?? []) {
  if (!passageCatalog.has(passage.passage_id)) passageCatalog.set(passage.passage_id, passage);
}
const passageMap = {
  'OLP-0383': {4: ['TE-P018', 'TE-P019'], 5: ['TE-P018']},
  'OLP-0384': {4: ['TE-P018', 'TE-P019']},
  'OLP-0385': {
    5: ['TE-P018'],
    6: ['TE-P018', 'TE-P019', 'TE-P020'],
    7: ['TE-P018', 'TE-P019'],
    8: ['TE-P011', 'TE-P019', 'TE-P020'],
    9: ['TE-P006', 'TE-P019', 'TE-P023']
  }
};
const expectedBlocks = {'OLP-0383': 11, 'OLP-0384': 13, 'OLP-0385': 10};
const rows = [];
for (const id of ids) {
  const {unit, source, target} = units.get(id);
  const sourceBlocks = blocksWithSpans(source), targetBlocks = blocksWithSpans(target);
  if (sourceBlocks.length !== expectedBlocks[id] || targetBlocks.length !== expectedBlocks[id]) {
    throw new Error('Aligned block count changed ' + id);
  }
  sourceBlocks.forEach((block, index) => {
    const number = index + 1, t = targetBlocks[index];
    const linguistic = /[\u0C00-\u0C7F]/u.test(t.block);
    const expectedLinguistic = id === 'OLP-0383' ? number === 4 || number === 5
      : id === 'OLP-0384' ? number === 4 : number >= 5 && number <= 9;
    if (linguistic !== expectedLinguistic) throw new Error('Linguistic block mismatch ' + id + '-' + number);
    const passageIds = passageMap[id][number] ?? [];
    if (linguistic !== Boolean(passageIds.length)) throw new Error('Passage scope mismatch ' + id + '-' + number);
    const canonPassages = passageIds.map(passageId => {
      const passage = passageCatalog.get(passageId);
      if (!passage) throw new Error('Missing inspected passage ' + passageId);
      return passage;
    });
    rows.push({
      segment_id: `${id}-B${String(number).padStart(3, '0')}`,
      unit_id: id,
      source_path: unit.source_path,
      source_unit_sha256: sha(source),
      translation_unit_sha256: sha(target),
      source_start_line: block.startLine,
      source_end_line: block.endLine,
      target_start_line: t.startLine,
      target_end_line: t.endLine,
      source_segment_sha256: sha(block.block),
      translation_segment_sha256: sha(t.block),
      classification: linguistic ? 'translated_linguistic_segment' : 'preserved_metadata_or_structural_segment',
      canon_passages: canonPassages,
      source_corrections: [],
      consultation_phase: linguistic
        ? `${id} అనువాద సమయంలో ${id}-B${String(number).padStart(3, '0')} మూలం, లక్ష్యాన్ని ఎదురెదురుగా చదివి; నమోదైన స్థానిక పేజీలను ప్రత్యక్షంగా చూసి TE-T010, TE-T033, TE-T095, TE-T100 నిర్ణయాలతో పోల్చాం.`
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? 'స్థానిక పేజీలు సాంప్రదాయిక ప్రతిజ్ఞావాక్య తర్కం, సత్యతావిలువ, సంయోజకాలు, ఫలితం, కరణీయ సంఖ్య లేదా ప్రమేయ గద్యానికి మాత్రమే ఆధారం; బహుమూల్య తర్కం, నిర్దేశిత విలువల సమితి, దాని ప్రత్యేక సత్య ప్రమేయాలను నేరుగా బోధించవు. స్థిర మూల నిర్వచనాలు ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి.'
        : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, సంపాదక గద్యం ఇందులో దాచలేదు.'
    });
  });
}
writeJsonl(segmentFile, [...retained, ...rows]);
console.log(JSON.stringify({terms: 100, segments: rows.length,
  linguistic: rows.filter(row => row.classification === 'translated_linguistic_segment').length,
  structural: rows.filter(row => row.classification === 'preserved_metadata_or_structural_segment').length,
  corrections: 0}));
