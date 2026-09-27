import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const sourcePath='content/normal-modal-logic/completeness/modalities-ccs.tex';
const review='evidence/OLP-0445-MODALITIES-CCS-SOURCE-AUDIT.md';
const findings='evidence/OLP-0445-MODALITIES-CCS-AUDIT-FINDINGS.json';
const sourceHash='92b97da95c28f21f5806bcce481e64571dc3a82d5d1c315bcaf1c569c90d00a6';
if(sha('upstream/'+sourcePath)!==sourceHash||
   sha(review)!=='35e6d468b3785698ca3cac8169d650e54183422ec749e76f774af2c75b2f56c6'||
   sha(findings)!=='fc63234c1971d6db1629022bde8e816dc1de3589fc80e4f17b71aba0018f69e2')
  throw new Error('Source-audit authority mismatch');
const authority=JSON.parse(fs.readFileSync(path.join(root,findings),'utf8'));
if(authority.audit_id!=='OLTENMLCOMMOD-20260927'||authority.findings.length!==2)
  throw new Error('Finding set mismatch');
const file=path.join(root,'evidence/SOURCE_CORRECTIONS.jsonl');
const records=fs.readFileSync(file,'utf8').trimEnd().split(/\r?\n/u).map(JSON.parse);
const previous=records.filter(row=>row.unit_id!=='OLP-0445');
const existing=new Map(records.filter(row=>row.unit_id==='OLP-0445').map(row=>[row.finding_id,row]));
if(previous.length!==409||![0,2].includes(records.length-previous.length))
  throw new Error('Unexpected correction cursor');
const treatments={
  'OLTENMLCOMMOD-001':'పరిమిత సాక్షుల జాబితా B_1 నుంచి B_k దాకా ఉన్నందున రెండు అంతర్నిహితార్థ శ్రేణుల చివరి B_nను B_kగా మార్చి పక్కనే ప్రకటించాం; స్థిర ఆంగ్ల మూలం మారలేదు.',
  'OLTENMLCOMMOD-002':'రెండవ Box ఉపసిద్ధాంతం మధ్యంతర వ్యుత్పాద్యతకు సూచించిన మొదటి ఉపసిద్ధాంతంలోని Sigma పరామితిని స్పష్టంగా చేర్చి పక్కనే ప్రకటించాం; స్థిర మూలం మారలేదు.'
};
const targetLines={'OLTENMLCOMMOD-001':109,'OLTENMLCOMMOD-002':126};
const added=authority.findings.map(f=>({
  audit_id:authority.audit_id,audit_review_sha256:sha(review),audit_findings_sha256:sha(findings),
  status:existing.get(f.finding_id)?.status==='applied_qa_pass'?'applied_qa_pass':'applied_pending_qa',
  finding_id:f.finding_id,unit_id:'OLP-0445',source_path:sourcePath,source_sha256:sourceHash,
  source_locator:f.source_locator,target_locator:`translation/${sourcePath}:${targetLines[f.finding_id]}`,
  classification:f.classification,body_treatment:treatments[f.finding_id],
  expected_core_math_delta:f.expected_core_math_delta
}));
fs.writeFileSync(file,[...previous,...added].map(JSON.stringify).join('\n')+'\n','utf8');
console.log(JSON.stringify({corrections:previous.length+added.length,added:added.map(x=>x.finding_id)}));
