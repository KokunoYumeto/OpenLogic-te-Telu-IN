# OLP-0556 — source-error audit

Frozen source: `upstream/content/set-theory/ordinals/ordtype.tex`, SHA-256 `9a123198cbfcd0000eb27804a39148d5ee5fb7ad41cf7cff04ad78ea320dfcd6`. The source is unchanged.

**OLTESTORDTYPE-001:** In the second corollary proof the source writes `f : beta -> <B, lessdot>` as though the ordered-pair structure were the codomain set. The isomorphism's underlying function maps `beta` to `B`. The Telugu target uses `f : beta -> B` and discloses the change. Its order-preservation condition remains in the surrounding proof.

**OLTESTORDTYPE-002:** The source's displayed biconditional begins with `alpha in beta iff f restricted to alpha maps to B_{f(alpha)}`. If `alpha` is not in `beta`, `f(alpha)` is undefined, so the right side is not a valid proposition for the reverse direction. The target instead uses the valid equivalence: `alpha in beta` iff `alpha` is isomorphic to some proper initial segment of `B`, iff the given well-ordering is isomorphic to such a segment. This follows from the restriction lemma, uniqueness of ordinal representatives, and the prior fact that members of an ordinal are ordinals. The replacement preserves the corollary's statement and its intended proof route; the source's line-by-line displayed derivation is not reproduced as a valid biconditional.

The exact core-math deltas are recorded in the findings JSON. No independent textbook source was used; the type and definedness defects follow from the local function definition and ordinal-isomorphism results.
