import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let frames = 0, valuationCases = 0, worldCases = 0;
for (let n = 1; n <= 3; n++) {
  for (let relation = 0; relation < 2 ** (n * n); relation++) {
    frames++;
    const reflexive = Array.from({length: n}, (_, w) =>
      Boolean(relation & (1 << (w * n + w)))).every(Boolean);
    let allValuationsSatisfy = true;
    for (let valuation = 0; valuation < 2 ** n; valuation++) {
      valuationCases++;
      for (let w = 0; w < n; w++) {
        worldCases++;
        const boxP = Array.from({length: n}, (_, v) => v).every(v =>
          !(relation & (1 << (w * n + v))) || Boolean(valuation & (1 << v)));
        const p = Boolean(valuation & (1 << w));
        if (boxP && !p) allValuationsSatisfy = false;
      }
    }
    if (reflexive !== allValuationsSatisfy)
      throw new Error('Frame correspondence fails for ' + JSON.stringify({n, relation}));
  }
}
const singleWorldNoArrow = {n: 1, relation: 0,
  p_true_valuation: 1, p_false_valuation: 0,
  box_p_implies_p_when_p_true: true,
  box_p_implies_p_when_p_false: false};
const result = {
  schema: 'telugu-openlogic-batch071-finite-frame-check/1',
  status: 'pass_bounded_not_a_proof',
  scope: 'OLP-0420 frame reflexivity versus validity of Box p implies p',
  model_sizes: [1, 2, 3], frames, valuationCases, worldCases,
  correspondence: 'For each enumerated frame: reflexive iff every valuation makes Box p implies p true at every world.',
  counterexample_to_fixed_model_converse: singleWorldNoArrow,
  limitation: 'Finite enumeration supports source-aligned review but not unrestricted correspondence.'
};
fs.writeFileSync(path.join(root, 'evidence', 'BATCH-071-FINITE-FRAME-CHECK.json'),
  JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({status: result.status, frames, valuationCases, worldCases}));
