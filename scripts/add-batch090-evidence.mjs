import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const sourcePath='content/normal-modal-logic/axioms-systems/consistency.tex';
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0440');
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-090-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==440||unit.source_path!==sourcePath||
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
if(sb.length!==11||tb.length!==11)throw new Error('Block count mismatch');
const passageMap={
  5:['TE-P026'],6:['TE-P024','TE-P026'],7:['TE-P026'],
  8:['TE-P018','TE-P026'],9:['TE-P024','TE-P026'],
  10:['TE-P018','TE-P024','TE-P026']
};
const correctionMap={6:['OLTENMLAXSCON-001'],10:['OLTENMLAXSCON-002']};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6677||![0,11].includes(current.length-previous.length))
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
      `OLP-0440-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక తర్కం/వ్యుత్పత్తి/అవైరుధ్య పేజీలను ఎదురెదురు చూశాం; వ్యవస్థ-సాపేక్ష ఉదాహరణలు, మూడు లక్షణాలు, విపర్యయ నిరూపణ మూల గణితం నుంచే.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'TE-P026లో సుసంగతత్వం/అసంగత అనే సాధారణ ప్రతిజ్ఞావాక్య-సమితి భావం ప్రత్యక్షం; TE-P018/024 సాధారణ తర్కం, నియమ-వ్యుత్పత్తి మాత్రమే. K/K5-సాపేక్ష అవైరుధ్యం, కానానికల్ నమూనా, మూడు లక్షణాలు వాటిలో స్థాపించబడలేదు.':
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==6||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==5)
  throw new Error('Unexpected classification totals');
const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===131&&terms.at(-1).term_id==='TE-T131';
if(!existingTerm&&(terms.length!==130||terms.at(-1).term_id!=='TE-T130'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T131',
  source_term:'system-relative consistency / inconsistency / canonical model / consistent extension / contraposition proof',
  telugu:'వ్యవస్థ-సాపేక్ష అవైరుధ్యం / వైరుధ్యం / కానానికల్ నమూనా / అవిరుద్ధ విస్తరణ / విపర్యయ నిరూపణ',
  status:'native_general_consistency_inconsistency_and_derivation_register_attested_modal_relative_consistency_source_controlled_provisional',
  passages:['TE-P018','TE-P024','TE-P026'],
  basis:'TE-P026 స్థానిక పేజీని ఈ బ్యాచ్‌లో నేరుగా మళ్లీ చూసాం: అక్కడ సాధారణ ప్రతిజ్ఞావాక్య సమితి సుసంగతత్వం/అసంగత ప్రత్యక్షం. TE-P018/024లో ప్రతిజ్ఞావాక్య తర్కం, నియమ-వ్యుత్పత్తి ప్రత్యక్షం. TE-T034, TE-T073, TE-T119--TE-T130 పూర్వ వాడుకతో సమన్వయంగా స్థిర లక్ష్యంలో అవైరుధ్యం/వైరుధ్యం కొనసాగించాం. Sigma-సాపేక్ష నిర్వచనం, K/K5 ఉదాహరణలు, మూడు లక్షణాలు, విపర్యయ నిరూపణ OLP-0440 మూల గణితం నుంచే.',
  uncertainty:'సుసంగతత్వం అనే స్థానిక పర్యాయాన్ని త్రోసిపుచ్చలేదు; స్థిర అవైరుధ్యం రూపం సంపాదకీయ సమన్వయం. కానానికల్ నమూనా ప్రత్యేక మోడల్-సిద్ధాంత ఋణపదం, తరువాతి మూల నిర్మాణం ద్వారా స్థిరీకరణకు లోబడి ఉంది. నమూనా-సత్య వాక్య పరిమితి, నిరూపణలో తక్షణ ఆధార సూచన OLTENMLAXSCON-001--002గా ప్రకటించబడ్డాయి.',
  borrowing:'కానానికల్ అనేది నిర్వచనంతో సందర్భీకరించాల్సిన ప్రత్యేక సాంకేతిక ఋణపదం; Sigma, Gamma, K, K5, Box, Diamond, Proves మరియు సూత్ర మెటాచరాలు రక్షిత గణిత సంకేతాలు.'
});
const correctionFile='evidence/SOURCE_CORRECTIONS.jsonl',corrections=jsonl(correctionFile);
const changed=corrections.map(row=>row.unit_id===unit.unit_id?{...row,status:'applied_qa_pass'}:row);
if(changed.length!==404||changed.filter(row=>row.unit_id===unit.unit_id).length!==2)
  throw new Error('Correction count mismatch');
writeJsonl(correctionFile,changed);
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:11,
  linguistic:6,structural:5,terms:terms.length,corrections:changed.length}));
