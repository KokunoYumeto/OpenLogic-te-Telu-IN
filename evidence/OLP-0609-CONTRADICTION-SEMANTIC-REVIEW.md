# OLP-0609 — proof by contradiction semantic review

The target separates a valid refutation used to prove `¬p` from the additional classical double-negation step needed to obtain positive `p` by contradiction. That scope qualification is disclosed as `OLTEMTHPRFCON-001`; the source's formula sequence is otherwise preserved. The first worked proof keeps `A⊆B` and `B=∅` as fixed hypotheses and refutes only the temporary existence of an `A`-member. The later examples retain the existential witness negating a subset claim, transitivity of inclusion, and the two cases arising from `A≠B`.

The stray `C` in the `A⊆A∪B` counterexample is corrected to `A∪B` and disclosed as `OLTEMTHPRFCON-002`. All 22 paragraph blocks, protected element tokens, identifiers, environment structure and declared math delta pass bounded QA. This is not a rendered-page or full formal-proof audit.
