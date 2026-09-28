# OLP-0551 — source-error audit

Frozen source: `upstream/content/set-theory/ordinals/iso.tex`, SHA-256 `eb57a72aed6e4ff2398fe8d9c52239c79d2578df37c5e4bb891568381a41cb39`. The source is unchanged.

**OLTESTORDISO-001:** In the proof of `lemordsegments`, the source introduces an isomorphism `f : A_{a_2} -> B_{b_2}` but then says `b_1 < b_2` because `f`'s *domain* is `B_{b_2}`. Its domain is `A_{a_2}`; its range (and codomain) is `B_{b_2}`. The Telugu proof names the range, with a reader-visible adjacent disclosure. The formulas and order argument are unchanged.

This is one prose-logic correction with no core-math delta. No independent textbook source was required to identify the domain/range mismatch in the frozen local proof.
