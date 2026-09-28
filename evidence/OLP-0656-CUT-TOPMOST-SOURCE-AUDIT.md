# OLP-0656 — topmost-cut elimination source-error audit

Frozen source: `upstream/content/proof-theory/cut-elimination/ce-topmost.tex`, SHA-256 `930858ac1885a22be7f561047de54c702127d914720572042917ed3c8cef3214`. The source is unchanged.

- **OLTEPTCUTTOP-001:** In alternative Case A, the right premise is the axiom, so the left premise proof `pi_1` ends in the succedent with two copies of the cut formula. The source calls this `pi_2`. The target corrects and discloses the label.
- **OLTEPTCUTTOP-002:** The disjunction case writes `cutr(pi)`, but the section defines `cutrank(pi)`; no `cutr` declaration was located in the frozen source. The target uses `cutrank` and discloses the correction.
- **OLTEPTCUTTOP-003:** The final implication example's lower cut concludes with the cut formula `B` still in the antecedent. The target removes it and discloses the diagram correction.
- **OLTEPTCUTTOP-004:** In the two-premise Case D diagrams, two sequents use the whole `Delta` and then append explicit `B∧C` copies, while the neighboring premises and prose require `Delta-prime`. The target repairs those two contexts and discloses them.

Other displayed proof trees and cut-height/rank relations remain source-controlled. Structural QA verifies declared symbolic differences, not a complete independent proof or rendered layout.
