import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0432');
const sourcePath='content/normal-modal-logic/axioms-systems/derived-rules.tex';
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-082-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==432||unit.source_path!==sourcePath||
   Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
   qa.length!==1||qa[0].unit_id!==unit.unit_id||qa[0].translation_sha256!==sha(target)||
   !qa[0].paragraph_alignment||!qa[0].structure_match||!qa[0].token_parity||
   !qa[0].protected_identifier_parity||!qa[0].math_multiset_match||
   qa[0].unicode_replacement_char||qa[0].unpaired_surrogate)
  throw new Error('Frozen source or bounded QA mismatch');
const auditDir='evidence/source-audits/2026-09-27-derived-rules-telugu/';
const audit=JSON.parse(read(auditDir+'FINDINGS.json'));
const corrections=jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const pair=corrections.filter(row=>row.unit_id===unit.unit_id);
if(audit.audit_id!=='OLTENMLAXSDER-20260927'||audit.findings.length!==2||
   corrections.length!==397||pair.length!==2||
   pair.some(row=>row.audit_id!==audit.audit_id||
     row.audit_findings_sha256!==sha(read(auditDir+'FINDINGS.json'))||
     row.audit_review_sha256!==sha(read(auditDir+'REVIEW.md'))||
     row.status!=='applied_qa_pass'))
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
if(sb.length!==26||tb.length!==26)throw new Error('Block count mismatch');
const passageMap={
  5:['TE-P024','TE-P032'],
  6:['TE-P018','TE-P024'],
  7:['TE-P018','TE-P033'],
  8:['TE-P018','TE-P024'],
  9:['TE-P024'],
  10:['TE-P024'],
  11:['TE-P032'],
  12:['TE-P024','TE-P032'],
  15:['TE-P018','TE-P024'],
  16:['TE-P032'],
  17:['TE-P024','TE-P032'],
  18:['TE-P018','TE-P024'],
  20:['TE-P024','TE-P033'],
  21:['TE-P018','TE-P024'],
  22:['TE-P018','TE-P024'],
  23:['TE-P024','TE-P032'],
  24:['TE-P018','TE-P024'],
  25:['TE-P018','TE-P024','TE-P032']
};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6566||![0,26].includes(current.length-previous.length))
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
    source_corrections:number===15?['OLTENMLAXSDER-001']:
      number===18?['OLTENMLAXSDER-002']:[],
    consultation_phase:linguistic?
      `OLP-0432-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, పేర్కొన్న స్థానిక పేజీల తర్కం/వ్యుత్పత్తి/ఆగమన వాడుకలను ఎదురెదురు చూశాం; PL/RK/rewriting ప్రత్యేక నియమాలు, ప్రతిస్థాపన దిశలను మూల సూత్రాలే నియంత్రిస్తాయి.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'TE-P018/024/032/033లో ప్రతిజ్ఞావాక్య తర్కం, నియమ-ఆధారిత వ్యుత్పత్తి, నిగమనం, ఆగమనం, అనుమానం అనే సాధారణ పదజాలం మాత్రమే ప్రత్యక్షంగా కనిపిస్తుంది; Kలో PL/RK, rewriting నియమం, Dual/Nec లేదా ప్రతిస్థాపన-సంవృత ప్రత్యేక ఫలితాలను అవి నిర్ధారించవు.':
      'వాక్యేతర TeX వ్యాఖ్య, గణిత రూపం లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==18||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==8)
  throw new Error('Unexpected classification totals');

const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===123&&terms.at(-1).term_id==='TE-T123';
if(!existingTerm&&(terms.length!==122||terms.at(-1).term_id!=='TE-T122'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T123',
  source_term:'derived rules / propositional-logic rule PL / derived rule RK / rewriting replacement / substitution closure of K proofs',
  telugu:'వ్యుత్పన్న నియమాలు / ప్రతిజ్ఞావాక్య తర్క నియమం PL / వ్యుత్పన్న నియమం RK / స్థానభర్తీ / K నిరూపణల ప్రతిస్థాపన సంవృతం',
  status:'native_propositional_logic_derivation_induction_and_inference_register_attested_modal_derived_rule_senses_source_controlled_provisional',
  passages:['TE-P018','TE-P024','TE-P032','TE-P033'],
  basis:'TE-P018లో ప్రతిజ్ఞా వాక్యాత్మక తర్కం, TE-P024లో నియమ-ఆధారిత ఫలిత వ్యుత్పత్తి, TE-P032లో నిగమనం/ఆగమనం, TE-P033లో అనుమానం అనే స్థానిక పాఠాలను చూశాం. OLP-0432లో PL, RK, rewriting, సమస్త వ్యుత్పత్తికి ప్రతిస్థాపన వంటి మోడల్-ప్రత్యేక విధులు మూల ప్రతిపాదనలు, నిరూపణలకే కట్టబడి ఉన్నాయి. పూర్వ TE-T119--TE-T122 పదరూపాలతో సమన్వయించాం; OLTENMLAXSDER-001--002 స్థానిక మూల భేదాలను విడిగా ప్రకటించాం.',
  uncertainty:'సాధారణ ప్రతిజ్ఞావాక్య తర్కం, నియమం, వ్యుత్పత్తి, ఆగమనం స్థానికంగా సాక్షాత్కరించాయి; PL/RK అనే Kలో వ్యుత్పన్న నియమాల పూర్తి భావం, సమానార్థక-సూత్ర స్థానభర్తీ, ప్రతిస్థాపన సంవృతం మూల గణితంపైనే ఆధారపడ్డాయి. రెండో మూల భేదంలో పాత–కొత్త క్రమాన్ని ప్రదర్శిత దశలతో సరిచూశాం.',
  borrowing:'PL, RK, K, Nec, Dual, MP, Box, Diamond, Subst మరియు సూత్ర మెటాచరాలు రక్షిత గణిత సంకేతాలు; వాటికి స్థానిక పేజీలు ప్రత్యేక ఆధారం కావు.'
});
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:26,
  linguistic:18,structural:8,terms:terms.length,corrections:corrections.length}));
