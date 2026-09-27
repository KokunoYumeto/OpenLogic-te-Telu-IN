import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const sourcePath='content/normal-modal-logic/axioms-systems/soundness.tex';
const review='evidence/OLP-0436-SOUNDNESS-SOURCE-AUDIT.md';
const findings='evidence/OLP-0436-SOUNDNESS-AUDIT-FINDINGS.json';
const sourceHash='ff44b1e495e2dca06b0c6e7fed1c5dab9971288a8c3bef061f00f7f025f61d17';
if(sha('upstream/'+sourcePath)!==sourceHash||
   sha(review)!=='6bc46c581c949e1f6d487dcbbb85674a25ebd16442da0b571fdefc833236371c'||
   sha(findings)!=='907c273dd60714451fef12ad146864002557f5fe00d42a128a9225a0d6e8cb09')
  throw new Error('Source-audit authority mismatch');
const authority=JSON.parse(fs.readFileSync(path.join(root,findings),'utf8'));
if(authority.audit_id!=='OLTENMLAXSSND-20260927'||authority.findings.length!==2)
  throw new Error('Finding set mismatch');
const file=path.join(root,'evidence/SOURCE_CORRECTIONS.jsonl');
const records=fs.readFileSync(file,'utf8').trimEnd().split(/\r?\n/u).map(JSON.parse);
const previous=records.filter(row=>row.unit_id!=='OLP-0436');
const existing=new Map(records.filter(row=>row.unit_id==='OLP-0436').map(row=>[row.finding_id,row]));
if(previous.length!==398||![0,2].includes(records.length-previous.length))
  throw new Error('Unexpected correction cursor');
const treatments={
  'OLTENMLAXSSND-001':'ఆగమన దశలో పూర్వ ఆధార దశలోని అన్ని ప్రాథమిక నిదర్శనాలనూ చేర్చి, K/ఐచ్ఛిక Dual మినహాయింపు మూలంలో ఉందని పక్కనే ప్రకటించాం; స్థిర ఆంగ్ల మూలం మారలేదు.',
  'OLTENMLAXSSND-002':'నమూనాల నిర్దిష్ట వర్గంలో ప్రతి లోకానికి సత్యమైన C నుంచి Box C అనుసరిస్తుందని స్పష్టంగా చూపి, మూల ఉదాహరణ యొక్క ప్రపంచ-చెల్లుబాటు పరిమితిని ప్రకటించాం; స్థిర మూలం మారలేదు.'
};
const targetLines={'OLTENMLAXSSND-001':51,'OLTENMLAXSSND-002':68};
const added=authority.findings.map(f=>({
  audit_id:authority.audit_id,
  audit_review_sha256:sha(review),audit_findings_sha256:sha(findings),
  status:existing.get(f.finding_id)?.status==='applied_qa_pass'?'applied_qa_pass':'applied_pending_qa',
  finding_id:f.finding_id,unit_id:'OLP-0436',
  source_path:sourcePath,source_sha256:sourceHash,
  source_locator:f.source_locator,
  target_locator:`translation/${sourcePath}:${targetLines[f.finding_id]}`,
  classification:f.classification,body_treatment:treatments[f.finding_id],
  expected_core_math_delta:f.expected_core_math_delta
}));
fs.writeFileSync(file,[...previous,...added].map(JSON.stringify).join('\n')+'\n','utf8');
console.log(JSON.stringify({corrections:previous.length+added.length,added:added.map(x=>x.finding_id)}));
