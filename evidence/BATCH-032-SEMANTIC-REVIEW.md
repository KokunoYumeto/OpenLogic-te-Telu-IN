# Batch 032 semantic review — arithmetization of syntax

Review date: 2026-09-20
Locale: `te-Telu-IN`
Frozen source revision: `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`
Accepted scope: OLP-0280--OLP-0288 (9 contiguous editable units)

## Outcome

The nine targets were reconciled and then read in full against their frozen
English sources. They translate the complete Arithmetization of Syntax chapter:
the purpose of assigning natural-number codes to syntax; codes for language
symbols and finite sequences; primitive-recursive recognition of terms,
formulas and sentences; recursive substitution; and the arithmetization of
derivations and proof predicates for sequent calculus, natural deduction and
axiomatic deduction. Titles, definitions, propositions, proofs, explanations,
examples, exercises, rule tables, proof trees, displayed formulas, tuple
positions, labels, references, protected source identities and all locally
disclosed source corrections were checked in context. This is a same-agent
semantic review, not independent specialist certification. OLP-0289,
`content/incompleteness/representability-in-q/representability-in-q.tex`, is the next unresolved
unit. The accepted editable translation scope is 285/722 units, with 437 units
remaining.

The bounded structural audit passes 9/9 units with 152/152 aligned blocks,
exact environment counts, protected identifiers, OpenLogic token identities
and counts, and declared-correction-aware mathematical-form parity. The 152
new segment-ledger rows comprise 102 translated linguistic segments and 50
preserved metadata or structural segments. The same correction-aware audit
also passes the full OLP-0004--OLP-0288 range. The cumulative 285-unit token
check finds 3,615 markers over all 48 mapped keys, zero changed units and zero
unmapped keys, with mapping SHA-256
`afadccc8968d9d32435befa91fe138a38f70863fdb9ac4d06ec0ee25d110242b`.

## Reverse-paraphrase check

- **OLP-0280 — chapter driver.** The translated chapter title is
  Arithmetization of Syntax, and its eight section imports remain in source
  order. The source's unavailable-tableaux note is retained.
- **OLP-0281 — introduction.** Expressions, derivations and other finite
  syntactic objects receive natural-number codes. Choosing primitive-recursive
  codes makes syntactic tests and operations arithmetically expressible. The
  substitution example maps the codes of a formula, variable and term to the
  code of the substituted formula, and the section explains why this lets
  arithmetic speak about syntax and proof.
- **OLP-0282 — coding symbols.** Each logical and nonlogical symbol is assigned
  a code, with enough recoverable structure to recognize symbol classes and
  indices. Finite symbol strings are then coded by the chapter's prime-power
  sequence coding, and the worked example preserves the displayed component
  order and numerical construction.
- **OLP-0283 — coding terms.** Term codes are recognized through bounded
  formation sequences. Variables, constants and function applications occupy
  the stated clauses, including the restored quantification of the function
  symbol index. The proof bounds the search and establishes that `Term` and
  the numeral-code function are primitive recursive.
- **OLP-0284 — coding formulas.** Atomic formulas and general formulas are
  recognized primitive recursively from their constructors and bounded
  formation sequences. The corrected proof uses the valid sequence-code bound
  inherited from the term argument. Sentencehood and the relevant variable-
  occurrence tests remain primitive recursive.
- **OLP-0285 — substitution.** Structural recursion computes the code obtained
  by substituting a term for a variable in a formula. The companion test for a
  term being free for substitution is primitive recursive, with the exercise
  and displayed recursion left in their original roles.
- **OLP-0286 — sequent-calculus derivations.** An LK derivation is coded as a
  tuple of immediate subderivations, end-sequent and last-rule data. Primitive-
  recursive projections and rule checks determine local correctness; subtree
  coding determines derivationhood; and `Prf` recognizes a derivation with the
  required sentence on the right of its end-sequent. The repaired predicate
  names, tuple codes, variable names and parentheses preserve one coherent
  verifier.
- **OLP-0287 — natural-deduction derivations.** A derivation code records its
  immediate subderivations, end-formula, discharge label and final inference.
  The rule-by-rule correctness predicate scopes the sentence test over every
  case. Primitive-recursive tests then identify derivations, undischarged
  assumptions, immediate subderivations and proofs; the corrected tuple index
  searches positions one through the recorded arity.
- **OLP-0288 — axiomatic derivations.** An axiomatic derivation is a coded
  sequence of formulas. Primitive-recursive tests recognize axiom and rule
  instances, including the repaired bounded predecessor index for the
  quantifier rule. The recursive conditional helper, derivation predicate and
  final proof predicate retain consistent arguments and names.

## Terminology and canon limits

TE-T071 records the batch's choices for arithmetization of syntax; symbol,
sequence, term and formula coding; codes and Gödel numbering; formation
sequences; primitive-recursive syntactic relations; substitution; proof codes;
end-sequents and end-formulas; discharge labels and immediate subderivations;
proof predicates; and sequent-calculus, natural-deduction and axiomatic
derivations. TE-T011, TE-T020, TE-T024, TE-T028, TE-T033, TE-T034 and TE-T070
continue to control the edition's earlier sequence, function, relation,
formula, derivation, proof and arithmetization terminology.

Every linguistic segment records the passages actually consulted. TE-P005
supports native natural-number exposition; TE-P008 and TE-P010--TE-P011 and
TE-P034 support sequences, ordered tuples, relations and functions; TE-P018
and TE-P024--TE-P033 support formula, sentence, derivation, proof-system and
proof register.

The witnesses do not directly attest Gödel numbering, arithmetized syntax,
formation-sequence bounds, recursive proof verification or proof predicates.
The frozen symbol and sequence codes, tuple layouts, substitution recursion and
LK, natural-deduction and axiomatic proof checks control those specialized
senses. Gödel is a source eponym; LK, QR, rule symbols, formula metavariables
and predicate names remain protected formal notation. `సీక్వెంట్` is an
explicitly contextualized technical borrowing. No human Telugu logician or
copy editor has reviewed the result, and no Andhra-Pradesh/Telangana split
edition is claimed.

## Source audit and residue review

The bounded audit `OLTEART-20260920` records fourteen applied repairs,
OLTEART-001--OLTEART-014. They correct subject-number agreement; quantify two
previously unbound indices; replace an invalid formation-sequence bound; remove
two unmatched code parentheses; make end-sequent and initial-sequent predicate
names consistent; repair three local proof-code variable mismatches; scope the
natural-deduction sentence test over the full correctness disjunction; address
the one-based tuple positions of immediate subderivations; repair a recursive
helper call; and close one predicate call. Every repair has an adjacent
`\sourcecorrection` disclosure and an exact correction-ledger entry. The audit
artifacts have SHA-256
`bd69b16477bcf7a28512cf33bf6e0c62d9d990db6ae96681000126c7811c32ef`
for `FINDINGS.json` and
`469dbf2c3815319f087fbe20a6f1650e45ee4421adce9547f47eedec44e930ce`
for `REVIEW.md`. No pristine upstream byte was changed.

The final residue review found no untranslated ordinary English prose.
Remaining Latin text is confined to source metadata, TeX commands, protected
IDs and references, mathematical notation, predicate and rule names, and short
defective source snippets quoted inside correction disclosures. The nine
targets are valid UTF-8 and NFC, use LF line endings, and contain no BOMs,
replacement characters, unpaired surrogates or trailing whitespace.

No TeX, BibTeX, Biber or `latexmk` process was started while preparing this
source checkpoint. This review establishes editable-source coverage only; it
does not silently equate that 285-unit boundary with the separately versioned
HTML/EPUB or PDF reader boundaries.
