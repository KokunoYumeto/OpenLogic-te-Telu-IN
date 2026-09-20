# Batch 037 semantic review — second-order metatheory

- Review date: 2026-09-21
- Locale: te-Telu-IN
- Frozen source revision: 9620cc73f9c8e0ad003c514a5d3748f29611c4c0
- Accepted scope: OLP-0330--OLP-0335 (6 contiguous editable units)

## Outcome

The six targets were reconciled and read in full against their frozen English
sources. They translate the complete Metatheory of Second-order Logic chapter:
the contrast with first-order axiomatizability, computable enumerability,
compactness and Loewenheim--Skolem; second-order Peano arithmetic and its
categoricity; undecidability and failure of a sound complete derivation
system; failure of compactness; and failure of the downward and upward
Loewenheim--Skolem theorems. Titles, definitions, axioms, theorems, corollary,
proposition, proofs, problems, displays, labels, references, protected source
identities and all disclosed source corrections were checked in context. This
is a same-agent semantic review, not independent specialist certification.

OLP-0336, content/second-order-logic/sol-and-set-theory/sol-and-set-theory.tex,
is the next unresolved unit. The accepted editable translation scope is
332/722 units, with 390 units remaining.

The bounded structural audit passes 6/6 units with 70/70 aligned blocks,
exact environment counts, text-token identities, correction-aware protected
identifiers and declared-correction-aware mathematical-form parity. The 70 new
segment-ledger rows comprise 35 translated linguistic segments and 35
preserved metadata or structural segments. The same correction-aware audit
passes all 332 units in OLP-0004--OLP-0335, covering 5,197 aligned blocks.
All 3,220 linguistic rows have nonempty consulted-canon evidence, while all
1,977 structural rows have none. The cumulative token check finds 4,048
markers over all 49 used keys, zero changed units, zero unmapped keys, and
mapping SHA-256
9ac6a25fa527b4661d819f720666304defa479c507c5ed5981856db1844e7a4a.

## Reverse-paraphrase check

- **OLP-0330 — chapter driver.** The title names the metatheory of
  second-order logic. The introduction, second-order arithmetic,
  undecidability and axiomatizability, compactness, and Loewenheim--Skolem
  imports remain in source order.
- **OLP-0331 — introduction.** Sound and complete first-order proof systems
  make first-order validity computably enumerable. Second-order validities
  are not computably enumerable, so no sound complete proof system exists.
  The text separately previews failure of compactness and the
  Loewenheim--Skolem theorem through second-order control of domain size.
- **OLP-0332 — second-order arithmetic.** PA² retains Q's eight arithmetic
  axioms and replaces the first-order induction schema by one second-order
  induction axiom. The proof that every PA² model is standard and the
  isomorphism corollary are retained. The weaker PA²-dagger theory uses the
  first two successor axioms plus induction; the displayed definitions of
  order and addition and the problem completing multiplication remain.
  OLTESOLMET-001 binds the universally quantified variable w into the
  addition recursion equation.
- **OLP-0333 — non-axiomatizability.** First-order validity yields immediate
  second-order undecidability. Categoricity of PA² then reduces true
  arithmetic to pure second-order validity; a sound complete system would
  enumerate the true first-order sentences of the standard natural numbers,
  contradicting Tarski's theorem. OLTESOLMET-002 closes the malformed
  satisfaction expression around the full conditional.
- **OLP-0334 — non-compactness.** Finite satisfiability and the entailment
  form of compactness are stated before the counterexample consisting of
  not-Inf and every finite lower bound on domain size. Each finite subset has
  a finite model, while the whole set has none. OLTESOLMET-003 gives the
  theorem a unique non-compactness label; OLTESOLMET-004 correctly bounds the
  cardinality sentences occurring in the finite subset Gamma_0.
- **OLP-0335 — Loewenheim--Skolem failure.** Not-Count has infinite,
  nonenumerable models but no enumerable models, so downward
  Loewenheim--Skolem fails. Count together with Inf has a denumerable model
  but no nonenumerable model, so the upward direction fails as well.

## Source audit and mathematical control

Audit OLTESOLMET-20260921 records four applied, QA-passing repairs. The
addition display now uses its quantified variable in both occurrences of the
recursion clause. The satisfaction formula now closes its second macro
argument. The non-compactness theorem no longer duplicates the preceding
undecidability theorem's protected label. The finite-satisfiability argument
now places the upper-index bound on Gamma_0 rather than falsely claiming that
the full Gamma omits larger bounds. Exact source and target mathematical and
protected-identifier deltas are declared in SOURCE_CORRECTIONS.jsonl;
pristine upstream bytes are unchanged.

All other axioms, arities, quantifiers, implication directions, model-size
conditions, formulas and proof dependencies were retained. English grammar
and punctuation were translated naturally without treating stylistic edits as
source corrections.

## Canon and terminology limits

TE-T076 records this chapter's choices for second-order metatheory,
second-order Peano arithmetic, the second-order induction axiom, categoricity,
non-axiomatizability, finite satisfiability, compactness failure and the two
Loewenheim--Skolem directions. The consulted witnesses distinguish Andhra
Pradesh arithmetic prose, the separate school-mathematics
set/relation/function source, and the pre-bifurcation logic source retained
through its Telangana-hosted copy. They directly support the Telugu number,
set, relation, function, truth-value, formula, sentence, first-order,
individual-domain, derivation, inference, induction and proof register. They
do not directly attest the specialized new second-order metatheoretic
compounds; the frozen axioms, reductions, countermodels and proofs control
those meanings. Those labels remain provisional pending independent native
specialist review.

## Scope boundary

No TeX, BibTeX, Biber or latexmk process was launched. This is an
editable-source checkpoint only; it creates no tag, release, PDF/EPUB/HTML
integration, or Zenodo mutation. Existing reader scopes remain PDF/EPUB 276
and semantic HTML 23. The manager COMPLETE_PASS boundary remains
OLP-0004--OLP-0148.
