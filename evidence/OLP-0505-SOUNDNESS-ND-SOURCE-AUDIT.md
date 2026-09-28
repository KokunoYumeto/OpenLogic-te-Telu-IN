# OLP-0505 — source-error audit

Frozen source: upstream/content/intuitionistic-logic/soundness-completeness/soundness-nd.tex, SHA-256 2e1aae17af3a524802ebaa08e0a2f16f6b1014f0a06d697757a9ceddce02ab93. The source is unchanged.

**OLTEINTSND-001 (source lines 35–44):** The conjunction-introduction case has premises B and C and concludes B∧C at its end, but its stated target is Γ∪Δ ⊨ A∧B. The target statement is corrected to Γ∪Δ ⊨ B∧C, with an adjacent disclosure.

**OLTEINTSND-002 (source line 82):** In the first disjunction-elimination case, the world argument [w] sits outside the mathematical satisfaction expression. The target places it in the defined local-truth expression and discloses the notation repair.

**OLTEINTSND-003 (source lines 83 and 85):** The two entailment expressions write Δ₁∪B and Δ₂∪C even though their assumptions earlier are Δ₁∪{B} and Δ₂∪{C}. The target restores singleton braces in both places and discloses the repair.

These are same-agent direct notation/proof audits, not TeX-build confirmation. The source's unfinished negation cases remain exercises, and no new proof was supplied.
