import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split(/\r?\n/u);
const records = lines.map(JSON.parse);
const refresh = process.argv.includes('--refresh');
if (process.argv.slice(2).some(argument => argument !== '--refresh')) throw new Error('Unknown option');
if (records.length === 90 && records.at(-1).term_id === 'TE-T090' && !refresh) {
  console.log(JSON.stringify({status: 'pass_idempotent', records: records.length}));
  process.exit(0);
}
if (refresh && records.length === 90 && records.at(-1).term_id === 'TE-T090') lines.pop();
if (lines.length !== 89 || JSON.parse(lines.at(-1)).term_id !== 'TE-T089') {
  throw new Error('Expected precisely pre-Batch-050 terminology ledger');
}
const decision = {
  term_id: 'TE-T090',
  source_term: 'parallel beta-reduction / beta-complete development / substitution-composition derivation',
  telugu: 'సమాంతర బీటా-తగ్గింపు / బీటా-సంపూర్ణ వికాసం / ప్రతిస్థాపన-సంయోజన వ్యుత్పత్తి',
  status: 'proof_and_inductive_register_attested_specialist_parallel_beta_sense_source_controlled_provisional',
  passages: ['TE-P024', 'TE-P025', 'TE-P027', 'TE-P029', 'TE-P032'],
  basis: 'TE-P024–025లో వ్యుత్పత్తి, నిరూపణ దశల తెలుగు నిర్మాణాన్ని; TE-P027లో పదం/చరం వివరణను; TE-P029, TE-P032లో ఆగమన వాదన, సిద్ధాంత-నిరూపణ గద్యాన్ని ప్రత్యక్షంగా చూశాం. ఏ పేజీ సమాంతర బీటా-తగ్గింపునో సంపూర్ణ వికాసాన్నో నేరుగా నిర్వచించదు. OLP-0369లోని నాలుగు నియమాలూ సంపూర్ణ వికాసపు నాలుగు సమీకరణాలూ ఆ ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి. గత TE-T078, TE-T087, TE-T089తో తగ్గింపు, రెడెక్స్, చర్చ్--రోసర్ పదజాలాన్ని కొనసాగించాం. OLTELAMCRPB-001–003 దిద్దుబాట్లు, నిరూపణ ఖాళీని పక్కనే ప్రకటిస్తున్నాయి.',
  uncertainty: 'సమాంతర, సంపూర్ణ వికాసం అనే ప్రత్యేక లాంబ్డా-కలనశాస్త్ర పదాలకు ప్రత్యక్ష స్థానిక సాక్ష్యం లేదు; నామకరణం తాత్కాలికం. ప్రతిస్థాపన-సంయోజన ఉపసిద్ధాంతపు పూర్తి నిరూపణ మూలంలో లేదు, ఈ అనువాదం దానిని పూరించలేదు.',
  borrowing: 'బీటా, రెడెక్స్, చర్చ్--రోసర్ మునుపటి బదిలీ పదాలు; β, M, N, P, Q, R, సంబంధ/ప్రతిస్థాపన మాక్రోలు గణిత గుర్తింపులుగా యథాతథం.',
};
fs.writeFileSync(ledgerPath, [...lines, JSON.stringify(decision)].join('\n') + '\n', 'utf8');
console.log(JSON.stringify({status: refresh ? 'refreshed' : 'added', records: lines.length + 1,
  term_id: decision.term_id}));
