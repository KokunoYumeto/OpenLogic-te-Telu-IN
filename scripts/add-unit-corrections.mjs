import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const configPath=process.argv[2];
if(!configPath||!/^scripts\/batch-\d{3}-corrections\.json$/u.test(configPath))
  throw new Error('Expected scripts/batch-NNN-corrections.json');
const c=JSON.parse(fs.readFileSync(path.join(root,configPath),'utf8'));
if(c.schema!=='openlogic-te-single-unit-correction-config/1')throw new Error('Bad correction config schema');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
if(sha('upstream/'+c.source_path)!==c.source_sha256||
   sha(c.audit_review_path)!==c.audit_review_sha256||
   sha(c.audit_findings_path)!==c.audit_findings_sha256)
  throw new Error('Frozen source or audit authority mismatch');
const authority=JSON.parse(fs.readFileSync(path.join(root,c.audit_findings_path),'utf8'));
if(authority.audit_id!==c.audit_id||authority.unit_id!==c.unit_id||
   authority.source_path!==c.source_path||authority.source_sha256!==c.source_sha256||
   authority.findings.length!==Object.keys(c.treatments).length)
  throw new Error('Finding set mismatch');
const file=path.join(root,'evidence/SOURCE_CORRECTIONS.jsonl');
const records=fs.readFileSync(file,'utf8').trimEnd().split(/\r?\n/u).map(JSON.parse);
const previous=records.filter(row=>row.unit_id!==c.unit_id);
const ownRecords=records.filter(row=>row.unit_id===c.unit_id);
const existing=new Map(ownRecords.map(row=>[row.finding_id,row]));
if(previous.length!==c.previous_corrections||
   existing.size!==ownRecords.length||ownRecords.length>authority.findings.length||
   ownRecords.some(row=>!authority.findings.some(f=>f.finding_id===row.finding_id)))
  throw new Error('Unexpected correction cursor');
const added=authority.findings.map(f=>{
  const treatment=c.treatments[f.finding_id];
  if(!treatment||!Number.isInteger(treatment.target_line))throw new Error('Missing correction treatment '+f.finding_id);
  return {audit_id:authority.audit_id,audit_review_sha256:sha(c.audit_review_path),
    audit_findings_sha256:sha(c.audit_findings_path),
    status:existing.get(f.finding_id)?.status==='applied_qa_pass'?'applied_qa_pass':'applied_pending_qa',
    finding_id:f.finding_id,unit_id:c.unit_id,source_path:c.source_path,
    source_sha256:c.source_sha256,source_locator:f.source_locator,
    target_locator:`translation/${c.source_path}:${treatment.target_line}`,
    classification:f.classification,body_treatment:treatment.body_treatment,
    expected_core_math_delta:f.expected_core_math_delta,
    ...(f.expected_protected_identifier_delta?{expected_protected_identifier_delta:f.expected_protected_identifier_delta}:{})};
});
fs.writeFileSync(file,[...previous,...added].map(JSON.stringify).join('\n')+'\n','utf8');
console.log(JSON.stringify({corrections:previous.length+added.length,added:added.map(x=>x.finding_id)}));
