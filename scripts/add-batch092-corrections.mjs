import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const sourcePath='content/normal-modal-logic/completeness/complete-consistent-sets.tex';
const review='evidence/OLP-0443-COMPLETE-CONSISTENT-SETS-SOURCE-AUDIT.md';
const findings='evidence/OLP-0443-COMPLETE-CONSISTENT-SETS-AUDIT-FINDINGS.json';
const sourceHash='b5bab763b10f3972e8a8c53ae3036677c0b462f86df13137ccb6181d9ce632e1';
if(sha('upstream/'+sourcePath)!==sourceHash||
   sha(review)!=='f0e7ac1cc20244d8e6f02288a876828340b1db10e5071715a2cd45d8c8414be3'||
   sha(findings)!=='a26c8e43a5cb914427608f5780702cfa39555d9fe46a9491e2b097b3dda5d8e2')
  throw new Error('Source-audit authority mismatch');
const authority=JSON.parse(fs.readFileSync(path.join(root,findings),'utf8'));
if(authority.audit_id!=='OLTENMLCOMCCS-20260927'||authority.findings.length!==4)
  throw new Error('Finding set mismatch');
const file=path.join(root,'evidence/SOURCE_CORRECTIONS.jsonl');
const records=fs.readFileSync(file,'utf8').trimEnd().split(/\r?\n/u).map(JSON.parse);
const previous=records.filter(row=>row.unit_id!=='OLP-0443');
const existing=new Map(records.filter(row=>row.unit_id==='OLP-0443').map(row=>[row.finding_id,row]));
if(previous.length!==404||![0,4].includes(records.length-previous.length))
  throw new Error('Unexpected correction cursor');
const treatments={
  'OLTENMLCOMCCS-001':'నిషేధ-మూలకత్వం రెండవ దిశలో A స్థానంలో not-Aను రాసి పక్కనే ప్రకటించాం; సిద్ధాంత వాక్యం, స్థిర ఆంగ్ల మూలం మారలేదు.',
  'OLTENMLCOMCCS-002':'వ్యాయామం కాని వికల్ప శాఖలో తప్పిన తిరుగు దిశను సర్వసత్య వికల్ప ప్రవేశం, నిగమన సంవృతతతో గద్యంగా చేర్చి ప్రకటించాం; వ్యాయామ శాఖ తెరిచే ఉంది.',
  'OLTENMLCOMCCS-003':'తుల్యత తిరుగు నిరూపణ పరికల్పనలో implication స్థానంలో biconditionalను పెట్టి ప్రకటించాం; స్థిర మూలం మారలేదు.',
  'OLTENMLCOMCCS-004':'తుల్యత తిరుగు శాఖలో రెండూ లేని సందర్భం అసాధ్యమని సంపూర్ణత, ప్రతిజ్ఞావాక్య సర్వసత్యం, సంవృతతతో చూపి ప్రకటించాం; వ్యాయామ శాఖ తెరిచే ఉంది.'
};
const targetLines={'OLTENMLCOMCCS-001':93,'OLTENMLCOMCCS-002':117,
  'OLTENMLCOMCCS-003':142,'OLTENMLCOMCCS-004':156};
const added=authority.findings.map(f=>({
  audit_id:authority.audit_id,audit_review_sha256:sha(review),audit_findings_sha256:sha(findings),
  status:existing.get(f.finding_id)?.status==='applied_qa_pass'?'applied_qa_pass':'applied_pending_qa',
  finding_id:f.finding_id,unit_id:'OLP-0443',source_path:sourcePath,source_sha256:sourceHash,
  source_locator:f.source_locator,target_locator:`translation/${sourcePath}:${targetLines[f.finding_id]}`,
  classification:f.classification,body_treatment:treatments[f.finding_id],
  expected_core_math_delta:f.expected_core_math_delta
}));
fs.writeFileSync(file,[...previous,...added].map(JSON.stringify).join('\n')+'\n','utf8');
console.log(JSON.stringify({corrections:previous.length+added.length,added:added.map(x=>x.finding_id)}));
