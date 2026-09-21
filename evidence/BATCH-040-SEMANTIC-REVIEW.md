# Batch 040 semantic review — lambda-definability and computability

- Review date: 2026-09-21
- Locale: te-Telu-IN
- Frozen source revision: 9620cc73f9c8e0ad003c514a5d3748f29611c4c0
- Accepted scope: OLP-0348--OLP-0355 (8 contiguous editable units)

## Outcome

The eight targets were reconciled and read in full against their frozen English
sources. They complete the Lambda Calculus Introduction chapter, defining
Church numerals and lambda-definability, proving both directions of the
computability equivalence, and establishing the needed closure results through
initial functions, composition, primitive recursion, fixed points and
minimization. Titles, definitions, theorem, lemmas, proofs, displays, labels,
protected source identities and all eight disclosed source corrections were
checked in context. This is a same-agent semantic review, not independent
specialist certification.

OLP-0356, content/lambda-calculus/syntax/syntax.tex, is the next unresolved
unit. The accepted editable translation scope is 352/722 units, with 370 units
remaining.

The bounded structural audit passes 8/8 units with 74/74 aligned blocks,
exact environment counts, text-token identities, correction-aware protected
identifiers and declared-correction-aware mathematical-form parity. The 74
new segment-ledger rows comprise 34 translated linguistic segments and 40
preserved metadata or structural segments. The same correction-aware audit
passes all 352 units in OLP-0004--OLP-0355, covering 5,418 aligned blocks.
All 3,321 linguistic rows have nonempty consulted-canon evidence, while all
2,097 structural rows have none. The cumulative token check finds 4,116
markers over all 52 used keys, zero changed units, zero unmapped keys, and
mapping SHA-256
8aea9c01cd529c9c730b772cf979caba4c867a0ef22848054fc23f0a7046a0c1.

The canonical decision suite passes with 375 decisions: 79 terminology or
sense decisions and 296 source-correction decisions, represented by 707
implementation occurrences. It records 57 urgent-or-high-priority decisions,
544 distinct checked source/target files and 1,770 public evidence-file
references. Reader/PDF page locators remain pending for all occurrences.

## Reverse-paraphrase check

- **OLP-0348 — lambda-definable arithmetical functions.** A Church numeral
  represents a natural number by iterating an input function. A term defines a
  partial (k)-ary function when its application to the corresponding Church
  numerals reduces to the result numeral on defined inputs and has no normal
  form otherwise. OLTELAMCOMP-001 restores the matching arity and domain;
  OLTELAMCOMP-002 restores application in the undefined branch. The stated
  theorem remains the equivalence between partial computability and
  lambda-definability.
- **OLP-0349 — lambda-definable implies computable.** Breadth-wise enumeration
  of finite reduction sequences eventually finds the output numeral whenever
  one exists. The informal appeal to Church's thesis is retained and then
  replaced by the indicated primitive-recursive coding of subterms,
  substitution, one-step reductions, reduction sequences and numerals.
- **OLP-0350 — computable implies lambda-definable.** Kleene normal form reduces
  the converse direction to lambda definitions for the initial functions and
  closure under composition, primitive recursion and unbounded search. The
  conventional multi-argument notation is explicitly only an abbreviation;
  untyped lambda terms still carry no intrinsic arity.
- **OLP-0351 — initial functions.** Zero is the constant-zero Church numeral,
  the displayed successor term performs one additional iteration, and each
  projection returns its selected argument. The associated lambda
  abstractions and argument order are unchanged.
- **OLP-0352 — composition.** If (H,G_0,\ldots,G_{k-1}) define the component
  functions, direct application of (H) to the (G_i)-results defines their
  composition. Every input and component index remains in its source order.
- **OLP-0353 — primitive recursion.** Extra parameters are absorbed into
  lambda abstractions, while a selector term (D) represents ordered pairs.
  Iterating the transition (T) produces pairs
  (\langle\bar n,F(\bar n)\rangle), and projecting the second component gives
  the required recursion. OLTELAMCOMP-003 restores (F) as the sought result
  term, OLTELAMCOMP-004 restores the recursion index (x) as the first
  argument of (h), OLTELAMCOMP-005 removes the spurious index argument from
  the absorbed prior value, and OLTELAMCOMP-006 uses the previously defined
  successor term in (T).
- **OLP-0354 — fixed-point combinators.** Self-application of the diagonal term
  yields a term beta-equivalent to its image under (g). Curry's version gives
  a common reduct for (Yg) and (g(Yg)); Turing's stronger version makes the
  former reduce directly to the latter.
- **OLP-0355 — minimization.** For fixed (x), a fixed point defines a search
  beginning at (n), returning (n) when (F(x,n)) is zero and otherwise
  continuing at the successor. OLTELAMCOMP-007 invokes the lemma's actual
  lambda-definability hypothesis rather than an unavailable primitive-
  recursiveness premise. OLTELAMCOMP-008 consistently replaces the undefined
  (S) by the established successor term in all four occurrences. Applying
  the resulting search at zero defines the minimization function and diverges
  exactly when no witness exists.

## Source audit and mathematical control

Audit OLTELAMCOMP-20260921 records eight applied, QA-passing repairs. Two are
in OLP-0348: the (k)-argument function was incorrectly called (n)-ary with
domain (\mathbb N) rather than (\mathbb N^k), and the undefined branch put
a comma between (F) and its first argument. Four are in OLP-0353: the result
term was misnamed (H), the recursion equation passed (z) rather than (x)
to the step function, the absorbed prior-value function received a spurious
(u) argument, and the pair transition used an undefined (S) instead of
the established successor term. Two are in OLP-0355: the proof asserted an
unsupported primitive-recursiveness premise, and the search construction used
the same undefined (S) four times. Each Telugu target makes only its recorded
minimal repair and supplies an adjacent disclosure. Exact source and target
mathematical deltas are declared in SOURCE_CORRECTIONS.jsonl; pristine upstream
bytes are unchanged.

All other numeral encodings, reductions, normal-form conditions, search
procedures, closure hypotheses, abstractions, applications, pair projections,
fixed-point equations and conclusions were retained. English grammar and
punctuation were translated naturally without treating stylistic edits as
source corrections.

## Canon and terminology limits

TE-T079 records this batch's choices for lambda-definable arithmetical
functions, Church numerals and iterators, closure under composition and
primitive recursion, fixed-point combinators and minimization. The consulted
witnesses support native Telugu natural-number, set, ordered-pair, relation,
function, argument, composition, primitive-recursion, minimization, term,
variable, derivation and proof register. They do not directly attest Church
numerals, lambda-definability, iterators, fixed-point combinators or the lambda
encodings used here. The corrected definitions and explicit reductions control
those meanings. The specialized labels remain provisional pending optional
independent native specialist review.

## Scope boundary

No TeX, BibTeX, Biber or latexmk process was launched. This is an
editable-source checkpoint only; it creates no tag, release, PDF/EPUB/HTML
integration, or Zenodo mutation. Existing reader scopes remain PDF/EPUB 276
and semantic HTML 23. The manager COMPLETE_PASS boundary remains
OLP-0004--OLP-0148.
