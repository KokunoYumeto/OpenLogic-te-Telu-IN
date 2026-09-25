import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const auditId = 'OLTELAMDEB-20260925';
const auditDir = path.join(root, 'evidence', 'source-audits', '2026-09-25-lambda-de-bruijn-telugu');
const sourcePath = 'content/lambda-calculus/syntax/de-bruijn.tex';
const sourceSha = '7a9ea3ae6329f8dc7620476401d748941516cf27e5ec29a48f57d422dd7d9d35';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const findingsBytes = fs.readFileSync(path.join(auditDir, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(auditDir, 'REVIEW.md'));
const findingsSha = sha(findingsBytes), reviewSha = sha(reviewBytes);
if (findingsSha !== '4b46cb0bdcac2ace5d072a97feeec6f3cd449322914d49ec33a6eac8ef580237' ||
    reviewSha !== 'a45dc4920ed27f6f4ef7355c452f7fc26323ea9b2ab38592f7d9b7027ef2996e' ||
    sha(fs.readFileSync(path.join(root, 'upstream', sourcePath))) !== sourceSha) {
  throw new Error('Batch 044 source audit or source bytes changed');
}
const audit = JSON.parse(findingsBytes);
if (audit.audit_id !== auditId || audit.findings.length !== 3) throw new Error('Unexpected Batch 044 audit');
const locator = {
  'OLTELAMDEB-001': 31,
  'OLTELAMDEB-002': 56,
  'OLTELAMDEB-003': 79,
};
const treatment = {
  'OLTELAMDEB-001': 'rephrased garbled English binder prose and distinguished the two zero and one indices inside the whole term, with adjacent disclosure',
  'OLTELAMDEB-002': 'specified the first occurrence in a shadowing context, with adjacent disclosure',
  'OLTELAMDEB-003': 'specified the partial domain of the inverse map G for out-of-range indices, with adjacent disclosure',
};
const target = fs.readFileSync(path.join(root, 'translation', sourcePath), 'utf8').split(/\r?\n/);
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
if (existing.length && existing.length !== 3) throw new Error('Partial Batch 044 correction ledger');
if (!existing.length) {
  for (const finding of audit.findings) {
    lines.push(JSON.stringify({
      finding_id: finding.finding_id,
      audit_id: auditId,
      audit_review_sha256: reviewSha,
      audit_findings_sha256: findingsSha,
      unit_id: 'OLP-0363',
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
process.stdout.write(JSON.stringify({status: existing.length ? 'pass_idempotent' : 'added', findings: 3, findings_sha256: findingsSha, review_sha256: reviewSha}) + '\n');
