# OLP-0665 — quantifier regularity source audit

The frozen source has two proof-level defects. The Telugu target keeps the definition, lemma, proposition and exercise structure while correcting only the affected reasoning with adjacent `\sourcecorrection` notes. The source bytes are unchanged.

- `OLTEPTNATQUA-001` (lines 111–125): after substituting $t$ for $c$, the existential premise and final conclusion must also be substituted. The source displays a copied universal-introduction tree where the two-premise existential-elimination tree belongs. The target gives the latter, using the already named subproofs and discharge label.
- `OLTEPTNATQUA-002` (lines 141–158): to decrease the number of dirty eigenvariable inferences, choose a highest dirty inference, not an arbitrary highest eigenvariable inference. Its upper subproof can contain clean eigenvariable inferences, so regularity—not their absence—is what licenses the substitution lemma. The corresponding exercise is aligned.

The first finding's exact math delta is recorded in JSON; the second changes explanatory prose only. The omitted propositional and existential-introduction cases remain omitted, as in the source.
