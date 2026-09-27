# OLP-0469 — source-error audit

Frozen source: `upstream/content/normal-modal-logic/tableaux/countermodels.tex`, SHA-256 `c47ac240cc48f6e82093505895045e59de1a1f034b7e377086c5b53944d744bd`. The source is unchanged. Five repairs are disclosed adjacent to their Telugu target loci.

1. **OLTENMLTABCM-001 (source line 16):** The introduction says `\Entails/ A`, omitting the `!` formula prefix used throughout the passage. The target restores `\Entails/ !A`.
2. **OLTENMLTABCM-002 (source lines 149–155):** In the completed Box tableau, the true `p` at `1.2` is line 12, not line 11, and true `q` at `1.1` is line 11, not line 10. The model valuations are unchanged; the line references are repaired.
3. **OLTENMLTABCM-003 (source lines 203–207):** In the Diamond tableau, line 3 is `F Diamond(p and q)`, not `T Diamond(p and q)`; the used-prefix rule is `F Diamond`, not `T Diamond`. The target matches the actual tree and preceding rule table.
4. **OLTENMLTABCM-004 (source line 209):** The second Diamond tableau reverses the implication's antecedent and consequent in its first node while retaining the rest of the tree for the original formula. The target restores the original first node from the first and third trees.
5. **OLTENMLTABCM-005 (source lines 279–287):** The Diamond model prose correctly assigns `q` to world `1.2` but falsely cites `T q[1.1]`; line 7 of the tableau is `T q[1.2]`. The target corrects this prefix.

The formal trees, their open/closed branch structure, valuations and TikZ model drawings otherwise remain source-controlled. The finite termination claim is taken as the source's K-procedure claim for formula inputs; this audit does not supply a new general-`\Gamma` completeness proof. Same-agent source/rule comparison, not external mathematical refereeing or TeX-render verification.
