import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const unit = manifest.find(row => row.unit_id === 'OLP-0422');
if (!unit || unit.order !== 422 || unit.source_path !==
    'content/normal-modal-logic/frame-definability/frames.tex')
  throw new Error('Unexpected manifest cursor');
const source = read('upstream/' + unit.source_path);
const target = read('translation/' + unit.source_path);
const qa = JSON.parse(read('build/BATCH-073-STRUCTURAL-QA.json')).units;
if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256 ||
    qa.length !== 1 || qa[0].unit_id !== unit.unit_id ||
    qa[0].translation_sha256 !== sha(target) || !qa[0].paragraph_alignment ||
    !qa[0].structure_match || !qa[0].token_parity ||
    !qa[0].protected_identifier_parity || !qa[0].math_multiset_match ||
    qa[0].unicode_replacement_char || qa[0].unpaired_surrogate ||
    jsonl('evidence/SOURCE_CORRECTIONS.jsonl').some(row => row.unit_id === unit.unit_id))
  throw new Error('Frozen source, bounded QA or correction mismatch');

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
const sb = blocksWithSpans(source), tb = blocksWithSpans(target);
if (sb.length !== 12 || tb.length !== 12) throw new Error('Block count mismatch');
const passageMap = {
  5: ['TE-P010'], 6: ['TE-P008', 'TE-P010'],
  7: ['TE-P019', 'TE-P023'], 8: ['TE-P008', 'TE-P019', 'TE-P023'],
  9: ['TE-P010', 'TE-P019', 'TE-P023'],
  10: ['TE-P008', 'TE-P019', 'TE-P023'], 11: ['TE-P019', 'TE-P023']
};
const canon = new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row => [row.passage_id,row]));
const segmentPath = 'evidence/SEGMENT_CANON_USE.jsonl';
const current = jsonl(segmentPath);
const previous = current.filter(row => row.unit_id !== unit.unit_id);
if (previous.length !== 6415 || ![0,12].includes(current.length - previous.length))
  throw new Error('Unexpected segment cursor');
const rows = sb.map((block,index) => {
  const number = index+1, t=tb[index], linguistic=Object.hasOwn(passageMap,number);
  if (linguistic !== /[\u0C00-\u0C7F]/u.test(t.block))
    throw new Error('Misclassified language block '+number);
  const canonPassages=(passageMap[number]??[]).map(id=>{
    const passage=canon.get(id);
    if(!passage) throw new Error('Missing consulted passage '+id);
    return {passage_id:id,source_sha256:passage.source_sha256,
      ...(passage.pdf_page?{pdf_page:passage.pdf_page}:{}),role:passage.role};
  });
  return {
    segment_id:unit.unit_id+'-B'+String(number).padStart(3,'0'),
    unit_id:unit.unit_id,source_path:unit.source_path,
    source_unit_sha256:sha(source),translation_unit_sha256:sha(target),
    source_start_line:block.startLine,source_end_line:block.endLine,
    target_start_line:t.startLine,target_end_line:t.endLine,
    source_segment_sha256:sha(block.block),translation_segment_sha256:sha(t.block),
    classification:linguistic?'translated_linguistic_segment':'preserved_metadata_or_structural_segment',
    canon_passages:canonPassages,source_corrections:[],
    consultation_phase:linguistic?
      `OLP-0422-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక చిత్రాలను పోల్చాం; చట్ర చెల్లుబాటు మూల నిర్వచనాధీనం.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'స్థానిక పేజీలు సాధారణ సమితి, సంబంధం, సత్యం, ఫలిత పదజాలానికే సాక్ష్యం; క్రిప్కె చట్రం లేదా సర్వనమూనా చెల్లుబాటుకు ప్రత్యక్ష ప్రమాణం కావు.':
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక లేదా గద్యం ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==7 ||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==5)
  throw new Error('Unexpected segment classification totals');
fs.writeFileSync(path.join(root,segmentPath),[...previous,...rows].map(JSON.stringify).join('\n')+'\n','utf8');
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:rows.length,
  linguistic:7,structural:5}));
