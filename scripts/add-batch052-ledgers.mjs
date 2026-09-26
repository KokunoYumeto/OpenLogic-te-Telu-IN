import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const termPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const correctionPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const auditId = 'OLTELAMCRBE-20260926';
const auditDir = path.join(root, 'evidence', 'source-audits', '2026-09-26-lambda-beta-eta-church-rosser-telugu');
const findingsBytes = fs.readFileSync(path.join(auditDir, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(auditDir, 'REVIEW.md'));
const findingsSha = sha(findingsBytes), reviewSha = sha(reviewBytes);
if (findingsSha !== '011344a81bb187a3bded90bd1555a85d04d724a6e299cb7ef4cb5f86424702db' ||
    reviewSha !== '29a4736a6b43e2356b4330747dea0853596864dc345c7f592a0a83c72a6e6040') {
  throw new Error('Batch 052 audit changed');
}
const audit = JSON.parse(findingsBytes);
if (audit.audit_id !== auditId || audit.findings.length !== 9) throw new Error('Unexpected audit');
const units = new Map(audit.source_files.map(file => [file.unit_id, file]));
for (const file of units.values()) {
  if (sha(fs.readFileSync(path.join(root, 'upstream', file.path))) !== file.sha256) {
    throw new Error('Frozen source changed: ' + file.path);
  }
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
if (terms.length === 91 && terms.at(-1).term_id === 'TE-T091') {
  const decision = {
    term_id: 'TE-T092',
    source_term: 'parallel beta-eta reduction / beta-eta complete development / one-step beta-eta comparison',
    telugu: 'సమాంతర బీటా-ఏటా తగ్గింపు / బీటా-ఏటా సంపూర్ణ వికాసం / ఒక-దశ బీటా-ఏటా పోలిక',
    status: 'proof_register_attested_specialist_relation_senses_source_controlled_provisional',
    passages: ['TE-P024', 'TE-P027', 'TE-P032'],
    basis: 'TE-P024లో వ్యుత్పత్తి, నిరూపణ దశలు; TE-P027లో చరరాశి వాడుక; TE-P032లో ఆగమన, నిరూపణ పద్ధతుల గద్యాన్ని ప్రత్యక్షంగా చూశాం. ఏ పేజీ సమాంతర బీటా-ఏటా తగ్గింపు, సంపూర్ణ వికాసం, ఒక-దశ సంబంధాన్ని నేరుగా నిర్వచించదు. OLP-0371లోని అయిదు నియమాలు, సంపూర్ణ వికాస సమీకరణాలు, OLP-0372లోని పూర్వ సంబంధ నిర్వచనాలే ప్రత్యేక అర్థాలను నియంత్రిస్తాయి. OLTELAMCRPBE-001–005, OLTELAMCRBE-001–004 సవరణలు, నిర్వచన మరియు నిరూపణ పరిమితులను పక్కనే ప్రకటిస్తున్నాయి.',
    uncertainty: 'ప్రత్యక్ష స్థానిక లాంబ్డా-కలనశాస్త్ర సాక్ష్యం లేదు; ప్రత్యేక పదాల ఎంపిక తాత్కాలికం. సంపూర్ణ వికాస సమీకరణాలు ఏటా సందర్భంలో అతివ్యాప్తి చెందుతున్నాయి; beredone ఒక-దశ సంబంధం మూలంలో నిర్వచితం కాదు; పేర్కొన్న నిరూపణ ఖాళీలు పూరించలేదు.',
    borrowing: 'బీటా, ఏటా, చర్చ్--రోసర్ మునుపటి బదిలీ పదాలు; β, η, M, N, సంబంధ/ప్రతిస్థాపన మాక్రోలు గణిత గుర్తింపులుగా యథాతథం.',
  };
  fs.writeFileSync(termPath, [...termLines, JSON.stringify(decision)].join('\n') + '\n', 'utf8');
} else if (terms.length !== 92 || terms.at(-1).term_id !== 'TE-T092') {
  throw new Error('Unexpected Batch 052 terminology ledger');
}

const correctionLines = fs.readFileSync(correctionPath, 'utf8').trimEnd().split(/\r?\n/u);
const existing = correctionLines.map(JSON.parse).filter(row => row.audit_id === auditId);
if (existing.length && existing.length !== 9) throw new Error('Partial Batch 052 correction ledger');
if (!existing.length) {
  const treatments = new Map([
    ['OLTELAMCRPBE-001', 'replaced ordinary beta premise in abstraction rule with parallel beta-eta premise and disclosed the source formula'],
    ['OLTELAMCRPBE-002', 'retained all five printed complete-development equations and disclosed eta-clause overlap and non-uniqueness'],
    ['OLTELAMCRPBE-003', 'retained printed eta-substitution case but disclosed missing freshness, definedness and earlier proof dependency'],
    ['OLTELAMCRPBE-004', 'retained induction shape but disclosed dependence on ambiguous complete development and earlier proof gap'],
    ['OLTELAMCRPBE-005', 'retained Church--Rosser theorem and citation but disclosed inherited unresolved lemma'],
    ['OLTELAMCRBE-001', 'retained printed one-step lemma and disclosed undefined mathematical one-step relation'],
    ['OLTELAMCRBE-002', 'corrected eta branch from beta to eta contraction while disclosing missing rule justification and prior context-case gap'],
    ['OLTELAMCRBE-003', 'retained printed final eta case and disclosed omitted four cases and undefined one-step notation'],
    ['OLTELAMCRBE-004', 'retained three exact theorem citations and disclosed inherited definition and proof limitations'],
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
console.log(JSON.stringify({status: existing.length ? 'pass_idempotent' : 'added',
  term_id: 'TE-T092', findings: 9, findings_sha256: findingsSha, review_sha256: reviewSha}));
