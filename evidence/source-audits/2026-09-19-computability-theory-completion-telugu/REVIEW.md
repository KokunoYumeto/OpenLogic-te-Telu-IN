# Computability-theory completion source audit for the Telugu edition

Audit ID: `OLTECOMTHYREM-20260919`.

Scope: the eight correction-bearing frozen units OLP-0241--OLP-0245,
OLP-0247--OLP-0248 and OLP-0250 at OpenLogic revision
`9620cc73f9c8e0ad003c514a5d3748f29611c4c0`. All twelve units
OLP-0240--OLP-0251 were read in full during translation.

The pristine English files under `upstream/` and the frozen source manifest
are authoritative. This is a bounded same-agent source and translation review,
not an independent certification. Full source reading found twelve local
defects. Five are prose or spelling defects; seven affect a variable, pair order,
function type, reduction direction, definedness condition or partiality scope.
The Telugu target uses the intended mathematics, discloses every repair next
to its passage, and leaves all upstream bytes unchanged.

The most consequential repairs preserve the proof invariants: `d` remains the
index whose domain is `A`; `K_0` keeps program index `e` before input `x`; a
many-one reduction remains a total map from natural-number codes to
natural-number codes; completeness of `K` is obtained from `K_0 <=_m K`; the
fourth Rice-theorem example compares two defined values; and the fixed-point
application starts with arbitrary partial computable `f`, as its theorem
requires.

The twelve source and target units were checked in full, including section
titles, definitions, theorems, proofs, explanations, exercises, digressions,
displayed equations, the lambda-calculus tag block and protected identifiers.
The bounded structural pass has equal block counts for all 160 source/target
blocks, with environment, original text-token and protected-identifier parity.
The only mathematical-form differences are the disclosed index, pair-order and
function-type repairs.

Native Telugu pages were visually rechecked for natural-number, set-operation,
function, relation, composition, theorem and proof register. Those witnesses do
not directly attest many-one reducibility, completeness, index sets, Rice's
theorem, the fixed-point theorem or self-reference. Those specialized senses
therefore remain controlled by the frozen definitions, equations and proofs;
English names and abbreviations are retained only where they are source names,
eponyms or code-level notation.

No TeX, BibTeX, Biber or `latexmk` process was launched for this source-only
audit.
