# OLP-0615 — induction on natural numbers source-error audit

Frozen source: `upstream/content/methods/induction/induction-on-N.tex`, SHA-256 `30a7fe3bf67517b5744d826eeb819782d399cf28a018313f5a7eff12843fe222`. The source is unchanged.

- **OLTEMTHINDN-001:** The induction schema quantifies over `k`, but its explanatory application at one says to put one for `n`. The target names `k` as the substituted variable. This is the only core math-atom delta.
- **OLTEMTHINDN-002:** The dice theorem, like the preceding zero-dice discussion, includes zero; the proof starts at one die. The target explicitly checks the zero-dice case separately inside the proof, then retains the one-die base and successor argument for positive numbers. No source formula is changed.

The recurrence for sums and its algebraic induction step remain source-controlled. The correction-aware QA does not independently verify TeX rendering or every mathematical step.
