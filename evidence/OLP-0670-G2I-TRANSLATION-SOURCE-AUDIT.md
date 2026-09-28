# OLP-0670 — G2i-to-N2i source audit

Seven local inconsistencies in the frozen source are addressed by adjacent `\sourcecorrection` notes in the Telugu translation. The source is unchanged. The findings authority partitions the exact core-math deltas among the diagram and formula repairs.

1. `OLTEPTNATG2I-001`: the opening proof should name G2i, not G2ci.
2. `-002`: the induction hypothesis must yield N2i proofs, not N2c proofs.
3. `-003`: the weakening diagram adds an antecedent formula, so its rule label is left weakening.
4. `-004`: contraction must rename labelled formulas in the induced N2i derivation, not the original G2i derivation.
5. `-005`: implication introduction is applied to the induced derivation to obtain the final one, not conversely.
6. `-006`: in implication-left, relabel the induced N2i derivation; the auxiliary elimination result needs the other premise's context.
7. `-007`: conjunction-right's second inductive conclusion is B, and its labels are changed in the induced N2i derivation.

The other rule cases retain the source's construction and are not claimed to be independently formalized or visually compiled here.
