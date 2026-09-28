# OLP-0520 — source-error audit

Frozen source: `upstream/content/counterfactuals/introduction/strict-conditional.tex`. The source is unchanged.

**OLTECNTSTR-001:** In the initial comparison display, the fifth claimed non-entailment is `¬(A → B) ⊭ A ∧ ¬B`. That is false for the material conditional: its negation is equivalent to `A ∧ ¬B`, as the immediately preceding material-conditional section states. The surrounding comparison and next line concern the strict conditional. The Telugu display changes only this occurrence of `\lif` to `\strictif` and discloses the change immediately after the display. No exercise solution or extra theorem is supplied.

The correction-aware math checker treats the displayed alignment as one normalized math expression. Its entire one-entry source/target delta is recorded in the machine-readable finding rather than pretending that only an isolated inline formula changed. This is same-agent proof checking, not TeX-build or independent expert confirmation.
