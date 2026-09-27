# OLP-0451 source audit: filtrations introduction

Frozen source: `upstream/content/normal-modal-logic/filtrations/introduction.tex`, SHA-256 `faffee0613cc37515af229a202fed584e49ea182600e77c96d722654492eb01a`. The English source remains unchanged. The decidability enumeration, finite-model-property distinction, quotient-world idea, simplified Box induction and eventual filtration conditions were read together.

## OLTENMLFILINT-001 — equivalence classes need not be infinite

Source lines 73–77 first allow possibly infinite classes but then say every partition class contains infinitely many worlds. That does not follow, even when the original world set is infinite: some classes may be finite or singletons. The construction needs finitely many **classes**, not infinite cardinality for each class. The Telugu target says each class may be finite or infinite while the number of classes is finite, and discloses the local correction.

## OLTENMLFILINT-002 — simplified Box semantics

Source lines 87–89 call the example one with “no accessibility relation,” then claim Box B at a world iff Box B holds at **some** world. The later induction step at lines 105–108 instead treats Box B as B at **every** world. The internally coherent simple case is universal accessibility (every world accesses every world), where Box B at w iff B at every v in W. The target states that assumption and semantic clause, discloses the repair, and leaves the later induction structure intact. It does not assert that an empty relation has universal-box semantics.

## OLTENMLFILINT-003 — restrict the provisional equivalence to relevant variables

Source lines 90–93 first identify worlds agreeing on **all** propositional variables in M, which may be infinitely many and need not yield finitely many classes. The eventual argument at lines 118–122 says to extend this to all subformulas of A while retaining finiteness, which only works if the initial comparison concerns the finitely many variables **occurring in A**. The target makes that restriction in both locations, then strengthens it to all subformulas of A, and discloses the correction. This is a finite approximation for the target formula, not an assertion about all language variables.

## OLTENMLFILINT-004 — missing valuation argument

Source line 97 writes membership `[w] \in V^*`, but the valuation defined at line 93 is the function `V^*(p)`. The target restores `(p)` in that one base-case step and discloses it. The source's very next line already uses `V^*(p)`.

The early finite-model enumeration is a semidecision search: a countermodel can be found, but validity need not terminate. The later formula-dependent bound is what turns it into a decision procedure. TE-P008/010/011/018/024 support general sets, relations, functions, logic and proof register; none directly attests modal filtrations or the finite-model property. This is same-agent mathematical review, not independent specialist validation or TeX compilation.
