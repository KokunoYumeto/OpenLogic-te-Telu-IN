// Finite semantic crosscheck of the twenty printed three-valued rule schemas.
// This checks truth-function conditions, not the complete derivation figure.
import assert from 'node:assert/strict';

const F = 0, U = 1, T = 2;
const V = [F, U, T];
const A = value => ['A', value];
const B = value => ['B', value];
const has = (clause, assignment) =>
  clause.some(([variable, value]) => assignment[variable] === value);
const holds = (premises, assignment) =>
  premises.every(clause => has(clause, assignment));
const check = (name, arity, output, expected, premises) => {
  const assignments = arity === 1
    ? V.map(a => ({ A: a }))
    : V.flatMap(a => V.map(b => ({ A: a, B: b })));
  for (const assignment of assignments)
    assert.equal(holds(premises, assignment), output(assignment) === expected,
      name + ' at ' + JSON.stringify(assignment));
  return assignments.length;
};
const lukNeg = ({ A: a }) => T - a;
const godNeg = ({ A: a }) => a === F ? T : F;
const and = ({ A: a, B: b }) => Math.min(a, b);
const or = ({ A: a, B: b }) => Math.max(a, b);
const lukImp = ({ A: a, B: b }) => Math.min(T, T - a + b);
const kleeneImp = ({ A: a, B: b }) => Math.max(T - a, b);
const godImp = ({ A: a, B: b }) => a <= b ? T : b;
const rules = [
  ['Lukasiewicz/Kleene negation F', 1, lukNeg, F, [[A(T)]]],
  ['Lukasiewicz/Kleene negation U', 1, lukNeg, U, [[A(U)]]],
  ['Lukasiewicz/Kleene negation T', 1, lukNeg, T, [[A(F)]]],
  ['Goedel negation F', 1, godNeg, F, [[A(U), A(T)]]],
  ['Goedel negation T', 1, godNeg, T, [[A(F)]]],
  ['minimum conjunction F', 2, and, F, [[A(F), B(F)]]],
  ['minimum conjunction U', 2, and, U,
    [[A(U), A(T)], [B(U), B(T)], [A(U), B(U)]]],
  ['minimum conjunction T', 2, and, T, [[A(T)], [B(T)]]],
  ['maximum disjunction F', 2, or, F, [[A(F)], [B(F)]]],
  ['maximum disjunction U', 2, or, U,
    [[A(F), A(U)], [B(F), B(U)], [A(U), B(U)]]],
  ['maximum disjunction T', 2, or, T, [[A(T), B(T)]]],
  ['Lukasiewicz implication F', 2, lukImp, F, [[A(T)], [B(F)]]],
  ['Lukasiewicz implication U', 2, lukImp, U,
    [[A(U), B(U)], [B(F), A(T)]]],
  ['Lukasiewicz implication T', 2, lukImp, T,
    [[A(F), B(U), B(T)], [A(F), A(U), B(T)]]],
  ['strong Kleene implication F', 2, kleeneImp, F, [[A(T)], [B(F)]]],
  ['strong Kleene implication U', 2, kleeneImp, U,
    [[B(F), B(U)], [A(U), B(U)], [A(U), A(T)]]],
  ['strong Kleene implication T', 2, kleeneImp, T, [[A(F), B(T)]]],
  ['Goedel implication F', 2, godImp, F, [[A(U), A(T)], [B(F)]]],
  ['Goedel implication U', 2, godImp, U, [[B(U)], [A(T)]]],
  ['Goedel implication T', 2, godImp, T,
    [[A(F), B(U), B(T)], [A(F), A(U), B(T)]]]
];
let cases = 0;
for (const rule of rules) cases += check(...rule);
for (const a of V) for (const b of V) {
  const formula = lukImp({ A: a, B: b });
  assert(a === F || a === U || b === T || formula === F || formula === U,
    'Final figure end-sequent fails at ' + JSON.stringify({ a, b }));
}
console.log(JSON.stringify({
  status: 'pass',
  rule_schemas: rules.length,
  assignment_checks: cases,
  final_figure_end_sequent_valuations: 9,
  note: 'Bounded complete three-value truth-function check of the printed rule conditions; not a proof of the displayed derivation tree or a TeX build.'
}));
