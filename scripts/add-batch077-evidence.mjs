import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0426');
if(!unit||unit.order!==426||unit.source_path!==
   'content/normal-modal-logic/frame-definability/second-order-definability.tex')
  throw new Error('Unexpected manifest cursor');
const source=read('upstream/'+unit.source_path),target=read('translation/'+unit.source_path);
const qa=JSON.parse(read('build/BATCH-077-STRUCTURAL-QA.json')).units;
if(Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
   qa.length!==1||qa[0].unit_id!==unit.unit_id||qa[0].translation_sha256!==sha(target)||
   !qa[0].paragraph_alignment||!qa[0].structure_match||!qa[0].token_parity||
   !qa[0].protected_identifier_parity||!qa[0].math_multiset_match||
   qa[0].unicode_replacement_char||qa[0].unpaired_surrogate)
  throw new Error('Frozen source or bounded QA mismatch');
const auditDir='evidence/source-audits/2026-09-27-modal-standard-translation-telugu';
const audit=JSON.parse(read(auditDir+'/FINDINGS.json'));
const corrections=jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const correction=corrections.find(row=>row.finding_id==='OLTENMLFRDST-001');
if(audit.audit_id!=='OLTENMLFRDST-20260927'||audit.findings.length!==1||
   corrections.length!==393||!correction||correction.unit_id!==unit.unit_id||
   correction.audit_id!==audit.audit_id||
   correction.audit_findings_sha256!==sha(read(auditDir+'/FINDINGS.json'))||
   correction.audit_review_sha256!==sha(read(auditDir+'/REVIEW.md'))||
   correction.status!=='applied_qa_pass')
  throw new Error('Source audit mismatch');

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
if(sb.length!==19||tb.length!==19)throw new Error('Block count mismatch');
const passageMap={
  5:['TE-P027','TE-P029'],
  6:['TE-P008','TE-P010','TE-P027','TE-P028','TE-P029'],
  7:['TE-P027','TE-P028','TE-P029','TE-P032'],
  8:['TE-P008','TE-P010','TE-P019','TE-P027','TE-P028','TE-P030'],
  9:['TE-P027','TE-P028','TE-P029','TE-P030'],
  10:['TE-P032'],
  11:['TE-P008','TE-P010','TE-P027','TE-P028','TE-P029','TE-P031'],
  12:['TE-P019','TE-P024','TE-P027','TE-P028'],
  13:['TE-P008','TE-P010','TE-P027','TE-P028','TE-P029','TE-P031'],
  14:['TE-P027','TE-P028','TE-P031'],
  15:['TE-P032'],
  16:['TE-P008','TE-P010','TE-P019','TE-P027','TE-P028','TE-P029'],
  17:['TE-P008','TE-P010','TE-P019','TE-P027','TE-P028','TE-P029'],
  18:['TE-P027','TE-P029','TE-P031']
};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const segmentPath='evidence/SEGMENT_CANON_USE.jsonl';
const current=jsonl(segmentPath),previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6477||![0,19].includes(current.length-previous.length))
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
    source_corrections:number===7?['OLTENMLFRDST-001']:[],
    consultation_phase:linguistic?
      `OLP-0426-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక చిత్రాలను పోల్చాం; ప్రామాణిక అనువాదం మరియు చట్ర నిర్వచనీయత మూల నిర్మాణం, పూర్వ తర్క ఎంపికలకు కట్టుబడి ఉన్నాయి.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'స్థానిక పేజీలు సమితి, సంబంధం, విధేయం, మొదటిస్థాయి, వాక్యం, సత్యం, నిరూపణ సాధారణ పదజాలానికే ఆధారం; మోడల్ ప్రామాణిక అనువాదం, ఏకస్థానిక ద్వితీయ-స్థాయి నిర్వచనీయత లేదా నిర్ణయనీయత-లేమి ప్రత్యేక ఫలితాలను నేరుగా నిర్ధారించవు.':
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==14||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==5)
  throw new Error('Unexpected classification totals');

const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===118&&terms.at(-1).term_id==='TE-T118';
if(!existingTerm&&(terms.length!==117||terms.at(-1).term_id!=='TE-T117'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T118',
  source_term:'standard translation of modal formulas / monadic second-order frame definability / unary-predicate quantification / modal-model to first-order-structure correspondence',
  telugu:'మోడల్ సూత్రాల ప్రామాణిక అనువాదం / ఏకస్థానిక ద్వితీయ-స్థాయి చట్ర నిర్వచనీయత / ఏకస్థానిక విధేయాలపై పరిమాణీకరణ / మోడల్ నమూనా–మొదటిస్థాయి నిర్మాణం అనురూపత',
  status:'native_set_relation_predicate_first_order_sentence_truth_and_proof_register_attested_standard_translation_and_monadic_frame_correspondence_source_controlled_provisional',
  passages:['TE-P008','TE-P010','TE-P019','TE-P024','TE-P027','TE-P028','TE-P029','TE-P030','TE-P031','TE-P032'],
  basis:'TE-P008లో సమితి, ఉపసమితి; TE-P010లో ద్విస్థాన సంబంధం; TE-P019లో సత్యతావిలువ; TE-P024/032లో నిరూపణ, ఆగమన రిజిస్టర్; TE-P027/028లో విధేయాలు, ద్విస్థాన సంబంధం, పరిమాణీకరణలు; TE-P029లో మొదటిస్థాయి, చర పరిధి; TE-P030లో వ్యక్తి క్షేత్రం; TE-P031లో వాక్యం అనే వాడుకలను స్థానిక చిత్రాల్లో చూశాం. అవి మోడల్ ప్రామాణిక అనువాదం లేదా ఏకస్థానిక ద్వితీయ-స్థాయి చట్ర ఫలితానికి ప్రత్యక్ష పేరు, సిద్ధాంతం ఇవ్వవు. పూర్వ TE-T051/075/113/116 మరియు OLP-0426లోని ST_x ఆగమన శాఖలు, నమూనా–నిర్మాణం iff, అన్ని ఉపసమితులపై పరిమాణీకరణ, స్వావర్తన ఉదాహరణ ప్రత్యేక అర్థాలను నియంత్రిస్తాయి.',
  uncertainty:'సమితి, సంబంధం, విధేయం, మొదటిస్థాయి, వాక్యం అనే భాగాలకు స్థానిక ఆధారం ఉంది. ప్రామాణిక అనువాదం, ఏకస్థానిక ద్వితీయ-స్థాయి చట్ర నిర్వచనీయత ప్రత్యేక తెలుగు పేర్లు తాత్కాలికం; గణిత అర్థం మూల ST శాఖలు, రెండు iff నిరూపణలకే పరిమితం.',
  borrowing:'ST, Q, P_i, X_i, R, W, V మరియు వాక్య మెటాచరాలు రక్షిత గణిత సంకేతాలు; తెలుగులో ప్రకటించని ఆంగ్ల సాంకేతిక పదం పాఠక గద్యంలో లేదు.'
});
writeJsonl(termsPath,terms);
writeJsonl(segmentPath,[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:19,
  linguistic:14,structural:5,terms:terms.length,corrections:corrections.length}));
