import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0429');
const sourcePath='content/normal-modal-logic/axioms-systems/normal-logics.tex';
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-079-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==429||unit.source_path!==sourcePath||
   Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
   qa.length!==1||qa[0].unit_id!==unit.unit_id||qa[0].translation_sha256!==sha(target)||
   !qa[0].paragraph_alignment||!qa[0].structure_match||!qa[0].token_parity||
   !qa[0].protected_identifier_parity||!qa[0].math_multiset_match||
   qa[0].unicode_replacement_char||qa[0].unpaired_surrogate)
  throw new Error('Frozen source or bounded QA mismatch');
const auditDir='evidence/source-audits/2026-09-27-modal-normal-logics-telugu/';
const audit=JSON.parse(read(auditDir+'FINDINGS.json'));
const corrections=jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const correction=corrections.find(row=>row.finding_id==='OLTENMLAXSNOR-001');
if(audit.audit_id!=='OLTENMLAXSNOR-20260927'||audit.findings.length!==1||
   corrections.length!==394||!correction||correction.unit_id!==unit.unit_id||
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
if(sb.length!==20||tb.length!==20)throw new Error('Block count mismatch');
const passageMap={
  5:['TE-P018'],
  6:['TE-P018','TE-P024','TE-P032'],
  7:['TE-P008','TE-P018','TE-P024'],
  8:['TE-P010','TE-P018','TE-P019','TE-P024'],
  9:['TE-P010','TE-P018','TE-P024'],
  10:['TE-P019','TE-P024'],
  11:['TE-P024','TE-P032'],
  12:['TE-P024','TE-P032'],
  13:['TE-P024','TE-P032'],
  14:['TE-P018','TE-P024','TE-P032'],
  15:['TE-P018','TE-P024'],
  16:['TE-P024','TE-P032'],
  17:['TE-P008','TE-P018','TE-P024'],
  18:['TE-P008','TE-P024','TE-P032'],
  19:['TE-P018','TE-P024']
};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6516||![0,20].includes(current.length-previous.length))
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
    source_corrections:number===18?['OLTENMLAXSNOR-001']:[],
    consultation_phase:linguistic?
      `OLP-0429-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక చిత్రాలను పోల్చాం; మోడల్-తర్క నిర్వచనాలు, K/Dual, RK, ప్రతిచ్ఛేద కనిష్ఠత మూల గణిత షరతులకు కట్టబడి ఉన్నాయి.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'స్థానిక పేజీలు సమితి/ప్రతిచ్ఛేదం, సంబంధం, ప్రతిజ్ఞావాక్య తర్కం, సత్యం, వ్యుత్పత్తి, ఆగమనం సాధారణ పదజాలానికే ఆధారం; నార్మల్ మోడల్ తర్కం, K/Dual, RK లేదా కనిష్ఠ మోడల్ వ్యవస్థ ప్రత్యేక ఫలితాలకు ప్రత్యక్ష ఆధారం కావు.':
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==15||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==5)
  throw new Error('Unexpected classification totals');
const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===120&&terms.at(-1).term_id==='TE-T120';
if(!existingTerm&&(terms.length!==119||terms.at(-1).term_id!=='TE-T119'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T120',
  source_term:'modal logic / normal modal logic / modal system / substitution closure / necessitation closure / RK rule / smallest modal logic',
  telugu:'మోడల్ తర్కం / నార్మల్ మోడల్ తర్కం / మోడల్ వ్యవస్థ / ప్రతిస్థాపన కింద సంవృతం / అవశ్యకీకరణ కింద సంవృతం / RK నియమం / అతి చిన్న మోడల్ తర్కం',
  status:'native_set_intersection_formal_logic_derivation_induction_register_attested_normal_modal_system_terminology_definition_controlled_provisional',
  passages:['TE-P008','TE-P010','TE-P018','TE-P019','TE-P024','TE-P032'],
  basis:'TE-P008లో సమితి, ఛేదన; TE-P010లో సంబంధం; TE-P018లో ప్రతిజ్ఞావాక్యాత్మక తర్కం; TE-P019లో సత్యతావిలువ; TE-P024లో నియమ-ఆధారిత వ్యుత్పత్తి; TE-P032లో ఆగమనం, నిగమనం అనే వాడుకలను స్థానిక చిత్రాల్లో చూశాం. అవి నార్మల్ మోడల్ తర్కం, మోడల్ వ్యవస్థ, K/Dual లేదా RKకు ప్రత్యక్ష పేర్లు ఇవ్వవు. OLP-0429లోని రెండు నిర్వచనాలు, K/Dual గార్డులు, RK ఆగమన నిరూపణ, OLTENMLAXSNOR-001లో ప్రకటించిన ప్రతిచ్ఛేద-వర్గ భేదం ప్రత్యేక అర్థాలను నియంత్రిస్తాయి; పూర్వ TE-T111/119తో రూపం సరిపోల్చాం.',
  uncertainty:'సమితి/ఛేదన, ప్రతిజ్ఞావాక్య తర్కం, వ్యుత్పత్తి, ఆగమనం భాగాలకు స్థానిక ఆధారం ఉంది. నార్మల్ మోడల్ వ్యవస్థ మరియు సంవృత-నియమ సమాసాలు మూల నిర్వచనానికి కట్టిన తాత్కాలిక సంపాదకీయ ఎంపికలు; మూల నిరూపణలోని సాధారణ/నార్మల్ వర్గ తేడా ప్రకటిత సవరణతో పరిష్కరించబడింది.',
  borrowing:'K, Dual, RK, MP, Nec, Box, Diamond, Sigma మరియు సూత్ర మెటాచరాలు రక్షిత గణిత సంకేతాలు; మోడల్ అనే ముందే స్థిరమైన సందర్భీకృత పదం తప్ప ప్రకటించని ఆంగ్ల సాంకేతిక పదం లేదు.'
});
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:20,
  linguistic:15,structural:5,terms:terms.length,corrections:corrections.length}));
