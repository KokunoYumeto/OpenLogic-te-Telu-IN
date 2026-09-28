import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Reusable single-unit evidence writer. Batch-specific judgement and authority
// limits stay in a reviewed configuration file; this script only validates
// frozen bytes, bounded QA, alignment, and ledger cursors before writing.
const root=path.resolve(import.meta.dirname,'..');
const configPath=process.argv[2];
if(!configPath||!/^scripts\/batch-\d{3}-evidence\.json$/u.test(configPath))
  throw new Error('Expected scripts/batch-NNN-evidence.json');
const c=JSON.parse(fs.readFileSync(path.join(root,configPath),'utf8'));
if(c.schema!=='openlogic-te-single-unit-evidence-config/1')throw new Error('Bad evidence config schema');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const writeJsonl=(file,rows)=>fs.writeFileSync(path.join(root,file),rows.map(JSON.stringify).join('\n')+'\n','utf8');
const manifest=jsonl('evidence/SOURCE_MANIFEST.jsonl');
const unit=manifest.find(x=>x.unit_id===c.unit_id);
const source=read('upstream/'+c.source_path),target=read('translation/'+c.source_path);
const qa=JSON.parse(read('build/BATCH-'+c.batch+'-STRUCTURAL-QA.json')).units;
if(!unit||unit.order!==c.unit_order||unit.source_path!==c.source_path||
   Buffer.byteLength(source)!==unit.source_bytes||sha(source)!==unit.source_sha256||
   qa.length!==1||qa[0].unit_id!==unit.unit_id||qa[0].translation_sha256!==sha(target)||
   !qa[0].paragraph_alignment||!qa[0].structure_match||!qa[0].token_parity||
   !qa[0].protected_identifier_parity||!qa[0].math_multiset_match||
   qa[0].unicode_replacement_char||qa[0].unpaired_surrogate)
  throw new Error('Frozen source or bounded QA mismatch');
function blocksWithSpans(raw){
  const normalized=raw.replace(/\r\n/gu,'\n'),blocks=normalized.trim().split(/\n\s*\n/u);
  let cursor=0;
  return blocks.map(block=>{const start=normalized.indexOf(block,cursor);
    if(start<0)throw new Error('Could not locate aligned block');
    const startLine=normalized.slice(0,start).split('\n').length;
    cursor=start+block.length;
    return {block,startLine,endLine:startLine+block.split('\n').length-1};});
}
const sb=blocksWithSpans(source),tb=blocksWithSpans(target);
if(sb.length!==c.blocks||tb.length!==c.blocks)throw new Error('Block count mismatch');
const linguistic=new Set(c.linguistic_blocks);
if(linguistic.size!==c.linguistic_blocks.length||
   [...linguistic].some(n=>!Number.isInteger(n)||n<1||n>c.blocks))
  throw new Error('Bad linguistic block map');
const canon=new Map(jsonl('evidence/CANON_PASSAGES.jsonl').map(x=>[x.passage_id,x]));
const current=jsonl('evidence/SEGMENT_CANON_USE.jsonl');
const ownSegments=current.filter(x=>x.unit_id===unit.unit_id);
const existingSegments=ownSegments.length===c.blocks;
const prior=current.slice(0,c.previous_segments);
const later=existingSegments?current.slice(c.previous_segments+c.blocks):[];
const orderById=new Map(manifest.map(row=>[row.unit_id,row.order]));
if(![0,c.blocks].includes(ownSegments.length)||
   prior.length!==c.previous_segments||
   prior.at(-1)?.unit_id!=='OLP-'+String(c.unit_order-1).padStart(4,'0')||
   (existingSegments&&(!current.slice(c.previous_segments,c.previous_segments+c.blocks)
     .every(x=>x.unit_id===unit.unit_id)||
     later.some(x=>(orderById.get(x.unit_id)??0)<=c.unit_order)))||
   (!existingSegments&&current.length!==c.previous_segments))
  throw new Error('Unexpected segment cursor');
const rows=sb.map((block,index)=>{const n=index+1,t=tb[index],isLinguistic=linguistic.has(n);
  if(isLinguistic!==/[\u0C00-\u0C7F]/u.test(t.block))throw new Error('Misclassified block '+n);
  const ids=isLinguistic?(c.canon_by_block?.[n]??c.canon_default):[];
  if(isLinguistic&&(!Array.isArray(ids)||!ids.length))throw new Error('Missing canon consultation '+n);
  const canonPassages=ids.map(id=>{const p=canon.get(id);
    if(!p)throw new Error('Missing consulted passage '+id);
    return {passage_id:id,source_sha256:p.source_sha256,...(p.pdf_page?{pdf_page:p.pdf_page}:{}),role:p.role};});
  return {segment_id:unit.unit_id+'-B'+String(n).padStart(3,'0'),unit_id:unit.unit_id,
    source_path:unit.source_path,source_unit_sha256:sha(source),translation_unit_sha256:sha(target),
    source_start_line:block.startLine,source_end_line:block.endLine,
    target_start_line:t.startLine,target_end_line:t.endLine,
    source_segment_sha256:sha(block.block),translation_segment_sha256:sha(t.block),
    classification:isLinguistic?'translated_linguistic_segment':'preserved_metadata_or_structural_segment',
    canon_passages:canonPassages,source_corrections:c.corrections_by_block?.[n]??[],
    consultation_phase:isLinguistic?`${unit.unit_id}-B${String(n).padStart(3,'0')}: ${c.consultation_phase}`:'not_applicable_nonlinguistic',
    evidence_limit:isLinguistic?c.evidence_limit:'వాక్యేతర TeX వ్యాఖ్య లేదా నిర్మాణం మాత్రమే; పాఠక శీర్షిక ఇందులో దాచలేదు.'};});
const termsPath='evidence/TERM_DECISIONS.jsonl',terms=jsonl(termsPath);
const term=c.term_decision;
if(term.term_id!=='TE-T'+String(c.previous_terms+1).padStart(3,'0'))throw new Error('Unexpected term ID');
const existing=terms.length>c.previous_terms&&terms[c.previous_terms]?.term_id===term.term_id;
if(!existing&&(terms.length!==c.previous_terms||
   terms.at(-1)?.term_id!=='TE-T'+String(c.previous_terms).padStart(3,'0')))
  throw new Error('Unexpected terminology cursor');
if(existing)terms[c.previous_terms]=term;
else terms.push(term);
const corrections=jsonl('evidence/SOURCE_CORRECTIONS.jsonl');
const own=corrections.filter(x=>x.unit_id===unit.unit_id);
const declared=Object.values(c.corrections_by_block??{}).flat().sort();
if(corrections.length<c.expected_corrections||
   corrections.slice(c.expected_corrections).some(x=>(orderById.get(x.unit_id)??0)<=c.unit_order)||
   JSON.stringify(own.map(x=>x.finding_id).sort())!==JSON.stringify(declared))
  throw new Error('Correction ledger or block map mismatch');
const proofGaps=new Set(c.proof_gap_ids??[]);
if(proofGaps.size!==(c.proof_gap_ids??[]).length||
   [...proofGaps].some(id=>!declared.includes(id)))
  throw new Error('Bad disclosed source-proof-gap map');
writeJsonl('evidence/SOURCE_CORRECTIONS.jsonl',corrections.map(x=>x.unit_id===unit.unit_id?
  {...x,status:proofGaps.has(x.finding_id)?'source_proof_gap_disclosed_structural_qa_pass':'applied_qa_pass'}:x));
writeJsonl(termsPath,terms);
writeJsonl('evidence/SEGMENT_CANON_USE.jsonl',[...prior,...rows,...later]);
console.log(JSON.stringify({unit:unit.unit_id,target_sha256:sha(target),segments:rows.length,
  linguistic:linguistic.size,structural:rows.length-linguistic.size,terms:terms.length,corrections:corrections.length}));
