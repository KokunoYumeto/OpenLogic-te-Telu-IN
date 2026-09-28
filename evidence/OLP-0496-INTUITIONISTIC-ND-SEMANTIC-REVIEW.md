# OLP-0496 — same-agent semantic review

- Frozen source: `upstream/content/intuitionistic-logic/introduction/natural-deduction.tex`, SHA-256 `3fc69e5ddaa3c9273ab2fa9c4a9e5c7826c3044aa9945152d4f710f8cf62afd3`.
- Telugu target: `translation/content/intuitionistic-logic/introduction/natural-deduction.tex`, SHA-256 `17dab36063e97409688a2706c82ad73d506b30790ec46f932057eb579cbbf7c8`.
- Bounded QA: `build/BATCH-145-STRUCTURAL-QA.json`, 34 aligned blocks; structure, tokens, identifiers and declared math delta pass. Same-agent review only, not TeX compilation.

The intuitionistic system excludes the classical `\FalseCl` rule, treats derivations with undischarged assumptions as functions on constructions, and gives BHK readings for conjunction, conditional, disjunction and absurdity. Negation rules remain optional because negation abbreviates implication to falsity. The original proof trees, four examples, proposition that intuitionistic derivability implies classical derivability, and six exercises are retained. OLTEINTND-001 discloses the source's erroneous repeated `A_1` in a conjunction-elimination explanation; the second conjunct is `A_2` as required by its paired construction. TE-P003/018/024/025 support only general proof/logic vocabulary.
