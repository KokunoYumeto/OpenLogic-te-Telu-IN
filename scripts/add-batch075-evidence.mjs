import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0424');
if(!unit||unit.order!==424||unit.source_path!==
   'content/normal-modal-logic/frame-definability/first-order-definability.tex')
  throw new Error('Unexpected manifest cursor');
const source=read('upstream/'+unit.source_path),target=read('translation/'+unit.source_path);
const qa=JSON.parse(read('build/BATCH-075-STRUCTURAL-QA.json')).units;
if(Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
   qa.length!==1||qa[0].unit_id!==unit.unit_id||qa[0].translation_sha256!==sha(target)||
   !qa[0].paragraph_alignment||!qa[0].structure_match||!qa[0].token_parity||
   !qa[0].protected_identifier_parity||!qa[0].math_multiset_match||
   qa[0].unicode_replacement_char||qa[0].unpaired_surrogate)
  throw new Error('Frozen source or bounded QA mismatch');
const auditDir='evidence/source-audits/2026-09-27-modal-first-order-definability-telugu';
const audit=JSON.parse(read(auditDir+'/FINDINGS.json'));
const corrections=jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const correction=corrections.find(row=>row.finding_id==='OLTENMLFRDFOL-001');
if(audit.audit_id!=='OLTENMLFRDFOL-20260927'||audit.findings.length!==1||
   corrections.length!==392||!correction||correction.unit_id!==unit.unit_id||
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
if(sb.length!==12||tb.length!==12)throw new Error('Block count mismatch');
const passageMap={
  5:['TE-P027','TE-P029'],
  6:['TE-P010','TE-P027','TE-P028','TE-P029','TE-P030'],
  7:['TE-P027','TE-P028','TE-P029','TE-P030','TE-P031'],
  8:['TE-P027','TE-P029'],
  9:['TE-P010','TE-P027','TE-P029'],
  10:['TE-P010','TE-P024','TE-P027','TE-P029','TE-P030','TE-P031'],
  11:['TE-P010','TE-P028','TE-P029']
};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const segmentPath='evidence/SEGMENT_CANON_USE.jsonl';
const current=jsonl(segmentPath),previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6447||![0,12].includes(current.length-previous.length))
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
    source_corrections:number===10?['OLTENMLFRDFOL-001']:[],
    consultation_phase:linguistic?
      `OLP-0424-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక చిత్రాలను పోల్చాం; ప్రత్యేక నిర్వచనీయత, సంహతత్వం మూల వాదానికి కట్టుబడి ఉన్నాయి.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'స్థానిక పేజీలు సంబంధం, విధేయం, మొదటిస్థాయి, వ్యక్తి క్షేత్రం, వాక్యం, నిరూపణ సాధారణ పదజాలానికే ఆధారం; లొబ్, సుస్థాపితత్వం, సంహతత్వం, చట్ర సార్వత్రికత ప్రత్యేక పేర్లకు ప్రత్యక్ష ప్రమాణం కావు.':
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక లేదా గద్యం ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==7||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==5)
  throw new Error('Unexpected classification totals');

const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===116&&terms.at(-1).term_id==='TE-T116';
if(!existingTerm&&(terms.length!==115||terms.at(-1).term_id!=='TE-T115'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T116',
  source_term:'first-order definable frame class / well-founded and converse well-founded / Löb W / Compactness Theorem / universal frames',
  telugu:'మొదటిస్థాయి నిర్వచనీయ చట్రాల వర్గం / సుస్థాపిత మరియు విలోమంగా సుస్థాపిత / లొబ్ సూత్రం W / సంహతత్వ సిద్ధాంతం / సార్వత్రిక చట్రాలు',
  status:'native_first_order_binary_relation_sentence_register_attested_specialized_modal_and_compactness_senses_source_controlled_provisional',
  passages:['TE-P010','TE-P024','TE-P027','TE-P028','TE-P029','TE-P030','TE-P031'],
  basis:'TE-P010లో సంబంధం, TE-P024లో నియమ నిరూపణ, TE-P027లో విధేయతర్కం, TE-P028లో ద్విస్థాన సంబంధం, TE-P029లో మొదటిస్థాయి, TE-P030లో వ్యక్తి క్షేత్రం, TE-P031లో వాక్యం అనే వాడుకలను స్థానిక చిత్రాల్లో చూశాం. ఈ చిత్రాలు లొబ్ పథకం, సుస్థాపితత్వం, సంహతత్వం లేదా చట్ర సార్వత్రికతకు ప్రత్యక్ష ప్రత్యేక సాక్ష్యం కావు. OLP-0424లోని అనంత శ్రేణుల నిర్వచనం, సంహతత్వ ప్రతివాదం, మొదటిస్థాయి వాక్యం–చట్ర సభ్యత్వం iff షరతు, పూర్వ OLP మొదటిస్థాయి సంహతత్వ అధ్యాయం, TE-T041/044/113/115 నిర్ణయాలు ఆ అర్థాలను నియంత్రిస్తాయి.',
  uncertainty:'మొదటిస్థాయి, సంబంధం, వాక్యం సాధారణ వాడుకకు ప్రత్యక్ష ఆధారం ఉంది; సుస్థాపితత్వం, విలోమ సుస్థాపితత్వం, లొబ్ మరియు సార్వత్రిక చట్రాల ప్రత్యేక తెలుగు పేర్లకు నామకరణ అనిశ్చితి ఎక్కువ. గణిత అర్థం పక్కనున్న నిర్వచనాలు, స్థిర మూల వాదానికి పరిమితం.',
  borrowing:'లొబ్ మూల నామధేయం; W, Q, R, Nat, Int, Γ మరియు చర సూచికలు రక్షిత గణిత సంకేతాలు. సంహతత్వం పూర్వ అనువాదంలో తీసుకున్న, స్థానిక పేజీల్లో ప్రత్యక్షంగా నిర్ధారించని ప్రత్యేక తర్కపదం.'
});
writeJsonl(termsPath,terms);
writeJsonl(segmentPath,[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:12,
  linguistic:7,structural:5,terms:terms.length,corrections:corrections.length}));
