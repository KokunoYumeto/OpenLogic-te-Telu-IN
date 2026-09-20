function commandAt(source,index,name){
  if(!source.startsWith('\\'+name,index))return false;
  return !/[A-Za-z@]/.test(source[index+name.length+1]??'');
}

function skipSpace(source,index){
  for(;;){
    while(/\s/.test(source[index]??''))index++;
    if(source[index]!=='%')break;
    const newline=source.indexOf('\n',index);
    index=newline<0?source.length:newline+1;
  }
  return index;
}

function readDelimited(source,index,open='{',close='}'){
  index=skipSpace(source,index);
  if(source[index]!==open)throw new Error('Expected '+open+' at '+index);
  const contentStart=++index;
  let depth=1;
  while(index<source.length&&depth){
    if(source[index]==='%'){
      const newline=source.indexOf('\n',index);
      index=newline<0?source.length:newline+1;
      continue;
    }
    if(source[index]==='\\'){
      index+=Math.min(2,source.length-index);
      continue;
    }
    if(source[index]===open)depth++;
    else if(source[index]===close)depth--;
    index++;
  }
  if(depth)throw new Error('Unclosed '+open+' group at '+contentStart);
  return {content:source.slice(contentStart,index-1),end:index};
}

function readOptionalFalseBranch(source,index){
  return source[skipSpace(source,index)]==='{'?readDelimited(source,index):{content:'',end:index};
}

function setTags(tags,csv,value){
  for(const raw of csv.split(',')){
    const tag=raw.trim();
    if(!tag)continue;
    tags.set(tag,value);
    tags.set('not'+tag,!value);
  }
}

function anyTag(tags,csv){
  const names=csv.split(',').map(x=>x.trim()).filter(Boolean);
  if(!names.length)throw new Error('Empty selective tag list');
  for(const name of names){
    if(!tags.has(name))throw new Error('Undefined selective tag '+name);
    if(tags.get(name))return true;
  }
  return false;
}

function activeTagCount(tags,csv){
  return csv.split(',').map(x=>x.trim()).filter(Boolean).filter(name=>{
    if(!tags.has(name))throw new Error('Undefined selective tag '+name);
    return tags.get(name);
  }).length;
}

function environmentEnd(source,index,name){
  let depth=1,pos=index;
  const begin='\\begin{'+name+'}',end='\\end{'+name+'}';
  while(pos<source.length){
    if(source[pos]==='%'){
      const newline=source.indexOf('\n',pos);
      pos=newline<0?source.length:newline+1;
      continue;
    }
    if(source.startsWith(begin,pos)){depth++;pos+=begin.length;continue;}
    if(source.startsWith(end,pos)){
      depth--;
      if(!depth)return {bodyEnd:pos,end:pos+end.length};
      pos+=end.length;
      continue;
    }
    pos++;
  }
  throw new Error('Unclosed selective environment '+name);
}

function nextCommand(source,index,name){
  let pos=index;
  while(pos<source.length){
    if(source[pos]==='%'){
      const newline=source.indexOf('\n',pos);
      pos=newline<0?source.length:newline+1;
      continue;
    }
    if(commandAt(source,pos,name))return pos;
    pos++;
  }
  return -1;
}

function taggedReferences(raw,tags){
  const output=[];
  let pos=0;
  while(pos<raw.length){
    while(/[\s,]/.test(raw[pos]??''))pos++;
    if(pos>=raw.length)break;
    const slash=raw.indexOf('/',pos);
    if(slash<0)throw new Error('Malformed tagged reference list');
    const tag=raw.slice(pos,slash).trim();
    const label=readDelimited(raw,slash+1);
    if(!tag||!tags.has(tag))throw new Error('Undefined tagged-reference tag '+tag);
    if(tags.get(tag))output.push('\\ref{'+label.content+'}');
    pos=label.end;
    while(/\s/.test(raw[pos]??''))pos++;
    if(pos<raw.length&&raw[pos]!==',')throw new Error('Malformed tagged reference separator at '+pos);
  }
  return output.join(', ');
}

export function defaultTagsFromConfig(source){
  const tags=new Map();
  const pattern=/\\tag(true|false)\{([^{}]*)\}/g;
  for(const match of source.matchAll(pattern))setTags(tags,match[2],match[1]==='true');
  if(!tags.size)throw new Error('No default selective tags found');
  return tags;
}

export function projectSelectiveTex(source,defaults){
  function project(fragment,tags,context={tagItemAsItem:true}){
    let output='',pos=0;
    while(pos<fragment.length){
      if(fragment[pos]==='%'){
        const newline=fragment.indexOf('\n',pos);
        const end=newline<0?fragment.length:newline+1;
        output+=fragment.slice(pos,end);pos=end;continue;
      }
      if(commandAt(fragment,pos,'tagtrue')||commandAt(fragment,pos,'tagfalse')){
        const value=commandAt(fragment,pos,'tagtrue');
        const name=value?'tagtrue':'tagfalse';
        const arg=readDelimited(fragment,pos+name.length+1);
        setTags(tags,arg.content,value);pos=arg.end;continue;
      }
      if(commandAt(fragment,pos,'iftag')){
        const condition=readDelimited(fragment,pos+6);
        const yes=readDelimited(fragment,condition.end);
        // A handful of frozen upstream calls omit the empty false branch.
        // TeX only behaves as intended for those because their tag is true;
        // project the evident empty branch without changing source bytes.
        const no=readOptionalFalseBranch(fragment,yes.end);
        const chosen=anyTag(tags,condition.content)?yes.content:no.content;
        output+=project(chosen,new Map(tags),context);pos=no.end;continue;
      }
      if(commandAt(fragment,pos,'tagitem')){
        const condition=readDelimited(fragment,pos+8);
        const yes=readDelimited(fragment,condition.end);
        const no=readOptionalFalseBranch(fragment,yes.end);
        const chosen=anyTag(tags,condition.content)?yes.content:no.content;
        const rendered=project(chosen,new Map(tags),context);
        if(rendered.trim())output+=(context.tagItemAsItem?'\\item ':'')+rendered;
        pos=no.end;continue;
      }
      if(commandAt(fragment,pos,'tagrefs')){
        const arg=readDelimited(fragment,pos+8);
        output+=taggedReferences(arg.content,tags);pos=arg.end;continue;
      }
      if(commandAt(fragment,pos,'tagprob')){
        let cursor=skipSpace(fragment,pos+8),outer='tagTrue';
        if(fragment[cursor]==='['){const option=readDelimited(fragment,cursor,'[',']');outer=option.content;cursor=option.end;}
        const inner=readDelimited(fragment,cursor);
        const close=nextCommand(fragment,inner.end,'tagendprob');
        if(close<0)throw new Error('Unclosed \\tagprob block');
        if(anyTag(tags,outer)&&anyTag(tags,inner.content))output+=project(fragment.slice(inner.end,close),new Map(tags),context);
        pos=close+11;continue;
      }
      if(commandAt(fragment,pos,'tagendprob')){pos+=11;continue;}
      if(fragment.startsWith('\\begin{tagblock}',pos)){
        const marker='\\begin{tagblock}';
        const condition=readDelimited(fragment,pos+marker.length);
        const close=environmentEnd(fragment,condition.end,'tagblock');
        if(anyTag(tags,condition.content))output+=project(fragment.slice(condition.end,close.bodyEnd),new Map(tags),context);
        pos=close.end;continue;
      }
      if(fragment.startsWith('\\begin{tagenumerate}',pos)){
        const marker='\\begin{tagenumerate}';
        const condition=readDelimited(fragment,pos+marker.length);
        const close=environmentEnd(fragment,condition.end,'tagenumerate');
        const count=activeTagCount(tags,condition.content);
        const body=project(fragment.slice(condition.end,close.bodyEnd),new Map(tags),{...context,tagItemAsItem:count>1});
        output+=count>1?'\\begin{enumerate}'+body+'\\end{enumerate}':body;
        pos=close.end;continue;
      }
      output+=fragment[pos++];
    }
    return output;
  }
  return project(source,new Map(defaults));
}
