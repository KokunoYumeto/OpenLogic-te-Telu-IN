# OLP-0655 — largest-cut elimination source-error audit

Frozen source: `upstream/content/proof-theory/cut-elimination/ce-largest.tex`, SHA-256 `1ea55e9f187e9daf9de01d795d158934d0871b216a0a61f98b062c0ab8b4ec1c`. The source is unchanged.

- **OLTEPTCUTINVL-001:** The conjunction exercise displays a cut and asks for lower-rank cut replacement, but names the invertibility lemma rather than the maximal-cut reduction lemma. The source reference is retained and the discrepancy disclosed.
- **OLTEPTCUTINVL-002:** The final lead-in credits the previous cut-admissibility lemma with the maximal-rank reduction just established by `lem:max-cut-red-G3c`. The source reference is retained and the attribution mismatch disclosed.
- **OLTEPTCUTINVL-003:** In the atomic principal-axiom case, `Delta = Delta, A` must be `Delta = Delta-prime, A`, as the immediately following sequent also shows. The target makes precisely that one-symbol correction and discloses it.

The proof trees, cut-rank bounds, quantifier-case construction, and final double induction remain source-controlled. Structural QA verifies the declared symbolic difference; it does not independently certify every proof step or rendered layout.
