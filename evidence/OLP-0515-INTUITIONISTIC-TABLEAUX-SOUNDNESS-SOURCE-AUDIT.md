# OLP-0515 — source-error audit

Frozen source: `upstream/content/intuitionistic-logic/tableaux/soundness.tex`, SHA-256 `3852095c3c8edfdf76e294936602d8a0d640622642fcb0c27cf55420ef99e46c`. The source is unchanged.

**OLTEINTTABSOU-001:** The opening countermodel/contrapositive sentence says the premises and conclusion are true at the same world. To refute entailment the conclusion must be false. The Telugu text changes only that satisfaction sign and discloses the repair.

**OLTEINTTABSOU-002:** The closure proof has a broken sentence and writes `Rf(\sigma)(\sigma.{*})`, omitting the interpretation on the accessible world. It then repeats truth at the initial world, whereas monotonicity yields truth at the descendant. The target states the latter two expressions explicitly and discloses the repair.

**OLTEINTTABSOU-003:** The false-conditional case twice says its new branch contains the false conditional itself at the fresh prefix, contradicting the displayed rule and the witness argument. The target instead names the two rule results, true antecedent and false consequent at that prefix, in both places, with an adjacent disclosure.

**OLTEINTTABSOU-004:** The corollary proof concludes the already-assumed syntactic derivability instead of the semantic entailment it set out to prove. The target concludes semantic entailment and discloses the repair.

The other mathematical expressions and tableau rule references are retained. The exercise-only cases remain exercises. This is a same-agent source audit, not a TeX-build or independent expert certification.
