# OLP-0671 — N2-to-G2 translation source audit

Four local issues in the frozen source are corrected with adjacent `\sourcecorrection` notes in the Telugu target; the source remains unchanged. The JSON findings partition every core-math difference exactly.

- `OLTEPTNATN2I-001` (lines 13–18): the intuitionistic target calculus is G2i, not a repeat of N2i.
- `OLTEPTNATN2I-002` (lines 92–95): for implication elimination with false overall conclusion, the second inductive derivation proves B, not an empty succedent. The target uses the false axiom, implication-left, cut and the already mentioned contraction to derive the required empty succedent.
- `OLTEPTNATN2I-003` (lines 107–117): the G2c tree's premise must not carry an N2 assumption label `x:`.
- `OLTEPTNATN2I-004` (lines 105–121): if classical absurdity concludes false, its displayed translation needs a final cut with the false axiom to meet the proposition's empty-succedent convention.

Only the discussed rule cases are covered by this source proof; no other missing cases were invented.
