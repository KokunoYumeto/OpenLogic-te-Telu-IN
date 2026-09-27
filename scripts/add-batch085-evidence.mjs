import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),rows.map(JSON.stringify).join('\n')+'\n','utf8');
const sourcePath='content/normal-modal-logic/axioms-systems/proofs-modal-systems.tex';
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0435');
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-085-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==435||unit.source_path!==sourcePath||
   Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
   qa.length!==1||qa[0].unit_id!==unit.unit_id||qa[0].translation_sha256!==sha(target)||
   !qa[0].paragraph_alignment||!qa[0].structure_match||!qa[0].token_parity||
   !qa[0].protected_identifier_parity||!qa[0].math_multiset_match||
   qa[0].unicode_replacement_char||qa[0].unpaired_surrogate)
  throw new Error('Frozen source or bounded QA mismatch');

function blocksWithSpans(raw){
  const normalized=raw.replace(/\r\n/gu,'\n');
  const blocks=normalized.trim().split(/\n\s*\n/u);
  let cursor=0;
  return blocks.map(block=>{
    const start=normalized.indexOf(block,cursor);
    if(start<0)throw new Error('Could not locate aligned block');
    const startLine=normalized.slice(0,start).split('\n').length;
    cursor=start+block.length;
    return {block,startLine,endLine:startLine+block.split('\n').length-1};
  });
}
const sb=blocksWithSpans(source),tb=blocksWithSpans(target);
if(sb.length!==14||tb.length!==14)throw new Error('Block count mismatch');
const passageMap={5:['TE-P018'],6:['TE-P018'],7:['TE-P018','TE-P024'],
  8:['TE-P018','TE-P024'],9:['TE-P018'],10:['TE-P010','TE-P018'],
  12:['TE-P024'],13:['TE-P024']};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6617||![0,14].includes(current.length-previous.length))
  throw new Error('Unexpected segment cursor');
const rows=sb.map((block,index)=>{
  const number=index+1,t=tb[index],linguistic=Object.hasOwn(passageMap,number);
  if(linguistic!==/[\u0C00-\u0C7F]/u.test(t.block))
    throw new Error('Misclassified language block '+number);
  const canonPassages=(passageMap[number]??[]).map(id=>{
    const passage=canon.get(id);
    if(!passage)throw new Error('Missing consulted passage '+id);
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
      `OLP-0435-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక తర్కం/సంబంధం/వ్యుత్పత్తి పేజీలను ఎదురెదురు చూశాం; మోడల్ స్వీకృతాల కలయికలు, ఆరు నిరూపణలు, S4/S5 నిర్వచనాలు మూల గణితం నుంచే.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'TE-P010 సంబంధాల సాధారణ శైలిని; TE-P018 ప్రతిజ్ఞావాక్య తర్కాన్ని; TE-P024 నియమ-ఆధారిత వ్యుత్పత్తిని మాత్రమే ప్రత్యక్షంగా చూపుతాయి. ప్రత్యేక మోడల్ వ్యవస్థలు, వాటి సమానత్వాలు స్థానిక పేజీల్లో నిర్ధారించబడలేదు.':
      'వాక్యేతర TeX వ్యాఖ్య, గణిత రూపం లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==8||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==6)
  throw new Error('Unexpected classification totals');

const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===126&&terms.at(-1).term_id==='TE-T126';
if(!existingTerm&&(terms.length!==125||terms.at(-1).term_id!=='TE-T125'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T126',
  source_term:'proofs in modal systems / provability results / equivalent axiomatizations / S4 and S5 systems / equivalence relations',
  telugu:'మోడల్ వ్యవస్థల్లో నిరూపణలు / నిరూపణీయత ఫలితాలు / తుల్య స్వీకృతీకరణలు / S4, S5 వ్యవస్థలు / తుల్యతా సంబంధాలు',
  status:'native_general_logic_relation_and_derivation_register_attested_modal_system_equivalences_source_controlled_provisional',
  passages:['TE-P010','TE-P018','TE-P024'],
  basis:'TE-P010లో సంబంధాల సాధారణ పదజాలం, TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, TE-P024లో నియమ-ఆధారిత వ్యుత్పత్తి ప్రత్యక్షంగా చూశాం. TE-T017, TE-T047, TE-T119--TE-T125 నిర్ణయాలతో సరిపోల్చాం. ఆరు మోడల్ నిరూపణలు, S4/S5 నిర్వచనాలు, వ్యవస్థల సమానత్వ వాక్యం OLP-0435 స్థిర మూలం నుంచి మాత్రమే వస్తాయి.',
  uncertainty:'స్థానిక పేజీలు ఈ ప్రత్యేక మోడల్ స్వీకృత వ్యవస్థలకో, తుల్య స్వీకృతీకరణలకో ప్రత్యక్ష ఆధారం కావు. తుల్యతా సంబంధం అనే రూపం పూర్వ నిర్ణయానికి అనుగుణం; చివరి సమానత్వ నిరూపణ మూలంలో వ్యాయామంగానే మిగిలింది.',
  borrowing:'K, T, B, D, 4, 5, S4, S5, p, Box, Diamond మరియు నియమ సంక్షిప్తాలు రక్షిత గణిత సంకేతాలు.'
});
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:14,
  linguistic:8,structural:6,terms:terms.length}));
