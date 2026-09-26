import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0425');
if(!unit||unit.order!==425||unit.source_path!==
   'content/normal-modal-logic/frame-definability/equivalence-S5.tex')
  throw new Error('Unexpected manifest cursor');
const source=read('upstream/'+unit.source_path),target=read('translation/'+unit.source_path);
const qa=JSON.parse(read('build/BATCH-076-STRUCTURAL-QA.json')).units;
if(Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
   qa.length!==1||qa[0].unit_id!==unit.unit_id||qa[0].translation_sha256!==sha(target)||
   !qa[0].paragraph_alignment||!qa[0].structure_match||!qa[0].token_parity||
   !qa[0].protected_identifier_parity||!qa[0].math_multiset_match||
   qa[0].unicode_replacement_char||qa[0].unpaired_surrogate)
  throw new Error('Frozen source or bounded QA mismatch');
const corrections=jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
if(corrections.length!==392||corrections.some(row=>row.unit_id===unit.unit_id))
  throw new Error('Unexpected source-correction cursor');

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
if(sb.length!==18||tb.length!==18)throw new Error('Block count mismatch');
const passageMap={
  5:['TE-P010','TE-P019'],
  6:['TE-P008','TE-P010','TE-P019'],
  7:['TE-P008','TE-P010'],
  8:['TE-P010'],
  9:['TE-P010','TE-P024'],
  10:['TE-P024'],
  11:['TE-P010','TE-P024'],
  12:['TE-P010','TE-P024'],
  13:['TE-P010'],
  14:['TE-P008','TE-P009','TE-P010'],
  15:['TE-P010','TE-P019'],
  16:['TE-P008','TE-P010','TE-P019','TE-P024'],
  17:['TE-P008','TE-P009']
};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const segmentPath='evidence/SEGMENT_CANON_USE.jsonl';
const current=jsonl(segmentPath),previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6459||![0,18].includes(current.length-previous.length))
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
      `OLP-0425-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక చిత్రాలను పోల్చాం; తుల్యతా చట్రాల S5 నిరూపణ మూల వాదానికి కట్టుబడి ఉంది.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'స్థానిక పేజీలు సమితి, వియుక్తత, సంబంధం, సత్యం, నిరూపణ సాధారణ పదజాలానికే ఆధారం; S5, సార్వత్రిక చట్ర సమానత్వం లేదా తుల్యతా వర్గ పరిమిత నమూనా నిరూపణకు ప్రత్యక్ష ప్రమాణం కావు.':
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక లేదా చిత్ర శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==13||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==5)
  throw new Error('Unexpected classification totals');

const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===117&&terms.at(-1).term_id==='TE-T117';
if(!existingTerm&&(terms.length!==116||terms.at(-1).term_id!=='TE-T116'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T117',
  source_term:'S5 as equivalence-frame logic / universal relation / equivalence-class partition / class-restricted countermodel',
  telugu:'తుల్యతా చట్రాల తర్కం S5 / సార్వత్రిక సంబంధం / తుల్యతా వర్గాల విభజన / వర్గానికి పరిమిత ప్రతినమూనా',
  status:'native_set_disjoint_relation_truth_proof_register_attested_modal_equivalence_frame_senses_source_controlled_provisional',
  passages:['TE-P008','TE-P009','TE-P010','TE-P019','TE-P024'],
  basis:'TE-P008లో సమితి, మూలకం, ఉపసమితి; TE-P009లో వియుక్త సమితులు; TE-P010లో ద్విస్థాన సంబంధం; TE-P019లో సత్యతావిలువ; TE-P024లో నియమ నిరూపణను స్థానిక చిత్రాల్లో చూశాం. తుల్యతా సంబంధం/వర్గం పదాలు పూర్వ OLP సంబంధ అధ్యాయం, TE-T017 వాడుకకు అనుగుణం; TE-T113/115లో చట్ర చెల్లుబాటు, S5 పూర్వ వాడుక ఉంది. స్థానిక చిత్రాలు S5కు లేదా తుల్యతా చట్రాల పూర్తి మోడల్-తర్క సమానత్వానికి ప్రత్యక్ష పేరు, నిరూపణ ఇవ్వవు. OLP-0425 నిర్వచనాలు, నాలుగు ధర్మ-కలయికలు, W′=[w] పరిమిత నమూనా, సూత్ర ఆగమనం ఆ ప్రత్యేక అర్థాలను నియంత్రిస్తాయి.',
  uncertainty:'సమితి, వియుక్తత, సంబంధం, సత్యం సాధారణ వాడుకకు ప్రత్యక్ష ఆధారం; తుల్యతా చట్రాల మోడల్ వ్యవస్థ, సార్వత్రిక చట్రాల సమాన తర్కం, వర్గానికి పరిమిత ప్రతినమూనా ప్రత్యేక తెలుగు రూపాలకు నామకరణ అనిశ్చితి ఎక్కువ. గణిత అర్థం మూల నిరూపణతో పరిమితం.',
  borrowing:'S5 మూల మోడల్ తర్క గుర్తింపు; R, W, V, p, u, v మరియు [w] రక్షిత గణిత సంకేతాలు. యూక్లిడియన్ పూర్వ నిర్ణయం TE-T114లో ప్రకటిత సాంకేతిక అరువు.'
});
writeJsonl(termsPath,terms);
writeJsonl(segmentPath,[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:18,
  linguistic:13,structural:5,terms:terms.length,corrections:corrections.length}));
