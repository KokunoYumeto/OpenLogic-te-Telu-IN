# OLP-0675 — permutation conversions source audit

The first prose example misidentifies its cut formula as $!B\lor!C$, while the adjacent proof tree yields $!B\land!C$ and then applies conjunction elimination. The Telugu text follows the derivation and discloses OLTEPTNORPER-001.

Two prose occurrences of \Elim{\exists} conflict with the \Elim{\lexists} rule used in the N1i exercise and displayed derivation. The Telugu text uses the latter consistently, with disclosures OLTEPTNORPER-002 and OLTEPTNORPER-003. The frozen source and proof trees are unchanged. The commented-out legacy table and the repeated active implication row are preserved as supplied.
