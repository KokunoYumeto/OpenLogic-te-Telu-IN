import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) =>
  fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const id = 'OLP-0415';
const unit = jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row => row.unit_id === id);
if (!unit || unit.order !== 415) throw new Error('Unexpected manifest cursor');
const source = read('upstream/' + unit.source_path);
const target = read('translation/' + unit.source_path);
if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256)
  throw new Error('Frozen source mismatch');
const qa = JSON.parse(read('build/BATCH-067-STRUCTURAL-QA.json'));
const q = qa.units[0];
if (qa.units.length !== 1 || q.unit_id !== id || !q.paragraph_alignment ||
    !q.structure_match || !q.token_parity || !q.protected_identifier_parity ||
    !q.math_multiset_match || q.unicode_replacement_char || q.unpaired_surrogate)
  throw new Error('Bounded structural QA has not passed');
const termsPath = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termsPath);
if (terms.length !== 108 || terms.at(-1).term_id !== 'TE-T108')
  throw new Error('Unexpected terminology cursor');
terms.push({
  term_id: 'TE-T109',
  source_term: 'modal validity in a class of models / reflexive accessibility relation / necessitation rule',
  telugu: 'మోడల్ చెల్లుబాటుతనం; నమూనాల వర్గంలో చెల్లుబాటు / స్వావర్తన ప్రాప్యత సంబంధం / అవశ్యకీకరణ నియమం',
  status: 'native_propositional_truth_consequence_subset_relation_and_inference_register_attested_specialized_modal_validity_source_controlled_provisional',
  passages: ['TE-P008', 'TE-P010', 'TE-P018', 'TE-P019', 'TE-P021', 'TE-P023', 'TE-P024'],
  basis: 'TE-P008లో ఉపసమితి, TE-P010లో ద్విస్థానిక సంబంధం, TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, TE-P019లో సత్యతావిలువ, TE-P021లో సోపాధికం, TE-P023లో ఫలితం, TE-P024లో నియమ వ్యుత్పత్తి స్థానిక చిత్రాలను OLP-0415కు ముందు ప్రత్యక్షంగా చూశాం. ఇవి సాధారణ తర్క, సమితి, సంబంధ రిజిస్టర్‌కు మాత్రమే ఆధారం. అన్ని క్రిప్కె నమూనాల్లో లేదా ఒక నమూనాల వర్గంలో చెల్లుబాటు, స్వావర్తన ప్రాప్యత, అవశ్యకీకరణ నియమాల ప్రత్యేక అర్థం స్థిర OLP-0415 నిర్వచనం, ప్రతిపాదన, నిరూపణ ఆధారితం; పూర్వ TE-T016/034/103/107/108 పదజాలంతో సమన్వయం చేశాం.',
  uncertainty: 'స్థానిక పేజీలు మోడల్ చెల్లుబాటు లేదా అవశ్యకీకరణను నేరుగా నిర్వచించవు. స్వావర్తన అనే సంబంధ గుణనామం TE-T016లోనూ మూల నిర్వచనాధారిత తాత్కాలిక ఎంపిక; ఇక్కడ ప్రతి లోకం తనకు తానే ప్రాప్యమయ్యే ఖచ్చిత అర్థంలో వాడాం.',
  borrowing: 'మోడల్, నార్మల్, అలెథిక్ గుర్తించదగిన సాంకేతిక అరువులు; Box, Diamond, W, R, V, M, C, satisfaction and entailment macros protected mathematical notation.'
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
  5: ['TE-P018'],
  6: ['TE-P010', 'TE-P018', 'TE-P019'],
  7: ['TE-P018', 'TE-P019', 'TE-P023'],
  8: ['TE-P008'],
  9: ['TE-P019', 'TE-P024'],
  10: ['TE-P010', 'TE-P019', 'TE-P024'],
  11: ['TE-P019', 'TE-P021'],
  12: ['TE-P010', 'TE-P021']
};
const canon = new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row => [row.passage_id, row]));
const segmentPath = 'evidence/SEGMENT_CANON_USE.jsonl';
const current = jsonl(segmentPath);
if (current.length !== 6315 || current.some(row => row.unit_id === id))
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
    canon_passages: canonPassages, source_corrections: [],
    consultation_phase: linguistic
      ? id + '-B' + String(number).padStart(3, '0') +
        'లో స్థిర ఆంగ్ల మూలం, తెలుగు లక్ష్యాన్ని ఎదురెదురుగా చదివి, సూచించిన స్థానిక చిత్రాల సాధారణ పదజాలాన్ని పోల్చాం; ప్రత్యేక మోడల్ అర్థాన్ని OLP-0415 మూల నిర్వచనం, నిరూపణ నియంత్రిస్తాయి.'
      : 'not_applicable_nonlinguistic',
    evidence_limit: linguistic
      ? 'స్థానిక చిత్రాల్లో సమితి, సంబంధం, ప్రతిజ్ఞావాక్య తర్కం, సత్యతావిలువ, ఫలితం లేదా నియమం సాధారణ రిజిస్టర్ మాత్రమే. నమూనాల వర్గంలో చెల్లుబాటు, స్వావర్తన ప్రాప్యత, అవశ్యకీకరణ ప్రత్యేక నిర్ధారణలు స్థిర మూల ఆధారితాలు; చిత్రాలు గణిత ప్రమాణం కావు.'
      : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక లేదా సాధన గద్యం ఇందులో దాచలేదు.'
  };
});
if (rows.filter(row => row.classification === 'translated_linguistic_segment').length !== 8)
  throw new Error('Unexpected linguistic block count');
writeJsonl(segmentPath, [...current, ...rows]);
console.log(JSON.stringify({ terms: terms.length, segments: rows.length, linguistic: 8,
  structural: 5, target_sha256: sha(target) }));
