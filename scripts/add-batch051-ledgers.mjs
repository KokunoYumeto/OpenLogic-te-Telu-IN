import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const termPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const correctionPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const auditId = 'OLTELAMCRB-20260925';
const auditDir = path.join(root, 'evidence', 'source-audits', '2026-09-25-lambda-beta-church-rosser-telugu');
const sourcePath = 'content/lambda-calculus/church-rosser/beta-reduction.tex';
const sourceSha = 'c51e50d16a675080277053003c33dc22951be9a43bb9910cc1bf1dff6e05f361';
const findingsBytes = fs.readFileSync(path.join(auditDir, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(auditDir, 'REVIEW.md'));
const findingsSha = sha(findingsBytes), reviewSha = sha(reviewBytes);
if (findingsSha !== 'a7f19ab5901bcf01fddc3746f1b0b54771be55c5023a5a4d95e253866ff60e88' ||
    reviewSha !== '4a43d2f8876e3d445f61077513d4c2288924724c6d5185cfe0b43f4d1a4bcf52' ||
    sha(fs.readFileSync(path.join(root, 'upstream', sourcePath))) !== sourceSha) {
  throw new Error('Batch 051 audit or frozen source changed');
}
const findings = JSON.parse(findingsBytes).findings;
if (findings.length !== 3 || findings.some((finding, index) =>
  finding.finding_id !== `OLTELAMCRB-00${index + 1}`)) throw new Error('Unexpected audit findings');
const locators = [24, 55, 96];
const targetLines = fs.readFileSync(path.join(root, 'translation', sourcePath), 'utf8').split(/\r?\n/u);
locators.forEach((line, index) => {
  if (!targetLines[line - 1]?.includes(`\\sourcecorrection{${findings[index].finding_id}}`)) {
    throw new Error('Moved correction note ' + findings[index].finding_id);
  }
});

const termLines = fs.readFileSync(termPath, 'utf8').trimEnd().split(/\r?\n/u);
const terms = termLines.map(JSON.parse);
if (terms.length === 90 && terms.at(-1).term_id === 'TE-T090') {
  const decision = {
    term_id: 'TE-T091',
    source_term: 'compatible beta-contraction / parallel beta-reduction comparison / least transitive relation / Church--Rosser transfer',
    telugu: 'అనుకూల బీటా-సంకోచనం / సమాంతర బీటా-తగ్గింపుతో పోలిక / కనిష్ఠ సంక్రమణ సంబంధం / చర్చ్--రోసర్ లక్షణ బదిలీ',
    status: 'proof_register_attested_specialist_relation_senses_source_controlled_provisional',
    passages: ['TE-P024', 'TE-P029', 'TE-P032'],
    basis: 'TE-P024లో వ్యుత్పత్తి, నిరూపణ దశలు; TE-P029లో చర పరిధి/బద్ధత్వం; TE-P032లో తర్క పద్ధతుల ఆగమన, సిద్ధాంత గద్యాన్ని ప్రత్యక్షంగా చూశాం. ఏ పేజీ లాంబ్డా-బీటా సంకోచనం, సమాంతర తగ్గింపు లేదా చర్చ్--రోసర్ బదిలీని నేరుగా నిర్వచించదు. OLP-0365లోని అనుకూల బీటా-సంకోచన నిర్వచనం, OLP-0369 నాలుగు నియమాలు, OLP-0368 సంక్రమణ-మూసివేత ఫలితం ఇక్కడి ప్రత్యేక అర్థాలను నియంత్రిస్తాయి. OLTELAMCRB-001–003 నిరూపణ పరిమితి, సాక్షి-పద సవరణ, వారసత్వ ఖాళీలను పక్కనే ప్రకటిస్తున్నాయి.',
    uncertainty: 'ప్రత్యక్ష స్థానిక లాంబ్డా-కలనశాస్త్ర సాక్ష్యం లేదు; ప్రత్యేక పదాల ఎంపిక తాత్కాలికం. బీటా సంకోచనం నుంచి సమాంతర తగ్గింపుకు మూల నిరూపణలో అనుకూల సందర్భాలు లేవు; ముందరి ప్రతిస్థాపన-సంయోజన ఖాళీ కూడా తెరిచే ఉంది.',
    borrowing: 'బీటా, చర్చ్--రోసర్ మునుపటి బదిలీ పదాలు; β, M, N, P, Q, సంబంధ/ప్రతిస్థాపన మాక్రోలు గణిత గుర్తింపులుగా యథాతథం.',
  };
  fs.writeFileSync(termPath, [...termLines, JSON.stringify(decision)].join('\n') + '\n', 'utf8');
} else if (terms.length !== 91 || terms.at(-1).term_id !== 'TE-T091') {
  throw new Error('Unexpected Batch 051 terminology ledger');
}

const correctionLines = fs.readFileSync(correctionPath, 'utf8').trimEnd().split('\n');
const existing = correctionLines.map(JSON.parse).filter(row => row.audit_id === auditId);
if (existing.length && existing.length !== 3) throw new Error('Partial Batch 051 correction ledger');
if (!existing.length) {
  findings.forEach((finding, index) => correctionLines.push(JSON.stringify({
    finding_id: finding.finding_id,
    audit_id: auditId,
    audit_review_sha256: reviewSha,
    audit_findings_sha256: findingsSha,
    unit_id: 'OLP-0370',
    source_path: sourcePath,
    source_sha256: sourceSha,
    source_locator: finding.source_locator,
    target_locator: `translation/${sourcePath}:${locators[index]}`,
    classification: finding.classification,
    body_treatment: [
      'retained the printed root-redex calculation but disclosed omitted compatible context cases; no complete proof claimed',
      'replaced the extraneous M-prime in the case-four witness list with N-prime, with adjacent Telugu disclosure',
      'retained the three cited dependencies in the final Church--Rosser proof but disclosed inherited proof gaps; no independent certification claimed',
    ][index],
    expected_core_math_delta: {source_only: [], target_only: []},
    expected_protected_identifier_delta: {source_only: [], target_only: []},
    status: 'pending_math_adjudication',
  })));
  fs.writeFileSync(correctionPath, correctionLines.join('\n') + '\n', 'utf8');
}
console.log(JSON.stringify({status: existing.length ? 'pass_idempotent' : 'added',
  term_id: 'TE-T091', findings: 3, findings_sha256: findingsSha, review_sha256: reviewSha}));
