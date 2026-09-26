import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const worlds=n=>[...Array(n).keys()];
const edge=(mask,n,u,v)=>Boolean(mask&(1<<(u*n+v)));
const all=(n,test)=>worlds(n).every(test);
const reflexive=(mask,n)=>all(n,u=>edge(mask,n,u,u));
const symmetric=(mask,n)=>all(n,u=>all(n,v=>!edge(mask,n,u,v)||edge(mask,n,v,u)));
const transitive=(mask,n)=>all(n,u=>all(n,v=>all(n,w=>
  !edge(mask,n,u,v)||!edge(mask,n,v,w)||edge(mask,n,u,w))));
const serial=(mask,n)=>all(n,u=>worlds(n).some(v=>edge(mask,n,u,v)));
const euclidean=(mask,n)=>all(n,w=>all(n,u=>all(n,v=>
  !edge(mask,n,w,u)||!edge(mask,n,w,v)||edge(mask,n,u,v))));
const box=a=>['box',a],dia=a=>['dia',a],neg=a=>['not',a],
  and=(a,b)=>['and',a,b],imp=(a,b)=>['imp',a,b];
const samples=['p','q',neg('p'),box('p'),dia('q'),
  box(dia('p')),dia(box('q')),imp('p',box('q')),
  box(imp(dia('p'),'q')),dia(and(box('p'),neg('q')))];
function holds(f,w,domain,relation,valuation){
  if(f==='p'||f==='q')return Boolean(valuation[f]&(1<<w));
  const [op,a,b]=f;
  if(op==='box')return domain.every(v=>!relation(w,v)||holds(a,v,domain,relation,valuation));
  if(op==='dia')return domain.some(v=>relation(w,v)&&holds(a,v,domain,relation,valuation));
  if(op==='not')return !holds(a,w,domain,relation,valuation);
  if(op==='and')return holds(a,w,domain,relation,valuation)&&holds(b,w,domain,relation,valuation);
  if(op==='imp')return !holds(a,w,domain,relation,valuation)||holds(b,w,domain,relation,valuation);
  throw new Error('Unknown modal operator');
}
const out={schema:'telugu-openlogic-batch076-equivalence-s5-finite/1',status:'pass',
  source_unit:'OLP-0425',frames:0,equivalence_frames:0,universal_frames:0,
  nonuniversal_equivalence_frames:0,condition_comparisons:0,
  partition_checks:0,restriction_truth_cases:0,sample_formulas:samples.length,
  scope:'Every directed relation on one to three worlds for the four equivalence conditions; each equivalence class and all p/q valuations for ten sample modal formulas under class restriction.',
  limitation:'Finite enumeration and ten formulas do not prove the unrestricted S5 frame-validity equivalence or induction for every modal formula.'};
for(let n=1;n<=3;n++)for(let mask=0;mask<2**(n*n);mask++){
  out.frames++;
  const eq=reflexive(mask,n)&&symmetric(mask,n)&&transitive(mask,n);
  const conditions=[eq,reflexive(mask,n)&&euclidean(mask,n),
    serial(mask,n)&&symmetric(mask,n)&&euclidean(mask,n),
    serial(mask,n)&&symmetric(mask,n)&&transitive(mask,n)];
  for(const test of conditions){
    out.condition_comparisons++;
    if(test!==eq)throw new Error(`Equivalence condition mismatch n=${n} R=${mask}`);
  }
  const universal=all(n,u=>all(n,v=>edge(mask,n,u,v)));
  if(universal)out.universal_frames++;
  if(!eq)continue;
  out.equivalence_frames++;
  if(!universal)out.nonuniversal_equivalence_frames++;
  const classes=worlds(n).map(w=>worlds(n).filter(v=>edge(mask,n,w,v)));
  for(const [w,group] of classes.entries()){
    out.partition_checks++;
    if(!group.includes(w)||!group.every(u=>group.every(v=>edge(mask,n,u,v)))||
       !worlds(n).every(v=>{
         const other=classes[v],intersection=group.some(u=>other.includes(u));
         return !intersection||group.length===other.length&&group.every(u=>other.includes(u));
       }))throw new Error(`Class partition mismatch n=${n} R=${mask} w=${w}`);
    for(let p=0;p<2**n;p++)for(let q=0;q<2**n;q++)for(const u of group)
      for(const f of samples){
        out.restriction_truth_cases++;
        const valuation={p,q};
        const original=holds(f,u,worlds(n),(a,b)=>edge(mask,n,a,b),valuation);
        const restricted=holds(f,u,group,()=>true,valuation);
        if(original!==restricted)
          throw new Error(`Class restriction mismatch n=${n} R=${mask} w=${w} u=${u}`);
      }
  }
}
if(out.frames!==530||out.equivalence_frames!==8||out.universal_frames!==3||
   out.nonuniversal_equivalence_frames!==5||out.condition_comparisons!==2120)
  throw new Error('Unexpected frame totals');
fs.writeFileSync(path.join(root,'evidence','BATCH-076-EQUIVALENCE-S5-FINITE-CHECK.json'),
  JSON.stringify(out,null,2)+'\n','utf8');
console.log(JSON.stringify({frames:out.frames,equivalence_frames:out.equivalence_frames,
  nonuniversal_equivalence_frames:out.nonuniversal_equivalence_frames,
  condition_comparisons:out.condition_comparisons,
  restriction_truth_cases:out.restriction_truth_cases,status:out.status}));
