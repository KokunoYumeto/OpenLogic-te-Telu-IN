import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0430');
const sourcePath='content/normal-modal-logic/axioms-systems/logics-proofs.tex';
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-080-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==430||unit.source_path!==sourcePath||
   Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
   qa.length!==1||qa[0].unit_id!==unit.unit_id||qa[0].translation_sha256!==sha(target)||
   !qa[0].paragraph_alignment||!qa[0].structure_match||!qa[0].token_parity||
   !qa[0].protected_identifier_parity||!qa[0].math_multiset_match||
   qa[0].unicode_replacement_char||qa[0].unpaired_surrogate)
  throw new Error('Frozen source or bounded QA mismatch');
const auditDir='evidence/source-audits/2026-09-27-modal-system-proof-telugu/';
const audit=JSON.parse(read(auditDir+'FINDINGS.json'));
const corrections=jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const correction=corrections.find(row=>row.finding_id==='OLTENMLAXSPRF-001');
if(audit.audit_id!=='OLTENMLAXSPRF-20260927'||audit.findings.length!==1||
   corrections.length!==395||!correction||correction.unit_id!==unit.unit_id||
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
if(sb.length!==14||tb.length!==14)throw new Error('Block count mismatch');
const passageMap={
  5:['TE-P024'],
  6:['TE-P018','TE-P024','TE-P032','TE-P033'],
  7:['TE-P024','TE-P032'],
  8:['TE-P024'],
  10:['TE-P024','TE-P032'],
  11:['TE-P024'],
  12:['TE-P024','TE-P032'],
  13:['TE-P008','TE-P018','TE-P024','TE-P032','TE-P033']
};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6536||![0,14].includes(current.length-previous.length))
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
    source_corrections:number===13?['OLTENMLAXSPRF-001']:[],
    consultation_phase:linguistic?
      `OLP-0430-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక చిత్రాలను పోల్చాం; మోడల్ వ్యవస్థలో వ్యుత్పత్తి, రెండు చేరికల నిరూపణ, MP/Nec మరియు K/Dual శాఖలు మూల గణిత షరతులకు కట్టబడి ఉన్నాయి.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'స్థానిక పేజీలు సమితి, ప్రతిజ్ఞావాక్య తర్కం, నియమ-ఆధారిత వ్యుత్పత్తి, నిగమనం, ఆగమనం సాధారణ పదజాలానికే ఆధారం; మోడల్ వ్యవస్థలో వ్యుత్పాద్యత సమానత్వం, K/Dual, MP/Nec ప్రత్యేక ఫలితాలను నేరుగా నిర్ధారించవు.':
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==8||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==6)
  throw new Error('Unexpected classification totals');
const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===121&&terms.at(-1).term_id==='TE-T121';
if(!existingTerm&&(terms.length!==120||terms.at(-1).term_id!=='TE-T120'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T121',
  source_term:'derivation in a modal system / derivable formulas as the system / axiom instances / closure under uniform substitution / K axiom formula membership',
  telugu:'మోడల్ వ్యవస్థలో వ్యుత్పత్తి / వ్యుత్పాదించదగిన సూత్రాల సమితిగానే వ్యవస్థ / స్వీకృత ప్రతిస్థాపన నిదర్శనాలు / ఏకరీతి ప్రతిస్థాపన కింద సంవృతం / K స్వీకృత సూత్రపు సభ్యత్వం',
  status:'native_formal_derivation_inference_induction_and_set_register_attested_modal_system_proof_senses_source_controlled_provisional',
  passages:['TE-P008','TE-P018','TE-P024','TE-P032','TE-P033'],
  basis:'TE-P008లో సమితి; TE-P018లో ప్రతిజ్ఞావాక్య తర్కం; TE-P024లో నియమాలతో ఫలిత వ్యుత్పత్తి; TE-P032లో ఆగమనం; TE-P033లో అనుమానం అనే వాడుకలను స్థానిక చిత్రాల్లో చూశాం. అవి నార్మల్ మోడల్ వ్యవస్థలో K/Dualతో వ్యుత్పాద్యత సమానత్వానికి ప్రత్యక్ష పేరు లేదా నిరూపణ ఇవ్వవు. OLP-0430లోని వ్యుత్పత్తి నిర్వచనం, రెండు సమితి-చేరికల నిరూపణ, ప్రతిస్థాపనపై వ్యాయామం, OLTENMLAXSPRF-001లో ప్రకటించిన K స్వీకృత సూత్రపు సభ్యత్వం ప్రత్యేక అర్థాలను నియంత్రిస్తాయి; పూర్వ TE-T034/119/120 రూపాలను అనుసరించాం.',
  uncertainty:'వ్యుత్పత్తి, నిగమనం, ఆగమనం, సమితి భాగాలకు స్థానిక ఆధారం ఉంది; మోడల్ వ్యవస్థ-వ్యుత్పాద్యత సమానత్వం, ఏకరీతి ప్రతిస్థాపన, K/Dual సూత్ర సభ్యత్వానికి మూల నిర్వచనాలు/నిరూపణలే ఆధారం. మూల K పేరు–సూత్రం తేడాను ప్రకటిత గణిత సవరణలో చూపాం.',
  borrowing:'K, Dual, MP, Nec, Sigma, LogK, Box మరియు సూత్ర మెటాచరాలు రక్షిత గణిత సంకేతాలు; మోడల్ ముందే సందర్భీకరించిన పదం.'
});
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:14,
  linguistic:8,structural:6,terms:terms.length,corrections:corrections.length}));
