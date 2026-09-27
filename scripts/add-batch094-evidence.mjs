import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const sourcePath='content/normal-modal-logic/completeness/modalities-ccs.tex';
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0445');
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-094-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==445||unit.source_path!==sourcePath||
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
if(sb.length!==31||tb.length!==31)throw new Error('Block count mismatch');
const passageMap={
  5:['TE-P018','TE-P024'],6:['TE-P018','TE-P024','TE-P026'],
  7:['TE-P018','TE-P024','TE-P026'],8:['TE-P018','TE-P024','TE-P026'],
  9:['TE-P018','TE-P024'],10:['TE-P018','TE-P024'],11:['TE-P018'],
  12:['TE-P024'],13:['TE-P018','TE-P024'],14:['TE-P024'],
  15:['TE-P018','TE-P024'],17:['TE-P024','TE-P026'],
  18:['TE-P024','TE-P026'],19:['TE-P024','TE-P026'],
  20:['TE-P024','TE-P026'],21:['TE-P024','TE-P026'],
  22:['TE-P024','TE-P026'],23:['TE-P024','TE-P026'],
  24:['TE-P024','TE-P026'],25:['TE-P024','TE-P026'],
  27:['TE-P024','TE-P026'],28:['TE-P018','TE-P024','TE-P026'],
  30:['TE-P024','TE-P026']
};
const correctionMap={13:['OLTENMLCOMMOD-001'],15:['OLTENMLCOMMOD-002']};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6743||![0,31].includes(current.length-previous.length))
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
    canon_passages:canonPassages,source_corrections:correctionMap[number]??[],
    consultation_phase:linguistic?
      `OLP-0445-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక ప్రతిజ్ఞావాక్య/వ్యుత్పత్తి/అవైరుధ్య పేజీలను ఎదురెదురు చూశాం; కానానికల్ ప్రాప్యత, Box/Diamond శాఖల గణితం స్థిర మూలం నుంచే.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'TE-P018/024 సాధారణ ప్రతిజ్ఞావాక్య తర్కం, నియమ-వ్యుత్పత్తి; TE-P026 సాధారణ సమితి సుసంగతత్వం/అసంగత మాత్రమే ప్రత్యక్షంగా చూపుతాయి. కానానికల్ మోడల్ ప్రాప్యత, Box/Diamond guarded నిరూపణలు వాటిలో స్థాపించబడలేదు.':
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==23||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==8)
  throw new Error('Unexpected classification totals');
const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===135&&terms.at(-1).term_id==='TE-T135';
if(!existingTerm&&(terms.length!==134||terms.at(-1).term_id!=='TE-T134'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T135',
  source_term:'modalities with complete consistent sets / canonical accessibility / Box and Diamond images and inverse images / RK lifting / guarded primitive-modal proofs',
  telugu:'సంపూర్ణ అవిరుద్ధ సమితుల మోడల్ సంయోజకాలు / కానానికల్ ప్రాప్యత / Box, Diamond ప్రతిబింబాలు, పూర్వప్రతిబింబాలు / RK ద్వారా ఉద్ధరణ / షరతుపర మోడల్ నిరూపణలు',
  status:'native_general_propositional_derivation_and_consistency_register_attested_canonical_modal_relation_source_controlled_provisional',
  passages:['TE-P018','TE-P024','TE-P026'],
  basis:'TE-P018లో సాధారణ ప్రతిజ్ఞావాక్య తర్కం, TE-P024లో నియమ-వ్యుత్పత్తి, TE-P026లో సమితి సుసంగతత్వం/అసంగత ప్రత్యక్షంగా చూశాం. TE-T131–134లో అవైరుధ్యం, కానానికల్ నమూనా, సంపూర్ణ విస్తరణ పదజాలాన్ని కొనసాగించాం. ప్రాప్యత సంబంధం, RK ఉద్ధరణ, Box/Diamond శాఖలు OLP-0445 స్థిర మూల నిర్మాణం నుంచే నిర్ణీతం.',
  uncertainty:'స్థానిక పేజీలు ఈ మోడల్-ప్రత్యేక కానానికల్ ప్రాప్యత, Box/Diamond పూర్వప్రతిబింబ ఉపసిద్ధాంతాలు లేదా guarded శాఖలను ప్రత్యక్షంగా ఇవ్వవు. స్థిర మూలంలోని రెండు సూచిక/పరామితి లోపాలను OLTENMLCOMMOD-001/002లో ప్రకటించి సరిచేశాం.',
  borrowing:'Sigma, Gamma, Delta, Box, Diamond, RK, Dual, R, V, modal-system labels and TeX tag keys రక్షిత సంకేతాలు.'
});
const correctionFile='evidence/SOURCE_CORRECTIONS.jsonl',corrections=jsonl(correctionFile);
const changed=corrections.map(row=>row.unit_id===unit.unit_id?{...row,status:'applied_qa_pass'}:row);
if(changed.length!==411||changed.filter(row=>row.unit_id===unit.unit_id).length!==2)
  throw new Error('Correction count mismatch');
writeJsonl(correctionFile,changed);
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:31,
  linguistic:23,structural:8,terms:terms.length,corrections:changed.length}));
