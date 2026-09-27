import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),rows.map(JSON.stringify).join('\n')+'\n','utf8');
const sourcePath='content/normal-modal-logic/axioms-systems/systems-distinct.tex';
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0437');
const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
const qa=JSON.parse(read('build/BATCH-087-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==437||unit.source_path!==sourcePath||
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
if(sb.length!==20||tb.length!==20)throw new Error('Block count mismatch');
const passageMap={
  5:['TE-P018'],6:['TE-P018','TE-P024'],8:['TE-P010','TE-P018','TE-P024'],
  10:['TE-P010','TE-P018'],11:['TE-P010'],12:['TE-P018'],
  13:['TE-P010','TE-P018','TE-P024'],14:['TE-P010'],
  16:['TE-P010','TE-P018'],17:['TE-P010'],18:['TE-P010','TE-P024'],
  19:['TE-P010','TE-P024']
};
const correctionMap={8:['OLTENMLAXSDIS-001'],12:['OLTENMLAXSDIS-002']};
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>row.unit_id!==unit.unit_id);
if(previous.length!==6640||![0,20].includes(current.length-previous.length))
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
      `OLP-0437-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక సంబంధ/తర్క/వ్యుత్పత్తి పేజీలను ఎదురెదురు చూశాం; మూడు నమూనాల అంచులు, సత్యమూల్యాలు, వ్యవస్థ-వేరుపాటు వాదాలు మూల గణితం నుంచే.`:
      'not_applicable_nonlinguistic',
    evidence_limit:linguistic?
      'TE-P010 సాధారణ సంబంధ పదజాలం, TE-P018 ప్రతిజ్ఞావాక్య తర్కం, TE-P024 నియమ-వ్యుత్పత్తి మాత్రమే ప్రత్యక్షంగా చూపుతాయి. మోడల్ చట్ర ధర్మాలు, గ్రాఫు ప్రతినమూనాలు, వ్యవస్థల వేరుపాటు వాటిలో స్థాపించబడలేదు.':
      'వాక్యేతర TeX వ్యాఖ్య, గణిత రూపం లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
  };
});
if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==12||
   rows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length!==8)
  throw new Error('Unexpected classification totals');
const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===128&&terms.at(-1).term_id==='TE-T128';
if(!existingTerm&&(terms.length!==127||terms.at(-1).term_id!=='TE-T127'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T128',
  source_term:'distinct modal systems / proper inclusion / symmetric, reflexive, serial and Euclidean countermodels / falsifying axiom instances',
  telugu:'భిన్నమైన మోడల్ వ్యవస్థలు / నిజమైన చేరిక / సౌష్ఠవ, స్వావర్తన, సీరియల్, యూక్లిడియన్ ప్రతినమూనాలు / స్వీకృత నిదర్శనాలు విఫలమవడం',
  status:'native_general_relation_logic_and_derivation_register_attested_modal_countermodel_senses_source_controlled_provisional',
  passages:['TE-P010','TE-P018','TE-P024'],
  basis:'TE-P010లో సంబంధం అనే సాధారణ గణిత పదజాలం, TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, TE-P024లో నియమ-ఆధారిత వ్యుత్పత్తిని నేరుగా చూశాం. TE-T017, TE-T024, TE-T114--TE-T127 పూర్వ ఎంపికలతో రూపాలు సరిపోల్చాం. మూడు TikZ గ్రాఫుల అంచులు/సత్యమూల్యాలు, KD/KT, KB/K4, KTB, KD5/KT4 విభేదాలు OLP-0437 మూల గణిత నియంత్రణలో ఉన్నాయి.',
  uncertainty:'స్థానిక పేజీలు మోడల్ ప్రతినమూనాలు లేదా వ్యవస్థ-వేరుపాటు సిద్ధాంతాలకు ప్రత్యక్ష ఆధారం కావు. సీరియల్, యూక్లిడియన్ రూపాలు పూర్వ నిర్ణయాల ప్రకారం కొనసాగాయి; D/4/5 వ్యవస్థ-సూచిక స్థానాల్లో స్వీకృత సూత్రాల అవసరం మూల గణిత పఠనం ద్వారా నిర్ణయించాం.',
  borrowing:'K, D, T, B, 4, 5, S4, ప్రపంచ సంకేతాలు, TikZ identifiers మరియు modal operators రక్షిత గణిత గుర్తులు; సీరియల్, యూక్లిడియన్ ప్రకటిత సాంకేతిక ఋణపదాలు.'
});
const correctionFile='evidence/SOURCE_CORRECTIONS.jsonl',corrections=jsonl(correctionFile);
const changed=corrections.map(row=>row.unit_id===unit.unit_id?{...row,status:'applied_qa_pass'}:row);
if(changed.length!==402||changed.filter(row=>row.unit_id===unit.unit_id).length!==2)
  throw new Error('Correction count mismatch');
writeJsonl(correctionFile,changed);
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:20,
  linguistic:12,structural:8,terms:terms.length,corrections:changed.length}));
