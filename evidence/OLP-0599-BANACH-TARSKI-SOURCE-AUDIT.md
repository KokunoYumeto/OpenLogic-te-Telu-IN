# OLP-0599 — source-error audit

Frozen source: `upstream/content/set-theory/choice/banach.tex`, SHA-256 `51f2d8e142b4bccd21bc0aa06330ecff874360d32005b34c415955eaaa24943a`. The source is unchanged.

**OLTESTCHOICEBANACH-001:** The source's example bijection from `(0,1)` to the reals writes `tan(pi(r-1/2)))`, with one more closing parenthesis than opening parentheses. The target writes `tan(pi(r-1/2))`, the intended tangent map, and discloses the correction adjacent to the enumerated example. The exact inline-math atom delta is recorded in the findings JSON.

The target otherwise retains the distinction between the solid ball's finite decomposition, the nonmeasurability of the pieces, and the philosophical argument, without claiming that physical matter can be duplicated. Historical citations and the original-language pun remain. Structural QA does not independently verify the historical theorem or full TeX rendering.
