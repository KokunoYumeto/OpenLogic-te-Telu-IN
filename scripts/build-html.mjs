import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {parseTex,realizeTokens,Reader,escapeHtml} from './tex-reader.mjs';
const root=path.resolve(import.meta.dirname,'..');
const publishPages=process.argv.includes('--pages');
if(process.argv.some(a=>a.startsWith('--')&&a!=='--pages'))throw new Error('Unknown option');
const out=publishPages?path.join(root,'docs/sets'):path.join(root,'output/html/sets');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const jsonl=name=>fs.readFileSync(path.join(root,'evidence',name),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const manifest=jsonl('SOURCE_MANIFEST.jsonl').filter(u=>u.order>=4&&u.order<=10);
if(manifest.length!==7)throw new Error('Missing chapter units');
const ledger=jsonl('SEGMENT_CANON_USE.jsonl');
const assetsUsed=new Map();
const colors={oldiagcolorA:'#262626',oldiagcolorB:'#21599e',oldiagcolorC:'#ad303f'};
function diagram(relative,language){
 if(!/^assets\/diagrams\/(union|intersection|difference)\.tikz$/.test(relative))throw new Error('Unapproved diagram '+relative);
 const source=fs.readFileSync(path.join(root,'upstream',relative),'utf8');
 const cleaned=source.replace(/%[^\n]*/g,'');
 const paths=[...cleaned.matchAll(/\\path\[([^\]]+)\]([\s\S]*?);/g)];
 if(!paths.length)throw new Error('No diagram paths');
 const svg=paths.map(([,style,geometry])=>{
  const color=/draw=(\w+)/.exec(style)?.[1],width=/width=([\d.]+)pt/.exec(style)?.[1];
  if(!colors[color]||!width)throw new Error('Unknown diagram style');
  const tokens=[...geometry.matchAll(/\(([-\d.]+),([-\d.]+)\)|\.\.\s*controls|--\s*cycle|--|\.\.|and/g)];
  let residue=geometry;for(const t of tokens)residue=residue.replace(t[0],'');
  if(residue.trim())throw new Error('Unconverted diagram geometry '+residue);
  let d='',begun=false,control=[];
  for(let i=0;i<tokens.length;i++){
   const t=tokens[i];
   if(t[0].startsWith('..')&&t[0].includes('controls')){
    const p=tokens[++i],and=tokens[++i],q=tokens[++i],dots=tokens[++i],r=tokens[++i];
    if(!p?.[1]||and?.[0]!=='and'||!q?.[1]||dots?.[0]!=='..'||!r?.[1])throw new Error('Malformed Bezier path');
    d+=' C '+p[1]+','+p[2]+' '+q[1]+','+q[2]+' '+r[1]+','+r[2];continue;
   }
   if(t[0].includes('cycle')){d+=' Z';begun=false;continue;}
   if(t[0]==='--')continue;
   if(t[1]){d+=(begun?' L ':' M ')+t[1]+','+t[2];begun=true;continue;}
   throw new Error('Unknown path token '+t[0]);
  }
  return '<path d="'+d.trim()+'" stroke="'+colors[color]+'" stroke-width="'+width+'" fill="none"/>';
 }).join('');
 const name=path.basename(relative,'.tikz');
 assetsUsed.set(relative,{source_path:relative,source_sha256:sha(source),paths:paths.length,conversion:'Exact source Bezier/control/line coordinates and stroke styles; native downward SVG y axis matches original TikZ negative y scale.'});
 const labels=language==='te'?{union:'రెండు సమితుల సమ్మేళనం: రెండు ఆకృతుల లోపలి ప్రాంతమంతా గుర్తించబడింది.',intersection:'రెండు సమితుల ఛేదనం: రెండు ఆకృతుల ఉమ్మడి ప్రాంతం మాత్రమే గుర్తించబడింది.',difference:'మొదటి సమితి నుంచి రెండో సమితిని తీసివేసిన భేదం: మొదటి ఆకృతిలో మాత్రమే ఉన్న ప్రాంతం గుర్తించబడింది.'}:{union:'Union: the whole region inside either of the two shapes is marked.',intersection:'Intersection: only the common region of both shapes is marked.',difference:'Difference: only the portion of the first shape outside the second shape is marked.'};
 return '<svg class="set-diagram" role="img" aria-label="'+escapeHtml(labels[name])+'" viewBox="-3 -3 289 237" xmlns="http://www.w3.org/2000/svg"><title>'+escapeHtml(labels[name])+'</title>'+svg+'</svg>';
}
const units=manifest.map(u=>{
 const en=fs.readFileSync(path.join(root,'upstream',u.source_path),'utf8'),te=fs.readFileSync(path.join(root,'translation',u.source_path),'utf8');
 if(sha(en)!==u.source_sha256)throw new Error('Source bytes changed '+u.unit_id);
 const segments=ledger.filter(s=>s.unit_id===u.unit_id);
 if(!segments.length||segments.some(s=>s.translation_unit_sha256!==sha(te)))throw new Error('Stale segment alignment '+u.unit_id);
 const realizedTe=realizeTokens(te),realizedEn=realizeTokens(en,'en');
 if(realizedTe.includes('!!')||realizedEn.includes('!!'))throw new Error('Unresolved text token');
 return {...u,en,te,segments,astTe:parseTex(realizedTe),astEn:parseTex(realizedEn)};
});
const labels=new Map(),enLabels=new Map();
const collector=new Reader({assets:diagram,labels,collect:true}),enCollector=new Reader({language:'en',assets:diagram,labels:enLabels,collect:true,prefix:'en-'});
for(const u of units){collector.renderNodes(u.astTe);enCollector.renderNodes(u.astEn);}
const reader=new Reader({assets:diagram,labels}),english=new Reader({language:'en',assets:diagram,labels:enLabels,prefix:'en-'});
const unitRecords=[],sections=[];
for(const u of units){
 const m=reader.math.length,em=english.math.length,tr=reader.textRuns.length,etr=english.textRuns.length,fn=reader.footnotes.length,efn=english.footnotes.length;
 const commandBefore={...reader.commands},englishCommandBefore={...english.commands};
 let body=reader.renderNodes(u.astTe),source=english.renderNodes(u.astEn);
 const notes=reader.footnotes.slice(fn),englishNotes=english.footnotes.slice(efn);
 if(notes.length)body+='<section class="footnotes" aria-label="పాదసూచికలు"><ol start="'+notes[0].number+'">'+notes.map(n=>'<li id="'+escapeHtml(n.id)+'">'+n.html+' <a class="footnote-back" href="#'+encodeURIComponent(n.ref)+'" aria-label="పాఠ్యంలోకి తిరిగి వెళ్ళండి">↩</a></li>').join('')+'</ol></section>';
 if(englishNotes.length)source+='<section class="footnotes" aria-label="Footnotes"><ol start="'+englishNotes[0].number+'">'+englishNotes.map(n=>'<li id="'+escapeHtml(n.id)+'">'+n.html+' <a class="footnote-back" href="#'+encodeURIComponent(n.ref)+'" aria-label="Back to text">↩</a></li>').join('')+'</ol></section>';
 const title=/\\olsection\{([^}]+)\}/.exec(u.te)?.[1];
 if(title)sections.push({title,id:/\\olfileid\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}/.exec(u.te).slice(1).join(':')+':sec'});
 u.html='<section class="source-unit" id="'+u.unit_id+'" data-unit-id="'+u.unit_id+'" data-translation-sha256="'+sha(u.te)+'"><p class="unit-id">'+u.unit_id+'</p><div class="telugu-text">'+body+'</div><details class="english" lang="en"><summary>Canonical English source · '+u.unit_id+'</summary>'+source+'</details></section>';
 const commandDelta=(after,before)=>Object.fromEntries(Object.entries(after).map(([k,v])=>[k,v-(before[k]??0)]).filter(([,v])=>v));
 const textTe=reader.textRuns.slice(tr).join('\u241e'),textEn=english.textRuns.slice(etr).join('\u241e');
 unitRecords.push({unit_id:u.unit_id,source_path:u.source_path,source_sha256:sha(u.en),translation_sha256:sha(u.te),render_sha256:sha(u.html),aligned_blocks:u.segments.length,linguistic_blocks:u.segments.filter(s=>s.classification==='translated_linguistic_segment').length,math_expressions:reader.math.length-m,english_math_expressions:english.math.length-em,telugu_text_runs:reader.textRuns.length-tr,telugu_text_characters:textTe.length,telugu_text_runs_sha256:sha(textTe),english_text_runs:english.textRuns.length-etr,english_text_characters:textEn.length,english_text_runs_sha256:sha(textEn),telugu_commands:commandDelta(reader.commands,commandBefore),english_commands:commandDelta(english.commands,englishCommandBefore),footnotes:notes.length,english_footnotes:englishNotes.length,segments:u.segments.map(s=>({segment_id:s.segment_id,source_segment_sha256:s.source_segment_sha256,translation_segment_sha256:s.translation_segment_sha256,canon_passages:s.canon_passages.map(p=>p.passage_id)}))});
}
const html=('<!doctype html>\n<html lang="te-Telu-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="OpenLogic తెలుగు: పూర్తి సమితుల అధ్యాయం; 722లో 7 మూల విభాగాలు."><title>సమితులు · OpenLogic తెలుగు</title><link rel="stylesheet" href="reader.css"></head><body>'+
 '<a class="skip-link" href="#reader">ప్రధాన పాఠ్యానికి వెళ్లండి</a><header><p class="eyebrow">OpenLogic · తెలుగు</p><h1>సమితులు</h1><p class="lead">పూర్తి సమితుల అధ్యాయం · 722 మూల విభాగాలలో 7</p><p>ఇది పూర్తి గ్రంథం కాదు. పూర్తి తెలుగు సంచికపై పని కొనసాగుతోంది.</p><p>యంత్ర అనువాదం; మూల పాఠ్యంతో సరిపోల్చిన ఏజెంట్ సమీక్ష. మానవ లేదా స్వతంత్ర సమీక్ష జరిగిందని పేర్కొనడం లేదు.</p></header>'+
 '<nav aria-label="విషయ సూచిక"><h2>విషయ సూచిక</h2><ol>'+sections.map(s=>'<li><a href="#'+encodeURIComponent(s.id)+'">'+escapeHtml(s.title)+'</a></li>').join('')+'</ol><a href="#edition-notes">సంచిక గురించి</a></nav>'+
 '<main id="reader">'+units.map(u=>u.html).join('\n')+'</main>'+
 '<footer id="edition-notes"><h2>సంచిక గురించి</h2><p>సహజ సంఖ్యలలో 0ను చేర్చే ఆంగ్ల మూలపు ఆనవాయితీని ఉంచాం. కొన్ని సాంకేతిక పదాలు తాత్కాలిక నిర్ణయాలు; నిర్వచనాలే వాటి కచ్చితమైన అర్థాన్ని నిర్ణయిస్తాయి. మూల పాఠ్యంలో లేని సమాధానాలు చేర్చలేదు.</p><p>ఇది అదనపు సాఫ్ట్‌వేర్ లేదా ఇంటర్నెట్ లేకుండా చదవగల HTML పాఠ్యం. గణితానికి MathML వాడాం. పొడవైన సూత్రాల ప్రాంతాన్ని అవసరమైతే అడ్డంగా జరపవచ్చు. ప్రతి విభాగం చివర ఆంగ్ల మూలాన్ని విడిగా తెరవవచ్చు.</p><p>మూలం: <a href="https://openlogicproject.org/">Open Logic Project</a> · <a href="https://openlogicproject.org/people/">మూల రచయితలు</a> · <a href="LICENSE.md">CC BY 4.0 అనుమతి</a>. తెలుగు అనువాదం, పాఠక రూపకల్పన మూలానికి చేసిన మార్పులు; మూల రచయితల ఆమోదం ఉందని సూచించడం లేదు.</p><p><a href="https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN">సంపాదించగల మూలాలు, ఆధారాలు</a> · <a href="https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN/blob/main/evidence/EXPERT_REVIEW_LOG.md">నిపుణుల ఐచ్ఛిక సమీక్షా ప్రశ్నలు</a> · <a href="https://github.com/KokunoYumeto/OpenLogic-translations">అనువాదాల కేంద్రం</a> · <a href="https://doi.org/10.5281/zenodo.22307937">సంచిక సంరక్షణ</a></p><p>Noto Serif Telugu: SIL OFL 1.1 (<a href="fonts/OFL.txt">అనుమతి</a>). MathMLను తయారుచేసిన KaTeXకు <a href="KATEX-LICENSE">MIT అనుమతి</a> వర్తిస్తుంది. మూల తెలుగు సాక్ష్య గ్రంథాల పూర్తి ప్రతులు లేదా పుట చిత్రాలు ఇక్కడ చేర్చలేదు.</p></footer></body></html>\n').replace(/[ \t]+$/gm,'');
fs.mkdirSync(path.join(out,'fonts'),{recursive:true});
fs.writeFileSync(path.join(out,'index.html'),html);
fs.copyFileSync(path.join(root,'editions/reader.css'),path.join(out,'reader.css'));
for(const f of ['NotoSerifTelugu-Regular.ttf','NotoSerifTelugu-Bold.ttf','OFL.txt'])fs.copyFileSync(path.join(root,'fonts',f),path.join(out,'fonts',f));
fs.copyFileSync(path.join(root,'LICENSE.md'),path.join(out,'LICENSE.md'));
fs.copyFileSync(path.join(root,'node_modules/katex/LICENSE'),path.join(out,'KATEX-LICENSE'));
if(publishPages){
 fs.writeFileSync(path.join(root,'docs','.nojekyll'),'');
 fs.writeFileSync(path.join(root,'docs','index.html'),'<!doctype html>\n<html lang="te-Telu-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="OpenLogic తెలుగు పాఠక సంచిక"><title>OpenLogic తెలుగు</title><link rel="stylesheet" href="sets/reader.css"></head><body><header><p class="eyebrow">OpenLogic · తెలుగు</p><h1>OpenLogic తెలుగు పాఠక సంచిక</h1><p class="lead"><a href="sets/">సమితులు — పూర్తి అధ్యాయం చదవండి</a></p><p>ప్రస్తుతం 722 మూల విభాగాలలో 7 విభాగాల పాఠక రూపం ప్రచురించబడింది. పూర్తి సంచికపై పని కొనసాగుతోంది.</p></header></body></html>\n');
}
const receipt={schema:'openlogic-te-semantic-html/1',source_revision:manifest[0].source_commit,scope:'7 of 722 units; complete Sets chapter, not full edition',html_sha256:sha(html),katex_version:JSON.parse(fs.readFileSync(path.join(root,'node_modules/katex/package.json'),'utf8')).version,math_output:'native MathML; no client JavaScript or remote runtime dependencies',units:unitRecords,assets:[...assetsUsed.values()],labels:[...labels.entries()],english_labels:[...enLabels.entries()],references:reader.references,english_references:english.references,conditional_branches:reader.conditions,english_conditional_branches:english.conditions,math:reader.math,english_math:english.math,telugu_command_totals:reader.commands,english_command_totals:english.commands,parser_policy:'Unknown commands/environments or math errors fail closed; all ordinary text parsed and rendered. Conditional projection follows available labels, exactly as the current chapter PDF; unselected branch source is preserved here and in editable TeX.',status:'deterministic_qa_pending'};
fs.writeFileSync(path.join(out,'render-manifest.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({units:units.length,math:reader.math.length,english_math:english.math.length,figures:reader.figure,references:reader.references.length,html_sha256:sha(html)}));
