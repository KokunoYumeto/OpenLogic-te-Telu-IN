import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const base='ed66018fd91c9eea932dca286134478d8685ff98';
const commit=process.argv[2];
if(!/^[0-9a-f]{40}$/u.test(commit??''))throw new Error('Expected full public target commit');
const repository='KokunoYumeto/OpenLogic-te-Telu-IN';
const output=path.join(root,'evidence/GITHUB-FRAME-DEFINABILITY-OLP0426-READBACK.json');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'buffer',maxBuffer:128*1024*1024});
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const paths=git('diff','-z','--name-only','--diff-filter=ACMRT',base,commit,'--')
  .toString('utf8').split('\0').filter(Boolean);
if(paths.length<8)throw new Error('Unexpectedly narrow chapter publication range');
const encodedPath=value=>value.split('/').map(encodeURIComponent).join('/');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function publicBytes(url){
  let last='';
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(url,{cache:'no-store',redirect:'follow'});
      if(response.ok)return Buffer.from(await response.arrayBuffer());
      last=`HTTP ${response.status}`;
    }catch(error){last=error.message;}
    if(attempt<2)await wait(1200*(attempt+1));
  }
  throw new Error(`Anonymous public read failed: ${url}: ${last}`);
}
const refUrl=`https://api.github.com/repos/${repository}/git/ref/heads/main`;
const ref=JSON.parse((await publicBytes(refUrl)).toString('utf8'));
if(ref.object?.sha!==commit)throw new Error(`Public main ref mismatch: ${ref.object?.sha}`);
const files=new Array(paths.length);
let cursor=0;
const workers=Array.from({length:Math.min(6,paths.length)},async()=>{
  while(cursor<paths.length){
    const index=cursor++;
    const filePath=paths[index];
    const url=`https://raw.githubusercontent.com/${repository}/${commit}/${encodedPath(filePath)}`;
    const expected=git('show',`${commit}:${filePath}`);
    const observed=await publicBytes(url);
    files[index]={path:filePath,public_url:url,bytes:observed.length,
      sha256:sha(observed),expected_bytes:expected.length,
      expected_sha256:sha(expected),match:observed.length===expected.length&&sha(observed)===sha(expected)};
  }
});
await Promise.all(workers);
const status=files.every(file=>file.match)?'COMPLETE_PASS':'FAIL';
const receipt={schema:'openlogic-te-public-source-range-readback/1',
  checked_at:new Date().toISOString(),repository,base_commit:base,
  public_main_commit:commit,public_ref_url:refUrl,anonymous:true,
  authorization_header_sent:false,file_count:files.length,files,status};
fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n','utf8');
console.log(JSON.stringify({status,base,commit,files:files.length,
  output:path.relative(root,output).replaceAll('\\','/')}));
if(status!=='COMPLETE_PASS')process.exitCode=1;
