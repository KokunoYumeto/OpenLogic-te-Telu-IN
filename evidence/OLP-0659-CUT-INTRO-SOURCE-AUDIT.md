# OLP-0659 — cut-elimination introduction source-error audit

Frozen source: `upstream/content/proof-theory/cut-elimination/introduction.tex`, SHA-256 `d8400228f30064f5458fd30c09d10772bbc2ff3d7cea23e28c93664a6e3a6a83`. The source is unchanged.

- **OLTEPTCUTINT-001:** The second displayed cut rule has identical `Gamma` and `Delta` contexts in both premises and the adjacent prose calls it context-sharing cut `CutCS`, but the rule label is `Cut`. The target labels that diagram `CutCS` and discloses the mismatch. This is the only core-math delta.

The introduction's comparison of Gentzen's topmost-cut and Schütte–Tait maximal-rank approaches, its completeness motivation and constructive interpolation example remain source-controlled. Structural QA verifies the declared diagram-label difference, not rendered layout.
