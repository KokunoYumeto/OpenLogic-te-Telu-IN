# OLP-0480 — same-agent semantic review

- Frozen source: `upstream/content/applied-modal-logic/temporal-logic/extra-temporal-operators.tex`, SHA-256 `610e36a049e01fb2ace59164fd64a6482a8109a49e5d859af928922edfe26f97`.
- Telugu target: `translation/content/applied-modal-logic/temporal-logic/extra-temporal-operators.tex`, SHA-256 `1240fe818b6b3562266c98c8133d14810aa0a6e5e011e41e4fe0dbb47aeaef38`.
- Bounded QA: `build/BATCH-129-STRUCTURAL-QA.json`, 11 aligned blocks; structure, tokens, identifiers and math pass. Same-agent review only, not TeX compilation.

The binary `Since` and `Until` operators are added to the temporal formula grammar without changing their argument order. For `Since B C`, B holds at some preceding point and C at every intermediate point; for `Until B C`, B holds at some succeeding point and C at every intermediate point. The intuitive readings match that order. The strict interval conditions and `defn:since-until` labels are preserved. TE-P010/018/024 attest only general relation and logic/derivation register, not these temporal operators.
