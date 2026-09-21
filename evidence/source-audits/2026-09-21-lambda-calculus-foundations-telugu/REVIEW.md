# Lambda calculus foundations source audit for the Telugu edition

Audit ID: OLTELAMINT-20260921.

Scope: all seven tracked units OLP-0341--OLP-0347 at OpenLogic revision
9620cc73f9c8e0ad003c514a5d3748f29611c4c0, with the sole
correction-bearing unit OLP-0347 identified above.

The pristine English files under upstream/ and the frozen source manifest
remain authoritative. This is a bounded same-agent source and translation
review, not independent certification. Every part and chapter import, editorial
note, definition, convention, example, theorem, corollary, proof, display,
label, reference and protected identifier in the seven units was read in
context. The review found one confirmed source finding comprising two coupled
errors in the general Currying reduction display: an orphaned beta-reduction
arrow directly precedes the next line's reduction arrow, and the final nested
substitution uses an undefined P instead of the body N introduced immediately
above. The Telugu target removes only the orphaned arrow, restores N, and
discloses both changes together as OLTELAMINT-001. Upstream bytes remain
unchanged.

The remaining formulas and examples were checked against their local
definitions. The abstraction/application examples preserve their functions;
the free and bound variables in the syntax example are unchanged; all four
beta-reduction examples retain their reducts; the Church--Rosser theorem and
uniqueness corollary keep the same quantification and reduction directions;
and the two-argument Currying example still reduces to its first argument.
Ordinary English grammar, punctuation and editorial wording were translated
naturally and were not promoted to source findings.

The established Telugu canon and prior edition terminology support variables,
terms, substitution, functions, arguments, computation, primitive recursion,
normal forms, proofs and equivalence relations. They do not directly attest
the specialized compounds for lambda abstraction, beta contraction, redex,
contractum, alpha equivalence, Church--Rosser or Currying. The frozen formation
clauses, substitution rule, reduction examples, confluence theorem and
multi-argument construction control those senses; the resulting terminology
remains provisional pending optional independent native specialist review.

The bounded structural pass must retain equal source/target block counts,
environment and text-token parity, protected-identifier parity, and only the
declared OLTELAMINT-001 mathematical-expression delta. This batch stops after
Currying at a conceptual boundary inside the Introduction chapter. OLP-0348,
the section on lambda-definable arithmetical functions, is next.

No TeX, BibTeX, Biber or latexmk process was launched for this source-only
audit.
