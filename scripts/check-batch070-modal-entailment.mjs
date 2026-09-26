import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const iff = (a, b) => !a || b;
let worldsChecked = 0;
const witnesses = {};
for (let n = 1; n <= 3; n++) {
  for (let r = 0; r < 2 ** (n * n); r++) {
    for (let p = 0; p < 2 ** n; p++) {
      for (let q = 0; q < 2 ** n; q++) {
        const has = (mask, w) => Boolean(mask & (1 << w));
        const next = w => Array.from({length: n}, (_, v) => v)
          .filter(v => r & (1 << (w * n + v)));
        const box = (w, predicate) => next(w).every(predicate);
        const diamond = (w, predicate) => next(w).some(predicate);
        for (let w = 0; w < n; w++) {
          worldsChecked++;
          const antecedent = iff(has(p, w), diamond(w, v => has(p, v)));
          const consequent = iff(box(w, v => !has(p, v)), !has(p, w));
          if (antecedent && !consequent)
            throw new Error('Claimed entailment fails at ' + JSON.stringify({n, r, p, q, w}));
          const figurePremise = antecedent;
          const figureConclusion = iff(box(w, v => has(p, v)), has(p, w));
          if (figurePremise && !figureConclusion && !witnesses.box_p_not_p)
            witnesses.box_p_not_p = {n, r, p, q, w};
          const firstExercisePremise = box(w, v => iff(has(p, v), has(q, v)));
          const firstExerciseConclusion = iff(has(p, w), box(w, v => has(q, v)));
          if (firstExercisePremise && !firstExerciseConclusion && !witnesses.box_conditional_not_entail)
            witnesses.box_conditional_not_entail = {n, r, p, q, w};
          if (firstExerciseConclusion && !firstExercisePremise && !witnesses.conditional_box_not_entail)
            witnesses.conditional_box_not_entail = {n, r, p, q, w};
          if (box(w, v => has(p, v) && has(q, v)) && !box(w, v => has(p, v)))
            throw new Error('Box conjunction entailment fails');
        }
      }
    }
  }
}
if (Object.keys(witnesses).length !== 3) throw new Error('Missing non-entailment witness');
const oneWorld = {n: 1, r: 0, p: 0, q: 0, w: 0};
if (JSON.stringify(witnesses.box_p_not_p) !== JSON.stringify(oneWorld))
  throw new Error('Unexpected first one-world witness');
const printedFigure = {n: 3, r: (1 << 1) | (1 << 2), p: (1 << 1) | (1 << 2), w: 0};
const figureSuccessors = [1, 2];
if (Boolean(printedFigure.p & 1) ||
    !figureSuccessors.every(v => Boolean(printedFigure.p & (1 << v))) ||
    !figureSuccessors.every(v => Boolean(printedFigure.r & (1 << v))))
  throw new Error('Printed three-world figure does not have the cited truth pattern');
const result = {
  schema: 'telugu-openlogic-batch070-finite-modal-check/1',
  status: 'pass_bounded_not_a_proof',
  scope: 'OLP-0418 modal entailment and non-entailment examples',
  model_sizes: [1, 2, 3],
  total_world_cases: worldsChecked,
  universal_checks: ['p -> Diamond p entails Box not p -> not p',
    'Box (A and B) entails Box A'],
  witnesses,
  printed_three_world_figure: printedFigure,
  one_world_empty_relation_empty_p_truth_set: oneWorld,
  limitation: 'Finite enumeration supports the source-aligned review but does not prove unrestricted validity.'
};
const out = path.join(root, 'evidence', 'BATCH-070-FINITE-MODAL-CHECK.json');
fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({status: result.status, world_cases: worldsChecked,
  witnesses: Object.keys(witnesses)}));
