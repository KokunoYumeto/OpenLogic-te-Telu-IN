import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const sourcePath='content/normal-modal-logic/completeness/lindenbaums-lemma.tex';
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0444');
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-093-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==444||unit.source_path!==sourcePath||
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
if(sb.length!==16||tb.length!==16)throw new Error('Block count mismatch');
const passageMap={
  5:['TE-P018','TE-P024'],6:['TE-P018','TE-P024','TE-P026'],
  7:['TE-P026'],8:['TE-P018','TE-P024','TE-P026'],
  9:['TE-P026'],10:['TE-P018','TE-P026'],11:['TE-P026'],
  12:['TE-P018','TE-P024','TE-P026'],13:['TE-P024','TE-P026'],
  14:['TE-P024','TE-P026'],15:['TE-P018','TE-P024','TE-P026']
};
const correctionMap={8:['OLTENMLCOMLIN-001']};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6727||![0,16].includes(current.length-previous.length))
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
      `OLP-0444-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక ప్రతిజ్ఞావాక్య/వ్యుత్పత్తి/అవైరుధ్య పేజీలను ఎదురెదురు చూశాం; లిండెన్‌బామ్ విస్తరణ నిర్మాణం, Sigma-సాపేక్ష వాదన స్థిర మూలం నుంచే.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'TE-P018/024 సాధారణ ప్రతిజ్ఞావాక్య తర్కం, నియమ-వ్యుత్పత్తి; TE-P026 సాధారణ సమితి సుసంగతత్వం/అసంగత మాత్రమే ప్రత్యక్షంగా చూపుతాయి. మోడల్ లిండెన్‌బామ్ ఉపసిద్ధాంతం లేదా ఈ అనంత జాబితా నిర్మాణం వాటిలో స్థాపించబడలేదు.':
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==11||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==5)
  throw new Error('Unexpected classification totals');
const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===134&&terms.at(-1).term_id==='TE-T134';
if(!existingTerm&&(terms.length!==133||terms.at(-1).term_id!=='TE-T133'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T134',
  source_term:"Lindenbaum's Lemma / complete Sigma-consistent extension / exhaustive enumeration / canonical-model world / finite-witness consistency",
  telugu:'లిండెన్‌బామ్ ఉపసిద్ధాంతం / సంపూర్ణ Sigma-అవిరుద్ధ విస్తరణ / సమగ్ర జాబితా / కానానికల్ నమూనా లోకం / పరిమిత సాక్ష్య అవైరుధ్యం',
  status:'native_general_propositional_derivation_and_consistency_register_attested_modal_lindenbaum_construction_source_controlled_provisional',
  passages:['TE-P018','TE-P024','TE-P026'],
  basis:'TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, TE-P024లో నియమ-వ్యుత్పత్తి, TE-P026లో సాధారణ సమితి సుసంగతత్వం/అసంగత ప్రత్యక్షంగా చూశాం. TE-T034/073/131–133లో స్థిర అవైరుధ్యం, నిగమన సంవృతత, కానానికల్ పదజాలాన్ని కొనసాగించాం. లిండెన్‌బామ్ నిర్మాణం, Sigma-సాపేక్ష సంపూర్ణత, పరిమిత సాక్ష్య నిరూపణ OLP-0444 స్థిర మూలం నుంచే తీసుకున్నాం.',
  uncertainty:'స్థానిక పేజీలు ఈ మోడల్-ప్రత్యేక ఉపసిద్ధాంతం, సమగ్ర జాబితా షెడ్యూలును ప్రత్యక్షంగా ఇవ్వవు. స్థిర మూలం ఇచ్చిన సరిగ్గా n పొడవు దశలు సమగ్రం కావు; గరిష్ఠంగా n పొడవుగా చేసిన సవరణను OLTENMLCOMLIN-001లో ప్రకటించాం.',
  borrowing:'Lindenbaum eponym, Sigma, Gamma, Delta, p-indexed variables, formula and derivability macros రక్షిత గణిత సంకేతాలు.'
});
const correctionFile='evidence/SOURCE_CORRECTIONS.jsonl',corrections=jsonl(correctionFile);
const changed=corrections.map(row=>row.unit_id===unit.unit_id?{...row,status:'applied_qa_pass'}:row);
if(changed.length!==409||changed.filter(row=>row.unit_id===unit.unit_id).length!==1)
  throw new Error('Correction count mismatch');
writeJsonl(correctionFile,changed);
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:16,
  linguistic:11,structural:5,terms:terms.length,corrections:changed.length}));
