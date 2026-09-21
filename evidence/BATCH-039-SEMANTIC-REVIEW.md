# Batch 039 semantic review — lambda calculus foundations through Currying

- Review date: 2026-09-21
- Locale: te-Telu-IN
- Frozen source revision: 9620cc73f9c8e0ad003c514a5d3748f29611c4c0
- Accepted scope: OLP-0341--OLP-0347 (7 contiguous editable units)

## Outcome

The seven targets were reconciled and read in full against their frozen English
sources. They open the Lambda Calculus part and its Introduction chapter,
covering the overview, term formation and notational conventions, free and
bound variables, capture-avoiding substitution, beta reduction, the
Church--Rosser property and Currying. Titles, editorial notes, definitions,
conventions, examples, theorem, corollary, proof, displays, imports, labels,
references, protected source identities and the disclosed source correction
were checked in context. This is a same-agent semantic review, not independent
specialist certification.

OLP-0348, content/lambda-calculus/introduction/lambda-definability.tex, is the
next unresolved unit. The accepted editable translation scope is 344/722
units, with 378 units remaining.

The bounded structural audit passes 7/7 units with 81/81 aligned blocks,
exact environment counts, text-token identities, correction-aware protected
identifiers and declared-correction-aware mathematical-form parity. The 81
new segment-ledger rows comprise 30 translated linguistic segments and 51
preserved metadata or structural segments. The same correction-aware audit
passes all 344 units in OLP-0004--OLP-0347, covering 5,344 aligned blocks.
All 3,287 linguistic rows have nonempty consulted-canon evidence, while all
2,057 structural rows have none. The cumulative token check finds 4,092
markers over all 49 used keys, zero changed units, zero unmapped keys, and
mapping SHA-256
522743d248832fbb14480a93c884d0f9b33159422e904e6ee74290b876dceffd.

## Reverse-paraphrase check

- **OLP-0341 — part driver.** The part is the Lambda Calculus. Its editorial
  note retains the provenance and review status of the introduction, syntax,
  Church--Rosser and lambda-definability material. All four chapter imports
  remain in source order.
- **OLP-0342 — chapter driver.** The Introduction preserves the editorial
  warning about redundancy and future consolidation. Its thirteen imports
  remain unchanged and ordered from the overview through minimization.
- **OLP-0343 — overview.** Church's original constructive-logic motivation is
  distinguished from the later computability characterization. Lambda
  abstraction names a function from an expression, application supplies an
  argument, and contraction substitutes the applicand. The three untyped
  principles and the typed-calculus digression retain their contrast, as does
  the historical programming-language example.
- **OLP-0344 — syntax.** Variables, constants, application and abstraction
  remain the four inductive term clauses. The pure calculus has no constants.
  Left-associative application, widest-scope abstraction and multiple-variable
  abbreviation are preserved, followed by alpha-equivalence and the exact
  free/bound-variable example.
- **OLP-0345 — reduction.** Substitution still renames bound variables when
  needed to avoid capture. Redex, contractum, one-step and multi-step beta
  reduction and beta-normality remain distinct. The four examples retain,
  respectively, normalization, growth, self-reproduction and two paths to the
  common reduct \(zv\).
- **OLP-0346 — Church--Rosser.** If one term reduces to two terms, both have a
  common reduct. Hence any reachable normal form is unique. Beta-equivalence
  remains the common-reduct relation and the smallest equivalence relation
  containing reduction in either direction.
- **OLP-0347 — Currying.** A multi-argument function is represented by nested
  one-argument functions whose values are functions. The first-projection
  example still reduces to its first argument. The general nested abstraction
  successively substitutes every \(M_i\) for \(x_i\) in the declared body
  \(N\); OLTELAMINT-001 repairs the source display's orphaned reduction arrow
  and undefined final \(P\).

## Source audit and mathematical control

Audit OLTELAMINT-20260921 records one applied, QA-passing repair. In the
general Currying display, the source ends the opening expression with a
beta-reduction arrow and then begins the first reduct with another arrow,
leaving no term between them. Its last line also substitutes into an undefined
\(P\), although the body introduced immediately above is \(N\). The Telugu
target removes only the orphaned first arrow and restores \(N\), with one
adjacent disclosure covering the coupled display repair. Exact source and
target mathematical deltas are declared in SOURCE_CORRECTIONS.jsonl; pristine
upstream bytes are unchanged.

All other formation clauses, variable scopes, substitutions, reduction
directions, reducts, theorem hypotheses and conclusions were retained.
English grammar and punctuation were translated naturally without treating
stylistic edits as source corrections.

## Canon and terminology limits

TE-T078 records this batch's choices for lambda calculus, abstraction,
application, pure and untyped calculi, alpha-equivalence, substitution,
beta-contraction, redex, contractum, beta reduction, normal form,
Church--Rosser, beta-equivalence and Currying. The consulted witnesses support
native Telugu number, set, ordered-pair, relation, function, argument,
composition, term, variable, scope, bound-variable, derivation and proof
register. They do not directly attest all specialized lambda-calculus
compounds. The frozen formation clauses, substitution description, reduction
examples, confluence theorem and corrected Currying construction control those
meanings. The explicit technical borrowings and specialized labels remain
provisional pending independent native specialist review.

## Scope boundary

No TeX, BibTeX, Biber or latexmk process was launched. This is an
editable-source checkpoint only; it creates no tag, release, PDF/EPUB/HTML
integration, or Zenodo mutation. Existing reader scopes remain PDF/EPUB 276
and semantic HTML 23. The manager COMPLETE_PASS boundary remains
OLP-0004--OLP-0148.
