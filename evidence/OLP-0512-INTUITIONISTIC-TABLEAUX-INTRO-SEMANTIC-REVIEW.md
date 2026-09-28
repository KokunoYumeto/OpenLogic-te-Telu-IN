# OLP-0512 — same-agent semantic review

- Frozen source: `upstream/content/intuitionistic-logic/tableaux/introduction.tex`, SHA-256 `d247348c60332898ef0ee789cf200c83633ab364190dd8a68e7c3a767b5fcdb0`.
- Telugu target: `translation/content/intuitionistic-logic/tableaux/introduction.tex`, SHA-256 `064afa9601bb77a4ad4e371c5181cc117e8ab68054425071d4aa88046b42d0fe`.
- Bounded QA: `build/BATCH-161-STRUCTURAL-QA.json`, 10 aligned blocks; structure, tokens, identifiers and math pass. Same-agent review only, not TeX compilation.

The introduction retains truth-value signs, signed formulas, closed branches, tableau derivability and the finite-assumption set. The intuitionistic extension preserves positive-integer prefix sequences, dot concatenation, world names and `σ.*` as the starting prefix plus all extensions. The source's reference to modal tableaux in the middle of the intuitionistic discussion is translated as such, not silently rewritten. Canon witnesses support general sign/tableau/relation register only.
