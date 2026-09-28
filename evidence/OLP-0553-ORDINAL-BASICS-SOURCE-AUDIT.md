# OLP-0553 — source-error audit

Frozen source: `upstream/content/set-theory/ordinals/basic.tex`, SHA-256 `7a9d1d198227e2de1a2af719417ae7d81ffc2c727e6da7d992b194f44a7f19c1`. The source is unchanged.

**OLTESTORDBASIC-001:** The proof of the transfinite-induction/least-counterexample theorem says that an ordinal has an `in`-least “element which is phi.” A formula is not an element, and the proof needs the least member *satisfying* phi among the nonempty phi-subclass of the witness ordinal. The Telugu text makes that restriction explicit and notes that no earlier ordinal satisfies the formula. The theorem statement, all formulas and the alternate commented proof stay unchanged.

This is one prose-logic correction with no core-math delta. The local ordinal definition, well-order property and theorem hypotheses suffice for the treatment; no external source was used to repair the proof wording.
