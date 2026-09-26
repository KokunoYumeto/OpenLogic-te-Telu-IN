import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const sources = [
  ['content/normal-modal-logic/syntax-and-semantics/relational-models.tex',
    'e8bc152c0c35fa129babf11ba07aa8a42fc867905526c126d93bb50ea2cfc2cf'],
  ['content/normal-modal-logic/syntax-and-semantics/truth-at-w.tex',
    '4c1ea773c2dd5106ceba1ec676dfadbbae432fc9d56b528a4a6b00f2c270fd50'],
  ['content/normal-modal-logic/syntax-and-semantics/truth-in-model.tex',
    '12c305069df324d6b4346d4cf1d7ef7e1ee8c6f44479959de738f8a76323cbd6']
];
for (const [sourcePath, expected] of sources) {
  const observed = sha(fs.readFileSync(path.join(root, 'upstream', sourcePath)));
  if (observed !== expected) throw new Error('Frozen source changed: ' + sourcePath);
}
const substitutionPath = 'content/normal-modal-logic/syntax-and-semantics/substitution.tex';
const sourceSubstitution = fs.readFileSync(path.join(root, 'upstream', substitutionPath), 'utf8');
const targetSubstitution = fs.readFileSync(path.join(root, 'translation', substitutionPath), 'utf8');
const tagCount = (value, tag) =>
  [...value.matchAll(new RegExp('\\\\tagitem\\{' + tag + '\\}', 'gu'))].length;
const tagScopeChecks = {
  source_conditional_cases: tagCount(sourceSubstitution, 'prvIf'),
  target_conditional_cases: tagCount(targetSubstitution, 'prvIf'),
  source_biconditional_cases: tagCount(sourceSubstitution, 'prvIff'),
  target_biconditional_cases: tagCount(targetSubstitution, 'prvIff'),
  source_box_cases: tagCount(sourceSubstitution, 'prvBox'),
  target_box_cases: tagCount(targetSubstitution, 'prvBox')
};
if (JSON.stringify(tagScopeChecks) !== JSON.stringify({
  source_conditional_cases: 2, target_conditional_cases: 1,
  source_biconditional_cases: 0, target_biconditional_cases: 1,
  source_box_cases: 0, target_box_cases: 1
})) throw new Error('Substitution tag-scope repair mismatch');

const worlds = [0, 1, 2], w1 = 0, w2 = 1, w3 = 2;
const edges = [[w1, w2], [w1, w3]];
const edge = (from, to) => edges.some(([a, b]) => a === from && b === to);
const p = w => w === w1 || w === w2;
const q = w => w === w2;
const not = formula => w => !formula(w);
const or = (left, right) => w => left(w) || right(w);
const implies = (left, right) => w => !left(w) || right(w);
const box = formula => w => worlds.every(u => !edge(w, u) || formula(u));
const diamond = formula => w => worlds.some(u => edge(w, u) && formula(u));
const falseFormula = () => false;
const questions = [
  ['q@w1', q(w1), false],
  ['not q@w3', not(q)(w3), true],
  ['p or q@w1', or(p, q)(w1), true],
  ['box(p or q)@w1', box(or(p, q))(w1), false],
  ['box q@w3', box(q)(w3), true],
  ['box false@w3', box(falseFormula)(w3), true],
  ['diamond q@w1', diamond(q)(w1), true],
  ['box q@w1', box(q)(w1), false],
  ['not box box not q@w1', not(box(box(not(q))))(w1), false]
];
for (const [label, observed, expected] of questions)
  if (observed !== expected) throw new Error('Simple-model problem mismatch: ' + label);
const modelTrue = formula => worlds.every(formula);
const modelFacts = {
  p_not_true_in_model: !modelTrue(p),
  not_p_not_true_in_model: !modelTrue(not(p)),
  p_implies_q_not_true_in_model: !modelTrue(implies(p, q)),
  meta_implication_vacuously_true: !modelTrue(p) || modelTrue(q)
};
if (Object.values(modelFacts).some(value => value !== true))
  throw new Error('Truth-in-a-model counterexample mismatch');

let relationTruthWorldChecks = 0;
for (let relation = 0; relation < (1 << 9); relation++) {
  const reachable = (w, u) => Boolean(relation & (1 << (3 * w + u)));
  for (let truth = 0; truth < (1 << 3); truth++) {
    const trueAt = u => Boolean(truth & (1 << u));
    for (const w of worlds) {
      const boxA = worlds.every(u => !reachable(w, u) || trueAt(u));
      const diamondA = worlds.some(u => reachable(w, u) && trueAt(u));
      const notDiamondNotA = !worlds.some(u => reachable(w, u) && !trueAt(u));
      const notBoxNotA = !worlds.every(u => !reachable(w, u) || !trueAt(u));
      if (boxA !== notDiamondNotA || diamondA !== notBoxNotA)
        throw new Error('Box/diamond duality mismatch');
      relationTruthWorldChecks++;
    }
  }
}
const result = {
  schema: 'openlogic-te-batch066-modal-semantic-check/1',
  source_revision: '9620cc73f9c8e0ad003c514a5d3748f29611c4c0',
  source_paths_and_sha256: sources.map(([source_path, source_sha256]) =>
    ({ source_path, source_sha256 })),
  simple_model: {
    worlds: ['w1', 'w2', 'w3'],
    accessibility_edges: [['w1', 'w2'], ['w1', 'w3']],
    p_true_at: ['w1', 'w2'],
    q_true_at: ['w2'],
    nine_problem_cases: questions.map(([label, observed]) => ({ label, value: observed }))
  },
  truth_in_model_counterexample: modelFacts,
  substitution_tag_scope_checks: tagScopeChecks,
  duality: {
    relation_masks: 512,
    truth_masks: 8,
    worlds_per_case: 3,
    relation_truth_world_checks: relationTruthWorldChecks,
    box_not_diamond_not: true,
    diamond_not_box_not: true
  },
  limitation: 'Finite extensional model checks for printed examples and duality identities; not a proof of the full substitution induction, tag configuration, TeX compilation, or all modal schemas.',
  status: 'pass'
};
const output = path.join(root, 'evidence', 'BATCH-066-MODAL-SEMANTIC-CHECK.json');
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({
  status: result.status,
  problem_cases: questions.length,
  relation_truth_world_checks: relationTruthWorldChecks,
  output: path.relative(root, output).replaceAll('\\', '/')
}));
