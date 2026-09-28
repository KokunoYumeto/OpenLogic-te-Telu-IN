# OLP-0504 — source-error audit

Frozen source: upstream/content/intuitionistic-logic/soundness-completeness/soundness-axd.tex, SHA-256 ad6dd34af76e2848ba49f32f2599bdd96137c93ad50c496f553fddc1755a9125. The source is unchanged.

**OLTEINTSAX-001 (source lines 40–42):** In the premise-membership case, the source writes \mSat{M}{\Gamma}{!A_n}[w], giving an extra argument to the satisfaction notation. The intended conclusion is the already-defined local truth \mSat{M}{!A_n}[w]: if all members of Γ hold at w and A_n∈Γ, then A_n holds there. The Telugu target uses the defined form and discloses the correction beside it. The equivalent final Γ ⊨ A remains source-aligned because A_n=A.

This is a same-agent semantic/notation audit, not a TeX-build confirmation.
