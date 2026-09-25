import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split(/\r?\n/u);
const records = lines.map(JSON.parse);
const refresh = process.argv.includes('--refresh');
if (process.argv.slice(2).some(argument => argument !== '--refresh')) throw new Error('Unknown option');
if (records.length === 88 && records.at(-1).term_id === 'TE-T088' && !refresh) {
  process.stdout.write(JSON.stringify({status: 'pass_idempotent', records: records.length}) + '\n');
  process.exit(0);
}
if (refresh && records.length === 88 && records.at(-1).term_id === 'TE-T088') lines.pop();
if (lines.length !== 87 || JSON.parse(lines.at(-1)).term_id !== 'TE-T087') {
  throw new Error('Expected precisely the pre-Batch-048 terminology ledger');
}
const decision = {
  term_id: 'TE-T088',
  source_term: 'eta-contraction / beta-eta reduction / eta-equivalence / extensionality of lambda terms',
  telugu: 'ఏటా-సంకోచనం / బీటా-ఏటా తగ్గింపు / ఏటా-తుల్యత / లాంబ్డా పదాల విస్తారత',
  status: 'term_variable_function_and_proof_register_attested_eta_extensionality_sense_source_controlled_provisional',
  passages: ['TE-P008', 'TE-P027', 'TE-P029', 'TE-P032'],
  basis: 'TE-P008లో ప్రమేయం, దాని ఆర్గ్యుమెంట్/నిర్వచన పరిధి సంబంధాన్ని; TE-P027లో పదం, చరం; TE-P029లో పరిధి, బద్ధ చరం; TE-P032లో సిద్ధాంత-నిరూపణ శైలిని ప్రత్యక్షంగా చూశాం. ఈ స్థానిక పేజీలు ఏటా-సంకోచనం లేదా లాంబ్డా పదాల విస్తారతా నియమాన్ని బోధించవు. OLP-0366లోని x స్వేచ్ఛా-చర షరతు, ఏటా/విస్తారత నియమాలు, సమానత్వ సిద్ధాంతం ప్రత్యేక అర్థాన్ని నియంత్రిస్తాయి. TE-T046లో మొదటి-స్థాయి అర్థసంబంధ విస్తారతకు వాడిన తలపదాన్ని ఇక్కడ వేరు నియమంతో నిర్వచించి వాడాం; రెండింటి నియమాలు ఒకటేనని అనలేదు. TE-T078లోని బీటా పదజాలాన్ని కొనసాగించాం. OLTELAMETA-001–002 మూల నిర్వచన-సంకేత అస్పష్టతలను పక్కనే ప్రకటిస్తాయి.',
  uncertainty: 'మూల ఏటా/విస్తారతా నియమాల గణిత ఉద్దేశం స్పష్టం; కానీ ఏటా-పరివర్తనం, విస్తారత అనే తెలుగు తలపదాలకు ప్రత్యేక స్థానిక ప్రత్యక్ష ధృవీకరణ లేదు. షరతు మూల తుల్యతా నియమంలో మళ్లీ లేకపోవడం వల్ల నిర్వచన పఠనం జాగ్రత్తగా నమోదైంది.',
  borrowing: 'η, β గణిత గ్రీకు సంకేతాలు; ఏటా, బీటా వాటి తెలుగు ధ్వన్యనుకరణలు. M, N, f, x, FV, సంబంధ మాక్రోలు యథాతథం. \\ext మూల నియమ మాక్రో, ఆంగ్ల పదం కాదు.',
};
fs.writeFileSync(ledgerPath, [...lines, JSON.stringify(decision)].join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({status: refresh ? 'refreshed' : 'added', records: lines.length + 1,
  term_id: decision.term_id}) + '\n');
