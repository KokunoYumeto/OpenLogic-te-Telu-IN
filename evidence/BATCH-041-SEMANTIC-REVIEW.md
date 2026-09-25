# Batch 041 semantic review — lambda-calculus syntax foundations

- Review date: 2026-09-25
- Locale: te-Telu-IN
- Frozen source revision: `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`
- Accepted scope: OLP-0356--OLP-0360 (5 contiguous editable units)

## Outcome

The five targets were read in full against their frozen English files and complete the opening sequence of the Lambda Calculus Syntax chapter through Free Variables. The chapter driver retains its ten imports in their original order. All titles, clauses, examples, exercises, formulas, labels, references and source-token identities were checked. The three minor wording repairs and the scope-body repair are recorded in audit OLTELAMSYN-20260925 and disclosed beside the Telugu text. This is a same-agent semantic review, not independent specialist certification.

OLP-0361, `content/lambda-calculus/syntax/substitution.tex`, is next. It introduces substitution conditions and proof obligations that depend on the free-variable equations translated here. Editable translation coverage is now 357/722 units, leaving 365 units.

The bounded structural audit passes 5/5 units with 68/68 aligned blocks. The 68 new segment rows comprise 37 linguistic and 31 structural segments. The cumulative correction-aware audit passes 357/357 units and 5,486/5,486 blocks through OLP-0360. After the separate classification repair, the cumulative ledger has 3,468 linguistic and 2,018 structural segments. Every linguistic row has a nonempty canon passage list, and every structural row has an empty list. The reader-visible text and source-key token realization check covers 4,118 markers and 53 mapped keys with zero changed units and no unmapped key.

The canonical decision register validates with 380 decisions (80 terminology/sense, 300 source corrections), 720 occurrences, 57 urgent-or-high review items, 554 distinct checked source/target files and 1,800 public evidence-file references. Reader page locators remain pending. The native pages used for this batch support general terms, variables, scope, binding, proof, induction, sets and functions; specialist lambda syntax and combinator senses are controlled by the frozen definitions and TE-T078/TE-T080.

## Reverse-paraphrase check

- **OLP-0356 — chapter driver.** The Syntax chapter calls, in order, Terms, Unique Readability, Abbreviated Syntax, Free Variables, Substitution, Alpha, De Bruijn, Term Revisited, Beta and Eta. The Telugu title is the only language-bearing content in this driver.
- **OLP-0357 — terms.** Variables, a lambda symbol and parentheses generate terms inductively by a variable clause, an abstraction clause and an application clause. The abstraction variable is called the parameter; fully parenthesized forms expose the last formation step, and the exercise asks the reader to reconstruct a specific term. The two source spelling errors affect only explanatory prose.
- **OLP-0358 — unique readability.** A term begins with a variable or parenthesis; an application has a constrained prefix; no proper prefix of a term is a term. Induction on formation then shows that the variable, abstraction and application cases cannot overlap and that their immediate constituents are unique. The closing proposition restates the unique decomposition in a readable three-case form.
- **OLP-0359 — abbreviated syntax.** Application associates to the left when parentheses are omitted, lambda abstraction takes the widest possible scope, and one lambda may abbreviate nested abstraction over several variables. The displayed expanded term and exercise remain exact. “From example” is handled as the intended “For example.”
- **OLP-0360 — free variables.** An inner binder shields occurrences of its variable from an outer binder. The scope of an abstraction is its body, and an occurrence is free precisely when no corresponding binder has it in scope. The three equations define the free-variable set for a variable, an abstraction and an application; the example tracks nested binders, while the environment explanation motivates closed terms and combinators. The lemma and exercises retain their exact free-variable conditions. The source’s mistaken ambient-term scope reference is repaired explicitly.

## Segment-classification reconciliation

A cumulative audit found 110 older rows tagged structural although they contain Telugu reader text or headings realized through OpenLogic text tokens. The exact source and target segment hashes were retained; only classification, canon linkage and explanation fields changed. For 109 rows, the repair reused the passage set recorded for linguistic blocks in the same unit. OLP-0149 was a title-only unit; its title was checked against the frozen source and TE-P027/TE-P029 native pages. The record is `SEGMENT-CLASSIFICATION-REPAIR-20260925.json`. This repair changes no translation text, source bytes, formulas or reader artifacts.

## Boundary

This checkpoint advances editable source only. The cumulative PDF and EPUB remain at 276/722 units and the deployed semantic HTML reader at 23/722. The manager's separate canon COMPLETE_PASS remains OLP-0004--OLP-0148. No TeX-family process, tag, release or Zenodo mutation occurred.
