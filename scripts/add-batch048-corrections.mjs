import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const auditId = 'OLTELAMETA-20260925';
const auditDir = path.join(root, 'evidence', 'source-audits', '2026-09-25-lambda-eta-telugu');
const sourcePath = 'content/lambda-calculus/syntax/eta.tex';
const sourceSha = 'a6027d321bb141166a89ae598a60f8cc559b5b74922b47f5932fe464a91eb978';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const findingsBytes = fs.readFileSync(path.join(auditDir, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(auditDir, 'REVIEW.md'));
const findingsSha = sha(findingsBytes), reviewSha = sha(reviewBytes);
if (findingsSha !== 'e2ca2c2353841673494105f155f39b1d8f5365a0e00a75ce890899ee050f2503' ||
    reviewSha !== '2d7a7d8249a588aea3ead3e15397a57ab561279ad60500402afcc3cb0ecd3f39' ||
    sha(fs.readFileSync(path.join(root, 'upstream', sourcePath))) !== sourceSha) {
  throw new Error('Batch 048 source audit or frozen source bytes changed');
}
const audit = JSON.parse(findingsBytes);
if (audit.audit_id !== auditId || audit.findings.length !== 2 ||
    audit.findings[0].finding_id !== 'OLTELAMETA-001' ||
    audit.findings[1].finding_id !== 'OLTELAMETA-002') {
  throw new Error('Unexpected Batch 048 audit');
}
const target = fs.readFileSync(path.join(root, 'translation', sourcePath), 'utf8').split(/\r?\n/u);
if (!target[47]?.includes('\\sourcecorrection{OLTELAMETA-001}') ||
    !target[78]?.includes('\\sourcecorrection{OLTELAMETA-002}')) {
  throw new Error('Target correction notes moved; inspect exact locators');
}
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
const prior = lines.map(JSON.parse);
const existing = prior.filter(row => row.audit_id === auditId);
if (existing.length && existing.length !== 2) throw new Error('Partial or duplicate Batch 048 correction ledger');
if (!existing.length) {
  for (const [index, finding] of audit.findings.entries()) {
    lines.push(JSON.stringify({
      finding_id: finding.finding_id,
      audit_id: auditId,
      audit_review_sha256: reviewSha,
      audit_findings_sha256: findingsSha,
      unit_id: 'OLP-0366',
      source_path: sourcePath,
      source_sha256: sourceSha,
      source_locator: finding.source_locator,
      target_locator: `translation/${sourcePath}:${index === 0 ? 48 : 79}`,
      classification: finding.classification,
      body_treatment: index === 0
        ? 'declared and restored the already-stated free-variable condition beside the eta-equivalence rule without changing the formula'
        : 'normalized two proof occurrences to the defined ext macro, with adjacent Telugu disclosure',
      expected_core_math_delta: {source_only: [], target_only: []},
      expected_protected_identifier_delta: {source_only: [], target_only: []},
      status: 'pending_math_adjudication',
    }));
  }
  fs.writeFileSync(ledgerPath, lines.join('\n') + '\n', 'utf8');
}
process.stdout.write(JSON.stringify({status: existing.length ? 'pass_idempotent' : 'added',
  findings: 2, findings_sha256: findingsSha, review_sha256: reviewSha}) + '\n');
