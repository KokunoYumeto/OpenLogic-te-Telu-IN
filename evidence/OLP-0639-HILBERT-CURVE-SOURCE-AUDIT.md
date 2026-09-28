# OLP-0639 — Hilbert-curve source-error audit

Frozen source: `upstream/content/history/set-theory/hilbert-curve.tex`, SHA-256 `bda8e7a38876ea87b03d2564ab16b39e2b1d1d6ec75a73fae27ca1faa73ab832`. The source and diagrams are unchanged.

- **OLTEHISSETHILB-001:** The displayed pointwise-limit definition uses `x` in the square, but a curve has the unit line as its parameter domain. The target uses the unit line and notes that the sketch has not established existence of the pointwise limit.
- **OLTEHISSETHILB-002:** The grid argument bounds the distance from each square point to each approximating image. It does not permit the claimed limit of the maximum distance under mere pointwise convergence. Even zero distance to an image would imply membership only once closedness is established. The target keeps the source's informal argument but labels the limit step a proof gap.
- **OLTEHISSETHILB-003:** The source's proposed “continuity” property starts at an arbitrary target point and finds an input interval mapping near it. Continuity fixes an input parameter and controls its neighboring outputs. These are different quantifier patterns. Also a continuous space-filling curve is not smooth in the differentiable sense. The target discloses the mismatch.
- **OLTEHISSETHILB-004:** The final grid-interval argument addresses the earlier target-neighborhood property, not continuity. The source does not give explicit parametrizations, compatible nesting and a convergence estimate. The target retains the sketch as a sketch and discloses the missing proof. A properly specified sequence of continuous parametrizations with uniform convergence would give continuity, but that proof is not supplied here.

No complete replacement proof of space-filling or continuity is claimed. Protected TikZ geometry is retained, and structural QA does not substitute for rendered-diagram inspection.
