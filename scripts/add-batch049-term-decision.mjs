import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split(/\r?\n/u);
const records = lines.map(JSON.parse);
const refresh = process.argv.includes('--refresh');
if (process.argv.slice(2).some(argument => argument !== '--refresh')) throw new Error('Unknown option');
if (records.length === 89 && records.at(-1).term_id === 'TE-T089' && !refresh) {
  process.stdout.write(JSON.stringify({status: 'pass_idempotent', records: records.length}) + '\n');
  process.exit(0);
}
if (refresh && records.length === 89 && records.at(-1).term_id === 'TE-T089') lines.pop();
if (lines.length !== 88 || JSON.parse(lines.at(-1)).term_id !== 'TE-T088') {
  throw new Error('Expected precisely the pre-Batch-049 terminology ledger');
}
const decision = {
  term_id: 'TE-T089',
  source_term: 'Church--Rosser property / unique normal form / grid of joining reductions',
  telugu: 'చర్చ్--రోసర్ లక్షణం / నియత రూపపు అనన్యత / తగ్గింపు మార్గాలను కలిపే జాలకం',
  status: 'proof_and_function_register_attested_church_rosser_specific_sense_source_controlled_provisional',
  passages: ['TE-P003', 'TE-P008', 'TE-P027', 'TE-P032'],
  basis: 'TE-P003, TE-P032లో కారణం, నిరూపణ, సిద్ధాంత గద్యాన్ని; TE-P008లో ప్రమేయం/ఆర్గ్యుమెంట్ పదజాలాన్ని; TE-P027లో పదం, చరం, తర్కశాస్త్ర వివరణను ప్రత్యక్షంగా చూశాం. ఏ పేజీ చర్చ్--రోసర్ లక్షణం, నియతీకరణ లేదా గణిత జాలక పద్ధతిని నేరుగా బోధించదు. OLP-0368లోని రెండు తగ్గింపు మార్గాలకు ఉమ్మడి దిగువ పదం ఉనికి అనే నిర్వచనమే ప్రత్యేక అర్థాన్ని నియంత్రిస్తుంది; మూల బీటా విభాగంలోని TE-T078, TE-T087 ఎంపికలతో నియత రూపం/తగ్గింపు పదజాలాన్ని కొనసాగించాం. OLTELAMCRDAP-001–002 మూల అతివ్యాప్తి, పేరులేని అంచు పదాలను పక్కనే ప్రకటిస్తాయి.',
  uncertainty: 'గణిత షరతులు మూల నిర్వచనం, జాలక వాదనలో నిర్దిష్టం. కానీ చర్చ్--రోసర్ అనే విదేశీ వ్యక్తి పేరుకు, జాలకం అనే ఉపమానానికి ప్రత్యక్ష స్థానిక లాంబ్డా-కలనశాస్త్ర సాక్ష్యం లేదు; నామకరణం తాత్కాలికం. ఈ విభాగం ప్రతి పదానికి నియత రూపం ఉందని చెప్పదు.',
  borrowing: 'చర్చ్, రోసర్ మూల వ్యక్తి పేర్ల ధ్వన్యనుకరణ; CR, M, N, P_i, Q_j, సంబంధ మాక్రోలు గణిత గుర్తింపులుగా యథాతథం.',
};
fs.writeFileSync(ledgerPath, [...lines, JSON.stringify(decision)].join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({status: refresh ? 'refreshed' : 'added', records: lines.length + 1,
  term_id: decision.term_id}) + '\n');
