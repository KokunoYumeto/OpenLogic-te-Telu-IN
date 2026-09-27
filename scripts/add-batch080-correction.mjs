import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const sourcePath='content/normal-modal-logic/axioms-systems/logics-proofs.tex';
const targetPath='translation/'+sourcePath;
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0430');
const source=read('upstream/'+sourcePath),target=read(targetPath);
if(!unit||unit.order!==430||unit.source_path!==sourcePath||
   Buffer.byteLength(source)!==4443||sha(source)!==unit.source_sha256||
   unit.source_sha256!=='bf3926886e2d6d2740ceb631fc5c5618fe300fb0d6813fe2b30367072c45d66a')
  throw new Error('Unexpected frozen source');
const auditDir='evidence/source-audits/2026-09-27-modal-system-proof-telugu/';
const audit=JSON.parse(read(auditDir+'FINDINGS.json'));
if(audit.audit_id!=='OLTENMLAXSPRF-20260927'||audit.findings.length!==1||
   audit.findings[0].finding_id!=='OLTENMLAXSPRF-001')
  throw new Error('Unexpected source audit');
const token='\\sourcecorrection{OLTENMLAXSPRF-001}';
if(target.split(token).length!==2)throw new Error('Expected exactly one target note');
const noteLine=target.slice(0,target.indexOf(token)).split(/\r?\n/u).length;
const ledgerPath='evidence/SOURCE_CORRECTIONS.jsonl';
const rows=jsonl(ledgerPath);
const existing=rows.find(row=>row.finding_id==='OLTENMLAXSPRF-001');
if(existing){
  if(rows.length!==395||existing.unit_id!=='OLP-0430'||
     existing.audit_findings_sha256!==sha(read(auditDir+'FINDINGS.json'))||
     existing.audit_review_sha256!==sha(read(auditDir+'REVIEW.md')))
    throw new Error('Existing correction changed unexpectedly');
  existing.target_locator=`${targetPath}:${noteLine}`;
}else{
  if(rows.length!==394||rows.at(-1).finding_id!=='OLTENMLAXSNOR-001')
    throw new Error('Unexpected source-correction cursor');
  rows.push({
    audit_id:'OLTENMLAXSPRF-20260927',
    audit_review_sha256:sha(read(auditDir+'REVIEW.md')),
    audit_findings_sha256:sha(read(auditDir+'FINDINGS.json')),
    status:'applied_qa_pass',finding_id:'OLTENMLAXSPRF-001',unit_id:'OLP-0430',
    source_path:sourcePath,source_sha256:sha(source),
    source_locator:'logics-proofs.tex line 87',
    target_locator:`${targetPath}:${noteLine}`,
    classification:'axiom_K_schema_name_instead_of_axiom_formula_membership',
    body_treatment:'వ్యుత్పాదించబడిన K స్వీకృత సూత్రాన్నే మోడల్ తర్క సమితి సభ్యునిగా రాసి, అదే అంశంలో ప్రకటిత గమనిక ఉంచాం; స్థిర మూలం మారలేదు.',
    expected_core_math_delta:{source_only:['$K\\in\\Sigma$'],target_only:['$\\Ax{K}\\in\\Sigma$']}
  });
}
fs.writeFileSync(path.join(root,ledgerPath),rows.map(JSON.stringify).join('\n')+'\n','utf8');
console.log(JSON.stringify({corrections:rows.length,note_line:noteLine,audit_sha256:sha(read(auditDir+'FINDINGS.json'))}));
