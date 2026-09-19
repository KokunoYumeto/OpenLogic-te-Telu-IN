import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {renderTeluguTokens} from './telugu-token-markup.mjs';

const root=path.resolve(import.meta.dirname,'..');
const renderRoot=path.join(root,'tmp/pdfs/cumulative-279/render-tree');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const rows=fs.readFileSync(path.join(root,'evidence/SOURCE_MANIFEST.jsonl'),'utf8').trim().split(/\r?\n/u).map(JSON.parse).filter(row=>row.order>=4&&row.order<=279);
if(rows.length!==276)throw new Error(`Expected 276 units, found ${rows.length}`);

const records=[];
for(const row of rows){
  const sourcePath=path.join(root,'upstream',row.source_path);
  const translationPath=path.join(root,'translation',row.source_path);
  const source=fs.readFileSync(sourcePath);
  const translation=fs.readFileSync(translationPath,'utf8');
  if(sha(source)!==row.source_sha256)throw new Error(`Frozen source changed: ${row.unit_id}`);

  // English indefinite-article helpers have no surface in Telugu. Preserve a
  // nested Telugu token wrapper, then remove the remaining key-only helpers.
  let prepared=translation
    .replace(/\\(?:article|Article)\{(\\tetoken\{[^{}]+\}\{!!\^?a?\{[^{}]+\}s?\})\}/gu,'$1')
    .replace(/\\(?:article|Article)\{[^{}]+\}/gu,'');
  let rendered=renderTeluguTokens(prepared);
  // The source idiom `!\ ` denotes a configurable logical token. OLP-0058
  // attaches a Telugu suffix at that boundary, producing a control-sequence
  // collision in raw TeX. Remove only a backslash immediately before Telugu.
  rendered=rendered.replace(/\\(?=[\u0C00-\u0C7F])/gu,'');
  // XeLaTeX's Unicode transitions do not fire reliably inside amsmath text,
  // proof-tree labels, or inherited small-caps groups. Select the bundled
  // Telugu font for each complete Telugu shaping run without changing the
  // editable translation bytes.
  rendered=rendered.replace(/[\u0C00-\u0C7F][\u0C00-\u0C7F\u200C\u200D]*/gu,value=>`{\\telugufont ${value}}`);
  if(/!!|\\tetoken\b|\\tecase\b/gu.test(rendered))throw new Error(`Unresolved token syntax: ${row.unit_id}`);

  const destination=path.join(renderRoot,row.source_path);
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  fs.writeFileSync(destination,rendered,'utf8');
  records.push({
    unit_id:row.unit_id,
    source_path:row.source_path,
    source_sha256:row.source_sha256,
    translation_sha256:sha(translation),
    render_sha256:sha(rendered),
    operations:[
      'realize Telugu token surfaces while retaining identities in editable files',
      'remove source-language indefinite-article helpers from Telugu prose',
      'separate one canonical escaped-space token from its Telugu suffix',
      'select bundled Telugu font for complete Unicode shaping runs'
    ]
  });
}

const receipt={
  schema:'openlogic-te-cumulative-render-tree/1',
  source_revision:rows[0].source_commit,
  scope:'OLP-0004..OLP-0279',
  units:records.length,
  records,
  status:'prepared_for_guarded_tex_build'
};
fs.mkdirSync(renderRoot,{recursive:true});
fs.writeFileSync(path.join(renderRoot,'render-manifest.json'),JSON.stringify(receipt,null,2)+'\n','utf8');
console.log(JSON.stringify({units:records.length,manifest_sha256:sha(JSON.stringify(receipt))}));
