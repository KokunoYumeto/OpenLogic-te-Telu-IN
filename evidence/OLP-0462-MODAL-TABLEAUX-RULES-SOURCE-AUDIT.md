# OLP-0462 — source-error audit

Frozen source: `upstream/content/normal-modal-logic/tableaux/rules-for-K.tex`, SHA-256 `781f917de40a4b8e0c38ade5e7cd1d9eab39a629563df7f6d07e0434ab5dffe3`. Both findings below are local to this reader unit; the source file is not edited. The Telugu target discloses each intervention adjacent to the affected prose or diagram.

## OLTENMLTABRUL-001 — overstatement about other worlds

Source lines 17–19 derive `A` and `B` at the world named by `\sigma` from `A \land B` there, then parenthetically say they are “not at any other world.” Read literally as a truth claim, that is false: the same conjuncts may also be true elsewhere. The inference rule derives the two conclusions only at the same prefix and has no implication about their truth at other worlds. The Telugu renders “not necessarily at any other world” and immediately discloses this minimal semantic clarification. The signed-rule table and prefix values remain unchanged.

## OLTENMLTABRUL-002 — wrong rule label in Box-only counterexample

Source lines 227–243 illustrate an illicit closed tableau if the fresh-prefix condition is removed. At source line 231, the premise `\pFmla{\False}{\Box\formula{A}}{1}` is expanded to `\pFmla{\False}{\formula{A}}{1.1}`, but the edge is labelled `\TRule{\True}{\Box}[2]`. The correct rule is `\TRule{\False}{\Box}[2]`. The Telugu changes only that rule label in the Box-only conditional diagram and discloses it in the immediately preceding text. This does not turn the diagram into a legitimate proof: the later false-Box expansion still illegally reuses an existing `1.1` prefix, precisely the point of the counterexample. The Diamond-only and combined diagrams remain untouched.

The source's “When…”-style grammatical redundancy at lines 171–173 (“requirement that the restriction that”) is smoothed in Telugu without mathematical alteration or a separate correction identifier. This same-agent audit does not claim external mathematical refereeing or visual TeX validation.
