import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const source = name => fs.readFileSync(path.join(root, 'upstream', 'content',
  'many-valued-logic', 'three-valued-logics', name), 'utf8');
const F = 0, U = 1, T = 2, values = [F, U, T];
const collapse = x => x === F ? F : T;
const cNot = x => x === F ? T : F;
const cAnd = (a, b) => a === T && b === T ? T : F;
const cOr = (a, b) => a === T || b === T ? T : F;
const cImp = (a, b) => cOr(cNot(a), b);
const kNot = x => T - x;
const kAnd = Math.min, kOr = Math.max;
const kImp = (a, b) => kOr(kNot(a), b);
const wAnd = (a, b) => a === U || b === U ? U : cAnd(a, b);
const wOr = (a, b) => a === U || b === U ? U : cOr(a, b);
const wImp = (a, b) => a === U || b === U ? U : cImp(a, b);
const gNot = x => x === F ? T : F;
const gAnd = Math.min, gOr = Math.max;
const gImp = (a, b) => a <= b ? T : b;
const k = source('kleene.tex'), g = source('goedel.tex'),
  m = source('multiple-designation.tex');
for (const [name, text] of [['Kleene', k], ['Goedel', g], ['Multiple designation', m]])
  assert(text.includes('\\olfileid{mvl}{thr}{'), 'Wrong source file ' + name);
assert(k.includes('\\tf{\\lif}[\\LogKs]') && k.includes('\\tf{\\lif}[\\LogKw]'));
assert(g.includes('\\tf{\\lfalse} = \\False') && g.includes('\\tf{\\lif}[\\LogGod]'));
assert(m.includes('\\LogLP') && m.includes('\\LogHal') && m.includes('\\LogRM[3]'));
for (const a of values) {
  if (kNot(a) !== U) assert.equal(collapse(kNot(a)), cNot(collapse(a)));
  assert.equal(collapse(gNot(a)), cNot(collapse(a)));
  for (const b of values) {
    for (const [kOp, cOp] of [[kAnd, cAnd], [kOr, cOr], [kImp, cImp]]) {
      const result = kOp(a, b);
      if (result !== U) assert.equal(collapse(result), cOp(collapse(a), collapse(b)));
    }
    for (const [wOp, cOp] of [[wAnd, cAnd], [wOr, cOr], [wImp, cImp]]) {
      const result = wOp(a, b);
      if (a === U || b === U) assert.equal(result, U);
      else assert.equal(result, cOp(a, b));
    }
    for (const [gOp, cOp] of [[gAnd, cAnd], [gOr, cOr], [gImp, cImp]])
      assert.equal(collapse(gOp(a, b)), cOp(collapse(a), collapse(b)));
  }
}
assert.equal(kNot(U), U);
for (const op of [kAnd, kOr, kImp, wAnd, wOr, wImp]) assert.equal(op(U, U), U);
assert.equal(collapse(F), F);
console.log(JSON.stringify({
  status: 'pass',
  strong_kleene_definite_value_collapse: true,
  weak_kleene_undef_infectious: true,
  no_tautology_all_undef_induction_basis: true,
  goedel_designated_value_collapse_to_classical: true,
  note: 'Finite truth-function crosscheck based on the manually inspected printed matrices; it does not prove translation semantics by itself.'
}));
