# OLP-0643 — axiomatic provability source-error audit

Frozen source: `upstream/content/first-order-logic/axiomatic-deduction/provability.tex`, SHA-256 `150b411bdceac490428e642969889123ecc14db1668fde926adfc1d831e28745`. The source is unchanged.

- **OLTEFOLAXDPRV-001:** The second listed proposition is the not-A introduction direction, but the displayed proof establishes A from the inconsistent not-A extension. This is a proof of a different assertion. The target labels that gap beside the derivation; it does not call the displayed steps a proof of the listed item.
- **OLTEFOLAXDPRV-002:** Conjunction-elimination line 2 has `(A and B) -> A`, while the claimed MP line 3 is `A or B`. The MP conclusion should be `A`. The target retains the original display and identifies the typo.
- **OLTEFOLAXDPRV-003:** The modus-ponens item finishes with an undefined `Gamma_1`. With two finite supports, their union lies in `Gamma`; alternatively choose one common finite support. The target discloses that missing definition.
- **OLTEFOLAXDPRV-004:** The weak-generalization induction must examine whether each derivation line `A_i` is an axiom. The source's case refers to final `A`, so its quantifier is wrong. The target discloses the required index.
- **OLTEFOLAXDPRV-005:** The free-for lemma's proof begins with `Subst(A,y,x)` but immediately and consistently reasons about `Subst(A,y,c)`, the formula in the lemma statement. The target discloses this local substitution error.

Other proof steps remain controlled by the frozen source. The corrections are disclosures, not a claim that every source derivation was independently reconstructed. Bounded structural QA does not check proof validity or rendering.
