# OLP-0663 — natural-deduction introduction source audit

The frozen source has two local errors. The Telugu translation makes only the needed corrections and places `\sourcecorrection` notes beside them. The source remains unchanged.

- `OLTEPTNATINT-001` (lines 39–43): the description of a Jaśkowski box gives its first and last lines both as consequent $!B$; the first line must be assumption $!A$.
- `OLTEPTNATINT-002` (lines 73–76): implication introduction from $\Gamma + !A \Entails !B$ gives $\Gamma \Entails !A \lif !B$, not $\Gamma \Entails !B$.

The latter is the only intended core-math difference and is recorded in the findings authority. No original proof is expanded beyond the source.
