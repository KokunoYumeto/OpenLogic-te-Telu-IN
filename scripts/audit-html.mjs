import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const pages=process.argv.includes('--pages');
const scopeArg=process.argv.find(a=>a.startsWith('--scope='));
const receiptArg=process.argv.find(a=>a.startsWith('--receipt='));
if(process.argv.some(a=>a.startsWith('--')&&a!=='--pages'&&!a.startsWith('--scope=')&&!a.startsWith('--receipt=')))throw new Error('Unknown option');
const scope=scopeArg?.slice('--scope='.length)??'sets';
const profiles={
 sets:{start:4,end:10,slug:'sets',label:'Sets chapter, OLP-0004..OLP-0010',expectedAssets:3},
 sfr:{start:4,end:26,slug:'sfr',label:'Sets, Relations, and Functions chapters, OLP-0004..OLP-0026',expectedAssets:11}
};
const profile=profiles[scope];
if(!profile)throw new Error('Unknown scope '+scope);
const dir=pages?path.join(root,'docs',profile.slug):path.join(root,'output/html',profile.slug);
const read=name=>fs.readFileSync(path.join(dir,name));
const text=name=>read(name).toString('utf8');
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const count=(s,re)=>(s.match(re)??[]).length;
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const jsonl=name=>fs.readFileSync(path.join(root,'evidence',name),'utf8').trim().split(/\r?\n/u).map(JSON.parse);
const sourceManifest=jsonl('SOURCE_MANIFEST.jsonl').filter(row=>row.order>=profile.start&&row.order<=profile.end);
const segmentLedger=jsonl('SEGMENT_CANON_USE.jsonl').filter(row=>{
 const number=Number(row.unit_id.slice(4));return number>=profile.start&&number<=profile.end;
});
const expectedIds=sourceManifest.map(row=>row.unit_id);

const html=text('index.html'),css=text('reader.css'),manifest=JSON.parse(text('render-manifest.json'));
assert(manifest.schema==='openlogic-te-semantic-html/1','Wrong manifest schema');
assert(manifest.source_revision==='9620cc73f9c8e0ad003c514a5d3748f29611c4c0','Wrong source revision');
assert(sha(Buffer.from(html))===manifest.html_sha256,'HTML hash mismatch');
assert(scope==='sets'?[undefined,'sets'].includes(manifest.profile):manifest.profile===scope,'Wrong reader profile');
assert(manifest.units.length===expectedIds.length&&manifest.units.map(row=>row.unit_id).join(',')===expectedIds.join(','),'Wrong unit coverage/order');
assert(manifest.units.reduce((sum,row)=>sum+row.aligned_blocks,0)===segmentLedger.length,'Wrong aligned-block coverage');
assert(manifest.units.reduce((sum,row)=>sum+row.linguistic_blocks,0)===segmentLedger.filter(row=>row.classification==='translated_linguistic_segment').length,'Wrong linguistic-block coverage');
assert(manifest.units.every(row=>row.telugu_text_runs>0&&row.english_text_runs>0&&row.telugu_text_characters>0&&row.english_text_characters>0),'Missing text-run coverage');
for(const [index,unit] of manifest.units.entries()){
 const source=sourceManifest[index];
 assert(unit.source_path===source.source_path&&unit.source_sha256===source.source_sha256,'Source identity mismatch '+unit.unit_id);
 assert(sha(fs.readFileSync(path.join(root,'upstream',source.source_path)))===source.source_sha256,'Frozen source bytes changed '+unit.unit_id);
 assert(sha(fs.readFileSync(path.join(root,'translation',source.source_path)))===unit.translation_sha256,'Translation bytes changed '+unit.unit_id);
 const segments=segmentLedger.filter(row=>row.unit_id===unit.unit_id);
 assert(segments.length===unit.aligned_blocks&&segments.every(row=>row.translation_unit_sha256===unit.translation_sha256),'Segment crosswalk mismatch '+unit.unit_id);
}
const teluguMath=manifest.units.reduce((sum,row)=>sum+row.math_expressions,0);
const englishMath=manifest.units.reduce((sum,row)=>sum+row.english_math_expressions,0);
assert(manifest.math.length===teluguMath&&manifest.english_math.length===englishMath,'Formula inventory mismatch');
assert(manifest.assets.length===profile.expectedAssets,'Asset inventory mismatch');
assert(manifest.references.length===manifest.english_references.length&&manifest.references.every(row=>row.resolved)&&manifest.english_references.every(row=>row.resolved),'Unresolved reference');
assert(manifest.conditional_branches.length===manifest.english_conditional_branches.length,'Conditional projection count mismatch');
assert(manifest.conditional_branches.every(row=>['true','false'].includes(row.selected))&&manifest.english_conditional_branches.every(row=>['true','false'].includes(row.selected)),'Invalid conditional projection');

assert(/^<!doctype html>\n<html lang="te-Telu-IN">/.test(html),'Missing exact Telugu document language');
assert(count(html,/<section class="source-unit"/g)===expectedIds.length,'Wrong source-unit count');
assert(count(html,/<details class="english" lang="en">/g)===expectedIds.length,'Wrong canonical-English disclosure count');
assert(count(html,/<math\b/g)===teluguMath+englishMath,'Wrong rendered MathML count');
assert(count(html,/<annotation encoding="application\/x-tex">/g)===teluguMath+englishMath,'Wrong TeX annotation count');
assert(count(html,/<svg class="set-diagram" role="img"/g)===6,'Wrong inline SVG count');
const compiledAssets=manifest.assets.filter(row=>row.svg_path);
assert(count(html,/<img class="reader-diagram"/g)===compiledAssets.length*2,'Wrong compiled SVG instance count');
assert([...html.matchAll(/<img class="reader-diagram"[^>]*>/g)].every(match=>/\salt="[^"]+"/.test(match[0])),'Diagram alternative text missing');
assert(!/<script\b|<iframe\b|<object\b|<embed\b|\son\w+\s*=|<merror\b|katex-error|\ufffd|!!|\\tecase\b/i.test(html),'Forbidden/unresolved output marker');
assert(!/@import\b|url\(\s*['"]?https?:|expression\s*\(/i.test(css),'CSS contains remote or executable dependency');
assert(css.includes('@media(max-width:640px)')&&css.includes('@media print'),'Responsive/print rules missing');
assert(count(html,/src="https?:/gi)===0&&count(html,/<link[^>]+href="https?:/gi)===0,'Remote runtime asset found');
assert(count(html,/[ఀ-౿]/g)>(scope==='sets'?9000:25000),'Unexpectedly little Telugu text');

const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
assert(new Set(ids).size===ids.length,'Duplicate HTML id');
const idSet=new Set(ids);
for(const match of html.matchAll(/\shref="#([^"]+)"/g))assert(idSet.has(decodeURIComponent(match[1])),'Broken internal link #'+match[1]);
const citationLinks=[...html.matchAll(/<a class="citation"[^>]*data-citation-key="([^"]+)"[^>]*href="#([^"]+)"/g)];
assert(new Set(citationLinks.map(match=>match[1])).size===manifest.citation_keys.length,'Citation-key coverage mismatch');
assert(citationLinks.every(match=>idSet.has(decodeURIComponent(match[2]))),'Broken bibliography citation');

const voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const stack=[];
for(const match of html.matchAll(/<\/?([a-z][\w:-]*)\b[^>]*>/gi)){
 const raw=match[0],tag=match[1].toLowerCase();
 if(raw.startsWith('</'))assert(stack.pop()===tag,'Unbalanced closing tag '+tag);
 else if(!voidTags.has(tag)&&!raw.endsWith('/>'))stack.push(tag);
}
assert(stack.length===0,'Unclosed tag '+stack.at(-1));

const required=['LICENSE.md','KATEX-LICENSE','fonts/NotoSerifTelugu-Regular.ttf','fonts/NotoSerifTelugu-Bold.ttf','fonts/OFL.txt'];
for(const record of compiledAssets){
 const name='assets/diagrams/'+path.basename(record.svg_path);required.push(name);
 assert(sha(read(name))===record.svg_sha256,'Compiled SVG digest mismatch '+name);
}
for(const name of required)assert(fs.statSync(path.join(dir,name)).size>0,'Missing local asset '+name);
for(const match of html.matchAll(/\ssrc="([^"]+)"/g))assert(fs.existsSync(path.join(dir,match[1]))&&fs.statSync(path.join(dir,match[1])).isFile(),'Broken local source '+match[1]);
const fileNames=[];
function collect(directory,prefix=''){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
  const relative=prefix?prefix+'/'+entry.name:entry.name,absolute=path.join(directory,entry.name);
  if(entry.isDirectory())collect(absolute,relative);else fileNames.push(relative);
 }
}
collect(dir);
const files=fileNames.map(name=>({name,bytes:read(name).length,sha256:sha(read(name))}));
const result={schema:'openlogic-te-html-deterministic-qa/2',generated_utc:new Date().toISOString(),scope:profile.label,directory:(pages?'docs/':'output/html/')+profile.slug,units:expectedIds.length,aligned_blocks:segmentLedger.length,linguistic_blocks:segmentLedger.filter(row=>row.classification==='translated_linguistic_segment').length,telugu_mathml:teluguMath,english_mathml:englishMath,internal_references:manifest.references.length+manifest.english_references.length,citation_keys:manifest.citation_keys.length,inline_svg_instances:6,compiled_svg_instances:compiledAssets.length*2,telugu_code_points:count(html,/[ఀ-౿]/g),network_runtime_dependencies:0,toolchain:{node:process.version,package_lock_sha256:sha(fs.readFileSync(path.join(root,'package-lock.json'))),builder_sha256:sha(fs.readFileSync(path.join(root,'scripts/build-html.mjs'))),reader_sha256:sha(fs.readFileSync(path.join(root,'scripts/tex-reader.mjs'))),auditor_sha256:sha(fs.readFileSync(path.join(root,'scripts/audit-html.mjs')))},files,status:'COMPLETE_PASS'};
if(receiptArg){const target=path.resolve(receiptArg.slice(10));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result,null,2));
