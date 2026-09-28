# OLP-0636 — space-filling curve source-error audit

Frozen source: `upstream/content/history/set-theory/pathologies.tex`, SHA-256 `e48c454ab4d3058f89b6ce709da28387e9d633459425ffac9cd67b64d3de96e8`. The source is unchanged.

- **OLTEHISSETPATH-001:** The source calls Peano's construction a smooth map onto a plane. The construction under discussion is a continuous surjection from a compact line segment onto a square. A continuously differentiable map of a compact interval into the plane has bounded derivative and is Lipschitz. Dividing the interval into `n` equal parts, its image is covered by `n` discs of radius at most `L/n`, of total area at most `πL²/n`; thus its image has planar area zero and cannot contain a square. The target uses “continuous” and “square” and discloses the correction adjacent to the claim.

The Cantor correspondence, the six-stage Hilbert figure and the later discussion of geometric intuition remain source-controlled. Bounded structural QA is not rendered-diagram inspection or a general historical fact-check.
