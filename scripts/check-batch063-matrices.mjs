import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'upstream', 'content',
  'many-valued-logic', 'infinite-valued-logics', name), 'utf8');
const introduction = read('introduction.tex');
const lukasiewicz = read('lukasiewicz.tex');
const goedel = read('goedel.tex');
assert(introduction.includes('V_5 & = \\{0, \\frac{1}{4}, \\frac{1}{2}, \\frac{3}{4}, 1\\}'));
assert(lukasiewicz.includes('\\min(1,1-(x-y))'));
assert(goedel.includes('\\tf{\\lfalse} & = 0'));
const values = [1, 0.5, 0];
const luk = {
  not: x => 1 - x,
  and: Math.min,
  or: Math.max,
  imp: (x, y) => Math.min(1, 1 - (x - y))
};
const god = {
  not: x => x === 0 ? 1 : 0,
  and: Math.min,
  or: Math.max,
  imp: (x, y) => x <= y ? 1 : y
};
const expected = {
  luk: {
    not: [0, 0.5, 1],
    and: [[1, 0.5, 0], [0.5, 0.5, 0], [0, 0, 0]],
    or: [[1, 1, 1], [1, 0.5, 0.5], [1, 0.5, 0]],
    imp: [[1, 0.5, 0], [1, 1, 0.5], [1, 1, 1]]
  },
  god: {
    not: [0, 0, 1],
    and: [[1, 0.5, 0], [0.5, 0.5, 0], [0, 0, 0]],
    or: [[1, 1, 1], [1, 0.5, 0.5], [1, 0.5, 0]],
    imp: [[1, 0.5, 0], [1, 1, 0], [1, 1, 1]]
  }
};
for (const [name, functions] of Object.entries({ luk, god })) {
  assert.deepEqual(values.map(functions.not), expected[name].not);
  for (const operation of ['and', 'or', 'imp'])
    assert.deepEqual(values.map(x => values.map(y => functions[operation](x, y))),
      expected[name][operation]);
}
for (let m = 2; m <= 12; m += 1) {
  const set = Array.from({ length: m }, (_, n) => n / (m - 1));
  assert.equal(set.length, m);
  assert.equal(new Set(set).size, m);
  assert.equal(set[0], 0);
  assert.equal(set.at(-1), 1);
  assert(set.every(x => x >= 0 && x <= 1));
}
for (const p of values) for (const q of values)
  assert.equal(Math.max(luk.imp(p, q), luk.imp(q, p)), 1);
const p = 1, q = 0.75, r = 0.5, s = 0.25;
assert.equal(Math.max(god.imp(p, q), god.imp(q, r), god.imp(r, s)), 0.75);
console.log(JSON.stringify({
  status: 'pass',
  finite_value_sets_m2_to_m12: true,
  three_value_lukasiewicz_and_goedel_tables: true,
  lukasiewicz_prelinearity_sample: true,
  goedel_infinite_four_value_counterexample: { p, q, r, s, value: 0.75 },
  note: 'Bounded numeric crosscheck of manually read source formulas; not a full semantic proof or TeX build.'
}));
