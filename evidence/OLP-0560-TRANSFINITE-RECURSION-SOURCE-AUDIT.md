# OLP-0560 — source-error audit

Frozen source: `upstream/content/set-theory/spine/recursion.tex`, SHA-256 `e9b5fe7b4ab133bc97d234aabd8dae2412e91bbeeb9c785b4a8112ba1e1a0510`. The source is unchanged.

**OLTESTSPINREC-001:** The piecewise definition of `xi(x)` supplies `A` only when `x` is not a function with ordinal domain. The empty function has the ordinal domain `0`, but it has neither successor nor nonzero limit domain, so no branch applies. The proof immediately evaluates `xi(emptyset)=A`. The Telugu target adds empty domain to the first branch, discloses the repair, and otherwise keeps the recurrence and proof unchanged. The change occurs only in masked prose inside the cases display, so there is no core-math delta.

This is a local definedness defect established from the displayed clauses and the subsequent base case. No independent textbook source was needed.
