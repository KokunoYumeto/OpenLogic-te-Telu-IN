import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const W=n=>[...Array(n).keys()];
const R=(mask,n,u,v)=>Boolean(mask&(1<<(u*n+v)));
const box=a=>['box',a],dia=a=>['dia',a],imp=(a,b)=>['imp',a,b];
const formulas={
  D:imp(box('p'),dia('p')),
  T:imp(box('p'),'p'),
  B:imp('p',box(dia('p'))),
  '4':imp(box('p'),box(box('p'))),
  '5':imp(dia('p'),box(dia('p')))
};
function holds(f,w,mask,n,p){
  if(f==='p')return Boolean(p&(1<<w));
  const [op,a,b]=f;
  if(op==='box')return W(n).every(v=>!R(mask,n,w,v)||holds(a,v,mask,n,p));
  if(op==='dia')return W(n).some(v=>R(mask,n,w,v)&&holds(a,v,mask,n,p));
  if(op==='imp')return !holds(a,w,mask,n,p)||holds(b,w,mask,n,p);
  throw new Error('Unknown operator');
}
function properties(mask,n){
  const worlds=W(n),succ=w=>worlds.filter(v=>R(mask,n,w,v));
  return {
    D:worlds.every(w=>succ(w).length>0),
    T:worlds.every(w=>R(mask,n,w,w)),
    B:worlds.every(u=>worlds.every(v=>!R(mask,n,u,v)||R(mask,n,v,u))),
    '4':worlds.every(u=>worlds.every(v=>worlds.every(w=>
      !R(mask,n,u,v)||!R(mask,n,v,w)||R(mask,n,u,w)))),
    '5':worlds.every(w=>worlds.every(u=>worlds.every(v=>
      !R(mask,n,w,u)||!R(mask,n,w,v)||R(mask,n,u,v)))),
    functional:worlds.every(w=>succ(w).length===1),
    weakly_connected:worlds.every(w=>worlds.every(u=>worlds.every(v=>
      !R(mask,n,w,u)||!R(mask,n,w,v)||u===v||R(mask,n,u,v)||R(mask,n,v,u)))),
    weakly_directed:worlds.every(w=>worlds.every(u=>worlds.every(v=>
      !R(mask,n,w,u)||!R(mask,n,w,v)||
      worlds.some(t=>R(mask,n,u,t)&&R(mask,n,v,t)))))
  };
}
const names=Object.keys(formulas),results=Object.fromEntries(names.map(name=>
  [name,{property_frames:0,validity_frames:0,checked_valuation_world_cases:0}]));
const relationFacts={reflexive_serial:0,symmetric_transitive_iff_euclidean:0,
  symmetric_or_euclidean_weakly_directed:0,euclidean_weakly_connected:0,
  functional_serial:0};
let frames=0;
for(let n=1;n<=3;n++)for(let mask=0;mask<2**(n*n);mask++){
  frames++;
  const p=properties(mask,n);
  for(const name of names){
    let valid=true;
    for(const valuation of W(2**n))for(const w of W(n)){
      results[name].checked_valuation_world_cases++;
      if(!holds(formulas[name],w,mask,n,valuation))valid=false;
    }
    if(p[name])results[name].property_frames++;
    if(valid)results[name].validity_frames++;
    if(p[name]!==valid)throw new Error(`Correspondence mismatch ${name} n=${n} R=${mask}`);
  }
  const facts={
    reflexive_serial:!p.T||p.D,
    symmetric_transitive_iff_euclidean:!p.B||(p['4']===p['5']),
    symmetric_or_euclidean_weakly_directed:!(p.B||p['5'])||p.weakly_directed,
    euclidean_weakly_connected:!p['5']||p.weakly_connected,
    functional_serial:!p.functional||p.D
  };
  for(const [name,passes] of Object.entries(facts)){
    if(!passes)throw new Error(`Relation fact mismatch ${name} n=${n} R=${mask}`);
    relationFacts[name]++;
  }
}
if(frames!==530)throw new Error('Unexpected frame count');
const output={schema:'telugu-openlogic-batch074-finite-frame-correspondence/1',status:'pass',
  source_unit:'OLP-0423',frames,
  scope:'All directed relations on nonempty domains of one, two and three worlds; all valuations of p, all worlds, five characteristic schemas; five relation-property implications.',
  limitation:'Finite testing of p does not prove unrestricted all-frame correspondence or every substitution instance, nor replace the source proof.',
  correspondences:results,relation_facts:relationFacts};
fs.writeFileSync(path.join(root,'evidence','BATCH-074-FINITE-FRAME-CORRESPONDENCE.json'),
  JSON.stringify(output,null,2)+'\n','utf8');
console.log(JSON.stringify({frames,correspondences:results,relation_facts:relationFacts,status:'pass'}));
