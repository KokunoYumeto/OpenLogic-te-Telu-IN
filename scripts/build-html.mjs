import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {parseTex,realizeTokens,Reader,escapeHtml} from './tex-reader.mjs';
import {defaultTagsFromConfig,projectSelectiveTex} from './tag-projector.mjs';
import {parseBibliography} from './bibtex-reader.mjs';
const root=path.resolve(import.meta.dirname,'..');
const publishPages=process.argv.includes('--pages');
const scopeArg=process.argv.find(a=>a.startsWith('--scope='));
if(process.argv.some(a=>a.startsWith('--')&&a!=='--pages'&&!a.startsWith('--scope=')))throw new Error('Unknown option');
const scope=scopeArg?.slice('--scope='.length)??'sets';
const profiles={
 sets:{start:4,end:10,slug:'sets',title:'సమితులు',lead:'పూర్తి సమితుల అధ్యాయం',scope:'7 of 722 units; complete Sets chapter, not full edition'},
 sfr:{start:4,end:26,slug:'sfr',title:'సమితులు, సంబంధాలు, ప్రమేయాలు',lead:'మూడు పూర్తి పునాది అధ్యాయాలు',scope:'23 of 722 units; complete Sets, Relations, and Functions chapters; not full edition'},
 cumulative279:{start:4,end:279,slug:'cumulative-279',title:'OLP-0279 వరకు సంచిత తెలుగు పాఠ్యం',lead:'276 సంపాదించగల పాఠ్య విభాగాలు',scope:'276 of 722 units; OLP-0004 through OLP-0279; not full edition'}
};
const profile=profiles[scope];
if(!profile)throw new Error('Unknown scope '+scope);
const out=publishPages?path.join(root,'docs',profile.slug):path.join(root,'output/html',profile.slug);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const selectiveConfig=fs.readFileSync(path.join(root,'upstream/open-logic-config.sty'),'utf8');
const defaultTags=defaultTagsFromConfig(selectiveConfig);
const jsonl=name=>fs.readFileSync(path.join(root,'evidence',name),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const citationData=parseBibliography(fs.readFileSync(path.join(root,'upstream/bib/open-logic.bib'),'utf8'));
const allManifest=jsonl('SOURCE_MANIFEST.jsonl');
const manifest=allManifest.filter(u=>u.order>=profile.start&&u.order<=profile.end);
if(manifest.length!==profile.end-profile.start+1)throw new Error('Missing scoped units');
function canonicalLabelCatalog(rows){
 const labels=new Set();
 for(const unit of rows){
  const source=fs.readFileSync(path.join(root,'upstream',unit.source_path),'utf8');
  const fileId=/\\olfileid\s*\{([^{}]*)\}\s*\{([^{}]*)\}\s*\{([^{}]*)\}/u.exec(source);
  const identity=fileId?.slice(1,4);
  for(const match of source.matchAll(/\\olpart\s*\{([^{}]+)\}/gu))labels.add([match[1],'','','part'].join(':'));
  for(const match of source.matchAll(/\\olchapter\s*\{([^{}]+)\}\s*\{([^{}]+)\}/gu))labels.add([match[1],match[2],'','chap'].join(':'));
  if(identity&&/\\olsection\s*\{/u.test(source))labels.add([...identity,'sec'].join(':'));
  if(identity)for(const match of source.matchAll(/\\ollabel\s*\{([^{}]+)\}/gu))labels.add([...identity,match[1]].join(':'));
  for(const match of source.matchAll(/\\label\s*\{([^{}]+)\}/gu))labels.add(match[1]);
 }
 return labels;
}
const knownLabels=canonicalLabelCatalog(allManifest);
const ledger=jsonl('SEGMENT_CANON_USE.jsonl');
const assetsUsed=new Map();
const compiledManifest=JSON.parse(fs.readFileSync(path.join(root,'editions/reader-assets/diagrams/manifest.json'),'utf8'));
const compiledByName=new Map(compiledManifest.diagrams.map(row=>[row.name,row]));
const tikzPattern=/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g;
const readerSourceProjectionRepairs=[{
 unit_id:'OLP-0140',language:'en',kind:'balanced_notation_delimiters',
 description:'The frozen English source has three split quantifier expressions with a missing closing bracket and a corresponding surplus bracket. The semantic reader balances those delimiters without changing the immutable source bytes.'
},{
 unit_id:'OLP-0271',language:'te',kind:'standalone_object_font_command',
 description:'A Telugu source-correction note names the object-font command in mathematics without its required argument. The semantic reader displays the command name in object font without changing the immutable source bytes.'
}];
function prepareReaderSource(source,unit){
 source=projectSelectiveTex(source,defaultTags);
 // OLP-0039's frozen English conditional leaves its true branch open across
 // the following sentence and therefore has no third argument. Project the
 // evident footnote-only branch for the reader without changing source bytes.
 source=source.replace(
  'become clear in \\olref[sfr][card-arithmetic][card-opps]{sec}.}{} This\nslightly loose formulation should not cause any confusions\nfor now, however.}',
  'become clear in \\olref[sfr][card-arithmetic][card-opps]{sec}.}}{} This\nslightly loose formulation should not cause any confusions\nfor now, however.'
 );
 if(unit.unit_id==='OLP-0140')source=source
  .replace('$\\lforall[x][(!A(x) \\lif !B(x)),\n\\lexists[x][!A(x)] \\Entails \\lexists[x][!B(x)]]$','$\\lforall[x][(!A(x) \\lif !B(x))],\n\\lexists[x][!A(x)] \\Entails \\lexists[x][!B(x)]$')
  .replace('$\\lforall[x][(!A(x) \\lif !B(x))$','$\\lforall[x][(!A(x) \\lif !B(x))]$')
  .replaceAll('$\\lexists[x][!B(x)]]$','$\\lexists[x][!B(x)]$')
  .replace('$\\lforall[x][(!A(x)\n\\lif !B(x))$','$\\lforall[x][(!A(x)\n\\lif !B(x))]$');
 if(unit.unit_id==='OLP-0271')source=source.replaceAll('$\\Obj$','$\\mathsf{Obj}$');
 let prepared=source.replace(tikzPattern,snippet=>{
  const digest=sha(snippet),name='inline-'+digest.slice(0,16),record=compiledByName.get(name);
  if(!record)return '\\readerdiagram{'+name+'}';
  const occurrence=record.occurrences?.some(row=>row.unit_id===unit.unit_id&&row.source_path===unit.source_path);
  if(record.snippet_sha256!==digest||!occurrence)throw new Error('Unsealed inline diagram '+unit.unit_id+' '+digest);
  return '\\readerdiagram{'+name+'}';
 });
 prepared=prepared.replace(/\\begin\{align\*\}([\s\S]*?\\readerdiagram\{[\s\S]*?)\\end\{align\*\}/g,(_whole,body)=>body
  .replace(/^\s*&\s*/gm,'')
  .replace(/\\intertext\{([^{}]*)\}/g,'\n\n$1\n\n')
  .replace(/\\\\/g,'\n\n'));
 prepared=prepared
  .replace(/\\\[\s*(\\readerdiagram\{[^{}]+\})\s*\\\]/gu,'\n\n$1\n\n')
  .replace(/\\begin\{(equation\*?|gather\*?|align\*?|multline\*?)\}\s*(\\readerdiagram\{[^{}]+\})\s*\\end\{\1\}/gu,'\n\n$2\n\n')
  .replace(/\\\[\s*\\centering\s*(\\begin\{tabular\}[\s\S]*?\\end\{tabular\})\s*\\\]/gu,'\n\n$1\n\n');
 return prepared;
}
const colors={oldiagcolorA:'#262626',oldiagcolorB:'#21599e',oldiagcolorC:'#ad303f'};
function diagram(relative,language){
 const canonicalRelative=relative.replace(/^\\olpath\//u,'');
 const simple=/^assets\/diagrams\/(union|intersection|difference)\.tikz$/.exec(canonicalRelative);
 if(!simple){
   const name=canonicalRelative.startsWith('inline-')?canonicalRelative:path.basename(canonicalRelative,'.tikz'),record=compiledByName.get(name);
  if(!record){
   if(process.env.READER_DIAGNOSE_MATH==='1')return '<span class="diagram-pending">['+escapeHtml(name)+']</span>';
   throw new Error('Unapproved diagram '+relative);
  }
  const svgPath=path.join(root,record.svg_path),svg=fs.readFileSync(svgPath);
  if(sha(svg)!==record.svg_sha256)throw new Error('Compiled diagram changed '+name);
   if(!canonicalRelative.startsWith('inline-')){
    const source=fs.readFileSync(path.join(root,'upstream',canonicalRelative));
    if(sha(source)!==record.source_sha256)throw new Error('Diagram source changed '+canonicalRelative);
  }
  const descriptions={
   function:{te:'ప్రమేయ పటం: ప్రవేశంలోని ప్రతి ఆర్గ్యుమెంట్ నుంచి సహప్రవేశంలోని దానికి సంబంధించిన ఒక విలువకు బాణం ఉంది.',en:'Function diagram: each argument in the domain has an arrow to its corresponding value in the codomain.'},
   surjective:{te:'సంగ్రస్త ప్రమేయ పటం: సహప్రవేశంలోని ప్రతి మూలకాన్ని కనీసం ఒక బాణం చేరుతుంది.',en:'Surjective function diagram: every codomain element is reached by at least one arrow.'},
   injective:{te:'ఒకటి-ఒకటి ప్రమేయ పటం: వేర్వేరు ఆర్గ్యుమెంట్ల బాణాలు వేర్వేరు విలువలను చేరుతాయి.',en:'Injective function diagram: arrows from distinct arguments reach distinct values.'},
   bijective:{te:'ద్విగుణ ప్రమేయ పటం: ప్రతి సహప్రవేశ మూలకాన్ని కచ్చితంగా ఒక ప్రవేశ మూలకపు బాణం చేరుతుంది.',en:'Bijective function diagram: every codomain element is reached by exactly one domain element.'},
    composition:{te:'ప్రమేయాల సంయుక్త పటం: A నుంచి Bకి f బాణాలు, B నుంచి Cకి g బాణాలు, వాటి ద్వారా A నుంచి Cకి సంయుక్తం.',en:'Composition diagram: arrows f go from A to B and arrows g from B to C, inducing their composite from A to C.'},
    'turing-machine':{te:'ట్యూరింగ్ యంత్ర కార్యాచరణ పటం: ఎడమ చివరి గుర్తు తరువాత గీతలు, ఖాళీతో కూడిన టేపుపై మూడవ గడిని చదువుతున్న శీర్షం, ప్రస్తుత స్థితి q-1 చూపబడ్డాయి.',en:'Turing-machine execution diagram: a tape beginning with the end marker contains strokes and a blank; the head scans the third square in state q-1.'},
   'inline-8ee505c808d2f308':{te:'V = {1,2,3,4} శీర్షాలు, (1,1), (1,2), (1,3), (2,3) నిర్దేశిత అంచులు గల గ్రాఫు.',en:'Directed graph with vertices V = {1,2,3,4} and edges (1,1), (1,2), (1,3), and (2,3).'},
   'inline-f90ab2f746e4260f':{te:'అదే అంచులతో V′ = {1,2,3} శీర్షాలు మాత్రమే గల భిన్న గ్రాఫు.',en:'A distinct graph with the same edges but only the vertices V-prime = {1,2,3}.'},
   'inline-f122123b1f5663cd':{te:'పరిమిత వృక్షం: కింది మూలం r నుంచి a, b; a నుంచి c, d, e పైకి శాఖలుగా ఉన్నాయి.',en:'Finite tree: the bottom root r branches upward to a and b, and a branches to c, d, and e.'},
   'inline-67bc14ded3614a59':{te:'రెండు అతివ్యాప్త చతురస్రాల జ్యామితీయ పటం; పెద్ద భుజం m, చిన్న భుజం n, ఉమ్మడి నారింజ ప్రాంతం మరియు రెండు కప్పబడని ప్రాంతాలు చూపబడ్డాయి.',en:'Geometric diagram of two overlapping squares, with sides m and n, showing the orange overlap and two uncovered regions.'},
   'inline-adfd8b1868d5aea1':{te:'హిల్బర్ట్ హోటల్ పటం: 1, 2, 3 మొదలైన గదుల అతిథులు ఒక్కొక్కరు తదుపరి సంఖ్య గల గదికి మారే బాణాలు.',en:'Hilbert Hotel diagram: guests in rooms 1, 2, 3, and so on move along arrows to the next-numbered room.'}
  };
  const groupedDescriptions=[
   {names:['inline-67bc14ded3614a59','inline-b79a7f9b9d4a35d6'],te:'రెండు అతివ్యాప్త చతురస్రాల జ్యామితీయ పటం; పెద్ద భుజం m, చిన్న భుజం n, ఉమ్మడి నారింజ ప్రాంతం మరియు రెండు కప్పబడని ప్రాంతాలు చూపబడ్డాయి.',en:'Geometric diagram of two overlapping squares, with sides m and n, showing the orange overlap and two uncovered regions.'},
   {names:['inline-adfd8b1868d5aea1','inline-42fddcb28cffb78c'],te:'హిల్బర్ట్ హోటల్ పటం: 1, 2, 3 మొదలైన గదుల అతిథులు ఒక్కొక్కరు తదుపరి సంఖ్య గల గదికి మారే బాణాలు.',en:'Hilbert Hotel diagram: guests in rooms 1, 2, 3, and so on move along arrows to the next-numbered room.'},
   {names:['inline-79a096459714bd19','inline-c2f5ecdb15cb158d'],te:'నమూనాల వర్గాల వేర్పాటు పటం: C ప్రాంతంలోని Γ వృత్తాన్ని, C కాని ప్రాంతంలోని Δ వృత్తాన్ని వంకర సరిహద్దు వేరు చేస్తుంది.',en:'Model-class separation diagram: a curved boundary separates the Gamma circle in the C region from the Delta circle in the not-C region.'},
   {names:['inline-fe28d4a13e84757f','inline-5c069ebcc45d78fe'],te:'నిర్మాణ పటం: M-స్టార్, N-స్టార్ విస్తరణలలోని M, N ఉపనిర్మాణాల మధ్య I అనే ద్విదిశ బాణం అంతర్గత పాక్షిక సమరూపతను చూపుతుంది.',en:'Structure diagram: an I double arrow gives an internal partial isomorphism between the M and N substructures inside the M-star and N-star expansions.'},
   {names:['inline-c7f8d298d81e2450'],te:'ట్యూరింగ్ యంత్ర స్థితి పటం: ప్రారంభ స్థితి q-0లో ఖాళీని చదివితే గీతను వ్రాసి కుడికి కదలి q-1కు వెళుతుంది.',en:'Turing-machine state diagram: from initial state q-0, reading a blank writes a stroke, moves right, and enters q-1.'},
   {names:['inline-5faec00560b227a0'],te:'సరి ట్యూరింగ్ యంత్ర పటం: q-0, q-1 స్థితుల మధ్య గీతపై కుడికి కదిలే బాణాలు, q-1 వద్ద ఖాళీపై కుడికి కదిలే లూపు ఉన్నాయి.',en:'Even Turing-machine diagram: stroke transitions move right between q-0 and q-1, with a right-moving blank loop at q-1.'},
   {names:['inline-49f4aead9c87b5fd'],te:'ఎప్పటికీ ఆగని మార్పుచేసిన సరి యంత్ర పటం: q-0, q-1 రెండింటికీ ఖాళీపై కుడికి కదిలే లూపులు ఉన్నాయి.',en:'Modified non-halting even-machine diagram: both q-0 and q-1 have right-moving loops on a blank.'},
   {names:['inline-a1aa286509570cf7'],te:'ద్విగుణక ట్యూరింగ్ యంత్ర పటం: q-0 నుంచి q-5 వరకు ఆరు స్థితుల సంక్రమణలు ఇన్‌పుట్ గీతలను చెరిపి, ప్రతి గీతకు రెండు అవుట్‌పుట్ గీతలను వ్రాస్తాయి.',en:'Doubler Turing-machine diagram: transitions through q-0 to q-5 erase the input strokes and write two output strokes for each one.'},
   {names:['inline-c3caaee3d74203c5','inline-1182ea7b3b818fa0','inline-e8653a45ed3d19d5','inline-8428d3ec0ddf755f'],te:'కూడిక ట్యూరింగ్ యంత్ర పటం: q-0 నుంచి q-2 వరకు సంక్రమణలు రెండు ఏకపద గీతల దిమ్మలను ఒకే దిమ్మగా కలుపుతాయి.',en:'Addition Turing-machine diagram: transitions from q-0 through q-2 join two unary stroke blocks into one.'},
   {names:['inline-71f7148b6e6f49fc'],te:'రెండింతలు చేసే ట్యూరింగ్ యంత్ర పటం: q-0 నుంచి q-8 వరకు తొమ్మిది స్థితుల సంక్రమణలు x గీతల ఇన్‌పుట్‌ను 2x గీతల అవుట్‌పుట్‌గా మారుస్తాయి.',en:'Doubling Turing-machine diagram: transitions through q-0 to q-8 turn an input of x strokes into an output of 2x strokes.'},
   {names:['inline-61f74a97cc29551d'],te:'గీతల దిమ్మను ఎడమకు జరిపే ట్యూరింగ్ యంత్ర పటం: q-6 నుంచి q-14 వరకు సంక్రమణలు చివరి గుర్తును ఉపయోగించి దిమ్మను ఒక గడి ఎడమకు తరలిస్తాయి.',en:'Block-moving Turing-machine diagram: transitions from q-6 through q-14 use the end marker to shift a stroke block one square left.'},
   {names:['inline-ba899555b080387d','inline-ade23c264c5e1ec2'],te:'ఆగే-స్థితి గల సరి యంత్ర పటం: q-0లో ఖాళీ చదివినప్పుడు యంత్రం ప్రత్యేక h స్థితికి వెళుతుంది.',en:'Even-machine diagram with a halting state: reading a blank at q-0 sends the machine to the dedicated h state.'},
   {names:['inline-1367279b55b94fa8','inline-3a76ea1bbd4af6cd'],te:'ఆగే మరియు తిరస్కరణ స్థితుల పటం: q-0లో ఖాళీ hకు, q-1లో ఖాళీ rకు పంపుతుంది; గీతలు q-0, q-1 మధ్య కదిలిస్తాయి.',en:'Halting-and-rejecting state diagram: a blank at q-0 goes to h, a blank at q-1 goes to r, and strokes move between q-0 and q-1.'},
   {names:['inline-f154b16dc94f735d','inline-2ebc9e8e28538a71'],te:'క్రమశిక్షిత కూడిక యంత్ర పటం: q-0 నుంచి q-3 వరకు యంత్రం గీతల దిమ్మలను కలిపి, ఎడమ చివరి గుర్తు వద్ద h స్థితిలో ఆగుతుంది.',en:'Disciplined addition-machine diagram: q-0 through q-3 combine the stroke blocks and halt in h at the left end marker.'},
   {names:['inline-d9931388ff4ffbdb','inline-7a6545219f0922fe'],te:'సంయుక్త యంత్ర నిర్మాణంలోని మొదటి భాగం: కూడిక యంత్రానికి q-2 నుంచి q-3, q-4 దశలను చేర్చి ఫలితపు మొదటి గీత వద్ద శీర్షాన్ని ఉంచుతుంది.',en:'First stage of a combined machine: q-3 and q-4 extend the adder from q-2 and position the head at the first stroke of its result.'},
   {names:['inline-651160f8c92af250','inline-3d2123bbad7a5cf8'],te:'సంయుక్త కూడిక-ద్విగుణక యంత్ర పటం: q-0 నుంచి q-9 వరకు సంక్రమణలు ముందుగా n+mను కూడి, తరువాత 2(n+m) గీతలను ఉత్పత్తి చేస్తాయి.',en:'Combined adder-and-doubler state diagram: transitions q-0 through q-9 first add n and m, then produce 2(n+m) strokes.'},
   {names:['inline-8471fff7cb6fda42'],te:'సరి యంత్రానికి పేరు మార్చిన రూపం: s, h స్థితులు మరియు A సంకేతం అసలు q-0, q-1, గీతలతో సమాన సంక్రమణ నిర్మాణాన్ని కలిగి ఉన్నాయి.',en:'Renamed variant of the even machine: states s and h and symbol A have the same transition pattern as q-0, q-1, and the stroke symbol.'},
   {names:['inline-efc0b65c00b93e59'],te:'ప్రామాణిక సంఖ్యీకృత సరి యంత్ర పటం: స్థితులు 1, 2గా, ఖాళీ 2గా, గీత 3గా సంఖ్యీకరించబడ్డాయి.',en:'Standard numerically encoded even-machine diagram: the states are numbered 1 and 2, the blank is 2, and the stroke is 3.'}
  ];
  for(const group of groupedDescriptions)for(const diagramName of group.names)descriptions[diagramName]={te:group.te,en:group.en};
  const description=descriptions[name]?.[language];
  if(!description)throw new Error('Missing diagram description '+name+' '+language);
  assetsUsed.set(name,{...record,conversion:compiledManifest.conversion,description_te:descriptions[name].te,description_en:descriptions[name].en});
  return '<img class="reader-diagram" src="assets/diagrams/'+escapeHtml(name)+'.svg" alt="'+escapeHtml(description)+'">';
 }
 const source=fs.readFileSync(path.join(root,'upstream',canonicalRelative),'utf8');
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
 const name=simple[1];
 assetsUsed.set(canonicalRelative,{source_path:canonicalRelative,source_sha256:sha(source),paths:paths.length,conversion:'Exact source Bezier/control/line coordinates and stroke styles; native downward SVG y axis matches original TikZ negative y scale.'});
 const labels=language==='te'?{union:'రెండు సమితుల సమ్మేళనం: రెండు ఆకృతుల లోపలి ప్రాంతమంతా గుర్తించబడింది.',intersection:'రెండు సమితుల ఛేదనం: రెండు ఆకృతుల ఉమ్మడి ప్రాంతం మాత్రమే గుర్తించబడింది.',difference:'మొదటి సమితి నుంచి రెండో సమితిని తీసివేసిన భేదం: మొదటి ఆకృతిలో మాత్రమే ఉన్న ప్రాంతం గుర్తించబడింది.'}:{union:'Union: the whole region inside either of the two shapes is marked.',intersection:'Intersection: only the common region of both shapes is marked.',difference:'Difference: only the portion of the first shape outside the second shape is marked.'};
 return '<svg class="set-diagram" role="img" aria-label="'+escapeHtml(labels[name])+'" viewBox="-3 -3 289 237" xmlns="http://www.w3.org/2000/svg"><title>'+escapeHtml(labels[name])+'</title>'+svg+'</svg>';
}
const units=manifest.map(u=>{
 const en=fs.readFileSync(path.join(root,'upstream',u.source_path),'utf8'),te=fs.readFileSync(path.join(root,'translation',u.source_path),'utf8');
 if(sha(en)!==u.source_sha256)throw new Error('Source bytes changed '+u.unit_id);
 const segments=ledger.filter(s=>s.unit_id===u.unit_id);
 if(!segments.length||segments.some(s=>s.translation_unit_sha256!==sha(te)))throw new Error('Stale segment alignment '+u.unit_id);
 const realizedTe=realizeTokens(te),realizedEn=realizeTokens(en,'en');
 if(realizedTe.includes('!!')||realizedEn.includes('!!'))throw new Error('Unresolved text token '+u.unit_id);
 try{return {...u,en,te,segments,astTe:parseTex(prepareReaderSource(realizedTe,u)),astEn:parseTex(prepareReaderSource(realizedEn,u))};}
 catch(error){throw new Error('Reader parse failed '+u.unit_id+': '+error.message,{cause:error});}
});
const labels=new Map(),enLabels=new Map();
const collector=new Reader({assets:diagram,labels,knownLabels,citationData,collect:true}),enCollector=new Reader({language:'en',assets:diagram,labels:enLabels,knownLabels,citationData,collect:true,prefix:'en-'});
const mathDiagnostics=[];
for(const u of units){
 const teBefore=collector.mathErrors.length,enBefore=enCollector.mathErrors.length;
 try{collector.renderNodes(u.astTe);enCollector.renderNodes(u.astEn);}
 catch(error){throw new Error('Reader collection render failed '+u.unit_id+': '+error.message,{cause:error});}
 mathDiagnostics.push(...collector.mathErrors.slice(teBefore).map(record=>({...record,unit_id:u.unit_id,language:'te'})),...enCollector.mathErrors.slice(enBefore).map(record=>({...record,unit_id:u.unit_id,language:'en'})));
}
if(mathDiagnostics.length){
 const diagnosticPath=path.join(root,'tmp',profile.slug+'-math-errors.json');
 fs.mkdirSync(path.dirname(diagnosticPath),{recursive:true});
 fs.writeFileSync(diagnosticPath,JSON.stringify(mathDiagnostics,null,2)+'\n');
 throw new Error('Semantic math diagnostics found '+mathDiagnostics.length+' failures; see '+diagnosticPath);
}
const reader=new Reader({assets:diagram,labels,knownLabels,citationData}),english=new Reader({language:'en',assets:diagram,labels:enLabels,knownLabels,citationData,prefix:'en-'});
const unitRecords=[],sections=[];
for(const u of units){
 const m=reader.math.length,em=english.math.length,tr=reader.textRuns.length,etr=english.textRuns.length,fn=reader.footnotes.length,efn=english.footnotes.length;
 const commandBefore={...reader.commands},englishCommandBefore={...english.commands};
 let body,source;
 try{body=reader.renderNodes(u.astTe);source=english.renderNodes(u.astEn);}
 catch(error){throw new Error('Reader final render failed '+u.unit_id+': '+error.message,{cause:error});}
 const notes=reader.footnotes.slice(fn),englishNotes=english.footnotes.slice(efn);
 if(notes.length)body+='<section class="footnotes" aria-label="పాదసూచికలు"><ol start="'+notes[0].number+'">'+notes.map(n=>'<li id="'+escapeHtml(n.id)+'">'+n.html+' <a class="footnote-back" href="#'+encodeURIComponent(n.ref)+'" aria-label="పాఠ్యంలోకి తిరిగి వెళ్ళండి">↩</a></li>').join('')+'</ol></section>';
 if(englishNotes.length)source+='<section class="footnotes" aria-label="Footnotes"><ol start="'+englishNotes[0].number+'">'+englishNotes.map(n=>'<li id="'+escapeHtml(n.id)+'">'+n.html+' <a class="footnote-back" href="#'+encodeURIComponent(n.ref)+'" aria-label="Back to text">↩</a></li>').join('')+'</ol></section>';
 const chapterTitle=/\\olchapter\{[^}]*\}\{[^}]*\}\{([^}]+)\}/.exec(u.te)?.[1];
 const sectionTitle=/\\olsection\{([^}]+)\}/.exec(u.te)?.[1];
 const sourceStem=path.basename(u.source_path,'.tex').replaceAll('-',' ');
 const title=chapterTitle??sectionTitle??(u.unit_id+' · '+sourceStem);
 sections.push({title,id:u.unit_id});
 u.html='<section class="source-unit" id="'+u.unit_id+'" data-unit-id="'+u.unit_id+'" data-translation-sha256="'+sha(u.te)+'"><p class="unit-id">'+u.unit_id+'</p><div class="telugu-text">'+body+'</div><details class="english" lang="en"><summary>Canonical English source · '+u.unit_id+'</summary>'+source+'</details></section>';
 const commandDelta=(after,before)=>Object.fromEntries(Object.entries(after).map(([k,v])=>[k,v-(before[k]??0)]).filter(([,v])=>v));
 const textTe=reader.textRuns.slice(tr).join('\u241e'),textEn=english.textRuns.slice(etr).join('\u241e');
 unitRecords.push({unit_id:u.unit_id,source_path:u.source_path,source_sha256:sha(u.en),translation_sha256:sha(u.te),render_sha256:sha(u.html),aligned_blocks:u.segments.length,linguistic_blocks:u.segments.filter(s=>s.classification==='translated_linguistic_segment').length,math_expressions:reader.math.length-m,english_math_expressions:english.math.length-em,telugu_text_runs:reader.textRuns.length-tr,telugu_text_characters:textTe.length,telugu_text_runs_sha256:sha(textTe),english_text_runs:english.textRuns.length-etr,english_text_characters:textEn.length,english_text_runs_sha256:sha(textEn),telugu_commands:commandDelta(reader.commands,commandBefore),english_commands:commandDelta(english.commands,englishCommandBefore),footnotes:notes.length,english_footnotes:englishNotes.length,segments:u.segments.map(s=>({segment_id:s.segment_id,source_segment_sha256:s.source_segment_sha256,translation_segment_sha256:s.translation_segment_sha256,canon_passages:s.canon_passages.map(p=>p.passage_id)}))});
}
const citationKeys=[...new Set([...reader.citationsUsed,...english.citationsUsed])].sort();
const bibliographyHtml=citationKeys.length?'<section id="bibliography"><h2>మూల గ్రంథాలు</h2><ol lang="en">'+citationKeys.map(key=>{
 const record=citationData.get(key),label=[record.author||record.editor,record.year,record.title].filter(Boolean).join('. ');
 return '<li id="bib-'+escapeHtml(key)+'"><code>'+escapeHtml(key)+'</code>: '+escapeHtml(label||key)+'</li>';
}).join('')+'</ol></section>':'';
const unitCount=manifest.length;
const html=('<!doctype html>\n<html lang="te-Telu-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="OpenLogic తెలుగు: '+escapeHtml(profile.lead)+'; 722లో '+unitCount+' మూల విభాగాలు."><title>'+escapeHtml(profile.title)+' · OpenLogic తెలుగు</title><link rel="stylesheet" href="reader.css"></head><body>'+
 '<a class="skip-link" href="#reader">ప్రధాన పాఠ్యానికి వెళ్లండి</a><header><p class="eyebrow">OpenLogic · తెలుగు</p><h1>'+escapeHtml(profile.title)+'</h1><p class="lead">'+escapeHtml(profile.lead)+' · 722 మూల విభాగాలలో '+unitCount+'</p><p>ఇది పూర్తి గ్రంథం కాదు. పూర్తి తెలుగు సంచికపై పని కొనసాగుతోంది.</p><p>ఈ విభాగాల యంత్ర అనువాదం, మూలంతో సరిపోల్చిన ఏజెంట్ సమీక్ష: OpenAI Codex — GPT-5.6 Sol, Ultra effort. ఈ వెబ్ పాఠ్యపు ప్రస్తుత వివరణ/లంకె సంపాదన: OpenAI Codex — GPT-6 Sol, Ultra effort. మానవ లేదా స్వతంత్ర సమీక్ష జరిగిందని పేర్కొనడం లేదు.</p></header>'+
 '<nav aria-label="విషయ సూచిక"><h2>విషయ సూచిక</h2><ol>'+sections.map(s=>'<li><a href="#'+encodeURIComponent(s.id)+'">'+escapeHtml(s.title)+'</a></li>').join('')+'</ol><a href="#edition-notes">సంచిక గురించి</a></nav>'+
 '<main id="reader">'+units.map(u=>u.html).join('\n')+'</main>'+
 '<footer id="edition-notes"><h2>సంచిక గురించి</h2><p>సహజ సంఖ్యలలో 0ను చేర్చే ఆంగ్ల మూలపు ఆనవాయితీని ఉంచాం. కొన్ని సాంకేతిక పదాలు తాత్కాలిక నిర్ణయాలు; నిర్వచనాలే వాటి కచ్చితమైన అర్థాన్ని నిర్ణయిస్తాయి. మూల పాఠ్యంలో లేని సమాధానాలు చేర్చలేదు.</p><p>ఇది అదనపు సాఫ్ట్‌వేర్ లేదా ఇంటర్నెట్ లేకుండా చదవగల HTML పాఠ్యం. గణితానికి MathML వాడాం. పొడవైన సూత్రాల ప్రాంతాన్ని అవసరమైతే అడ్డంగా జరపవచ్చు. ప్రతి విభాగం చివర ఆంగ్ల మూలాన్ని విడిగా తెరవవచ్చు.</p>'+bibliographyHtml+'<p>మూలం: <a href="https://openlogicproject.org/">Open Logic Project</a> · <a href="https://openlogicproject.org/people/">మూల రచయితలు</a> · <a href="LICENSE.md">CC BY 4.0 అనుమతి</a>. తెలుగు అనువాదం, పాఠక రూపకల్పన మూలానికి చేసిన మార్పులు; మూల రచయితల ఆమోదం ఉందని సూచించడం లేదు.</p><p><a href="https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN">సంపాదించగల మూలాలు, ఆధారాలు</a> · <a href="https://github.com/KokunoYumeto/OpenLogic-te-Telu-IN/blob/main/evidence/START_HERE.te.md">తెలుగు సమీక్షా మార్గదర్శి</a> · <a href="https://github.com/KokunoYumeto/OpenLogic-translations">అనువాదాల కేంద్రం</a> · <a href="https://doi.org/10.5281/zenodo.22307937">సంచిక సంరక్షణ</a></p><p>Noto Serif Telugu: SIL OFL 1.1 (<a href="fonts/OFL.txt">అనుమతి</a>). MathMLను తయారుచేసిన KaTeXకు <a href="KATEX-LICENSE">MIT అనుమతి</a> వర్తిస్తుంది. మూల తెలుగు సాక్ష్య గ్రంథాల పూర్తి ప్రతులు లేదా పుట చిత్రాలు ఇక్కడ చేర్చలేదు.</p></footer></body></html>\n').replace(/[ \t]+$/gm,'');
fs.mkdirSync(path.join(out,'fonts'),{recursive:true});
fs.writeFileSync(path.join(out,'index.html'),html);
fs.copyFileSync(path.join(root,'editions/reader.css'),path.join(out,'reader.css'));
for(const f of ['NotoSerifTelugu-Regular.ttf','NotoSerifTelugu-Bold.ttf','OFL.txt'])fs.copyFileSync(path.join(root,'fonts',f),path.join(out,'fonts',f));
for(const record of assetsUsed.values())if(record.svg_path){
 const destination=path.join(out,'assets','diagrams',path.basename(record.svg_path));
 fs.mkdirSync(path.dirname(destination),{recursive:true});
 fs.copyFileSync(path.join(root,record.svg_path),destination);
}
fs.copyFileSync(path.join(root,'LICENSE.md'),path.join(out,'LICENSE.md'));
fs.copyFileSync(path.join(root,'node_modules/katex/LICENSE'),path.join(out,'KATEX-LICENSE'));
if(publishPages){
 fs.writeFileSync(path.join(root,'docs','.nojekyll'),'');
 fs.writeFileSync(path.join(root,'docs','index.html'),'<!doctype html>\n<html lang="te-Telu-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="OpenLogic తెలుగు పాఠక సంచిక"><title>OpenLogic తెలుగు</title><link rel="stylesheet" href="'+profile.slug+'/reader.css"></head><body><header><p class="eyebrow">OpenLogic · తెలుగు</p><h1>OpenLogic తెలుగు పాఠక సంచిక</h1><p class="lead"><a href="'+profile.slug+'/">'+escapeHtml(profile.title)+' — '+escapeHtml(profile.lead)+' చదవండి</a></p><p>ప్రస్తుతం 722 మూల విభాగాలలో '+unitCount+' విభాగాల పాఠక రూపం ప్రచురించబడింది. పూర్తి సంచికపై పని కొనసాగుతోంది.</p></header></body></html>\n');
}
const receipt={schema:'openlogic-te-semantic-html/1',source_revision:manifest[0].source_commit,scope:profile.scope,profile:scope,html_sha256:sha(html),katex_version:JSON.parse(fs.readFileSync(path.join(root,'node_modules/katex/package.json'),'utf8')).version,math_output:'native MathML; no client JavaScript or remote runtime dependencies',selective_config_sha256:sha(selectiveConfig),selective_defaults:Object.fromEntries([...defaultTags].sort(([a],[b])=>a.localeCompare(b))),reader_source_projection_repairs:readerSourceProjectionRepairs,units:unitRecords,assets:[...assetsUsed.values()],labels:[...labels.entries()],english_labels:[...enLabels.entries()],duplicate_labels:collector.duplicateLabels,english_duplicate_labels:enCollector.duplicateLabels,references:reader.references,english_references:english.references,conditional_branches:reader.conditions,english_conditional_branches:english.conditions,citation_keys:citationKeys,math:reader.math,english_math:english.math,telugu_command_totals:reader.commands,english_command_totals:english.commands,parser_policy:'Unknown commands/environments, unknown reference labels, or math errors fail closed; all ordinary text is parsed and rendered. References to canonical labels that are unavailable in this bounded reader scope are rendered as explicit external-reference markers and retained in the receipt. Upstream selective tags are projected with the exact frozen default configuration, any-active list semantics, inverse not-tags, tagged lists/references, and conditional problem blocks before parsing, including inside mathematics. Conditional label projection follows available labels. Evident frozen-source delimiter defects listed in reader_source_projection_repairs are balanced only in the semantic projection; source bytes remain unchanged. Repeated labels in alternative source units keep the first canonical target and receive unique duplicate anchors, with every occurrence recorded. Inline TikZ and approved frozen diagram assets are source-hash-bound to local SVG projections with localized semantic descriptions; citation commands retain keys and locators and link to local bibliography entries.',status:'deterministic_qa_pending'};
fs.writeFileSync(path.join(out,'render-manifest.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({units:units.length,math:reader.math.length,english_math:english.math.length,figures:reader.figure,references:reader.references.length,html_sha256:sha(html)}));
