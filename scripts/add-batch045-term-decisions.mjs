import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(root, 'evidence', 'TERM_DECISIONS.jsonl');
const lines = fs.readFileSync(ledgerPath, 'utf8').trimEnd().split(/\r?\n/u);
const records = lines.map(JSON.parse);
if (records.length === 85 && records.at(-1).term_id === 'TE-T085') {
  process.stdout.write(JSON.stringify({status: 'pass_idempotent', records: records.length}) + '\n');
  process.exit(0);
}
if (records.length !== 83 || records.at(-1).term_id !== 'TE-T083') {
  throw new Error('Expected precisely the pre-Batch-045 terminology ledger');
}
const decisions = [
  {
    term_id: 'TE-T084',
    source_term: 'formal meta-logic / formal methods',
    telugu: 'ఆచారబద్ధ అధితర్కం / ఆచారబద్ధ పద్ధతులు',
    status: 'formal_logic_register_attested_meta_logic_compound_source_controlled_provisional',
    passages: ['TE-P003', 'TE-P027', 'TE-P032'],
    basis: 'TE-P027, TE-P032లో ఆచారబద్ధ తర్కం, చరం, నిరూపణ వంటి సాధారణ రిజిస్టర్‌ను; TE-P003లో పాఠ్య వివరణ శైలిని ప్రత్యక్షంగా చూశాం. ఆ పేజీలు అధితర్కం అనే ప్రత్యేక నామానికి గానీ Open Logic Project చరిత్రకు గానీ ప్రత్యక్ష సాక్ష్యం కావు. OLP-0001 మూలంలోని formal meta-logicను తర్కాన్ని పరిశీలించే అధ్యయనంగా, formal methodsను దాని నుంచి వేరు పద్ధతులుగా ఉంచే తాత్కాలిక పదకూర్పు ఎంచుకున్నాం.',
    uncertainty: 'అధితర్కం నామానికి మధ్యస్థ అనిశ్చితి ఉంది; స్థిర తెలుగు అధితార్కిక పాఠ్యసాక్ష్యం ఇంకా కనుగొనలేదు. మూలంలోని intermediate level, non-mathematical audience, rigor అనే తేడాలను మార్చలేదు.',
    borrowing: 'Open Logic Text అనేది మూల గ్రంథ నామం; దాని పేరును యథాతథంగా ఉంచాం.',
  },
  {
    term_id: 'TE-T085',
    source_term: 'Naive Set Theory / basic naive set theory',
    telugu: 'అనౌపచారిక సమితి సిద్ధాంతం / ప్రాథమిక అనౌపచారిక సమితి సిద్ధాంతం',
    status: 'set_theory_register_attested_naive_specific_sense_source_controlled_provisional',
    passages: ['TE-P003', 'TE-P008', 'TE-P032'],
    basis: 'TE-P008లో సమితి, సమితి భావన, గణిత వివరణను; TE-P003, TE-P032లో పరిచయ/నిర్వచన శైలిని ప్రత్యక్షంగా చూశాం. ఈ పేజీలు naive set theory అనే ప్రత్యేక ఆంగ్ల శీర్షికకు ప్రత్యక్ష తెలుగు సమానార్థాన్ని ఇవ్వవు. OLP-0003 మూలం basic naive set theoryని పరిచయంగా చెబుతుంది; అందుకు అనౌపచారిక అనే అర్థవివరణను తాత్కాలికంగా ఎంచుకున్నాం. Tim Button యొక్క Open Set Theory సరైన గ్రంథ నామంగానే నిలిచింది.',
    uncertainty: 'Naiveకి అనౌపచారిక అనే అనువాదం అర్థపరంగా ఉపయుక్తమైనా ఆచారబద్ధ స్వీకృతీకరణతో ఖచ్చితమైన తేడా పాఠ్యంలో వచ్చినప్పుడల్లా మూల నిర్వచనం చూసి సమీక్షించాలి. శీర్షిక, ఉపోద్ఘాతం రెండింటిలో ఒకే రూపం వాడాం.',
    borrowing: 'Tim Button వ్యక్తి పేరు; Open Set Theory గ్రంథ నామం; OLP మూల సంక్షిప్త రూపం. ఇవి పదజాల సాక్ష్యాలుగా పరిగణించలేదు.',
  },
];
fs.writeFileSync(ledgerPath, [...lines, ...decisions.map(JSON.stringify)].join('\n') + '\n', 'utf8');
process.stdout.write(JSON.stringify({status: 'added', records: records.length + decisions.length, term_ids: decisions.map(row => row.term_id)}) + '\n');
