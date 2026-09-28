# OLP-0495 — source-error audit

Frozen source: `upstream/content/intuitionistic-logic/introduction/bhk-interpretation.tex`, SHA-256 `4a23702a2d57e916ab50e764e61b76bb4e91d6287655d2db737ac71023176794`. The source is unchanged.

**OLTEINTBHK-001 (source line 95):** In the currying example, the sentence first names `$(!A \land !B) \lif !C$` and then calls the outputs of its construction `g` constructions of `$C$`. The surrounding construction clauses consistently use the meta-formula `$!C$`. The Telugu version uses `$!C$` at this one occurrence and discloses it beside the sentence.

**OLTEINTBHK-002 (source line 136):** The excluded-middle double-negation example defines `h_1` on a construction `$M_1$` of `$!A$` but says its output is `$\tuple{1,M_2}$`, whereas `$M_2$` is introduced for the second injection `h_2`. The first tagged pair must carry its actual input `$M_1$`; the Telugu version uses `$\tuple{1,M_1}$` and discloses the repair beside it.

These are same-agent local type/notation checks, not a full independent proof or TeX-build confirmation.
