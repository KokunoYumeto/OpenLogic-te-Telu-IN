# OLP-0445 source audit: modalities and complete consistent sets

Frozen source: `upstream/content/normal-modal-logic/completeness/modalities-ccs.tex`, SHA-256 `92b97da95c28f21f5806bcce481e64571dc3a82d5d1c315bcaf1c569c90d00a6`. The English source is unchanged. Read the Box and Diamond conditional branches, inverse-image definitions, both Box lemmas, both versions of the Diamond proposition, the equivalence lemma, and the open exercise before drafting.

## OLTENMLCOMMOD-001 — witness-index mismatch in Box lemma

At source lines 93–97 the finite witnesses are `B_1, ..., B_k`, but both implication chains end with `B_n`. No `n` is introduced for this finite witness list. The Box-lifting argument requires the same last witness in both chains. In the Telugu proof, replace just the two final `B_n` indices by `B_k`; disclose the correction immediately in that proof. Do not alter the frozen source or add a new premise.

## OLTENMLCOMMOD-002 — missing Sigma parameter in the intermediate entailment

At source line 109 the first Box lemma is invoked from `\Box^{-1}\Gamma \Proves[\Sigma] !A`, but the resulting displayed inline entailment is written without `[\Sigma]`. The cited lemma supplies a Sigma-relative entailment, and the next monotonicity step requires the same parameter. In the Telugu proof, retain `[\Sigma]` on the intermediate entailment and disclose this local clarification. The theorem statement and conclusion already have it.

The surrounding claims were checked against their own definitions: Box-accessibility is inverse-Box inclusion; the Diamond branch uses its dual and a complete consistent extension. The equivalence lemma requires both sets to be complete and consistent, and its last exercise remains open. No native Telugu passage is claimed to establish these modal proofs; TE-P018/024/026 support only the general propositional, derivation, and consistency register. This audit is same-agent mathematical review, not independent specialist validation or TeX compilation.
