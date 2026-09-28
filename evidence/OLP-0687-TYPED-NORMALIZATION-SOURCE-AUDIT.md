# OLP-0687 — typed normalization source audit

The frozen source was compared block by block. Findings 001–006, 008, 010–012 are bounded notation or local argument repairs. The substitution rank lemma now includes redexes copied from the inserted argument, and Newman's argument first normalizes its common descendant before comparing normal forms.

Finding 007 is not a complete proof repair. In a context projecting from a case term whose branches return pairs, the case redex can have atomic-summand cut rank 1, while contracting it exposes a projection redex with product-type rank greater than 1. For example, let a branch return a pair whose first component has a compound type and whose second component has an atomic type. This refutes the source inference from local redex rank decrease to whole-term maximum-rank/count decrease. It does not refute the standard normalization theorem. The source's separate assertion of strong normalization also needs a separate proof.

Finding 009 discloses omitted local-confluence cases: nested beta/case redexes, projection of the erased component, and copying/erasure under substitution are not all supplied by the source's single nested-projection example. The example's terminal component is repaired independently by 008.

The target retains both incomplete source arguments with adjacent disclosures. Structural QA checks the declared mathematical deltas, not completeness of these proofs. No TeX layout or independent full formalization was performed.
