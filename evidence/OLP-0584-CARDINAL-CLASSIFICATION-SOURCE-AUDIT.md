# OLP-0584 — source-error audit

Frozen source: `upstream/content/set-theory/cardinals/classing.tex`, SHA-256 `facf3eb5d19661a660d1c6441f09c0acc909f944253f4c7fe129048f8ea35bc6`. The source is unchanged.

**OLTESTCARDCLASS-001:** In the theorem `generalinfinitycharacter`, the source glosses `card(A) notin omega` as “A is not a natural number.” That is not equivalent: a finite set such as `{\emptyset, {\emptyset}}` can fail to be a von Neumann natural number, while its cardinality is in `omega`. The target says instead that `A` is not a finite set, leaving the formal condition and the theorem intact. The adjacent `\sourcecorrection` discloses the change. No core-math or protected-identifier delta is required.

This is a definitional counterexample, not a choice of specialist terminology. Structural QA does not establish semantic equivalence or a full TeX rendering.
