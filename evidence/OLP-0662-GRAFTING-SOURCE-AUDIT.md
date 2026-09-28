# OLP-0662 — grafting source audit

The frozen source contains four local inconsistencies in the proof-tree example, the open-assumption claim, the sequent-proof calculus names, and the proof-height induction variable. The Telugu translation makes the minimal corrections adjacent to the affected passages using `\sourcecorrection` and retains the original source bytes unchanged.

- `OLTEPTNATGRA-001` (lines 21–35): implication introduction must conclude $!B \lif !A$, because the displayed subproof derives $!A$ from $!B$. The source instead has $!B \lif !C$.
- `OLTEPTNATGRA-002` (lines 63–70): the second derivation of $\Gamma_2 \Sequent !B$ belongs to N2c/N2i in this N2 grafting definition, not N1c/N1i.
- `OLTEPTNATGRA-003` (lines 80–82): the proof-height induction should use $\delta_1$, the first derivation, instead of undefined $\delta$.
- `OLTEPTNATGRA-004` (lines 50–59): open occurrences replaced in the first derivation no longer remain open assumptions in the grafted result.

The source gives only a one-line induction indication; the translation does not invent a full proof. The two math deltas are recorded exactly in the findings authority and no other math changes are intended.
