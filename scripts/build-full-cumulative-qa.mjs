import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const batch=JSON.parse(fs.readFileSync(path.join(root,'build/BATCH-999-STRUCTURAL-QA.json'),'utf8'));
const flags=['paragraph_alignment','structure_match','token_parity','math_multiset_match','protected_identifier_parity'];
if(batch.units.length!==722)throw new Error('Incomplete full-corpus structural batch');
for(const [index,row] of batch.units.entries()){
 const expected='OLP-'+String(index+1).padStart(4,'0');
 if(row.unit_id!==expected||flags.some(flag=>row[flag]!==true)||row.unicode_replacement_char||row.unpaired_surrogate)
  throw new Error('Full-corpus structural QA failed at '+expected);
}
const out={
 schema:'telugu-openlogic-batch-qa/1',
 generated_utc:new Date().toISOString(),
 note:'Current full-corpus structural diagnostic from the passing 722-unit strict audit; historical cumulative snapshots retain their original audit-time target hashes. This is not a semantic proof or release acceptance.',
 units:batch.units
};
const destination=path.join(root,'evidence/CUMULATIVE-OLP0722-STRUCTURAL-QA.json');
fs.writeFileSync(destination,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({units:out.units.length,blocks:out.units.reduce((sum,row)=>sum+row.source_blocks,0),destination:path.relative(root,destination)}));
