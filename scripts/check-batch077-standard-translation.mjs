import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const sourcePath='upstream/content/normal-modal-logic/frame-definability/second-order-definability.tex';
const targetPath='translation/content/normal-modal-logic/frame-definability/second-order-definability.tex';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const source=fs.readFileSync(path.join(root,sourcePath));
const target=fs.readFileSync(path.join(root,targetPath));
if(source.length!==6676||sha(source)!=='1b4691078284c0f45e4ec808398c3952649ec79732167d7b2d6a1ce7ad974490')
  throw new Error('Frozen OLP-0426 source mismatch');

const F=['false'],T=['true'],p=['atom','p'],q=['atom','q'];
const formulas=[F,T,p,q,['not',p],['and',p,q],['or',p,q],['if',p,q],['iff',p,q],
  ['box',p],['diamond',p],['box',['if',p,['diamond',q]]],
  ['if',['box',p],p],['box',['diamond',p]]];
const contains=(mask,i)=>Boolean(mask&(1<<i));
const succ=(rel,n,x,y)=>contains(rel,x*n+y);
function modal(f,rel,val,n,w){
  const [op,a,b]=f;
  switch(op){
    case 'false':return false;
    case 'true':return true;
    case 'atom':return contains(val[a],w);
    case 'not':return !modal(a,rel,val,n,w);
    case 'and':return modal(a,rel,val,n,w)&&modal(b,rel,val,n,w);
    case 'or':return modal(a,rel,val,n,w)||modal(b,rel,val,n,w);
    case 'if':return !modal(a,rel,val,n,w)||modal(b,rel,val,n,w);
    case 'iff':return modal(a,rel,val,n,w)===modal(b,rel,val,n,w);
    case 'box':return Array.from({length:n},(_,y)=>!succ(rel,n,w,y)||modal(a,rel,val,n,y)).every(Boolean);
    case 'diamond':return Array.from({length:n},(_,y)=>succ(rel,n,w,y)&&modal(a,rel,val,n,y)).some(Boolean);
    default:throw new Error('Unknown modal connective '+op);
  }
}
function standard(f,x='x',depth=0){
  const [op,a,b]=f;
  if(op==='false'||op==='true')return f;
  if(op==='atom')return ['pred',a,x];
  if(op==='not')return ['not',standard(a,x,depth)];
  if(['and','or','if','iff'].includes(op))return [op,standard(a,x,depth),standard(b,x,depth)];
  const y='y'+depth;
  if(op==='box')return ['forall',y,['if',['edge',x,y],standard(a,y,depth+1)]];
  if(op==='diamond')return ['exists',y,['and',['edge',x,y],standard(a,y,depth+1)]];
  throw new Error('Unknown standard-translation case '+op);
}
function firstOrder(f,rel,val,n,env){
  const [op,a,b]=f;
  switch(op){
    case 'false':return false;
    case 'true':return true;
    case 'pred':return contains(val[a],env[b]);
    case 'edge':return succ(rel,n,env[a],env[b]);
    case 'not':return !firstOrder(a,rel,val,n,env);
    case 'and':return firstOrder(a,rel,val,n,env)&&firstOrder(b,rel,val,n,env);
    case 'or':return firstOrder(a,rel,val,n,env)||firstOrder(b,rel,val,n,env);
    case 'if':return !firstOrder(a,rel,val,n,env)||firstOrder(b,rel,val,n,env);
    case 'iff':return firstOrder(a,rel,val,n,env)===firstOrder(b,rel,val,n,env);
    case 'forall':return Array.from({length:n},(_,v)=>firstOrder(b,rel,val,n,{...env,[a]:v})).every(Boolean);
    case 'exists':return Array.from({length:n},(_,v)=>firstOrder(b,rel,val,n,{...env,[a]:v})).some(Boolean);
    default:throw new Error('Unknown first-order case '+op);
  }
}

let frames=0,worldCases=0,reflexiveFrames=0,nonreflexiveFrames=0;
let monadicWorldSetCases=0;
const translated=formulas.map(f=>standard(f));
const boxPImpliesP=standard(['if',['box',p],p]);
for(let n=1;n<=3;n++)for(let rel=0;rel<2**(n*n);rel++){
  frames++;
  for(let vp=0;vp<2**n;vp++)for(let vq=0;vq<2**n;vq++){
    const val={p:vp,q:vq};
    for(let w=0;w<n;w++)for(let k=0;k<formulas.length;k++){
      if(modal(formulas[k],rel,val,n,w)!==firstOrder(translated[k],rel,val,n,{x:w}))
        throw new Error(`Standard-translation mismatch n=${n} rel=${rel} vp=${vp} vq=${vq} w=${w} f=${k}`);
      worldCases++;
    }
  }
  let monadicSentence=true;
  for(let X=0;X<2**n;X++)for(let w=0;w<n;w++){
    if(!firstOrder(boxPImpliesP,rel,{p:X},n,{x:w}))monadicSentence=false;
    monadicWorldSetCases++;
  }
  const reflexive=Array.from({length:n},(_,w)=>succ(rel,n,w,w)).every(Boolean);
  if(monadicSentence!==reflexive)throw new Error(`Reflexivity mismatch n=${n} rel=${rel}`);
  if(reflexive)reflexiveFrames++;else nonreflexiveFrames++;
}
const result={
  schema:'telugu-openlogic-batch077-finite-check/1',
  scope:'All directed binary relations on 1–3 nonempty worlds; all two-variable valuations for 14 chosen modal formulas, with independently evaluated recursive standard translations; all unary subsets for the monadic translation of box p implies p.',
  source_sha256:sha(source),target_sha256:sha(target),
  frames,formulas:formulas.length,standard_translation_world_cases:worldCases,
  monadic_reflexivity_world_set_cases:monadicWorldSetCases,
  reflexive_frames:reflexiveFrames,nonreflexive_frames:nonreflexiveFrames,
  result:'pass',limit:'Finite examples only; not a proof for arbitrary frames/formulas or of the last undecidability claim.'
};
const out=path.join(root,'evidence/BATCH-077-STANDARD-TRANSLATION-FINITE-CHECK.json');
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
