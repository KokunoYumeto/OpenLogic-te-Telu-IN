import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
const records = lines.map(JSON.parse);
if (records.length === 82 && records.at(-1).term_id === 'TE-T082') {
  process.stdout.write(JSON.stringify({status: 'pass_idempotent', records: records.length}) + '\n');
  process.exit(0);
}
if (records.length !== 81 || records.at(-1).term_id !== 'TE-T081') {
  throw new Error('Expected precisely the pre-Batch-043 terminology ledger');
}
const decision = {
  term_id: 'TE-T082',
  source_term: 'alpha-conversion / alpha-equivalence / one-step bound-variable renaming / compatible relation / reflexive, symmetric and transitive relation / derivation',
  telugu: 'ఆల్ఫా-పరివర్తనం / ఆల్ఫా-తుల్యత / బద్ధ చరం పేరు మార్పు / అనుకూల సంబంధం / స్వప్రావర్తక, సౌష్టవ, సంక్రమణ సంబంధం / వ్యుత్పత్తి',
  status: 'formal_logic_variable_binding_relation_and_proof_register_attested_specialized_lambda_alpha_conversion_and_compatibility_definition_controlled_provisional',
  passages: ['TE-P003', 'TE-P008', 'TE-P027', 'TE-P029', 'TE-P032'],
  basis: 'TE-P027లో పదం, చరం; TE-P029లో పరిధి, బద్ధ చరం; TE-P008లో సమితి, సంబంధం, ప్రమేయం; TE-P003, TE-P032లో నిర్వచనం, ఆగమన నిరూపణ భాష ప్రత్యక్షంగా ఉన్నాయి. ఈ పేజీలు ఆల్ఫా-పరివర్తనం, ఆల్ఫా-తుల్యత, అనుకూల సంబంధం అనే ప్రత్యేక లాంబ్డా నామాలను నేరుగా స్థాపించవు. OLP-0362లోని ఏక-దశ, అనుకూలత్వం, స్వప్రావర్తక-సంక్రమణ నియమాలు వాటి ఖచ్చిత భావాన్ని నియంత్రిస్తాయి; TE-T078, TE-T081 గత పదజాలంతో స్థిరత్వాన్ని ఇస్తాయి. OLTELAMALP-001–007 మూల లోపాలు, నిరూపణ ఖాళీలను విడిగా ప్రకటిస్తాయి.',
  uncertainty: 'నిర్వచనాల ఆధారంగా ప్రాథమిక భావార్థం స్పష్టం; ఆల్ఫా-పరివర్తనం, అనుకూలత్వం అనే ప్రత్యేక తెలుగు నామాల్లో మధ్యస్థ అనిశ్చితి ఉంది. చివరి ప్రతిస్థాపన సిద్ధాంతపు మూల నిరూపణ అసంపూర్ణం; దాన్ని పదజాల నిర్ణయం నిరూపించదు.',
  borrowing: 'ఆల్ఫా అనేది గ్రీకు సంకేతపు సాంకేతిక స్వీకరణ; అసలు గణితంలో $\\alpha$, FV, Subst, బద్ధ చర సంకేతాలు యథాతథం.',
};
fs.writeFileSync(ledgerPath, [...lines, JSON.stringify(decision)].join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({status: 'added', records: records.length + 1, term_id: decision.term_id}) + '\n');
