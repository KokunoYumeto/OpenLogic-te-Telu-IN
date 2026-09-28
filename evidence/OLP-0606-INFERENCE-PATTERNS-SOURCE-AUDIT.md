# OLP-0606 — inference-patterns source-error audit

Frozen source: `upstream/content/methods/proofs/inference-patterns.tex`, SHA-256 `dec51f23018334023107ecfaa7a2f31fdf964b2b0cb7aebaeeb4e1688ed6dd31`. The source is unchanged.

**OLTEMTHPRFPAT-001:** In the explanatory proof of the existence claim, the source derives nonemptiness of `A` from membership of some `x` in `A`, but its concluding equivalence says `x ≠ ∅` instead of `A ≠ ∅`. The target writes the set nonemptiness statement and includes an adjacent Telugu disclosure. The exact one-for-one math-atom delta appears in the findings JSON. This repair does not license conflating the witnesses from different existential claims; the final deliberately invalid proof is preserved as invalid.

The 46-block target keeps conjunction/disjunction, conditional and biconditional direction, arbitrary-object universal reasoning, cases, existence introduction and use, and the bound-variable warning. Structural QA checks parity, not the full mathematical soundness of each pedagogical proof or TeX visual output.
