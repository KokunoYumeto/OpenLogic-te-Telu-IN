# OLP-0669 — natural deduction with sequents source audit

Three source inconsistencies were corrected in the Telugu translation with adjacent `\sourcecorrection` notes; the frozen source is unchanged. Exact math differences for the two diagram-related findings are recorded in the JSON authority.

- `OLTEPTNATSEQ-001` (lines 13–24): the opening formula-tree derivation is in N1c/N1i, not G1c/G1i.
- `OLTEPTNATSEQ-002` (lines 78–88): a labelled context in the forward implication-introduction tree needs $x:!B$, not $x:B$.
- `OLTEPTNATSEQ-003` (lines 137–158): in the reverse direction, the inductive N1 subproof is $\delta_1'$. It—not the final proof or the N2 subproof $\delta_1$—has the open assumption before the final implication-introduction discharge. Both displayed N1 alternatives now carry the correct subproof label.

The translation preserves the two propositions' induction structure and leaves other rule cases to the source's exercises.
