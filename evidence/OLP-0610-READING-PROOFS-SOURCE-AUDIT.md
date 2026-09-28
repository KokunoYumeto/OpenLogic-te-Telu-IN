# OLP-0610 — reading proofs source-error audit

Frozen source: `upstream/content/methods/proofs/reading-proofs.tex`, SHA-256 `e5146120b8fd42d544e1e6e51fdcad7fd3a0c721a54ae320692c4fd4277fec33`. The source is unchanged.

- **OLTEMTHPRFREA-001:** The expanded absorption proof lists the forward inclusion for both (a) and (b). Its own later explanation proves the reverse inclusion. The target states that reverse obligation under (b), preserving the actual proof, and discloses the edit.
- **OLTEMTHPRFREA-002:** The source's final explanatory bracket adds an unmatched closing parenthesis to the union-membership formula. The target removes it and discloses the edit.

The findings JSON records both exact math-atom substitutions. The condensed proof, explanation of tacit steps and closing exercise are retained. Structural QA is not a rendered-page check.
