# Batch 028 semantic review — completion of computability theory

Review date: 2026-09-19
Locale: `te-Telu-IN`
Frozen source revision: `9620cc73f9c8e0ad003c514a5d3748f29611c4c0`
Accepted scope: OLP-0240--OLP-0251 (12 contiguous reader units)

## Outcome

The twelve targets were reconciled and then read in full against their frozen
English sources. They complete the Computability Theory chapter: the first
non-computable computably enumerable sets, closure under union and
intersection, failure of closure under complement, many-one and Turing
reducibility, complete computably enumerable sets, the `K_1` and totality
examples, Rice's theorem, the fixed-point theorem and self-referential
definitions. Titles, definitions, theorems, proofs, exercises, digressions,
explanations, code examples, equations, labels, references, protected source
identities and all locally disclosed source corrections were checked in
context. This is a same-agent semantic review, not independent specialist
certification. OLP-0252, `content/turing-machines/turing-machines.tex`, is the
next unresolved unit. The accepted editable translation scope is 248/722
units, with 474 units remaining.

The bounded structural audit passes 12/12 units with 160/160 aligned blocks,
exact environment counts, protected identifiers, OpenLogic token identities
and counts, and declared-correction-aware mathematical-form parity. The 160
new segment-ledger rows comprise 100 translated linguistic segments and 60
preserved metadata or structural segments. The same correction-aware audit
also passes the full OLP-0004--OLP-0251 range. The cumulative 248-unit token
check finds 3,155 markers over 44 keys, zero changed units, zero unused or
unmapped keys, and mapping SHA-256
`dad0c449130317916caf6e79de26c957c4a100eb9720e8e657ec6232e1acc8fe`.

## Reverse-paraphrase check

- **OLP-0240 — non-computable sets.** `K_0`, the pairs whose indexed
  computation halts, is the domain of a partial computable search and hence
  computably enumerable, but the halting result makes it non-computable. The
  self-halting set `K` is likewise computably enumerable and undecidable; its
  proof diagonalizes against a supposed characteristic function.
- **OLP-0241 — closure under union and intersection.** If `A` and `B` are
  computably enumerable, so are their union and intersection. The target
  retains three proof styles: domains defined by minimization, alternating or
  paired enumerations, and parallel simulation of the two indexed partial
  computations.
- **OLP-0242 — complements.** A set is computable exactly when it and its
  complement are both computably enumerable. Parallel search decides which
  domain contains the input. The target consistently uses `d` for `A` and
  `e` for its complement, so the resulting corollary correctly rules out
  computable enumerability of the complement of `K_0`.
- **OLP-0243 — reducibility.** A many-one reduction is a total computable
  transformation preserving membership in both directions. The target keeps
  the ordering intuition, many-one equivalence and the stronger injective
  one-one notion, while distinguishing these from complexity-theoretic
  polynomial-time reductions.
- **OLP-0244 — properties of reducibility.** Many-one reducibility is
  transitive, and computable enumerability or computability transfers
  downward along a reduction. Complementation preserves a reduction. The
  digression distinguishes the more liberal oracle-style Turing notion and
  its Karp and Cook complexity analogues.
- **OLP-0245 — complete computably enumerable sets.** A complete c.e. set is
  itself c.e. and receives a many-one reduction from every c.e. set. `K_0`,
  `K_1` and `K` are complete; for the last claim the required direction is
  `K_0 \leq_m K`. The original exercise `K \leq_m K_0` is independently
  valid and remains present; a separately labelled added exercise asks for
  the reverse direction that completes the repaired proof. The closing
  historical note preserves the existence of intermediate c.e. sets
  established independently by Friedberg and Muchnik.
- **OLP-0246 — the `K_1` example.** `K_1` contains indices halting on input
  zero and is c.e. but non-computable. The oracle explanation and formal
  s-m-n construction both transform a question about an arbitrary pair in
  `K_0` into a question about a program on input zero, proving
  `K_0 \leq_m K_1`.
- **OLP-0247 — undecidability of totality.** `Tot`, the indices of total
  computable functions, is non-computable. A partial binary function ignores
  its second input and returns zero exactly when its first input is in `K`;
  s-m-n turns this into a primitive-recursive reduction from `K` to `Tot`.
- **OLP-0248 — Rice's theorem.** Every computable index set of partial
  computable functions is trivial. The target keeps the distinction between
  decidable syntactic facts about programs and undecidable nontrivial facts
  about their behavior, then preserves the reduction from `K` using the
  nowhere-defined function, a chosen member of `C`, and s-m-n. The examples
  include range membership, constancy, totality and strict increase on the
  defined domain.
- **OLP-0249 — fixed points.** The two standard formulations are proved
  equivalent: self-application of an arbitrary partial computable `g`, and a
  program extensionally equal to the program selected by a total computable
  `f`. The diagonal-index construction proves the theorem. The program-string
  examples explain self-printing, and the tagged lambda-calculus digression
  preserves the Curry and Turing fixed-point combinators.
- **OLP-0250 — applying fixed points.** Fixed points define computations in
  terms of their own indices and explain self-printing programs. The main
  theorem rules out a partial computable procedure that, whenever `W_e` is
  computable, returns an index for its characteristic function. The proof
  correctly begins with arbitrary partial computable `f` and diagonalizes on
  its answer at zero.
- **OLP-0251 — self-referential definitions.** The fixed-point lemma turns a
  computable conditional specification referring recursively to `f` into a
  partial computable function. Euclid's greatest-common-divisor recursion is
  the concrete example; induction then establishes totality. The conclusion
  distinguishes ordinary recursion from the stronger ability to refer to an
  index of the computing algorithm.

## Terminology and canon limits

TE-T067 records the batch's non-computable, halting and self-halting sets;
closure and complement; many-one, one-one and Turing reducibility; c.e.
completeness; oracle, totality and index-set terminology; Rice's theorem;
fixed points; and self-reference. TE-T020, TE-T024, TE-T026, TE-T028,
TE-T060 and TE-T064--TE-T066 continue to control the edition's earlier
function, set, proof, partiality, enumeration, index and halting choices.

Every linguistic segment records the passages actually consulted. TE-P005
supports native natural-number exposition. TE-P008 and TE-P034 support set
operations and ordered-pair language; TE-P010--TE-P011 support relations,
functions and composition; TE-P028 supports property and quantifier register;
and TE-P003, TE-P018 and TE-P032 support theorem, proof and formal-logic prose.
Those pages were visually rechecked from the preserved originals before this
batch was accepted.

The witnesses do not directly attest many-one or Turing reducibility,
completeness, oracle computation, index sets, Rice's theorem, fixed points or
computability-theoretic self-reference. The frozen definitions,
biconditionals, closure constructions, s-m-n applications and diagonal or
fixed-point proofs control those exact senses. `c.e.`, `NP`, Java and C++ are
source abbreviations or programming-language names; Turing, Karp, Cook, Rice
and Curry are eponyms. No human Telugu logician or copy editor has reviewed
the result, and no Andhra-Pradesh/Telangana split edition is claimed.

## Source audit and residue review

The bounded audit `OLTECOMTHYREM-20260919` records twelve applied repairs,
OLTECOMTHY-007--OLTECOMTHY-018. They repair two local prose errors in the
closure proof; restore the `d`/`e` index assignments in the complement proof
and explanation; remove a duplicated word and correct a typo in the
reducibility introduction; restore the ordered pair `\tuple{e,x}`; repair a
transitivity sentence; type a reduction as `\Nat\to\Nat`; replace the
insufficient final proof direction by `K_0 \leq_m K` while retaining the valid
source exercise in the other direction; repair a procedural typo;
make the strict-increase condition require both values to be defined; and
extend the final fixed-point application from total computable `f` to the
partial computable scope stated by its theorem. Every repair has an adjacent
`\sourcecorrection` disclosure and an exact correction-ledger entry. The
audit artifacts have SHA-256
`ffc829f410379f0b4625b985eda851a1caa06fda2968fc124c41815a5d85cb1c`
for `FINDINGS.json` and
`46ed2db8023f54b9d02120f05078a4f0c156b3bbd6e13ec3ba9044fa01fb7585`
for `REVIEW.md`. No pristine upstream byte was changed.

The final residue review found no untranslated ordinary English prose.
Remaining Latin text is confined to source metadata, TeX commands and
environment names, protected IDs and source-token keys, mathematical
notation, programming-language names, literal program syntax and verbatim
examples, and short English source snippets quoted inside correction
disclosures. The twelve targets are valid UTF-8 and NFC, use LF line endings,
and contain no BOMs, replacement characters, unpaired surrogates or trailing
whitespace.

No TeX, BibTeX, Biber or `latexmk` process was started while preparing this
source checkpoint. No reader or release expansion is claimed by this review,
and the manager's existing OLP-0004--OLP-0148 `COMPLETE_PASS` boundary remains
untouched.
