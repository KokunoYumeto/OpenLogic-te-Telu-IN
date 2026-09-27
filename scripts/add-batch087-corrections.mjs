import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const sourcePath='content/normal-modal-logic/axioms-systems/systems-distinct.tex';
const review='evidence/OLP-0437-SYSTEMS-DISTINCT-SOURCE-AUDIT.md';
const findings='evidence/OLP-0437-SYSTEMS-DISTINCT-AUDIT-FINDINGS.json';
const sourceHash='5242bad1abef085ce60944f529370410d12a911fbe55fa1047a29fca3c7b214b';
if(sha('upstream/'+sourcePath)!==sourceHash||
   sha(review)!=='aecc443cf461861986c041a56a416d262dddb25daf4f7d1a9aad974c826c69df'||
   sha(findings)!=='7af9c17939ff32b8e6b76a0e660538701249007fe966ab0ae7a6efb57f8e2f74')
  throw new Error('Source-audit authority mismatch');
const authority=JSON.parse(fs.readFileSync(path.join(root,findings),'utf8'));
if(authority.audit_id!=='OLTENMLAXSDIS-20260927'||authority.findings.length!==2)
  throw new Error('Finding set mismatch');
const file=path.join(root,'evidence/SOURCE_CORRECTIONS.jsonl');
const records=fs.readFileSync(file,'utf8').trimEnd().split(/\r?\n/u).map(JSON.parse);
const previous=records.filter(row=>row.unit_id!=='OLP-0437');
const existing=new Map(records.filter(row=>row.unit_id==='OLP-0437').map(row=>[row.finding_id,row]));
if(previous.length!==400||![0,2].includes(records.length-previous.length))
  throw new Error('Unexpected correction cursor');
const treatments={
  'OLTENMLAXSDIS-001':'KT వ్యుత్పాదించే వస్తువు వ్యవస్థ D కాదు, D స్వీకృత సూత్రమని Ax{D}తో స్పష్టం చేసి పక్కనే ప్రకటించాం; స్థిర ఆంగ్ల మూలం మారలేదు.',
  'OLTENMLAXSDIS-002':'KTB వ్యుత్పాదించని వస్తువులుగా వ్యవస్థ-సూచికల బదులు Ax{4}, Ax{5} స్వీకృత సూత్రాలను రాసి పక్కనే ప్రకటించాం; స్థిర మూలం మారలేదు.'
};
const targetLines={'OLTENMLAXSDIS-001':29,'OLTENMLAXSDIS-002':71};
const added=authority.findings.map(f=>({
  audit_id:authority.audit_id,audit_review_sha256:sha(review),audit_findings_sha256:sha(findings),
  status:existing.get(f.finding_id)?.status==='applied_qa_pass'?'applied_qa_pass':'applied_pending_qa',
  finding_id:f.finding_id,unit_id:'OLP-0437',source_path:sourcePath,source_sha256:sourceHash,
  source_locator:f.source_locator,target_locator:`translation/${sourcePath}:${targetLines[f.finding_id]}`,
  classification:f.classification,body_treatment:treatments[f.finding_id],
  expected_core_math_delta:f.expected_core_math_delta
}));
fs.writeFileSync(file,[...previous,...added].map(JSON.stringify).join('\n')+'\n','utf8');
console.log(JSON.stringify({corrections:previous.length+added.length,added:added.map(x=>x.finding_id)}));
