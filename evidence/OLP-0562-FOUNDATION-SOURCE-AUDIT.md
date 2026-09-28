# OLP-0562 — source-error audit

Frozen source: `upstream/content/set-theory/spine/foundation.tex`, SHA-256 `18d5d41a2becf13c6d5221d1c3504ea8300d96d85572c8848ed22bfc7ea321a5`. The source is unchanged.

**OLTESTSPINFOUND-001:** The proof chooses a set `B` from `D` and establishes a bound for members of `B`, but the displayed supremum is indexed by `x in b`. No lowercase `b` is introduced in this proof. The Telugu target changes that binder to `x in B`, matching the immediately preceding and succeeding argument, and discloses the repair.

The exact core-math delta is recorded in the findings JSON. This local variable-reference error requires no independent textbook source.
