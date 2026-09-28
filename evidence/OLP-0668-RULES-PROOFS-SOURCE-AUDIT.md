# OLP-0668 — N1 rules and proofs source audit

Five local source defects were resolved in the Telugu target with adjacent `\sourcecorrection` notes. The source bytes remain frozen. The exact diagram and height/formula differences are partitioned by finding in the JSON authority.

- `OLTEPTNATRPR-001` (lines 131–139): N1 derivations are formula trees grown from assumptions, not sequent trees from axioms; the following definition confirms this.
- `OLTEPTNATRPR-002` (lines 162–183): the third premise of the generic three-premise derivation must be $!A_3$, matching $\delta_3$, not a repeated $!A_2$.
- `OLTEPTNATRPR-003` (lines 199–204): the referenced `tab:N1` gives N1c/N1i rules, not N2c/N2i.
- `OLTEPTNATRPR-004` (lines 226–269): the discharge label $x$ belongs to the entire conjunction assumption, as the final displayed derivation confirms, not merely to the second conjunct.
- `OLTEPTNATRPR-005` (lines 240–247): the immediate subproof is $\delta_1$; its height is zero and the derived $\delta_2$, $\delta_3$ each have height one.

The example's two-premise and final derivations otherwise follow the source, and this audit does not replace a complete formal or rendered proof review.
