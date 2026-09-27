import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const sourcePath='content/normal-modal-logic/axioms-systems/consistency.tex';
const review='evidence/OLP-0440-CONSISTENCY-SOURCE-AUDIT.md';
const findings='evidence/OLP-0440-CONSISTENCY-AUDIT-FINDINGS.json';
const sourceHash='410cd2532bf8c2ba318f476f6e9192064021f16e0a42aa297015bb41851e889b';
if(sha('upstream/'+sourcePath)!==sourceHash||
   sha(review)!=='bf710477252b3dfeabf0e3c5e5a379efc1566e10f65a80657f0d612de8b9c071'||
   sha(findings)!=='80f04b5a7ec62844518539c915487957737311575e314c075e329757919e29dc')
  throw new Error('Source-audit authority mismatch');
const authority=JSON.parse(fs.readFileSync(path.join(root,findings),'utf8'));
if(authority.audit_id!=='OLTENMLAXSCON-20260927'||authority.findings.length!==2)
  throw new Error('Finding set mismatch');
const file=path.join(root,'evidence/SOURCE_CORRECTIONS.jsonl');
const records=fs.readFileSync(file,'utf8').trimEnd().split(/\r?\n/u).map(JSON.parse);
const previous=records.filter(row=>row.unit_id!=='OLP-0440');
const existing=new Map(records.filter(row=>row.unit_id==='OLP-0440').map(row=>[row.finding_id,row]));
if(previous.length!==402||![0,2].includes(records.length-previous.length))
  throw new Error('Unexpected correction cursor');
const treatments={
  'OLTENMLAXSCON-001':'వ్యవస్థ-సాపేక్ష వైరుధ్యం నుంచి నమూనా-అసంతృప్తి ఆ వ్యవస్థ నిర్దుష్టత వర్తించే నమూనాల వర్గంలోనే అనుసరిస్తుందని తెలుగు గద్యంలో ప్రకటించాం; స్థిర ఆంగ్ల మూలం మారలేదు.',
  'OLTENMLAXSCON-002':'విస్తరించిన సమితుల నుంచి bottom వ్యుత్పాద్యతకు తక్షణ ఆధారం అవైరుధ్య నిర్వచనం అని తెలిపి, (b) సూచనను సందర్భంగా నిలిపి, భేదాన్ని పక్కనే ప్రకటించాం; గణిత సూత్రాలు మారలేదు.'
};
const targetLines={'OLTENMLAXSCON-001':19,'OLTENMLAXSCON-002':63};
const added=authority.findings.map(f=>({
  audit_id:authority.audit_id,audit_review_sha256:sha(review),audit_findings_sha256:sha(findings),
  status:existing.get(f.finding_id)?.status==='applied_qa_pass'?'applied_qa_pass':'applied_pending_qa',
  finding_id:f.finding_id,unit_id:'OLP-0440',source_path:sourcePath,source_sha256:sourceHash,
  source_locator:f.source_locator,target_locator:`translation/${sourcePath}:${targetLines[f.finding_id]}`,
  classification:f.classification,body_treatment:treatments[f.finding_id],
  expected_core_math_delta:f.expected_core_math_delta
}));
fs.writeFileSync(file,[...previous,...added].map(JSON.stringify).join('\n')+'\n','utf8');
console.log(JSON.stringify({corrections:previous.length+added.length,added:added.map(x=>x.finding_id)}));
