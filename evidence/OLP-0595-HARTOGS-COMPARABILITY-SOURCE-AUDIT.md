# OLP-0595 — source-error audit

Frozen source: `upstream/content/set-theory/choice/hartogs.tex`, SHA-256 `ffe4c3f0a800bd7893a39e68d109ca1eb9662b5f29cda42393cbc5777cf557c4`. The source is unchanged.

**OLTESTCHOICEHART-001:** In proving that the set of represented order types is transitive, the source says `B⊆R` despite constructing `B` as a subset of the original set `A`. The target uses `B⊆A` and discloses the type repair.

**OLTESTCHOICEHART-002:** The source's relation on the range of an injection from ordinal `alpha` uses `f(alpha)` and requires `alpha∈beta`, even though `alpha` is outside its own domain and no smaller `beta` contains it. The target uses ordinary domain indices `gamma,delta` with `gamma∈delta`, yielding the intended transported well-order. The correction is disclosed.

**OLTESTCHOICEHART-003:** In the comparability proof, the source types order-isomorphism functions as maps into whole ordered structures. Their underlying codomains are the sets `A` and `B`; the target gives those codomains and keeps the isomorphism property in prose. The source composition order is retained because this project's convention is `comp(f,g)(x)=g(f(x))`.

**OLTESTCHOICEHART-004:** The final illustration puts a cardinal-equivalence proposition inside another cardinal-equivalence proposition as an argument, which is ill-typed. The target states the intended two comparisons separately: disjoint sum with the larger set, and Cartesian product with the larger set. It still says this simplification cannot be assumed without comparability. All four corrections are adjacent and the exact core-math deltas are recorded in the findings JSON.
