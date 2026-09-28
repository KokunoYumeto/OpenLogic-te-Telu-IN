# OLP-0578 — source-error audit

Frozen source: `upstream/content/set-theory/ord-arithmetic/multiplication.tex`, SHA-256 `eade2bc67a7dede697f1a89e0359c3ef4a1c52154bbcf4b1b45176f5d3742abb`. The source is unchanged.

**OLTESTORDMULT-001:** The limit recursion clause is stated for all left factors `alpha`. At `alpha=0` and nonzero limit `beta`, the direct product definition gives `0 times beta=0`, while the right side is the least *strict* upper bound of the constant zero sequence, namely `1`. The target restricts that limit clause to nonzero `alpha`, discloses the repair, and notes that a recursive definition must handle the zero left factor separately. The product definition itself remains unchanged.

The only core-math delta is the added nested inline condition inside the display's prose clause, recorded in the findings JSON. This follows from the local product definition and the earlier definition of strict supremum; no independent textbook source was needed.
