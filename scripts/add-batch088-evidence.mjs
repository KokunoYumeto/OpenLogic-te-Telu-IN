import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const sourcePath='content/normal-modal-logic/axioms-systems/provability-from-set.tex';
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0438');
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-088-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==438||unit.source_path!==sourcePath||
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
if(sb.length!==8||tb.length!==8)throw new Error('Block count mismatch');
const passageMap={5:['TE-P018','TE-P024'],6:['TE-P018','TE-P024'],7:['TE-P018','TE-P024']};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6660||![0,8].includes(current.length-previous.length))
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
      `OLP-0438-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక ప్రతిజ్ఞావాక్య తర్కం/నియమ-వ్యుత్పత్తి పేజీలను ఎదురెదురు చూశాం; సమితి-సాపేక్ష మోడల్ నిరూపణీయత మూల నిర్వచనం నుంచే.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'TE-P018/024 సాధారణ ప్రతిజ్ఞావాక్య తర్కం, నియమ-వ్యుత్పత్తి పదజాలాన్ని మాత్రమే చూపుతాయి; Gamma నుంచి Sigmaలో నిరూపణీయతకు ఇచ్చిన ప్రత్యేక నిర్వచనం వాటిలో స్థాపించబడలేదు.':
      'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==3||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==5)
  throw new Error('Unexpected classification totals');
const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===129&&terms.at(-1).term_id==='TE-T129';
if(!existingTerm&&(terms.length!==128||terms.at(-1).term_id!=='TE-T128'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T129',
  source_term:'provability / derivability from a set of formulas in a modal system / iterated implication witness',
  telugu:'మోడల్ వ్యవస్థలో సూత్రాల సమితి నుంచి నిరూపణీయత / వ్యుత్పాద్యత / వరుస అంతర్నిహితార్థ సాక్ష్యం',
  status:'native_general_propositional_logic_and_rule_derivation_register_attested_relative_modal_derivability_source_controlled_provisional',
  passages:['TE-P018','TE-P024'],
  basis:'TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, TE-P024లో నియమ-ఆధారిత వ్యుత్పత్తి వాడుకను నేరుగా చూశాం. TE-T034/035 మరియు TE-T119--TE-T128లో నిరూపణీయత/వ్యుత్పాద్యత రూపాలను కొనసాగించాం. Gamma నుంచి Sigmaలో నిరూపణీయతకు B_1,...,B_nతో ఇచ్చిన ఖచ్చిత షరతు OLP-0438 స్థిర మూల గణితం ద్వారా నిర్ణీతం.',
  uncertainty:'స్థానిక పేజీలు మోడల్ వ్యవస్థలో సమితి-సాపేక్ష వ్యుత్పాద్యత ప్రత్యేక నిర్వచనాన్ని నేరుగా ఇవ్వవు. n శూన్యమయ్యే సంప్రదాయంపై మూలం విడిగా వ్యాఖ్యానించలేదు; తెలుగు వచనం దాన్ని జోడించలేదు. శీర్షికలోని usetoken గుర్తులు మూల పద-గుర్తింపుగా యథాతథం.',
  borrowing:'Sigma, Gamma, A, B_i, Proves మరియు సూత్ర మెటాచరాలు రక్షిత గణిత సంకేతాలు.'
});
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:8,
  linguistic:3,structural:5,terms:terms.length}));
