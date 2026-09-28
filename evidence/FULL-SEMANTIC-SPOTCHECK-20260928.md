# Cross-part semantic spot-check — 2026-09-28

This same-agent check compares the opening substantive passage or formal rule in
eight dispersed units against the frozen English source at
`9620cc73f9c8e0ad003c514a5d3748f29611c4c0`. It is a sampled
reverse-paraphrase check, **not** a claim that every passage has been
independently reviewed or that a native Telugu expert has reviewed the edition.
The source and target paths below have the same suffix under `upstream/` and
`translation/`; their exact file/block hashes are in
`CUMULATIVE-OLP0722-STRUCTURAL-QA.json` and `SEGMENT_CANON_USE.jsonl`.

| Unit | Shared path under source/target roots | Reverse paraphrase of checked Telugu | Finding |
| --- | --- | --- | --- |
| OLP-0005 | `content/sets-functions-relations/sets/basics.tex` | A set is a collection considered as one object; its constituents are elements/members. The empty set has none. Extensional equality holds exactly when membership agrees in both directions, irrespective of description, order, or repetition. | Opening definition and extensionality statement preserve the source meaning and symbols. |
| OLP-0100 | `content/first-order-logic/tableaux/propositional-rules.tex` | These are propositional tableau rules. A signed true negation gives a signed false operand, and a signed false negation gives a signed true operand. | Telugu headings localize the topic; both protected proof-tree rules remain intact. This is a formal-rule check, not a prose sample. |
| OLP-0200 | `content/model-theory/interpolation/separation.tex` | An interpolant `C` lies semantically between `A` and `B`; contraposition turns `C ⊨ B` into `¬B ⊨ ¬C`. A sentence separates two sentence sets precisely when the first entails it and the second entails its negation. | Opening explanation and definition preserve the two entailment directions and the distinction between interpolation and separation. |
| OLP-0300 | `content/incompleteness/representability-in-q/sigma1-completeness.tex` | Although `Q` and consistent axiomatizable extensions are incomplete, `Q` proves basic numeral facts. A true `Σ₁` sentence in the standard natural-number structure is to be shown provable in `Q`; bounded existential and universal quantifiers are then defined separately. | Opening motivation, theorem direction, and bounded-quantifier formulas agree with the source. |
| OLP-0400 | `content/many-valued-logic/infinite-valued-logics/lukasiewicz.tex` | The section is a short introduction to infinite-valued Łukasiewicz logic. The matrix uses the standard propositional language, truth values `V∞`, and `1` as sole designated value. | Source correction `OLTEMVLINF-003` additionally makes the language's false constant and its value `0` explicit; this is disclosed beside the matrix, not silently represented as source-identical. |
| OLP-0500 | `content/intuitionistic-logic/semantics/relational-models.tex` | Relational models give semantics for intuitionistic propositional logic. A model is `(W,R,V)` with nonempty worlds, a reflexive/antisymmetric/transitive relation on `W`, and a valuation assigning each propositional variable a subset of `W`. | Opening explanation and model clauses preserve the source conditions; subsequent monotonicity clause is outside this sample. |
| OLP-0600 | `content/set-theory/choice/vitali.tex` | The Vitali result decomposes a circle into countably many pieces that reassemble into two copies. Its contrast with Banach–Tarski is countably infinite versus finite decomposition. | Theorem and contrast agree. The later rational-turn group issue is openly corrected as `OLTESTCHOICEVITALI-001/002`; this sample does not certify the full proof. |
| OLP-0700 | `content/proof-theory/sequent-calculus/introduction.tex` | Gentzen's sequent calculi were designed to study proof structure, not mainly as a practical proving method. They operate on pairs of formula sequences or multisets; order is immaterial in a multiset but multiplicity matters. | Opening historical and multiset explanations preserve the distinctions and examples. |

The full reader's 722-unit integration and its 10,611-block structural audit
are separate evidence. This spot-check cannot establish the quality of every
translation choice, and release acceptance still requires diagrams, EPUB/PDF,
font/extraction, link, and visual checks. Neither an occupied TeX slot nor
unfinished release packaging suspends ongoing translation correction.
