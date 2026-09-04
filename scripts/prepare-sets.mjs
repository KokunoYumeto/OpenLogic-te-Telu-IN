import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const base='translation/content/sets-functions-relations/sets/';
const files=['sets','basics','subsets','important-sets','unions-and-intersections','pairs-and-products','russells-paradox'];
const cases={acc:['మూలకాన్ని','మూలకాలను'],gen:['మూలకపు','మూలకాల'],loc:['మూలకంలో','మూలకాలలో'],dat:['మూలకానికి','మూలకాలకు']};
const receipt=[];
function explicitMathTextFonts(text) {
 let out='',at=0;
 while(at<text.length){
  const start=text.indexOf('\\text{',at);
  if(start<0)return out+text.slice(at);
  out+=text.slice(at,start);
  let end=start+6,depth=1;
  while(end<text.length&&depth){if(text[end]==='{')depth++;else if(text[end]==='}')depth--;end++;}
  if(depth)throw new Error('Unbalanced mathematical text');
  const content=text.slice(start+6,end-1);
  const font=/[\u0C00-\u0C7F]/.test(content)?'\\telugufont{}':'\\rmfamily{}';
  out+='\\text{'+font+explicitMathTextFonts(content)+'}';
  at=end;
 }
 return out;
}
const chunks=files.map((name,index)=>{
 const input=fs.readFileSync(path.join(root,base+name+'.tex'),'utf8');
 let body=input.split('\\begin{document}')[1]?.split('\\end{document}')[0];
 if(body===undefined) throw new Error('Missing document boundary: '+name);
 body=body.replace(/\\olimport\{[^}]+\}/g,'').replace('\\OLEndChapterHook','');
 body=body.replace(/\\tecase\{(acc|gen|loc|dat)\}\{!!(a?)\{element\}(s?)\}/g,(_,c,a,p)=>(a?'ఒక ':'')+cases[c][p?1:0]);
 body=body.replace(/!!a\{element\}/g,'ఒక మూలకం').replace(/!!\{element\}s/g,'మూలకాలు').replace(/!!\{element\}/g,'మూలకం');
 body=explicitMathTextFonts(body);
 // Unicode-class transitions alone can inherit the math font after text-mode
 // ellipses. Select the family for each whole Telugu run, retaining joiners
 // inside the shaping unit and leaving editable translation bytes unchanged.
 body=body.replace(/[\u0C00-\u0C7F][\u0C00-\u0C7F\u200C\u200D]*/g,word=>'{\\telugufont '+word+'}');
 if(body.includes('!!')||body.includes('\\tecase'))throw new Error('Unresolved text token: '+name);
 receipt.push({unit_id:'OLP-'+String(index+4).padStart(4,'0'),translation_path:base+name+'.tex',translation_sha256:sha(input),render_body_sha256:sha(body),operations:['strip subfile document wrapper','expand chapter imports in frozen order','realize Telugu text-token number and grammatical case','select explicit Telugu/Latin font at mathematical text boundaries and whole Telugu shaping runs']});
 return '% '+receipt.at(-1).unit_id+'\n'+body;
});
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/sets-body.tex'),chunks.join('\n'));
fs.writeFileSync(path.join(root,'build/sets-render-manifest.json'),JSON.stringify({schema:'openlogic-te-sets-render/1',units:receipt},null,2)+'\n');
console.log(JSON.stringify({rendered_units:receipt.length,body_sha256:sha(chunks.join('\n'))}));
