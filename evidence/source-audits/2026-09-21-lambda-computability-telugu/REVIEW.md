# Lambda computability source audit for the Telugu edition

Audit ID: OLTELAMCOMP-20260921.

Scope: all eight tracked units OLP-0348--OLP-0355 at OpenLogic revision
9620cc73f9c8e0ad003c514a5d3748f29611c4c0, with correction-bearing units
OLP-0348, OLP-0353 and OLP-0355 identified above.

The pristine English files under upstream/ and the frozen source manifest
remain authoritative. This is a bounded same-agent source and translation
review, not independent certification. Every definition, theorem, lemma,
proof, display, label and protected identifier in the eight units was read in
context. The review found eight confirmed source issues. In OLP-0348 the
definition gives a k-argument function the wrong arity and domain, then puts a
comma where the undefined branch needs the same application term as the
defined branch. In OLP-0353 the setup reuses H where the constructed term must
be F, passes z rather than the recursion index x to h, gives the lifted prior
value v a spurious u argument, and invokes an undefined successor term S
instead of the already defined Succ. In OLP-0355 the proof asserts the
stronger, unavailable premise that f is primitive recursive, and its
fixed-point construction again uses the undefined S instead of Succ. The
Telugu targets apply only the eight recorded repairs and disclose each one
adjacent to the affected claim. Upstream bytes remain unchanged.

The remaining construction was checked against its local definitions. Church
numerals act as iterators; the lambda-definability condition distinguishes a
numeral normal form from the absence of any normal form; the reduction-tree
search establishes the computable direction; the converse reduces to initial
functions and closure under composition, primitive recursion and unbounded
search. Zero, successor and projections have the stated lambda terms.
Composition substitutes the defining terms directly. The repaired
primitive-recursion construction absorbs extra parameters into lambda
abstractions, represents ordered pairs by D, iterates the repaired transition
T and projects its second component. The two fixed-point combinators retain
their stated reduction properties. Finally, the repaired minimization term
uses the fixed point to advance through Church numerals until F returns zero.
Ordinary English grammar, punctuation and editorial wording were translated
naturally and were not promoted to source findings.

The established Telugu canon and prior edition terminology support natural
numbers, functions, arguments, composition, primitive recursion, unbounded
search, computation, terms, variables, reduction and proof prose. They do not
directly attest Church numerals, lambda-definability, fixed-point combinators
or the particular lambda encodings used here. The explicit definitions,
reductions and corrected constructions in OLP-0348--OLP-0355 control those
senses; the resulting specialized terminology remains provisional pending
optional independent native specialist review.

The bounded structural pass must retain equal source/target block counts,
environment and text-token parity, correction-aware protected-identifier
parity, and only the declared OLTELAMCOMP-001--OLTELAMCOMP-008 mathematical
expression deltas. This batch completes the Lambda Calculus Introduction
chapter. OLP-0356, the Lambda Calculus Syntax chapter driver, is next.

No TeX, BibTeX, Biber or latexmk process was launched for this source-only
audit.
