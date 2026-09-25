import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split(/\r?\n/u);
const records = lines.map(JSON.parse);
const refresh = process.argv.includes('--refresh');
if (process.argv.slice(2).some(argument => argument !== '--refresh')) throw new Error('Unknown option');
if (records.length === 87 && records.at(-1).term_id === 'TE-T087' && !refresh) {
  process.stdout.write(JSON.stringify({status: 'pass_idempotent', records: records.length}) + '\n');
  process.exit(0);
}
if (refresh && records.length === 87 && records.at(-1).term_id === 'TE-T087') lines.pop();
if (lines.length !== 86 || JSON.parse(lines.at(-1)).term_id !== 'TE-T086') {
  throw new Error('Expected precisely the pre-Batch-047 terminology ledger');
}
const decision = {
  term_id: 'TE-T087',
  source_term: 'natural reduction strategy / left-most redex / normalizing strategy',
  telugu: 'సహజ తగ్గింపు వ్యూహం / అత్యంత ఎడమవైపు రెడెక్స్ / నియత రూపాన్ని చేరే వ్యూహం',
  status: 'term_variable_scope_and_proof_register_attested_beta_strategy_specific_senses_source_controlled_provisional',
  passages: ['TE-P003', 'TE-P027', 'TE-P029', 'TE-P032'],
  basis: 'TE-P027లో పదం, చరం; TE-P029లో పరిధి, బద్ధ చరం; TE-P003, TE-P032లో వివరణ, నిరూపణ గద్య శైలిని ప్రత్యక్షంగా చూశాం. ఈ పేజీలు బీటా-సంకోచనం, రెడెక్స్ లేదా సహజ తగ్గింపు వ్యూహాన్ని నేరుగా బోధించవు. OLP-0365లోని ఒక్క-దశ నియమం, ఎడమవైపు రెడెక్స్ స్థాన నిర్వచనం, నియత రూపాన్ని చేరే iff వాదన ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి. TE-T078లోని స్థాపిత బీటా-సంకోచనం/తగ్గింపు/నియత రూపం పదజాలాన్ని కొనసాగించాం; OLTELAMBETA-001 మూల ఫైలు-గుర్తింపు భేదానికే చెందినది, వ్యూహానికి సాక్ష్యం కాదు.',
  uncertainty: 'మూల నిర్వచనం నియమాన్ని స్పష్టంచేస్తుంది; సహజ వ్యూహం, రెడెక్స్ అనే పేర్లకు మధ్యస్థ నామకరణ అనిశ్చితి ఉంది. ఈ విభాగం వ్యూహం నియత రూపం చేరుతుందనే వాదనకు స్వతంత్ర నిరూపణ ఇవ్వదు; పాఠ్యంలో తరువాతి చర్చ ఆధారంగా చెప్పినట్లు మాత్రమే ఉంచాం.',
  borrowing: 'బీటా, రెడెక్స్ సాంకేతిక స్వీకరణలు; చర్చ్--రోసర్ మూల వ్యక్తి పేర్లు. β, λ, M, N, P, Q, x, y మరియు తగ్గింపు బాణాలు గణిత సంకేతాలుగా యథాతథం.',
};
fs.writeFileSync(ledgerPath, [...lines, JSON.stringify(decision)].join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({status: refresh ? 'refreshed' : 'added', records: lines.length + 1, term_id: decision.term_id}) + '\n');
