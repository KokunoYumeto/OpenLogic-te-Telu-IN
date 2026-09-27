import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),rows.map(JSON.stringify).join('\n')+'\n','utf8');
const sourcePath='content/normal-modal-logic/completeness/canonical-models.tex';
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(x=>x.unit_id==='OLP-0446');
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-095-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==446||unit.source_path!==sourcePath||
   Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
   qa.length!==1||qa[0].unit_id!==unit.unit_id||qa[0].translation_sha256!==sha(target)||
   !qa[0].paragraph_alignment||!qa[0].structure_match||!qa[0].token_parity||
   !qa[0].protected_identifier_parity||!qa[0].math_multiset_match||
   qa[0].unicode_replacement_char||qa[0].unpaired_surrogate)
  throw new Error('Frozen source or bounded QA mismatch');
function blocksWithSpans(raw){
  const normalized=raw.replace(/\r\n/gu,'\n'),blocks=normalized.trim().split(/\n\s*\n/u);
  let cursor=0;
  return blocks.map(block=>{const start=normalized.indexOf(block,cursor);
    if(start<0)throw new Error('Could not locate aligned block');
    const startLine=normalized.slice(0,start).split('\n').length;
    cursor=start+block.length;
    return {block,startLine,endLine:startLine+block.split('\n').length-1};});
}
const sb=blocksWithSpans(source),tb=blocksWithSpans(target);
if(sb.length!==8||tb.length!==8)throw new Error('Block count mismatch');
const passageMap={5:['TE-P018','TE-P024'],6:['TE-P018','TE-P024','TE-P026'],
  7:['TE-P018','TE-P024','TE-P026']};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(x=>[x.passage_id,x]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(x=>x.unit_id!==unit.unit_id);
if(previous.length!==6774||![0,8].includes(current.length-previous.length))
  throw new Error('Unexpected segment cursor');
const rows=sb.map((block,index)=>{const number=index+1,t=tb[index],linguistic=Object.hasOwn(passageMap,number);
  if(linguistic!==/[\u0C00-\u0C7F]/u.test(t.block))throw new Error('Misclassified block '+number);
  const canonPassages=(passageMap[number]??[]).map(id=>{const p=canon.get(id);
    if(!p)throw new Error('Missing consulted passage '+id);
    return {passage_id:id,source_sha256:p.source_sha256,...(p.pdf_page?{pdf_page:p.pdf_page}:{}),role:p.role};});
  return {segment_id:unit.unit_id+'-B'+String(number).padStart(3,'0'),unit_id:unit.unit_id,
    source_path:unit.source_path,source_unit_sha256:sha(source),translation_unit_sha256:sha(target),
    source_start_line:block.startLine,source_end_line:block.endLine,
    target_start_line:t.startLine,target_end_line:t.endLine,
    source_segment_sha256:sha(block.block),translation_segment_sha256:sha(t.block),
    classification:linguistic?'translated_linguistic_segment':'preserved_metadata_or_structural_segment',
    canon_passages:canonPassages,source_corrections:[],
    consultation_phase:linguistic?`OLP-0446-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక ప్రతిజ్ఞావాక్య/వ్యుత్పత్తి/అవైరుధ్య పేజీలను ఎదురెదురు చూశాం; కానానికల్ నమూనా నిర్వచనం మూలం నుంచే.`:'not_applicable_nonlinguistic',
    evidence_limit:linguistic?'TE-P018/024/026 సాధారణ తర్కం, వ్యుత్పత్తి, సుసంగతత్వం మాత్రమే చూపుతాయి; ఈ మోడల్ కానానికల్ నమూనా నిర్వచనాన్ని ప్రత్యక్షంగా స్థాపించవు.':'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'};});
if(rows.filter(x=>x.classification==='translated_linguistic_segment').length!==3||
   rows.filter(x=>x.classification==='preserved_metadata_or_structural_segment').length!==5)
  throw new Error('Unexpected classification totals');
const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existing=terms.length===136&&terms.at(-1).term_id==='TE-T136';
if(!existing&&(terms.length!==135||terms.at(-1).term_id!=='TE-T135'))
  throw new Error('Unexpected terminology cursor');
if(!existing)terms.push({term_id:'TE-T136',
  source_term:'canonical model / complete consistent worlds / canonical accessibility and atomic valuation',
  telugu:'కానానికల్ నమూనా / సంపూర్ణ అవిరుద్ధ సమితుల లోకాలు / కానానికల్ ప్రాప్యత, పరమాణు విలువ నిర్ణయం',
  status:'native_general_logic_consistency_register_attested_modal_canonical_model_source_controlled_provisional',
  passages:['TE-P018','TE-P024','TE-P026'],
  basis:'TE-P018/024/026లో సాధారణ ప్రతిజ్ఞావాక్య తర్కం, వ్యుత్పత్తి, సమితి సుసంగతత్వం/అసంగత చూశాం. TE-T132–135లో కానానికల్, సంపూర్ణ Sigma-అవిరుద్ధ, Box/Diamond ప్రాప్యత రూపాలను కొనసాగించాం. నిర్దిష్ట W/R/V త్రయం OLP-0446 స్థిర మూలం నుంచే.',
  uncertainty:'స్థానిక పేజీలు ఈ మోడల్-ప్రత్యేక కానానికల్ నమూనా లేదా W/R/V నిర్వచనాన్ని ప్రత్యక్షంగా ఇవ్వవు; సత్య-మూలకత్వ తుల్యత ఇక్కడ ఇంకా నిరూపించబడలేదు.',
  borrowing:'Sigma, Delta, W, R, V, Box, Diamond, model tuple and primitive-modality tag keys రక్షిత సంకేతాలు.'});
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:8,
  linguistic:3,structural:5,terms:terms.length,corrections:jsonl('evidence/SOURCE_CORRECTIONS.jsonl').length}));
