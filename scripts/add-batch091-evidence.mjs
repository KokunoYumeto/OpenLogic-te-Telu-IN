import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),
  rows.map(JSON.stringify).join('\n')+'\n','utf8');
const manifest=new Map(jsonl('evidence/SOURCE_MANIFEST.jsonl').map(row=>[row.unit_id,row]));
const qa=new Map(JSON.parse(read('build/BATCH-091-STRUCTURAL-QA.json')).units.map(row=>[row.unit_id,row]));
const configs=[
  {id:'OLP-0441',order:441,path:'content/normal-modal-logic/completeness/completeness.tex',blocks:7,linguistic:1,
    passageMap:{4:['TE-P018']}},
  {id:'OLP-0442',order:442,path:'content/normal-modal-logic/completeness/introduction.tex',blocks:11,linguistic:6,
    passageMap:{5:['TE-P018'],6:['TE-P018','TE-P024'],7:['TE-P010','TE-P018'],
      8:['TE-P018','TE-P024','TE-P026'],9:['TE-P010','TE-P026'],10:['TE-P010','TE-P026']}}
];
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
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(row=>[row.passage_id,row]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const selected=new Set(configs.map(c=>c.id));
const previous=current.filter(row=>!selected.has(row.unit_id));
if(previous.length!==6688||![0,18].includes(current.length-previous.length))
  throw new Error('Unexpected segment cursor');
const newRows=[];
for(const c of configs){
  const unit=manifest.get(c.id),q=qa.get(c.id);
  const source=read('upstream/'+c.path),target=read('translation/'+c.path);
  if(!unit||unit.order!==c.order||unit.source_path!==c.path||
     Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
     !q||q.translation_sha256!==sha(target)||
     !q.paragraph_alignment||!q.structure_match||!q.token_parity||
     !q.protected_identifier_parity||!q.math_multiset_match||
     q.unicode_replacement_char||q.unpaired_surrogate)
    throw new Error('Frozen source or bounded QA mismatch '+c.id);
  const sb=blocksWithSpans(source),tb=blocksWithSpans(target);
  if(sb.length!==c.blocks||tb.length!==c.blocks)throw new Error('Block count mismatch '+c.id);
  const rows=sb.map((block,index)=>{
    const number=index+1,t=tb[index],linguistic=Object.hasOwn(c.passageMap,number);
    if(linguistic!==/[\u0C00-\u0C7F]/u.test(t.block))
      throw new Error('Misclassified language block '+c.id+' '+number);
    const canonPassages=(c.passageMap[number]??[]).map(id=>{
      const passage=canon.get(id);
      if(!passage)throw new Error('Missing consulted passage '+id);
      return {passage_id:id,source_sha256:passage.source_sha256,
        ...(passage.pdf_page?{pdf_page:passage.pdf_page}:{}),role:passage.role};
    });
    return {
      segment_id:c.id+'-B'+String(number).padStart(3,'0'),
      unit_id:c.id,source_path:c.path,
      source_unit_sha256:sha(source),translation_unit_sha256:sha(target),
      source_start_line:block.startLine,source_end_line:block.endLine,
      target_start_line:t.startLine,target_end_line:t.endLine,
      source_segment_sha256:sha(block.block),translation_segment_sha256:sha(t.block),
      classification:linguistic?'translated_linguistic_segment':'preserved_metadata_or_structural_segment',
      canon_passages:canonPassages,source_corrections:[],
      consultation_phase:linguistic?
        `${c.id}-B${String(number).padStart(3,'0')}లో స్థిర మూలం, తెలుగు లక్ష్యం, సూచించిన స్థానిక తర్కం/సంబంధం/అవైరుధ్య పేజీలను ఎదురెదురు చూశాం; సంపూర్ణత, ప్రతినమూనా, కానానికల్ నిర్మాణం మూల గణితం నుంచే.`:
        'not_applicable_nonlinguistic',
      evidence_limit:linguistic?
        'TE-P010 సాధారణ సంబంధం, TE-P018/024 సాధారణ తర్కం/వ్యుత్పత్తి, TE-P026 సాధారణ అవైరుధ్యాన్ని మాత్రమే చూపుతాయి. మోడల్ సంపూర్ణత, కానానికల్ నమూనా నిర్మాణం, truth lemma వాటిలో స్థాపించబడలేదు.':
        'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'
    };
  });
  if(rows.filter(row=>row.classification==='translated_linguistic_segment').length!==c.linguistic)
    throw new Error('Unexpected linguistic count '+c.id);
  newRows.push(...rows);
}
if(qa.size!==2||newRows.length!==18)throw new Error('Batch scope mismatch');
const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const existingTerm=terms.length===132&&terms.at(-1).term_id==='TE-T132';
if(!existingTerm&&(terms.length!==131||terms.at(-1).term_id!=='TE-T131'))
  throw new Error('Unexpected terminology cursor');
if(!existingTerm)terms.push({
  term_id:'TE-T132',
  source_term:'modal completeness / canonical model / countermodel / complete Sigma-consistent set / truth as membership',
  telugu:'మోడల్ సంపూర్ణత / కానానికల్ నమూనా / ప్రతినమూనా / సంపూర్ణ Sigma-అవిరుద్ధ సమితి / సమితి మూలకత్వంగా సత్యం',
  status:'native_general_relation_logic_derivation_and_consistency_register_attested_modal_canonical_completeness_source_controlled_provisional',
  passages:['TE-P010','TE-P018','TE-P024','TE-P026'],
  basis:'TE-P010లో సాధారణ సంబంధం, TE-P018లో ప్రతిజ్ఞావాక్య తర్కం, TE-P024లో నియమ-వ్యుత్పత్తి, ఈ బ్యాచ్‌లో తిరిగి చూసిన TE-P026లో సుసంగతత్వం/అసంగత ప్రత్యక్షం. TE-T034, TE-T131లోని సంపూర్ణత, అవైరుధ్యం, కానానికల్ పదరూపాలను కొనసాగించాం. K/KT/KD నిర్దుష్టత నుంచి ప్రతినమూనా దిశ, పూర్తి అవిరుద్ధ సమితుల ప్రపంచాలు, ప్రాప్యత, సభ్యత్వ-సత్య లక్ష్యం OLP-0441--0442 మూల గణితానికి కట్టబడి ఉన్నాయి.',
  uncertainty:'స్థానిక పేజీలు మోడల్ సంపూర్ణతా సిద్ధాంతాన్ని లేదా కానానికల్ నిర్మాణాన్ని నేరుగా నిరూపించవు. కానానికల్ అనేది తరువాతి మూల నిర్మాణంతో అర్థం స్థిరపడాల్సిన ఋణపదం; శీర్షిక, పరిచయం రెండింటిలోనూ ఒకే రూపం ఉంచాం. Sigma-సాపేక్ష నమూనా-సత్య పరిమితి TE-T131తో అనుగుణం.',
  borrowing:'కానానికల్ స్పష్టమైన సాంకేతిక ఋణపదం; K, KT, KD, Sigma, Box, Diamond, Gamma, A, B, C, M మరియు మోడల్ సంకేతాలు రక్షిత గణిత రూపాలు.'
});
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...previous,...newRows]);
console.log(JSON.stringify({units:configs.map(c=>c.id),segments:newRows.length,
  linguistic:newRows.filter(row=>row.classification==='translated_linguistic_segment').length,
  structural:newRows.filter(row=>row.classification==='preserved_metadata_or_structural_segment').length,
  terms:terms.length}));
