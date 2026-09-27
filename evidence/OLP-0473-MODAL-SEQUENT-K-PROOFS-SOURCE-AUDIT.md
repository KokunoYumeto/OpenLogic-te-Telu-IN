# OLP-0473 — source-error audit

Frozen source: `upstream/content/normal-modal-logic/sequent-calculus/proofs-in-K.tex`, SHA-256 `62589ae78eea5962800114b6fdfffa1923072dfb10c85746d042c4d5dc7f4c30`. The source is unchanged.

**OLTENMLSEQPRK-001 (source lines 85 and 102):** The duality proof labels two steps `\RightR{\lnot}` although both introduce a negation on the *left* of the sequent. The frozen LK rule table in `upstream/content/proof-theory/sequent-calculus/rules-LK.tex` labels that inference `\LeftR{\lnot}`. The target corrects only these two proof-tree labels and discloses the repair immediately after the tree; premises, conclusions and final duality formula are unchanged.

The source's final `\RightR{\land}` over `\liff` is retained as printed, not silently re-derived. This audit is same-agent rule-label comparison, not independent certification of every proof step, feature-tag variant or TeX rendering.
