import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
const records = lines.map(line => JSON.parse(line));
if (records.length === 81 && records.at(-1).term_id === 'TE-T081') {
  process.stdout.write(JSON.stringify({ status: 'pass_idempotent', records: records.length }) + '\n');
  process.exit(0);
}
if (records.length !== 80 || records.at(-1).term_id !== 'TE-T080') {
  throw new Error('Expected precisely the pre-Batch-042 terminology ledger');
}
const decision = {
  term_id: 'TE-T081',
  source_term: 'partial substitution / free-variable preservation and replacement / variable capture / bound-variable renaming / inductive hypothesis',
  telugu: 'పాక్షిక ప్రతిస్థాపన / స్వేచ్ఛా చరాల సంరక్షణ, మార్పు / అనుకోని చర బంధనం / బద్ధ చరానికి పేరు మార్పు / ఆగమన పరికల్పన',
  status: 'formal_logic_variable_scope_proof_and_function_register_attested_specialized_lambda_substitution_and_capture_senses_definition_controlled_provisional',
  passages: ['TE-P003', 'TE-P008', 'TE-P027', 'TE-P029', 'TE-P032'],
  basis: 'TE-P027లో పదం, చరం; TE-P029లో పరిధి, బద్ధ చరం; TE-P003, TE-P032లో నిరూపణ, ఆగమన శైలి; TE-P008లో సమితి, ప్రమేయ పదజాలం ప్రత్యక్షంగా ఉన్నాయి. ఈ పేజీలు లాంబ్డా ప్రతిస్థాపన యొక్క నాలుగు నియమాలను గానీ చరపట్టివేత నివారణను గానీ నేరుగా స్థాపించవు. OLP-0361 మూల నియమం, స్వేచ్ఛా చరాల నిర్వచనం, OLTELAMSUB-001–007 పరిశీలన ప్రత్యేక అర్థాలను నియంత్రిస్తాయి; TE-T078/TE-T080 గత పదజాలంతో స్థిరత్వాన్ని ఇస్తాయి.',
  uncertainty: 'నియమాలు, సరిచేసిన సమితి గణన ఆధారంగా భావార్థ అనిశ్చితి తక్కువ; ప్రతిస్థాపన, అనుకోని చర బంధనం అనే ప్రత్యేక తెలుగు నామకరణంలో మధ్యస్థ అనిశ్చితి ఉంది. నిపుణ సమీక్ష తరువాత మార్చవచ్చు; అది ఉత్పత్తికి అడ్డంకి కాదు.',
  borrowing: 'లాంబ్డా, ఆర్గ్యుమెంట్ సాంకేతిక స్వీకరణలు. M, N, P, Q, x, y, z, FV, Subst మరియు సూచికలు గణిత సంకేతాలు; వాటిని మార్చలేదు.',
};
fs.writeFileSync(ledgerPath, [...lines, JSON.stringify(decision)].join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({ status: 'added', records: records.length + 1, term_id: decision.term_id }) + '\n');
