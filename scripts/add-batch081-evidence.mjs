import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0431');
const sourcePath='content/normal-modal-logic/axioms-systems/proofs-in-K.tex';
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-081-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==431||unit.source_path!==sourcePath||
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
  5:['TE-P024'],
  6:['TE-P024','TE-P032'],
  10:['TE-P024'],
  12:['TE-P024'],
  14:['TE-P024','TE-P033'],
  15:['TE-P024','TE-P032']
};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6550||![0,16].includes(current.length-previous.length))
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
    canon_passages:canonPassages,source_corrections:[],
    consultation_phase:linguistic?
      `OLP-0431-B${String(number).padStart(3,'0')}లో స్థిర ఆంగ్ల మూలం, తెలుగు లక్ష్యం, పేర్కొన్న స్థానిక పేజీల సాధారణ నిరూపణ/వ్యుత్పత్తి వాడుకలను ఎదురెదురు చూశాం; K, Nec, Dual, Box/Diamond శాఖల ప్రత్యేక అర్థాలకు మూల సూత్రాలు, నిరూపణ దశలే నియంత్రణ.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'TE-P024/032/033లో నియమ-ఆధారిత వ్యుత్పత్తి, నిగమనం, అనుమానం అనే సాధారణ పద్ధతి/పదజాలం మాత్రమే ప్రత్యక్షంగా కనిపిస్తుంది; K పంపిణీ, అవశ్యకీకరణ, ద్వంద్వత్వం, Box/Diamond ప్రాథమిక/నిర్వచిత శాఖలను అవి నిర్ధారించవు.':
      'వాక్యేతర TeX వ్యాఖ్య, గణిత రూపం లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==6||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==10)
  throw new Error('Unexpected classification totals');

const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===122&&terms.at(-1).term_id==='TE-T122';
if(!existingTerm&&(terms.length!==121||terms.at(-1).term_id!=='TE-T121'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T122',
  source_term:'proofs in K / necessitation and K distribution / duality / tautology instances / primitive versus defined Box and Diamond',
  telugu:'Kలో నిరూపణలు / అవశ్యకీకరణ మరియు K పంపిణీ / ద్వంద్వత్వం / సర్వసత్య ప్రతిస్థాపన నిదర్శనాలు / ప్రాథమిక లేదా నిర్వచిత Box, Diamond',
  status:'native_formal_derivation_and_inference_register_attested_modal_K_proof_senses_source_controlled_provisional',
  passages:['TE-P024','TE-P032','TE-P033'],
  basis:'TE-P024లో నియమ-ఆధారిత ఫలిత వ్యుత్పత్తి, TE-P032లో నిగమనం మరియు సిద్ధాంతవాక్య సందర్భం, TE-P033లో అనుమానం అనే ప్రత్యక్ష స్థానిక రూపాలు చూశాం. OLP-0431లో నాలుగు ప్రతిపాదనలు, Nec/K/MP దశలు, సర్వసత్య నిదర్శనాలు, prvBox/prvDiamond శాఖలే మోడల్-ప్రత్యేక భావాన్ని నిర్దేశిస్తాయి; స్థానిక పేజీలు ఆ ప్రత్యేక సిద్ధాంతాల ప్రత్యక్ష ఆధారం కావు. పూర్వ TE-T119--TE-T121 ఎంపికలతో పదరూపాన్ని సమన్వయించాం.',
  uncertainty:'సాధారణ నిరూపణ, వ్యుత్పత్తి, అనుమానం వాడుకకు స్థానిక ఆధారం ఉంది; K పంపిణీ, ద్వంద్వత్వం, అవశ్యకీకరణ, రెండు modalityల ప్రాథమిక/నిర్వచిత స్థితికి మూల సూత్రాలు, tag షరతులే ఆధారం. మూల నిరూపణల గణితాన్ని మార్చలేదు.',
  borrowing:'K, Nec, Dual, MP, Box, Diamond మరియు పథక చరాలు రక్షిత గణిత సంకేతాలుగా ఉంచాం; మోడల్ ముందే సందర్భీకరించిన రూపం.'
});
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:16,
  linguistic:6,structural:10,terms:terms.length}));
