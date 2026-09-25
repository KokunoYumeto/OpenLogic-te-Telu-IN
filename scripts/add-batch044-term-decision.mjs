import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split('\n');
const records = lines.map(JSON.parse);
if (records.length === 83 && records.at(-1).term_id === 'TE-T083') {
  process.stdout.write(JSON.stringify({status: 'pass_idempotent', records: records.length}) + '\n');
  process.exit(0);
}
if (records.length !== 82 || records.at(-1).term_id !== 'TE-T082') {
  throw new Error('Expected precisely the pre-Batch-044 terminology ledger');
}
const decision = {
  term_id: 'TE-T083',
  source_term: 'De Bruijn index / indexed nameless term / context list / nearest binder / reverse translation partiality',
  telugu: 'డి బ్రూయిన్ సూచిక / పేరులేని సూచికా పదం / చరాల సందర్భ జాబితా / దగ్గరి బంధకం / పాక్షిక తిరుగు అనువాదం',
  status: 'variable_scope_function_list_and_inductive_definition_register_attested_de_bruijn_index_and_context_sense_definition_controlled_provisional',
  passages: ['TE-P003', 'TE-P008', 'TE-P027', 'TE-P029', 'TE-P032'],
  basis: 'TE-P027లో చరాలు, పదాలు; TE-P029లో బద్ధ చరం, పరిధి; TE-P008లో సమితి, ప్రమేయం; TE-P003, TE-P032లో నిర్వచనం, ఆగమన వివరణ ప్రత్యక్షంగా ఉన్నాయి. ఈ పేజీలు డి బ్రూయిన్ సూచికలను నేరుగా బోధించవు. OLP-0363లోని F, G సమీకరణాలు, 0/1 ఉదాహరణ ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి. OLTELAMDEB-001–003లో మూల సంకేత అస్పష్టత, సందర్భ జాబితా, తిరుగు పటం పరిధి స్పష్టంచేయబడ్డాయి; TE-T078, TE-T080–082 గత లాంబ్డా పదజాలంతో స్థిరత్వాన్ని ఇస్తాయి.',
  uncertainty: 'సూచికల గణన ఉదాహరణతో స్పష్టం; డి బ్రూయిన్, సందర్భ జాబితా అనే తెలుగు నామాల్లో మధ్యస్థ అనిశ్చితి ఉంది. జాబితా-పొడవు మించిన సూచికలపై G నిర్వచితం కాదు అనే పరిమితిని తప్పక ఉంచాలి.',
  borrowing: 'డి బ్రూయిన్ అనేది మూలంలో ఉన్న వ్యక్తి పేరు; F, G, Γ, n మరియు λలు గణిత సంకేతాలు, వాటిని అనువదించలేదు.',
};
fs.writeFileSync(ledgerPath, [...lines, JSON.stringify(decision)].join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({status: 'added', records: records.length + 1, term_id: decision.term_id}) + '\n');
