# OLP-0577 — source-error audit

Frozen source: `upstream/content/set-theory/ord-arithmetic/using-addition.tex`, SHA-256 `9641a137f0347689fad7fc04337f8889991e482c6179513c19a0bfbc619eaff1`. The source is unchanged.

**OLTESTORDUSEADD-001:** The second exercise asks for sets attaining the upper bound on `rank(A x B)`, but its displayed expression lacks any relation sign between `rank(A x B)` and `max(rank A, rank B) plus 2`. The preceding exercise asks for an example attaining the lower bound, and the lemma states the upper inequality. The Telugu target inserts equality for the upper-bound example and discloses the repair.

The exact core-math delta is recorded in the findings JSON. The missing symbol and intended exercise structure are established from the local lemma and parallel first exercise; no independent textbook source was needed.
