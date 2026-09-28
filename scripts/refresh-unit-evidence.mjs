// Rebind one existing aligned ledger unit after a target-only prose correction.
// Refuse altered alignment or an unexpected baseline: the semantic evidence is
// preserved, not regenerated or invented by this mechanical hash refresh.
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const id=process.argv[2];
const expectedChanged=new Set((process.argv[3]??'').split(',').filter(Boolean).map(value=>`${id}-${value}`));
if(process.argv.length!==4||!/^OLP-\d{4}$/.test(id)||!expectedChanged.size)throw new Error('Usage: node scripts/refresh-unit-evidence.mjs OLP-0052 B006,B010');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const manifestPath=path.join(root,'evidence/SOURCE_MANIFEST.jsonl');
const ledgerPath=path.join(root,'evidence/SEGMENT_CANON_USE.jsonl');
const manifest=fs.readFileSync(manifestPath,'utf8').trim().split(/\r?\n/u).map(JSON.parse);
const unit=manifest.find(row=>row.unit_id===id);
if(!unit)throw new Error('Unknown source unit');
const relative=`translation/${unit.source_path}`;
const before=execFileSync('git',['-C',root,'show',`HEAD:${relative}`]);
const after=fs.readFileSync(path.join(root,relative));
if(before.equals(after))throw new Error('Target file has not changed');
const rows=fs.readFileSync(ledgerPath,'utf8').trim().split(/\r?\n/u).map(JSON.parse);
const selected=rows.filter(row=>row.unit_id===id);
function blocks(raw){
  const value=raw.toString('utf8').replace(/\r\n/gu,'\n');
  const pieces=value.trim().split(/\n\s*\n/u);
  let cursor=0;
  return pieces.map(block=>{
    const start=value.indexOf(block,cursor);
    if(start<0)throw new Error('Aligned block disappeared');
    cursor=start+block.length;
    const startLine=value.slice(0,start).split('\n').length;
    return {block,startLine,endLine:startLine+block.split('\n').length-1};
  });
}
const oldBlocks=blocks(before),newBlocks=blocks(after);
if(selected.length!==oldBlocks.length||oldBlocks.length!==newBlocks.length)throw new Error('Block alignment changed');
const changed=new Set();
for(const [index,row] of selected.entries()){
  const old=oldBlocks[index],current=newBlocks[index];
  const expected=`${id}-B${String(index+1).padStart(3,'0')}`;
  if(row.segment_id!==expected||row.translation_unit_sha256!==sha(before)
      ||row.translation_segment_sha256!==sha(old.block)
      ||row.target_start_line!==old.startLine||row.target_end_line!==old.endLine)
    throw new Error('Ledger baseline differs at '+expected);
  if(old.block!==current.block)changed.add(expected);
  row.translation_unit_sha256=sha(after);
  row.translation_segment_sha256=sha(current.block);
  row.target_start_line=current.startLine;
  row.target_end_line=current.endLine;
  if(row.classification==='translated_linguistic_segment'&&!/[\u0c00-\u0c7f]/u.test(current.block))
    throw new Error('Linguistic block lost Telugu text at '+expected);
}
if(changed.size!==expectedChanged.size||[...changed].some(value=>!expectedChanged.has(value)))
  throw new Error(`Changed blocks differ: ${[...changed].join(',')}`);
fs.writeFileSync(ledgerPath,rows.map(JSON.stringify).join('\n')+'\n','utf8');
console.log(JSON.stringify({unit_id:id,changed_blocks:[...changed],segments:selected.length,target_sha256:sha(after)}));
