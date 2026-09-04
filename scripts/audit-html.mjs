import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const pages=process.argv.includes('--pages');
const receiptArg=process.argv.find(a=>a.startsWith('--receipt='));
if(process.argv.some(a=>a.startsWith('--')&&a!=='--pages'&&!a.startsWith('--receipt=')))throw new Error('Unknown option');
const dir=pages?path.join(root,'docs/sets'):path.join(root,'output/html/sets');
const read=name=>fs.readFileSync(path.join(dir,name));
const text=name=>read(name).toString('utf8');
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const count=(s,re)=>(s.match(re)??[]).length;
const assert=(ok,message)=>{if(!ok)throw new Error(message);};

const html=text('index.html'),css=text('reader.css'),manifest=JSON.parse(text('render-manifest.json'));
assert(manifest.schema==='openlogic-te-semantic-html/1','Wrong manifest schema');
assert(manifest.source_revision==='9620cc73f9c8e0ad003c514a5d3748f29611c4c0','Wrong source revision');
assert(sha(Buffer.from(html))===manifest.html_sha256,'HTML hash mismatch');
assert(manifest.units.length===7&&manifest.units.map(x=>x.unit_id).join(',')==='OLP-0004,OLP-0005,OLP-0006,OLP-0007,OLP-0008,OLP-0009,OLP-0010','Wrong unit coverage/order');
assert(manifest.units.reduce((n,u)=>n+u.aligned_blocks,0)===121,'Wrong aligned-block coverage');
assert(manifest.units.reduce((n,u)=>n+u.linguistic_blocks,0)===86,'Wrong linguistic-block coverage');
assert(manifest.units.every(u=>u.telugu_text_runs>0&&u.english_text_runs>0&&u.telugu_text_characters>0&&u.english_text_characters>0),'Missing text-run coverage');
assert(manifest.units.reduce((n,u)=>n+u.math_expressions,0)===327,'Wrong Telugu formula coverage');
assert(manifest.units.reduce((n,u)=>n+u.english_math_expressions,0)===327,'Wrong English formula coverage');
assert(manifest.units.every(u=>u.math_expressions===u.english_math_expressions),'Per-unit formula-count mismatch');
assert(manifest.math.length===327&&manifest.english_math.length===327,'Formula inventory mismatch');
assert(manifest.assets.length===3&&manifest.labels.length===14&&manifest.english_labels.length===14,'Asset/label inventory mismatch');
assert(manifest.references.length===5&&manifest.references.every(r=>r.resolved),'Unresolved Telugu reference');
assert(manifest.english_references.length===5&&manifest.english_references.every(r=>r.resolved),'Unresolved English reference');
assert(manifest.conditional_branches.length===2&&manifest.conditional_branches.every(c=>c.selected==='false'),'Unexpected Telugu conditional projection');
assert(manifest.english_conditional_branches.length===2&&manifest.english_conditional_branches.every(c=>c.selected==='false'),'Unexpected English conditional projection');

assert(/^<!doctype html>\n<html lang="te-Telu-IN">/.test(html),'Missing exact Telugu document language');
assert(count(html,/<section class="source-unit"/g)===7,'Wrong source-unit count');
assert(count(html,/<details class="english" lang="en">/g)===7,'Wrong canonical-English disclosure count');
assert(count(html,/<math\b/g)===654,'Wrong rendered MathML count');
assert(count(html,/<annotation encoding="application\/x-tex">/g)===654,'Wrong TeX annotation count');
assert(count(html,/<svg class="set-diagram" role="img"/g)===6,'Wrong accessible diagram count');
assert(!/<script\b|<iframe\b|<object\b|<embed\b|\son\w+\s*=|<merror\b|katex-error|\ufffd|!!|\\tecase\b/i.test(html),'Forbidden/unresolved output marker');
assert(!/@import\b|url\(\s*['"]?https?:|expression\s*\(/i.test(css),'CSS contains remote or executable dependency');
assert(css.includes('@media(max-width:640px)')&&css.includes('@media print'),'Responsive/print rules missing');
assert(count(html,/src="https?:/gi)===0&&count(html,/<link[^>]+href="https?:/gi)===0,'Remote runtime asset found');
assert(count(html,/[ఀ-౿]/g)>9000,'Unexpectedly little Telugu text');

const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
assert(new Set(ids).size===ids.length,'Duplicate HTML id');
const idSet=new Set(ids);
for(const match of html.matchAll(/\shref="#([^"]+)"/g))assert(idSet.has(decodeURIComponent(match[1])),'Broken internal link #'+match[1]);

const voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const stack=[];
for(const match of html.matchAll(/<\/?([a-z][\w:-]*)\b[^>]*>/gi)){
 const raw=match[0],tag=match[1].toLowerCase();
 if(raw.startsWith('</'))assert(stack.pop()===tag,'Unbalanced closing tag '+tag);
 else if(!voidTags.has(tag)&&!raw.endsWith('/>'))stack.push(tag);
}
assert(stack.length===0,'Unclosed tag '+stack.at(-1));

const required=['LICENSE.md','KATEX-LICENSE','fonts/NotoSerifTelugu-Regular.ttf','fonts/NotoSerifTelugu-Bold.ttf','fonts/OFL.txt'];
for(const name of required)assert(fs.statSync(path.join(dir,name)).size>0,'Missing local asset '+name);
const files=['index.html','reader.css','render-manifest.json',...required].map(name=>({name,bytes:read(name).length,sha256:sha(read(name))}));
const result={schema:'openlogic-te-html-deterministic-qa/1',generated_utc:new Date().toISOString(),scope:'Sets chapter, OLP-0004..OLP-0010',directory:pages?'docs/sets':'output/html/sets',units:7,aligned_blocks:121,linguistic_blocks:86,telugu_mathml:327,english_mathml:327,internal_references:10,accessible_svg_instances:6,telugu_code_points:count(html,/[ఀ-౿]/g),network_runtime_dependencies:0,toolchain:{node:process.version,package_lock_sha256:sha(fs.readFileSync(path.join(root,'package-lock.json'))),builder_sha256:sha(fs.readFileSync(path.join(root,'scripts/build-html.mjs'))),reader_sha256:sha(fs.readFileSync(path.join(root,'scripts/tex-reader.mjs'))),auditor_sha256:sha(fs.readFileSync(path.join(root,'scripts/audit-html.mjs')))},files,status:'pass'};
if(receiptArg){const target=path.resolve(receiptArg.slice(10));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result,null,2));
