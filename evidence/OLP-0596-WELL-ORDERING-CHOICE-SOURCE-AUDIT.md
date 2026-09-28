# OLP-0596 — source-error audit

Frozen source: `upstream/content/set-theory/choice/wellorderingproblem.tex`, SHA-256 `9ca7bb6570d323e7caebb910c975827a9411c1bbe2b4dabd6d41f9ebe2f04fa4`. The source is unchanged.

**OLTESTCHOICEWO-001:** The right-to-left proof begins `g(0)=f(A)` with `f` a choice function on nonempty subsets of `A`. If `A` is empty this term is undefined; the empty set is trivially well-ordered. The target separates that base case and assumes nonempty `A` for the recursion, with adjacent disclosure. No core-math delta is needed.

**OLTESTCHOICEWO-002:** The source explains its “stop” shorthand by setting `g(delta)=A` for all `delta<=alpha` once completion occurs. That overwrites the already chosen values and invalidates the ensuing injectivity and surjectivity argument. The target sets the stop marker only at and after the first completed stage (`delta>=alpha`) and explicitly uses the pre-stop restriction as the choice enumeration. The inequality atom changes as recorded in the findings JSON; the correction is disclosed adjacent to the recurrence explanation.

The target retains the source's Hartogs contradiction and the Well-Ordering/Choice equivalence. Structural QA does not independently prove the transfinite recursion or full TeX rendering.
