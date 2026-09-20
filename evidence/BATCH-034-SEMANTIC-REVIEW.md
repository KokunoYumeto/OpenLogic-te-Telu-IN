# Batch 034 semantic review — theories and computability

Review date: 2026-09-20
Locale: `te-Telu-IN`
Frozen source revision: `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`
Accepted scope: OLP-0301--OLP-0311 (11 contiguous editable units)

## Outcome

The eleven targets were reconciled and read in full against their frozen
English sources. They translate the complete Theories and Computability
chapter: theories as deductively closed sets; c.e.-completeness of Q;
undecidability for omega-consistent and then merely consistent extensions;
computable axiomatizability and decidability of complete theories; the first
incompleteness consequence; computable inseparability; theories consistent
with Q; and undecidability transferred through interpretations. Titles,
editorial matter, definitions, lemmas, theorems, proofs, explanations,
corollaries, displayed calculations, labels, references, protected source
identities and all disclosed source corrections were checked in context. This
is a same-agent semantic review, not independent specialist certification.

OLP-0312,
`content/incompleteness/incompleteness-provability/incompleteness-provability.tex`,
is the next unresolved unit. The accepted editable translation scope is
308/722 units, with 414 units remaining.

The bounded structural audit passes 11/11 units with 131/131 aligned blocks,
exact environment counts, text-token identities, protected identifiers and
declared-correction-aware mathematical-form parity. The 131 new segment-ledger
rows comprise 66 translated linguistic segments and 65 preserved metadata or
structural segments. The same correction-aware audit passes all 308 units in
OLP-0004--OLP-0311. The cumulative token check finds 3,704 markers over all 49
used keys, zero changed units, zero unmapped keys, and mapping SHA-256
`8d24f3e9c6ec83f3ec07232ef9f61c509bc78177e3e5cf7aeea88f8bf8d796cd`.

## Reverse-paraphrase check

- **OLP-0301 — chapter driver.** The Telugu chapter title says Theories and
  Computability. The editorial status and all ten section imports remain in
  source order.
- **OLP-0302 — introduction.** The four prior representability results are
  named with their original references. A theory is explained as a
  deductively closed collection of sentences, Q is fixed as the theory of its
  eight axioms, and formulas and their Goedel codes remain distinct.
- **OLP-0303 — Q is c.e.-complete.** Q is c.e. because proofs can be searched
  using its computable proof predicate. Kleene's primitive-recursive T
  predicate represents self-halting, giving the many-one reduction from K to
  Q and hence c.e.-completeness. The witness, numerals and reduction function
  retain their source roles.
- **OLP-0304 — omega-consistent extensions.** Omega-consistency forbids proving
  an existential statement while refuting each numeral instance. Any such
  extension of Q represents the relevant computation relation, so a claimed
  decision procedure would decide the self-halting set.
- **OLP-0305 — consistent extensions.** Diagonalization rules out a universal
  computable binary relation. A decidable consistent extension of Q would
  define exactly such a relation from codes of one-variable formulas, a
  contradiction. The corollary correctly applies the result to true
  arithmetic.
- **OLP-0306 — computable axiomatizability.** A computable set of axioms makes
  the resulting theory c.e.: enumerate finite axiom lists and first-order
  derivations until the target sentence appears. The proof does not claim a
  terminating negative test.
- **OLP-0307 — completeness and decidability.** In a complete, consistent,
  computably axiomatizable theory, parallel proof searches for a sentence and
  its negation must find exactly one. Equivalently, both the theory and its
  complement are c.e., with the complement reduced by negation.
- **OLP-0308 — first incompleteness consequence.** No extension of Q can be
  complete, consistent and computably axiomatizable. The three examples show
  that dropping any one condition permits the other two. The proof's repaired
  wording retains the computable-axiom requirement actually used by the prior
  lemma.
- **OLP-0309 — computable inseparability.** Q and the set of sentences whose
  negations Q proves cannot be separated by a computable set. Such a separator
  would again yield a universal computable relation. The repaired first
  coordinate is the Goedel code of the one-variable representing formula.
- **OLP-0310 — consistency with Q.** If a theory is consistent with Q, it is
  undecidable. Conjoining Q's eight axioms into E turns any supposed decision
  procedure into a computable separator of Q and its refutable sentences. The
  corollary then applies this to first-order validity in the arithmetic
  language.
- **OLP-0311 — interpretability.** Interpreting arithmetic transfers the same
  undecidability argument to theories compatible with the interpreted Q; if
  Q's interpreted axioms are proved, every consistent extension is
  undecidable. The applications to ZFC, binary-relation languages, two unary
  function symbols and the Presburger boundary are retained. The first ZFC
  corollary now explicitly says *consistent* decidable extension, as required
  by the theorem and by the inconsistent counterexample.

## Terminology and canon limits

TE-T073 records the batch's reversible choices for c.e.-complete theories,
omega-consistency, universal computable relations, consistent extensions,
computable axiomatizability, computable inseparability, provable/refutable
sentences and interpretation between theories. TE-T034, TE-T047, TE-T058,
TE-T061, TE-T066--TE-T067 and TE-T070--TE-T072 continue to control the
edition's earlier logic, axiom, arithmetic, separation, computability,
incompleteness and representability terminology.

Every linguistic segment records the passages actually consulted. TE-P005 is
an Andhra Pradesh witness for native natural-number exposition. TE-P008,
TE-P010--TE-P011 and TE-P034 are pre-bifurcation Andhra Pradesh witnesses for
sets, ordered pairs, relations and functions. TE-P003 is a present-day
Telangana-hosted school witness whose institutional edition remains
unresolved. TE-P018 and TE-P024--TE-P029 plus TE-P032--TE-P033 are Telugu
Akademi witnesses for formal logic, derivation, proof, predicates,
quantifiers, first-order language, inference and consistency register.

Those witnesses do not directly attest c.e.-complete theories,
omega-consistency, computable inseparability or proof-theoretic interpretation
between theories. The frozen definitions, reductions and proofs control those
specialized senses. Kleene, Goedel, Zermelo--Fraenkel and Presburger are source
eponyms; Q, ZFC, c.e., formula variables and coding notation remain protected
formal notation. No human Telugu logician or copy editor has reviewed the
result, and no Andhra-Pradesh/Telangana split edition is claimed.

## Source audit and residue review

The bounded source audit `OLTETCP-20260920` records three applied repairs,
OLTETCP-001--OLTETCP-003. They retain computable axiomatizability in the first
incompleteness proof, replace a malformed formula-code expression with the
one-variable formula's Goedel code, and restore the consistency qualification
to the first ZFC corollary. Every repair has an adjacent `\sourcecorrection`
disclosure and an exact correction-ledger entry. The audit artifacts have
SHA-256 `9170702b40aea25b1d81bb0215f7729cd5326a11d022f85f394997aaccb91207`
for `FINDINGS.json` and
`09707f13fb35a308300eced5c14fb307e18e9ccb26ab37462367a0c5c28b8260`
for `REVIEW.md`. No pristine upstream byte was changed.

The final residue review found no untranslated ordinary English reader prose.
Remaining Latin text is confined to source metadata, one inherited
non-reader-visible English source comment, TeX commands, protected token keys,
IDs and references, mathematical notation, formal abbreviations, eponyms and
short defective-source wording quoted inside correction disclosures. All
eleven targets are valid UTF-8 and NFC, use LF line endings, and contain no
BOMs, replacement characters, unpaired surrogates or trailing whitespace.

No TeX, BibTeX, Biber or `latexmk` process was started while preparing this
source checkpoint. This review establishes editable-source coverage only; it
does not equate the 308-unit boundary with separately versioned HTML, EPUB or
PDF reader boundaries.
