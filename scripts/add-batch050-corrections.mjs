import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const auditId = 'OLTELAMCRPB-20260925';
const auditDir = path.join(root, 'evidence', 'source-audits', '2026-09-25-lambda-parallel-beta-telugu');
const sourcePath = 'content/lambda-calculus/church-rosser/parallel-beta-reduction.tex';
const sourceSha = '37905b8d25e97bb2554d4df43321bbcefd55816a7d89fe85279c4119a7871f52';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const findingsBytes = fs.readFileSync(path.join(auditDir, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(auditDir, 'REVIEW.md'));
const findingsSha = sha(findingsBytes), reviewSha = sha(reviewBytes);
if (findingsSha !== '6bd562927723c13a8976a0196e6ebe5e46e300f09a33bdec12b25a664ba3c5e8' ||
    reviewSha !== 'c9d81fcb0dbcb5773826e3d29cdc1bf3cfa11dbd4c7912a65c6abbb4a6035853' ||
    sha(fs.readFileSync(path.join(root, 'upstream', sourcePath))) !== sourceSha) {
  throw new Error('Batch 050 audit or frozen source changed');
}
const findings = JSON.parse(findingsBytes).findings;
if (findings.length !== 3 || findings.some((finding, index) =>
  finding.finding_id !== `OLTELAMCRPB-00${index + 1}`)) throw new Error('Unexpected findings');
const targetLines = fs.readFileSync(path.join(root, 'translation', sourcePath), 'utf8').split(/\r?\n/u);
const locators = [23, 97, 110];
locators.forEach((line, index) => {
  if (!targetLines[line - 1]?.includes(`\\sourcecorrection{${findings[index].finding_id}}`)) {
    throw new Error('Moved correction note ' + findings[index].finding_id);
  }
});
const ledgerPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
const existing = lines.map(JSON.parse).filter(row => row.audit_id === auditId);
if (existing.length && existing.length !== 3) throw new Error('Partial Batch 050 correction ledger');
if (!existing.length) {
  for (const [index, finding] of findings.entries()) lines.push(JSON.stringify({
    finding_id: finding.finding_id,
    audit_id: auditId,
    audit_review_sha256: reviewSha,
    audit_findings_sha256: findingsSha,
    unit_id: 'OLP-0369',
    source_path: sourcePath,
    source_sha256: sourceSha,
    source_locator: finding.source_locator,
    target_locator: `translation/${sourcePath}:${locators[index]}`,
    classification: finding.classification,
    body_treatment: [
      'restored the parallel premise of abstraction-congruence, with adjacent Telugu disclosure',
      'restored R-prime in the right-hand expanded substitution, with adjacent Telugu disclosure',
      'retained the displayed source formulas but disclosed missing freshness, definedness and substitution-interchange justification; no complete proof claimed',
    ][index],
    expected_core_math_delta: {source_only: [], target_only: []},
    expected_protected_identifier_delta: {source_only: [], target_only: []},
    status: 'pending_math_adjudication',
  }));
  fs.writeFileSync(ledgerPath, lines.join('\n') + '\n', 'utf8');
}
console.log(JSON.stringify({status: existing.length ? 'pass_idempotent' : 'added', findings: 3,
  findings_sha256: findingsSha, review_sha256: reviewSha}));
