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
        const from=pos;
        while(pos<source.length&&!source.startsWith(delimiter,pos)){if(source[pos]==='\\')pos++;pos++;}
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
      const match=/^[A-Za-z]+\*?/.exec(source.slice(pos));
      if(!match){
        const symbol=source[pos++]??'';
        if(symbol==='"'&&/[A-Za-z]/.test(source[pos]??'')){
          out.push({type:'text',value:(source[pos++]+'\u0308').normalize('NFC'),start});
        }else out.push({type:'escaped',value:symbol,start,context:source.slice(Math.max(0,start-28),start+38)});
        continue;
      }
      const name=match[0];pos+=name.length;
      if(name==='end'){
        const env=group();if(env!==until)throw new Error('Mismatched environment '+env+' / '+until);
        return out;
      }
      if(name==='begin'){
        const env=group();
        if(['align','align*','multline','multline*','equation','equation*','gather','gather*'].includes(env)){
          const end=source.indexOf('\\end{'+env+'}',pos);if(end<0)throw new Error('Unclosed math environment '+env);
          out.push({type:'math',tex:source.slice(pos,end),env,display:true,start});pos=end+env.length+6;continue;
        }
        let option=null,arg=null;space();
        if(source[pos]==='[')option=group('[',']');
        if(env==='tagblock')arg=group();
        out.push({type:'environment',name:env,option,arg,children:parse(env),start});continue;
      }
      const arities={documentclass:1,olchapter:3,olfileid:3,olsection:1,olimport:1,ollabel:1,olref:1,oliflabeldef:3,olasset:1,readerdiagram:1,intertext:1,H:1,item:0,caption:1,emph:1,textit:1,textbf:1,textrm:1,footnote:1,href:2,url:1,label:1,ref:1,cref:1,sourcecorrection:2,cite:1,citealt:1,citeauthor:1,citep:1,citet:1,citeyear:1};
      if(name==='OLEndChapterHook'||name==='dots'||name==='ldots'||name==='par'||name==='noindent'||name==='textparagraph'){out.push({type:'command',name,args:[],options:[],start});continue;}
      if(!(name in arities))throw new Error('Unsupported text command \\'+name+' at '+start);
      const options=[];space();while(source[pos]==='['){options.push(group('[',']'));space();}
      let args;
      try{args=Array.from({length:arities[name]},()=>group());}
      catch(error){throw new Error('Command \\'+name+' arguments at '+start+': '+error.message,{cause:error});}
      out.push({type:'command',name,args,options,start});
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
  '\\nicefrac':'{#1}/{#2}', '\\shoveleft':'#1','\\shoveright':'#1'
};
const names={
 te:{defn:'నిర్వచనం',ex:'ఉదాహరణ',prop:'ప్రతిపాదన',thm:'సిద్ధాంతం',lem:'ఉపసిద్ధాంతం',cor:'పర్యవసానం',prob:'అభ్యాసం',proof:'నిరూపణ',figure:'పటం'},
 en:{defn:'Definition',ex:'Example',prop:'Proposition',thm:'Theorem',lem:'Lemma',cor:'Corollary',prob:'Exercise',proof:'Proof',figure:'Figure'}
};
export class Reader {
  constructor({language='te',labels=new Map(),assets,citationData=new Map(),collect=false,prefix=''}){
    Object.assign(this,{language,labels,assets,citationData,collect,prefix});
    this.chapter=0;this.section=0;this.statement=0;this.problem=0;this.figure=0;
    this.identity=['','',''];this.currentRef={number:'',id:''};
    this.math=[];this.references=[];this.conditions=[];this.commands={};this.textRuns=[];this.footnotes=[];this.citationsUsed=new Set();
  }
  refKey(options,key){
    if(options.length>3)throw new Error('Too many reference options');
    const parts=[...this.identity];
    options.forEach((x,i)=>parts[3-options.length+i]=x);
    return [...parts,key].join(':');
  }
  headingKey(){return [...this.identity,'sec'].join(':');}
  register(key,number){
    if(this.collect){
      if(this.labels.has(key))throw new Error('Duplicate source label '+key);
      this.labels.set(key,{number,id:key});
    }
    return '<span class="anchor" id="'+escapeHtml(this.prefix+key)+'"></span>';
  }
  renderMath(node){
    let tex=node.tex;
    if(node.env){
      const env=node.env.startsWith('multline')?'gathered':node.env.startsWith('align')?'aligned':node.env.startsWith('gather')?'gathered':null;
      if(env)tex='\\begin{'+env+'}'+tex+'\\end{'+env+'}';
    }
    const html=katex.renderToString(tex,{displayMode:node.display,output:'mathml',throwOnError:true,strict:'ignore',trust:false,maxExpand:2000,macros:{...macros}});
    if(/<merror|katex-error/.test(html))throw new Error('Invalid semantic math');
    this.math.push({source:node.tex,render_tex:tex,display:node.display,environment:node.env??null});
    return '<'+(node.display?'div':'span')+' class="'+(node.display?'math-block':'inline-math')+'"'+(node.display?' tabindex="0" role="region" aria-label="'+(this.language==='te'?'గణిత సూత్రం':'Mathematical expression')+'"':'')+'>'+html+'</'+(node.display?'div':'span')+'>';
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
        const values={' ':' ', ',':'\u2009',';':'\u2005','!':'','-':'','/':'','@':'', '%':'%','&':'&','_':'_','#':'#','$':'$', '{':'{','}':'}','\\':'<br>'};
        if(!(n.value in values))throw new Error('Unknown escaped text '+JSON.stringify(n.value)+' near '+JSON.stringify(n.context));
        paragraph+=n.value==='\\'?'<br>':escapeHtml(values[n.value]);
        this.textRuns.push(n.value==='\\'?'\n':values[n.value]);
      }else if(n.type==='group')paragraph+=this.renderNodes(n.children,true);
      else if(n.type==='math'){const html=this.renderMath(n);if(n.display)block(html);else paragraph+=html;}
      else if(n.type==='environment'){
        const env=n.name;
        if(['document','explain','digress','tagblock','center','quote','intro','editorial'].includes(env)){
          const body=this.renderNodes(n.children);
          block(env==='tagblock'?'<div class="source-tag" data-source-tag="'+escapeHtml(n.arg)+'">'+body+'</div>':env==='center'?'<div class="center">'+body+'</div>':env==='quote'?'<blockquote>'+body+'</blockquote>':env==='editorial'?'<aside class="editorial">'+body+'</aside>':env==='intro'?'<section class="introduction">'+body+'</section>':body);
        }else if(env==='enumerate'){
          const items=[];let current=null;
          for(const child of n.children){
            if(child.type==='command'&&child.name==='item'){if(current)items.push(current);current={option:child.options[0]??'',nodes:[]};}
            else {if(!current)throw new Error('Content before first list item');current.nodes.push(child);}
          }
          if(current)items.push(current);
          block('<ol>'+items.map(item=>'<li>'+(item.option?'<span class="item-label">'+this.inline(item.option)+'</span> ':'')+this.renderNodes(item.nodes)+'</li>').join('')+'</ol>');
        }else if(['defn','ex','prop','thm','lem','cor','prob'].includes(env)){
          const count=env==='prob'?++this.problem:++this.statement;
          const number=[this.chapter,this.section,count].join('.');
          const previous=this.currentRef;this.currentRef={number,id:''};
          const title=names[this.language][env]+' '+number+(n.option?' ('+this.inline(n.option)+')':'');
          const body=this.renderNodes(n.children);this.currentRef=previous;
          block('<article class="statement '+env+'"><h4>'+title+'</h4>'+body+'</article>');
        }else if(env==='proof')block('<section class="proof"><h4>'+names[this.language].proof+'</h4>'+this.renderNodes(n.children)+'<span class="qed" aria-label="'+(this.language==='te'?'నిరూపణ ముగిసింది':'End of proof')+'">□</span></section>');
        else if(env==='figure'){
          const previous=this.currentRef;this.currentRef={number:this.chapter+'.'+(++this.figure),id:''};
          const body=this.renderNodes(n.children);this.currentRef=previous;
          block('<figure>'+body+'</figure>');
        }else throw new Error('Unsupported prose environment '+env);
      }else if(n.type==='command'){
        this.commands[n.name]=(this.commands[n.name]??0)+1;
        const [a,b,c]=n.args;
        if(['documentclass','olimport','OLEndChapterHook'].includes(n.name))continue;
        if(n.name==='olfileid'){this.identity=[a,b,c];continue;}
        if(n.name==='olchapter'){
          this.chapter++;this.section=0;this.figure=0;this.identity=[a,b,''];
          const key=[a,b,'','chap'].join(':');this.currentRef={number:String(this.chapter),id:key};
          block(this.register(key,String(this.chapter))+'<h2 class="chapter">'+this.chapter+' '+this.inline(c)+'</h2>');
        }else if(n.name==='olsection'){
          this.section++;this.statement=0;this.problem=0;
          const key=this.headingKey(),number=this.chapter+'.'+this.section;
          this.currentRef={number,id:key};
          block(this.register(key,number)+'<h3>'+number+' '+this.inline(a)+'</h3>');
        }else if(n.name==='ollabel'||n.name==='label'){
          const key=n.name==='label'?a:this.refKey([],a);
          paragraph+=this.register(key,this.currentRef.number);
        }else if(n.name==='olref'||n.name==='ref'||n.name==='cref'){
          const key=n.name==='ref'||n.name==='cref'?a:this.refKey(n.options,a),target=this.labels.get(key);
          this.references.push({key,resolved:!!target});
          if(!target&&!this.collect)throw new Error('Unresolved reference '+key);
          paragraph+='<a href="#'+encodeURIComponent(this.prefix+key)+'">'+escapeHtml(target?.number??'?')+'</a>';
        }else if(n.name==='oliflabeldef'){
          const present=this.labels.has(a);
          this.conditions.push({label:a,selected:present?'true':'false',true_source:b,false_source:c});
          paragraph+=this.inline(present?b:c);
        }else if(['emph','textit','textbf','textrm'].includes(n.name)){
          const tag={emph:'em',textit:'i',textbf:'strong',textrm:'span'}[n.name];paragraph+='<'+tag+'>'+this.inline(a)+'</'+tag+'>';
        }else if(n.name==='olasset'){
          block(this.assets(a,this.language));
        }else if(n.name==='readerdiagram'){
          block(this.assets(a,this.language));
        }else if(n.name==='intertext'){
          block('<p>'+this.inline(a)+'</p>');
        }else if(n.name==='H'){
          const accented=(a+'\u030b').normalize('NFC');paragraph+=escapeHtml(accented);this.textRuns.push(accented);
        }else if(n.name==='caption')block('<figcaption>'+names[this.language].figure+' '+this.currentRef.number+': '+this.inline(a)+'</figcaption>');
        else if(n.name==='footnote'){
          const number=this.footnotes.length+1,id=this.prefix+'fn-'+number,ref=this.prefix+'fnref-'+number;
          this.footnotes.push({number,id,ref,html:this.inline(a)});
          paragraph+='<sup class="footnote-ref"><a id="'+escapeHtml(ref)+'" href="#'+encodeURIComponent(id)+'" aria-label="'+(this.language==='te'?'పాదసూచిక ':'Footnote ')+number+'">'+number+'</a></sup>';
        }
        else if(n.name==='sourcecorrection')block('<aside class="source-correction" data-finding="'+escapeHtml(a)+'"><h4>'+(this.language==='te'?'మూల దిద్దుబాటు ':'Source correction ')+escapeHtml(a)+'</h4>'+this.inline(b)+'</aside>');
        else if(n.name==='dots'||n.name==='ldots')paragraph+='…';
        else if(n.name==='textparagraph')paragraph+='§';
        else if(n.name==='noindent')continue;
        else if(n.name==='par')flush();
        else if(n.name==='href'||n.name==='url'){
          if(!/^https?:\/\//.test(a))throw new Error('Unsafe hyperlink');
          paragraph+='<a href="'+escapeHtml(a)+'">'+(n.name==='url'?escapeHtml(a):this.inline(b))+'</a>';
        }else if(['cite','citealt','citeauthor','citep','citet','citeyear'].includes(n.name)){
          const keys=a.split(',').map(value=>value.trim()).filter(Boolean);
          if(!keys.length)throw new Error('Empty citation');
          const locator=n.options.length?this.inline(n.options.join('; ')):'';
          const links=keys.map(key=>{
            const record=this.citationData.get(key);
            if(!record)throw new Error('Unknown bibliography key '+key);
            this.citationsUsed.add(key);
            const author=record.author||record.editor||key,year=record.year||'n.d.';
            const label=n.name==='citeauthor'?author:n.name==='citeyear'?year:author+', '+year;
            return '<a class="citation" data-citation-command="'+escapeHtml(n.name)+'" data-citation-key="'+escapeHtml(key)+'" href="#bib-'+encodeURIComponent(key)+'">'+escapeHtml(label)+'</a>';
          }).join('; ')+(locator?', '+locator:'');
          paragraph+=n.name==='citet'?links.replace(/, ([^,;<]+)(?=<\/a>)/,' ($1)'):n.name==='citealt'||n.name==='citeauthor'||n.name==='citeyear'?links:'('+links+')';
        }else throw new Error('Unhandled command '+n.name);
      }else throw new Error('Unknown node type');
    }
    flush();return output;
  }
}
