# Undecidability source audit for the Telugu edition

Audit ID: `OLTETURUND-20260919`.

Scope: all ten frozen units OLP-0264--OLP-0273 at OpenLogic revision
`9620cc73f9c8e0ad003c514a5d3748f29611c4c0`, with correction-bearing units
OLP-0265--OLP-0267, OLP-0269--OLP-0271 and OLP-0273 identified in
`FINDINGS.json`. The pristine English files under `upstream/` and the frozen
source manifest remain authoritative. This is a bounded same-agent source and
translation review, not independent certification.

Full source reading found eighteen local defects. Five are prose or
metavariable defects: a missing auxiliary, a duplicated noun, a category error
in the standard-machine exercise, a sentence fragment and a function described
as if it were a halting machine. Four more concern inconsistent symbols or
scope in the representation verification: a missing `!`, `T` substituted for
machine `M`, mismatched witnesses in the halting-configuration lemma, and an
induction statement that excludes the very halting configuration later used.
The induction step also omitted its first `n=0` case.

The central mathematical repairs concern tape-frame conditions and finite
models. A left move writes on its origin square `x+1`, but both the
representation and its verification excluded destination square `x` from the
unchanged-tape clauses. The Telugu target uses `A(x',y)` and explicitly omits
the old symbol at the written square in both movement cases. In the
Trakhtenbrot construction the finite domain now extends through
`max(k+1,len(w))`; the modified nonzero left-move clause includes the same
fresh-time condition as the other directions; and the converse proof assumes
the modified theory `T'`, not the original `T`. Formula-marker regressions,
two exercise typos and the unnecessary `B(num(0))` claim are repaired locally.

Every repair is disclosed next to its translated passage and is represented in
the correction ledger with its precise mathematical delta. No pristine
upstream byte was changed. The ten source and target units were checked in
full, including the chapter driver, titles, definitions, theorems, lemmas,
proofs, exercises, figures, captions, footnotes, displayed equations, labels,
references and protected identifiers.

The native Telugu canon pages indexed as TE-P003, TE-P005, TE-P008,
TE-P010--TE-P011, TE-P018, TE-P024, TE-P028, TE-P032 and TE-P034 were the
relevant proof, number, set, relation, function and formal-logic witnesses.
They support the edition's general mathematical register, but do not directly
attest universal-machine indices, machine encodings, the Halting Problem,
finite satisfiability or Trakhtenbrot's theorem. Those specialized senses are
controlled by the frozen definitions, simulations, reductions and model
constructions. Turing, Church, Cantor and Trakhtenbrot are source eponyms; no
unexplained English technical headword is introduced into reader-facing prose.

No TeX, BibTeX, Biber or `latexmk` process was launched for this source-only
audit.
