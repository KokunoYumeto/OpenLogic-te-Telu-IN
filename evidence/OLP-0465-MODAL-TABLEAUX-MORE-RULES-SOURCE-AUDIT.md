# OLP-0465 — source-error audit

Frozen source: `upstream/content/normal-modal-logic/tableaux/more-rules.tex`, SHA-256 `1763d19e944f908c2890c6918b0197280a38ce9932867b28f563a7140b6d9c48`. The source is not edited.

## OLTENMLTABMRU-001 — the claimed axiom 5 does not match the tableau

Source lines 160–183 call the example a proof of `\Log{S5} \Proves \Ax{5}` but identify axiom 5 as `\Box !A \lif \Box\Diamond !A` and build a tableau for that formula. The frozen edition defines axiom 5 as `\Diamond !A \lif \Box\Diamond !A` (`content/normal-modal-logic/syntax-and-semantics/schemas.tex` and `content/normal-modal-logic/tableaux/simple-S5.tex`). Although the source's formula is valid in S5, it is not the claimed schema instance.

The Telugu target preserves the intended claim and changes the displayed formula and tree to a closed tableau for the actual axiom 5: the false implication has `T Diamond A` and `F Box Diamond A` at prefix `1`; false Box introduces `F Diamond A` at fresh `1.1`; the existing `4r Diamond` step returns `F Diamond A` to `1`; true Diamond introduces `T A` at fresh `1.2`; false Diamond at used `1.2` yields `F A` there and closes. The rule labels, sign values, freshness/used conditions and seven-node shape were manually checked against the preceding rule table. The adjacent `\sourcecorrection` discloses the changed formula, witness prefix and final rule lines. The six exercises and accessibility-system table are unchanged.

This is same-agent source comparison, not an independent mathematical referee or visually rendered TeX check.
