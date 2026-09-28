# OLP-0579 — source-error audit

Frozen source: `upstream/content/set-theory/ord-arithmetic/exponentiation.tex`, SHA-256 `965be29d6ab8e9aad3e56b319cc8ddfb3cd212e836092f061198fafb561ae6fc`. The source is unchanged.

**OLTESTORDEXPO-001:** The source's synthetic definition labels its order type `alpha^beta`, but defines finite-support functions from `alpha` to `beta` and orders them by the greatest differing argument. This yields the exponent/base roles reversed: for instance, with finite ordinals `alpha=2`, `beta=3`, there are nine such functions rather than the eight required for `2^3`. The target changes the function type to `beta -> alpha` and both support and maximum-difference index sets to `beta`, then discloses the repair.

**OLTESTORDEXPO-002:** After that type repair, the finite-support construction agrees with the displayed recursive equations for positive base, but not at zero base. In particular, at exponent `omega` it has no functions from `omega` to `0`, hence order type `0`, while the displayed limit union includes the `0`-exponent value `1`. The source exercise asserts the equivalence without qualification. The Telugu target explicitly restricts the synthetic explanation and the exercise to positive base and discloses the limitation; it does not silently change the source's recursive equations.

The exact core-math deltas are recorded in the findings JSON. Both discrepancies follow from the two definitions and elementary finite/zero cases; no independent textbook source was needed.
