import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const worlds=n=>[...Array(n).keys()];
const edge=(mask,n,u,v)=>Boolean(mask&(1<<(u*n+v)));
const box=a=>['box',a],imp=(a,b)=>['imp',a,b];
const lob=imp(box(imp(box('p'),'p')),box('p'));
function holds(f,w,mask,n,valuation){
  if(f==='p')return Boolean(valuation&(1<<w));
  const [op,a,b]=f;
  if(op==='box')return worlds(n).every(v=>!edge(mask,n,w,v)||holds(a,v,mask,n,valuation));
  if(op==='imp')return !holds(a,w,mask,n,valuation)||holds(b,w,mask,n,valuation);
  throw new Error('Unknown modal operator');
}
function transitive(mask,n){
  return worlds(n).every(u=>worlds(n).every(v=>worlds(n).every(w=>
    !edge(mask,n,u,v)||!edge(mask,n,v,w)||edge(mask,n,u,w))));
}
function acyclic(mask,n){
  const seen=new Set(),active=new Set();
  function visit(u){
    if(active.has(u))return false;
    if(seen.has(u))return true;
    active.add(u);
    for(const v of worlds(n))if(edge(mask,n,u,v)&&!visit(v))return false;
    active.delete(u);seen.add(u);return true;
  }
  return worlds(n).every(visit);
}
function equivalence(mask,n){
  return worlds(n).every(u=>edge(mask,n,u,u))&&
    worlds(n).every(u=>worlds(n).every(v=>!edge(mask,n,u,v)||edge(mask,n,v,u)))&&
    transitive(mask,n);
}
const out={schema:'telugu-openlogic-batch075-finite-definability/1',status:'pass',
  source_unit:'OLP-0424',frames:0,lob_correspondence:{transitive_converse_well_founded:0,
    modal_validity:0,valuation_world_cases:0},equivalence_nonuniversal_frames:0,
  finite_chain_models_checked:0,
  scope:'All directed relations on one to three worlds, every p valuation and world for the Loeb W schema; finite strict-order witnesses for k=1 to 5.',
  limitation:'Finite acyclicity is converse well-foundedness only on finite frames. This test neither proves the unrestricted Loeb correspondence, first-order nondefinability by Compactness, nor modal indistinguishability of universal and equivalence frames.'};
for(let n=1;n<=3;n++)for(let mask=0;mask<2**(n*n);mask++){
  out.frames++;
  const property=transitive(mask,n)&&acyclic(mask,n);
  let valid=true;
  for(let valuation=0;valuation<2**n;valuation++)for(const w of worlds(n)){
    out.lob_correspondence.valuation_world_cases++;
    if(!holds(lob,w,mask,n,valuation))valid=false;
  }
  if(property)out.lob_correspondence.transitive_converse_well_founded++;
  if(valid)out.lob_correspondence.modal_validity++;
  if(property!==valid)throw new Error(`Loeb correspondence mismatch: n=${n}, R=${mask}`);
  if(equivalence(mask,n)&&worlds(n).some(u=>worlds(n).some(v=>!edge(mask,n,u,v))))
    out.equivalence_nonuniversal_frames++;
}
for(let k=1;k<=5;k++){
  const relation=(u,v)=>u<v;
  for(const u of worlds(k))for(const v of worlds(k))for(const w of worlds(k))
    if(relation(u,v)&&relation(v,w)&&!relation(u,w))
      throw new Error('Finite order is not transitive');
  for(let i=2;i<=k;i++)for(let j=0;j<i-1;j++)
    if(!relation(j,j+1))throw new Error(`Missing chain edge k=${k} i=${i} j=${j}`);
  out.finite_chain_models_checked++;
}
if(out.frames!==530||out.equivalence_nonuniversal_frames===0||
   out.finite_chain_models_checked!==5)throw new Error('Unexpected finite-check totals');
fs.writeFileSync(path.join(root,'evidence','BATCH-075-FINITE-DEFINABILITY-CHECK.json'),
  JSON.stringify(out,null,2)+'\n','utf8');
console.log(JSON.stringify({frames:out.frames,lob:out.lob_correspondence,
  equivalence_nonuniversal_frames:out.equivalence_nonuniversal_frames,
  finite_chain_models_checked:out.finite_chain_models_checked,status:out.status}));
