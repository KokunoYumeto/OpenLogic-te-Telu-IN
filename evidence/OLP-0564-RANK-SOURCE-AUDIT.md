# OLP-0564 — source-error audit

Frozen source: `upstream/content/set-theory/spine/rank.tex`, SHA-256 `fa9b9faa09478d4d5d6e510c52a2d5752fa72985db8efaff4a432a0e24d81dd0`. The source is unchanged.

**OLTESTSPINRANK-001:** In the converse proof of the stage/rank characterization, the source supposes `x in V_alpha` and then claims a simple induction shows `x notin V_alpha`. This contradicts the premise and cannot establish the asserted characterization. What is needed after `rank(x) <= alpha` is `rank(x) != alpha`; the successor and limit clauses of the V hierarchy show that any member of `V_alpha` is already included in some earlier stage. The Telugu target makes this conclusion explicit and discloses the repair. The follow-up exercise still asks the reader to complete the simple transfinite induction.

The exact core-math delta is recorded in the findings JSON. No independent textbook source was needed; the inconsistency is visible within the source proof and the earlier stage definition.
