# OLP-0447 source audit: truth lemma

Frozen source: `upstream/content/normal-modal-logic/completeness/truth-lemma.tex`, SHA-256 `ba09b193f2ccb8f8c5751a1c762c0f81f14937ffbb42bd0e7bfad1f82d51f147`. The English source is unchanged. Read the induction cases, all guarded exercise branches, the Box/Diamond availability guards and the exercise tag list.

## OLTENMLCOMTRU-001 — wrong bridge in the Diamond forward case

At source lines 121–124 the Box-primitive branch has an accessible witness, hence `\Box^{-1}\Delta \subseteq \Delta'`, and then cites `prop:diamond` to assert `\Diamond\Delta' \subseteq \Delta`. That proposition characterizes Diamond membership, not the equivalence of these two accessibility conditions; in a Box-only setting the proposition may not even be active. `lem:box-iff-diamond` is the established bridge for complete consistent worlds. Replace only this reference and disclose the repair beside the step, leaving the guarded branches and witness unchanged.

## OLTENMLCOMTRU-002 — omitted inductive step in the Diamond reverse case

At source lines 135–139, after obtaining an accessible `\Delta'` with `!B \in \Delta'`, the proof jumps directly to Diamond truth by the model semantics. The semantics requires `!B` to be **true** at that accessible world; membership becomes truth by the induction hypothesis. Insert that one inductive step before citing model semantics and disclose it. No source hypothesis or final conclusion changes.

## OLTENMLCOMTRU-003 — exercise tag mismatch

At source line 143 the `probtag` list spells the conjunction option `proband`, while the conjunction proof branch checks `probAnd` (line 53). Correct the list to `probAnd` so the intended exercise switch works; disclose the tag repair after the exercise. The underlying proof branch remains intact.

The other induction cases were checked against the cited complete-set properties and truth semantics. The source's conditional Box and Diamond proof branches and the open exercise have not been collapsed. TE-P018/024/026 support the general propositional, derivation, and consistency register only; they do not establish this modal truth lemma. This is same-agent review, not independent specialist validation or TeX compilation.
