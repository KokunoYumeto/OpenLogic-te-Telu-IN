import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const termPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const correctionPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const auditId = 'OLTELAMLDF-20260926';
const auditDir = path.join(root, 'evidence', 'source-audits', '2026-09-26-lambda-arithmetic-definability-telugu');
const findingsBytes = fs.readFileSync(path.join(auditDir, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(auditDir, 'REVIEW.md'));
const findingsSha = sha(findingsBytes), reviewSha = sha(reviewBytes);
if (findingsSha !== 'f51f51f84c5eb4a73afa8313d9f59108430b99c9e8fcb7b2692eecee1dd2f114' ||
    reviewSha !== '83ab888e67f7c632603a258b8f3a139ec9e5126ae09ea7b9b848f7b49c26836c') {
  throw new Error('Batch 053 audit changed');
}
const audit = JSON.parse(findingsBytes);
if (audit.audit_id !== auditId || audit.findings.length !== 4 || audit.source_files.length !== 3) {
  throw new Error('Unexpected audit scope');
}
const units = new Map(audit.source_files.map(file => [file.unit_id, file]));
for (const file of units.values()) {
  const bytes = fs.readFileSync(path.join(root, 'upstream', file.path));
  if (bytes.length !== file.bytes || sha(bytes) !== file.sha256) throw new Error('Frozen source changed: ' + file.path);
}
const targetLocators = new Map();
for (const finding of audit.findings) {
  const file = units.get(finding.unit_id);
  if (!file) throw new Error('Finding without unit: ' + finding.finding_id);
  const targetLines = fs.readFileSync(path.join(root, 'translation', file.path), 'utf8').split(/\r?\n/u);
  const matches = targetLines.flatMap((line, index) =>
    line.includes(`\\sourcecorrection{${finding.finding_id}}`) ? [index + 1] : []);
  if (matches.length !== 1) throw new Error('Missing or duplicated target note ' + finding.finding_id);
  targetLocators.set(finding.finding_id, `translation/${file.path}:${matches[0]}`);
}

const termLines = fs.readFileSync(termPath, 'utf8').trimEnd().split(/\r?\n/u);
const terms = termLines.map(JSON.parse);
if (terms.length === 92 && terms.at(-1).term_id === 'TE-T092') {
  const decision = {
    term_id: 'TE-T093',
    source_term: 'lambda definability / Church numeral / natural-number function / successor, addition, multiplication and exponentiation encodings',
    telugu: 'లాంబ్డాతో నిర్వచనీయత / చర్చ్ సంఖ్యాంకం / సహజ సంఖ్యలపై ప్రమేయం / ఉత్తరగామి, సంకలనం, గుణకారం, ఘాతాంకన సంకేతీకరణలు',
    status: 'arithmetical_function_and_proof_register_attested_church_numeral_and_lambda_encoding_senses_source_controlled_provisional',
    passages: ['TE-P005', 'TE-P007', 'TE-P011', 'TE-P032'],
    basis: 'TE-P005లో సహజ సంఖ్యల అంకగణిత ఉదాహరణలు, TE-P007లో సహజ సంఖ్యల వివరణతో సున్నా గురించి భిన్న ప్రాంతీయ సంప్రదాయం, TE-P011లో ప్రమేయం/స్థిర/తత్సమ ప్రమేయాల వాడుక, TE-P032లో ఆగమన-నిరూపణ శైలిని ప్రత్యక్షంగా చూశాం. ఇవి చర్చ్ సంఖ్యాంకాలను, లాంబ్డా సంకేతీకరణలను నేరుగా స్థాపించవు. OLP-0374 సంఖ్యాంక నిర్వచనం, పాక్షిక ప్రమేయ నిర్వచనం, OLP-0375 ఉత్తరగామి/సంకలన/గుణకార/ఘాతాంక పదాలే ప్రత్యేక అర్థాలను నియంత్రిస్తాయి; TE-T079లోని పూర్వ తాత్కాలిక నిర్ణయాన్ని కొనసాగిస్తున్నాం. OLTELAMLDFI-001, OLTELAMLDFARF-001–003 సూత్ర, దశ సవరణలను ప్రకటిస్తున్నాయి.',
    uncertainty: 'ప్రత్యక్ష స్థానిక లాంబ్డా-కలనశాస్త్ర సాక్ష్యం లేదు; సంఖ్యాంకం, నిర్వచనీయత, సంఖ్యల సంకేతీకరణ పదాలు తాత్కాలికం. స్థానిక పేజీ TE-P007 సున్నాను సహజ సంఖ్యలలో చేర్చదు; OpenLogic \\Nat సంప్రదాయం సున్నాను చేర్చుతుంది, కాబట్టి మూల గణిత సంప్రదాయాన్ని నిలిపాం.',
    borrowing: 'లాంబ్డా, చర్చ్ పూర్వ ప్రత్యేక/వ్యక్తి-పేరు బదిలీలు; f, F, \\Nat, \\num, \\lambd, \\fn వంటి గుర్తింపులు, లేబుళ్లు యథాతథం.',
  };
  fs.writeFileSync(termPath, [...termLines, JSON.stringify(decision)].join('\n') + '\n', 'utf8');
} else if (terms.length !== 93 || terms.at(-1).term_id !== 'TE-T093') {
  throw new Error('Unexpected Batch 053 terminology ledger');
}

const correctionLines = fs.readFileSync(correctionPath, 'utf8').trimEnd().split(/\r?\n/u);
const existing = correctionLines.map(JSON.parse).filter(row => row.audit_id === auditId);
if (existing.length && existing.length !== 4) throw new Error('Partial Batch 053 correction ledger');
if (existing.length) {
  const refreshed = correctionLines.map(line => {
    const row = JSON.parse(line);
    if (row.audit_id !== auditId) return line;
    if (row.audit_findings_sha256 !== findingsSha || !units.has(row.unit_id)) {
      throw new Error('Existing Batch 053 correction identity mismatch');
    }
    row.audit_review_sha256 = reviewSha;
    return JSON.stringify(row);
  });
  if (refreshed.some((line, index) => line !== correctionLines[index])) {
    fs.writeFileSync(correctionPath, refreshed.join('\n') + '\n', 'utf8');
  }
}
if (!existing.length) {
  const treatments = new Map([
    ['OLTELAMLDFI-001', 'restored the introduced constant-function subscript in c_k(n)=k and disclosed the source prose typo'],
    ['OLTELAMLDFARF-001', 'changed the numeral-to-two-arguments successor-proof arrow from one-step to many-step beta reduction and disclosed why'],
    ['OLTELAMLDFARF-002', 'changed four addition-derivation arrows from one-step to many-step beta reduction, retaining every intermediate term'],
    ['OLTELAMLDFARF-003', 'changed Add a to Add b in the alternative multiplication term so the second input is used, with adjacent disclosure'],
  ]);
  for (const finding of audit.findings) {
    const file = units.get(finding.unit_id);
    correctionLines.push(JSON.stringify({
      finding_id: finding.finding_id,
      audit_id: auditId,
      audit_review_sha256: reviewSha,
      audit_findings_sha256: findingsSha,
      unit_id: finding.unit_id,
      source_path: file.path,
      source_sha256: file.sha256,
      source_locator: finding.source_locator,
      target_locator: targetLocators.get(finding.finding_id),
      classification: finding.classification,
      body_treatment: treatments.get(finding.finding_id),
      expected_core_math_delta: {source_only: [], target_only: []},
      expected_protected_identifier_delta: {source_only: [], target_only: []},
      status: 'pending_math_adjudication',
    }));
  }
  fs.writeFileSync(correctionPath, correctionLines.join('\n') + '\n', 'utf8');
}
console.log(JSON.stringify({status: existing.length ? 'pass_idempotent' : 'added', term_id: 'TE-T093',
  findings: 4, findings_sha256: findingsSha, review_sha256: reviewSha}));
