import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),rows.map(JSON.stringify).join('\n')+'\n','utf8');
const sourcePath='content/normal-modal-logic/axioms-systems/soundness.tex';
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0436');
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-086-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==436||unit.source_path!==sourcePath||
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
if(sb.length!==9||tb.length!==9)throw new Error('Block count mismatch');
const passageMap={5:['TE-P018'],6:['TE-P018','TE-P024'],
  7:['TE-P018','TE-P032'],8:['TE-P018','TE-P024','TE-P032']};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6631||![0,9].includes(current.length-previous.length))
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
    canon_passages:canonPassages,
    source_corrections:number===8?['OLTENMLAXSSND-001','OLTENMLAXSSND-002']:[],
    consultation_phase:linguistic?
      `OLP-0436-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక తర్క/వ్యుత్పత్తి/ఆగమన పేజీలను ఎదురెదురు చూశాం; మోడల్ నిర్దుష్టత, వర్గ-సాపేక్ష అవశ్యకీకరణ మూల నిర్వచనాల నుంచి.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'TE-P018/024/032 సాధారణ ప్రతిజ్ఞావాక్య తర్కం, నియమ-ఆధారిత వ్యుత్పత్తి, ఆగమన పదజాలం మాత్రమే చూపుతాయి. మోడల్ నిర్దుష్టతా సిద్ధాంతం, ప్రత్యేక వర్గ-సాపేక్ష Nec నిరూపణ వాటిలో ప్రత్యక్షం కాదు.':
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==4||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==5)
  throw new Error('Unexpected classification totals');
const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===127&&terms.at(-1).term_id==='TE-T127';
if(!existingTerm&&(terms.length!==126||terms.at(-1).term_id!=='TE-T126'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T127',
  source_term:'soundness of a modal derivation system / soundness theorem / induction on proof length / class-relative validity under necessitation',
  telugu:'మోడల్ వ్యుత్పత్తి వ్యవస్థ నిర్దుష్టత / నిర్దుష్టతా సిద్ధాంతం / నిరూపణ పొడవుపై ఆగమనం / అవశ్యకీకరణలో వర్గ-సాపేక్ష చెల్లుబాటు',
  status:'native_general_logic_derivation_and_induction_register_attested_modal_soundness_source_controlled_provisional',
  passages:['TE-P018','TE-P024','TE-P032'],
  basis:'TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, TE-P024లో నియమ-ఆధారిత వ్యుత్పత్తి, TE-P032లో నిగమనం/ఆగమనం అనే సాధారణ వాడుక ప్రత్యక్షంగా చూశాం. TE-T034, TE-T119--TE-T126 నిర్ణయాలను కొనసాగించాం. మోడల్ నిర్దుష్టత, నమూనాల వర్గాలు, MP/Nec శాఖల గణితం OLP-0436 స్థిర మూలం మరియు దాని సూచిత నిర్వచనాల నియంత్రణలో ఉన్నాయి.',
  uncertainty:'స్థానిక పేజీలు నిర్దిష్ట మోడల్ నిర్దుష్టతా సిద్ధాంతానికి ప్రత్యక్ష సాక్ష్యం కావు. మూల ఆగమన దశలో K/ఐచ్ఛిక Dual సందర్భాలు తప్పాయి; Nec ఉదాహరణ ప్రపంచ చెల్లుబాటుగా మాత్రమే ప్రకటించబడింది. రెండు స్థానిక స్పష్టీకరణలు ప్రకటిత సవరణలుగా వేరు నమోదు చేశాం.',
  borrowing:'K, Dual, MP, Nec, A_i, B, C మరియు వర్గ సంకేతాలు రక్షిత గణిత గుర్తులు; మోడల్ అనేది స్థిర పూర్వ సాంకేతిక పదరూపం.'
});
const correctionFile='evidence/SOURCE_CORRECTIONS.jsonl',corrections=jsonl(correctionFile);
const changed=corrections.map(row=>row.unit_id===unit.unit_id?{...row,status:'applied_qa_pass'}:row);
if(changed.length!==400||changed.filter(row=>row.unit_id===unit.unit_id).length!==2)
  throw new Error('Correction count mismatch');
writeJsonl(correctionFile,changed);
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:9,
  linguistic:4,structural:5,terms:terms.length,corrections:changed.length}));
