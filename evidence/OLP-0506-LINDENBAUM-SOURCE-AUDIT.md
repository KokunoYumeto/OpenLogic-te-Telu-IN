# OLP-0506 — source-error audit

Frozen source: upstream/content/intuitionistic-logic/soundness-completeness/lindenbaum.tex, SHA-256 5e3dd8b221efdfdeeba716e58f220b9c623a2ea317d4033365f6d2e1a21d34be. The source is unchanged.

**OLTEINTLIN-001 (source lines 99–104):** The finite-support argument chooses the largest index associated with a member of Γ′, but Γ′ may be empty when A is derivable from no premises. The Telugu proof explicitly takes the initial index in that case; Γ′ is then still a subset of that stage. All source formulas remain unchanged, and the repair is disclosed beside the argument.

**OLTEINTLIN-002 (source lines 120–126):** The source says that each stage leaves at least one fewer qualifying disjunction overall. That does not follow: enlarging Γ_n can make new disjunctions derivable. The Telugu proof uses the valid finite-prefix argument: for fixed j, each earlier index can be selected at most once, because its selected disjunct is permanently added. If j remains eligible, it must eventually be selected. The mathematical expressions are preserved and the repaired reasoning is disclosed.

These are same-agent proof audits, not TeX-build confirmation.
