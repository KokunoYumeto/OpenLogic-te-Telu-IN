import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const auditId = 'OLTELAMBETA-20260925';
const auditDir = path.join(root, 'evidence', 'source-audits', '2026-09-25-lambda-beta-telugu');
const sourcePath = 'content/lambda-calculus/syntax/beta.tex';
const sourceSha = '42355f0467bb8d19038e3cadd4b5f0d2ce58720cbed3130cb74f86f7be4fc0dd';
const driverPath = 'content/lambda-calculus/syntax/syntax.tex';
const driverSha = '8d4b46380a30f99e21a4eff935d0e8b3a5c23655709070cdd8aa5c63be62327e';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const findingsBytes = fs.readFileSync(path.join(auditDir, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(auditDir, 'REVIEW.md'));
const findingsSha = sha(findingsBytes), reviewSha = sha(reviewBytes);
if (findingsSha !== 'f3b39a1a5edd67573807fa86eb2c0a5a85a8e97fa6f9468afe376299b01bb420' ||
    reviewSha !== '47a24bd180b7f2dba0e70f3ddc243d837f21cdb8c10fb644e847f504ef1d6735' ||
    sha(fs.readFileSync(path.join(root, 'upstream', sourcePath))) !== sourceSha ||
    sha(fs.readFileSync(path.join(root, 'upstream', driverPath))) !== driverSha) {
  throw new Error('Batch 047 source audit, section or driver bytes changed');
}
const audit = JSON.parse(findingsBytes);
if (audit.audit_id !== auditId || audit.findings.length !== 1 ||
    audit.findings[0].finding_id !== 'OLTELAMBETA-001') {
  throw new Error('Unexpected Batch 047 audit');
}
const target = fs.readFileSync(path.join(root, 'translation', sourcePath), 'utf8').split(/\r?\n/u);
if (!target[10]?.includes('\\sourcecorrection{OLTELAMBETA-001}') ||
    target[8]?.trim() !== '\\olfileid{lam}{syn}{bet}') {
  throw new Error('Declared chapter-ID correction not found at target lines 9 and 11');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
const prior = lines.map(JSON.parse);
const existing = prior.filter(row => row.audit_id === auditId);
if (existing.length > 1) throw new Error('Duplicate Batch 047 correction ledger');
if (!existing.length) {
  const finding = audit.findings[0];
  lines.push(JSON.stringify({
    finding_id: finding.finding_id,
    audit_id: auditId,
    audit_review_sha256: reviewSha,
    audit_findings_sha256: findingsSha,
    unit_id: 'OLP-0365',
    source_path: sourcePath,
    source_sha256: sourceSha,
    source_locator: finding.source_locator,
    target_locator: `translation/${sourcePath}:11`,
    classification: finding.classification,
    body_treatment: 'repaired the section file ID chapter component from int to syn to match its importing syntax chapter, with adjacent Telugu disclosure',
    expected_core_math_delta: {source_only: [], target_only: []},
    expected_protected_identifier_delta: {
      source_only: ['\\olfileid{lam}{int}{bet}'],
      target_only: ['\\olfileid{lam}{syn}{bet}'],
    },
    status: 'pending_math_adjudication',
  }));
  fs.writeFileSync(ledgerPath, lines.join('\n') + '\n', 'utf8');
}
process.stdout.write(JSON.stringify({status: existing.length ? 'pass_idempotent' : 'added', findings: 1,
  findings_sha256: findingsSha, review_sha256: reviewSha}) + '\n');
