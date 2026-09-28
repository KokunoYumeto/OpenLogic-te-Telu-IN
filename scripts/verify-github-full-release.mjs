import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'output','release');
const tag='v1.0.0-full-olp0722';
const repository='KokunoYumeto/OpenLogic-te-Telu-IN';
const manifestName=`release-manifest-${tag}.json`;
const checksumsName=`SHA256SUMS-${tag}.txt`;
const manifest=JSON.parse(fs.readFileSync(path.join(out,manifestName),'utf8'));
if(manifest.version!==tag||manifest.scope?.source_units!==722||!manifest.scope?.complete_edition)throw new Error('Unexpected local release manifest');
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const wanted=[...manifest.artifacts,
  {filename:manifestName,bytes:fs.statSync(path.join(out,manifestName)).size,sha256:sha(fs.readFileSync(path.join(out,manifestName))),role:'release_manifest'},
  {filename:checksumsName,bytes:fs.statSync(path.join(out,checksumsName)).size,sha256:sha(fs.readFileSync(path.join(out,checksumsName))),role:'sha256_checksums'}];
for(const item of wanted){
  const local=path.join(out,item.filename);
  if(!fs.existsSync(local)||fs.statSync(local).size!==item.bytes||sha(fs.readFileSync(local))!==item.sha256)throw new Error('Local artifact changed: '+item.filename);
}
const headers={'Accept':'application/vnd.github+json','User-Agent':'openlogic-te-release-readback'};
async function json(url){
  const response=await fetch(url,{headers});
  if(!response.ok)throw new Error(`${response.status} ${url}`);
  return response.json();
}
const api=`https://api.github.com/repos/${repository}`;
const release=await json(`${api}/releases/tags/${tag}`);
if(release.tag_name!==tag||release.draft||release.prerelease)throw new Error('Full release is not public and final');
const ref=await json(`${api}/git/ref/tags/${tag}`);
if(ref.object?.type!=='commit'||ref.object.sha!==manifest.repository_commit)throw new Error('Public tag does not point to packaged commit');
const rows=[];
for(const expected of wanted){
  const matches=release.assets.filter(item=>item.name===expected.filename);
  if(matches.length!==1||matches[0].size!==expected.bytes)throw new Error('Public asset missing or wrong size: '+expected.filename);
  const response=await fetch(matches[0].browser_download_url,{headers:{'User-Agent':'openlogic-te-release-readback'}});
  if(!response.ok||!response.body)throw new Error(`Download failed: ${expected.filename} HTTP ${response.status}`);
  const hash=crypto.createHash('sha256');let bytes=0;
  for await(const chunk of response.body){hash.update(chunk);bytes+=chunk.length;}
  const actual=hash.digest('hex');
  if(bytes!==expected.bytes||actual!==expected.sha256)throw new Error('Public byte mismatch: '+expected.filename);
  rows.push({filename:expected.filename,bytes,sha256:actual,role:expected.role});
  process.stdout.write(JSON.stringify({verified:expected.filename,bytes})+'\n');
}
const receipt={schema:'openlogic-te-github-full-release-readback/1',status:'COMPLETE_PASS',checked_utc:new Date().toISOString(),repository:`https://github.com/${repository}`,release_url:release.html_url,tag,tag_commit:ref.object.sha,assets:rows,anonymous_downloads:true};
fs.writeFileSync(path.join(root,'evidence','GITHUB-FULL-V1-READBACK.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({status:receipt.status,assets:rows.length,release_url:receipt.release_url,tag_commit:receipt.tag_commit}));
