import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split(/\r?\n/u);
const records = lines.map(JSON.parse);
const refresh = process.argv.includes('--refresh');
if (process.argv.slice(2).some(argument => argument !== '--refresh')) throw new Error('Unknown option');
if (records.length === 86 && records.at(-1).term_id === 'TE-T086' && !refresh) {
  process.stdout.write(JSON.stringify({status: 'pass_idempotent', records: records.length}) + '\n');
  process.exit(0);
}
if (refresh && records.length === 86 && records.at(-1).term_id === 'TE-T086') lines.pop();
if (lines.length !== 85 || JSON.parse(lines.at(-1)).term_id !== 'TE-T085') {
  throw new Error('Expected precisely the pre-Batch-046 terminology ledger');
}
const decision = {
  term_id: 'TE-T086',
  source_term: 'alpha-equivalence class / representative / well-defined class operation / projection to Lambda-terms',
  telugu: 'ఆల్ఫా-తుల్యతా వర్గం / ప్రతినిధి / ప్రతినిధి ఎంపికపై ఆధారపడని వర్గ చర్య / లాంబ్డా వర్గాలపైకి దింపడం',
  status: 'set_relation_variable_register_attested_alpha_quotient_and_projection_senses_source_controlled_provisional',
  passages: ['TE-P003', 'TE-P008', 'TE-P027', 'TE-P029', 'TE-P032'],
  basis: 'TE-P008లో సమితి/సంబంధానికి సాధారణ గణిత గద్యాన్ని, TE-P027, TE-P029లో చరం/పరిధి/బద్ధ చరానికి సంబంధించిన పాఠ్యాన్ని, TE-P003, TE-P032లో నిర్వచన శైలిని ప్రత్యక్షంగా చూశాం. ఈ పేజీలు ఆల్ఫా-తుల్యతా భాగవర్గం, ప్రతినిధి ఎంపిక స్వాతంత్ర్యం, భాగపటం దింపడం అనే ప్రత్యేక భావాలను నేరుగా బోధించవు. OLP-0364లోని వర్గ నిర్వచనాలు, OLP-0362లోని ఆల్ఫా సంబంధం వాటి అర్థాన్ని నియంత్రిస్తాయి. OLTELAMTR-001లో ప్రతిస్థాపన ఫలితపు పదం/వర్గం రకం స్పష్టం; OLTELAMTR-002లో ఆధార నిరూపణ ఖాళీ ప్రకటించబడింది.',
  uncertainty: 'ఆల్ఫా-తుల్యతా వర్గం, ప్రతినిధి పదాలు నిర్వచనపరంగా స్పష్టం; వర్గాలపైకి దింపడం అనే quotient-map వివరణకు మధ్యస్థ భాషా అనిశ్చితి ఉంది. ప్రతినిధి ఎంపికపై స్వాతంత్ర్యం మూల నిరూపణ ఖాళీ వల్ల ఇక్కడ స్వతంత్రంగా నిర్ధారించబడలేదు.',
  borrowing: 'α, λ, Λ, FV, Subst, rep గణిత సంకేతాలు యథాతథం; ప్రత్యేక తెలుగు నామానికి నేర సాక్ష్యమని వాటిని చూపలేదు.',
};
fs.writeFileSync(ledgerPath, [...lines, JSON.stringify(decision)].join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({status: refresh ? 'refreshed' : 'added', records: lines.length + 1, term_id: decision.term_id}) + '\n');
