# Arithmetization-of-syntax source audit for the Telugu edition

Audit ID: `OLTEART-20260920`.

Scope: the six correction-bearing units OLP-0281, OLP-0283--OLP-0284 and
OLP-0286--OLP-0288 at OpenLogic revision
`9620cc73f9c8e0ad003c514a5d3748f29611c4c0`. All nine units
OLP-0280--OLP-0288 were read in full during translation.

The pristine English files under `upstream/` and the frozen source manifest
are authoritative. This is a bounded same-agent source and translation review,
not an independent certification. Full source reading found fourteen local
defects. Two are prose-level agreement or variable-name defects; twelve affect
a quantified index, code bound, displayed code, predicate name, Boolean scope,
tuple position or recursive call. The Telugu target uses the intended prose and
mathematics, discloses every repair next to its passage, and leaves all upstream
bytes unchanged.

The mathematical repairs preserve the chapter's coding invariants. Function
symbol index `j` is quantified in the term-formation clause; formula formation
uses the valid sequence bound already proved for terms; the expanded LK code
matches its own `p_0`; LK's projection and initial-sequent predicates have one
name each; proof-code variables remain consistent; the natural-deduction
sentence test scopes over every correctness case; immediate subderivations
occupy tuple positions `1` through the recorded arity; the axiomatic `QR_1`
test quantifies its preceding-line index; and `hCond` recurses on its own prior
value.

The nine source and target units were checked in full, including the chapter
driver, definitions, propositions, proofs, explanations, examples, exercises,
rule tables, proof trees, displayed equations and protected identifiers. The
bounded structural pass is required to retain equal source/target block counts,
environment parity, original text-token parity, protected-identifier parity and
only the explicitly declared mathematical deltas.

Native Telugu witnesses support the established number, sequence, function,
relation, formula, sentence, derivation, proof and formal-logic register. They do
not directly attest Gödel numbering, formation-sequence coding, proof predicates
or primitive-recursive proof verification. Those specialized senses remain
controlled by the frozen definitions, tuple layouts, equations and proofs; source
names and formal abbreviations are retained only as eponyms or notation.

No TeX, BibTeX, Biber or `latexmk` process was launched for this source-only
audit.
