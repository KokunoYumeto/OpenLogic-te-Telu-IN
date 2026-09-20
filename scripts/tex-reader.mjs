import katex from 'katex';
import {renderTeluguTokens} from './telugu-token-markup.mjs';

export const escapeHtml = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function realizeTokens(text, language='te') {
  if(language==='en') return text.replace(/!!(\^?)(a?)\{([^{}]+)\}(s?)/g,(_,cap,a,key,p)=>{
    let word=key+(p?'s':'');
    if(cap)word=word.charAt(0).toUpperCase()+word.slice(1);
    if(a)word=(cap?'A ':'a ')+word;
    return word;
  });
  return renderTeluguTokens(text);
}

function inflectToken(form,key,language) {
  if(language!=='en')return key;
  const plural={tableau:'tableaux'}[key]??(key.endsWith('y')&&!/[aeiou]y$/iu.test(key)?key.slice(0,-1)+'ies':/(?:s|x|z|ch|sh)$/iu.test(key)?key+'es':key+'s');
  let value=/^[Pp]$/u.test(form)?plural:key;
  if(/^[PS]$/u.test(form))value=value.charAt(0).toUpperCase()+value.slice(1);
  return value;
}

// Only an explicit, supported TeX subset is accepted. Unknown commands and
// unbalanced groups fail the build instead of disappearing from the reader.
export function parseTex(source) {
  let pos=0;
  const nodes=[];
  function space(){while(/\s/.test(source[pos]??'')&&pos<source.length)pos++;}
  function group(open='{',close='}') {
    space(); if(source[pos]!==open)throw new Error('Expected '+open+' at '+pos);
    const start=++pos;let depth=1;
    while(pos<source.length&&depth){
      if(source[pos]==='\\'){pos+=2;continue;}
      if(source[pos]===open)depth++;else if(source[pos]===close)depth--;
      pos++;
    }
    if(depth)throw new Error('Unclosed group at '+start);
    return source.slice(start,pos-1);
  }
  function parse(until) {
    const out=[];
    while(pos<source.length) {
      const start=pos, ch=source[pos];
      if(ch==='%'){const end=source.indexOf('\n',pos);pos=end<0?source.length:end;continue;}
      if(ch==='$'){
        const delimiter=source.startsWith('$$',pos)?'$$':'$';pos+=delimiter.length;
        const from=pos;let depth=0;
        while(pos<source.length){
          if(source[pos]==='\\'){pos+=2;continue;}
          if(source[pos]==='{'){depth++;pos++;continue;}
          if(source[pos]==='}'){depth--;if(depth<0)throw new Error('Unexpected closing brace in mathematics');pos++;continue;}
          if(depth===0&&source.startsWith(delimiter,pos))break;
          pos++;
        }
        if(pos===source.length)throw new Error('Unclosed inline mathematics');
        out.push({type:'math',tex:source.slice(from,pos),display:delimiter==='$$',start});pos+=delimiter.length;continue;
      }
      if(ch==='{'){out.push({type:'group',children:parseTex(group()),start});continue;}
      if(ch==='}')throw new Error('Unexpected closing brace at '+pos);
      if(ch!=='\\'){
        while(pos<source.length&&!['%','$','\\','{','}'].includes(source[pos]))pos++;
        out.push({type:'text',value:source.slice(start,pos),start});continue;
      }
      pos++;
      if(source[pos]==='['){
        pos++;const end=source.indexOf('\\]',pos);if(end<0)throw new Error('Unclosed display');
        out.push({type:'math',tex:source.slice(pos,end),display:true,start});pos=end+2;continue;
      }
      if(source[pos]==='('){
        pos++;const end=source.indexOf('\\)',pos);if(end<0)throw new Error('Unclosed inline mathematics');
        out.push({type:'math',tex:source.slice(pos,end),display:false,start});pos=end+2;continue;
      }
      const match=/^[\p{L}\p{M}]+\*?/u.exec(source.slice(pos));
      if(!match){
        const symbol=source[pos++]??'';
        const accents={'"':'\u0308',"'":'\u0301','`':'\u0300','^':'\u0302','~':'\u0303','=':'\u0304','.':'\u0307'};
        if(symbol in accents&&(source[pos]==='{'||/[A-Za-z]/.test(source[pos]??''))){
          const letter=source[pos]==='{'?group():source[pos++];
          if(!/^[A-Za-z]$/u.test(letter))throw new Error('Unsupported accent argument at '+start);
          out.push({type:'text',value:(letter+accents[symbol]).normalize('NFC'),start});
        }else out.push({type:'escaped',value:symbol,start,context:source.slice(Math.max(0,start-28),start+38)});
        continue;
      }
      const name=match[0];pos+=name.length;
      const modifier=name==='indcase'&&source[pos]==='!'?(pos++,'!'):null;
      if(name==='end'){
        const env=group();if(env!==until)throw new Error('Mismatched environment '+env+' / '+until);
        return out;
      }
      if(name==='begin'){
        const env=group();
        if(['align','align*','multline','multline*','equation','equation*','gather','gather*','eqnarray','eqnarray*'].includes(env)){
          const end=source.indexOf('\\end{'+env+'}',pos);if(end<0)throw new Error('Unclosed math environment '+env);
          out.push({type:'math',tex:source.slice(pos,end),env,display:true,start});pos=end+env.length+6;continue;
        }
        if(['defish','prooftree','derivation','oltableau','tableau','probtag','tabular','verbatim'].includes(env)){
          const marker='\\end{'+env+'}',end=source.indexOf(marker,pos);
          if(end<0)throw new Error('Unclosed raw environment '+env);
          out.push({type:env==='tabular'?'tabular':env==='verbatim'?'verbatim':'formal',name:env,raw:source.slice(pos,end),start});
          pos=end+marker.length;continue;
        }
        let option=null,arg=null;space();
        if(source[pos]==='[')option=group('[',']');
        if(env==='tagblock')arg=group();
        out.push({type:'environment',name:env,option,arg,children:parse(env),start});continue;
      }
      if(name==='string'){
        if(source[pos]!=='\\')throw new Error('Expected control sequence after \\string at '+start);
        pos++;const literal=/^[\p{L}\p{M}]+\*?/u.exec(source.slice(pos));
        const value='\\'+(literal?(pos+=literal[0].length,literal[0]):source[pos++]??'');
        out.push({type:'command',name,args:[value],options:[],start});continue;
      }
      const arities={documentclass:1,olpart:2,olchapter:3,olfileid:3,olsection:1,section:1,subsection:1,olimport:1,ollabel:1,olref:1,Olref:1,oliflabeldef:3,olasset:1,readerdiagram:1,intertext:1,H:1,l:0,S:0,P:0,'ను':0,'MPని':0,'QRతో':0,'dotsను':0,'dotsకు':0,item:0,setcounter:2,DeclareRobustCommand:2,usetoken:2,printtoken:2,caption:1,emph:1,textit:1,textbf:1,textrm:1,texttt:1,textsc:1,footnote:1,href:2,url:1,gitissue:1,label:1,ref:1,cref:1,Cref:1,sourcecorrection:2,cite:1,citealt:1,citeauthor:1,citep:1,citet:1,citeyear:1,startycommalist:0,ycomma:0,indcase:3,'indcase*':3,Intro:1,Elim:1,LeftR:1,RightR:1,TRule:2,Weakening:0,Contraction:0,Exchange:0,Cut:0,FalseInt:0,FalseCl:0,MP:0,QR:0,Hyp:0,TAss:0,Log:1,article:1,Article:1,sFmla:2};
      if(['OLEndPartHook','OLEndChapterHook','dots','ldots','par','noindent','textparagraph','centering','hfill','qquad','quad','small','large','Large','em'].includes(name)){out.push({type:'command',name,args:[],options:[],start});continue;}
      if(!(name in arities))throw new Error('Unsupported text command \\'+name+' at '+start);
      const options=[];space();while(source[pos]==='['){options.push(group('[',']'));space();}
      let args;
      try{args=Array.from({length:arities[name]},()=>group());}
      catch(error){throw new Error('Command \\'+name+' arguments at '+start+': '+error.message,{cause:error});}
      out.push({type:'command',name,args,options,modifier,start});
    }
    if(until)throw new Error('Unclosed environment '+until);
    return out;
  }
  nodes.push(...parse());return nodes;
}

const macros={
  '\\Setabs':'\\{#1:#2\\}', '\\Pow':'\\wp(#1)', '\\Nat':'\\mathbb{N}',
  '\\Int':'\\mathbb{Z}', '\\Rat':'\\mathbb{Q}', '\\Real':'\\mathbb{R}',
  '\\Bin':'\\mathbb{B}', '\\PosInt':'\\mathbb{Z}^{+}', '\\lif':'\\mathbin{\\rightarrow}',
  '\\liff':'\\mathbin{\\leftrightarrow}', '\\emptyseq':'\\Lambda',
  '\\tuple':'\\langle #1\\rangle', '\\len':'\\mathrm{len}(#1)', '\\Id':'\\mathrm{Id}_{#1}',
  '\\dom':'\\operatorname{dom}(#1)', '\\ran':'\\operatorname{ran}(#1)',
  '\\funfromto':'{}^{#1}{#2}', '\\funimage':'#1[#2]', '\\funrestrictionto':'#1|_{#2}',
  '\\comp':'#2\\circ #1', '\\pto':'\\rightharpoonup', '\\fdefined':'\\downarrow', '\\fundefined':'\\uparrow',
  '\\defis':'=', '\\cardle':'#1\\preceq #2', '\\cardless':'#1\\prec #2',
  '\\cardeq':'#1\\approx #2', '\\cardneq':'#1\\not\\approx #2',
  '\\closureofunder':'\\mathrm{clo}_{#1}(#2)', '\\equivrep':'[#1]_{#2}', '\\equivclass':'#1/_{#2}',
  '\\nicefrac':'{#1}/{#2}', '\\shoveleft':'#1','\\shoveright':'#1',
  '\\True':'\\mathbf{T}', '\\False':'\\mathbf{F}',
  '\\VDash':'\\mathrel{\\|\\!\\!-}',
  '\\Struct':'\\mathfrak{#1}', '\\Lang':'\\mathcal{#1}', '\\Log':'\\mathbf{#1}',
  '\\Obj':'\\mathsf{#1}', '\\Domain':'\\left|\\mathfrak{#1}\\right|',
  '\\Assign':'#1^{\\mathfrak{#2}}', '\\Value':'\\mathrm{Val}^{\\mathfrak{#2}}(#1)',
  '\\Atom':'#1(#2)', '\\fn':'\\mathrm{#1}', '\\Th':'\\mathbf{#1}',
  '\\Theory':'\\mathrm{Th}(\\mathfrak{#1})', '\\Expan':'(\\mathfrak{#1},#2)',
  '\\Sat':'\\mathfrak{#1}\\vDash #2', '\\pAssign':'\\mathfrak{#1}',
  '\\pSat':'\\mathfrak{#1}\\vDash #2', '\\mModel':'\\mathfrak{#1}',
  '\\mSat':'\\mathfrak{#1}\\Vdash #2', '\\Proves':'\\vdash',
  '\\Entails':'\\vDash', '\\Sequent':'\\Rightarrow', '\\fCenter':'\\,\\Rightarrow\\,',
  '\\lforall':'\\forall', '\\lexists':'\\exists', '\\eq':'=',
  '\\ident':'\\equiv', '\\lfalse':'\\bot', '\\ltrue':'\\top',
  '\\sFmla':'#1\\;#2', '\\TRule':'#2#1',
  '\\Subst':'#1[#2/#3]', '\\SSubst':'#1[#2]', '\\varAssign':'#1\\sim_{#3}#2',
  '\\Proj':'P^{#1}_{#2}', '\\Zero':'\\mathrm{zero}', '\\Succ':'\\mathrm{succ}',
  '\\Add':'\\mathrm{add}', '\\Mult':'\\mathrm{mult}', '\\Char':'\\chi_{#1}',
  '\\tsub':'\\mathbin{\\dot{-}}', '\\umin':'\\mu #1\\;#2',
  '\\bmin':'(\\mathrm{min}\\;#1)\\,#2', '\\bexists':'(\\exists #1)\\;#2',
  '\\bforall':'(\\forall #1)\\;#2', '\\cfind':'\\varphi_{#1}',
  '\\num':'\\overline{#1}', '\\gn':'\\ulcorner #1\\urcorner',
  '\\Frm':'\\mathrm{Frm}', '\\Trm':'\\mathrm{Trm}', '\\Var':'\\mathrm{Var}',
  '\\PVar':'\\mathrm{At}_0', '\\PIso':'\\mathcal{#1}', '\\PAx':'\\mathrm{Ax}_0',
  '\\Prov':'\\mathrm{Prov}', '\\OPrf':'\\mathsf{Prf}', '\\OProv':'\\mathsf{Prov}', '\\OCon':'\\mathsf{Con}',
  '\\QuantRank':'\\mathrm{qr}(#1)', '\\Discharge':'[#1]^{#2}',
  '\\Intro':'#1\\mathrm{Intro}', '\\Elim':'#1\\mathrm{Elim}',
  '\\LeftR':'#1\\mathrm{L}', '\\RightR':'#1\\mathrm{R}',
  '\\Weakening':'\\mathrm{W}', '\\Contraction':'\\mathrm{C}', '\\Exchange':'\\mathrm{X}',
  '\\MP':'\\mathrm{MP}', '\\QR':'\\mathrm{QR}', '\\FalseCl':'\\bot_C',
  '\\Complement':'\\overline{#1}', '\\Closureofunder':'\\mathrm{Clo}_{#1}(#2)',
  '\\Intequiv':'\\sim', '\\Ratequiv':'\\backsim', '\\Realequiv':'\\Bumpeq',
  '\\concat':'\\frown', '\\defiff':'\\Leftrightarrow', '\\fact':'#1!',
  '\\nszero':'\\mathbf{z}', '\\nssucc':'*', '\\nsplus':'\\oplus',
  '\\nstimes':'\\otimes', '\\nsless':'\\mathrel{⩹}',
  '\\TMendtape':'\\triangleright', '\\TMblank':'0', '\\TMstroke':'1',
  '\\TMright':'R', '\\TMleft':'L', '\\TMstay':'N', '\\TMtrans':'#1,#2,#3',
  '\\subst':'#1/#2', '\\substruct':'\\subseteq', '\\Part':'\\mathsf{P}(#1,#2)',
  '\\iddots':'⋰', '\\mbox':'\\text{#1}', '\\formula':'\\mathit{#1}'
};
const names={
 te:{defn:'నిర్వచనం',ex:'ఉదాహరణ',prop:'ప్రతిపాదన',thm:'సిద్ధాంతం',lem:'ఉపసిద్ధాంతం',cor:'పర్యవసానం',prob:'అభ్యాసం',proof:'నిరూపణ',figure:'పటం'},
 en:{defn:'Definition',ex:'Example',prop:'Proposition',thm:'Theorem',lem:'Lemma',cor:'Corollary',prob:'Exercise',proof:'Proof',figure:'Figure'}
};
function readDelimited(source,index,open,close) {
  while(/\s/u.test(source[index]??''))index++;
  if(source[index]!==open)return null;
  const start=++index;let depth=1;
  while(index<source.length&&depth){
    if(source[index]==='\\'){index+=2;continue;}
    if(source[index]===open)depth++;else if(source[index]===close)depth--;
    index++;
  }
  if(depth)throw new Error('Unclosed '+open+' group in mathematics');
  return {value:source.slice(start,index-1),end:index};
}
function rewriteMathCommand(source,name,handler) {
  const pattern=new RegExp('\\\\'+name+'(?![\\p{L}\\p{M}])','gu');
  let output='',last=0,match;
  while((match=pattern.exec(source))){
    if(match.index<last)continue;
    const result=handler(source,pattern.lastIndex);
    if(!result)continue;
    output+=source.slice(last,match.index)+result.text;last=result.end;pattern.lastIndex=result.end;
  }
  return output+source.slice(last);
}
function normalizeMathTex(input) {
  let tex=input;
  const mandatory=(source,index)=>readDelimited(source,index,'{','}');
  const optional=(source,index)=>readDelimited(source,index,'[',']');
  const paren=(source,index)=>readDelimited(source,index,'(',')');
  const fixedOptional=(name,args,render)=>{tex=rewriteMathCommand(tex,name,(source,index)=>{
    const values=[];let cursor=index;
    for(let i=0;i<args;i++){const group=mandatory(source,cursor);if(!group)return null;values.push(group.value);cursor=group.end;}
    const option=optional(source,cursor);if(option)cursor=option.end;
    return {text:render(values,option?.value),end:cursor};
  });};
  for(let pass=0;pass<12;pass++){
    const before=tex;
    for(const [name,symbol,unique] of [['lforall','\\forall',false],['lexists','\\exists',true],['lambd','\\lambda',false]])tex=rewriteMathCommand(tex,name,(source,index)=>{
      let cursor=index,bang='';if(unique&&source[cursor]==='!'){bang='!';cursor++;}
      const variable=optional(source,cursor);if(variable)cursor=variable.end;
      const body=optional(source,cursor);if(body)cursor=body.end;
      return {text:symbol+bang+(variable?' '+variable.value:'')+(body?'\\,'+body.value:''),end:cursor};
    });
    tex=rewriteMathCommand(tex,'eq',(source,index)=>{
      let cursor=index,negated=false;if(source[cursor]==='/'){negated=true;cursor++;}
      const left=optional(source,cursor);if(left)cursor=left.end;
      const right=optional(source,cursor);if(right)cursor=right.end;
      if(Boolean(left)!==Boolean(right))return null;
      return {text:left?'{'+left.value+(negated?'\\neq{}':'=')+right.value+'}':(negated?'\\neq{}':'='),end:cursor};
    });
    for(const [name,positive,negative,model] of [['Sat','\\vDash','\\not\\vDash','\\mathfrak'],['pSat','\\vDash','\\not\\vDash','\\mathfrak'],['mSat','\\Vdash','\\not\\Vdash','\\mathfrak']])tex=rewriteMathCommand(tex,name,(source,index)=>{
      let cursor=index,negated=false;if(source[cursor]==='/'){negated=true;cursor++;}
      const first=mandatory(source,cursor);if(!first)return null;cursor=first.end;
      const formula=mandatory(source,cursor);if(!formula)return null;cursor=formula.end;
      const context=optional(source,cursor);if(context)cursor=context.end;
      return {text:model+'{'+first.value+'}'+(context?','+context.value:'')+(negated?negative:positive)+' '+formula.value,end:cursor};
    });
    for(const [name,positive,negative] of [['Proves','\\vdash','\\not\\vdash'],['Entails','\\vDash','\\not\\vDash']])tex=rewriteMathCommand(tex,name,(source,index)=>{
      let cursor=index,negated=false;if(source[cursor]==='/'){negated=true;cursor++;}
      const subscript=optional(source,cursor);if(subscript)cursor=subscript.end;
      return {text:(negated?negative:positive)+(subscript?'_{'+subscript.value+'}':''),end:cursor};
    });
    fixedOptional('Value',2,([term,structure],assignment)=>'\\mathrm{Val}^{\\mathfrak{'+structure+'}}'+(assignment?'_{'+assignment+'}':'')+'('+term+')');
    fixedOptional('varAssign',3,([variant,base,variable],object)=>object?variant+'='+base+'['+object+'/'+variable+']':variant+'\\sim_{'+variable+'}'+base);
    fixedOptional('sFmla',2,([sign,formula],prefix)=>(prefix?prefix+'\\,':'')+sign+'\\;'+formula);
    fixedOptional('TRule',2,([sign,operator],line)=>operator+sign+(line?'\\,'+line:''));
    fixedOptional('Intro',1,([operator],line)=>operator+'\\mathrm{Intro}'+(line?'_{'+line+'}':''));
    fixedOptional('Elim',1,([operator],line)=>operator+'\\mathrm{Elim}'+(line?'_{'+line+'}':''));
    fixedOptional('cfind',1,([index],arity)=>'\\varphi_{'+index+'}'+(arity?'^{'+arity+'}':''));
    fixedOptional('Log',1,([logic],subscript)=>'\\mathbf{'+logic+'}'+(subscript?'_{'+subscript+'}':''));
    for(const [name,base] of [['Prov','\\mathrm{Prov}'],['OPrf','\\mathsf{Prf}'],['OProv','\\mathsf{Prov}'],['OCon','\\mathsf{Con}']])tex=rewriteMathCommand(tex,name,(source,index)=>{
      const option=optional(source,index);return {text:base+(option?'_{'+option.value+'}':''),end:option?.end??index};
    });
    for(const [name,positive,negative] of [['elemequiv','\\equiv','\\not\\equiv'],['iso','\\simeq','\\not\\simeq']])tex=rewriteMathCommand(tex,name,(source,index)=>{
      let cursor=index,negated=false;if(source[cursor]==='/'){negated=true;cursor++;}
      const option=optional(source,cursor);if(option)cursor=option.end;
      return {text:(negated?negative:positive)+(option?'_{'+option.value+'}':''),end:cursor};
    });
    for(const [name,base] of [['Frm','\\mathrm{Frm}'],['Trm','\\mathrm{Trm}']])tex=rewriteMathCommand(tex,name,(source,index)=>{
      const language=optional(source,index);return {text:base+(language?'(\\mathcal{'+language.value+'})':''),end:language?.end??index};
    });
    tex=rewriteMathCommand(tex,'pValue',(source,index)=>{
      const assignment=mandatory(source,index);if(!assignment)return null;let cursor=assignment.end;
      const formula=paren(source,cursor);if(formula)cursor=formula.end;
      const logic=optional(source,cursor);if(logic)cursor=logic.end;
      return {text:'\\overline{\\mathfrak{'+assignment.value+'}}'+(logic?'_{'+logic.value+'}':'')+(formula?'('+formula.value+')':''),end:cursor};
    });
    tex=rewriteMathCommand(tex,'Mod',(source,index)=>{
      let cursor=index;const language=optional(source,cursor);if(language)cursor=language.end;
      const logic=paren(source,cursor);if(logic)cursor=logic.end;
      const theory=mandatory(source,cursor);if(!theory)return null;cursor=theory.end;
      return {text:'\\mathrm{Mod}'+(language?'^{\\mathcal{'+language.value+'}}':'')+(logic?'_{'+logic.value+'}':'')+'('+theory.value+')',end:cursor};
    });
    tex=rewriteMathCommand(tex,'raisebox',(source,index)=>{
      const lift=mandatory(source,index);if(!lift)return null;
      const body=mandatory(source,lift.end);return body?{text:body.value,end:body.end}:null;
    });
    tex=rewriteMathCommand(tex,'tag',(source,index)=>{
      const body=mandatory(source,index);if(!body)return null;
      const label=body.value.trim().replace(/^\$|\$$/gu,'');
      return {text:'\\qquad\\text{(}'+label+'\\text{)}',end:body.end};
    });
    tex=rewriteMathCommand(tex,'intertext',(source,index)=>{
      const body=mandatory(source,index);if(!body)return null;
      const prose=body.value
        .replace(/\\MPని/gu,'MPని').replace(/\\QRతో/gu,'QRతో')
        .replace(/\\MP(?:\{\})?(?![\p{L}\p{M}])/gu,'MP')
        .replace(/\\QR(?:\{\})?(?![\p{L}\p{M}])/gu,'QR');
      return {text:'\\text{'+prose+'}',end:body.end};
    });
    if(tex===before)break;
  }
  return tex
    .replace(/\\begin\{array\}\{((?:[^{}]|\{[^{}]*\})*)\}/gu,(_,columns)=>'\\begin{array}{'+columns.replace(/@\{[^{}]*\}/gu,'')+'}')
    .replace(/\\centering\b/gu,'')
    .replace(/\\\//gu,'')
    .replace(/!([A-Z])/gu,'{$1}');
}
export class Reader {
  constructor({language='te',labels=new Map(),knownLabels=new Set(),assets,citationData=new Map(),collect=false,prefix=''}){
    Object.assign(this,{language,labels,knownLabels,assets,citationData,collect,prefix});
    this.part=0;this.chapter=0;this.section=0;this.statement=0;this.problem=0;this.figure=0;this.equation=0;
    this.identity=['','',''];this.currentRef={number:'',id:''};
    this.math=[];this.mathErrors=[];this.references=[];this.conditions=[];this.commands={};this.textRuns=[];this.footnotes=[];this.citationsUsed=new Set();this.listCommaStarted=false;
    this.labelEmissions=new Map();this.duplicateLabels=[];
  }
  refKey(options,key){
    if(options.length>3)throw new Error('Too many reference options');
    const parts=[...this.identity];
    options.forEach((x,i)=>parts[3-options.length+i]=x);
    return [...parts,key].join(':');
  }
  headingKey(){return [...this.identity,'sec'].join(':');}
  register(key,number){
    const occurrence=(this.labelEmissions.get(key)??0)+1;this.labelEmissions.set(key,occurrence);
    if(this.collect){
      if(this.labels.has(key))this.duplicateLabels.push({key,number,kept_number:this.labels.get(key).number,occurrence});
      else this.labels.set(key,{number,id:key});
    }
    const id=this.prefix+key+(occurrence>1?'--duplicate-'+occurrence:'');
    return '<span class="anchor" id="'+escapeHtml(id)+'"></span>';
  }
  rewriteMathReferences(source){
    for(const name of ['olref','Olref','ref','cref','Cref'])source=rewriteMathCommand(source,name,(text,index)=>{
      let cursor=index;const options=[];let option;
      while((option=readDelimited(text,cursor,'[',']'))){options.push(option.value);cursor=option.end;}
      const argument=readDelimited(text,cursor,'{','}');if(!argument)return null;cursor=argument.end;
      const keys=['ref','cref','Cref'].includes(name)?argument.value.split(',').map(value=>value.trim()).filter(Boolean):[this.refKey(options,argument.value)];
      const numbers=keys.map(key=>{
        const target=this.labels.get(key),knownMissing=!target&&this.knownLabels.has(key);
        this.references.push({key,resolved:!!target,known_missing:knownMissing,context:'math'});
        if(!target&&!knownMissing&&!this.collect)throw new Error('Unknown reference '+key);
        return String(target?.number??'[ref]');
      });
      return {text:numbers.join(', '),end:cursor};
    });
    return source;
  }
  renderMath(node){
    let anchors='';
    const sourceWithoutLabels=this.rewriteMathReferences(node.tex).replace(/\\(ollabel|label)\{([^{}]+)\}/gu,(_whole,command,label)=>{
      const number=this.chapter+'.'+(++this.equation),key=command==='label'?label:this.refKey([],label);
      anchors+=this.register(key,number);return '';
    });
    let tex=normalizeMathTex(sourceWithoutLabels);
    if(node.env){
      const env=node.env.startsWith('multline')?'gathered':node.env.startsWith('align')||node.env.startsWith('eqnarray')?'aligned':node.env.startsWith('gather')?'gathered':null;
      if(env)tex='\\begin{'+env+'}'+tex+'\\end{'+env+'}';
    }
    let html;
    try{html=katex.renderToString(tex,{displayMode:node.display,output:'mathml',throwOnError:true,strict:'ignore',trust:false,maxExpand:2000,macros:{...macros}});}
    catch(error){
      if(process.env.READER_DIAGNOSE_MATH!=='1')throw error;
      this.mathErrors.push({source:node.tex,render_tex:tex,error:error.message});
      html='<code class="math-error">'+escapeHtml(node.tex)+'</code>';
    }
    if(/<merror|katex-error/.test(html))throw new Error('Invalid semantic math');
    this.math.push({source:node.tex,render_tex:tex,display:node.display,environment:node.env??null});
    return anchors+'<'+(node.display?'div':'span')+' class="'+(node.display?'math-block':'inline-math')+'"'+(node.display?' tabindex="0" role="region" aria-label="'+(this.language==='te'?'గణిత సూత్రం':'Mathematical expression')+'"':'')+'>'+html+'</'+(node.display?'div':'span')+'>';
  }
  inline(raw){return this.renderNodes(parseTex(raw),true);}
  renderNodes(nodes,inline=false){
    let output='',paragraph='';
    const flush=()=>{if(paragraph.trim())output+=inline?paragraph:'<p>'+paragraph.trim()+'</p>';paragraph='';};
    const block=html=>{flush();output+=html;};
    for(const n of nodes){
      if(n.type==='text'){
        const chunks=n.value.replace(/~+/g,'\u00a0').replaceAll('``','“').replaceAll("''",'”').split(/(\n\s*\n)/);
        for(const chunk of chunks){if(/^\n\s*\n$/.test(chunk)){flush();}else {const value=chunk.replace(/\s*\n\s*/g,' ');paragraph+=escapeHtml(value);this.textRuns.push(value);}}
      }else if(n.type==='escaped'){
        const values={' ':' ','\n':' ','\r':' ', ',':'\u2009',';':'\u2005','!':'','-':'','/':'','@':'', '%':'%','&':'&','_':'_','#':'#','$':'$', '{':'{','}':'}','\\':'<br>'};
        if(!(n.value in values))throw new Error('Unknown escaped text '+JSON.stringify(n.value)+' near '+JSON.stringify(n.context));
        paragraph+=n.value==='\\'?'<br>':escapeHtml(values[n.value]);
        this.textRuns.push(n.value==='\\'?'\n':values[n.value]);
      }else if(n.type==='group')paragraph+=this.renderNodes(n.children,true);
      else if(n.type==='math'){const html=this.renderMath(n);if(n.display)block(html);else paragraph+=html;}
      else if(n.type==='environment'){
        const env=n.name;
        if(['document','explain','digress','tagblock','center','quote','intro','editorial','table','history'].includes(env)){
          const body=this.renderNodes(n.children);
          block(env==='tagblock'?'<div class="source-tag" data-source-tag="'+escapeHtml(n.arg)+'">'+body+'</div>':env==='center'||env==='table'?'<div class="center">'+body+'</div>':env==='quote'?'<blockquote>'+body+'</blockquote>':env==='editorial'?'<aside class="editorial">'+body+'</aside>':env==='intro'?'<section class="introduction">'+body+'</section>':env==='history'?'<aside class="history">'+body+'</aside>':body);
        }else if(env==='enumerate'||env==='itemize'){
          const items=[];let current=null,listStart=null;
          for(const child of n.children){
            if(child.type==='command'&&child.name==='item'){if(current)items.push(current);current={option:child.options[0]??'',nodes:[]};}
            else if(child.type==='command'&&child.name==='setcounter'){
              if(current)throw new Error('List counter reset after first item');
              if(!/^enum(?:i|ii|iii|iv)$/u.test(child.args[0])||!/^\d+$/u.test(child.args[1]))throw new Error('Unsupported list counter reset');
              listStart=Number(child.args[1])+1;
            }
            else {
              if(!current&&child.type==='text'&&!child.value.trim())continue;
              if(!current)throw new Error('Content before first list item');
              current.nodes.push(child);
            }
          }
          if(current)items.push(current);
          const tag=env==='enumerate'?'ol':'ul';
          const startAttr=tag==='ol'&&listStart!==null?' start="'+listStart+'"':'';
          block('<'+tag+startAttr+'>'+items.map(item=>'<li>'+(item.option?'<span class="item-label">'+this.inline(item.option)+'</span> ':'')+this.renderNodes(item.nodes)+'</li>').join('')+'</'+tag+'>');
        }else if(['defn','ex','prop','thm','lem','cor','prob','rem'].includes(env)){
          const count=env==='prob'?++this.problem:++this.statement;
          const number=[this.chapter,this.section,count].join('.');
          const previous=this.currentRef;this.currentRef={number,id:''};
          const label=env==='rem'?(this.language==='te'?'వ్యాఖ్య':'Remark'):names[this.language][env];
          const title=label+' '+number+(n.option?' ('+this.inline(n.option)+')':'');
          let body;
          if(n.children.some(child=>child.type==='command'&&child.name==='item')){
            const pre=[],items=[];let current=null;
            for(const child of n.children){
              if(child.type==='command'&&child.name==='item'){if(current)items.push(current);current={option:child.options[0]??'',nodes:[]};}
              else (current?current.nodes:pre).push(child);
            }
            if(current)items.push(current);
            body=this.renderNodes(pre)+(items.length?'<ul class="loose-items">'+items.map(item=>'<li>'+(item.option?'<span class="item-label">'+this.inline(item.option)+'</span> ':'')+this.renderNodes(item.nodes)+'</li>').join('')+'</ul>':'');
          }else body=this.renderNodes(n.children);
          this.currentRef=previous;
          block('<article class="statement '+env+'"><h4>'+title+'</h4>'+body+'</article>');
        }else if(env==='proof')block('<section class="proof"><h4>'+names[this.language].proof+'</h4>'+this.renderNodes(n.children)+'<span class="qed" aria-label="'+(this.language==='te'?'నిరూపణ ముగిసింది':'End of proof')+'">□</span></section>');
        else if(env==='figure'){
          const previous=this.currentRef;this.currentRef={number:this.chapter+'.'+(++this.figure),id:''};
          const body=this.renderNodes(n.children);this.currentRef=previous;
          block('<figure>'+body+'</figure>');
        }else throw new Error('Unsupported prose environment '+env);
      }else if(n.type==='tabular'){
        block(this.renderTabular(n.raw));
      }else if(n.type==='formal'){
        block(this.renderFormal(n.raw,n.name));
      }else if(n.type==='verbatim'){
        block('<pre class="verbatim">'+escapeHtml(n.raw.replace(/^\s+|\s+$/gu,''))+'</pre>');
      }else if(n.type==='command'){
        this.commands[n.name]=(this.commands[n.name]??0)+1;
        const [a,b,c]=n.args;
        if(['documentclass','olimport','OLEndPartHook','OLEndChapterHook','DeclareRobustCommand'].includes(n.name))continue;
        if(n.name==='olfileid'){this.identity=[a,b,c];continue;}
        if(n.name==='olpart'){
          this.part++;this.identity=[a,'',''];
          const key=[a,'','','part'].join(':');this.currentRef={number:String(this.part),id:key};
          block(this.register(key,String(this.part))+'<h1 class="part">'+this.inline(b)+'</h1>');
        }else if(n.name==='olchapter'){
          this.chapter++;this.section=0;this.figure=0;this.equation=0;this.identity=[a,b,''];
          const key=[a,b,'','chap'].join(':');this.currentRef={number:String(this.chapter),id:key};
          block(this.register(key,String(this.chapter))+'<h2 class="chapter">'+this.chapter+' '+this.inline(c)+'</h2>');
        }else if(n.name==='olsection'){
          this.section++;this.statement=0;this.problem=0;
          const key=this.headingKey(),number=this.chapter+'.'+this.section;
          this.currentRef={number,id:key};
          block(this.register(key,number)+'<h3>'+number+' '+this.inline(a)+'</h3>');
        }else if(n.name==='section'||n.name==='subsection'){
          block('<'+(n.name==='section'?'h4':'h5')+' class="'+n.name+'">'+this.inline(a)+'</'+(n.name==='section'?'h4':'h5')+'>');
        }else if(n.name==='ollabel'||n.name==='label'){
          const key=n.name==='label'?a:this.refKey([],a);
          paragraph+=this.register(key,this.currentRef.number);
        }else if(['olref','Olref','ref','cref','Cref'].includes(n.name)){
          const keys=['ref','cref','Cref'].includes(n.name)?a.split(',').map(value=>value.trim()).filter(Boolean):[this.refKey(n.options,a)];
          paragraph+=keys.map(key=>{
            const target=this.labels.get(key),knownMissing=!target&&this.knownLabels.has(key);
            this.references.push({key,resolved:!!target,known_missing:knownMissing,context:'prose'});
            if(!target&&!knownMissing&&!this.collect)throw new Error('Unknown reference '+key);
            if(target)return '<a href="#'+encodeURIComponent(this.prefix+target.id)+'">'+escapeHtml(target.number)+'</a>';
            return '<span class="reference-unavailable" data-reference="'+escapeHtml(key)+'" title="'+escapeHtml(key)+'">'+(this.language==='te'?'[బాహ్య సూచన]':'[external reference]')+'</span>';
          }).join(', ');
        }else if(n.name==='oliflabeldef'){
          const present=this.labels.has(a);
          this.conditions.push({label:a,selected:present?'true':'false',true_source:b,false_source:c});
          paragraph+=this.inline(present?b:c);
        }else if(['emph','textit','textbf','textrm','texttt','textsc'].includes(n.name)){
          const tag={emph:'em',textit:'i',textbf:'strong',textrm:'span',texttt:'code',textsc:'span'}[n.name];
          paragraph+='<'+tag+(n.name==='textsc'?' class="small-caps"':'')+'>'+this.inline(a)+'</'+tag+'>';
        }else if(n.name==='usetoken'||n.name==='printtoken'){
          const value=inflectToken(a,b,this.language);paragraph+=escapeHtml(value);this.textRuns.push(value);
        }else if(n.name==='string'){
          paragraph+=escapeHtml(a);this.textRuns.push(a);
        }else if(n.name==='olasset'){
          block(this.assets(a,this.language));
        }else if(n.name==='readerdiagram'){
          block(this.assets(a,this.language));
        }else if(n.name==='intertext'){
          block('<p>'+this.inline(a)+'</p>');
        }else if(n.name==='indcase'||n.name==='indcase*'){
          const prefix=n.name==='indcase*'
            ? this.renderMath({tex:a,display:false})+' '+(this.language==='te'?'పరమాణు సూత్రం: ':'is atomic: ')
            : this.renderMath({tex:a+' \\equiv '+b,display:false})+': ';
          const body=n.modifier==='!'
            ? (this.language==='te'?'అభ్యాసం.':'Exercise.')
            : this.inline(c.replace(/\\indfrmp?\b/gu,a).replace(/\\indcomplex\b/gu,b));
          paragraph+=prefix+body;
        }else if(['Intro','Elim','LeftR','RightR','TRule','Weakening','Contraction','Exchange','Cut','FalseInt','FalseCl','MP','QR','Hyp'].includes(n.name)){
          const tex={
            Intro:`{${a}}\\mathrm{Intro}${n.options[0]?`_{${n.options[0]}}`:''}`,
            Elim:`{${a}}\\mathrm{Elim}${n.options[0]?`_{${n.options[0]}}`:''}`,
            LeftR:`{${a}}\\mathrm{L}`,
            RightR:`{${a}}\\mathrm{R}`,
            TRule:`{${b}}{${a}}${n.options[0]?`\\,${n.options[0]}`:''}`,
            Weakening:'\\mathrm{W}',Contraction:'\\mathrm{C}',Exchange:'\\mathrm{X}',Cut:'\\mathrm{Cut}',
            FalseInt:'\\bot_I',FalseCl:'\\bot_C',MP:'\\mathrm{MP}',QR:'\\mathrm{QR}',Hyp:'\\mathrm{Hyp}'
          }[n.name];
          paragraph+=this.renderMath({tex,display:false});
        }else if(n.name==='TAss'){
          const value=this.language==='te'?'పరికల్పన':'Assumption';paragraph+=escapeHtml(value);this.textRuns.push(value);
        }else if(n.name==='Log'){
          paragraph+=this.renderMath({tex:`\\mathbf{${a}}${n.options[0]?`_{${n.options[0]}}`:''}`,display:false});
        }else if(n.name==='article'||n.name==='Article'){
          const value=this.language==='en'?(n.name==='Article'?'A ':'a '):'';paragraph+=value;this.textRuns.push(value);
        }else if(n.name==='sFmla'){
          paragraph+=this.renderMath({tex:(n.options[0]?n.options[0]+'\\,':'')+'{'+a+'}\\;'+b,display:false});
        }else if(n.name==='H'){
          const accented=(a+'\u030b').normalize('NFC');paragraph+=escapeHtml(accented);this.textRuns.push(accented);
        }else if(n.name==='l'){
          paragraph+='ł';this.textRuns.push('ł');
        }else if(n.name==='S'||n.name==='P'){
          const value=n.name==='S'?'§':'¶';paragraph+=value;this.textRuns.push(value);
        }else if(['ను','MPని','QRతో','dotsను','dotsకు'].includes(n.name)){
          const notation=n.name.startsWith('MP')?'\\mathrm{MP}':n.name.startsWith('QR')?'\\mathrm{QR}':n.name.startsWith('dots')?'\\ldots':null;
          if(notation)paragraph+=this.renderMath({tex:notation,display:false});
          const value=n.name.endsWith('ని')?' ను':n.name.endsWith('తో')?' తో':n.name.endsWith('కు')?' కు':' ను';
          paragraph+=escapeHtml(value);this.textRuns.push(value);
        }else if(n.name==='caption')block('<figcaption>'+names[this.language].figure+' '+this.currentRef.number+': '+this.inline(a)+'</figcaption>');
        else if(n.name==='footnote'){
          const number=this.footnotes.length+1,id=this.prefix+'fn-'+number,ref=this.prefix+'fnref-'+number;
          this.footnotes.push({number,id,ref,html:this.inline(a)});
          paragraph+='<sup class="footnote-ref"><a id="'+escapeHtml(ref)+'" href="#'+encodeURIComponent(id)+'" aria-label="'+(this.language==='te'?'పాదసూచిక ':'Footnote ')+number+'">'+number+'</a></sup>';
        }
        else if(n.name==='sourcecorrection')block('<aside class="source-correction" data-finding="'+escapeHtml(a)+'"><h4>'+(this.language==='te'?'మూల దిద్దుబాటు ':'Source correction ')+escapeHtml(a)+'</h4>'+this.inline(b)+'</aside>');
        else if(n.name==='startycommalist'){this.listCommaStarted=false;continue;}
        else if(n.name==='ycomma'){
          const value=this.listCommaStarted?', ':'';this.listCommaStarted=true;
          paragraph+=value;this.textRuns.push(value);
        }
        else if(n.name==='dots'||n.name==='ldots')paragraph+='…';
        else if(n.name==='textparagraph')paragraph+='§';
        else if(n.name==='qquad'||n.name==='quad'){const value=n.name==='qquad'?'\u2003\u2003':'\u2003';paragraph+=value;this.textRuns.push(value);}
        else if(['noindent','centering','hfill','small','large','Large','em'].includes(n.name))continue;
        else if(n.name==='par')flush();
        else if(n.name==='href'||n.name==='url'){
          if(!/^https?:\/\//.test(a))throw new Error('Unsafe hyperlink');
          paragraph+='<a href="'+escapeHtml(a)+'">'+(n.name==='url'?escapeHtml(a):this.inline(b))+'</a>';
        }else if(n.name==='gitissue'){
          if(!/^\d+$/u.test(a))throw new Error('Invalid issue number');
          paragraph+='<a href="https://github.com/OpenLogicProject/OpenLogic/issues/'+a+'">issue #'+a+'</a>';
        }else if(['cite','citealt','citeauthor','citep','citet','citeyear'].includes(n.name)){
          const keys=a.split(',').map(value=>value.trim()).filter(Boolean);
          if(!keys.length)throw new Error('Empty citation');
          const locator=n.options.length?this.inline(n.options.join('; ')):'';
          const links=keys.map(key=>{
            const record=this.citationData.get(key);
            if(!record)throw new Error('Unknown bibliography key '+key);
            this.citationsUsed.add(key);
            const contributors=(record.author||record.editor||key).split(/\s+and\s+/u).map(value=>value.trim()).filter(Boolean);
            const family=value=>value.includes(',')?value.split(',',1)[0].trim():value.split(/\s+/u).at(-1);
            const author=contributors.length>2?family(contributors[0])+' et al.':contributors.length===2?family(contributors[0])+' and '+family(contributors[1]):family(contributors[0]??key);
            const year=record.year||'n.d.';
            const label=n.name==='citeauthor'?author:n.name==='citeyear'?year:author+', '+year;
            return '<a class="citation" data-citation-command="'+escapeHtml(n.name)+'" data-citation-key="'+escapeHtml(key)+'" href="#bib-'+encodeURIComponent(key)+'">'+escapeHtml(label)+'</a>';
          }).join('; ')+(locator?', '+locator:'');
          paragraph+=n.name==='citet'?links.replace(/, ([^,;<]+)(?=<\/a>)/,' ($1)'):n.name==='citealt'||n.name==='citeauthor'||n.name==='citeyear'?links:'('+links+')';
        }else throw new Error('Unhandled command '+n.name);
      }else throw new Error('Unknown node type');
    }
    flush();return output;
  }

  renderTabular(raw){
    let source=raw.trim();
    if(source.startsWith('{')){
      let depth=0,end=-1;
      for(let i=0;i<source.length;i++){
        if(source[i]==='\\'){i++;continue;}
        if(source[i]==='{')depth++;else if(source[i]==='}'&&!--depth){end=i;break;}
      }
      if(end<0)throw new Error('Unclosed tabular column specification');
      source=source.slice(end+1);
    }
    source=source.replace(/\\hline\b|\\cline\{[^{}]+\}/gu,'');
    source=rewriteMathCommand(source,'multicolumn',(text,index)=>{
      const span=readDelimited(text,index,'{','}');if(!span)return null;
      const alignment=readDelimited(text,span.end,'{','}');if(!alignment)return null;
      const body=readDelimited(text,alignment.end,'{','}');return body?{text:body.value,end:body.end}:null;
    });
    source=rewriteMathCommand(source,'phantom',(text,index)=>{
      const body=readDelimited(text,index,'{','}');return body?{text:'',end:body.end}:null;
    });
    source=rewriteMathCommand(source,'TMtrans',(text,index)=>{
      const values=[];let cursor=index;
      for(let i=0;i<3;i++){const argument=readDelimited(text,cursor,'{','}');if(!argument)return null;values.push(argument.value);cursor=argument.end;}
      return {text:'$\\TMtrans{'+values.join('}{')+'}$',end:cursor};
    });
    const split=(value,kind)=>{
      const parts=[];let start=0,depth=0,math=false;
      for(let i=0;i<value.length;i++){
        if(value[i]==='$'){math=!math;continue;}
        if(math)continue;
        if(value[i]==='{')depth++;else if(value[i]==='}')depth--;
        if(depth)continue;
        if(kind==='row'&&value.startsWith('\\\\',i)){
          parts.push(value.slice(start,i));i++;while(value[i+1]==='['){const close=value.indexOf(']',i+2);if(close<0)break;i=close;}start=i+1;
        }else if(kind==='cell'&&value[i]==='&'){parts.push(value.slice(start,i));start=i+1;}
      }
      parts.push(value.slice(start));return parts;
    };
    const rows=split(source,'row').map(row=>split(row,'cell').map(cell=>cell.trim())).filter(row=>row.some(Boolean));
    if(!rows.length)throw new Error('Empty tabular environment');
    const width=Math.max(...rows.map(row=>row.length));
    if(rows.some(row=>row.length!==width))throw new Error('Inconsistent tabular row width');
    const make=(row,tag)=>'<tr>'+row.map(cell=>'<'+tag+'>'+this.inline(cell)+'</'+tag+'>').join('')+'</tr>';
    return '<div class="table-scroll"><table class="reader-table"><thead>'+make(rows[0],'th')+'</thead>'+(rows.length>1?'<tbody>'+rows.slice(1).map(row=>make(row,'td')).join('')+'</tbody>':'')+'</table></div>';
  }

  renderFormal(raw,name){
    const expressions=[];
    const add=tex=>{const cleaned=tex.trim().replace(/^\$|\$$/gu,'');if(cleaned)expressions.push(cleaned);};
    let pos=0;
    while(pos<raw.length){
      if(raw[pos]==='%'){const end=raw.indexOf('\n',pos);pos=end<0?raw.length:end+1;continue;}
      if(raw[pos]==='$'){
        const end=raw.indexOf('$',pos+1);if(end<0)throw new Error('Unclosed formal mathematics');
        add(raw.slice(pos+1,end));pos=end+1;continue;
      }
      const carrier=/^\\(?:AxiomC|UnaryInfC|BinaryInfC|TrinaryInfC|DeduceC)\s*\{/.exec(raw.slice(pos));
      if(carrier){
        const open=pos+carrier[0].lastIndexOf('{');let depth=1,end=open+1;
        while(end<raw.length&&depth){if(raw[end]==='\\'){end+=2;continue;}if(raw[end]==='{')depth++;else if(raw[end]==='}')depth--;end++;}
        if(depth)throw new Error('Unclosed formal command argument');
        const argument=raw.slice(open+1,end-1);
        if(!argument.includes('$'))add(argument);
        pos=end;continue;
      }
      const signed=/^\\sFmla\s*\{/.exec(raw.slice(pos));
      if(signed){
        const start=pos;let cursor=pos+signed[0].length-1,normalized=null;
        for(let groups=0;groups<2;groups++){
          const argumentStart=cursor+1;let depth=1;cursor++;
          while(cursor<raw.length&&depth){if(raw[cursor]==='\\'){cursor+=2;continue;}if(raw[cursor]==='{')depth++;else if(raw[cursor]==='}')depth--;cursor++;}
          if(depth)throw new Error('Unclosed signed formula');
          const argument=raw.slice(argumentStart,cursor-1);
          while(/\s/.test(raw[cursor]??''))cursor++;
          if(groups===0&&raw[cursor]!=='{'){
            const merged=/^(\\(?:True|False))\{([\s\S]*)\}$/u.exec(argument.trim());
            if(!merged)throw new Error('Malformed signed formula');
            normalized='\\sFmla{'+merged[1]+'}{'+merged[2]+'}';break;
          }
        }
        add(normalized??raw.slice(start,cursor));pos=cursor;continue;
      }
      pos++;
    }
    const title=this.language==='te'?'ఆధికారిక నిరూపణ ప్రదర్శన':'Formal proof display';
    const steps=expressions.length?'<ol class="formal-steps">'+expressions.map(tex=>'<li>'+this.renderMath({tex,display:true})+'</li>').join('')+'</ol>':'';
    return '<figure class="formal-display"><figcaption>'+title+'</figcaption>'+steps+'<details><summary>'+(this.language==='te'?'TeX మూలం':'TeX source')+'</summary><pre>'+escapeHtml(raw.trim())+'</pre></details></figure>';
  }
}
