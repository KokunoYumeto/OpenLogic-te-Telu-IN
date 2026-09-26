import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0423');
if(!unit||unit.order!==423||unit.source_path!==
   'content/normal-modal-logic/frame-definability/definability.tex')
  throw new Error('Unexpected manifest cursor');
const source=read('upstream/'+unit.source_path),target=read('translation/'+unit.source_path);
const qa=JSON.parse(read('build/BATCH-074-STRUCTURAL-QA.json')).units;
if(Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
   qa.length!==1||qa[0].unit_id!==unit.unit_id||qa[0].translation_sha256!==sha(target)||
   !qa[0].paragraph_alignment||!qa[0].structure_match||!qa[0].token_parity||
   !qa[0].protected_identifier_parity||!qa[0].math_multiset_match||
   qa[0].unicode_replacement_char||qa[0].unpaired_surrogate)
  throw new Error('Frozen source or bounded QA mismatch');
const auditDir='evidence/source-audits/2026-09-27-modal-frame-definability-telugu';
const audit=JSON.parse(read(auditDir+'/FINDINGS.json'));
const corrections=jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const correction=corrections.find(row=>row.finding_id==='OLTENMLFRDDEF-001');
if(audit.audit_id!=='OLTENMLFRDDEF-20260927'||audit.findings.length!==1||
   corrections.length!==391||!correction||correction.unit_id!==unit.unit_id||
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
if(sb.length!==20||tb.length!==20)throw new Error('Block count mismatch');
const passageMap={
  5:['TE-P010','TE-P023'],6:['TE-P010','TE-P019','TE-P023'],
  7:['TE-P008','TE-P010','TE-P023'],8:['TE-P024'],
  9:['TE-P010','TE-P021','TE-P023'],
  10:['TE-P010','TE-P019','TE-P021','TE-P024'],
  11:['TE-P010','TE-P019'],12:['TE-P010'],
  13:['TE-P010','TE-P023'],14:['TE-P010','TE-P023','TE-P024'],
  15:['TE-P010','TE-P024'],16:['TE-P010','TE-P019','TE-P023'],
  17:['TE-P010','TE-P019','TE-P023'],
  18:['TE-P010','TE-P011','TE-P021','TE-P024'],19:['TE-P024']
};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const segmentPath='evidence/SEGMENT_CANON_USE.jsonl';
const current=jsonl(segmentPath),previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6427||![0,20].includes(current.length-previous.length))
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
    source_corrections:number===10?['OLTENMLFRDDEF-001']:[],
    consultation_phase:linguistic?
      `OLP-0423-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక చిత్రాలను పోల్చాం; పూర్తి చట్ర అనురూపత మూల నిరూపణాధీనం.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'స్థానిక పేజీలు సాధారణ సమితి, సంబంధం, సత్యం, సోపాధికం, ఫలిత/నిరూపణ పదజాలానికే ఆధారం; చట్ర నిర్వచనీయత, S4/S5 లేదా మూల నిరూపణ దిద్దుబాటుకు ప్రత్యక్ష ప్రమాణం కావు.':
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక లేదా గద్యం ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==15||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==5)
  throw new Error('Unexpected classification totals');

const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===115&&terms.at(-1).term_id==='TE-T115';
if(!existingTerm&&(terms.length!==114||terms.at(-1).term_id!=='TE-T114'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T115',
  source_term:'formula defines a class of frames / full frame correspondence / characteristic schema / modal systems S4 and S5 / frame-validity implication versus model-world entailment',
  telugu:'సూత్రం చట్రాల వర్గాన్ని నిర్వచిస్తుంది / పూర్తి చట్ర అనురూపత / లక్షణ పథకం / మోడల్ వ్యవస్థలు S4 మరియు S5 / చట్ర-చెల్లుబాటు సూచన వర్సెస్ నమూనా-లోక అనుగమనం',
  status:'native_relation_truth_conditional_consequence_proof_register_attested_modal_definability_source_controlled_provisional',
  passages:['TE-P008','TE-P010','TE-P011','TE-P019','TE-P021','TE-P023','TE-P024'],
  basis:'TE-P008లో సమితి/వర్గానికి సంబంధించిన సాధారణ గద్యం, TE-P010లో ద్విస్థానిక సంబంధం, TE-P011లో ప్రమేయం, TE-P019లో సత్యతావిలువ, TE-P021లో సోపాధికం, TE-P023లో ఫలితం, TE-P024లో నియమ నిరూపణను స్థానిక చిత్రాల్లో చూశాం. ఈ చిత్రాలు ప్రత్యేక క్రిప్కె చట్ర అనురూపతను నిరూపించవు. OLP-0422 చట్ర చెల్లుబాటు నిర్వచనం, OLP-0423లోని అన్ని-మరియు-మాత్రమే నిర్వచనం, D/T/B/4/5 ప్రతివాద మూల్యనిర్ణయాలు, పూర్వ TE-T111/113/114 వాడుక ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి.',
  uncertainty:'నిర్వచక సూత్రం, పూర్తి అనురూపత, S4/S5 పేర్ల ప్రత్యేక తెలుగు వాడుకకు ఈ స్థానిక పేజీల్లో ప్రత్యక్ష ప్రమాణం లేదు. గణిత వాదం మూల నిరూపణ, పరిమిత నమూనా పరీక్షకు కట్టుబడి ఉంది; OLTENMLFRDDEF-001 దిద్దుబాటు స్థానిక సాక్ష్యంతో కాదు, లోక-సత్య నిర్వచనంతో సమర్థితం.',
  borrowing:'S4, S5, D, T, B, 4, 5 మూల వ్యవస్థ/పథక గుర్తింపులు; మోడల్ పూర్వ సాంకేతిక అరువు; ఫార్మల్ మాక్రోలు, చరాలు రక్షిత సంకేతాలు.'
});
writeJsonl(termsPath,terms);
writeJsonl(segmentPath,[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:20,
  linguistic:15,structural:5,terms:terms.length,corrections:corrections.length}));
