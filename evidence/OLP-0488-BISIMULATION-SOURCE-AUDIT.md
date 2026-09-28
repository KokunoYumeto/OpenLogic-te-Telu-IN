# OLP-0488 — source-error audit

Frozen source: `upstream/content/applied-modal-logic/epistemic-logic/bisimulations.tex`, SHA-256 `3be0d4f2009365ab48416c0235ba2a8dfa8a5c04a68c0066d377959a0489c60d`. The source is unchanged.

**OLTEAMLELBIS-001 (source lines 39 and 43):** Both forth/back clauses quantify agents with `$a \in A$`, but the immediately preceding language definition establishes `$G$` as the set of agent symbols, and `$A$` is not introduced as an agent set. In the same section `$!A$` denotes an arbitrary formula. The Telugu clauses use `$a \in G$` in both places, and a disclosure follows the pair. This changes only the two agent-set references, not the accessibility or bisimulation conditions.

This is a same-agent cross-section notation comparison, not a full independent proof or TeX-build confirmation.
