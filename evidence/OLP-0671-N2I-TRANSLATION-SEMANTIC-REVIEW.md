# OLP-0671 — N2-to-G2 translation semantic review

The ten aligned blocks preserve the labelled-context-to-multiset map, the target succedent convention, induction on proof height, axiom and implication-introduction cases, implication elimination, and the classical falsehood rule. Protected markers, references, formulas and retained proof-tree steps were compared with the frozen source.

Four adjacent disclosures correct the intuitionistic target system (`OLTEPTNATN2I-001`), the false-conclusion branch of implication elimination (`-002`), a labelled formula leaking into the G2 proof tree (`-003`), and the empty-succedent edge case for classical absurdity (`-004`). Strict QA accepts only their recorded math differences. Other inference cases are not supplied by the source, and the translation is not an independently formalized or visually rendered proof.
