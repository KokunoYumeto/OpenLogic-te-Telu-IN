import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const sourcePath='content/normal-modal-logic/completeness/lindenbaums-lemma.tex';
const review='evidence/OLP-0444-LINDENBAUM-SOURCE-AUDIT.md';
const findings='evidence/OLP-0444-LINDENBAUM-AUDIT-FINDINGS.json';
const sourceHash='1708ac2baa1773893a9bff57d63c9201aaea7c990213c76478fb4065a269196b';
if(sha('upstream/'+sourcePath)!==sourceHash||
   sha(review)!=='20d75ecb2e427eeb2d28a2a473759038d0b6836cea54902a160ad6a5e7384691'||
   sha(findings)!=='a0e6abdfaee3c5b1996cb8a8b95528135c7ee122b788e675dc0a3fcf1bdaaf72')
  throw new Error('Source-audit authority mismatch');
const authority=JSON.parse(fs.readFileSync(path.join(root,findings),'utf8'));
if(authority.audit_id!=='OLTENMLCOMLIN-20260927'||authority.findings.length!==1||
   authority.findings[0].finding_id!=='OLTENMLCOMLIN-001')
  throw new Error('Finding set mismatch');
const file=path.join(root,'evidence/SOURCE_CORRECTIONS.jsonl');
const records=fs.readFileSync(file,'utf8').trimEnd().split(/\r?\n/u).map(JSON.parse);
const previous=records.filter(row=>row.unit_id!=='OLP-0444');
const existing=records.find(row=>row.unit_id==='OLP-0444');
if(previous.length!==408||![0,1].includes(records.length-previous.length))
  throw new Error('Unexpected correction cursor');
const f=authority.findings[0];
const added={
  audit_id:authority.audit_id,audit_review_sha256:sha(review),audit_findings_sha256:sha(findings),
  status:existing?.status==='applied_qa_pass'?'applied_qa_pass':'applied_pending_qa',
  finding_id:f.finding_id,unit_id:'OLP-0444',source_path:sourcePath,source_sha256:sourceHash,
  source_locator:f.source_locator,
  target_locator:`translation/${sourcePath}:35`,
  classification:f.classification,
  body_treatment:'దశ nలో పొడవు సరిగ్గా n అనే స్థిర మూల ఉదాహరణను గరిష్ఠంగా nగా సవరించి, ప్రతి దశ పరిమితతను, మొత్తం జాబితా సమగ్రతను పక్కనే ప్రకటించాం; స్థిర ఆంగ్ల మూలం మారలేదు.',
  expected_core_math_delta:f.expected_core_math_delta
};
fs.writeFileSync(file,[...previous,added].map(JSON.stringify).join('\n')+'\n','utf8');
console.log(JSON.stringify({corrections:previous.length+1,added:[f.finding_id]}));
