import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const termPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const correctionPath = path.join(root, 'evidence', 'SOURCE_CORRECTIONS.jsonl');
const auditId = 'OLTELAMLDFPAIRTRUTH-20260926';
const auditDir = path.join(root, 'evidence', 'source-audits', '2026-09-26-lambda-pairs-truth-values-telugu');
const findingsBytes = fs.readFileSync(path.join(auditDir, 'FINDINGS.json'));
const reviewBytes = fs.readFileSync(path.join(auditDir, 'REVIEW.md'));
const findingsSha = sha(findingsBytes), reviewSha = sha(reviewBytes);
if (findingsSha !== '8fb7b1156d00ece965e840d7d825c854fd95e0d61ae7d15ac61dd239396c79bc' ||
    reviewSha !== 'b8f65fd74825f31bf8214d9ca0485c0f77435bc1b320f04f098254a58d4d6d03') {
  throw new Error('Batch 054 source audit changed');
}
const audit = JSON.parse(findingsBytes);
if (audit.audit_id !== auditId || audit.findings.length !== 1 ||
    audit.source_files.length !== 2 ||
    audit.scope.unit_ids.join(',') !== 'OLP-0376,OLP-0377') {
  throw new Error('Unexpected Batch 054 audit scope');
}
const units = new Map(audit.source_files.map(file => [file.unit_id, file]));
for (const file of units.values()) {
  const bytes = fs.readFileSync(path.join(root, 'upstream', file.path));
  if (bytes.length !== file.bytes || sha(bytes) !== file.sha256) {
    throw new Error('Frozen source changed: ' + file.path);
  }
}
const finding = audit.findings[0];
const targetLines = fs.readFileSync(path.join(root, 'translation', units.get(finding.unit_id).path), 'utf8').split(/\r?\n/u);
const noteLines = targetLines.flatMap((line, index) =>
  line.includes(`\\sourcecorrection{${finding.finding_id}}`) ? [index + 1] : []);
if (noteLines.length !== 1) throw new Error('Missing or duplicated target source-correction note');

const termLines = fs.readFileSync(termPath, 'utf8').trimEnd().split(/\r?\n/u);
const terms = termLines.map(JSON.parse);
if (terms.length === 93 && terms.at(-1).term_id === 'TE-T093') {
  const decisions = [
    {
      term_id: 'TE-T094',
      source_term: 'Church-encoded ordered pair / first and second projection / predecessor / subtraction',
      telugu: 'లాంబ్డాలో సంకేతీకరించిన క్రమయుగ్మం / మొదటి, రెండవ అవయవ ఎంపిక / పూర్వవర్తి / తీసివేత',
      status: 'ordered_pair_and_function_register_attested_lambda_pair_predecessor_encoding_source_controlled_provisional',
      passages: ['TE-P005', 'TE-P010', 'TE-P011', 'TE-P032', 'TE-P034'],
      basis: 'TE-P034లో క్రమయుగ్మం, TE-P010లో సంబంధంలో క్రమయుగ్మాల వాడుక, TE-P011లో ప్రమేయం, TE-P005లో సహజ సంఖ్యల అంకగణిత గద్యం, TE-P032లో నిరూపణ శైలిని ప్రత్యక్షంగా చూశాం. ఇవి చర్చ్ క్రమయుగ్మ సంకేతీకరణ లేదా లాంబ్డా పూర్వవర్తిని నేరుగా స్థాపించవు. OLP-0376లోని Pair/Fst/Snd నిర్వచనాలు, జత స్థితిని పునరావర్తించే Pred, Sub సూత్రాలే ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి; TE-T012, TE-T019, TE-T079, TE-T093 ఎంపికలను కొనసాగిస్తున్నాం.',
      uncertainty: 'క్రమయుగ్మం స్థానికంగా ప్రత్యక్షం; లాంబ్డా-సంకేతీకరణ, మొదటి/రెండవ అవయవ ఎంపిక, పూర్వవర్తి పదాల ప్రత్యేక నామకరణం తాత్కాలికం. OpenLogic సహజ సంఖ్యల్లో సున్నాను చేర్చే సంప్రదాయం మూలం ప్రకారమే.',
      borrowing: 'లాంబ్డా పూర్వ ప్రత్యేక బదిలీ; M, N, Pair, Fst, Snd, Pred, Sub, \\tuple, \\num, \\fn గుర్తింపులుగా యథాతథం.',
    },
    {
      term_id: 'TE-T095',
      source_term: 'Church truth-value selector / lambda-definable relation / zero test / negation, conjunction and disjunction',
      telugu: 'చర్చ్ సత్యమూల్య ఎంపిక ప్రమేయం / లాంబ్డాతో నిర్వచించదగిన సంబంధం / సున్నా పరీక్ష / నిషేధం, సంయోగం, వికల్పం',
      status: 'truth_value_connective_and_relation_register_attested_lambda_selector_encoding_source_controlled_provisional',
      passages: ['TE-P010', 'TE-P018', 'TE-P019', 'TE-P020'],
      basis: 'TE-P010లో సంబంధం, TE-P018లో ప్రతిజ్ఞాత్మక తర్క పరిధి, TE-P019లో సత్యతావిలువ, నిషేధం, సంయోజక పట్టిక, TE-P020లో వియోజక సత్య షరతులను ప్రత్యక్షంగా చూశాం. పూర్వ TE-T032, TE-T033లతో సత్యమూల్యం, సంయోగం, వికల్పం రూపాలను స్థిరంగా వాడుతున్నాం. ఏ స్థానిక పేజీ చర్చ్ ఎంపిక ప్రమేయం లేదా లాంబ్డా-నిర్వచనీయ సంబంధాన్ని నేరుగా బోధించదు; OLP-0377 true/false/IsZero/Not/And పదాలే ప్రత్యేక భావాన్ని నియంత్రిస్తాయి. OLTELAMLDFTVR-001 సంబంధపు స్థానం సవరణను ప్రకటిస్తుంది.',
      uncertainty: 'నిషేధ/సంయోగ/వికల్ప సత్య షరతులకు స్థానిక తర్క పేజీలు ప్రత్యక్ష ఆధారం. సత్యమూల్యాన్ని రెండు-ఆర్గ్యుమెంట్ల లాంబ్డా ఎంపిక ప్రమేయంగా సూచించే ప్రత్యేక నామకరణం తాత్కాలికం; Xorకు వివరించిన అభ్యాస షరతే ఖచ్చిత అర్థం.',
      borrowing: 'లాంబ్డా పూర్వ సాంకేతిక బదిలీ; R, M, N, IsZero, Not, And, Or, Xor, \\Nat, \\num, \\fn గణిత గుర్తింపులుగా యథాతథం.',
    },
  ];
  fs.writeFileSync(termPath, [...termLines, ...decisions.map(JSON.stringify)].join('\n') + '\n', 'utf8');
} else if (terms.length !== 95 || terms.at(-1).term_id !== 'TE-T095') {
  throw new Error('Unexpected terminology ledger at Batch 054');
}

const correctionLines = fs.readFileSync(correctionPath, 'utf8').trimEnd().split(/\r?\n/u);
const existing = correctionLines.map(JSON.parse).filter(row => row.audit_id === auditId);
let auditRefreshed = false;
if (existing.length && existing.length !== 1) throw new Error('Partial Batch 054 correction ledger');
if (!existing.length) {
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
    target_locator: `translation/${file.path}:${noteLines[0]}`,
    classification: finding.classification,
    body_treatment: 'ప్రకటించిన సంబంధపు స్థానాన్ని మాత్రమే Nat^n నుంచి Nat^kకు మార్చి, రెండు k-ఆర్గ్యుమెంట్ల సూత్రాలు, నిజత్వ షరతును నిలిపి పక్కనే సవరణను ప్రకటించాం',
    expected_core_math_delta: {source_only: [], target_only: []},
    expected_protected_identifier_delta: {source_only: [], target_only: []},
    status: 'pending_math_adjudication',
  }));
  fs.writeFileSync(correctionPath, correctionLines.join('\n') + '\n', 'utf8');
} else {
  const row = existing[0];
  if (row.finding_id !== finding.finding_id || row.unit_id !== finding.unit_id ||
      row.source_sha256 !== units.get(finding.unit_id).sha256 ||
      row.target_locator !== `translation/${units.get(finding.unit_id).path}:${noteLines[0]}`) {
    throw new Error('Existing Batch 054 correction identity mismatch');
  }
  const updated = correctionLines.map(line => {
    const item = JSON.parse(line);
    if (item.audit_id !== auditId) return line;
    item.audit_review_sha256 = reviewSha;
    item.audit_findings_sha256 = findingsSha;
    item.body_treatment = 'ప్రకటించిన సంబంధపు స్థానాన్ని మాత్రమే Nat^n నుంచి Nat^kకు మార్చి, రెండు k-ఆర్గ్యుమెంట్ల సూత్రాలు, నిజత్వ షరతును నిలిపి పక్కనే సవరణను ప్రకటించాం';
    return JSON.stringify(item);
  });
  if (updated.some((line, index) => line !== correctionLines[index])) {
    fs.writeFileSync(correctionPath, updated.join('\n') + '\n', 'utf8');
    auditRefreshed = true;
  }
}
console.log(JSON.stringify({status: existing.length ? auditRefreshed ? 'refreshed' : 'pass_idempotent' : 'added',
  term_ids: ['TE-T094', 'TE-T095'], findings: 1, findings_sha256: findingsSha,
  review_sha256: reviewSha}));
