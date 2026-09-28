# OLP-0576 — source-error audit

Frozen source: `upstream/content/set-theory/ord-arithmetic/addition.tex`, SHA-256 `e812adca016fb2b68daed98ef2bc27f45e48a57ceeeb27d244ad5c92a453a6e6`. The source is unchanged.

**OLTESTORDADD-001:** The source defines `A disjointsum B` as `(A x {0}) union (B x {1})`, but its successor-isomorphism proof writes `alpha disjointsum 1 = (alpha x {0}) disjointsum ({0} x {1})`. Applying the disjoint-sum operation again would add another tag to each already-tagged element, so the displayed equality and stated function values cannot both hold. The target uses ordinary union between the two tagged components and discloses the repair.

**OLTESTORDADD-002:** In the first line of the zero-addition calculation, `0 x {1}` is empty. The next source line replaces it with `{0}`, adding an extra object instead of eliminating the empty summand. The target simplifies to `alpha x {0}` and discloses the repair.

The exact core-math deltas are recorded in the findings JSON. Both defects are established from the local disjoint-sum definition and the empty-set identity; no independent textbook source was needed.
