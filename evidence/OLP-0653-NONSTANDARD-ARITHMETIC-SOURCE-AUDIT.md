# OLP-0653 — nonstandard arithmetic source-error audit

Frozen source: `upstream/content/model-theory/basics/nonstandard-arithmetic.tex`, SHA-256 `12f6c3e97c59d1f37b73695f126c7c03cffc6fcbd659e6a21ab95437bd15ab9d`. The source is unchanged.

- **OLTEMODBASENSA-001:** The proof begins with the arithmetic language `L_N`, then switches to `L` while listing the same arithmetic interpretations. No alias is introduced. The target retains the historical symbol and discloses the mismatch.
- **OLTEMODBASENSA-002:** In the separated-block argument, `x* = y` is impossible, so the relevant conclusion is `x* < y`, not the already assumed `x < y`. The target states the stronger conclusion and discloses the change.
- **OLTEMODBASENSA-003:** A strict order on equivalence blocks is not obtained from `x < y` alone when `x` and `y` are in the same block. The target adds `x` not approximately `y` and discloses the needed condition.
- **OLTEMODBASENSA-004:** The displayed arithmetic sentence `forall y forall x (y=2x or y=2x+1)` is false. Euclidean division by two supplies `forall y exists x (...)`. The target changes precisely that quantifier and discloses the correction.

The final reduct-isomorphism claim and exercises remain source-controlled. The source's model-theoretic classification is not claimed to be fully independently proved by this audit. Structural QA verifies declared symbolic differences, not every mathematical implication or rendered layout.
