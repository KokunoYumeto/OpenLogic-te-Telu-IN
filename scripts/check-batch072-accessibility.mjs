import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const edge = (r, n, a, b) => Boolean(r & (1 << (a * n + b)));
const worlds = n => [...Array(n).keys()];
const P = 'p', Q = 'q';
const box = a => ['box', a], dia = a => ['dia', a];
const imp = (a,b) => ['imp', a,b], and = (a,b) => ['and', a,b];
const or = (a,b) => ['or', a,b], iff = (a,b) => ['iff', a,b];
const formulas = {
  D: imp(box(P), dia(P)),
  T: imp(box(P), P),
  B: imp(P, box(dia(P))),
  '4': imp(box(P), box(box(P))),
  '5': imp(dia(P), box(dia(P))),
  partial_functional: imp(dia(P), box(P)),
  functional: iff(dia(P), box(P)),
  weakly_dense: imp(box(box(P)), box(P)),
  L: or(box(imp(and(P, box(P)), Q)), box(imp(and(Q, box(Q)), P))),
  G: imp(dia(box(P)), box(dia(P)))
};
function truth(f, w, r, n, p, q) {
  if (f === P || f === Q) return Boolean((f === P ? p : q) & (1 << w));
  const [op, a, b] = f;
  if (op === 'box') return worlds(n).every(v => !edge(r,n,w,v) || truth(a,v,r,n,p,q));
  if (op === 'dia') return worlds(n).some(v => edge(r,n,w,v) && truth(a,v,r,n,p,q));
  const left = truth(a,w,r,n,p,q), right = truth(b,w,r,n,p,q);
  if (op === 'imp') return !left || right;
  if (op === 'and') return left && right;
  if (op === 'or') return left || right;
  if (op === 'iff') return left === right;
  throw new Error('Unknown formula operation');
}
function properties(r,n) {
  const W = worlds(n), succ = w => W.filter(v => edge(r,n,w,v));
  return {
    D: W.every(w => succ(w).length > 0),
    T: W.every(w => edge(r,n,w,w)),
    B: W.every(u => W.every(v => !edge(r,n,u,v) || edge(r,n,v,u))),
    '4': W.every(u => W.every(v => W.every(w =>
      !edge(r,n,u,v) || !edge(r,n,v,w) || edge(r,n,u,w)))),
    '5': W.every(w => W.every(u => W.every(v =>
      !edge(r,n,w,u) || !edge(r,n,w,v) || edge(r,n,u,v)))),
    partial_functional: W.every(w => succ(w).length <= 1),
    functional: W.every(w => succ(w).length === 1),
    weakly_dense: W.every(u => W.every(v => !edge(r,n,u,v) ||
      W.some(w => edge(r,n,u,w) && edge(r,n,w,v)))),
    L: W.every(w => W.every(u => W.every(v =>
      !edge(r,n,w,u) || !edge(r,n,w,v) || u === v ||
      edge(r,n,u,v) || edge(r,n,v,u)))),
    G: W.every(w => W.every(u => W.every(v =>
      !edge(r,n,w,u) || !edge(r,n,w,v) ||
      W.some(t => edge(r,n,u,t) && edge(r,n,v,t)))))
  };
}
const names = Object.keys(formulas);
const results = Object.fromEntries(names.map(name => [name, {property_frames:0, valuation_cases:0, world_cases:0}]));
let frames = 0;
for (let n=1; n<=3; n++) {
  for (let r=0; r<2**(n*n); r++) {
    frames++;
    const props = properties(r,n);
    for (const name of names) {
      if (!props[name]) continue;
      results[name].property_frames++;
      for (let p=0; p<2**n; p++) for (let q=0; q<2**n; q++) {
        results[name].valuation_cases++;
        for (const w of worlds(n)) {
          results[name].world_cases++;
          if (!truth(formulas[name],w,r,n,p,q))
            throw new Error(`Counterexample to ${name}: n=${n}, R=${r}, p=${p}, q=${q}, w=${w}`);
        }
      }
    }
  }
}
if (frames !== 530 || truth(formulas.T,0,0,1,0,0) ||
    !truth(box(P),0,0,1,0,0)) throw new Error('One-world example mismatch');
const crossEdges = (1 << 1) | (1 << 2);
if (properties(crossEdges,2).T || !truth(formulas.T,0,crossEdges,2,0,0) ||
    !truth(formulas.T,1,crossEdges,2,0,0) ||
    !truth(formulas.T,0,crossEdges,2,3,3) ||
    !truth(formulas.T,1,crossEdges,2,3,3))
  throw new Error('Two-world equal-valuation example mismatch');
const output = {
  schema: 'telugu-openlogic-batch072-finite-accessibility-check/1',
  status: 'pass',
  scope: 'All directed relations on nonempty worlds of sizes 1, 2, 3; all p,q Boolean valuations and worlds for property-implies-formula checks; selected one-world and two-world examples.',
  limitation: 'Finite enumeration does not prove unrestricted correspondence, arbitrary-formula substitution instances or the full two-world induction claim.',
  source_unit: 'OLP-0421', frames,
  checks: results,
  examples: {
    one_world_empty_relation_p_false: 'Box p true, T instance false',
    two_world_cross_edges_equal_pq: 'R irreflexive; sampled T instances true at both worlds'
  }
};
const outputPath = path.join(root,'evidence','BATCH-072-FINITE-ACCESSIBILITY-CHECK.json');
fs.writeFileSync(outputPath, JSON.stringify(output,null,2)+'\n','utf8');
console.log(JSON.stringify({frames,checks:results,status:'pass'}));
