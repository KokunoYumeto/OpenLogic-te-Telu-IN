# Source audit — lambda-calculus syntax foundations, OLP-0356--OLP-0360

- Audit ID: OLTELAMSYN-20260925
- Review date: 2026-09-25
- Frozen source revision: `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`
- Source manifest SHA-256: `5a6fef5c16c15a5b2f90f874c268512cfd6ed2e846bdfa850a67304a4c05a155`
- Raw source archive: 1,806,644 bytes, SHA-256 `80b484b1a87076fbdb207d69f97930ca946ce1716dbd905906b29e4a74077357`

The five frozen source files and their aligned Telugu drafts were read in full. The chapter driver preserves all ten imports. The Terms definition retains its three inductive formation clauses, protected labels, lambda expressions and exercise. Unique Readability retains all three lemmas, two propositions, the induction argument and exercises. Abbreviated Syntax preserves application association, abstraction scope, multi-variable abbreviation, both displayed terms and its exercise. Free Variables preserves binder examples, all three inductive set equations, the environment explanation, the closed-term definition, lemma and exercises.

The native Telugu witness pages actually inspected for this batch were TE-P003 (proof and induction exposition), TE-P008 and TE-P011 (set and function usage), TE-P027 (formal terms and variables), TE-P029 (scope and bound variables), and TE-P032 (induction and deduction). These support the stated general vocabulary and prose register. They do not attest lambda abstraction, its parameter, fully parenthesized term formation or combinators as specialist Telugu terms. TE-T078 and the explicit formation clauses control those senses; the new parameter mapping is provisional and reversible. The witnesses do not replace the frozen mathematical definitions.

Four source defects have locally disclosed handling in `FINDINGS.json` and `SOURCE_CORRECTIONS.jsonl`:

1. OLTELAMSYN-001: `desginate` is read as `designate` in the term-metavariable sentence; no formula changes.
2. OLTELAMSYN-002: `demnostrates` is read as `demonstrates` in the parenthesization example; the term stays exact.
3. OLTELAMSYN-003: the scope of the indicated `\lambd[x][M]` is the corresponding occurrence of its body `M`, not the surrounding term `N`; the target changes one inline `$N$` to `$M$` with an adjacent explanation.
4. OLTELAMSYN-004: `From example` is read as `For example` in the widest-scope convention; the example term stays exact.

The unique-readability proof's alternative-application case implicitly assumes a distinct split. If the left factors agree, the remaining right factors agree as the same string; otherwise one left factor would be a forbidden proper initial term of the other. The Telugu passage follows the source's abbreviated proof without claiming an extra theorem. No other formula or identifier change was accepted.

Next unresolved unit: OLP-0361, `content/lambda-calculus/syntax/substitution.tex` (6,399 source bytes; SHA-256 `8e6a232737d4b0c58a03fd1ab2bedc120e159c21e6d17cd30ed58fd4615ec8bd`). It begins the substitution and alpha-conversion sequence; review its side conditions against the free-variable definitions before translation.
