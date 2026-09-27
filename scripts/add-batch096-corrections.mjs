import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const sourcePath='content/normal-modal-logic/completeness/truth-lemma.tex';
const review='evidence/OLP-0447-TRUTH-LEMMA-SOURCE-AUDIT.md';
const findings='evidence/OLP-0447-TRUTH-LEMMA-AUDIT-FINDINGS.json';
const sourceHash='ba09b193f2ccb8f8c5751a1c762c0f81f14937ffbb42bd0e7bfad1f82d51f147';
if(sha('upstream/'+sourcePath)!==sourceHash||
   sha(review)!=='5b5c4f09b36fe60b8baa07f3fe3522332c244fb07f2aabea5b085aac7d6e1076'||
   sha(findings)!=='3cf8fa39c0fe8401a103f631052be40469223ebe74aa5bc05663a49163ff6f33')
  throw new Error('Source-audit authority mismatch');
const authority=JSON.parse(fs.readFileSync(path.join(root,findings),'utf8'));
if(authority.audit_id!=='OLTENMLCOMTRU-20260927'||authority.findings.length!==3)
  throw new Error('Finding set mismatch');
const file=path.join(root,'evidence/SOURCE_CORRECTIONS.jsonl');
const records=fs.readFileSync(file,'utf8').trimEnd().split(/\r?\n/u).map(JSON.parse);
const previous=records.filter(row=>row.unit_id!=='OLP-0447');
const existing=new Map(records.filter(row=>row.unit_id==='OLP-0447').map(row=>[row.finding_id,row]));
if(previous.length!==411||![0,3].includes(records.length-previous.length))
  throw new Error('Unexpected correction cursor');
const treatments={
  'OLTENMLCOMTRU-001':'Diamond ముందుదిశలో Box-ప్రాప్యత నుంచి Diamond-ప్రతిబింబ సమ్మిళితత్వానికి మారే చోట మూలంలోని Diamond ప్రతిపాదన బదులు వాటి తుల్యత ఉపసిద్ధాంతాన్ని సూచించి పక్కనే ప్రకటించాం.',
  'OLTENMLCOMTRU-002':'Diamond వెనుకదిశలో ప్రాప్య లోకంలో B మూలకత్వం నుంచి ముందుగా ఆగమన పరికల్పనతో B సత్యాన్ని పొంది, తరువాత మోడల్ సత్య నిర్వచనం వాడి పక్కనే ప్రకటించాం.',
  'OLTENMLCOMTRU-003':'వ్యాయామ ట్యాగ్ జాబితాలో proband స్థానంలో శాఖ వాస్తవంగా పరీక్షించే probAndను పెట్టి పక్కనే ప్రకటించాం; శాఖ నిరూపణ మారలేదు.'
};
const targetLines={'OLTENMLCOMTRU-001':143,'OLTENMLCOMTRU-002':164,'OLTENMLCOMTRU-003':177};
const added=authority.findings.map(f=>({
  audit_id:authority.audit_id,audit_review_sha256:sha(review),audit_findings_sha256:sha(findings),
  status:existing.get(f.finding_id)?.status==='applied_qa_pass'?'applied_qa_pass':'applied_pending_qa',
  finding_id:f.finding_id,unit_id:'OLP-0447',source_path:sourcePath,source_sha256:sourceHash,
  source_locator:f.source_locator,target_locator:`translation/${sourcePath}:${targetLines[f.finding_id]}`,
  classification:f.classification,body_treatment:treatments[f.finding_id],
  expected_core_math_delta:f.expected_core_math_delta,
  ...(f.expected_protected_identifier_delta?{expected_protected_identifier_delta:f.expected_protected_identifier_delta}:{})
}));
fs.writeFileSync(file,[...previous,...added].map(JSON.stringify).join('\n')+'\n','utf8');
console.log(JSON.stringify({corrections:previous.length+added.length,added:added.map(x=>x.finding_id)}));
