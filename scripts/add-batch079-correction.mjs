import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const jsonl=file=>read(file).trimEnd().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
const sourcePath='content/normal-modal-logic/axioms-systems/normal-logics.tex';
const targetPath='translation/'+sourcePath;
const unit=jsonl('evidence/SOURCE_MANIFEST.jsonl').find(row=>row.unit_id==='OLP-0429');
const source=read('upstream/'+sourcePath),target=read(targetPath);
if(!unit||unit.order!==429||unit.source_path!==sourcePath||
   Buffer.byteLength(source)!==4374||sha(source)!==unit.source_sha256||
   unit.source_sha256!=='6bcccf354cf8966f674c16ad3c6196a62ebcf8ca9545418d60ef08adf89e3819')
  throw new Error('Unexpected frozen source');
const auditDir='evidence/source-audits/2026-09-27-modal-normal-logics-telugu/';
const audit=JSON.parse(read(auditDir+'FINDINGS.json'));
if(audit.audit_id!=='OLTENMLAXSNOR-20260927'||audit.findings.length!==1||
   audit.findings[0].finding_id!=='OLTENMLAXSNOR-001')
  throw new Error('Unexpected source audit');
const token='\\sourcecorrection{OLTENMLAXSNOR-001}';
if(target.split(token).length!==2)throw new Error('Expected exactly one target note');
const noteLine=target.slice(0,target.indexOf(token)).split(/\r?\n/u).length;
const ledgerPath='evidence/SOURCE_CORRECTIONS.jsonl';
const rows=jsonl(ledgerPath);
const existing=rows.find(row=>row.finding_id==='OLTENMLAXSNOR-001');
if(existing){
  if(rows.length!==394||existing.unit_id!=='OLP-0429'||
     existing.audit_findings_sha256!==sha(read(auditDir+'FINDINGS.json'))||
     existing.audit_review_sha256!==sha(read(auditDir+'REVIEW.md')))
    throw new Error('Existing correction changed unexpectedly');
  existing.target_locator=`${targetPath}:${noteLine}`;
}else{
  if(rows.length!==393||rows.at(-1).finding_id!=='OLTENMLFRDST-001')
    throw new Error('Unexpected source-correction cursor');
  rows.push({
    audit_id:'OLTENMLAXSNOR-20260927',
    audit_review_sha256:sha(read(auditDir+'REVIEW.md')),
    audit_findings_sha256:sha(read(auditDir+'FINDINGS.json')),
    status:'applied_qa_pass',finding_id:'OLTENMLAXSNOR-001',unit_id:'OLP-0429',
    source_path:sourcePath,source_sha256:sha(source),
    source_locator:'normal-logics.tex lines 101-118',
    target_locator:`${targetPath}:${noteLine}`,
    classification:'smallest_modal_logic_proof_intersects_only_normal_logics',
    body_treatment:'ప్రతిపాదన అతి చిన్న మోడల్ తర్కం గురించే ఉంది; నిరూపణలో అన్ని మోడల్ తర్కాల ప్రతిచ్ఛేదాన్ని తీసుకుని, తరువాతి నిర్వచనానికి నార్మల్ వర్గం వాదనను వేరుగా పేర్కొని ప్రకటిత గమనిక ఉంచాం.',
    expected_core_math_delta:{source_only:[],target_only:[]}
  });
}
fs.writeFileSync(path.join(root,ledgerPath),rows.map(JSON.stringify).join('\n')+'\n','utf8');
console.log(JSON.stringify({corrections:rows.length,note_line:noteLine,audit_sha256:sha(read(auditDir+'FINDINGS.json'))}));
