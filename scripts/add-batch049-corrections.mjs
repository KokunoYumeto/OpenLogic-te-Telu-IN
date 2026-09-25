import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const auditId = 'OLTELAMCRDAP-20260925';
const auditDir = path.join(root, 'evidence', 'source-audits', '2026-09-25-lambda-church-rosser-opening-telugu');
const sourcePath = 'content/lambda-calculus/church-rosser/definitions-and-properties.tex';
const sourceSha = '8f2880db2bb1ecb7dc07bf844e6da844d82b48289a5f36270d20588d826deb6f';
const driverPath = 'content/lambda-calculus/church-rosser/church-rosser.tex';
const driverSha = 'f9a7362d873c4feed67ac0350ebb3c3cf3ddfd6046c4a7d0ef55e7086038ddf5';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const findingsBytes = fs.readFileSync(path.join(auditDir, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(auditDir, 'REVIEW.md'));
const findingsSha = sha(findingsBytes), reviewSha = sha(reviewBytes);
if (findingsSha !== '27053603be9d168a64e6a901e3f19bff7243f99cc2160820fc4879d8b9f9e4cc' ||
    reviewSha !== '3f1a03e484aa96342e98a89abe3c92143e1bfe0174199825d19c0a66d0a2d115' ||
    sha(fs.readFileSync(path.join(root, 'upstream', sourcePath))) !== sourceSha ||
    sha(fs.readFileSync(path.join(root, 'upstream', driverPath))) !== driverSha) {
  throw new Error('Batch 049 source audit, section or driver bytes changed');
}
const audit = JSON.parse(findingsBytes);
if (audit.audit_id !== auditId || audit.findings.length !== 2 ||
    audit.findings[0].finding_id !== 'OLTELAMCRDAP-001' ||
    audit.findings[1].finding_id !== 'OLTELAMCRDAP-002') {
  throw new Error('Unexpected Batch 049 audit');
}
const target = fs.readFileSync(path.join(root, 'translation', sourcePath), 'utf8').split(/\r?\n/u);
if (!target[28]?.includes('\\sourcecorrection{OLTELAMCRDAP-001}') ||
    !target[90]?.includes('\\sourcecorrection{OLTELAMCRDAP-002}')) {
  throw new Error('Target correction notes moved; inspect exact locators');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
const prior = lines.map(JSON.parse);
const existing = prior.filter(row => row.audit_id === auditId);
if (existing.length && existing.length !== 2) throw new Error('Partial or duplicate Batch 049 correction ledger');
if (!existing.length) {
  for (const [index, finding] of audit.findings.entries()) {
    lines.push(JSON.stringify({
      finding_id: finding.finding_id,
      audit_id: auditId,
      audit_review_sha256: reviewSha,
      audit_findings_sha256: findingsSha,
      unit_id: 'OLP-0368',
      source_path: sourcePath,
      source_sha256: sourceSha,
      source_locator: finding.source_locator,
      target_locator: `translation/${sourcePath}:${index === 0 ? 29 : 91}`,
      classification: finding.classification,
      body_treatment: index === 0
        ? 'qualified the explanatory uniqueness claim as conditional on a final value existing, with adjacent Telugu disclosure'
        : 'corrected the two undefined terminal endpoint names to P_m and Q_n, with adjacent Telugu disclosure',
      expected_core_math_delta: {source_only: [], target_only: []},
      expected_protected_identifier_delta: {source_only: [], target_only: []},
      status: 'pending_math_adjudication',
    }));
  }
  fs.writeFileSync(ledgerPath, lines.join('\n') + '\n', 'utf8');
}
process.stdout.write(JSON.stringify({status: existing.length ? 'pass_idempotent' : 'added',
  findings: 2, findings_sha256: findingsSha, review_sha256: reviewSha}) + '\n');
