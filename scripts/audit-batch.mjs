import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = path.resolve(import.meta.dirname,'..');
const state = path.join(root,'evidence');
fs.mkdirSync(path.join(root,'build'),{recursive:true});
const first = Number(process.argv[2] ?? 4), last = Number(process.argv[3] ?? 10);
const batch = process.argv[4] ?? '001';
if(!Number.isInteger(first)||!Number.isInteger(last)||first<1||last>722||!/^\d{3}$/.test(batch))throw new Error('Invalid bounded batch');
const manifest = fs.readFileSync(path.join(state,'SOURCE_MANIFEST.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const correctionsPath=path.join(state,'SOURCE_CORRECTIONS.jsonl');
const corrections=fs.existsSync(correctionsPath)?fs.readFileSync(correctionsPath,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse):[];
const sha = x=>crypto.createHash('sha256').update(x).digest('hex');
const matches = (s,re)=>[...s.matchAll(re)].map(m=>m[0]);
const counts = a=>Object.fromEntries([...new Set(a)].sort().map(x=>[x,a.filter(y=>y===x).length]));
const same = (a,b)=>JSON.stringify(a)===JSON.stringify(b);
const stripText=s=>{
 let out='',i=0;
 while(i<s.length){
  if(s.startsWith('\\text{',i)||s.startsWith('\\intertext{',i)){
   const inter=s.startsWith('\\intertext{',i);
   i+=inter?11:6;let depth=1,start=i;
   while(i<s.length&&depth){if(s[i]==='{')depth++;else if(s[i]==='}')depth--;i++;}
   if(inter)out+=matches(s.slice(start,i-1),/\$[^$]*\$/g).sort().join('');
  }else out+=s[i++];
 }
 return out;
};
const protectedIds=s=>{
 const arity={olfileid:3,olchapter:2,ollabel:1,olref:1,oliflabeldef:1,olimport:1,olasset:1,label:1,ref:1,cite:1,citeyear:1,documentclass:1};
 const ids=[];
 for(const m of s.matchAll(/\\(olfileid|olchapter|ollabel|olref|oliflabeldef|olimport|olasset|label|ref|citeyear|cite|documentclass)(?![a-zA-Z])/g)){
  let at=m.index+m[0].length,token=m[0];
  const skip=()=>{while(/\s/.test(s[at]??'')&&at<s.length)at++;};
  skip();while(s[at]==='['){const end=s.indexOf(']',at);if(end<0)throw new Error('Unclosed option');token+=s.slice(at,end+1);at=end+1;skip();}
  for(let n=0;n<arity[m[1]];n++){if(s[at]!=='{')throw new Error('Missing ID argument');let start=at,depth=0;do{if(s[at]==='{')depth++;else if(s[at]==='}')depth--;at++;}while(depth&&at<s.length);token+=s.slice(start,at);skip();}
  ids.push(token);
 }
 return ids;
};
const blocks = s=>s.replace(/\r\n/g,'\n').trim().split(/\n\s*\n/);
const stripCorrections=s=>{
 let out='',at=0,ids=[];
 while(at<s.length){
  const start=s.indexOf('\\sourcecorrection',at);
  if(start<0){out+=s.slice(at);break;}
  out+=s.slice(at,start);let p=start+'\\sourcecorrection'.length;
  const take=()=>{while(/\s/.test(s[p]??''))p++;if(s[p]!=='{')throw new Error('Malformed source correction');let begin=++p,depth=1;while(p<s.length&&depth){if(s[p]==='{')depth++;else if(s[p]==='}')depth--;p++;}if(depth)throw new Error('Unclosed source correction');return s.slice(begin,p-1);};
  const id=take();take();ids.push(id);at=p;
 }
 return {core:out,ids};
};
const multisetDelta=(a,b)=>{
 const ca=counts(a),cb=counts(b),out=[];
 for(const key of Object.keys(ca).sort())for(let i=0;i<Math.max(0,ca[key]-(cb[key]??0));i++)out.push(key);
 return out;
};
const output=[];
for (const unit of manifest.filter(u=>u.order>=first&&u.order<=last)) {
 const s=fs.readFileSync(path.join(root,'upstream',unit.source_path),'utf8');
 if(sha(s)!==unit.source_sha256)throw new Error('Frozen source hash mismatch: '+unit.unit_id);
 const target=path.join(root,'translation',unit.source_path);
 const t=fs.readFileSync(target,'utf8');
 const stripped=stripCorrections(t);
 const declared=corrections.filter(c=>c.unit_id===unit.unit_id);
 if(!same([...stripped.ids].sort(),declared.map(c=>c.finding_id).sort()))throw new Error('Source correction ID mismatch '+unit.unit_id);
 const sb=blocks(s),tb=blocks(t);
 const ids= /\\(?:olfileid|ollabel|olref|oliflabeldef|olimport|olasset|label|ref|cite\w*)\s*(?:\[[^\]]*\])*\s*\{[^{}]*\}(?:\{[^{}]*\})*/g;
 const structural=/\\(?:begin|end)\{[^{}]*\}/g;
 const tokens=/!!\^?a?\{[^{}]+\}s?/g;
 // Target-language prose can move around math, so compare the multiset of
 // math atoms, separately auditing whole display formulas and text clauses.
 const mathRe=/\$[^$]*\$|\\\[[\s\S]*?\\\]|\\begin\{(?:align\*?|multline\*?)\}[\s\S]*?\\end\{(?:align\*?|multline\*?)\}/g;
 const math = text=>matches(text,mathRe).map(x=>stripText(x).replace(/\s/g,''));
 const sm=math(s),tm=math(stripped.core);
 const sourceOnly=multisetDelta(sm,tm),targetOnly=multisetDelta(tm,sm);
 const expectedSourceOnly=declared.flatMap(c=>c.expected_core_math_delta.source_only).sort();
 const expectedTargetOnly=declared.flatMap(c=>c.expected_core_math_delta.target_only).sort();
 const record={unit_id:unit.unit_id,source_path:unit.source_path,source_sha256:sha(Buffer.from(s)),translation_sha256:sha(Buffer.from(t)),source_blocks:sb.length,target_blocks:tb.length,paragraph_alignment:sb.length===tb.length,structure_match:same(counts(matches(s,structural)),counts(matches(t,structural))),identifiers_source:matches(s,ids),identifiers_target:matches(t,ids),tokens_source:counts(matches(s,tokens)),tokens_target:counts(matches(t,tokens)),math_source:sm,math_target_core:tm,math_exact_multiset_match:same(counts(sm),counts(tm)),math_delta_source_only:sourceOnly,math_delta_target_only:targetOnly,declared_source_correction_ids:stripped.ids,math_declared_source_correction_match:same(sourceOnly,expectedSourceOnly)&&same(targetOnly,expectedTargetOnly),math_multiset_match:same(counts(sm),counts(tm))||(declared.length>0&&same(sourceOnly,expectedSourceOnly)&&same(targetOnly,expectedTargetOnly)),telugu_chars:matches(t,/[\u0C00-\u0C7F]/g).length,unicode_replacement_char:t.includes('\uFFFD'),unpaired_surrogate:/[\uD800-\uDFFF]/u.test(t),blocks:sb.map((b,i)=>({index:i+1,source_start:b.slice(0,110),target_start:tb[i]?.slice(0,110)}))};
 record.token_parity=same(record.tokens_source,record.tokens_target);
 record.protected_source=protectedIds(s);record.protected_target=protectedIds(t);
 record.protected_identifier_parity=same(record.protected_source,record.protected_target);
 output.push(record);
}
fs.writeFileSync(path.join(root,'build','BATCH-'+batch+'-STRUCTURAL-QA.json'),JSON.stringify({schema:'telugu-openlogic-batch-qa/1',generated_utc:new Date().toISOString(),note:'Diagnostic, not semantic proof or release acceptance. All mismatches require adjudication. Intertext prose is masked while its inline math remains checked.',units:output},null,2)+'\n');
for(const r of output) console.log(JSON.stringify({unit:r.unit_id,blocks:[r.source_blocks,r.target_blocks],structure:r.structure_match,tokens:r.token_parity,identifiers:r.protected_identifier_parity,math:r.math_multiset_match}));
for(const r of output.filter(x=>!x.paragraph_alignment)) console.log(JSON.stringify({unit:r.unit_id,blocks:r.blocks}));
if(output.length!==last-first+1||output.some(r=>!r.paragraph_alignment||!r.structure_match||!r.token_parity||!r.protected_identifier_parity||!r.math_multiset_match||r.unicode_replacement_char||r.unpaired_surrogate))throw new Error('Structural QA failed');
