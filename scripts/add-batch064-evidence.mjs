import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = file => read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl = (file, rows) =>
  fs.writeFileSync(path.join(root, file), rows.map(JSON.stringify).join('\n') + '\n', 'utf8');
const ids = Array.from({ length: 5 }, (_, i) => 'OLP-' + String(402 + i).padStart(4, '0'));
const manifest = jsonl('evidence/SOURCE_MANIFEST.jsonl');
const units = new Map();
for (const [index, id] of ids.entries()) {
  const unit = manifest.find(row => row.unit_id === id);
  if (!unit || unit.order !== 402 + index) throw new Error('Unexpected manifest cursor ' + id);
  const source = read('upstream/' + unit.source_path);
  const target = read('translation/' + unit.source_path);
  if (Buffer.byteLength(source) !== unit.source_bytes || sha(source) !== unit.source_sha256)
    throw new Error('Frozen source mismatch ' + id);
  units.set(id, { unit, source, target });
}
const qa = JSON.parse(read('build/BATCH-064-STRUCTURAL-QA.json'));
if (qa.units.length !== 5 || qa.units.some(row =>
  !row.paragraph_alignment || !row.structure_match || !row.token_parity ||
  !row.protected_identifier_parity || !row.math_multiset_match))
  throw new Error('Batch structural QA has not passed');
const corrections = jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
if (corrections.length !== 377) throw new Error('Unexpected correction cursor');
const auditDir = 'evidence/source-audits/2026-09-26-many-valued-sequent-telugu';
const audit = JSON.parse(read(auditDir + '/FINDINGS.json'));
if (audit.findings.length !== 3) throw new Error('Unexpected audit count');
for (const id of Array.from({ length: 3 }, (_, i) => 'OLTEMVLSEQ-00' + (i + 1))) {
  const row = corrections.find(item => item.finding_id === id);
  if (!row || row.audit_id !== audit.audit_id ||
      row.audit_findings_sha256 !== sha(read(auditDir + '/FINDINGS.json')) ||
      row.audit_review_sha256 !== sha(read(auditDir + '/REVIEW.md')) ||
      row.status !== 'applied_qa_pass')
    throw new Error('Source audit mismatch ' + id);
}
const termsPath = 'evidence/TERM_DECISIONS.jsonl';
const terms = jsonl(termsPath);
if (terms.length !== 105 || terms.at(-1).term_id !== 'TE-T105')
  throw new Error('Unexpected terminology cursor');
terms.push({
  term_id: 'TE-T106',
  source_term: 'n-sided sequent calculus / initial sequent / designated-value position / derivation and theorem / structural weakening, contraction, exchange and cut / three-valued logical rules',
  telugu: 'n-వైపుల సీక్వెంట్ కలనం / ప్రారంభ సీక్వెంట్ / నిర్దేశిత సత్యమూల్యపు స్థానం / వ్యుత్పత్తి, సిద్ధాంతం / నిర్మాణాత్మక బలహీనీకరణ, సంకోచనం, మార్పిడి, కట్ / మూడు-విలువల తార్కిక నియమాలు',
  status: 'native_truth_value_propositional_inference_and_formal_derivation_register_attested_specialized_n_sided_sequent_schemata_source_controlled_provisional',
  passages: ['TE-P019', 'TE-P020', 'TE-P023', 'TE-P024', 'TE-P031', 'TE-P033'],
  basis: 'TE-P019–P020లో సత్యతావిలువ, సంయోజక/వియోజక పట్టికలు; TE-P023లో ఫలిత సంబంధం; TE-P024లో నియమ గుర్తులతో ఫలిత వ్యుత్పత్తి; TE-P031లో వాక్యం–ప్రతిజ్ఞావాక్య భేదం; TE-P033లో అనుమాన వివరణ పేజీ చిత్రాలను ప్రత్యక్షంగా చూశాం. ఇవి బహు-విలువల n-వైపుల సీక్వెంట్లను నేరుగా స్థాపించవు. TE-T020/034/035/036లోని పూర్వ అనువాద ప్రయోగాన్ని కొనసాగిస్తూ, OLP-0402–0406 స్థిర సీక్వెంట్ నిర్వచనాలు, మూడు-విలువల నియమ చిత్రాలే ప్రత్యేక అర్థాన్ని నియంత్రిస్తున్నాయి.',
  uncertainty: 'సీక్వెంట్ అరువు, n-వైపుల సంకేతం, నిర్దేశిత స్థానాలు, నిర్దిష్ట బహు-విలువల నియమాలకు స్థానిక పేజీలలో ప్రత్యక్ష సాక్ష్యం లేదు; ఎంపిక తాత్కాలికం. స్థానిక ద్విమూల్య ఫలిత వివరణను మూడు-విలువల నియమాలకు గణిత ప్రమాణంగా వాడలేదు. OLTEMVLSEQ-001–003 సవరణలు స్థిర మూలంలోని సమీప ప్రదర్శనలు, స్థానం-i నియమాలపై ఆధారపడతాయి.',
  borrowing: 'సీక్వెంట్, కట్, లూకాసియెవిచ్, క్లీని, గోడెల్ ముందరి గుర్తించదగిన బదిలీలు; LK, L, n, Gamma/Pi/Delta, False/Undef/True and rule macros protected mathematical notation.'
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
if (previous.length !== 6130 || previous.some(row => ids.includes(row.unit_id)))
  throw new Error('Unexpected prior segment cursor');
const canon = new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row => [row.passage_id, row]));
const passageMap = {
  'OLP-0402': { 4: ['TE-P024', 'TE-P033'] },
  'OLP-0403': {
    5: ['TE-P024'], 6: ['TE-P019', 'TE-P023', 'TE-P024'],
    7: ['TE-P023', 'TE-P031'], 8: ['TE-P033'],
    10: ['TE-P019', 'TE-P020', 'TE-P033'],
    12: ['TE-P019', 'TE-P023']
  },
  'OLP-0404': {
    5: ['TE-P024'], 6: ['TE-P024', 'TE-P031'],
    7: ['TE-P024', 'TE-P031'], 8: ['TE-P024', 'TE-P031'],
    9: ['TE-P019'], 10: ['TE-P019', 'TE-P024', 'TE-P033'],
    11: ['TE-P024', 'TE-P031'], 12: ['TE-P023', 'TE-P024', 'TE-P031'],
    13: ['TE-P019', 'TE-P024']
  },
  'OLP-0405': {
    5: ['TE-P024'], 6: ['TE-P024', 'TE-P033'],
    8: ['TE-P024', 'TE-P033'], 9: ['TE-P024', 'TE-P033']
  },
  'OLP-0406': {
    5: ['TE-P019', 'TE-P020', 'TE-P033'],
    6: ['TE-P019', 'TE-P020', 'TE-P033'],
    7: ['TE-P019'], 8: ['TE-P019', 'TE-P033'],
    10: ['TE-P019', 'TE-P033'], 12: ['TE-P019'],
    13: ['TE-P019'], 14: ['TE-P019', 'TE-P033'],
    16: ['TE-P020'], 17: ['TE-P020', 'TE-P033'],
    19: ['TE-P019', 'TE-P020'], 20: ['TE-P019', 'TE-P033'],
    22: ['TE-P019', 'TE-P033'], 24: ['TE-P019', 'TE-P033'],
    26: ['TE-P024']
  }
};
const expectedBlocks = {
  'OLP-0402': 10, 'OLP-0403': 13, 'OLP-0404': 14,
  'OLP-0405': 10, 'OLP-0406': 27
};
const correctionBlocks = {
  'OLP-0402': {}, 'OLP-0403': { 7: ['OLTEMVLSEQ-001', 'OLTEMVLSEQ-002'] },
  'OLP-0404': { 7: ['OLTEMVLSEQ-003'] },
  'OLP-0405': {}, 'OLP-0406': {}
};
const rows = [];
for (const id of ids) {
  const { unit, source, target } = units.get(id);
  const sourceBlocks = blocksWithSpans(source), targetBlocks = blocksWithSpans(target);
  if (sourceBlocks.length !== expectedBlocks[id] ||
      targetBlocks.length !== expectedBlocks[id])
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
          ' స్థిర మూలం, లక్ష్యాన్ని ఎదురెదురుగా చదివి, నమోదైన TE-P019/020/023/024/031/033 స్థానిక పేజీ చిత్రాలను చూశాం; TE-T020/034/035/036/106 ఎంపికలతో పోల్చాం.'
        : 'not_applicable_nonlinguistic',
      evidence_limit: linguistic
        ? 'స్థానిక పేజీలు సత్యతావిలువ, ప్రతిజ్ఞావాక్య సంయోజకాలు, ఫలితం, వ్యుత్పత్తి, వాక్యం, అనుమాన గద్యానికి ఆధారం. బహు-విలువల n-వైపుల సీక్వెంట్, నిర్దేశిత స్థానం, ప్రత్యేక నియమ చిత్రాలకు నేరుగా సాక్ష్యం కావు; స్థిర మూల నిర్వచనాలే ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి. OLTEMVLSEQ-001–003 సూచిక సవరణలు సమీప మూల ప్రదర్శనలపై ఆధారపడతాయి.'
        : 'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక, సంపాదక గద్యం ఇందులో దాచలేదు.'
    });
  });
}
const linguisticCount = rows.filter(row =>
  row.classification === 'translated_linguistic_segment').length;
if (rows.length !== 74 || linguisticCount !== 35)
  throw new Error('Unexpected Batch 064 segment classification');
writeJsonl(segmentPath, [...previous, ...rows]);
console.log(JSON.stringify({
  terms: terms.length, segments: rows.length,
  linguistic: linguisticCount, structural: rows.length - linguisticCount,
  corrections: 3
}));
