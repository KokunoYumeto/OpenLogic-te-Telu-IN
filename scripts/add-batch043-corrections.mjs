import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const auditId = 'OLTELAMALP-20260925';
const auditDir = path.join(root, 'evidence', 'source-audits', '2026-09-25-lambda-alpha-telugu');
const sourcePath = 'content/lambda-calculus/syntax/alpha.tex';
const sourceSha = 'f17619c4515bbbc583990680fd46c1d57191327b0f4a3cce347b2a327a6d0dda';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const findingsBytes = fs.readFileSync(path.join(auditDir, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(auditDir, 'REVIEW.md'));
const findingsSha = sha(findingsBytes), reviewSha = sha(reviewBytes);
if (findingsSha !== '301aaad820cfa17eb326fd6956f085d3ba0dc1624869941f5ee44c16b396079d' ||
    reviewSha !== 'b4e096c69d72ed7db7ca71f5256de721046db79ec1def602094b191789c47877' ||
    sha(fs.readFileSync(path.join(root, 'upstream', sourcePath))) !== sourceSha) {
  throw new Error('Batch 043 source audit or source bytes changed');
}
const audit = JSON.parse(findingsBytes);
if (audit.audit_id !== auditId || audit.findings.length !== 7) throw new Error('Unexpected Batch 043 audit');
const locator = {
  'OLTELAMALP-001': 26,
  'OLTELAMALP-002': 113,
  'OLTELAMALP-003': 149,
  'OLTELAMALP-004': 179,
  'OLTELAMALP-005': 262,
  'OLTELAMALP-006': 276,
  'OLTELAMALP-007': 291,
};
const treatment = {
  'OLTELAMALP-001': 'added x unequal y to initial definition with adjacent disclosure',
  'OLTELAMALP-002': 'preserved duplicate pair and disclosed it without inventing a replacement',
  'OLTELAMALP-003': 'restored FV notation and inserted the missing set step and side condition',
  'OLTELAMALP-004': 'restored x as the variable absent after substitution, with adjacent explanation',
  'OLTELAMALP-005': 'explicitly flagged unproved nested-substitution definedness and supplied a counterexample to the source argument; theorem proof remains open',
  'OLTELAMALP-006': 'preserved source display for inspection and explicitly flagged unjustified equalities and incomplete uniqueness scope; theorem proof remains open',
  'OLTELAMALP-007': 'restored R-double-prime alpha R and definedness of the second pair, while disclosing the upstream proof gap',
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
if (existing.length && existing.length !== 7) throw new Error('Partial Batch 043 correction ledger');
if (!existing.length) {
  for (const finding of audit.findings) {
    lines.push(JSON.stringify({
      finding_id: finding.finding_id,
      audit_id: auditId,
      audit_review_sha256: reviewSha,
      audit_findings_sha256: findingsSha,
      unit_id: 'OLP-0362',
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
process.stdout.write(JSON.stringify({status: existing.length ? 'pass_idempotent' : 'added', findings: 7, findings_sha256: findingsSha, review_sha256: reviewSha}) + '\n');
