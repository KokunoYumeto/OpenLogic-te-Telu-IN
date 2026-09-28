# OLP-0573 — source-error audit

Frozen source: `upstream/content/set-theory/replacement/finiteaxiomatizability.tex`, SHA-256 `31413d0ed7d34d8cd7ee45cbf8f137fb28c954de9ed84ef6bed96f502fad4cf4`. The source is unchanged.

**OLTESTREPLFINITE-001:** In the proof's third displayed consequence, the source writes `(N is transitive)^N`. Since the quantifiers in the transitivity assertion are then restricted to `N` itself, this does not establish that `N` is transitive in the ambient universe, as required by the next line. The reflected formula `psi^M(N)` instead supplies `(N is transitive)^M`; with `M` transitive and `N in M`, the stated absoluteness step yields ambient transitivity. The Telugu target replaces the superscript `N` with `M` and discloses the repair.

The exact core-math delta is recorded in the findings JSON. The issue follows from the local definition of relativization, the displayed definition of `psi`, and the ensuing inference; no independent textbook source was needed.
