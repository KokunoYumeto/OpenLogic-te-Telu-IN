# Turing-machine computations source audit for the Telugu edition

Audit ID: `OLTETURMAC-20260919`.

Scope: all twelve frozen units OLP-0252--OLP-0263 at OpenLogic revision
`9620cc73f9c8e0ad003c514a5d3748f29611c4c0`, with correction-bearing units
OLP-0255--OLP-0258 and OLP-0260--OLP-0261 identified above. The pristine
English files under `upstream/` and the frozen source manifest are
authoritative. This is a bounded same-agent source and translation review,
not an independent certification.

Full source reading found eight local defects. One mislabels the initial state,
one uses an undefined direction variable, one omits the spatial relation in a
concatenation explanation, and one defines every run as successor-bearing while
immediately requiring a final halting configuration. Three findings concern the
same copied addition-machine error: the arrow from `q_0` on a stroke is styled
as a loop but targets `q_1`, which prevents traversal of the first unary input
block. The remaining finding makes the first and third cases of the combined
machine's transition function overlap.

The Telugu target applies only the locally required repairs, discloses every
one next to its passage, and leaves all upstream bytes unchanged. The corrected
adder diagrams retain `q_0` while scanning the first input block; the combined
transition function uses the first case only when the component transition is
defined; and finite halting runs now satisfy the run definition.

The twelve source and target units were checked in full, including both
drivers, section titles, definitions, examples, figures, captions, tables,
exercises, footnote, historical note, displayed equations and protected
identifiers. The bounded structural inventory contains 176 aligned blocks.
Environment, original text-token and protected-identifier parity are required;
the only mathematical-form differences are the eight disclosed repairs.

Native Telugu pages already indexed by this edition were rechecked for natural
number, function, relation, composition, theorem and proof register. They do
not directly attest the specialized tape, head, configuration, transition,
nondeterministic-machine or Church--Turing terminology. Those senses remain
definition-controlled by the frozen diagrams, equations and prose. `ట్యూరింగ్`
is an eponym; `సూడోకోడ్` is an explicit technical borrowing. No English
technical headword is left unexplained in reader-facing prose.

No TeX, BibTeX, Biber or `latexmk` process was launched for this source-only
audit.
