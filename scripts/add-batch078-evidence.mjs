import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const manifest=jsonl('evidence/SOURCE_MANIFEST.jsonl');
const qa=JSON.parse(read('build/BATCH-078-STRUCTURAL-QA.json')).units;
const expected=[
  ['OLP-0427','content/normal-modal-logic/axioms-systems/axioms-systems.tex',7,{
    4:['TE-P024','TE-P032']
  }],
  ['OLP-0428','content/normal-modal-logic/axioms-systems/introduction.tex',13,{
    5:['TE-P018','TE-P024'],
    6:['TE-P018','TE-P019','TE-P024','TE-P032'],
    7:['TE-P024','TE-P032','TE-P033'],
    8:['TE-P018','TE-P019','TE-P024','TE-P032','TE-P033'],
    9:['TE-P024','TE-P033'],
    10:['TE-P024','TE-P033'],
    11:['TE-P024','TE-P032','TE-P033'],
    12:['TE-P019','TE-P024','TE-P032']
  }]
];
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const previous=current.filter(row=>!['OLP-0427','OLP-0428'].includes(row.unit_id));
if(previous.length!==6496||![0,20].includes(current.length-previous.length))
  throw new Error('Unexpected segment cursor');
const rows=[];
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
for(const [id,sourcePath,count,passageMap] of expected){
  const unit=manifest.find(row=>row.unit_id===id);
  const source=read('upstream/'+sourcePath),target=read('translation/'+sourcePath);
  const record=qa.find(row=>row.unit_id===id);
  if(!unit||unit.source_path!==sourcePath||unit.order!==Number(id.slice(4))||
     Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
     !record||record.translation_sha256!==sha(target)||!record.paragraph_alignment||
     !record.structure_match||!record.token_parity||!record.protected_identifier_parity||
     !record.math_multiset_match||record.unicode_replacement_char||record.unpaired_surrogate)
    throw new Error('Frozen source or bounded QA mismatch for '+id);
  const sb=blocksWithSpans(source),tb=blocksWithSpans(target);
  if(sb.length!==count||tb.length!==count)throw new Error('Block count mismatch '+id);
  rows.push(...sb.map((block,index)=>{
    const number=index+1,t=tb[index],linguistic=Object.hasOwn(passageMap,number);
    if(linguistic!==/[\u0C00-\u0C7F]/u.test(t.block))
      throw new Error('Misclassified language block '+id+'-'+number);
    const canonPassages=(passageMap[number]??[]).map(passageId=>{
      const passage=canon.get(passageId);
      if(!passage)throw new Error('Missing consulted passage '+passageId);
      return {passage_id:passageId,source_sha256:passage.source_sha256,
        ...(passage.pdf_page?{pdf_page:passage.pdf_page}:{}),role:passage.role};
    });
    return {
      segment_id:id+'-B'+String(number).padStart(3,'0'),
      unit_id:id,source_path:sourcePath,
      source_unit_sha256:sha(source),translation_unit_sha256:sha(target),
      source_start_line:block.startLine,source_end_line:block.endLine,
      target_start_line:t.startLine,target_end_line:t.endLine,
      source_segment_sha256:sha(block.block),translation_segment_sha256:sha(t.block),
      classification:linguistic?'translated_linguistic_segment':'preserved_metadata_or_structural_segment',
      canon_passages:canonPassages,source_corrections:[],
      consultation_phase:linguistic?
        `${id}-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక పేజీ చిత్రాలను పోల్చాం; వ్యుత్పత్తి/నిగమన పరిభాషను పూర్వ ఎంపికలకు, మోడల్ ప్రత్యేక అర్థాన్ని ఈ మూల నిర్వచనానికి కట్టాం.`:
        'not_applicable_nonlinguistic',
      evidence_limit:linguistic?
        'స్థానిక పేజీలు ప్రతిజ్ఞావాక్యాత్మక తర్కం, సత్యతావిలువ, నియమ-ఆధారిత వ్యుత్పత్తి, నిగమనం, అనుమానం సాధారణ పదజాలానికే ఆధారం; హిల్బర్ట్-రకం మోడల్ వ్యవస్థ, అవశ్యకీకరణ, K లేదా Dual స్వీకృతాలు, నార్మల్ మోడల్ నిర్దుష్టత/సంపూర్ణతను నేరుగా నిర్ధారించవు.':
        'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
    };
  }));
}
if(rows.length!==20||rows.filter(row=>row.classification==='translated_linguistic_segment').length!==9)
  throw new Error('Unexpected classification totals');
const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===119&&terms.at(-1).term_id==='TE-T119';
if(!existingTerm&&(terms.length!==118||terms.at(-1).term_id!=='TE-T118'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T119',
  source_term:'Hilbert-type / axiomatic derivation / modus ponens / necessitation / derivability / soundness / completeness (normal modal logic)',
  telugu:'హిల్బర్ట్-రకం / స్వీకృతాధారిత వ్యుత్పత్తి / మోడస్ పోనెన్స్ / అవశ్యకీకరణ / వ్యుత్పాద్యత / నిర్దుష్టత / సంపూర్ణత (నార్మల్ మోడల్ తర్కం)',
  status:'native_formal_logic_derivation_inference_and_truth_register_attested_modal_axiomatic_system_and_necessitation_definition_controlled_provisional',
  passages:['TE-P018','TE-P019','TE-P024','TE-P032','TE-P033'],
  basis:'TE-P018లో ప్రతిజ్ఞావాక్యాత్మక తర్కం, TE-P019లో సత్యతావిలువ, TE-P024లో నియమాలతో ఫలిత వ్యుత్పత్తి, TE-P032లో నిగమనం/ఆగమనం, TE-P033లో అనుమానం అనే వాడుకలను స్థానిక చిత్రాల్లో నేరుగా చూశాం. అవి నార్మల్ మోడల్ తర్కం, హిల్బర్ట్-రకం వ్యవస్థ, మోడస్ పోనెన్స్ లేదా అవశ్యకీకరణకు ప్రత్యక్ష తెలుగు పేర్లను ఇవ్వవు. OLP-0427 శీర్షికలో పూర్వ స్వీకృతాధారిత రూపం, OLP-0428లోని MP/Nec నిర్దిష్ట నియమ వృక్షాలు, నాలుగు వ్యుత్పత్తి శాఖలు, K/Dual రక్షిత స్వీకృతాలు, పూర్వ TE-T034/035 మరియు మోడల్ ఎంపికలు ప్రత్యేక అర్థాలను నియంత్రిస్తాయి.',
  uncertainty:'వ్యుత్పత్తి, నిగమనం, అనుమానం సాధారణ పదజాలానికి స్థానిక ఆధారం ఉంది. అవశ్యకీకరణ, నిర్దుష్టత/సంపూర్ణత మోడల్ అధిసిద్ధాంత పేర్లు, స్వీకృతాధారిత మోడల్ వ్యవస్థ పదబంధం తాత్కాలిక సంపాదకీయ ఎంపికలు; నియమాల గణిత అర్థం ప్రదర్శిత పథకాల ద్వారా నిర్ణీతం.',
  borrowing:'హిల్బర్ట్ అనే మూల వ్యక్తినామం, మోడస్ పోనెన్స్ అనే స్పష్టంగా సందర్భీకరించిన నియమ పేరు; K, Dual, MP, Nec, Sigma, Box మరియు సూత్ర మెటాచరాలు రక్షిత గణిత సంకేతాలు.'
});
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...rows]);
console.log(JSON.stringify({units:expected.map(row=>row[0]),segments:rows.length,
  linguistic:9,structural:11,terms:terms.length}));
