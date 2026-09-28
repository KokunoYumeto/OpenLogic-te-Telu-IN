# OLP-0572 — source-error audit

Frozen source: `upstream/content/set-theory/replacement/refproofs.tex`, SHA-256 `c034323f1402beaf3d329ac7d7a0be6e192bd86ea81ff3efffe29229aca9cf43`. The source is unchanged.

**OLTESTREPLREFP-001:** The displayed condition defining `mu` ends with an extra closing parenthesis after the formula `phi_i(...)`. There is no corresponding opening parenthesis. The Telugu target removes that terminal mark and discloses the repair.

**OLTESTREPLREFP-002:** The union defining `S` binds `m < omega` but uses `S_n` in the body. Taken literally, that union repeats the same set and does not contain all stages constructed in the recursion, contrary to the next paragraph. The target uses `S_m` and discloses the repair.

**OLTESTREPLREFP-003:** The Replacement theorem statement writes the set-builder predicate `(exists x in A) phi(x,y` without its closing parenthesis. The target closes that predicate, matching the proof's final displayed formula, and discloses the repair.

The exact core-math deltas are recorded in the findings JSON. Each defect is local to the frozen source's displayed formula and its immediately surrounding proof; no independent textbook source was needed.
