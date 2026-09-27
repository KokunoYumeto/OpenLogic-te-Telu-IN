import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0433');
const sourcePath='content/normal-modal-logic/axioms-systems/more-proofs-in-K.tex';
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-083-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==433||unit.source_path!==sourcePath||
   Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
   qa.length!==1||qa[0].unit_id!==unit.unit_id||qa[0].translation_sha256!==sha(target)||
   !qa[0].paragraph_alignment||!qa[0].structure_match||!qa[0].token_parity||
   !qa[0].protected_identifier_parity||!qa[0].math_multiset_match||
   qa[0].unicode_replacement_char||qa[0].unpaired_surrogate)
  throw new Error('Frozen source or bounded QA mismatch');
const auditDir='evidence/source-audits/2026-09-27-more-K-proofs-telugu/';
const audit=JSON.parse(read(auditDir+'FINDINGS.json'));
const corrections=jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const correction=corrections.find(row=>row.finding_id==='OLTENMLAXSMPR-001');
if(audit.audit_id!=='OLTENMLAXSMPR-20260927'||audit.findings.length!==1||
   corrections.length!==398||!correction||correction.unit_id!==unit.unit_id||
   correction.audit_id!==audit.audit_id||
   correction.audit_findings_sha256!==sha(read(auditDir+'FINDINGS.json'))||
   correction.audit_review_sha256!==sha(read(auditDir+'REVIEW.md'))||
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
if(sb.length!==16||tb.length!==16)throw new Error('Block count mismatch');
const passageMap={
  5:['TE-P024'],
  6:['TE-P018','TE-P024'],
  8:['TE-P018','TE-P024'],
  10:['TE-P018','TE-P024'],
  12:['TE-P018','TE-P024'],
  14:['TE-P018','TE-P024'],
  15:['TE-P018','TE-P024']
};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6592||![0,16].includes(current.length-previous.length))
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
    source_corrections:number===14?['OLTENMLAXSMPR-001']:[],
    consultation_phase:linguistic?
      `OLP-0433-B${String(number).padStart(3,'0')}లో స్థిర మూల సూత్రాలు, తెలుగు లక్ష్యం, పేర్కొన్న స్థానిక ప్రతిజ్ఞావాక్య తర్క/వ్యుత్పత్తి పేజీల సాధారణ పదజాలాన్ని ఎదురెదురు చూశాం; Kలో PL/RK, Diamond భర్తీ, కలయిక పంపిణీ గణితాన్ని మూల నిరూపణలే నియంత్రిస్తాయి.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'TE-P018/024లో ప్రతిజ్ఞావాక్య తర్కం, నియమ-ఆధారిత వ్యుత్పత్తి సాధారణ సందర్భాలే ప్రత్యక్షం; Kలో Box/Diamond నిరూపణలు, PL/RK, Dual లేదా చివరి కలయిక క్రమసవరణను ఆ పేజీలు ధ్రువీకరించవు.':
      'వాక్యేతర TeX వ్యాఖ్య, గణిత రూపం లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==7||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==9)
  throw new Error('Unexpected classification totals');

const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===124&&terms.at(-1).term_id==='TE-T124';
if(!existingTerm&&(terms.length!==123||terms.at(-1).term_id!=='TE-T123'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T124',
  source_term:'more K proofs / derivability examples / Diamond for not-Box-not / PL and RK proof labels / disjunction-order conclusion',
  telugu:'Kలో మరిన్ని నిరూపణలు / వ్యుత్పాద్యత ఉదాహరణలు / నిషేధ-Box-నిషేధ స్థానంలో Diamond / PL, RK నిరూపణ సూచికలు / వికల్ప క్రమ తీర్మానం',
  status:'native_propositional_logic_and_formal_derivation_register_attested_modal_K_and_Diamond_senses_source_controlled_provisional',
  passages:['TE-P018','TE-P024'],
  basis:'TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, అనుసంధానాల జాబితా; TE-P024లో నియమాలతో ఫలిత వ్యుత్పత్తి ప్రత్యక్షంగా చూశాం. OLP-0433లోని నాలుగు K నిరూపణలు, PL/RK సంక్షిప్త దశలు, Diamond భర్తీ, OLTENMLAXSMPR-001 చివరి వికల్ప క్రమం మూల సూత్రాలు/ప్రతిపాదనలే నిర్ణయిస్తాయి. TE-T119--TE-T123 పదరూపాలను కొనసాగించాం.',
  uncertainty:'స్థానిక పేజీలు సాధారణ ప్రతిజ్ఞావాక్య తర్కం, నియమ-వ్యుత్పత్తికి ఆధారం; Kలో Box/Diamond నిరూపణలు, PL/RK అర్థం, చివరి సూత్ర క్రమం ఆ మూల గణితం నుంచే తీసుకున్నాం. నాలుగవ నిరూపణ చివరి పంక్తి–ప్రతిపాదన భేదాన్ని ప్రకటిత సవరణగా ఉంచాం.',
  borrowing:'K, PL, RK, Box, Diamond మరియు సూత్ర మెటాచరాలు రక్షిత గణిత సంకేతాలు; స్థానిక పేజీల్లో ఈ ప్రత్యేక మోడల్-నియమాలు కనిపించలేదు.'
});
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:16,
  linguistic:7,structural:9,terms:terms.length,corrections:corrections.length}));
