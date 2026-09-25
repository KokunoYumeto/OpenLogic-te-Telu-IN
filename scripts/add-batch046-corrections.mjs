import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const auditId = 'OLTELAMTR-20260925';
const auditDir = path.join(root, 'evidence', 'source-audits', '2026-09-25-lambda-term-classes-telugu');
const sourcePath = 'content/lambda-calculus/syntax/term-revisited.tex';
const sourceSha = '6b58e0943a9203c2d90bc0c533f880effdb583993134da6c2448cc3aad79fc67';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const findingsBytes = fs.readFileSync(path.join(auditDir, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(auditDir, 'REVIEW.md'));
const findingsSha = sha(findingsBytes), reviewSha = sha(reviewBytes);
if (findingsSha !== '9a4e288096b97ac7dd3eaec6b2510b60d5902fdfcb1c290bebe4a2594d6317a7' ||
    reviewSha !== '103f814b416693bdeb5977a0abfc4c4e0f06d256e2bf1ad4d94c2588070682f8' ||
    sha(fs.readFileSync(path.join(root, 'upstream', sourcePath))) !== sourceSha) {
  throw new Error('Batch 046 source audit or source bytes changed');
}
const audit = JSON.parse(findingsBytes);
if (audit.audit_id !== auditId || audit.findings.length !== 2) throw new Error('Unexpected Batch 046 audit');
const locator = {'OLTELAMTR-001': 55, 'OLTELAMTR-002': 60};
const treatment = {
  'OLTELAMTR-001': 'made the quotient-class result type explicit in Telugu prose while preserving the source formula and adding an adjacent disclosure',
  'OLTELAMTR-002': 'retained the upstream corollary reference and disclosed its unresolved inherited theorem-proof gaps rather than asserting independent well-definedness',
};
const target = fs.readFileSync(path.join(root, 'translation', sourcePath), 'utf8').split(/\r?\n/u);
for (const finding of audit.findings) {
  const line = locator[finding.finding_id];
  if (!target[line - 1]?.includes(`\\sourcecorrection{${finding.finding_id}}`)) {
    throw new Error(`Correction note not found at target line ${line}: ${finding.finding_id}`);
  }
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
const prior = lines.map(JSON.parse);
const existing = prior.filter(row => row.audit_id === auditId);
if (existing.length && existing.length !== 2) throw new Error('Partial Batch 046 correction ledger');
if (!existing.length) {
  for (const finding of audit.findings) {
    lines.push(JSON.stringify({
      finding_id: finding.finding_id,
      audit_id: auditId,
      audit_review_sha256: reviewSha,
      audit_findings_sha256: findingsSha,
      unit_id: 'OLP-0364',
      source_path: sourcePath,
      source_sha256: sourceSha,
      source_locator: finding.source_locator,
      target_locator: `translation/${sourcePath}:${locator[finding.finding_id]}`,
      classification: finding.classification,
      body_treatment: treatment[finding.finding_id],
      expected_core_math_delta: {source_only: [], target_only: []},
      status: 'pending_math_adjudication',
    }));
  }
  fs.writeFileSync(ledgerPath, lines.join('\n') + '\n', 'utf8');
}
process.stdout.write(JSON.stringify({status: existing.length ? 'pass_idempotent' : 'added', findings: 2, findings_sha256: findingsSha, review_sha256: reviewSha}) + '\n');
